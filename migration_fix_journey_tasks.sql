ALTER TABLE public.journey_tasks 
  ALTER COLUMN event_id TYPE TEXT,
  ALTER COLUMN stage_id TYPE TEXT,
  ALTER COLUMN task_id TYPE TEXT,
  ALTER COLUMN parent_task_id TYPE TEXT;
