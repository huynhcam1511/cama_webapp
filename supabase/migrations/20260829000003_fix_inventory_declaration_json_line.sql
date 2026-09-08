-- Repair databases where the inventory declaration implementation was
-- restored with jsonb_array_elements_text, while its body still uses ->>.
DO $$
DECLARE
  function_ddl TEXT;
BEGIN
  SELECT pg_get_functiondef(
    'public.complete_inventory_declaration_impl(jsonb)'::regprocedure
  ) INTO function_ddl;

  function_ddl := replace(
    function_ddl,
    'jsonb_array_elements_text(',
    'jsonb_array_elements('
  );
  function_ddl := replace(
    function_ddl,
    'v_line->>',
    '(v_line::jsonb)->>'
  );
  function_ddl := replace(
    function_ddl,
    'line->>',
    '(line::jsonb)->>'
  );

  EXECUTE function_ddl;
END;
$$;
