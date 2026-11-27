alter table public.chapter_simulations
  drop constraint simulation_coverage_shape,
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code in (
        'Prelims-CSAT','Prelims-General-Studies-I',
        'Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III','Mains-General-Studies-IV',
        'Mains-Essay'
      ) and chapter_path = '' and coverage = '[]'::jsonb)
      or (mode='pyq' and paper_code='Prelims-CSAT' and chapter_path='' and coverage='[]'::jsonb
          and source_details is not null and source_details->>'year'='2024'
          and source_details->>'series'='A')
    )
  );
