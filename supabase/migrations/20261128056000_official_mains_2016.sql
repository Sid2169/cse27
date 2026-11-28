alter table public.chapter_simulations
  drop constraint simulation_coverage_shape,
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code in (
        'Prelims-CSAT','Prelims-General-Studies-I',
        'Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III','Mains-General-Studies-IV',
        'Mains-Essay','Mains-English','Mains-Indian-Language'
      ) and chapter_path = '' and coverage = '[]'::jsonb)
      or (mode = 'full' and paper_code = 'Mains-Mathematics' and paper_variant in ('I','II')
          and chapter_path = '' and coverage = '[]'::jsonb)
      or (mode='pyq' and paper_code in ('Prelims-CSAT','Prelims-General-Studies-I') and chapter_path='' and coverage='[]'::jsonb
          and source_details is not null and source_details->>'year' in ('2016','2017','2018','2019','2020','2021','2022','2023','2024','2025','2026')
          and source_details->>'series'='A')
      or (mode='pyq' and kind='descriptive' and paper_code in (
        'Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III',
        'Mains-General-Studies-IV','Mains-Essay','Mains-Mathematics','Mains-English','Mains-Indian-Language'
      ) and chapter_path='' and coverage='[]'::jsonb and source_details is not null
          and source_details->>'year' in ('2016','2017','2018','2019','2020','2021','2022','2023','2024','2025','2026') and jsonb_typeof(source_details->'booklet')='string'
          and (case when paper_code='Mains-Mathematics' then paper_variant in ('I','II') else paper_variant='' end))
      or (mode='updated-pyq' and paper_code='Prelims-General-Studies-I' and chapter_path='' and coverage='[]'::jsonb
          and source_details is not null and source_details->>'year'='2024'
          and source_details->>'series'='A' and source_details->>'targetYear' ~ '^[12][0-9]{3}$'
          and jsonb_typeof(source_details->'replacements')='array')
    )
  );

alter table public.chapter_simulations
  drop constraint chapter_simulations_unit_scale_check,
  add constraint chapter_simulations_unit_scale_check check (
    unit_scale in (1,6) or (
      unit_scale=2 and kind='descriptive' and mode='pyq'
      and (source_details->>'year') is not distinct from '2016'
      and paper_code in ('Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III')
    )
  );
