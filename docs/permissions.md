# TÀI LIỆU MA TRẬN PHÂN QUYỀN (PERMISSION MATRIX) - CAMA WEDDING STUDIO

## 1. NGUYÊN TẮC CẤU TRÚC PHÂN QUYỀN
Hệ thống phân quyền được tính toán động như sau:

$$\text{Effective Permission} = \text{Role Default Permission} \oplus \text{User Custom Override}$$

- **Mã Module Độc Lập**: Phân quyền dựa trên `module_code` cố định (ví dụ: `MODULE_CONTRACTS`, `MODULE_WARDROBE`, `MODULE_EMPLOYEES`, `MODULE_ATTENDANCE`), không phụ thuộc tên hiển thị.
- **Cột Quyền**:
  - `can_view`: Xem danh sách và chi tiết module.
  - `can_create`: Thêm mới bản ghi.
  - `can_update`: Chỉnh sửa bản ghi hiện có.
  - `can_delete`: Xóa mềm hoặc chuyển trạng thái ngừng hoạt động.

---

## 2. MA TRẬN PHÂN QUYỀN MẶC ĐỊNH THEO VAI TRÒ (ROLE)

| Nhóm Module | Mã Module | ADMIN | MANAGER | STAFF (Kê toán/Sale/Kho/Ekip) |
| :--- | :--- | :---: | :---: | :---: |
| **Hợp Đồng & Công Việc** | `MODULE_CONTRACTS` | CRUD | CRUD | V, C (Sale/Lễ tân) |
| | `MODULE_UNPAID_CONTRACTS` | CRUD | V, U | V (Chỉ xem) |
| | `MODULE_PREPARE_GARMENTS` | CRUD | CRUD | V, U (Kho/Ekip) |
| | `MODULE_TASKS` | CRUD | CRUD | V, C, U (Công việc cá nhân) |
| **Kế Toán** | `MODULE_DAILY_EXPENSES` | CRUD | V, C, U | V, C (Nếu được gán) |
| | `MODULE_SALARY` | CRUD | V (Bộ phận HR) | ❌ Không xem |
| | `MODULE_ATTENDANCE_LOG` | CRUD | V, U | V (Xem chấm công cá nhân) |
| **Tư Vấn & Khách Hàng** | `MODULE_CUSTOMERS` | CRUD | CRUD | V, C, U |
| | `MODULE_APPOINTMENTS` | CRUD | CRUD | V, C, U |
| **Trang Phục & Kho** | `MODULE_GARMENTS_WARDROBE` | CRUD | CRUD | V, U (Soạn/Quét mã xuất trả) |
| | `MODULE_GARMENT_LAUNDRY` | CRUD | CRUD | V, U (Giặt/Sửa) |
| **Nhân Sự & Hệ Thống** | `MODULE_EMPLOYEES` | CRUD | V (Bộ phận) | ❌ Không xem |
| | `MODULE_PERMISSIONS` | CRUD | ❌ Không truy cập | ❌ Không truy cập |
| | `MODULE_AUDIT_LOGS` | CRUD | ❌ Không truy cập | ❌ Không truy cập |

*(Ghi chú: C = Create, R/V = View, U = Update, D = Delete)*

---

## 3. QUY TRÌNH KIỂM TRA QUYỀN PHÍA SERVER (SERVER-SIDE AUTHORIZATION)
```typescript
// Pseudo-code Server Action / API Route Authorization
export async function checkPermission(userId: string, moduleCode: string, action: 'can_view' | 'can_create' | 'can_update' | 'can_delete') {
  const profile = await getProfile(userId);
  if (profile.role.code === 'ADMIN') return true; // Admin luôn có toàn quyền

  // 1. Kiểm tra ghi đè cá nhân
  const override = await getUserOverride(userId, moduleCode);
  if (override && override[action] !== null) {
    return override[action];
  }

  // 2. Kiểm tra quyền mặc định vai trò
  const rolePerm = await getRolePermission(profile.role_id, moduleCode);
  return rolePerm ? rolePerm[action] : false;
}
```
