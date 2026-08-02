# KẾ HOẠCH CHUYỂN ĐỔI DỮ LIỆU TỪ APPSHEET / GOOGLE SHEETS SANG SUPABASE

## 1. NGUYÊN TẮC AN TOÀN DỮ LIỆU
- **TÍNH NGUYÊN VẸN**: Tuyệt đối **KHÔNG SỬA, KHÔNG XÓA, KHÔNG GHI ĐÈ** lên file Google Sheets / AppSheet gốc.
- Dữ liệu cũ chỉ dùng làm nguồn tham khảo quy trình nghiệp vụ và trích xuất dữ liệu mẫu sang Supabase.

---

## 2. QUY TRÌNH CHUYỂN ĐỔI 8 BƯỚC

```
[Google Sheets Gốc] ──1. Sao lưu──> [File Backup CSV/Excel] ──2. Chuyển đổi Schema──> [Bảng Ánh Xạ]
                                                                                               │
[Supabase Production] <──4. Import Prod ── [Kiểm Thử Staging] <──3. Migration Script ──────────┘
```

1. **Bước 1: Sao lưu**: Xuất toàn bộ các Sheet hiện tại (`NHAN_VIEN`, `KHACH_HANG`, `HOP_DONG`, `BANG_GIA_DICH_VU`, `DANH_MUC_KHO`, `XUAT_NHAP_KHO`,...) ra các file CSV tĩnh.
2. **Bước 2: Lập Bảng Ánh Xạ (Mapping Table)**:
   - Cột tiếng Việt cũ -> Cột tiếng Anh PostgreSQL mới (`Mã NV` -> `employee_code`, `Họ tên` -> `full_name`, `Số ĐT` -> `phone`).
3. **Bước 3: Chuẩn hóa dữ liệu**:
   - Xử lý định dạng ngày tháng (DD/MM/YYYY -> ISO YYYY-MM-DD).
   - Xử lý số điện thoại chuẩn hóa về định dạng 10 chữ số.
   - Xử lý các liên kết UUID/ID giữa các bảng.
4. **Bước 4: Kiểm tra tính hợp lệ (Data Validation)**:
   - Quét mã trùng, email trùng, dữ liệu thiếu khóa ngoại.
5. **Bước 5: Import vào môi trường Staging**: Chạy script nạp dữ liệu thử nghiệm.
6. **Bước 6: Đối soát số liệu**: Xuất báo cáo tổng số bản ghi và tổng tiền trước/sau import.
7. **Bước 7: Nghiệm thu**: Admin/Manager kiểm tra tính chính xác của dữ liệu trên Web App.
8. **Bước 8: Import vào Production**: Đưa hệ thống vào hoạt động chính thức.
