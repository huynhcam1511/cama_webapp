## Tóm tắt

- Thống nhất danh mục và khai báo tồn thành quy trình nhập sản phẩm hiện có.
- Giữ vị trí theo phiên để nhân viên nhập liên tục nhiều sản phẩm.
- Tối ưu giao diện điện thoại, hỗ trợ chụp trực tiếp hoặc chọn nhiều ảnh.
- Bổ sung phân loại chi tiết riêng cho nhóm Suit, bảng size/số lượng và nút lưu cố định.
- Bổ sung lịch sử nhập, storage ảnh riêng tư, schema và RLS cho dữ liệu tồn kho.

## Kiểm tra

- TypeScript: `tsc --noEmit` đạt.
- `git diff --cached --check` đạt trước commit.
- Đã rà soát commit không chứa chuỗi kết nối hay service key.

## Lưu ý triển khai

- Cần áp dụng các migration Supabase mới trước khi thử đầy đủ chức năng lưu dữ liệu và tải ảnh.
