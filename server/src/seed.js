import { pathToFileURL } from 'node:url';
import { db, initSchema, transaction } from './db.js';
import { hashPassword } from './auth.js';

const TABLES = [
  'invoices',
  'contracts',
  'maintenance_requests',
  'notifications',
  'applications',
  'users',
  'students',
  'beds',
  'rooms',
  'buildings',
];

function daysAgo(days) {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function clearAll() {
  db.exec('PRAGMA foreign_keys = OFF;');
  try {
    for (const table of TABLES) {
      db.exec(`DELETE FROM ${table};`);
    }
    try {
      db.exec('DELETE FROM sqlite_sequence;');
    } catch {
      /* bảng sqlite_sequence chỉ tồn tại khi có AUTOINCREMENT */
    }
  } finally {
    db.exec('PRAGMA foreign_keys = ON;');
  }
}

export function seedDatabase({ force = false } = {}) {
  const existing = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (existing > 0 && !force) return { seeded: false };
  if (force) clearAll();

  transaction(() => {
    const insertBuilding = db.prepare(
      `INSERT INTO buildings (code, name, address, gender, floors, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const insertRoom = db.prepare(
      `INSERT INTO rooms
         (building_id, code, name, floor, capacity, room_type, price_per_month, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertBed = db.prepare(
      'INSERT INTO beds (room_id, code, status) VALUES (?, ?, ?)',
    );
    const insertStudent = db.prepare(
      `INSERT INTO students
         (mssv, full_name, gender, date_of_birth, class_name, faculty, phone, email, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertUser = db.prepare(
      `INSERT INTO users (username, password_hash, role, full_name, email, phone, student_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertApplication = db.prepare(
      `INSERT INTO applications
         (student_id, preferred_room_id, status, note, review_note, assigned_bed_id,
          reviewed_by, created_at, reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    // --- Tòa nhà ---
    const buildingA = Number(
      insertBuilding.run('A', 'Tòa nhà A', 'Khu nội trú số 1', 'male', 5, 'Tòa dành cho nam').lastInsertRowid,
    );
    const buildingB = Number(
      insertBuilding.run('B', 'Tòa nhà B', 'Khu nội trú số 2', 'female', 5, 'Tòa dành cho nữ').lastInsertRowid,
    );
    const buildingC = Number(
      insertBuilding.run('C', 'Tòa nhà C', 'Khu nội trú số 3', 'mixed', 3, 'Tòa hỗn hợp').lastInsertRowid,
    );

    // --- Phòng + giường ---
    function addRoom(buildingId, code, floor, capacity, price, type = 'standard', status = 'available') {
      const roomId = Number(
        insertRoom.run(
          buildingId,
          code,
          `Phòng ${code}`,
          floor,
          capacity,
          type,
          price,
          status,
          null,
        ).lastInsertRowid,
      );
      const bedIds = [];
      for (let i = 1; i <= capacity; i += 1) {
        bedIds.push(Number(insertBed.run(roomId, `G${i}`, 'available').lastInsertRowid));
      }
      return { id: roomId, beds: bedIds };
    }

    const A101 = addRoom(buildingA, 'A101', 1, 4, 1200000);
    const A102 = addRoom(buildingA, 'A102', 1, 4, 1200000);
    const A103 = addRoom(buildingA, 'A103', 1, 4, 1200000);
    const A201 = addRoom(buildingA, 'A201', 2, 6, 1000000);
    const B101 = addRoom(buildingB, 'B101', 1, 4, 1200000);
    const B102 = addRoom(buildingB, 'B102', 1, 4, 1200000);
    const C101 = addRoom(buildingC, 'C101', 1, 6, 900000, 'service');
    addRoom(buildingC, 'C102', 1, 4, 900000, 'standard', 'maintenance');

    // --- Sinh viên ---
    const studentsData = [
      ['SV001', 'Nguyễn Văn An', 'male', '2005-01-12', 'CNTT01', 'Khoa Công nghệ Thông tin', '0912345671', 'an.nv@example.com', 'Hà Nội'],
      ['SV002', 'Trần Thị Bình', 'female', '2005-03-08', 'CNTT01', 'Khoa Công nghệ Thông tin', '0912345672', 'binh.tt@example.com', 'Hải Phòng'],
      ['SV003', 'Lê Văn Cường', 'male', '2004-11-21', 'KT01', 'Khoa Kinh tế', '0912345673', 'cuong.lv@example.com', 'Nam Định'],
      ['SV004', 'Phạm Thị Dung', 'female', '2005-07-02', 'KT02', 'Khoa Kinh tế', '0912345674', 'dung.pt@example.com', 'Thanh Hóa'],
      ['SV005', 'Hoàng Văn Em', 'male', '2005-09-15', 'CNTT02', 'Khoa Công nghệ Thông tin', '0912345675', 'em.hv@example.com', 'Nghệ An'],
      ['SV006', 'Đỗ Thị Phương', 'female', '2004-12-30', 'CNTT02', 'Khoa Công nghệ Thông tin', '0912345676', 'phuong.dt@example.com', 'Quảng Ninh'],
    ];

    const studentIds = studentsData.map((row) =>
      Number(insertStudent.run(...row, 'active').lastInsertRowid),
    );

    // --- Tài khoản demo ---
    const adminId = Number(
      insertUser.run(
        'admin',
        hashPassword('Admin@123'),
        'admin',
        'Quản trị viên hệ thống',
        'admin@ktx.edu.vn',
        '0900000000',
        null,
        1,
      ).lastInsertRowid,
    );
    const managerId = Number(
      insertUser.run(
        'quanly',
        hashPassword('QuanLy@123'),
        'manager',
        'Nguyễn Thị Quản Lý',
        'quanly@ktx.edu.vn',
        '0900000001',
        null,
        1,
      ).lastInsertRowid,
    );

    studentIds.forEach((studentId, index) => {
      insertUser.run(
        `sv0${index + 1}`,
        hashPassword('SinhVien@123'),
        'student',
        studentsData[index][1],
        studentsData[index][7],
        studentsData[index][6],
        studentId,
        1,
      );
    });

    // --- Xếp chỗ cho một số sinh viên ---
    const assignments = [
      [studentIds[0], A101.beds[0]],
      [studentIds[1], B101.beds[0]],
      [studentIds[2], A101.beds[1]],
      [studentIds[5], C101.beds[0]],
    ];
    for (const [studentId, bedId] of assignments) {
      db.prepare("UPDATE beds SET status = 'occupied' WHERE id = ?").run(bedId);
      db.prepare('UPDATE students SET bed_id = ? WHERE id = ?').run(bedId, studentId);
    }

    // --- Đơn đăng ký ---
    // Đơn đã duyệt (tương ứng với các sinh viên đã được xếp chỗ)
    const approved = [
      [studentIds[0], A101.id, A101.beds[0]],
      [studentIds[1], B101.id, B101.beds[0]],
      [studentIds[2], A101.id, A101.beds[1]],
      [studentIds[5], C101.id, C101.beds[0]],
    ];
    for (const [studentId, roomId, bedId] of approved) {
      insertApplication.run(
        studentId,
        roomId,
        'approved',
        'Đăng ký ở ký túc xá học kỳ 2026-2027',
        'Đã duyệt và xếp chỗ.',
        bedId,
        managerId,
        daysAgo(6),
        daysAgo(4),
      );
    }

    // Đơn đang chờ duyệt
    insertApplication.run(
      studentIds[3],
      B101.id,
      'pending',
      'Em muốn ở gần bạn cùng lớp.',
      null,
      null,
      null,
      daysAgo(2),
      null,
    );
    insertApplication.run(
      studentIds[4],
      A102.id,
      'pending',
      'Đăng ký ở kỳ đầu.',
      null,
      null,
      null,
      daysAgo(1),
      null,
    );

    // Giữ tham chiếu để tránh cảnh báo biến không dùng
    void adminId;
  });

  return { seeded: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  initSchema();
  const result = seedDatabase({ force: true });
  console.log(result.seeded ? 'Đã tạo lại dữ liệu mẫu.' : 'Không có dữ liệu để tạo.');
}
