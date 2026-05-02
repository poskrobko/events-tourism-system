insert into events (title, description, city, venue, latitude, longitude, map_url, start_date_time, end_date_time, created_by_user_id)
select * from (
  values
  ('Sunset Jazz Night', 'Вечер живого джаза под открытым небом.', 'Минск', 'Музыка', 53.9000000, 27.5667000, null, timestamp '2026-04-26 19:00:00', timestamp '2026-04-26 22:00:00', null),
  ('Product Leaders Meetup', 'Нетворкинг и практики для product-менеджеров.', 'Гомель', 'Бизнес', 52.4345000, 30.9754000, null, timestamp '2026-04-30 11:00:00', timestamp '2026-04-30 16:00:00', null),
  ('City Light Weekend', 'Фестиваль света, музыки и уличного искусства.', 'Брест', 'Фестиваль', 52.0976000, 23.7341000, null, timestamp '2026-05-05 16:00:00', timestamp '2026-05-05 23:00:00', null),
  ('Startup Pitch Day', 'Презентации стартапов перед инвесторами.', 'Витебск', 'Бизнес', 55.1904000, 30.2049000, null, timestamp '2026-05-09 12:00:00', timestamp '2026-05-09 17:00:00', null),
  ('Open Air Rock', 'Большой рок-концерт на открытой площадке.', 'Могилёв', 'Концерты', 53.8980000, 30.3325000, null, timestamp '2026-05-11 18:30:00', timestamp '2026-05-11 22:30:00', null),
  ('Art Lab Expo', 'Выставка современных творческих проектов.', 'Минск', 'Творчество', 53.9045000, 27.5615000, null, timestamp '2026-05-15 14:00:00', timestamp '2026-05-15 19:00:00', null),
  ('Design Sprint Weekend', 'Интенсив по дизайну цифровых продуктов.', 'Гродно', 'Образование', 53.6693000, 23.8131000, null, timestamp '2026-05-18 10:00:00', timestamp '2026-05-18 18:00:00', null),
  ('Street Food Jam', 'Фестиваль гастрономии и локальных брендов.', 'Барановичи', 'Фестиваль', 53.1327000, 26.0139000, null, timestamp '2026-05-20 13:00:00', timestamp '2026-05-20 21:00:00', null),
  ('Indie Music Fest', 'Фестиваль инди-исполнителей.', 'Пинск', 'Музыка', 52.1229000, 26.0951000, null, timestamp '2026-05-22 17:00:00', timestamp '2026-05-22 23:00:00', null),
  ('Motion Graphics Day', 'Конференция по motion-дизайну.', 'Бобруйск', 'Творчество', 53.1384000, 29.2214000, null, timestamp '2026-05-25 12:00:00', timestamp '2026-05-25 18:00:00', null),
  ('Urban Run Club', 'Массовый забег по городу.', 'Минск', 'Спорт', 53.9000000, 27.5667000, null, timestamp '2026-05-28 09:00:00', timestamp '2026-05-28 12:00:00', null),
  ('Classical Night', 'Симфонический концерт на берегу моря.', 'Полоцк', 'Концерты', 55.4879000, 28.7856000, null, timestamp '2026-06-01 20:00:00', timestamp '2026-06-01 22:30:00', null)
) as seed(title, description, city, venue, latitude, longitude, map_url, start_date_time, end_date_time, created_by_user_id)
where not exists (
  select 1 from events e
  where e.title = seed.title
    and e.start_date_time = seed.start_date_time
);
