-- Keep operational orders in sync with contract events stored in contracts.notes.
-- One active contract event maps to one order, identified by a stable EVENT_ID marker.

CREATE OR REPLACE FUNCTION public.next_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next bigint;
BEGIN
  -- Serialize code allocation so concurrent contract saves cannot reuse a code.
  PERFORM pg_advisory_xact_lock(hashtext('public.orders.order_code'));

  SELECT COALESCE(MAX((regexp_match(order_code, '^ORDE-([0-9]+)$'))[1]::bigint), 0) + 1
    INTO v_next
    FROM public.orders
   WHERE order_code ~ '^ORDE-[0-9]+$';

  RETURN 'ORDE-' || lpad(v_next::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_contract_event_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meta jsonb;
  v_events jsonb;
  v_event jsonb;
  v_event_id text;
  v_event_name text;
  v_marker text;
  v_order_id uuid;
  v_seen_markers text[] := ARRAY[]::text[];
BEGIN
  IF NEW.deleted_at IS NOT NULL OR NEW.status IN ('DRAFT', 'CANCELLED', 'ARCHIVED') THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_meta := COALESCE(NULLIF(NEW.notes, '')::jsonb, '{}'::jsonb);
  EXCEPTION WHEN others THEN
    v_meta := '{}'::jsonb;
  END;

  v_events := COALESCE(v_meta->'events', '[]'::jsonb);
  IF jsonb_typeof(v_events) <> 'array' THEN
    RETURN NEW;
  END IF;

  FOR v_event IN SELECT value FROM jsonb_array_elements(v_events)
  LOOP
    IF btrim(COALESCE(v_event->>'name', '')) = '' THEN
      CONTINUE;
    END IF;

    v_event_id := COALESCE(NULLIF(v_event->>'id', ''), 'event-' || (cardinality(v_seen_markers) + 1));
    v_event_name := btrim(v_event->>'name');
    v_marker := '[EVENT_ID:' || v_event_id || ']';
    v_seen_markers := array_append(v_seen_markers, v_marker);

    SELECT id INTO v_order_id
      FROM public.orders
     WHERE contract_id = NEW.id
       AND notes LIKE '%' || v_marker || '%'
     ORDER BY created_at
     LIMIT 1;

    IF v_order_id IS NULL THEN
      -- Adopt the legacy single order when present instead of duplicating it.
      SELECT id INTO v_order_id
        FROM public.orders
       WHERE contract_id = NEW.id
         AND service_type = 'Tự động từ HĐ'
       ORDER BY created_at
       LIMIT 1;
    END IF;

    IF v_order_id IS NULL THEN
      INSERT INTO public.orders (
        order_code, contract_id, service_type, event_date, return_date,
        completion_status, checklist, notes
      ) VALUES (
        public.next_order_code(), NEW.id, v_event_name,
        NULLIF(v_event->>'pickup_date', '')::date,
        NULLIF(v_event->>'return_date', '')::date,
        'PENDING', '[]'::jsonb,
        v_marker || ' Đơn hàng tự động sinh từ Hợp đồng ' || NEW.contract_code ||
        ' cho sự kiện: ' || v_event_name || E'\nNgày diễn ra: ' || COALESCE(NULLIF(v_event->>'event_date', ''), 'Không có') ||
        E'\nNgày giao: ' || COALESCE(NULLIF(v_event->>'pickup_date', ''), 'Không có') ||
        E'\nĐịa điểm: ' || COALESCE(NULLIF(v_event->>'location', ''), 'Không có')
      );
    ELSE
      UPDATE public.orders
         SET service_type = v_event_name,
             event_date = NULLIF(v_event->>'pickup_date', '')::date,
             return_date = NULLIF(v_event->>'return_date', '')::date,
             notes = v_marker || ' Đơn hàng tự động sinh từ Hợp đồng ' || NEW.contract_code ||
               ' cho sự kiện: ' || v_event_name || E'\nNgày diễn ra: ' || COALESCE(NULLIF(v_event->>'event_date', ''), 'Không có') ||
               E'\nNgày giao: ' || COALESCE(NULLIF(v_event->>'pickup_date', ''), 'Không có') ||
               E'\nĐịa điểm: ' || COALESCE(NULLIF(v_event->>'location', ''), 'Không có'),
             updated_at = now()
       WHERE id = v_order_id;
    END IF;

    v_order_id := NULL;
  END LOOP;

  -- Cancel only obsolete orders previously created by this automation.
  UPDATE public.orders
     SET completion_status = 'CANCELLED', updated_at = now()
   WHERE contract_id = NEW.id
     AND notes LIKE '%Đơn hàng tự động sinh từ Hợp đồng%'
     AND NOT EXISTS (
       SELECT 1 FROM unnest(v_seen_markers) marker
        WHERE public.orders.notes LIKE '%' || marker || '%'
     );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_create_order ON public.contracts;
DROP TRIGGER IF EXISTS trigger_sync_contract_event_orders ON public.contracts;

CREATE TRIGGER trigger_sync_contract_event_orders
AFTER INSERT OR UPDATE OF notes, status, deleted_at ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.sync_contract_event_orders();

-- Backfill active contracts and make deployment idempotent.
UPDATE public.contracts
   SET updated_at = updated_at
 WHERE deleted_at IS NULL
   AND status NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
   AND COALESCE(notes, '') <> '';
