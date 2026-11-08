# 🏠 QLKTX – Hệ thống Quản lý Ký túc xá

> Đồ án môn **Nhập môn Công nghệ Phần mềm (IT3180)** – Nhóm 10
> Sprint 1: Nền tảng & luồng đăng ký ở cơ bản (27/10 – 09/11/2026)

Ứng dụng web quản lý ký túc xá phục vụ 3 vai trò **Sinh viên – Quản lý KTX – Admin**: quản lý tòa nhà/phòng/giường, hồ sơ sinh viên nội trú, và luồng sinh viên đăng ký ở – quản lý duyệt và gán giường (có chặn xếp trùng, phòng đầy, phòng bảo trì).

---

## 📌 Tính năng Sprint 1

| Nhóm | Chức năng |
|---|---|
| 🔐 Đăng nhập & phân quyền | Đăng nhập 3 vai trò, token HS256, menu và API theo quyền |
| 🏢 Tòa nhà | Thêm/sửa/xóa, giới tính, số tầng, số phòng |
| 🛏️ Phòng & giường | CRUD phòng, tự sinh giường, đổi trạng thái trống/bảo trì, lọc phòng trống |
| 🎓 Sinh viên | Thêm/sửa/xóa hồ sơ, tra cứu theo MSSV / họ tên / lớp |
| 📝 Đăng ký ở | SV xem phòng trống, gửi/hủy đơn; quản lý duyệt/từ chối và gán giường |
| 🛡️ Chống xếp trùng | Transaction `BEGIN IMMEDIATE` + unique index trên `students(bed_id)` |
| 👥 Người dùng (admin) | Tạo tài khoản, phân vai trò, liên kết hồ sơ SV, đặt lại mật khẩu |
| 📊 Dashboard | Thống kê tòa nhà, phòng, giường, SV nội trú, đơn chờ, tỷ lệ lấp đầy |

---

## 🧰 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js 24 · Express 4 |
| Frontend | React 18 · React Router 6 · Vite 6 |
| CSDL | SQLite (`node:sqlite` – không cần native module) |
| Xác thực | scrypt + token HMAC-SHA256 tự cài đặt |
| Kiểm thử | `node --test` + `fetch` |

> **Yêu cầu:** Node.js **>= 22.5** (cần `node:sqlite`). Khuyến nghị Node 24 LTS. npm >= 10.

---

## 🚀 Cài đặt & chạy

```bash
# 1. Cài dependencies (từ thư mục gốc repo)
npm install

# 2. Tạo dữ liệu mẫu (tùy chọn – server tự seed ở lần chạy đầu)
npm run seed

# 3. Chạy đồng thời API + giao diện
npm run dev
```

| Thành phần | URL |
|---|---|
| Giao diện | http://localhost:5173 |
| API | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |

### Các lệnh khác

```bash
npm test        # Chạy 6 test tích hợp (node --test)
npm run build   # Build frontend production vào client/dist
npm start       # Chạy riêng API ở chế độ production
```

### Biến môi trường (tùy chọn)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `4000` | Cổng API |
| `DB_PATH` | `server/data/ktx.db` | Đường dẫn file SQLite |
| `JWT_SECRET` | `ktx-dev-secret-change-me` | Khóa ký token |
| `TOKEN_TTL_SECONDS` | `43200` | Hạn token (12 giờ) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origin cho CORS |

---

## 👤 Tài khoản demo

| Vai trò | Username | Password | Ghi chú |
|---|---|---|---|
| Quản trị viên | `admin` | `Admin@123` | Toàn quyền + quản lý người dùng |
| Quản lý KTX | `quanly` | `QuanLy@123` | Nghiệp vụ chính |
| Sinh viên | `sv01` | `SinhVien@123` | Đã có phòng A101 · G1 |
| Sinh viên | `sv02` … `sv06` | `SinhVien@123` | Một số đã có phòng/đơn chờ |

> Dữ liệu mẫu gồm 3 tòa nhà, 8 phòng, 36 giường, 6 sinh viên, 6 đơn đăng ký.

---

## 📁 Cấu trúc repo

```
ktx-management/
├── package.json            # npm workspaces + script gốc
├── server/                 # Express API + SQLite
│   ├── src/
│   │   ├── index.js        # khởi động server
│   │   ├── app.js          # Express app + mount routes
│   │   ├── schema.sql      # schema CSDL
│   │   ├── seed.js         # dữ liệu mẫu
│   │   ├── auth.js         # hash mật khẩu + token
│   │   ├── middleware.js   # authenticate / authorize
│   │   └── routes/         # auth, buildings, rooms, beds, students, applications, users, stats
│   └── test/integration.test.js
├── client/                 # React + Vite
│   └── src/
│       ├── components/     # Layout, ProtectedRoute, Toast, ui
│       ├── pages/          # 9 màn hình
│       ├── auth/           # AuthContext
│       └── api.js          # fetch wrapper
└── docs/                   # tài liệu Sprint 1
```

