# Product Backlog v1

| Thông tin | Nội dung |
|---|---|
| Dự án | Hệ thống Quản lý Ký túc xá (QLKTX) |
| Phiên bản | v1.0 – chốt ngày 30/10/2026 |
| Người lập | Hà Văn Hùng (BA) |
| Người duyệt | Phạm Mạnh Hùng (PM) – chờ khách hàng xác nhận |
| Tổng story point Sprint 1 | **34 SP** |

## 1. Quy ước

- **Priority (MoSCoW):** Must / Should / Could / Won't (trong sprint hiện tại).
- **Story point:** dùng dãy Fibonacci (1, 2, 3, 5, 8, 13).
- **Trạng thái:** Not Started / In Progress / Done.
- **WBS:** mã công việc tương ứng trong file kế hoạch Agile của nhóm.

## 2. Tổng quan Epic

| Epic | Tên | Mục tiêu | Sprint |
|---|---|---|---|
| E1 | Nền tảng & tài khoản | Đăng nhập, phân quyền, layout chung | Sprint 1 |
| E2 | Quản lý cơ sở vật chất | Tòa nhà, phòng, giường, phòng trống | Sprint 1 |
| E3 | Hồ sơ sinh viên nội trú | Thêm/sửa/tra cứu sinh viên | Sprint 1 |
| E4 | Đăng ký ở & xếp chỗ | Gửi đơn, duyệt, gán giường | Sprint 1 |
| E5 | Hợp đồng & phí | Gia hạn, trả phòng, hóa đơn | Sprint 2 |
| E6 | Thông báo & sửa chữa | Thông báo, yêu cầu sửa chữa | Sprint 2 |
| E7 | Báo cáo & dashboard | Thống kê, xuất Excel | Sprint 2 |
| E8 | Nhượng chỗ ở | Đăng tin, nhận chỗ, duyệt | Sprint 3 |
| E9 | UAT & bàn giao | Kiểm thử người dùng, tài liệu | Sprint 4 |

## 3. Product Backlog Sprint 1 (chi tiết)

| ID | Epic | Hạng mục / User story | Actor | Priority | SP | WBS | Acceptance criteria |
|---|---|---|---|---|---|---|---|
| PB-01 | E1 | **Khảo sát yêu cầu & chốt Product Backlog**: phỏng vấn cô quản lý KTX, tổng hợp yêu cầu, viết Scope Statement | BA, PM | Must | 3 | 1.1 | Có biên bản phỏng vấn + Product Backlog v1 + Scope Statement được khách hàng xác nhận |
| PB-02 | E1 | **Thiết kế CSDL & kiến trúc, dựng repo**: Use case, ERD, schema, khung frontend/backend | Nhóm | Must | 5 | 1.2 | Use case + ERD + schema CSDL thống nhất; cả nhóm clone và chạy được project khung |
| PB-03 | E1 | **Wireframe & giao diện chung**: layout, sidebar, menu theo vai trò, trang chủ | Designer | Must | 5 | 1.3 | Wireframe được nhóm và khách hàng duyệt; layout dùng chung sẵn cho các màn hình |
| PB-04 | E1 | **Đăng nhập & phân quyền**: 3 vai trò Sinh viên / Quản lý / Admin; ẩn/hiện menu và API theo quyền | Tất cả | Must | 5 | 1.4 | 3 vai trò đăng nhập được và chỉ thấy đúng chức năng của mình |
| PB-05 | E2 | **Quản lý tòa nhà – phòng – giường**: CRUD tòa nhà, phòng, giường; xem/tìm phòng trống | Quản lý, Admin | Must | 5 | 1.5 | Thêm/sửa/xóa phòng, giường; xem và tìm được phòng trống |
| PB-06 | E3 | **Quản lý hồ sơ sinh viên nội trú**: thêm/sửa/xóa, tra cứu theo MSSV, tên, lớp | Quản lý, Admin | Must | 3 | 1.6 | Thêm/sửa/tra cứu sinh viên theo MSSV, tên, lớp |
| PB-07 | E4 | **Đăng ký ở & xếp chỗ**: sinh viên xem phòng trống, gửi đơn; quản lý duyệt và gán giường | Sinh viên, Quản lý | Must | 5 | 1.7 | SV gửi đơn, quản lý duyệt và gán giường; không xếp trùng hoặc vào phòng đầy |
| PB-08 | E1–E4 | **Kiểm thử tích hợp, demo & slide**: test end-to-end, sửa lỗi, kịch bản demo, slide báo cáo | Nhóm | Must | 3 | 1.8 | Chạy trọn luồng demo không lỗi nghiêm trọng; slide sẵn cho báo cáo 10/11 |
| | | **Tổng Sprint 1** | | | **34** | | |

