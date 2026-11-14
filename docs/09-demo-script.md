# Kịch bản demo Sprint 1

| Thông tin | Nội dung |
|---|---|
| Buổi báo cáo | Sprint 1 Review – 10/11/2026 |
| Thời lượng demo | 8–10 phút (phần trình diễn), 5 phút Q&A |
| Người trình bày | Phạm Mạnh Hùng (PM) |
| Người thao tác | Trần Xuân Trọng (đăng ký & xếp chỗ) |
| Người hỗ trợ | Hà Văn Hùng (nghiệp vụ), Phan Phạm Tuấn Anh (kỹ thuật) |
| Môi trường | Laptop + Chrome, API `localhost:4000`, UI `localhost:5173` |

## 1. Chuẩn bị trước demo (checklist 15 phút)

| # | Việc cần làm | Lệnh / thao tác | ✅ |
|---|---|---|---|
| 1 | Cài dependencies | `npm install` | ☐ |
| 2 | Tạo lại dữ liệu mẫu sạch | `npm run seed` | ☐ |
| 3 | Chạy hệ thống | `npm run dev` | ☐ |
| 4 | Mở sẵn 3 tab: giao diện, API health, slide | `localhost:5173`, `localhost:4000/api/health`, `docs/slides/sprint1.html` | ☐ |
| 5 | Kiểm tra đăng nhập 3 tài khoản | admin / quanly / sv01 | ☐ |
| 6 | Kiểm tra có 2 đơn “Chờ duyệt” | Màn hình Đơn đăng ký | ☐ |
| 7 | Tắt thông báo hệ điều hành, chỉnh cỡ chữ trình duyệt 100% | — | ☐ |
| 8 | Chuẩn bị phương án dự phòng | Video quay sẵn luồng demo + ảnh chụp màn hình | ☐ |

**Tài khoản demo**

| Vai trò | Username | Password | Ghi chú |
|---|---|---|---|
| Quản trị viên | `admin` | `Admin@123` | Toàn quyền + quản lý người dùng |
| Quản lý KTX | `quanly` | `QuanLy@123` | Nghiệp vụ chính |
| Sinh viên | `sv01` | `SinhVien@123` | Đã có phòng A101 · G1 |
| Sinh viên | `sv04` | `SinhVien@123` | Chưa có phòng, có đơn chờ |
| Sinh viên | `sv05` | `SinhVien@123` | Chưa có phòng, có đơn chờ |

## 2. Cấu trúc phần trình bày

| Thời lượng | Nội dung | Người phụ trách |
|---|---|---|
| 1 phút | Mở đầu: mục tiêu Sprint 1, phạm vi | PM |
| 1 phút | Kiến trúc & công nghệ, màn hình đăng nhập | Kiến trúc |
| 2 phút | Quản lý tòa nhà – phòng – giường, tìm phòng trống | Quản lý nghiệp vụ |
| 1,5 phút | Hồ sơ sinh viên & tra cứu | Quản lý nghiệp vụ |
| 2,5 phút | Luồng đăng ký ở & xếp chỗ (SV → Quản lý → SV) | Đăng ký & xếp chỗ |
| 1 phút | Phân quyền 3 vai trò & quản lý tài khoản | PM |
| 1 phút | Kiểm thử, kết quả, bài học | Kiểm thử |
| 5 phút | Q&A | Cả nhóm |

## 3. Kịch bản chi tiết từng bước

### Bước 1 – Mở đầu (1 phút)

**Lời thoại gợi ý:**

> “Kính thưa cô và cả lớp, nhóm 10 trình bày Sprint 1 của Hệ thống Quản lý Ký túc xá. Mục tiêu Sprint 1 là demo được luồng: đăng nhập → quản lý phòng/sinh viên → sinh viên đăng ký ở → quản lý duyệt và xếp giường. Nhóm chọn công nghệ Node.js + Express + React + SQLite để cả nhóm clone về là chạy được ngay.”

**Slide:** 1 → 3.

### Bước 2 – Đăng nhập & phân quyền (1 phút)

1. Mở `http://localhost:5173`.
2. Giới thiệu nhanh 3 nút tài khoản demo.
3. Đăng nhập **quanly / QuanLy@123**.
4. Chỉ vào sidebar: “Tổng quan / Nghiệp vụ KTX: Tòa nhà, Phòng & giường, Sinh viên, Đơn đăng ký”.
5. Nói: “Tài khoản quản lý không thấy mục Người dùng – mục này chỉ admin có.”

**Kỳ vọng:** vào Dashboard quản lý, hiện 6 thẻ số liệu và 2 đơn chờ duyệt.

### Bước 3 – Quản lý tòa nhà – phòng – giường (2 phút)

