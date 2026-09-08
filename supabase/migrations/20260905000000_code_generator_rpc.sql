-- Fix R07: Use sequence_counters table for atomic sequential codes

CREATE TABLE IF NOT EXISTS public.sequence_counters (
    sequence_name TEXT PRIMARY KEY,
    current_value INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.generate_sequential_code(p_table text, p_column text, p_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_num integer;
    v_result text;
    v_seq_name text;
BEGIN
    v_seq_name := p_table || '_' || p_prefix;

    -- Upsert and return new value atomically using lock
    INSERT INTO public.sequence_counters (sequence_name, current_value)
    VALUES (v_seq_name, 1)
    ON CONFLICT (sequence_name)
    DO UPDATE SET current_value = public.sequence_counters.current_value + 1
    RETURNING current_value INTO v_next_num;
    
    -- Sync with actual max value in table if it's somehow larger (e.g., imported data)
    DECLARE
        v_actual_max integer;
    BEGIN
        EXECUTE format('
            SELECT COALESCE(
                MAX(
                    SUBSTRING(%I FROM ''-([0-9]+)$'')::integer
                ), 0
            )
            FROM %I 
            WHERE %I LIKE %L
        ', p_column, p_table, p_column, p_prefix || '-%')
        INTO v_actual_max;
        
        IF v_actual_max >= v_next_num THEN
            v_next_num := v_actual_max + 1;
            UPDATE public.sequence_counters 
            SET current_value = v_next_num 
            WHERE sequence_name = v_seq_name;
        END IF;
    END;
    
    v_result := p_prefix || '-' || LPAD(v_next_num::text, 6, '0');
    RETURN v_result;
END;
$$;
