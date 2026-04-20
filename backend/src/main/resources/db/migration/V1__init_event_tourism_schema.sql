create table if not exists users (
    id bigserial primary key,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(255) not null,
    role varchar(20) not null default 'USER'
);

create table if not exists events (
    id bigserial primary key,
    title varchar(255) not null,
    description varchar(5000) not null,
    city varchar(255) not null,
    venue varchar(255) not null,
    latitude numeric(10,7) not null,
    longitude numeric(10,7) not null,
    map_url varchar(1024),
    start_date_time timestamp not null,
    end_date_time timestamp not null
);

create table if not exists event_program_items (
    id bigserial primary key,
    event_id bigint not null references events(id) on delete cascade,
    title varchar(255) not null,
    start_date_time timestamp not null,
    end_date_time timestamp not null,
    description varchar(2000)
);

create table if not exists ticket_types (
    id bigserial primary key,
    event_id bigint not null references events(id) on delete cascade,
    name varchar(255) not null,
    price numeric(10,2) not null,
    quantity_total integer not null,
    quantity_sold integer not null default 0
);

create table if not exists orders (
    id bigserial primary key,
    user_id bigint not null references users(id),
    created_at timestamp with time zone not null,
    total_amount numeric(12,2) not null
);

create table if not exists order_items (
    id bigserial primary key,
    order_id bigint not null references orders(id) on delete cascade,
    ticket_type_id bigint not null references ticket_types(id),
    quantity integer not null,
    unit_price numeric(10,2) not null
);

create index if not exists idx_events_start_date_time on events(start_date_time);
create index if not exists idx_events_city on events(city);
create index if not exists idx_ticket_types_event_id on ticket_types(event_id);
create index if not exists idx_orders_user_id on orders(user_id);