---

## 📚 Tài liệu

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [Biên bản phỏng vấn](docs/01-bien-ban-phong-van.md) | Bộ câu hỏi + câu trả lời, yêu cầu chức năng/phi chức năng |
| 2 | [Product Backlog v1](docs/02-product-backlog.md) | 8 hạng mục Sprint 1 (34 SP), DoR/DoD |
| 3 | [Scope Statement](docs/03-scope-statement.md) | Phạm vi, mốc thời gian, rủi ro |
| 4 | [Use Case](docs/04-use-case.md) | Tác nhân, UC01–UC19, đặc tả chi tiết |
| 5 | [ERD](docs/05-erd.md) | Sơ đồ ERD, từ điển dữ liệu, quy tắc toàn vẹn |
| 6 | [Kiến trúc & API](docs/06-kien-truc.md) | Kiến trúc 3 lớp, danh sách API, phân quyền |
| 7 | [Wireframe](docs/07-wireframe.md) | 11 wireframe + [bản xem trực quan](docs/wireframes/index.html) |
| 8 | [Kế hoạch kiểm thử](docs/08-test-plan.md) | Test case, kết quả 6/6 pass, bug log |
| 9 | [Kịch bản demo](docs/09-demo-script.md) | Kịch bản 10 bước, tài khoản, phương án dự phòng |
| 10 | [Báo cáo Sprint 1](docs/10-sprint1-report.md) | Kết quả, chỉ số, bài học, kế hoạch Sprint 2 |
| — | [Slide báo cáo](docs/slides/sprint1.html) | 13 slide HTML, điều hướng bằng ← → |

> Mở file HTML trực tiếp bằng trình duyệt (không cần server).

---

## 🔌 Tóm tắt API

| Nhóm | Endpoint chính |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Tòa nhà | `GET/POST /api/buildings`, `PUT/DELETE /api/buildings/:id` |
| Phòng | `GET/POST /api/rooms`, `GET/PUT/DELETE /api/rooms/:id`, `?available=true` |
| Giường | `GET/POST /api/beds`, `PUT/DELETE /api/beds/:id` |
| Sinh viên | `GET/POST /api/students`, `GET/PUT/DELETE /api/students/:id`, `?q=` |
| Đơn đăng ký | `POST/GET /api/applications`, `POST /api/applications/:id/approve\|reject\|cancel` |
| Người dùng | `GET/POST /api/users`, `PUT/DELETE /api/users/:id`, `POST /api/users/:id/reset-password` |
| Thống kê | `GET /api/stats` |

Chi tiết đầy đủ tại [docs/06-kien-truc.md](docs/06-kien-truc.md).

---

## ✅ Kiểm thử

```bash
npm test
```

Kết quả mong đợi:

```
✔ 1. Đăng nhập 3 vai trò và từ chối mật khẩu sai
✔ 2. Phân quyền: chỉ thấy/được làm đúng chức năng của vai trò
✔ 3. CRUD tòa nhà – phòng – giường và tìm phòng trống
✔ 4. CRUD hồ sơ sinh viên và tra cứu theo MSSV / tên / lớp
✔ 5. Luồng đăng ký ở & xếp chỗ: gửi đơn, duyệt, gán giường, chống trùng
✔ 6. Thống kê, quản lý tài khoản và đặt lại mật khẩu

tests 6 · pass 6 · fail 0
```

Test dùng CSDL tạm trong thư mục hệ thống, không ảnh hưởng dữ liệu demo.

---

## 👥 Nhóm 10

| Thành viên | Vai trò |
|---|---|
| Phạm Mạnh Hùng | Project Manager · Kiểm thử |
| Hà Văn Hùng | BA |
| Phan Phạm Tuấn Anh | Kiến trúc & CSDL |
| Ngô Đức Thắng | UI/UX |
| Lê Vĩnh Quốc | Fullstack |
| Nguyễn Trọng Đăng | Backend |
| Đặng Minh Cường | Backend |
| Trần Xuân Trọng | Backend |

---

## 🗺️ Lộ trình

| Sprint | Thời gian | Nội dung |
|---|---|---|
| ✅ 1 | 27/10 – 09/11/2026 | Nền tảng, đăng nhập, quản lý phòng/SV, đăng ký & xếp chỗ |
| ⏳ 2 | 10/11 – 23/11/2026 | Hợp đồng, phí & hóa đơn, thông báo, dashboard nâng cao |
| ⏳ 3 | 24/11 – 07/12/2026 | Nhượng chỗ ở giữa sinh viên |
| ⏳ 4 | 08/12 – 21/12/2026 | UAT, tài liệu, bảo vệ cuối kỳ |
