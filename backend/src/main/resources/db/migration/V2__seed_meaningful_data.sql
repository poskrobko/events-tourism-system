-- Seed demo data for local development (idempotent inserts)

-- Users
insert into users (email, password_hash)
select 'anna.reader@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
where not exists (
    select 1 from users where email = 'anna.reader@library.local'
);

insert into users (email, password_hash)
select 'boris.reader@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
where not exists (
    select 1 from users where email = 'boris.reader@library.local'
);

insert into users (email, password_hash)
select 'librarian@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
where not exists (
    select 1 from users where email = 'librarian@library.local'
);

insert into users (email, password_hash)
select 'admin@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
where not exists (
    select 1 from users where email = 'admin@library.local'
);

-- Roles
insert into user_roles (user_id, role)
select u.id, 'READER'
from users u
where u.email in ('anna.reader@library.local', 'boris.reader@library.local')
and not exists (
    select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'READER'
);

insert into user_roles (user_id, role)
select u.id, 'LIBRARIAN'
from users u
where u.email = 'librarian@library.local'
and not exists (
    select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'LIBRARIAN'
);

insert into user_roles (user_id, role)
select u.id, 'ADMIN'
from users u
where u.email = 'admin@library.local'
and not exists (
    select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'ADMIN'
);

-- Books
insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Clean Code', 'Robert C. Martin', 2008, 'software engineering,programming', 5, 3
where not exists (
    select 1 from books where title = 'Clean Code' and author = 'Robert C. Martin'
);

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Pragmatic Programmer', 'Andrew Hunt; David Thomas', 1999, 'software engineering,career', 4, 2
where not exists (
    select 1 from books where title = 'The Pragmatic Programmer' and author = 'Andrew Hunt; David Thomas'
);

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Dune', 'Frank Herbert', 1965, 'science fiction,adventure', 6, 1
where not exists (
    select 1 from books where title = 'Dune' and author = 'Frank Herbert'
);

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Hobbit', 'J. R. R. Tolkien', 1937, 'fantasy,adventure', 3, 0
where not exists (
    select 1 from books where title = 'The Hobbit' and author = 'J. R. R. Tolkien'
);

-- Recommendation profiles
insert into recommendation_profiles (user_id, preferred_genres_csv)
select u.id, 'science fiction,fantasy,adventure'
from users u
where u.email = 'anna.reader@library.local'
and not exists (
    select 1 from recommendation_profiles rp where rp.user_id = u.id
);

insert into recommendation_profiles (user_id, preferred_genres_csv)
select u.id, 'software engineering,career'
from users u
where u.email = 'boris.reader@library.local'
and not exists (
    select 1 from recommendation_profiles rp where rp.user_id = u.id
);

-- Ratings
insert into ratings (user_id, book_id, score)
select u.id, b.id, 5
from users u, books b
where u.email = 'anna.reader@library.local'
  and b.title = 'Dune'
  and b.author = 'Frank Herbert'
  and not exists (
      select 1 from ratings r where r.user_id = u.id and r.book_id = b.id
  );

insert into ratings (user_id, book_id, score)
select u.id, b.id, 4
from users u, books b
where u.email = 'boris.reader@library.local'
  and b.title = 'Clean Code'
  and b.author = 'Robert C. Martin'
  and not exists (
      select 1 from ratings r where r.user_id = u.id and r.book_id = b.id
  );

-- Reviews
insert into reviews (user_id, book_id, text, created_at)
select u.id, b.id,
       'Отличный фундамент по практикам чистого кода, полезно перечитывать.',
       current_timestamp
from users u, books b
where u.email = 'boris.reader@library.local'
  and b.title = 'Clean Code'
  and b.author = 'Robert C. Martin'
  and not exists (
      select 1
      from reviews rv
      where rv.user_id = u.id and rv.book_id = b.id
        and rv.text = 'Отличный фундамент по практикам чистого кода, полезно перечитывать.'
  );

insert into reviews (user_id, book_id, text, created_at)
select u.id, b.id,
       'Атмосферная классика научной фантастики, сильный мир и политика.',
       current_timestamp
from users u, books b
where u.email = 'anna.reader@library.local'
  and b.title = 'Dune'
  and b.author = 'Frank Herbert'
  and not exists (
      select 1
      from reviews rv
      where rv.user_id = u.id and rv.book_id = b.id
        and rv.text = 'Атмосферная классика научной фантастики, сильный мир и политика.'
  );

-- Loans
insert into loans (user_id, book_id, status, borrowed_at, due_date, returned_at)
select u.id, b.id, 'ACTIVE', current_date - 3, current_date + 11, null
from users u, books b
where u.email = 'anna.reader@library.local'
  and b.title = 'Dune'
  and b.author = 'Frank Herbert'
  and not exists (
      select 1
      from loans l
      where l.user_id = u.id and l.book_id = b.id and l.status = 'ACTIVE'
  );

insert into loans (user_id, book_id, status, borrowed_at, due_date, returned_at)
select u.id, b.id, 'RETURNED', current_date - 20, current_date - 6, current_date - 7
from users u, books b
where u.email = 'boris.reader@library.local'
  and b.title = 'The Pragmatic Programmer'
  and b.author = 'Andrew Hunt; David Thomas'
  and not exists (
      select 1
      from loans l
      where l.user_id = u.id and l.book_id = b.id and l.status = 'RETURNED'
  );

-- Reservations: "The Hobbit" unavailable -> waiting queue example
insert into reservations (user_id, book_id, status, created_at, notified_at, expires_at, cancelled_at)
select u.id, b.id, 'WAITING', current_timestamp - interval '5 hour', null, null, null
from users u, books b
where u.email = 'anna.reader@library.local'
  and b.title = 'The Hobbit'
  and b.author = 'J. R. R. Tolkien'
  and not exists (
      select 1
      from reservations r
      where r.user_id = u.id and r.book_id = b.id and r.status = 'WAITING'
  );

insert into reservations (user_id, book_id, status, created_at, notified_at, expires_at, cancelled_at)
select u.id, b.id, 'NOTIFIED', current_timestamp - interval '1 day', current_timestamp - interval '2 hour', current_timestamp + interval '22 hour', null
from users u, books b
where u.email = 'boris.reader@library.local'
  and b.title = 'The Hobbit'
  and b.author = 'J. R. R. Tolkien'
  and not exists (
      select 1
      from reservations r
      where r.user_id = u.id and r.book_id = b.id and r.status = 'NOTIFIED'
  );
