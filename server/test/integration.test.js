import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// --- Cấu hình CSDL tạm cho kiểm thử (đặt trước khi import app) ---
const dbFile = path.join(os.tmpdir(), `ktx-test-${Date.now()}.db`);
process.env.DB_PATH = dbFile;
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { createApp } = await import('../src/app.js');
const { seedDatabase } = await import('../src/seed.js');
const { db } = await import('../src/db.js');

const app = createApp();
seedDatabase({ force: true });

const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;

async function req(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(base + pathname, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, data };
}

async function login(username, password) {
  const res = await req('/auth/login', { method: 'POST', body: { username, password } });
  assert.equal(res.status, 200, `Đăng nhập ${username} phải thành công`);
  return res.data.token;
}

const adminToken = await login('admin', 'Admin@123');
const managerToken = await login('quanly', 'QuanLy@123');
const studentToken = await login('sv01', 'SinhVien@123');

after(() => {
  server.close();
  try {
    db.close();
  } catch {
    /* ignore */
  }
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      fs.rmSync(dbFile + suffix, { force: true });
    } catch {
      /* ignore */
    }
  }
});

test('1. Đăng nhập 3 vai trò và từ chối mật khẩu sai', async () => {
  const cases = [
    ['admin', 'Admin@123', 'admin'],
    ['quanly', 'QuanLy@123', 'manager'],
    ['sv01', 'SinhVien@123', 'student'],
  ];
  for (const [username, password, role] of cases) {
    const res = await req('/auth/login', { method: 'POST', body: { username, password } });
    assert.equal(res.status, 200);
    assert.equal(res.data.user.role, role);
    assert.ok(res.data.token);
  }

  const wrong = await req('/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'sai-mat-khau' },
  });
  assert.equal(wrong.status, 401);

  const missing = await req('/auth/login', { method: 'POST', body: {} });
  assert.equal(missing.status, 400);
});

test('2. Phân quyền: chỉ thấy/được làm đúng chức năng của vai trò', async () => {
  const studentCreateBuilding = await req('/buildings', {
    method: 'POST',
    token: studentToken,
    body: { code: 'Z', name: 'Z' },
  });
  assert.equal(studentCreateBuilding.status, 403);

  const managerUsers = await req('/users', { token: managerToken });
  assert.equal(managerUsers.status, 403);

  const adminUsers = await req('/users', { token: adminToken });
  assert.equal(adminUsers.status, 200);

  const managerBuildings = await req('/buildings', { token: managerToken });
  assert.equal(managerBuildings.status, 200);

  const noToken = await req('/buildings');
  assert.equal(noToken.status, 401);
});

