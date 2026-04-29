-- Ensure existing admin account login is aligned with the new default
update users
set email = 'admin123'
where role = 'ADMIN'
  and email <> 'admin123'
  and not exists (
      select 1
      from users u2
      where u2.email = 'admin123'
  );
