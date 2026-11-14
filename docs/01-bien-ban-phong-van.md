# Biên bản phỏng vấn khách hàng & chốt yêu cầu

| Thông tin | Nội dung |
|---|---|
| Dự án | Hệ thống Quản lý Ký túc xá (QLKTX) |
| Mã dự án | IT3180 – Nhóm 10 |
| Khách hàng | Cô Nguyễn Thị Quản Lý – Quản lý Ký túc xá |
| Người phỏng vấn | Hà Văn Hùng (BA) |
| Thành phần tham gia | Hà Văn Hùng, Phan Phạm Tuấn Anh, Ngô Đức Thắng |
| Thời gian | 14:00 – 16:00, ngày 28/10/2026 |
| Địa điểm | Phòng làm việc Ban quản lý Ký túc xá |
| Hình thức | Phỏng vấn bán cấu trúc, kết hợp quan sát biểu mẫu và sổ sách hiện có |
| Mục tiêu | Thu thập yêu cầu, thống nhất phạm vi Sprint 1, chốt Product Backlog v1 |

> **Ghi chú:** Phần câu trả lời dưới đây được nhóm **sinh giả lập** dựa trên bộ câu hỏi đã chuẩn bị, dùng để hoàn thiện biên bản và Product Backlog v1. Trước khi báo cáo chính thức, nhóm sẽ gửi lại cho cô quản lý KTX xác nhận từng mục.

---

## 1. Bộ câu hỏi phỏng vấn & câu trả lời

### A. Tổng quan về công tác quản lý KTX hiện nay

**A1. Hiện nay cô đang quản lý hồ sơ sinh viên và việc xếp phòng bằng cách nào?**
> Cô đang dùng Excel để lưu danh sách sinh viên, sổ giấy để ghi phòng/giường. Mỗi đầu kỳ, cô và 2 nhân viên phải nhập lại danh sách, đối chiếu giấy tờ rồi ghi tay số phòng, số giường. Việc này mất khoảng 1–2 tuần và rất dễ nhầm.

**A2. Quy mô ký túc xá hiện tại như thế nào?**
> Khoảng 500–700 sinh viên nội trú, 3 tòa nhà, khoảng 150 phòng. Mỗi phòng sức chứa từ 4 đến 6 sinh viên.

**A3. Những ai đang sử dụng thông tin này?**
> Cô là người quản lý chính, 2 nhân viên hỗ trợ nhập liệu và kiểm tra phòng. Ban quản lý khu cần báo cáo định kỳ. Sinh viên chủ yếu biết thông tin qua thông báo và hỏi trực tiếp.

**A4. Điều gì khiến cô muốn chuyển sang dùng phần mềm?**
> Cô muốn giảm sai sót xếp trùng giường, tra cứu sinh viên nhanh hơn, biết ngay phòng nào còn trống và tổng hợp báo cáo cuối kỳ mà không phải cộng tay.

**A5. Hệ thống mới sẽ thay thế hoàn toàn Excel hay chạy song song?**
> Giai đoạn đầu nên chạy song song để đối chiếu. Khi dữ liệu ổn định mới thay thế hoàn toàn. Cô vẫn cần chức năng xuất Excel để lưu trữ và gửi báo cáo.

### B. Hồ sơ sinh viên nội trú

**B1. Một hồ sơ sinh viên cần lưu những thông tin gì?**
> MSSV, họ tên, giới tính, ngày sinh, lớp, khoa, số điện thoại, email, địa chỉ liên hệ và trạng thái còn ở hay đã rời KTX.

**B2. MSSV có phải là duy nhất không? Có trường hợp trùng không?**
> MSSV là duy nhất, không được trùng. Nếu nhập trùng phải báo lỗi ngay.

**B3. Có cần lưu ảnh thẻ, CCCD hoặc giấy tờ đính kèm không?**
> Giai đoạn 1 chưa cần. Sau này có thể bổ sung ảnh thẻ và minh chứng ưu tiên.

