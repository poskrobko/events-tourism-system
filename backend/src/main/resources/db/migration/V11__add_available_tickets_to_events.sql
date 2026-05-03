alter table events
    add column if not exists available_tickets integer not null default 0;

update events e
set available_tickets = coalesce((
    select sum(greatest(tt.quantity_total - tt.quantity_sold, 0))
    from ticket_types tt
    where tt.event_id = e.id
), 0);
