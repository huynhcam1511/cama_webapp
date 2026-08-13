-- Cập nhật bảng modules
UPDATE public.modules 
SET module_code = 'CUSTOMER_JOURNEY', 
    module_name = 'Hành trình khách hàng', 
    route = '/dashboard/customer-journey' 
WHERE module_code = 'CUSTOMER_SERVICE';

-- Cập nhật bảng user_permissions nếu đang lưu CUSTOMER_SERVICE
UPDATE public.user_permissions
SET module_code = 'CUSTOMER_JOURNEY'
WHERE module_code = 'CUSTOMER_SERVICE';
