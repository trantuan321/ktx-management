import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { studentDTO } from '../serializers.js';

const router = Router();
router.use(authenticate);

const STUDENT_SELECT = `
  SELECT s.*, bd.code AS bed_code, r.id AS room_id, r.code AS room_code,
         b.code AS building_code, b.name AS building_name
  FROM students s
  LEFT JOIN beds bd ON bd.id = s.bed_id
  LEFT JOIN rooms r ON r.id = bd.room_id
  LEFT JOIN buildings b ON b.id = r.building_id
`;

function getStudent(id) {
  const row = db.prepare(`${STUDENT_SELECT} WHERE s.id = ?`).get(id);
  if (!row) throw notFound('Không tìm thấy sinh viên.');
  return studentDTO(row);
}

const GENDERS = ['male', 'female', 'other'];
const STATUSES = ['active', 'inactive'];

router.get('/', (req, res) => {
  const where = [];
  const params = [];
  if (req.query.q) {
    const like = `%${String(req.query.q).trim()}%`;
    where.push('(s.mssv LIKE ? OR s.full_name LIKE ? OR s.class_name LIKE ?)');
    params.push(like, like, like);
  }
  if (req.query.className) {
    where.push('s.class_name = ?');
    params.push(String(req.query.className));
  }
  if (req.query.status) {
    where.push('s.status = ?');
    params.push(String(req.query.status));
  }
  if (String(req.query.resident) === 'true') where.push('s.bed_id IS NOT NULL');
  if (String(req.query.resident) === 'false') where.push('s.bed_id IS NULL');

  const sql = `${STUDENT_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY s.mssv`;
  res.json({ students: db.prepare(sql).all(...params).map(studentDTO) });
});

router.get('/:id', (req, res) => {
  res.json({ student: getStudent(Number(req.params.id)) });
});

router.post('/', authorize('manager', 'admin'), (req, res) => {
  const body = req.body || {};
  const mssv = body.mssv ? String(body.mssv).trim().toUpperCase() : '';
  const fullName = body.fullName ? String(body.fullName).trim() : '';
  if (!mssv) throw badRequest('MSSV là bắt buộc.');
  if (!fullName) throw badRequest('Họ tên là bắt buộc.');
  const gender = body.gender || null;
  if (gender && !GENDERS.includes(gender)) throw badRequest('Giới tính không hợp lệ.');
  const status = body.status || 'active';
  if (!STATUSES.includes(status)) throw badRequest('Trạng thái sinh viên không hợp lệ.');

  const duplicated = db.prepare('SELECT id FROM students WHERE mssv = ?').get(mssv);
  if (duplicated) throw conflict('MSSV đã tồn tại.');

  const info = db
    .prepare(
      `INSERT INTO students
         (mssv, full_name, gender, date_of_birth, class_name, faculty, phone, email, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      mssv,
      fullName,
      gender,
      body.dateOfBirth || null,
      body.className || null,
      body.faculty || null,
      body.phone || null,
      body.email || null,
      body.address || null,
      status,
    );

  res.status(201).json({ student: getStudent(Number(info.lastInsertRowid)) });
});

router.put('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy sinh viên.');

  const body = req.body || {};
  const pick = (key, fallback) => (body[key] !== undefined ? body[key] : fallback);

  const mssv = String(pick('mssv', current.mssv)).trim().toUpperCase();
  if (!mssv) throw badRequest('MSSV là bắt buộc.');
  const fullName = String(pick('fullName', current.full_name)).trim();
  if (!fullName) throw badRequest('Họ tên là bắt buộc.');
  const gender = pick('gender', current.gender);
  if (gender && !GENDERS.includes(gender)) throw badRequest('Giới tính không hợp lệ.');
  const status = pick('status', current.status);
  if (!STATUSES.includes(status)) throw badRequest('Trạng thái sinh viên không hợp lệ.');

  const duplicated = db
    .prepare('SELECT id FROM students WHERE mssv = ? AND id <> ?')
    .get(mssv, id);
  if (duplicated) throw conflict('MSSV đã tồn tại.');

  db.prepare(
    `UPDATE students
     SET mssv = ?, full_name = ?, gender = ?, date_of_birth = ?, class_name = ?,
         faculty = ?, phone = ?, email = ?, address = ?, status = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    mssv,
    fullName,
    gender || null,
    pick('dateOfBirth', current.date_of_birth) || null,
    pick('className', current.class_name) || null,
    pick('faculty', current.faculty) || null,
    pick('phone', current.phone) || null,
    pick('email', current.email) || null,
    pick('address', current.address) || null,
    status,
    id,
  );

  res.json({ student: getStudent(id) });
});

router.delete('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!student) throw notFound('Không tìm thấy sinh viên.');
  if (student.bed_id) {
    throw conflict('Sinh viên đang nội trú, không thể xóa hồ sơ. Hãy xử lý trả phòng trước.');
  }
  db.prepare('DELETE FROM students WHERE id = ?').run(id);
  res.json({ deleted: true });
});

export default router;
