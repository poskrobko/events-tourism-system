insert into roles (code, name, description)
values ('EVENT_MANAGER', 'Event manager', 'Can manage own events, program, tickets and see related orders')
on conflict (code) do nothing;

alter table events
    add column if not exists created_by_user_id bigint references users(id);

update events
set created_by_user_id = (
    select u.id
    from users u
    join roles r on u.role_id = r.id
    where r.code = 'ADMIN'
    order by u.id
    limit 1
)
where created_by_user_id is null
  and exists (
      select 1
      from users u
      join roles r on u.role_id = r.id
      where r.code = 'ADMIN'
  );

create index if not exists idx_events_created_by_user_id on events(created_by_user_id);