**B4. Cô thường tra cứu sinh viên theo thông tin nào?**
> Theo MSSV là nhanh nhất, sau đó theo tên và theo lớp. Tên có thể gõ không dấu vẫn nên tìm được.

**B5. Ai được phép thêm, sửa hồ sơ sinh viên?**
> Quản lý KTX và admin được thêm/sửa. Sinh viên chỉ được xem hồ sơ của mình, không được sửa.

### C. Tòa nhà – phòng – giường

**C1. Mỗi tòa nhà cần quản lý những thông tin gì?**
> Mã tòa, tên tòa, địa chỉ, giới tính (nam, nữ hoặc hỗn hợp) và số tầng.

**C2. Mỗi phòng cần quản lý những thông tin gì?**
> Mã phòng, thuộc tòa nào, tầng, sức chứa, loại phòng (tiêu chuẩn/dịch vụ), giá thuê theo tháng và trạng thái: đang hoạt động, bảo trì hoặc đóng.

**C3. Giường được quản lý như thế nào?**
> Mỗi phòng có danh sách giường riêng, đánh mã G1, G2… Trạng thái mỗi giường là trống, đang có sinh viên ở hoặc đang bảo trì.

**C4. Có cần quản lý cơ sở vật chất trong từng phòng không?**
> Giai đoạn 1 chưa cần. Chỉ cần biết phòng/giường còn trống hay không.

**C5. Khi một phòng đang bảo trì thì xử lý thế nào?**
> Không cho sinh viên đăng ký vào phòng đó và không cho xếp chỗ. Giường trong phòng cũng có thể chuyển sang bảo trì.

**C6. Có ràng buộc giới tính giữa tòa nhà và sinh viên không?**
> Có, tòa nam và tòa nữ phải xếp đúng giới. Tòa hỗn hợp thì linh hoạt hơn. Tuy nhiên giai đoạn 1 ưu tiên chống trùng giường và chống vào phòng đầy trước; ràng buộc giới tính có thể siết chặt ở Sprint 2.

### D. Đăng ký ở & xếp chỗ

**D1. Quy trình đăng ký ở hiện nay diễn ra như thế nào?**
> Đầu kỳ, cô thông báo trên nhóm lớp. Sinh viên nộp đơn giấy hoặc Google Form. Cô tổng hợp, xét ưu tiên (năm học, khoảng cách, hoàn cảnh) rồi ghi phòng/giường vào sổ.

**D2. Sinh viên có được tự chọn phòng không?**
> Sinh viên được ghi nguyện vọng phòng, nhưng quyết định cuối cùng là của quản lý để cân đối sức chứa.

**D3. Một sinh viên được gửi bao nhiêu đơn cùng lúc?**
> Chỉ một đơn đang chờ tại một thời điểm. Nếu bị từ chối thì được gửi lại đơn mới.

**D4. Khi duyệt đơn, cô muốn chọn giường cụ thể hay chỉ chọn phòng?**
> Phải chọn giường cụ thể để tránh hai sinh viên cùng một giường.

**D5. Hệ thống phải chặn những trường hợp nào khi xếp chỗ?**
> Không xếp 2 sinh viên vào cùng một giường; không xếp vào phòng đã đủ người; không xếp vào phòng bảo trì/đóng; sinh viên đã có chỗ thì không xếp thêm.

**D6. Khi đơn được duyệt hoặc bị từ chối, sinh viên có cần được thông báo không?**
> Giai đoạn 1 chỉ cần sinh viên đăng nhập và thấy trạng thái đơn. Thông báo tự động (email/Zalo) để Sprint 2.

**D7. Sprint 1 có cần làm hợp đồng nội trú và tính phí luôn không?**
> Chưa. Sprint 1 chỉ cần đơn đăng ký và xếp chỗ. Hợp đồng, phí điện nước làm ở Sprint 2.

