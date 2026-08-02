-- Thêm khóa ngoại cho customer_id trong bảng operation_schedules

ALTER TABLE public.operation_schedules
ADD CONSTRAINT fk_operation_schedules_customer
FOREIGN KEY (customer_id) 
REFERENCES public.customers (id)
ON DELETE SET NULL;
