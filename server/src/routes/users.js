import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, forbidden, notFound } from '../errors.js';
import { hashPassword } from '../auth.js';
import { userDTO } from '../serializers.js';

const router = Router();
router.use(authenticate, authorize('admin'));

const ROLES = ['student', 'manager', 'admin'];

const USER_SELECT = `
  SELECT u.*, s.mssv AS student_mssv, s.full_name AS student_name
  FROM users u
  LEFT JOIN students s ON s.id = u.student_id
`;

function userWithStudent(row) {
  return {
    ...userDTO(row),
    studentMssv: row.student_mssv ?? null,
    studentName: row.student_name ?? null,
  };
}

function getUser(id) {
  const row = db.prepare(`${USER_SELECT} WHERE u.id = ?`).get(id);
  if (!row) throw notFound('Không tìm thấy tài khoản.');
  return userWithStudent(row);
}

function validateStudentLink(role, studentId, currentUserId = null) {
  if (role !== 'student') return null;
  if (!studentId) throw badRequest('Tài khoản sinh viên phải liên kết với hồ sơ sinh viên.');
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(studentId));
  if (!student) throw badRequest('Hồ sơ sinh viên không tồn tại.');
  const linked = db
    .prepare('SELECT id FROM users WHERE student_id = ? AND id <> ?')
    .get(Number(studentId), currentUserId ?? -1);
  if (linked) throw conflict('Hồ sơ sinh viên này đã được liên kết với tài khoản khác.');
  return Number(studentId);
}

router.get('/', (req, res) => {
  const where = [];
  const params = [];
  if (req.query.role) {
    where.push('u.role = ?');
    params.push(String(req.query.role));
  }
  if (req.query.q) {
    const like = `%${String(req.query.q).trim()}%`;
    where.push('(u.username LIKE ? OR u.full_name LIKE ? OR s.mssv LIKE ?)');
    params.push(like, like, like);
  }
  const sql = `${USER_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY u.role, u.username`;
  res.json({ users: db.prepare(sql).all(...params).map(userWithStudent) });
});

router.post('/', (req, res) => {
  const body = req.body || {};
  const username = body.username ? String(body.username).trim() : '';
  const password = body.password ? String(body.password) : '';
  const fullName = body.fullName ? String(body.fullName).trim() : '';
  const role = body.role || 'student';
  if (!username) throw badRequest('Tên đăng nhập là bắt buộc.');
  if (!fullName) throw badRequest('Họ tên là bắt buộc.');
  if (password.length < 6) throw badRequest('Mật khẩu phải có ít nhất 6 ký tự.');
  if (!ROLES.includes(role)) throw badRequest('Vai trò không hợp lệ.');

  const duplicated = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (duplicated) throw conflict('Tên đăng nhập đã tồn tại.');

  const studentId = validateStudentLink(role, body.studentId);
  const info = db
    .prepare(
      `INSERT INTO users (username, password_hash, role, full_name, email, phone, student_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      username,
      hashPassword(password),
      role,
      fullName,
      body.email || null,
      body.phone || null,
      studentId,
      body.isActive === false ? 0 : 1,
    );

  res.status(201).json({ user: getUser(Number(info.lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy tài khoản.');

  const body = req.body || {};
  const pick = (key, fallback) => (body[key] !== undefined ? body[key] : fallback);
  const fullName = String(pick('fullName', current.full_name)).trim();
  if (!fullName) throw badRequest('Họ tên là bắt buộc.');
  const role = pick('role', current.role);
  if (!ROLES.includes(role)) throw badRequest('Vai trò không hợp lệ.');
  const isActive = pick('isActive', Boolean(current.is_active));

  if (id === req.userRow.id && (!isActive || role !== 'admin')) {
    throw forbidden('Bạn không thể tự khóa hoặc tự hạ quyền tài khoản của mình.');
  }

  const studentId = validateStudentLink(role, pick('studentId', current.student_id), id);

  db.prepare(
    `UPDATE users
     SET full_name = ?, role = ?, email = ?, phone = ?, student_id = ?, is_active = ?
     WHERE id = ?`,
  ).run(
    fullName,
    role,
    pick('email', current.email) || null,
    pick('phone', current.phone) || null,
    studentId,
    isActive ? 1 : 0,
    id,
  );

  res.json({ user: getUser(id) });
});

router.post('/:id/reset-password', (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy tài khoản.');
  const { password } = req.body || {};
  if (!password || String(password).length < 6) {
    throw badRequest('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
    hashPassword(String(password)),
    id,
  );
  res.json({ updated: true });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy tài khoản.');
  if (id === req.userRow.id) throw forbidden('Bạn không thể xóa tài khoản của chính mình.');

  if (current.role === 'admin') {
    const admins = db
      .prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND is_active = 1")
      .get().c;
    if (admins <= 1) throw conflict('Không thể xóa quản trị viên cuối cùng của hệ thống.');
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ deleted: true });
});

export default router;
