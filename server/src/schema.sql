-- =====================================================================
-- Hệ thống Quản lý Ký túc xá (QLKTX) - Nhóm 10 - IT3180
-- Schema CSDL SQLite (thiết kế đầy đủ cho 4 sprint)
-- Sprint 1 sử dụng: users, students, buildings, rooms, beds, applications
-- Sprint 2+: contracts, invoices, notifications, maintenance_requests
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. Tòa nhà
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buildings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  address     TEXT,
  gender      TEXT    NOT NULL DEFAULT 'mixed'
                      CHECK (gender IN ('male', 'female', 'mixed')),
  floors      INTEGER NOT NULL DEFAULT 1 CHECK (floors >= 1),
  description TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 2. Phòng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id    INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  code           TEXT    NOT NULL,
  name           TEXT,
  floor          INTEGER NOT NULL DEFAULT 1 CHECK (floor >= 1),
  capacity       INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
  room_type      TEXT    NOT NULL DEFAULT 'standard',
  price_per_month REAL   NOT NULL DEFAULT 0 CHECK (price_per_month >= 0),
  status         TEXT    NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available', 'maintenance', 'closed')),
  description    TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (building_id, code)
);

-- ---------------------------------------------------------------------
-- 3. Giường
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beds (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  code       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (room_id, code)
);

-- ---------------------------------------------------------------------
-- 4. Sinh viên (hồ sơ nội trú)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  mssv          TEXT    NOT NULL UNIQUE,
  full_name     TEXT    NOT NULL,
  gender        TEXT    CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth TEXT,
  class_name    TEXT,
  faculty       TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  status        TEXT    NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'inactive')),
  bed_id        INTEGER REFERENCES beds(id) ON DELETE SET NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Mỗi giường chỉ chứa tối đa 1 sinh viên
CREATE UNIQUE INDEX IF NOT EXISTS ux_students_bed
  ON students(bed_id) WHERE bed_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 5. Tài khoản người dùng (3 vai trò)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('student', 'manager', 'admin')),
  full_name     TEXT    NOT NULL,
  email         TEXT,
  phone         TEXT,
  student_id    INTEGER REFERENCES students(id) ON DELETE SET NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 6. Đơn đăng ký ở KTX
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  preferred_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  status            TEXT    NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  note              TEXT,
  review_note       TEXT,
  assigned_bed_id   INTEGER REFERENCES beds(id) ON DELETE SET NULL,
  reviewed_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at       TEXT
);

-- Mỗi sinh viên chỉ có tối đa 1 đơn đang chờ xử lý
CREATE UNIQUE INDEX IF NOT EXISTS ux_applications_pending_student
  ON applications(student_id) WHERE status = 'pending';

-- ---------------------------------------------------------------------
-- 7. Hợp đồng nội trú (Sprint 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_id     INTEGER NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  start_date TEXT    NOT NULL,
  end_date   TEXT,
  status     TEXT    NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 8. Hóa đơn / phí (Sprint 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id     INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  period          TEXT    NOT NULL, -- YYYY-MM
  room_fee        REAL    NOT NULL DEFAULT 0,
  electricity_fee REAL    NOT NULL DEFAULT 0,
  water_fee       REAL    NOT NULL DEFAULT 0,
  total           REAL    NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'unpaid'
                          CHECK (status IN ('unpaid', 'paid')),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (contract_id, period)
);

-- ---------------------------------------------------------------------
-- 9. Thông báo (Sprint 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- 10. Yêu cầu sửa chữa (Sprint 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  room_id     INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  description TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'in_progress', 'done')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- Chỉ mục hỗ trợ tìm kiếm
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_rooms_building   ON rooms(building_id);
CREATE INDEX IF NOT EXISTS ix_beds_room        ON beds(room_id);
CREATE INDEX IF NOT EXISTS ix_students_name    ON students(full_name);
CREATE INDEX IF NOT EXISTS ix_students_class   ON students(class_name);
CREATE INDEX IF NOT EXISTS ix_applications_st  ON applications(student_id);
CREATE INDEX IF NOT EXISTS ix_applications_stt ON applications(status);
