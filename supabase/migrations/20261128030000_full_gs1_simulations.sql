alter table public.chapter_simulations
  add column source_details jsonb,
  drop constraint simulation_coverage_shape,
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code in ('Prelims-CSAT','Prelims-General-Studies-I')
          and chapter_path = '' and coverage = '[]'::jsonb)
    )
  ),
  add constraint simulation_source_details_shape check (
    source_details is null or (mode = 'full' and jsonb_typeof(source_details) = 'object')
  );