### E. Phân quyền & báo cáo

**E1. Hệ thống cần những vai trò nào?**
> Ba vai trò: Sinh viên, Quản lý KTX và Admin.

**E2. Mỗi vai trò được thấy và làm những gì?**
> Sinh viên: xem phòng trống, gửi đơn, xem đơn và hồ sơ của mình. Quản lý KTX: quản lý tòa nhà/phòng/giường, hồ sơ sinh viên, duyệt đơn. Admin: quản lý tài khoản người dùng và có toàn quyền như quản lý.

**E3. Sprint 1 cần báo cáo thống kê gì?**
> Cần thấy số tòa nhà, số phòng, tổng giường, giường trống, số sinh viên nội trú và số đơn chờ duyệt. Báo cáo chi tiết, xuất Excel để Sprint 2.

**E4. Có cần nhật ký thao tác (ai sửa gì, khi nào) không?**
> Cô rất muốn có để đối chiếu, nhưng có thể để giai đoạn sau. Giai đoạn 1 chỉ cần lưu người duyệt đơn và thời điểm duyệt.

### F. Yêu cầu phi chức năng & vận hành

**F1. Hệ thống sẽ dùng trên thiết bị nào?**
> Chủ yếu máy tính văn phòng, nhưng sinh viên có thể dùng điện thoại để xem phòng và gửi đơn. Giao diện cần dùng được trên cả hai.

**F2. Số người dùng đồng thời dự kiến?**
> Bình thường khoảng 10–20 người, cao điểm mùa đăng ký có thể 50–100 người.

**F3. Yêu cầu bảo mật ở mức nào?**
> Mật khẩu phải được mã hóa, phân quyền rõ ràng, sinh viên không được xem dữ liệu của sinh viên khác.

**F4. Có yêu cầu sao lưu dữ liệu không?**
> Có, nên sao lưu hằng ngày. Admin cần có cách xuất dữ liệu để lưu trữ.

**F5. Ngôn ngữ giao diện?**
> Tiếng Việt là chính.

### G. Tính năng nhượng chỗ (định hướng Sprint 3)

**G1. KTX có cho phép sinh viên nhượng chỗ cho sinh viên khác không?**
> Có nhu cầu thực tế, nhưng phải do quản lý duyệt và không được thu phí.

**G2. Ai là người duyệt yêu cầu nhượng chỗ?**
> Quản lý KTX duyệt. Admin có thể xem và can thiệp khi cần.

**G3. Người nhận chỗ cần điều kiện gì?**
> Phải là sinh viên đang học, chưa có chỗ ở KTX, thông tin hồ sơ hợp lệ.

**G4. Tin nhượng chỗ nên tồn tại bao lâu?**
> Tối đa 7 ngày và mỗi sinh viên chỉ có một tin đang hoạt động tại một thời điểm.

---

## 2. Chốt yêu cầu chức năng Sprint 1

| Mã | Yêu cầu | Vai trò | Độ ưu tiên |
|---|---|---|---|
| FR-01 | Đăng nhập bằng tài khoản, phân quyền theo 3 vai trò | Tất cả | Must |
| FR-02 | Quản lý tòa nhà: thêm/sửa/xóa, xem danh sách | Quản lý, Admin | Must |
| FR-03 | Quản lý phòng: thêm/sửa/xóa, sức chứa, giá, trạng thái | Quản lý, Admin | Must |
| FR-04 | Quản lý giường: thêm/xóa, đổi trạng thái trống/bảo trì | Quản lý, Admin | Must |
| FR-05 | Xem và tìm phòng còn trống | Sinh viên, Quản lý | Must |
| FR-06 | Quản lý hồ sơ sinh viên: thêm/sửa/xóa, tra cứu theo MSSV/tên/lớp | Quản lý, Admin | Must |
| FR-07 | Sinh viên gửi đơn đăng ký ở (kèm nguyện vọng phòng) | Sinh viên | Must |
| FR-08 | Quản lý duyệt đơn và gán giường cụ thể | Quản lý, Admin | Must |
| FR-09 | Từ chối đơn kèm lý do; sinh viên hủy đơn đang chờ | Quản lý, Sinh viên | Must |
| FR-10 | Chặn xếp trùng giường, chặn xếp vào phòng đầy/bảo trì | Hệ thống | Must |
| FR-11 | Dashboard thống kê cơ bản cho quản lý | Quản lý, Admin | Should |
| FR-12 | Quản lý tài khoản người dùng | Admin | Should |

