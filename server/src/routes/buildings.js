import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { buildingDTO } from '../serializers.js';

const router = Router();
router.use(authenticate);

const GENDERS = ['male', 'female', 'mixed'];

function getBuilding(id) {
  const row = db
    .prepare(
      `SELECT b.*,
              (SELECT COUNT(*) FROM rooms r WHERE r.building_id = b.id) AS rooms_count
       FROM buildings b WHERE b.id = ?`,
    )
    .get(id);
  if (!row) throw notFound('Không tìm thấy tòa nhà.');
  return buildingDTO(row);
}

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.*,
              (SELECT COUNT(*) FROM rooms r WHERE r.building_id = b.id) AS rooms_count
       FROM buildings b
       ORDER BY b.code`,
    )
    .all();
  res.json({ buildings: rows.map(buildingDTO) });
});

router.get('/:id', (req, res) => {
  res.json({ building: getBuilding(Number(req.params.id)) });
});

router.post('/', authorize('manager', 'admin'), (req, res) => {
  const { code, name, address, gender, floors, description } = req.body || {};
  if (!code || !String(code).trim()) throw badRequest('Mã tòa nhà là bắt buộc.');
  if (!name || !String(name).trim()) throw badRequest('Tên tòa nhà là bắt buộc.');
  const g = gender || 'mixed';
  if (!GENDERS.includes(g)) throw badRequest('Giới tính tòa nhà không hợp lệ.');
  const f = Number(floors ?? 1);
  if (!Number.isInteger(f) || f < 1) throw badRequest('Số tầng phải là số nguyên >= 1.');

  const duplicated = db
    .prepare('SELECT id FROM buildings WHERE code = ?')
    .get(String(code).trim());
  if (duplicated) throw conflict('Mã tòa nhà đã tồn tại.');

  const info = db
    .prepare(
      `INSERT INTO buildings (code, name, address, gender, floors, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(String(code).trim(), String(name).trim(), address || null, g, f, description || null);

  res.status(201).json({ building: getBuilding(Number(info.lastInsertRowid)) });
});

router.put('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy tòa nhà.');

  const { code, name, address, gender, floors, description } = req.body || {};
  const nextCode = code !== undefined ? String(code).trim() : current.code;
  if (!nextCode) throw badRequest('Mã tòa nhà là bắt buộc.');
  const nextName = name !== undefined ? String(name).trim() : current.name;
  if (!nextName) throw badRequest('Tên tòa nhà là bắt buộc.');
  const nextGender = gender ?? current.gender;
  if (!GENDERS.includes(nextGender)) throw badRequest('Giới tính tòa nhà không hợp lệ.');
  const nextFloors = floors !== undefined ? Number(floors) : current.floors;
  if (!Number.isInteger(nextFloors) || nextFloors < 1) {
    throw badRequest('Số tầng phải là số nguyên >= 1.');
  }

  const duplicated = db
    .prepare('SELECT id FROM buildings WHERE code = ? AND id <> ?')
    .get(nextCode, id);
  if (duplicated) throw conflict('Mã tòa nhà đã tồn tại.');

  db.prepare(
    `UPDATE buildings
     SET code = ?, name = ?, address = ?, gender = ?, floors = ?, description = ?
     WHERE id = ?`,
  ).run(
    nextCode,
    nextName,
    address !== undefined ? address || null : current.address,
    nextGender,
    nextFloors,
    description !== undefined ? description || null : current.description,
    id,
  );

  res.json({ building: getBuilding(id) });
});

router.delete('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const building = db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
  if (!building) throw notFound('Không tìm thấy tòa nhà.');

  const occupied = db
    .prepare(
      `SELECT COUNT(*) AS c FROM beds bd
       JOIN rooms r ON r.id = bd.room_id
       WHERE r.building_id = ? AND bd.status = 'occupied'`,
    )
    .get(id).c;
  if (occupied > 0) {
    throw conflict('Không thể xóa tòa nhà đang có sinh viên ở. Hãy chuyển/trả phòng trước.');
  }

  db.prepare('DELETE FROM buildings WHERE id = ?').run(id);
  res.json({ deleted: true });
});

export default router;
