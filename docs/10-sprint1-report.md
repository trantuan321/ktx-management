# Báo cáo Sprint 1

| Thông tin | Nội dung |
|---|---|
| Dự án | Hệ thống Quản lý Ký túc xá (QLKTX) – Nhóm 10 |
| Sprint | Sprint 1 – Nền tảng & luồng đăng ký ở cơ bản |
| Thời gian | 27/10/2026 – 09/11/2026 (13 ngày) |
| Sprint Goal | Demo được luồng: Đăng nhập → quản lý phòng/sinh viên → đăng ký ở |
| Người báo cáo | Phạm Mạnh Hùng (PM) |
| Buổi review | 10/11/2026 |
| Kết quả | **Hoàn thành 8/8 hạng mục · 34/34 story point** |

## 1. Tóm tắt điều hành

Sprint 1 đã hoàn thành toàn bộ 8 hạng mục theo kế hoạch Agile của nhóm. Nhóm đã khảo sát yêu cầu, chốt Product Backlog v1 và Scope Statement; thiết kế Use case, ERD, schema CSDL và kiến trúc; dựng repo chạy được; hoàn thiện wireframe và layout dùng chung; xây dựng chức năng đăng nhập/phân quyền 3 vai trò, quản lý tòa nhà – phòng – giường, hồ sơ sinh viên, và luồng đăng ký ở & xếp chỗ có chặn xếp trùng. Bộ kiểm thử tích hợp **6/6 pass**, giao diện build thành công, luồng demo chạy trọn vẹn.

## 2. Kết quả theo từng hạng mục

| WBS | Hạng mục | SP | Kết quả | Bằng chứng |
|---|---|---|---|---|
| 1.1 | Khảo sát yêu cầu, Product Backlog v1, Scope Statement | 3 | ✅ Done | `docs/01`, `docs/02`, `docs/03` |
| 1.2 | Thiết kế CSDL & kiến trúc, dựng repo | 5 | ✅ Done | `docs/04`, `docs/05`, `docs/06`, repo chạy được |
| 1.3 | Wireframe & giao diện chung (layout, menu vai trò) | 5 | ✅ Done | `docs/07`, `docs/wireframes/index.html`, `client/src/components/Layout.jsx` |
| 1.4 | Đăng nhập & phân quyền 3 vai trò | 5 | ✅ Done | Test 1–2, `Login.jsx`, `middleware.js` |
| 1.5 | Quản lý tòa nhà – phòng – giường | 5 | ✅ Done | Test 3, `Buildings.jsx`, `Rooms.jsx` |
| 1.6 | Quản lý hồ sơ sinh viên nội trú | 3 | ✅ Done | Test 4, `Students.jsx` |
| 1.7 | Đăng ký ở & xếp chỗ (chống trùng/phòng đầy) | 5 | ✅ Done | Test 5, `Applications.jsx`, transaction |
| 1.8 | Kiểm thử tích hợp, demo & slide | 3 | ✅ Done | `docs/08`, `docs/09`, `docs/slides/sprint1.html`, 6/6 pass |
| | **Tổng** | **34** | **100%** | |

## 3. Chỉ số Sprint

| Chỉ số | Kế hoạch | Thực tế |
|---|---|---|
| Story point hoàn thành | 34 | 34 (100%) |
| Hạng mục hoàn thành | 8 | 8 (100%) |
| Test tích hợp | ≥ 6 | 6/6 pass |
| Bug Critical/Major mở | 0 | 0 |
| Checklist giao diện | 18 mục | 18/18 pass |
| Thời gian chạy test | — | ~1,7 giây |
| Build frontend | Thành công | Thành công (236 kB JS, 15 kB CSS) |

## 4. Những gì đã hoạt động tốt

1. **Chốt phạm vi sớm.** Biên bản phỏng vấn + Product Backlog v1 giúp nhóm không bị kéo scope ra ngoài Sprint 1.
2. **Thiết kế CSDL trước khi code.** ERD và schema thống nhất giúp backend/frontend làm song song, ít phải sửa cấu trúc.
3. **Layout dùng chung.** Một `Layout.jsx` + `styles.css` giúp 9 màn hình đồng bộ giao diện và giảm code lặp.
4. **Kiểm thử tích hợp sớm.** Bộ test viết bằng `node --test` chạy nhanh, phát hiện ngay lỗi logic duyệt đơn.
5. **Chống xếp trùng chắc chắn.** Transaction `BEGIN IMMEDIATE` kết hợp unique index xử lý cả trường hợp duyệt đồng thời.
6. **Dữ liệu mẫu sẵn sàng.** `npm run seed` tạo lại môi trường demo trong vài giây.

## 5. Khó khăn & cách xử lý