test('3. CRUD tòa nhà – phòng – giường và tìm phòng trống', async () => {
  const building = await req('/buildings', {
    method: 'POST',
    token: managerToken,
    body: { code: 'T1', name: 'Tòa test 1', gender: 'mixed', floors: 2 },
  });
  assert.equal(building.status, 201);

  const room = await req('/rooms', {
    method: 'POST',
    token: managerToken,
    body: {
      buildingId: building.data.building.id,
      code: 'T101',
      floor: 1,
      capacity: 2,
      bedCount: 2,
      pricePerMonth: 1000000,
      status: 'available',
    },
  });
  assert.equal(room.status, 201);
  assert.equal(room.data.room.availableBeds, 2);
  assert.equal(room.data.room.bedCount, 2);

  const available = await req('/rooms?available=true', { token: studentToken });
  assert.equal(available.status, 200);
  assert.ok(available.data.rooms.some((item) => item.code === 'T101'));

  const beds = await req(`/beds?roomId=${room.data.room.id}`, { token: managerToken });
  assert.equal(beds.data.beds.length, 2);

  const addBed = await req('/beds', {
    method: 'POST',
    token: managerToken,
    body: { roomId: room.data.room.id, code: 'G3' },
  });
  assert.equal(addBed.status, 409, 'Không được thêm giường vượt sức chứa');

  const updated = await req(`/rooms/${room.data.room.id}`, {
    method: 'PUT',
    token: managerToken,
    body: { name: 'Phòng test 101', pricePerMonth: 1200000 },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.room.name, 'Phòng test 101');

  const deleted = await req(`/rooms/${room.data.room.id}`, {
    method: 'DELETE',
    token: managerToken,
  });
  assert.equal(deleted.status, 200);
});

test('4. CRUD hồ sơ sinh viên và tra cứu theo MSSV / tên / lớp', async () => {
  const created = await req('/students', {
    method: 'POST',
    token: managerToken,
    body: {
      mssv: 'sv900',
      fullName: 'Nguyễn Văn Test',
      className: 'TEST01',
      gender: 'male',
      phone: '0900000900',
    },
  });
  assert.equal(created.status, 201);
  // MSSV được chuẩn hóa viết hoa khi lưu
  assert.equal(created.data.student.mssv, 'SV900');

  const byMssv = await req('/students?q=SV900', { token: managerToken });
  assert.equal(byMssv.data.students.length, 1);

  const byName = await req('/students?q=Nguyễn Văn Test', { token: managerToken });
  assert.equal(byName.data.students.length, 1);

  const byClass = await req('/students?className=TEST01', { token: managerToken });
  assert.equal(byClass.data.students.length, 1);

  const duplicated = await req('/students', {
    method: 'POST',
    token: managerToken,
    body: { mssv: 'SV900', fullName: 'Trùng MSSV' },
  });
  assert.equal(duplicated.status, 409);

  const updated = await req(`/students/${created.data.student.id}`, {
    method: 'PUT',
    token: managerToken,
    body: { fullName: 'Nguyễn Văn Test 2' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.student.fullName, 'Nguyễn Văn Test 2');

  const deleted = await req(`/students/${created.data.student.id}`, {
    method: 'DELETE',
    token: managerToken,
  });
  assert.equal(deleted.status, 200);
});

test('5. Luồng đăng ký ở & xếp chỗ: gửi đơn, duyệt, gán giường, chống trùng', async () => {
  const building = await req('/buildings', {
    method: 'POST',
    token: managerToken,
    body: { code: 'T2', name: 'Tòa test 2', gender: 'mixed', floors: 1 },
  });
  const room = await req('/rooms', {
    method: 'POST',
    token: managerToken,
    body: {
      buildingId: building.data.building.id,
      code: 'T201',
      floor: 1,
      capacity: 1,
      bedCount: 1,
      pricePerMonth: 0,
      status: 'available',
    },
  });
  const bedId = (await req(`/beds?roomId=${room.data.room.id}`, { token: managerToken })).data
    .beds[0].id;

  const student1 = await req('/students', {
    method: 'POST',
    token: managerToken,
    body: { mssv: 'SV901', fullName: 'Sinh viên Một', className: 'TEST02' },
  });
  const student2 = await req('/students', {
    method: 'POST',
    token: managerToken,
    body: { mssv: 'SV902', fullName: 'Sinh viên Hai', className: 'TEST02' },
  });

  for (const [username, student, fullName] of [
    ['sv901', student1, 'Sinh viên Một'],
    ['sv902', student2, 'Sinh viên Hai'],
  ]) {
    const created = await req('/users', {
      method: 'POST',
      token: adminToken,
      body: {
        username,
        password: 'Test@123',
        role: 'student',
        fullName,
        studentId: student.data.student.id,
      },
    });
    assert.equal(created.status, 201);
  }

  const token1 = await login('sv901', 'Test@123');
  const token2 = await login('sv902', 'Test@123');

  const application1 = await req('/applications', {
    method: 'POST',
    token: token1,
    body: { preferredRoomId: room.data.room.id, note: 'Đơn test 1' },
  });
  assert.equal(application1.status, 201);

  const duplicatePending = await req('/applications', {
    method: 'POST',
    token: token1,
    body: {},
  });
  assert.equal(duplicatePending.status, 409, 'Không được có 2 đơn chờ duyệt');

  const application2 = await req('/applications', {
    method: 'POST',
    token: token2,
    body: { preferredRoomId: room.data.room.id },
  });
  assert.equal(application2.status, 201);

  const approved = await req(`/applications/${application1.data.application.id}/approve`, {
    method: 'POST',
    token: managerToken,
    body: { bedId, reviewNote: 'Đã xếp chỗ' },
  });
  assert.equal(approved.status, 200);
  assert.equal(approved.data.application.status, 'approved');
  assert.equal(approved.data.application.assignedBedCode, 'G1');

  const bedsAfter = await req(`/beds?roomId=${room.data.room.id}`, { token: managerToken });
  assert.equal(bedsAfter.data.beds[0].status, 'occupied');

  const me = await req('/auth/me', { token: token1 });
  assert.equal(me.data.student.roomCode, 'T201');
  assert.equal(me.data.student.bedCode, 'G1');

  const doubleAssign = await req(`/applications/${application2.data.application.id}/approve`, {
    method: 'POST',
    token: managerToken,
    body: { bedId },
  });
  assert.equal(doubleAssign.status, 409, 'Không được xếp trùng một giường');

  const studentApprove = await req(`/applications/${application2.data.application.id}/approve`, {
    method: 'POST',
    token: token2,
    body: { bedId },
  });
  assert.equal(studentApprove.status, 403);

  const rejected = await req(`/applications/${application2.data.application.id}/reject`, {
    method: 'POST',
    token: managerToken,
    body: { reviewNote: 'Hết giường' },
  });
  assert.equal(rejected.status, 200);
  assert.equal(rejected.data.application.status, 'rejected');

  // Sau khi bị từ chối, sinh viên được phép gửi đơn mới
  const reapply = await req('/applications', { method: 'POST', token: token2, body: {} });
  assert.equal(reapply.status, 201);

  // Mỗi sinh viên chỉ thấy đơn của chính mình
  const myApplications = await req('/applications', { token: token1 });
  assert.equal(myApplications.data.applications.length, 1);
  assert.equal(myApplications.data.applications[0].mssv, 'SV901');

  const otherApplication = await req(`/applications/${application2.data.application.id}`, {
    token: token1,
  });
  assert.equal(otherApplication.status, 403);
});

test('6. Thống kê, quản lý tài khoản và đặt lại mật khẩu', async () => {
  const stats = await req('/stats', { token: managerToken });
  assert.equal(stats.status, 200);
  assert.ok(stats.data.stats.buildings >= 3);
  assert.ok(stats.data.stats.pendingApplications >= 2);

  const users = await req('/users?q=sv901', { token: adminToken });
  assert.equal(users.status, 200);
  const target = users.data.users[0];
  assert.ok(target);

  const reset = await req(`/users/${target.id}/reset-password`, {
    method: 'POST',
    token: adminToken,
    body: { password: 'NewPass@123' },
  });
  assert.equal(reset.status, 200);

  const loginNew = await req('/auth/login', {
    method: 'POST',
    body: { username: 'sv901', password: 'NewPass@123' },
  });
  assert.equal(loginNew.status, 200);

  const duplicateUsername = await req('/users', {
    method: 'POST',
    token: adminToken,
    body: { username: 'sv901', password: 'Abc@1234', role: 'manager', fullName: 'X' },
  });
  assert.equal(duplicateUsername.status, 409);
});
