import { Router } from 'express';
import { db, transaction } from '../db.js';
import { authenticate, authorize } from '../middleware.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { roomDTO, bedDTO } from '../serializers.js';

const router = Router();
router.use(authenticate);

const ROOM_STATUSES = ['available', 'maintenance', 'closed'];

const ROOM_SELECT = `
  SELECT r.*, b.code AS building_code, b.name AS building_name,
         (SELECT COUNT(*) FROM beds bd WHERE bd.room_id = r.id) AS bed_count,
         (SELECT COUNT(*) FROM beds bd WHERE bd.room_id = r.id AND bd.status = 'occupied') AS occupied_beds,
         (SELECT COUNT(*) FROM beds bd WHERE bd.room_id = r.id AND bd.status = 'available') AS available_beds
  FROM rooms r
  JOIN buildings b ON b.id = r.building_id
`;

function getRoom(id) {
  const row = db.prepare(`${ROOM_SELECT} WHERE r.id = ?`).get(id);
  if (!row) throw notFound('Không tìm thấy phòng.');
  return roomDTO(row);
}

function validateRoomInput(body, { partial = false, current = null } = {}) {
  const pick = (key, fallback) => (body[key] !== undefined ? body[key] : fallback);

  const buildingId = pick('buildingId', current?.building_id);
  if (buildingId === undefined || buildingId === null || buildingId === '') {
    throw badRequest('Tòa nhà là bắt buộc.');
  }
  const building = db.prepare('SELECT id FROM buildings WHERE id = ?').get(Number(buildingId));
  if (!building) throw badRequest('Tòa nhà không tồn tại.');

  const code = pick('code', current?.code);
  if (!code || !String(code).trim()) throw badRequest('Mã phòng là bắt buộc.');

  const capacity = Number(pick('capacity', current?.capacity ?? 4));
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw badRequest('Sức chứa phải là số nguyên >= 1.');
  }

  const floor = Number(pick('floor', current?.floor ?? 1));
  if (!Number.isInteger(floor) || floor < 1) {
    throw badRequest('Tầng phải là số nguyên >= 1.');
  }

  const price = Number(pick('pricePerMonth', current?.price_per_month ?? 0));
  if (!Number.isFinite(price) || price < 0) {
    throw badRequest('Giá phòng không hợp lệ.');
  }

  const status = pick('status', current?.status ?? 'available');
  if (!ROOM_STATUSES.includes(status)) throw badRequest('Trạng thái phòng không hợp lệ.');

  return {
    buildingId: Number(buildingId),
    code: String(code).trim(),
    name: pick('name', current?.name) || null,
    floor,
    capacity,
    roomType: pick('roomType', current?.room_type ?? 'standard') || 'standard',
    pricePerMonth: price,
    status,
    description: pick('description', current?.description) || null,
    bedCount:
      body.bedCount !== undefined
        ? Number(body.bedCount)
        : current
          ? undefined
          : capacity,
  };
}

router.get('/', (req, res) => {
  const where = [];
  const params = [];

  if (req.query.buildingId) {
    where.push('r.building_id = ?');
    params.push(Number(req.query.buildingId));
  }
  if (req.query.status) {
    where.push('r.status = ?');
    params.push(String(req.query.status));
  }
  if (req.query.q) {
    const like = `%${String(req.query.q).trim()}%`;
    where.push('(r.code LIKE ? OR r.name LIKE ? OR b.name LIKE ? OR b.code LIKE ?)');
    params.push(like, like, like, like);
  }
  if (String(req.query.available) === 'true') {
    where.push("r.status = 'available'");
    where.push(
      "(SELECT COUNT(*) FROM beds bd WHERE bd.room_id = r.id AND bd.status = 'available') > 0",
    );
  }

  const sql = `${ROOM_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY b.code, r.floor, r.code`;
  const rows = db.prepare(sql).all(...params);
  res.json({ rooms: rows.map(roomDTO) });
});

