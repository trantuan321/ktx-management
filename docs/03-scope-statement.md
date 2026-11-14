# Scope Statement – Hệ thống Quản lý Ký túc xá (QLKTX)

| Thông tin | Nội dung |
|---|---|
| Tên dự án | Hệ thống Quản lý Ký túc xá (QLKTX) |
| Mã dự án | IT3180 – Nhóm 10 |
| Khách hàng | Cô Nguyễn Thị Quản Lý – Quản lý Ký túc xá |
| Project Manager | Phạm Mạnh Hùng |
| Thời gian | 27/10/2026 – 21/12/2026 (4 sprint) |
| Phiên bản | 1.0 – 30/10/2026 |
| Người lập | Hà Văn Hùng (BA) |

## 1. Tóm tắt dự án

Xây dựng một ứng dụng web quản lý ký túc xá cho Trường, phục vụ ba nhóm người dùng: **Sinh viên**, **Quản lý KTX** và **Admin**. Hệ thống số hóa việc quản lý hồ sơ sinh viên nội trú, tòa nhà – phòng – giường, quy trình đăng ký ở và xếp chỗ. Dự án được triển khai theo phương pháp Agile/Scrum trong 4 sprint, ưu tiên hoàn thành luồng nghiệp vụ cốt lõi trước, sau đó bổ sung hợp đồng, phí, thông báo và tính năng nhượng chỗ ở.

## 2. Vấn đề & cơ hội

**Hiện trạng**
- Hồ sơ sinh viên và sổ xếp phòng đang được quản lý bằng Excel và sổ giấy.
- Mỗi đầu kỳ mất 1–2 tuần nhập liệu, đối chiếu và xếp chỗ thủ công.
- Dễ xảy ra xếp trùng giường, xếp vào phòng đã đầy hoặc bỏ sót sinh viên.
- Tra cứu, tổng hợp báo cáo cuối kỳ chậm, phụ thuộc vào người nhập liệu.

**Cơ hội**
- Giảm thời gian xử lý đăng ký và xếp chỗ xuống còn vài ngày.
- Giảm sai sót nhờ kiểm tra tự động (trùng giường, phòng đầy, phòng bảo trì).
- Cung cấp cho sinh viên khả năng tự tra cứu phòng trống và theo dõi đơn.
- Tạo nền tảng dữ liệu để mở rộng hợp đồng, phí, thông báo và nhượng chỗ.

## 3. Mục tiêu (SMART)

| Mã | Mục tiêu | Đo lường |
|---|---|---|
| G1 | Số hóa 100% hồ sơ sinh viên nội trú của kỳ hiện tại | Ít nhất 500 hồ sơ được nhập và tra cứu được |
| G2 | Tự động hóa luồng đăng ký ở và xếp chỗ cơ bản | 100% đơn Sprint 1 được xử lý qua hệ thống |
| G3 | Ngăn chặn xếp trùng giường và xếp vào phòng đầy | 0 lỗi trùng giường trong kiểm thử và demo |
| G4 | Rút ngắn thời gian tổng hợp báo cáo cuối kỳ | Từ 1–2 ngày xuống dưới 1 giờ (Sprint 2) |
| G5 | Hoàn thành báo cáo Sprint 1 đúng hạn | Demo chạy trọn luồng, slide sẵn sàng ngày 10/11/2026 |

## 4. Phạm vi

### 4.1 Trong phạm vi

**Sprint 1 – Nền tảng & luồng đăng ký ở cơ bản (27/10 – 09/11/2026)**
- Khảo sát yêu cầu, chốt Product Backlog v1 và Scope Statement.
- Thiết kế Use case, ERD, schema CSDL, kiến trúc; dựng repo và khung dự án.
- Wireframe và giao diện dùng chung (layout, menu theo vai trò).
- Đăng nhập & phân quyền 3 vai trò.
- Quản lý tòa nhà – phòng – giường; xem/tìm phòng trống.
- Quản lý hồ sơ sinh viên nội trú.
- Sinh viên gửi đơn đăng ký; quản lý duyệt và gán giường.
- Kiểm thử tích hợp, chuẩn bị demo và slide báo cáo Sprint 1.