### Chi tiết user story Sprint 1

#### PB-04 – Đăng nhập & phân quyền (5 SP)

> Là một người dùng, tôi muốn đăng nhập bằng tài khoản được cấp để sử dụng hệ thống theo đúng vai trò của mình.

**Acceptance criteria**
- [x] Đăng nhập đúng tài khoản/mật khẩu trả về token và thông tin người dùng.
- [x] Sai mật khẩu trả lỗi 401, không tiết lộ tài khoản có tồn tại hay không.
- [x] Sinh viên chỉ thấy menu: Trang chủ, Phòng trống, Đơn đăng ký, Hồ sơ.
- [x] Quản lý thấy menu nghiệp vụ: Tòa nhà, Phòng & giường, Sinh viên, Đơn đăng ký.
- [x] Admin thấy thêm menu Người dùng.
- [x] Gọi API trái quyền trả 403.

#### PB-05 – Quản lý tòa nhà, phòng, giường (5 SP)

> Là quản lý KTX, tôi muốn quản lý tòa nhà/phòng/giường để biết chính xác chỗ nào còn trống.

**Acceptance criteria**
- [x] Thêm/sửa/xóa tòa nhà; mã tòa không trùng.
- [x] Thêm/sửa/xóa phòng; mã phòng không trùng trong cùng tòa; sức chứa >= số giường hiện có.
- [x] Thêm/xóa giường; không vượt sức chứa; không xóa giường đang có người ở.
- [x] Danh sách phòng hiển thị sức chứa, số đã ở, số còn trống.
- [x] Lọc/tìm được phòng còn trống theo tòa và từ khóa.

#### PB-06 – Quản lý hồ sơ sinh viên (3 SP)

> Là quản lý KTX, tôi muốn quản lý hồ sơ sinh viên nội trú để tra cứu và đối chiếu thông tin.

**Acceptance criteria**
- [x] Thêm/sửa sinh viên với MSSV, họ tên, giới tính, ngày sinh, lớp, khoa, liên hệ, trạng thái.
- [x] MSSV duy nhất; nhập trùng báo lỗi.
- [x] Tra cứu theo MSSV, họ tên hoặc lớp.
- [x] Hiển thị phòng/giường hiện tại nếu sinh viên đang nội trú.
- [x] Không xóa sinh viên đang nội trú.

#### PB-07 – Đăng ký ở & xếp chỗ (5 SP)

> Là sinh viên, tôi muốn gửi đơn đăng ký ở KTX; là quản lý, tôi muốn duyệt đơn và gán giường chính xác.

**Acceptance criteria**
- [x] Sinh viên xem được danh sách phòng còn trống.
- [x] Sinh viên gửi đơn kèm nguyện vọng phòng và ghi chú.
- [x] Mỗi sinh viên chỉ có một đơn đang chờ.
- [x] Quản lý duyệt đơn bằng cách chọn phòng và giường còn trống.
- [x] Hệ thống chặn xếp trùng giường, chặn phòng đầy/bảo trì.
- [x] Sinh viên thấy trạng thái đơn và phòng/giường sau khi được duyệt.
- [x] Quản lý từ chối đơn kèm lý do; sinh viên hủy được đơn đang chờ.

