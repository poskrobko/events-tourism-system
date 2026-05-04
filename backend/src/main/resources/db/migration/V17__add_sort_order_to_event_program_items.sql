alter table event_program_items
    add column if not exists sort_order integer not null default 0;

with ordered as (
    select id,
           row_number() over (partition by event_id order by start_date_time asc, id asc) - 1 as rn
    from event_program_items
)
update event_program_items p
set sort_order = o.rn
from ordered o
where p.id = o.id;

create index if not exists idx_event_program_items_event_order
    on event_program_items(event_id, sort_order, start_date_time, id);