| Khó khăn | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Node 24 không nhận `node --test test/` | Test không chạy | Đổi sang `node --test` (tự tìm file) |
| Seed dùng biểu thức SQL dưới dạng chuỗi | Ngày tạo sai | Thêm hàm `daysAgo()` tính trong JS |
| Chưa cài openpyxl để đọc file kế hoạch | Mất thời gian đầu | Cài bổ sung, đọc Excel bằng script Python |
| Ràng buộc giới tính tòa/phòng chưa siết | Chưa đúng nghiệp vụ hoàn chỉnh | Ghi nhận, đưa vào Sprint 2 |
| Nhiều thành viên bận lịch học | Tiến độ có lúc chậm | Chia task nhỏ, ưu tiên luồng cốt lõi trước |

## 6. Bài học kinh nghiệm

1. **Viết acceptance criteria kiểm thử được** ngay từ đầu giúp việc viết test nhanh và không bỏ sót.
2. **Dùng transaction cho nghiệp vụ có tranh chấp** (xếp giường) là bắt buộc, không chỉ dựa vào kiểm tra ở tầng ứng dụng.
3. **Tách lớp serializer** giúp API trả về `camelCase` thống nhất, frontend không phải xử lý `snake_case`.
4. **Chuẩn bị dữ liệu seed và kịch bản demo sớm** giúp buổi demo tự tin, giảm rủi ro môi trường.
5. **Tài liệu hóa song song với code** tránh việc cuối sprint phải viết lại từ đầu.

## 7. Rủi ro còn lại

| Rủi ro | Mức độ | Biện pháp Sprint 2 |
|---|---|---|
| Chưa có ràng buộc giới tính khi xếp chỗ | Trung bình | Bổ sung kiểm tra tòa nam/nữ khi duyệt đơn |
| Chưa có hợp đồng/phí nên chưa quản lý được vòng đời nội trú | Trung bình | Ưu tiên PB-11, PB-12 trong Sprint 2 |
| Dữ liệu thật lớn hơn dữ liệu mẫu | Thấp | Kiểm thử với 500–1.000 hồ sơ, thêm index nếu cần |
| Chưa có audit log | Thấp | Ghi nhận cho Sprint 4 |
| Chưa deploy lên máy chủ thật | Thấp | Chuẩn bị hướng dẫn deploy trong Sprint 4 |

## 8. Kế hoạch Sprint 2 (10/11 – 23/11/2026)

| Hạng mục | Story point | Phụ trách |
|---|---|---|
| Chốt quy tắc nghiệp vụ nhượng chỗ với khách hàng | 2 | BA + PM |
| Thiết kế chi tiết module nhượng chỗ | 3 | Kiến trúc |
| Hợp đồng nội trú: gia hạn, trả phòng, chuyển phòng | 5 | Backend |
| Tính phí & hóa đơn (phòng, điện, nước) | 8 | Backend |
| Thông báo & yêu cầu sửa chữa | 5 | Backend + UI |
| Dashboard thống kê & xuất Excel | 5 | Fullstack |
| Kiểm thử, sửa lỗi Sprint 2 | 3 | Kiểm thử |
| **Tổng** | **31** | |

## 9. Phân công & đóng góp

| Thành viên | Vai trò | Đóng góp chính trong Sprint 1 |
|---|---|---|
| Phạm Mạnh Hùng | Project Manager / Kiểm thử | Điều phối, kế hoạch, test plan, demo, slide, báo cáo |
| Hà Văn Hùng | BA | Phỏng vấn, biên bản, Product Backlog, Scope Statement |
| Phan Phạm Tuấn Anh | Kiến trúc & CSDL | Use case, ERD, schema, kiến trúc, dựng repo |
| Ngô Đức Thắng | UI/UX | Wireframe, layout, design system |
| Lê Vĩnh Quốc | Fullstack | Đăng nhập, phân quyền, layout, dashboard |
| Nguyễn Trọng Đăng | Backend | Tòa nhà, phòng, giường |
| Đặng Minh Cường | Backend | Hồ sơ sinh viên, tra cứu |
| Trần Xuân Trọng | Backend | Đăng ký ở, duyệt đơn, xếp chỗ, chống trùng |

## 10. Kết luận

Sprint 1 đạt 100% mục tiêu đề ra. Hệ thống đã có nền tảng kỹ thuật ổn định, luồng nghiệp vụ cốt lõi chạy được và bộ kiểm thử tự động bảo vệ các chức năng chính. Nhóm sẵn sàng bước vào Sprint 2 với trọng tâm là hợp đồng, phí và hoàn thiện nghiệp vụ nhượng chỗ.

**Tài liệu tham chiếu**

- [Biên bản phỏng vấn](01-bien-ban-phong-van.md)
- [Product Backlog v1](02-product-backlog.md)
- [Scope Statement](03-scope-statement.md)
- [Use Case](04-use-case.md)
- [ERD](05-erd.md)
- [Kiến trúc & API](06-kien-truc.md)
- [Wireframe](07-wireframe.md) · [Bản xem trực quan](wireframes/index.html)
- [Kế hoạch kiểm thử](08-test-plan.md)
- [Kịch bản demo](09-demo-script.md)
- [Slide báo cáo](slides/sprint1.html)
