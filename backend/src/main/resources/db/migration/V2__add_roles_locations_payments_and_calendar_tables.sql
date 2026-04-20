create table if not exists roles (
    id bigserial primary key,
    code varchar(50) not null unique,
    name varchar(100) not null,
    description varchar(500)
);

insert into roles (code, name, description)
values
    ('USER', 'User', 'Regular user with access to events and ticket purchasing'),
    ('ADMIN', 'Administrator', 'Administrator with event and order management permissions')
on conflict (code) do nothing;

alter table users
    add column if not exists role_id bigint references roles(id);

update users
set role_id = r.id
from roles r
where users.role_id is null
  and users.role = r.code;

create table if not exists locations (
    id bigserial primary key,
    city varchar(255) not null,
    venue varchar(255) not null,
    address_line varchar(500),
    latitude numeric(10,7) not null,
    longitude numeric(10,7) not null,
    map_url varchar(1024),
    unique (city, venue, latitude, longitude)
);

alter table events
    add column if not exists location_id bigint references locations(id);

create table if not exists payments (
    id bigserial primary key,
    order_id bigint not null references orders(id) on delete cascade,
    amount numeric(12,2) not null,
    currency char(3) not null default 'USD',
    payment_method varchar(50) not null,
    provider varchar(100),
    provider_transaction_id varchar(255),
    status varchar(30) not null,
    paid_at timestamp with time zone,
    created_at timestamp with time zone not null default now()
);

create table if not exists user_calendar_integrations (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    provider varchar(50) not null,
    account_email varchar(255),
    access_token_encrypted text not null,
    refresh_token_encrypted text,
    token_expires_at timestamp with time zone,
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    unique (user_id, provider, account_email)
);

create table if not exists calendar_event_links (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    event_id bigint not null references events(id) on delete cascade,
    integration_id bigint not null references user_calendar_integrations(id) on delete cascade,
    external_calendar_event_id varchar(255) not null,
    sync_status varchar(30) not null default 'SYNCED',
    last_synced_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    unique (user_id, event_id, integration_id)
);

create index if not exists idx_users_role_id on users(role_id);
create index if not exists idx_events_location_id on events(location_id);
create index if not exists idx_locations_city on locations(city);
create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_calendar_integrations_user_id on user_calendar_integrations(user_id);
create index if not exists idx_calendar_links_user_event on calendar_event_links(user_id, event_id);
