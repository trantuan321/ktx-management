import { Router } from 'express';
import { db } from '../db.js';
import { verifyPassword, signToken } from '../auth.js';
import { JWT_SECRET, TOKEN_TTL_SECONDS } from '../config.js';
import { authenticate } from '../middleware.js';
import { badRequest, unauthorized } from '../errors.js';
import { userDTO, studentDTO } from '../serializers.js';

const router = Router();

function findStudent(studentId) {
  if (!studentId) return null;
  const row = db
    .prepare(
      `SELECT s.*, bd.code AS bed_code, r.id AS room_id, r.code AS room_code,
              b.code AS building_code, b.name AS building_name
       FROM students s
       LEFT JOIN beds bd ON bd.id = s.bed_id
       LEFT JOIN rooms r ON r.id = bd.room_id
       LEFT JOIN buildings b ON b.id = r.building_id
       WHERE s.id = ?`,
    )
    .get(studentId);
  return studentDTO(row);
}

function meResponse(userRow) {
  const user = userDTO(userRow);
  return {
    user,
    student: user.role === 'student' ? findStudent(userRow.student_id) : null,
  };
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    throw badRequest('Vui lòng nhập tên đăng nhập và mật khẩu.');
  }
  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(String(username).trim());
  if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
    throw unauthorized('Tên đăng nhập hoặc mật khẩu không đúng.');
  }
  const token = signToken({ sub: user.id, role: user.role }, JWT_SECRET, TOKEN_TTL_SECONDS);
  res.json({ token, ...meResponse(user) });
});

router.get('/me', authenticate, (req, res) => {
  res.json(meResponse(req.userRow));
});

export default router;