**Sprint 2 – Hợp đồng, phí & chốt nghiệp vụ nhượng chỗ (10/11 – 23/11/2026)**
- Chốt quy tắc nghiệp vụ nhượng chỗ với khách hàng.
- Hợp đồng nội trú: gia hạn, trả phòng, chuyển phòng.
- Tính phí phòng, điện, nước và hóa đơn.
- Thông báo và yêu cầu sửa chữa.
- Dashboard thống kê, xuất Excel.
- Kiểm thử và báo cáo Sprint 2.

**Sprint 3 – Nhượng chỗ ở (24/11 – 07/12/2026)**
- Sinh viên đăng tin nhượng chỗ.
- Sinh viên khác tìm kiếm và gửi yêu cầu nhận chỗ.
- Quản lý duyệt, tự động cập nhật hợp đồng/giường, lưu lịch sử.
- Kiểm soát nghiệp vụ: chống trùng, thời hạn, điều kiện người nhận.
- Thông báo cho hai bên và báo cáo Sprint 3.

**Sprint 4 – Hoàn thiện, UAT & bàn giao (08/12 – 21/12/2026)**
- UAT với cô quản lý KTX, sửa theo phản hồi.
- Rà soát bảo mật, hiệu năng, phân quyền.
- Tài liệu hướng dẫn sử dụng và báo cáo dự án.
- Chuẩn bị demo và bảo vệ cuối kỳ.

### 4.2 Ngoài phạm vi

- Thanh toán trực tuyến qua ngân hàng/ví điện tử.
- Ứng dụng di động native (iOS/Android).
- Quản lý tài sản, điện nước theo chỉ số thông minh (IoT).
- Tích hợp với hệ thống đào tạo (LMS) hoặc cổng sinh viên của trường.
- Chấm công, kiểm soát ra vào bằng thẻ từ/khuôn mặt.
- Đa ngôn ngữ (chỉ tiếng Việt).
- Báo cáo phân tích nâng cao, BI dashboard ngoài phạm vi môn học.

## 5. Sản phẩm bàn giao

| STT | Sản phẩm | Hình thức |
|---|---|---|
| 1 | Biên bản phỏng vấn + bộ câu hỏi | Markdown |
| 2 | Product Backlog v1 | Markdown |
| 3 | Scope Statement | Markdown |
| 4 | Use case + đặc tả use case | Markdown + sơ đồ Mermaid |
| 5 | ERD + từ điển dữ liệu | Markdown + sơ đồ Mermaid |
| 6 | Tài liệu kiến trúc & API | Markdown |
| 7 | Wireframe & giao diện dùng chung | HTML + ứng dụng React |
| 8 | Mã nguồn frontend + backend | Repo Git |
| 9 | CSDL SQLite + dữ liệu mẫu | File DB + script seed |
| 10 | Bộ kiểm thử tích hợp | Mã nguồn test |
| 11 | Kịch bản demo | Markdown |
| 12 | Slide báo cáo Sprint 1 | HTML |

## 6. Các bên liên quan

| Bên | Vai trò | Trách nhiệm |
|---|---|---|
| Cô Nguyễn Thị Quản Lý | Khách hàng / Product Owner | Xác nhận yêu cầu, ưu tiên, UAT |
| Phạm Mạnh Hùng | Project Manager | Điều phối, theo dõi tiến độ, báo cáo |
| Hà Văn Hùng | BA | Phỏng vấn, Product Backlog, Scope |
| Phan Phạm Tuấn Anh | Kiến trúc & CSDL | Use case, ERD, schema, repo |
| Ngô Đức Thắng | Thiết kế UI/UX | Wireframe, layout, menu |
| Lê Vĩnh Quốc | Backend/Frontend | Đăng nhập, phân quyền, layout |
| Nguyễn Trọng Đăng | Backend | Tòa nhà, phòng, giường |
| Đặng Minh Cường | Backend | Hồ sơ sinh viên |
| Trần Xuân Trọng | Backend | Đăng ký ở & xếp chỗ |
| Phạm Mạnh Hùng | Kiểm thử | Test plan, test case, demo, slide |

## 7. Giả định

