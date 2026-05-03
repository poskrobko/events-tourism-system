insert into event_program_items (event_id, title, start_date_time, end_date_time, description)
select e.id, x.title, x.start_date_time, x.end_date_time, x.description
from events e
join (
  values
    ('Sunset Jazz Night', 'Сбор гостей и welcome-drink', timestamp '2026-04-26 19:00:00', timestamp '2026-04-26 19:30:00', 'Встреча гостей и музыкальный фон от DJ.'),
    ('Sunset Jazz Night', 'Концерт джаз-бэнда', timestamp '2026-04-26 19:30:00', timestamp '2026-04-26 21:15:00', 'Основная музыкальная программа.'),
    ('Sunset Jazz Night', 'Jam-session и автограф-сессия', timestamp '2026-04-26 21:15:00', timestamp '2026-04-26 22:00:00', 'Свободная импровизация и общение с артистами.'),
    ('Product Leaders Meetup', 'Регистрация и кофе', timestamp '2026-04-30 11:00:00', timestamp '2026-04-30 11:30:00', 'Нетворкинг у welcome-зоны.'),
    ('Product Leaders Meetup', 'Доклады и Q&A', timestamp '2026-04-30 11:30:00', timestamp '2026-04-30 14:30:00', 'Кейсы по продуктовой стратегии и росту.'),
    ('Product Leaders Meetup', 'Круглые столы', timestamp '2026-04-30 14:45:00', timestamp '2026-04-30 16:00:00', 'Обсуждение кейсов в группах.'),
    ('City Light Weekend', 'Открытие фестиваля', timestamp '2026-05-05 16:00:00', timestamp '2026-05-05 17:00:00', 'Старт фестиваля и презентация инсталляций.'),
    ('City Light Weekend', 'Световое шоу и арт-зоны', timestamp '2026-05-05 17:00:00', timestamp '2026-05-05 21:30:00', 'Интерактивные арт-пространства и перформансы.'),
    ('City Light Weekend', 'Финальный DJ-сет', timestamp '2026-05-05 21:30:00', timestamp '2026-05-05 23:00:00', 'Закрытие фестиваля и музыкальная программа.'),
    ('Startup Pitch Day', 'Питч-сессия #1', timestamp '2026-05-09 12:00:00', timestamp '2026-05-09 13:30:00', 'Выступления стартапов ранней стадии.'),
    ('Startup Pitch Day', 'Панель инвесторов', timestamp '2026-05-09 13:45:00', timestamp '2026-05-09 15:00:00', 'Обратная связь от венчурных фондов.'),
    ('Startup Pitch Day', 'Финальные питчи', timestamp '2026-05-09 15:15:00', timestamp '2026-05-09 17:00:00', 'Финал и награждение лучших проектов.'),
    ('Open Air Rock', 'Разогрев локальных групп', timestamp '2026-05-11 18:30:00', timestamp '2026-05-11 19:30:00', 'Выступления молодых рок-коллективов.'),
    ('Open Air Rock', 'Хедлайнер шоу', timestamp '2026-05-11 19:30:00', timestamp '2026-05-11 21:45:00', 'Основной концерт и спецэффекты.'),
    ('Open Air Rock', 'Encore и закрытие', timestamp '2026-05-11 21:45:00', timestamp '2026-05-11 22:30:00', 'Финальные треки и завершение вечера.'),
    ('Art Lab Expo', 'Открытие экспозиции', timestamp '2026-05-15 14:00:00', timestamp '2026-05-15 15:00:00', 'Презентация авторов и проектов.'),
    ('Art Lab Expo', 'Тематические мастер-классы', timestamp '2026-05-15 15:00:00', timestamp '2026-05-15 17:30:00', 'Практические сессии с художниками.'),
    ('Art Lab Expo', 'Публичный artist-talk', timestamp '2026-05-15 17:30:00', timestamp '2026-05-15 19:00:00', 'Обсуждение трендов современного искусства.'),
    ('Design Sprint Weekend', 'Постановка задачи', timestamp '2026-05-18 10:00:00', timestamp '2026-05-18 11:30:00', 'Формирование гипотез и целей спринта.'),
    ('Design Sprint Weekend', 'Прототипирование', timestamp '2026-05-18 11:45:00', timestamp '2026-05-18 15:30:00', 'Работа команд над UX-решениями.'),
    ('Design Sprint Weekend', 'Тестирование идей', timestamp '2026-05-18 16:00:00', timestamp '2026-05-18 18:00:00', 'Демо и обратная связь от экспертов.'),
    ('Street Food Jam', 'Открытие фуд-корта', timestamp '2026-05-20 13:00:00', timestamp '2026-05-20 14:30:00', 'Старт работы гастро-зон и маркета.'),
    ('Street Food Jam', 'Кулинарные баттлы', timestamp '2026-05-20 15:00:00', timestamp '2026-05-20 18:30:00', 'Соревнования шефов и дегустации.'),
    ('Street Food Jam', 'Музыкальная сцена', timestamp '2026-05-20 18:30:00', timestamp '2026-05-20 21:00:00', 'Живые выступления и закрытие дня.'),
    ('Indie Music Fest', 'Открытие дверей', timestamp '2026-05-22 17:00:00', timestamp '2026-05-22 18:00:00', 'Сбор гостей и знакомство с площадкой.'),
    ('Indie Music Fest', 'Сеты indie-исполнителей', timestamp '2026-05-22 18:00:00', timestamp '2026-05-22 22:00:00', 'Живые выступления групп и соло-артистов.'),
    ('Indie Music Fest', 'Afterparty', timestamp '2026-05-22 22:00:00', timestamp '2026-05-22 23:00:00', 'DJ-сет и общение с артистами.'),
    ('Motion Graphics Day', 'Кейноут', timestamp '2026-05-25 12:00:00', timestamp '2026-05-25 13:00:00', 'Тренды motion-дизайна 2026.'),
    ('Motion Graphics Day', 'Практические доклады', timestamp '2026-05-25 13:15:00', timestamp '2026-05-25 16:00:00', 'Пайплайн, 3D и анимация интерфейсов.'),
    ('Motion Graphics Day', 'Портфолио-ревью', timestamp '2026-05-25 16:15:00', timestamp '2026-05-25 18:00:00', 'Разбор работ от ведущих студий.'),
    ('Urban Run Club', 'Разминка и брифинг', timestamp '2026-05-28 09:00:00', timestamp '2026-05-28 09:30:00', 'Инструктаж по трассе и безопасности.'),
    ('Urban Run Club', 'Старт забегов', timestamp '2026-05-28 09:30:00', timestamp '2026-05-28 11:30:00', 'Дистанции 5 км и 10 км.'),
    ('Urban Run Club', 'Награждение', timestamp '2026-05-28 11:30:00', timestamp '2026-05-28 12:00:00', 'Медали и церемония закрытия.'),
    ('Classical Night', 'Открытие вечера', timestamp '2026-06-01 20:00:00', timestamp '2026-06-01 20:30:00', 'Приветственное слово дирижера.'),
    ('Classical Night', 'Симфоническая программа', timestamp '2026-06-01 20:30:00', timestamp '2026-06-01 22:00:00', 'Исполнение классических произведений.'),
    ('Classical Night', 'Бис и завершение', timestamp '2026-06-01 22:00:00', timestamp '2026-06-01 22:30:00', 'Финальная часть концерта.')
) as x(event_title, title, start_date_time, end_date_time, description) on x.event_title = e.title
where not exists (
  select 1
  from event_program_items p
  where p.event_id = e.id
    and p.title = x.title
    and p.start_date_time = x.start_date_time
)
on conflict do nothing;