router.get('/:id', (req, res) => {
  const room = getRoom(Number(req.params.id));
  const beds = db
    .prepare(
      `SELECT bd.*, r.code AS room_code, b.name AS building_name
       FROM beds bd
       JOIN rooms r ON r.id = bd.room_id
       JOIN buildings b ON b.id = r.building_id
       WHERE bd.room_id = ?
       ORDER BY bd.code`,
    )
    .all(room.id);
  res.json({ room, beds: beds.map(bedDTO) });
});

router.post('/', authorize('manager', 'admin'), (req, res) => {
  const data = validateRoomInput(req.body || {});
  if (data.bedCount !== undefined && (!Number.isInteger(data.bedCount) || data.bedCount < 0)) {
    throw badRequest('Số giường phải là số nguyên >= 0.');
  }
  if (data.bedCount !== undefined && data.bedCount > data.capacity) {
    throw badRequest('Số giường không được vượt quá sức chứa.');
  }

  const duplicated = db
    .prepare('SELECT id FROM rooms WHERE building_id = ? AND code = ?')
    .get(data.buildingId, data.code);
  if (duplicated) throw conflict('Mã phòng đã tồn tại trong tòa nhà.');

  const roomId = transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO rooms
           (building_id, code, name, floor, capacity, room_type, price_per_month, status, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.buildingId,
        data.code,
        data.name,
        data.floor,
        data.capacity,
        data.roomType,
        data.pricePerMonth,
        data.status,
        data.description,
      );
    const id = Number(info.lastInsertRowid);
    const bedCount = data.bedCount ?? data.capacity;
    const insertBed = db.prepare('INSERT INTO beds (room_id, code) VALUES (?, ?)');
    for (let i = 1; i <= bedCount; i += 1) {
      insertBed.run(id, `G${i}`);
    }
    return id;
  });

  res.status(201).json({ room: getRoom(roomId) });
});

router.put('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const current = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  if (!current) throw notFound('Không tìm thấy phòng.');

  const data = validateRoomInput(req.body || {}, { partial: true, current });

  const bedCount = db.prepare('SELECT COUNT(*) AS c FROM beds WHERE room_id = ?').get(id).c;
  if (data.capacity < bedCount) {
    throw badRequest(
      `Sức chứa không được nhỏ hơn số giường hiện có (${bedCount}). Hãy xóa bớt giường trước.`,
    );
  }

  const occupied = db
    .prepare("SELECT COUNT(*) AS c FROM beds WHERE room_id = ? AND status = 'occupied'")
    .get(id).c;
  if (data.status !== 'available' && occupied > 0) {
    throw conflict('Không thể chuyển phòng đang có sinh viên sang bảo trì/đóng.');
  }

  const duplicated = db
    .prepare('SELECT id FROM rooms WHERE building_id = ? AND code = ? AND id <> ?')
    .get(data.buildingId, data.code, id);
  if (duplicated) throw conflict('Mã phòng đã tồn tại trong tòa nhà.');

  db.prepare(
    `UPDATE rooms
     SET building_id = ?, code = ?, name = ?, floor = ?, capacity = ?, room_type = ?,
         price_per_month = ?, status = ?, description = ?
     WHERE id = ?`,
  ).run(
    data.buildingId,
    data.code,
    data.name,
    data.floor,
    data.capacity,
    data.roomType,
    data.pricePerMonth,
    data.status,
    data.description,
    id,
  );

  res.json({ room: getRoom(id) });
});

router.delete('/:id', authorize('manager', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  if (!room) throw notFound('Không tìm thấy phòng.');

  const occupied = db
    .prepare("SELECT COUNT(*) AS c FROM beds WHERE room_id = ? AND status = 'occupied'")
    .get(id).c;
  if (occupied > 0) {
    throw conflict('Không thể xóa phòng đang có sinh viên ở.');
  }

  db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
  res.json({ deleted: true });
});

export default router;