1. Khách hàng cung cấp đủ thông tin nghiệp vụ và phản hồi trong vòng 1–2 ngày làm việc.
2. Nhóm có môi trường Node.js và trình duyệt hiện đại để chạy demo.
3. Dữ liệu sinh viên mẫu được phép sử dụng cho mục đích học tập.
4. Quy mô dữ liệu Sprint 1 dưới 1.000 sinh viên và 200 phòng.
5. Các buổi báo cáo diễn ra theo lịch của môn học.

## 8. Ràng buộc

1. Thời gian: 4 sprint trong 8 tuần, báo cáo Sprint 1 ngày 10/11/2026.
2. Công nghệ: Node.js + Express + React + SQLite (đã chốt với nhóm).
3. Nhóm 8 thành viên, làm việc song song với các môn học khác.
4. Không có ngân sách thuê hạ tầng; chạy local hoặc máy chủ miễn phí.
5. Không sử dụng dữ liệu sinh viên thật ngoài phạm vi học tập.

## 9. Tiêu chí nghiệm thu dự án

1. Ba vai trò đăng nhập được và chỉ thấy đúng chức năng.
2. Quản lý thực hiện được CRUD tòa nhà, phòng, giường và tìm phòng trống.
3. Quản lý thêm/sửa/tra cứu được sinh viên theo MSSV, tên, lớp.
4. Sinh viên gửi đơn; quản lý duyệt và gán giường thành công.
5. Hệ thống chặn được xếp trùng giường và xếp vào phòng đầy/bảo trì.
6. Bộ kiểm thử tích hợp pass 100%.
7. Demo chạy trọn luồng không lỗi nghiêm trọng.
8. Slide và tài liệu báo cáo đầy đủ.

## 10. Mốc thời gian

| Mốc | Ngày | Kết quả |
|---|---|---|
| Khởi động & phỏng vấn | 27–30/10/2026 | Biên bản, Product Backlog v1, Scope |
| Thiết kế & dựng khung | 28/10–04/11/2026 | Use case, ERD, repo, wireframe |
| Phát triển chức năng | 02–08/11/2026 | Đăng nhập, CRUD, đăng ký & xếp chỗ |
| Kiểm thử & demo | 06–09/11/2026 | Test pass, kịch bản demo, slide |
| Báo cáo Sprint 1 | 10/11/2026 | Demo trước lớp/khách hàng |
| Sprint 2 | 10–23/11/2026 | Hợp đồng, phí, thông báo, dashboard |
| Sprint 3 | 24/11–07/12/2026 | Nhượng chỗ |
| Sprint 4 & bảo vệ | 08–21/12/2026 | UAT, tài liệu, demo cuối kỳ |

## 11. Rủi ro & biện pháp

| Rủi ro | Khả năng | Ảnh hưởng | Biện pháp |
|---|---|---|---|
| Khách hàng thay đổi yêu cầu giữa sprint | Trung bình | Cao | Chốt scope từng sprint, mọi thay đổi qua Product Backlog |
| Thành viên bận lịch học/thi | Cao | Trung bình | Chia task nhỏ, có người dự phòng, daily standup ngắn |
| Dữ liệu thật phức tạp hơn dữ liệu mẫu | Trung bình | Trung bình | Thiết kế schema linh hoạt, kiểm thử với dữ liệu biên |
| Xung đột code khi nhiều người sửa | Trung bình | Trung bình | Quy ước nhánh, review PR, merge thường xuyên |
| Demo lỗi do môi trường | Thấp | Cao | Chuẩn bị DB seed, kịch bản demo và phương án dự phòng |
| Ràng buộc giới tính tòa/phòng chưa được siết | Trung bình | Thấp | Ghi nhận cho Sprint 2, cảnh báo khi xếp sai |

## 12. Quản lý thay đổi

- Mọi yêu cầu mới được ghi vào Product Backlog, không tự ý thêm vào sprint đang chạy.
- Thay đổi ảnh hưởng scope/thời gian phải được PM và khách hàng thống nhất.
- Thay đổi nhỏ trong sprint được ghi chú và cập nhật tài liệu sau sprint.

## 13. Phê duyệt

| Bên | Họ tên | Vai trò | Ngày | Chữ ký |
|---|---|---|---|---|
| Khách hàng | Nguyễn Thị Quản Lý | Quản lý KTX | | |
| Project Manager | Phạm Mạnh Hùng | PM | 30/10/2026 | |
| BA | Hà Văn Hùng | Phân tích | 30/10/2026 | |
