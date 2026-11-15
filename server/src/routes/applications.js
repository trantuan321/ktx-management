import { Router } from 'express';
import { db, transaction } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, forbidden, notFound } from '../errors.js';
import { applicationDTO } from '../serializers.js';

const router = Router();
router.use(authenticate);

const APPLICATION_SELECT = `
  SELECT a.*, s.mssv, s.full_name AS student_name, s.class_name,
         pr.code AS preferred_room_code, pb.name AS preferred_building_name,
         ab.code AS assigned_bed_code, ar.code AS assigned_room_code,
         abld.name AS assigned_building_name,
         u.full_name AS reviewer_name
  FROM applications a
  JOIN students s ON s.id = a.student_id
  LEFT JOIN rooms pr ON pr.id = a.preferred_room_id
  LEFT JOIN buildings pb ON pb.id = pr.building_id
  LEFT JOIN beds ab ON ab.id = a.assigned_bed_id
  LEFT JOIN rooms ar ON ar.id = ab.room_id
  LEFT JOIN buildings abld ON abld.id = ar.building_id
  LEFT JOIN users u ON u.id = a.reviewed_by
`;

function getApplication(id) {
  const row = db.prepare(`${APPLICATION_SELECT} WHERE a.id = ?`).get(id);
  if (!row) throw notFound('Không tìm thấy đơn đăng ký.');
  return applicationDTO(row);
}

router.post('/', authorize('student'), (req, res) => {
  const studentId = req.userRow.student_id;
  if (!studentId) {
    throw badRequest('Tài khoản chưa được liên kết với hồ sơ sinh viên.');
  }
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) throw badRequest('Không tìm thấy hồ sơ sinh viên của tài khoản này.');
  if (student.status !== 'active') {
    throw conflict('Hồ sơ sinh viên đang không hoạt động, không thể đăng ký ở.');
  }
  if (student.bed_id) {
    throw conflict('Bạn đã được xếp chỗ, không thể gửi thêm đơn đăng ký.');
  }
  const pending = db
    .prepare("SELECT id FROM applications WHERE student_id = ? AND status = 'pending'")
    .get(studentId);
  if (pending) throw conflict('Bạn đã có một đơn đang chờ xử lý.');

  const { preferredRoomId, note } = req.body || {};
  let roomId = null;
  if (preferredRoomId) {
    roomId = Number(preferredRoomId);
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    if (!room) throw badRequest('Phòng mong muốn không tồn tại.');
    if (room.status !== 'available') throw conflict('Phòng mong muốn hiện không nhận đăng ký.');
    const available = db
      .prepare("SELECT COUNT(*) AS c FROM beds WHERE room_id = ? AND status = 'available'")
      .get(roomId).c;
    if (available === 0) throw conflict('Phòng mong muốn đã hết giường trống.');
  }

  const info = db
    .prepare('INSERT INTO applications (student_id, preferred_room_id, note) VALUES (?, ?, ?)')
    .run(studentId, roomId, note || null);

  res.status(201).json({ application: getApplication(Number(info.lastInsertRowid)) });
});

router.get('/', (req, res) => {
  const where = [];
  const params = [];

  if (req.user.role === 'student') {
    if (!req.userRow.student_id) return res.json({ applications: [] });
    where.push('a.student_id = ?');
    params.push(req.userRow.student_id);
  }
  if (req.query.status) {
    where.push('a.status = ?');
    params.push(String(req.query.status));
  }
  if (req.query.q) {
    const like = `%${String(req.query.q).trim()}%`;
    where.push('(s.mssv LIKE ? OR s.full_name LIKE ? OR s.class_name LIKE ?)');
    params.push(like, like, like);
  }

  const sql = `${APPLICATION_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY a.created_at DESC, a.id DESC`;
  res.json({ applications: db.prepare(sql).all(...params).map(applicationDTO) });
});

router.get('/:id', (req, res) => {
  const application = getApplication(Number(req.params.id));
  if (req.user.role === 'student' && application.studentId !== req.userRow.student_id) {
    throw forbidden('Bạn chỉ có thể xem đơn đăng ký của mình.');
  }
  res.json({ application });
});

router.post('/:id/approve', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const { bedId, reviewNote } = req.body || {};
  if (!bedId) throw badRequest('Vui lòng chọn giường để xếp chỗ.');

  const result = transaction(() => {
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!app) throw notFound('Không tìm thấy đơn đăng ký.');
    if (app.status !== 'pending') throw conflict('Chỉ có thể duyệt đơn đang chờ xử lý.');

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(app.student_id);
    if (!student) throw notFound('Không tìm thấy sinh viên của đơn đăng ký.');
    if (student.bed_id) throw conflict('Sinh viên đã được xếp chỗ trước đó.');

    const bed = db
      .prepare(
        `SELECT bd.*, r.capacity, r.status AS room_status,
                (SELECT COUNT(*) FROM beds x WHERE x.room_id = bd.room_id AND x.status = 'occupied') AS occupied
         FROM beds bd
         JOIN rooms r ON r.id = bd.room_id
         WHERE bd.id = ?`,
      )
      .get(Number(bedId));
    if (!bed) throw notFound('Không tìm thấy giường được chọn.');
    if (bed.status !== 'available') {
      throw conflict('Giường đã được sử dụng hoặc đang bảo trì.');
    }
    if (bed.room_status !== 'available') {
      throw conflict('Phòng đang bảo trì/đóng, không thể xếp chỗ.');
    }
    if (bed.occupied >= bed.capacity) {
      throw conflict('Phòng đã đầy, không thể xếp thêm sinh viên.');
    }

    db.prepare("UPDATE beds SET status = 'occupied' WHERE id = ?").run(bed.id);
    db.prepare("UPDATE students SET bed_id = ?, updated_at = datetime('now') WHERE id = ?").run(
      bed.id,
      student.id,
    );
    db.prepare(
      `UPDATE applications
       SET status = 'approved', assigned_bed_id = ?, reviewed_by = ?,
           reviewed_at = datetime('now'), review_note = ?
       WHERE id = ?`,
    ).run(bed.id, req.userRow.id, reviewNote || null, id);

    return id;
  });

  res.json({ application: getApplication(result) });
});

router.post('/:id/reject', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const { reviewNote } = req.body || {};
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  if (!app) throw notFound('Không tìm thấy đơn đăng ký.');
  if (app.status !== 'pending') throw conflict('Chỉ có thể từ chối đơn đang chờ xử lý.');

  db.prepare(
    `UPDATE applications
     SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now'), review_note = ?
     WHERE id = ?`,
  ).run(req.userRow.id, reviewNote || null, id);

  res.json({ application: getApplication(id) });
});

router.post('/:id/cancel', authorize('student'), (req, res) => {
  const id = Number(req.params.id);
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  if (!app) throw notFound('Không tìm thấy đơn đăng ký.');
  if (app.student_id !== req.userRow.student_id) {
    throw forbidden('Bạn chỉ có thể hủy đơn đăng ký của mình.');
  }
  if (app.status !== 'pending') throw conflict('Chỉ có thể hủy đơn đang chờ xử lý.');

  db.prepare("UPDATE applications SET status = 'cancelled' WHERE id = ?").run(id);
  res.json({ application: getApplication(id) });
});

export default router;