1. Menu **Tòa nhà** → bấm **+ Thêm tòa nhà**.
   - Mã: `D`, Tên: `Tòa nhà D`, Giới tính: `Hỗn hợp`, Số tầng: `3`.
   - Bấm **Lưu** → toast “Đã thêm tòa nhà mới”.
2. Menu **Phòng & giường** → **+ Thêm phòng**.
   - Tòa nhà: `D`, Mã phòng: `D101`, Tầng: `1`, Sức chứa: `4`, Số giường: `4`, Giá: `1000000`.
   - Lưu → phòng D101 hiện “4 trống”.
3. Bấm nút **Giường** ở phòng A101:
   - Chỉ ra G1, G2 “Đang ở” (nền đỏ, không có nút xóa).
   - Chuyển G3 sang **Bảo trì** → badge đổi màu vàng.
4. Đóng modal, tick **Chỉ phòng còn trống** → chỉ còn các phòng có giường trống.

**Thông điệp:** “Quản lý biết ngay phòng nào còn chỗ, giường nào đang bảo trì.”

### Bước 4 – Hồ sơ sinh viên (1,5 phút)

1. Menu **Sinh viên**.
2. Gõ `SV00` vào ô tìm kiếm → danh sách lọc còn 6 hồ sơ.
3. Gõ `CNTT01` vào ô Lớp → lọc còn 2 hồ sơ.
4. Bấm **+ Thêm sinh viên**:
   - MSSV `SV007`, Họ tên `Lê Minh Demo`, Lớp `CNTT03`, Khoa `Khoa CNTT`.
   - Lưu → hồ sơ mới xuất hiện.
5. Chỉ vào cột “Phòng / giường”: SV001 đang ở A101 · G1; SV007 “Chưa xếp chỗ”.

**Thông điệp:** “Tra cứu theo MSSV, tên hoặc lớp; hồ sơ gắn liền với nơi ở hiện tại.”

### Bước 5 – Sinh viên gửi đơn đăng ký (1 phút)

1. Đăng xuất (góc sidebar).
2. Đăng nhập **sv04 / SinhVien@123**.
3. Chỉ ra menu sinh viên: Phòng trống, Đơn đăng ký, Hồ sơ của tôi.
4. Menu **Phòng trống** → chỉ ra các thẻ phòng còn giường.
5. Chọn phòng **D101** → bấm **Đăng ký phòng này**.
6. Màn hình Đơn đăng ký: phòng D101 được chọn sẵn → nhập ghi chú “Em muốn ở tầng 1” → **Gửi đơn đăng ký**.
7. Toast thành công, đơn xuất hiện với badge **Chờ duyệt**.
8. Thử bấm gửi lần 2 → form bị khóa + cảnh báo “Bạn đang có một đơn chờ duyệt”.

> **Lưu ý:** `sv04` đã có sẵn 1 đơn chờ từ dữ liệu mẫu. Nếu muốn demo gửi đơn mới, dùng `sv06` (chưa có đơn) hoặc chạy `npm run seed` và dùng tài khoản chưa có đơn. Cách an toàn nhất: demo bằng **sv06** sau khi seed.

**Phương án chuẩn bị:** trước demo, đăng nhập `sv06` kiểm tra chưa có đơn; nếu đã có, chạy `npm run seed`.

### Bước 6 – Quản lý duyệt & gán giường (1,5 phút)

1. Đăng xuất, đăng nhập lại **quanly / QuanLy@123**.
2. Menu **Đơn đăng ký** → lọc trạng thái **Chờ duyệt**.
3. Chỉ ra đơn của sinh viên vừa gửi.
4. Bấm **Duyệt**:
   - Cột trái: thông tin SV, phòng nguyện vọng, ghi chú.
   - Cột phải: chọn phòng **D · D101**, chọn giường **G1**.
   - Ghi chú duyệt: “Đã kiểm tra phòng, xếp chỗ”.
   - Bấm **Duyệt & xếp chỗ**.
5. Đơn chuyển **Đã duyệt**, cột “Xếp chỗ” hiện `D101 · G1`.
6. Mở lại **Phòng & giường** → D101 hiện `1/4`, còn `3 trống`.

**Thông điệp:** “Giường chuyển sang đang ở ngay khi duyệt, không thể xếp trùng.”

### Bước 7 – Kiểm chứng chống xếp trùng (30 giây)

1. Quay lại **Đơn đăng ký**, chọn một đơn chờ khác.
2. Bấm Duyệt, chọn đúng phòng D101 và giường **G1** (đã có người).
3. Hệ thống báo lỗi “Giường đã được sử dụng hoặc đang bảo trì.”
4. Chọn giường G2 → duyệt thành công (hoặc bấm Hủy để kết thúc).

