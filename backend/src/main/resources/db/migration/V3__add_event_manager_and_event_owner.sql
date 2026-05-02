insert into roles (code, name, description)
select 'EVENT_MANAGER', 'Event manager', 'Can manage own events, program, tickets and see related orders'
where not exists (select 1 from roles where code = 'EVENT_MANAGER');

alter table events
    add column if not exists created_by_user_id bigint references users(id);

update events
set created_by_user_id = (
    select u.id
    from users u
    where u.role = 'ADMIN'
    order by u.id
    limit 1
)
where events.created_by_user_id is null
  and exists (select 1 from users u where u.role = 'ADMIN');

create index if not exists idx_events_created_by_user_id on events(created_by_user_id);