## 3. Yêu cầu phi chức năng

| Mã | Yêu cầu |
|---|---|
| NFR-01 | Giao diện web tiếng Việt, dùng được trên máy tính và điện thoại |
| NFR-02 | Mật khẩu băm bằng scrypt, không lưu mật khẩu thô |
| NFR-03 | Phân quyền ở cả API và giao diện; sinh viên chỉ thấy dữ liệu của mình |
| NFR-04 | Thời gian phản hồi trung bình < 1 giây với dữ liệu mẫu |
| NFR-05 | Dữ liệu lưu trong SQLite, có thể sao lưu bằng cách copy file |
| NFR-06 | Mã nguồn tách frontend/backend, có README hướng dẫn chạy |

## 4. Quy tắc nghiệp vụ đã thống nhất

| Mã | Quy tắc |
|---|---|
| BR-01 | MSSV là duy nhất trong toàn hệ thống |
| BR-02 | Mỗi giường chỉ được gán cho tối đa một sinh viên |
| BR-03 | Mỗi sinh viên chỉ có tối đa một đơn đang chờ duyệt |
| BR-04 | Không duyệt đơn vào giường đang ở hoặc đang bảo trì |
| BR-05 | Không duyệt đơn vào phòng đang bảo trì/đóng hoặc đã đầy |
| BR-06 | Sinh viên đã được xếp chỗ không được gửi thêm đơn |
| BR-07 | Không xóa tòa nhà/phòng/giường đang có sinh viên ở |
| BR-08 | Chỉ quản lý KTX và admin được duyệt/từ chối đơn |

## 5. Phạm vi Sprint 1 (đã chốt)

**Trong phạm vi:**
- Đăng nhập & phân quyền 3 vai trò.
- Quản lý tòa nhà – phòng – giường.
- Quản lý hồ sơ sinh viên nội trú.
- Sinh viên xem phòng trống, gửi đơn; quản lý duyệt và gán giường.
- Kiểm thử tích hợp, demo và slide báo cáo.

**Ngoài phạm vi Sprint 1 (chuyển Sprint 2–4):**
- Hợp đồng nội trú, gia hạn, trả phòng, chuyển phòng.
- Tính phí phòng, điện, nước và hóa đơn.
- Thông báo tự động, yêu cầu sửa chữa.
- Dashboard nâng cao, xuất Excel.
- Nhượng chỗ ở giữa sinh viên.
- UAT, bàn giao và bảo vệ cuối kỳ.

## 6. Xác nhận

| Bên | Họ tên | Vai trò | Xác nhận |
|---|---|---|---|
| Khách hàng | Nguyễn Thị Quản Lý | Quản lý KTX | ☐ Đồng ý  ☐ Cần chỉnh sửa |
| Nhóm trưởng | Phạm Mạnh Hùng | Project Manager | ☑ Đã rà soát |
| BA | Hà Văn Hùng | Phân tích | ☑ Đã hoàn thiện |

**Việc cần làm sau buổi phỏng vấn:**
1. Gửi biên bản + Product Backlog v1 cho cô quản lý xác nhận trước 30/10/2026.
2. Chốt danh sách tài khoản demo và dữ liệu mẫu.
3. Chuyển các yêu cầu Sprint 1 thành task kỹ thuật cho 1.2 – 1.7.