## 4. Product Backlog các Sprint tiếp theo (mức Epic)

| ID | Sprint | Hạng mục | Priority | SP | Phụ thuộc |
|---|---|---|---|---|---|
| PB-09 | Sprint 2 | Chốt quy tắc nghiệp vụ nhượng chỗ với khách hàng | Must | 2 | PB-01 |
| PB-10 | Sprint 2 | Thiết kế chi tiết module nhượng chỗ (luồng trạng thái, ERD bổ sung) | Must | 3 | PB-09 |
| PB-11 | Sprint 2 | Hợp đồng nội trú: gia hạn, trả phòng, chuyển phòng | Must | 5 | PB-07 |
| PB-12 | Sprint 2 | Tính phí & hóa đơn (phòng, điện, nước) | Must | 8 | PB-11 |
| PB-13 | Sprint 2 | Thông báo & yêu cầu sửa chữa | Should | 5 | PB-04 |
| PB-14 | Sprint 2 | Dashboard thống kê & xuất Excel | Should | 5 | PB-11, PB-12 |
| PB-15 | Sprint 2 | Kiểm thử, sửa lỗi Sprint 2 | Must | 3 | PB-09…PB-14 |
| PB-16 | Sprint 3 | Đăng tin nhượng chỗ & gửi yêu cầu nhận chỗ | Must | TBD | PB-10 |
| PB-17 | Sprint 3 | Quản lý duyệt, tự động cập nhật hợp đồng/giường, lưu lịch sử | Must | TBD | PB-16 |
| PB-18 | Sprint 3 | Kiểm soát nghiệp vụ & thông báo cho hai bên | Must | TBD | PB-17 |
| PB-19 | Sprint 3 | Kiểm thử, báo cáo Sprint 3 | Must | TBD | PB-16…PB-18 |
| PB-20 | Sprint 4 | UAT với cô quản lý KTX, sửa lỗi, rà soát bảo mật | Must | TBD | PB-19 |
| PB-21 | Sprint 4 | Tài liệu hướng dẫn sử dụng & báo cáo dự án | Must | TBD | PB-20 |
| PB-22 | Sprint 4 | Chuẩn bị demo và bảo vệ cuối kỳ | Must | TBD | PB-21 |

## 5. Definition of Ready (DoR)

Một hạng mục chỉ được đưa vào Sprint khi:
1. Có user story rõ ràng và acceptance criteria kiểm thử được.
2. Đã ước lượng story point.
3. Xác định được phụ thuộc và người phụ trách.
4. Có wireframe hoặc mô tả giao diện tương ứng.
5. Không còn câu hỏi nghiệp vụ chưa chốt với khách hàng.

## 6. Definition of Done (DoD)

Một hạng mục được coi là Done khi:
1. Code đã merge vào nhánh chính và build thành công.
2. API + giao diện hoạt động đúng acceptance criteria.
3. Kiểm thử tích hợp pass; không còn lỗi nghiêm trọng.
4. Đã cập nhật tài liệu/README nếu có thay đổi.
5. Demo được trước nhóm và khách hàng.
6. Không phá vỡ chức năng của các hạng mục trước.

## 7. Tổng hợp ước lượng

| Sprint | Số hạng mục | Story point | Thời gian |
|---|---|---|---|
| Sprint 1 | 8 | 34 | 27/10 – 09/11/2026 |
| Sprint 2 | 7 | 31 | 10/11 – 23/11/2026 |
| Sprint 3 | 4 | TBD | 24/11 – 07/12/2026 |
| Sprint 4 | 4 | TBD | 08/12 – 21/12/2026 |

> Ghi chú: Sprint 3 và Sprint 4 sẽ được ước lượng chi tiết tại Sprint Planning tương ứng, sau khi chốt quy tắc nhượng chỗ với khách hàng.
