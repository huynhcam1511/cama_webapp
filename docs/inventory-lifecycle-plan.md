# Kế hoạch hoàn thiện vòng đời Kho CAMA

## Mục tiêu

Thống nhất một luồng dữ liệu cho nhập kho, tồn kho, cho thuê, bán, xuất kho, hoàn trả, QC và thanh lý.

## Hiện trạng đã hoàn thành

- Khai báo mẫu sản phẩm và từng món vật lý theo size/số lượng.
- Chụp hoặc tải ảnh sản phẩm và ảnh mác.
- Vị trí kho được giữ xuyên suốt một phiên nhập.
- Có lịch sử khai báo nhập kho.
- Supabase đã có schema nhập kho, bucket ảnh và RLS theo ma trận phân quyền.

## Việc cần làm tiếp theo

1. Dùng duy nhất `garment_models` và `garments_inventory`; loại bỏ luồng `inventory_items`.
2. Tạo bảng liên kết món hàng với hợp đồng/đơn, không lưu quan hệ kho trong JSON.
3. Tạo nhật ký `inventory_movements` ghi ai thao tác, thời gian, trạng thái cũ/mới và chứng từ liên quan.
4. Chuẩn hóa vòng đời cho thuê:
   `AVAILABLE → RESERVED → PREPARING → OUT_RENTAL → RETURN_QC → CLEANING/REPAIR → AVAILABLE`.
5. Chuẩn hóa vòng đời bán:
   `AVAILABLE → RESERVED_SALE → SOLD`; hàng bán không quay lại tồn.
6. Chuẩn hóa thanh lý/mất/hỏng:
   `LIQUIDATED`, `LOST`, `DAMAGED` và không tính là tồn khả dụng.
7. Làm module “Xuất kho & Thanh lý” thật, có quét/chọn món, xác nhận và lịch sử.
8. Nối trạng thái hợp đồng và đơn vận hành với trạng thái kho; trả đồ phải qua QC trước khi khả dụng lại.
9. Sửa dashboard tồn kho để tách: tồn vật lý, khả dụng, đã giữ, đang cho thuê, QC/giặt/sửa, đã bán/thanh lý.
10. Kiểm thử xuyên suốt cả hai kịch bản: cho thuê rồi trả và bán đứt.

## Thứ tự triển khai đề xuất

- Giai đoạn 1: Schema liên kết + movement ledger + migration dữ liệu.
- Giai đoạn 2: Giữ chỗ và xuất cho thuê/bán.
- Giai đoạn 3: Hoàn trả, QC, giặt/sửa và nhập lại khả dụng.
- Giai đoạn 4: Màn hình Xuất kho & Thanh lý và dashboard tồn.
- Giai đoạn 5: Kiểm thử, phân quyền, rollout Firebase và xác minh production.

## Câu lệnh tiếp tục

Ngày mai yêu cầu: **“Đọc `docs/inventory-lifecycle-plan.md` và tiếp tục Giai đoạn 1.”**
