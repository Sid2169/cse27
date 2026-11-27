alter table public.chapter_simulations
  drop constraint simulation_coverage_shape,
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code in (
        'Prelims-CSAT','Prelims-General-Studies-I',
        'Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III','Mains-General-Studies-IV'
      ) and chapter_path = '' and coverage = '[]'::jsonb)
    )
  );