**Thông điệp:** “Đây là điểm cốt lõi của Sprint 1 – chặn xếp trùng giường và phòng đầy.”

### Bước 8 – Sinh viên thấy kết quả (30 giây)

1. Đăng xuất, đăng nhập lại tài khoản sinh viên vừa được duyệt.
2. Dashboard hiện thẻ **Phòng hiện tại: D101 · G1**, tòa nhà D.
3. Menu **Hồ sơ của tôi** → phần “Nơi ở” hiện đúng tòa/phòng/giường.

### Bước 9 – Admin & quản lý người dùng (1 phút)

1. Đăng xuất, đăng nhập **admin / Admin@123**.
2. Chỉ ra menu bổ sung **Quản trị hệ thống → Người dùng**.
3. Mở danh sách: 8 tài khoản, badge vai trò màu khác nhau.
4. Bấm **Đặt lại MK** cho `sv06`, nhập `Demo@12345`, lưu.
5. (Tùy chọn) Đăng nhập `sv06` bằng mật khẩu mới để chứng minh.

### Bước 10 – Kết quả kiểm thử & kết luận (1 phút)

1. Chuyển sang terminal đã chuẩn bị: chạy `npm test`.
2. Chỉ ra kết quả **6/6 pass**, thời gian ~1,7 giây.
3. Tóm tắt: “Sprint 1 hoàn thành 8/8 hạng mục, 34 story point; luồng demo chạy trọn vẹn.”
4. Nêu hạn chế đã biết và kế hoạch Sprint 2: hợp đồng, phí, thông báo, dashboard nâng cao, chốt nghiệp vụ nhượng chỗ.

## 4. Câu hỏi thường gặp & trả lời gợi ý

| Câu hỏi | Trả lời gợi ý |
|---|---|
| Vì sao chọn SQLite? | Không cần cài máy chủ, cả nhóm clone là chạy; schema viết SQL thuần nên dễ chuyển MySQL/PostgreSQL ở Sprint sau. |
| Bảo mật mật khẩu thế nào? | Băm scrypt kèm salt, không lưu mật khẩu thô; token HS256 có hạn 12 giờ. |
| Nếu 2 quản lý duyệt cùng lúc? | Thao tác duyệt chạy trong transaction `BEGIN IMMEDIATE` và có unique index trên `students(bed_id)`. |
| Có ràng buộc giới tính tòa nhà không? | Đã có trường giới tính ở tòa nhà; Sprint 1 ưu tiên chống trùng giường/phòng đầy, ràng buộc giới tính siết ở Sprint 2. |
| Có xuất Excel không? | Nằm trong Sprint 2 (PB-14). |
| Dữ liệu thật nhập thế nào? | Sprint 2 bổ sung import Excel; hiện có form thêm/sửa và seed dữ liệu mẫu. |
| Có thông báo cho sinh viên không? | Sprint 1 sinh viên xem trạng thái đơn trong hệ thống; thông báo tự động ở Sprint 2. |

## 5. Phương án dự phòng

| Tình huống | Cách xử lý |
|---|---|
| API không khởi động | Chạy lại `npm run dev`; kiểm tra cổng 4000 bằng `/api/health` |
| Dữ liệu demo bị lệch | `npm run seed` rồi tải lại trang |
| Lỗi mạng/localhost | Chuyển sang video quay sẵn luồng demo |
| Trình chiếu lỗi | Slide HTML mở trực tiếp bằng Chrome, có bản PDF dự phòng |
| Hết thời gian | Bỏ bước 9 (admin), giữ bước 5–8 là luồng cốt lõi |
| Câu hỏi ngoài phạm vi | Ghi nhận vào Product Backlog, hẹn trả lời sau |

## 6. Phân công trong buổi demo

| Thành viên | Nhiệm vụ |
|---|---|
| Phạm Mạnh Hùng | Dẫn chương trình, bấm slide, trả lời câu hỏi chung |
| Trần Xuân Trọng | Thao tác luồng đăng ký & xếp chỗ |
| Hà Văn Hùng | Giải thích nghiệp vụ, trả lời câu hỏi quy trình |
| Phan Phạm Tuấn Anh | Hỗ trợ kỹ thuật, xử lý sự cố môi trường |
| Ngô Đức Thắng | Giải thích wireframe/layout nếu được hỏi |
| Các thành viên còn lại | Ghi biên bản, ghi nhận câu hỏi/góp ý |

## 7. Sau buổi demo

- [ ] Ghi lại toàn bộ câu hỏi và góp ý của giảng viên/khách hàng.
- [ ] Cập nhật Product Backlog nếu có yêu cầu mới.
- [ ] Chốt danh sách việc Sprint 2 trong Sprint Planning.
- [ ] Lưu biên bản Sprint Review vào `docs/`.
