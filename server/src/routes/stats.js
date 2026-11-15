import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, authorize } from '../middleware.js';

const router = Router();
router.use(authenticate, authorize('manager', 'admin'));

function count(sql, ...params) {
  return db.prepare(sql).get(...params).c;
}

router.get('/', (_req, res) => {
  const buildings = count('SELECT COUNT(*) AS c FROM buildings');
  const rooms = count('SELECT COUNT(*) AS c FROM rooms');
  const beds = count('SELECT COUNT(*) AS c FROM beds');
  const availableBeds = count("SELECT COUNT(*) AS c FROM beds WHERE status = 'available'");
  const occupiedBeds = count("SELECT COUNT(*) AS c FROM beds WHERE status = 'occupied'");
  const maintenanceBeds = count("SELECT COUNT(*) AS c FROM beds WHERE status = 'maintenance'");
  const students = count("SELECT COUNT(*) AS c FROM students WHERE status = 'active'");
  const residents = count('SELECT COUNT(*) AS c FROM students WHERE bed_id IS NOT NULL');
  const pendingApplications = count(
    "SELECT COUNT(*) AS c FROM applications WHERE status = 'pending'",
  );
  const approvedApplications = count(
    "SELECT COUNT(*) AS c FROM applications WHERE status = 'approved'",
  );

  const recentApplications = db
    .prepare(
      `SELECT a.id, a.status, a.created_at, s.mssv, s.full_name AS student_name,
              r.code AS preferred_room_code
       FROM applications a
       JOIN students s ON s.id = a.student_id
       LEFT JOIN rooms r ON r.id = a.preferred_room_id
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT 5`,
    )
    .all();

  res.json({
    stats: {
      buildings,
      rooms,
      beds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      students,
      residents,
      pendingApplications,
      approvedApplications,
      occupancyRate: beds > 0 ? Math.round((occupiedBeds / beds) * 1000) / 10 : 0,
    },
    recentApplications: recentApplications.map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      mssv: row.mssv,
      studentName: row.student_name,
      preferredRoomCode: row.preferred_room_code,
    })),
  });
});

export default router;
