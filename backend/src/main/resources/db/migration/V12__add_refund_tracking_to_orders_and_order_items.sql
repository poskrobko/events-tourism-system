alter table orders
    add column if not exists status varchar(30) not null default 'PENDING';

alter table orders
    add column if not exists refunded_at timestamp with time zone;

alter table order_items
    add column if not exists status varchar(30) not null default 'ACTIVE';

alter table order_items
    add column if not exists refunded_at timestamp with time zone;

update orders o
set status = case
    when p.status = 'PAID' then 'PAID'
    when p.status = 'REFUNDED' then 'REFUNDED'
    when p.status = 'DECLINED' then 'DECLINED'
    else 'PENDING'
end,
refunded_at = case when p.status = 'REFUNDED' then p.created_at else null end
from payments p
where p.order_id = o.id
  and p.id = (
      select p2.id
      from payments p2
      where p2.order_id = o.id
      order by p2.created_at desc
      limit 1
  );

update order_items oi
set status = case
    when o.status = 'REFUNDED' then 'REFUNDED'
    when o.status = 'PAID' then 'PAID'
    else 'ACTIVE'
end,
refunded_at = o.refunded_at
from orders o
where o.id = oi.order_id;