insert into ticket_types (event_id, name, price, quantity_total, quantity_sold)
select e.id, x.name, x.price, x.quantity_total, 0
from events e
join (
  values
    ('Sunset Jazz Night', 'Стандарт', 60::numeric, 250),
    ('Sunset Jazz Night', 'VIP', 140::numeric, 60),
    ('Product Leaders Meetup', 'Early Bird', 45::numeric, 120),
    ('Product Leaders Meetup', 'Бизнес', 90::numeric, 80),
    ('City Light Weekend', 'Один день', 50::numeric, 400),
    ('City Light Weekend', 'Фулл-пасс', 95::numeric, 180),
    ('Startup Pitch Day', 'Участник', 55::numeric, 160),
    ('Startup Pitch Day', 'Инвестор', 180::numeric, 40),
    ('Open Air Rock', 'Фан-зона', 70::numeric, 500),
    ('Open Air Rock', 'Front Stage', 150::numeric, 120),
    ('Art Lab Expo', 'Базовый', 35::numeric, 300),
    ('Art Lab Expo', 'Мастер-класс', 85::numeric, 90),
    ('Design Sprint Weekend', 'Стандарт', 65::numeric, 200),
    ('Design Sprint Weekend', 'Командный пакет', 220::numeric, 40),
    ('Street Food Jam', 'Входной', 25::numeric, 800),
    ('Street Food Jam', 'Дегустационный', 60::numeric, 250),
    ('Indie Music Fest', 'Танцпол', 55::numeric, 600),
    ('Indie Music Fest', 'Lounge', 120::numeric, 110),
    ('Motion Graphics Day', 'Конференция', 75::numeric, 220),
    ('Motion Graphics Day', 'Конференция + воркшоп', 130::numeric, 90),
    ('Urban Run Club', '5 км', 20::numeric, 700),
    ('Urban Run Club', '10 км', 30::numeric, 500),
    ('Classical Night', 'Партер', 80::numeric, 280),
    ('Classical Night', 'Амфитеатр', 55::numeric, 320)
) as x(event_title, name, price, quantity_total) on x.event_title = e.title
where not exists (
  select 1
  from ticket_types t
  where t.event_id = e.id
    and t.name = x.name
)
on conflict do nothing;
