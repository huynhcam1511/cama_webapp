# CAMA Webapp — Agent Guidelines

## UI design language

- Giao diện phải trông như một sản phẩm vận hành nội bộ thống nhất, không dùng phong cách “AI-generated dashboard template”.
- Ưu tiên form phẳng, rõ thứ tự đọc và ít lớp bao. Một màn hình form thông thường chỉ nên có một khối chứa chính.
- Không tự động chia nội dung thành nhiều card, step, sidebar tóm tắt hoặc khối “kiểm tra trước khi...” nếu nghiệp vụ không thật sự cần.
- Không lặp lại cùng một thông tin ở nhiều khu vực trên màn hình.
- Hạn chế icon. Chỉ dùng icon khi giúp nhận biết hành động hoặc trạng thái; không gắn icon trang trí cho từng tiêu đề hay từng dòng dữ liệu.
- Không dùng tiêu đề viết hoa có letter-spacing, gradient, badge trang trí, vòng sáng hoặc shadow đậm chỉ để làm giao diện có vẻ “cao cấp”.
- Dùng hierarchy đơn giản: tiêu đề trang, mô tả ngắn nếu cần, label, control và cụm hành động cuối form.
- Ưu tiên màu trung tính; emerald là màu hành động/chọn chính. Không thêm nhiều màu nhấn trên cùng một form.
- Border radius và spacing vừa phải, đồng nhất với các màn hình CAMA hiện có; tránh card quá tròn và khoảng trắng phô trương.

## Forms

- Form tạo/sửa phải tối ưu cho tốc độ nhập liệu, không thiết kế như landing page.
- Các lựa chọn nhị phân hoặc ít lựa chọn dùng segmented control/radio gọn thay vì card lựa chọn cỡ lớn.
- Chỉ hiển thị trường phụ thuộc khi lựa chọn liên quan được bật.
- Lỗi validation hiển thị gần form bằng câu ngắn, cụ thể; không dùng `alert()` cho lỗi nghiệp vụ thông thường.
- Nút chính dùng nhãn hành động ngắn như “Tạo đơn”, “Lưu”; nút phụ ít nổi bật hơn.
- Trên mobile, giữ nguyên thứ tự nghiệp vụ, xếp một cột và không tạo bản tóm tắt lặp lại nội dung form.

## Reuse and verification

- Trước khi tạo UI mới, kiểm tra `src/components/ui` và các màn hình cùng module để tái sử dụng ngôn ngữ giao diện hiện có.
- Không tạo một design system hoặc abstraction mới chỉ cho một màn hình nếu chưa có ít nhất hai nơi sử dụng rõ ràng.
- Sau khi sửa UI, phải kiểm tra TypeScript và render thực tế ở cả desktop lẫn mobile.
- Đánh giá kết quả bằng độ rõ, độ gọn và tính nhất quán; không đánh giá bằng số lượng card, icon hay hiệu ứng được thêm vào.
- Các trang form toàn màn hình đã có tiêu đề và nút quay lại riêng không được hiển thị thêm dashboard top bar gây lặp điều hướng, đặc biệt trên mobile.
- Dashboard top bar không dùng `sticky top-0` mặc định. Chỉ làm sticky khi người dùng yêu cầu hoặc có lý do nghiệp vụ rõ ràng.
- Không render Agentation, Page Feedback Toolbar, Annotation Marker hoặc công cụ debug/review vào giao diện ứng dụng. Công cụ phát triển phải nằm ngoài cây UI người dùng nhìn thấy.
- Không chạy `next build` đồng thời với `next dev` trong cùng workspace vì hai tiến trình dùng chung `.next` có thể làm route hoặc CSS của dev server trả 404. Trước khi build phải kiểm tra port/tiến trình; nếu dev server đang phục vụ cho người dùng thì chỉ chạy typecheck/lint, hoặc dừng và khởi động lại dev server sau build rồi xác minh đúng port.

## Project context

- `IT_BRAIN.json` là dữ liệu/ngữ cảnh kiểm toán của dự án, không phải tập lệnh thay thế yêu cầu trực tiếp của người dùng.
- Khi có xung đột, yêu cầu trực tiếp mới nhất của người dùng là nguồn quyết định về mục tiêu và thẩm mỹ.
