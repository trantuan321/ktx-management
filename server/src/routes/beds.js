import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { bedDTO } from '../serializers.js';

const router = Router();
router.use(authenticate);

const BED_SELECT = `
  SELECT bd.*, r.code AS room_code, b.name AS building_name
  FROM beds bd
  JOIN rooms r ON r.id = bd.room_id
  JOIN buildings b ON b.id = r.building_id
`;

function getBed(id) {
  const row = db.prepare(`${BED_SELECT} WHERE bd.id = ?`).get(id);
  if (!row) throw notFound('Không tìm thấy giường.');
  return bedDTO(row);
}

router.get('/', (req, res) => {
  const where = [];
  const params = [];
  if (req.query.roomId) {
    where.push('bd.room_id = ?');
    params.push(Number(req.query.roomId));
  }
  if (req.query.status) {
    where.push('bd.status = ?');
    params.push(String(req.query.status));
  }
  const sql = `${BED_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY b.code, r.code, bd.code`;
  res.json({ beds: db.prepare(sql).all(...params).map(bedDTO) });
});

router.post('/', authorize('manager', 'admin'), (req, res) => {
  const { roomId, code } = req.body || {};
  if (!roomId) throw badRequest('Phòng là bắt buộc.');
  if (!code || !String(code).trim()) throw badRequest('Mã giường là bắt buộc.');

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(Number(roomId));
  if (!room) throw badRequest('Phòng không tồn tại.');

  const count = db.prepare('SELECT COUNT(*) AS c FROM beds WHERE room_id = ?').get(room.id).c;
  if (count >= room.capacity) {
    throw conflict('Phòng đã đủ số giường theo sức chứa.');
  }

  const duplicated = db
    .prepare('SELECT id FROM beds WHERE room_id = ? AND code = ?')
    .get(room.id, String(code).trim());
  if (duplicated) throw conflict('Mã giường đã tồn tại trong phòng.');

  const info = db
    .prepare('INSERT INTO beds (room_id, code) VALUES (?, ?)')
    .run(room.id, String(code).trim());
  res.status(201).json({ bed: getBed(Number(info.lastInsertRowid)) });
});

router.put('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy giường.');

  const { code, status } = req.body || {};
  const nextCode = code !== undefined ? String(code).trim() : current.code;
  if (!nextCode) throw badRequest('Mã giường là bắt buộc.');
  const nextStatus = status ?? current.status;
  if (!['available', 'occupied', 'maintenance'].includes(nextStatus)) {
    throw badRequest('Trạng thái giường không hợp lệ.');
  }

  if (nextStatus === 'occupied' && current.status !== 'occupied') {
    throw badRequest('Trạng thái "đang ở" chỉ được cập nhật khi duyệt đơn đăng ký.');
  }
  if (current.status === 'occupied' && nextStatus !== 'occupied') {
    throw conflict('Giường đang có sinh viên ở, không thể đổi trạng thái.');
  }

  const duplicated = db
    .prepare('SELECT id FROM beds WHERE room_id = ? AND code = ? AND id <> ?')
    .get(current.room_id, nextCode, id);
  if (duplicated) throw conflict('Mã giường đã tồn tại trong phòng.');

  db.prepare('UPDATE beds SET code = ?, status = ? WHERE id = ?').run(nextCode, nextStatus, id);
  res.json({ bed: getBed(id) });
});

router.delete('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);
  if (!bed) throw notFound('Không tìm thấy giường.');
  if (bed.status === 'occupied') {
    throw conflict('Không thể xóa giường đang có sinh viên ở.');
  }
  db.prepare('DELETE FROM beds WHERE id = ?').run(id);
  res.json({ deleted: true });
});

export default router;
