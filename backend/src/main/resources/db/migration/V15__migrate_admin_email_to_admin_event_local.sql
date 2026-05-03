-- Normalize default admin login to an email-form identifier
update users
set email = 'admin@event.local'
where role = 'ADMIN'
  and email = 'admin123'
  and not exists (
      select 1
      from users u2
      where u2.email = 'admin@event.local'
  );
