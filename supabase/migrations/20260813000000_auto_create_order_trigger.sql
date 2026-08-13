CREATE OR REPLACE FUNCTION auto_create_order_from_contract()
RETURNS TRIGGER AS $$
DECLARE
  v_wedding_date TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NEW.status NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED') THEN
    IF NOT EXISTS (SELECT 1 FROM orders WHERE contract_id = NEW.id) THEN
      
      SELECT wedding_date INTO v_wedding_date FROM customers WHERE id = NEW.customer_id;
      
      INSERT INTO orders (
        order_code,
        contract_id,
        service_type,
        event_date,
        completion_status
      ) VALUES (
        'ORD-' || floor(random() * 900000 + 100000)::text,
        NEW.id,
        'Tự động từ HĐ',
        COALESCE(v_wedding_date, CURRENT_TIMESTAMP),
        'PENDING'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_order ON contracts;
CREATE TRIGGER trigger_auto_create_order
AFTER INSERT OR UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION auto_create_order_from_contract();
