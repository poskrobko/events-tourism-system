-- Extend user profile
alter table users add column if not exists full_name varchar(255);

-- Set full names for existing seeded users
update users set full_name = 'Anna Reader' where email = 'anna.reader@library.local' and (full_name is null or full_name = '');
update users set full_name = 'Boris Reader' where email = 'boris.reader@library.local' and (full_name is null or full_name = '');
update users set full_name = 'Librarian Nina' where email = 'librarian@library.local' and (full_name is null or full_name = '');
update users set full_name = 'Admin Root' where email = 'admin@library.local' and (full_name is null or full_name = '');

alter table recommendation_profiles add column if not exists favorite_authors_csv varchar(1000);

-- Additional demo users
insert into users (email, password_hash, full_name)
select 'reader.olga@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Olga Reader'
where not exists (select 1 from users where email = 'reader.olga@library.local');

insert into users (email, password_hash, full_name)
select 'reader.ivan@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ivan Reader'
where not exists (select 1 from users where email = 'reader.ivan@library.local');

insert into users (email, password_hash, full_name)
select 'reader.sofia@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sofia Reader'
where not exists (select 1 from users where email = 'reader.sofia@library.local');

insert into users (email, password_hash, full_name)
select 'librarian.max@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Max Librarian'
where not exists (select 1 from users where email = 'librarian.max@library.local');

insert into users (email, password_hash, full_name)
select 'admin.ops@library.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Operations Admin'
where not exists (select 1 from users where email = 'admin.ops@library.local');

insert into user_roles (user_id, role)
select u.id, 'ROLE_USER'
from users u
where u.email in ('reader.olga@library.local', 'reader.ivan@library.local', 'reader.sofia@library.local')
  and not exists (select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'ROLE_USER');

insert into user_roles (user_id, role)
select u.id, 'ROLE_LIBRARIAN'
from users u
where u.email = 'librarian.max@library.local'
  and not exists (select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'ROLE_LIBRARIAN');

insert into user_roles (user_id, role)
select u.id, 'ROLE_ADMIN'
from users u
where u.email = 'admin.ops@library.local'
  and not exists (select 1 from user_roles ur where ur.user_id = u.id and ur.role = 'ROLE_ADMIN');

-- Additional catalog seed (around 100 books total)

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 1', 'Neil Gaiman', 1951, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 1' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 2', 'Isaac Asimov', 1952, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 2' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 3', 'Agatha Christie', 1953, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 3' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 4', 'Martin Fowler', 1954, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 4' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 5', 'Walter Isaacson', 1955, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 5' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 6', 'Daniel Kahneman', 1956, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 6' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 7', 'Cal Newport', 1957, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 7' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 8', 'Jane Austen', 1958, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 8' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 9', 'Haruki Murakami', 1959, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 9' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 10', 'Lois Lowry', 1960, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 10' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 11', 'Neil Gaiman', 1961, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 11' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 12', 'Isaac Asimov', 1962, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 12' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 13', 'Agatha Christie', 1963, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 13' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 14', 'Martin Fowler', 1964, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 14' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 15', 'Walter Isaacson', 1965, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 15' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 16', 'Daniel Kahneman', 1966, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 16' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 17', 'Cal Newport', 1967, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 17' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 18', 'Jane Austen', 1968, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 18' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 19', 'Haruki Murakami', 1969, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 19' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 20', 'Lois Lowry', 1970, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 20' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 21', 'Neil Gaiman', 1971, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 21' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 22', 'Isaac Asimov', 1972, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 22' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 23', 'Agatha Christie', 1973, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 23' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 24', 'Martin Fowler', 1974, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 24' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 25', 'Walter Isaacson', 1975, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 25' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 26', 'Daniel Kahneman', 1976, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 26' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 27', 'Cal Newport', 1977, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 27' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 28', 'Jane Austen', 1978, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 28' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 29', 'Haruki Murakami', 1979, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 29' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 30', 'Lois Lowry', 1980, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 30' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 31', 'Neil Gaiman', 1981, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 31' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 32', 'Isaac Asimov', 1982, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 32' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 33', 'Agatha Christie', 1983, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 33' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 34', 'Martin Fowler', 1984, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 34' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 35', 'Walter Isaacson', 1985, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 35' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 36', 'Daniel Kahneman', 1986, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 36' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 37', 'Cal Newport', 1987, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 37' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 38', 'Jane Austen', 1988, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 38' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 39', 'Haruki Murakami', 1989, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 39' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 40', 'Lois Lowry', 1990, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 40' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 41', 'Neil Gaiman', 1991, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 41' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 42', 'Isaac Asimov', 1992, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 42' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 43', 'Agatha Christie', 1993, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 43' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 44', 'Martin Fowler', 1994, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 44' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 45', 'Walter Isaacson', 1995, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 45' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 46', 'Daniel Kahneman', 1996, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 46' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 47', 'Cal Newport', 1997, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 47' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 48', 'Jane Austen', 1998, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 48' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 49', 'Haruki Murakami', 1999, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 49' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 50', 'Lois Lowry', 2000, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 50' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 51', 'Neil Gaiman', 2001, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 51' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 52', 'Isaac Asimov', 2002, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 52' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 53', 'Agatha Christie', 2003, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 53' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 54', 'Martin Fowler', 2004, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 54' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 55', 'Walter Isaacson', 2005, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 55' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 56', 'Daniel Kahneman', 2006, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 56' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 57', 'Cal Newport', 2007, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 57' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 58', 'Jane Austen', 2008, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 58' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 59', 'Haruki Murakami', 2009, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 59' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 60', 'Lois Lowry', 2010, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 60' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 61', 'Neil Gaiman', 2011, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 61' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 62', 'Isaac Asimov', 2012, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 62' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 63', 'Agatha Christie', 2013, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 63' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 64', 'Martin Fowler', 2014, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 64' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 65', 'Walter Isaacson', 2015, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 65' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 66', 'Daniel Kahneman', 2016, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 66' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 67', 'Cal Newport', 2017, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 67' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 68', 'Jane Austen', 2018, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 68' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 69', 'Haruki Murakami', 2019, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 69' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 70', 'Lois Lowry', 1950, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 70' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 71', 'Neil Gaiman', 1951, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 71' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 72', 'Isaac Asimov', 1952, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 72' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 73', 'Agatha Christie', 1953, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 73' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 74', 'Martin Fowler', 1954, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 74' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 75', 'Walter Isaacson', 1955, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 75' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 76', 'Daniel Kahneman', 1956, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 76' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 77', 'Cal Newport', 1957, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 77' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 78', 'Jane Austen', 1958, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 78' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 79', 'Haruki Murakami', 1959, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 79' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 80', 'Lois Lowry', 1960, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 80' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 81', 'Neil Gaiman', 1961, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 81' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 82', 'Isaac Asimov', 1962, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 82' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 83', 'Agatha Christie', 1963, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 83' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 84', 'Martin Fowler', 1964, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 84' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 85', 'Walter Isaacson', 1965, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 85' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 86', 'Daniel Kahneman', 1966, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 86' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 87', 'Cal Newport', 1967, 'business,career', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 87' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 88', 'Jane Austen', 1968, 'classic,drama', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 88' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 89', 'Haruki Murakami', 1969, 'romance,contemporary', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 89' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 90', 'Lois Lowry', 1970, 'young adult,adventure', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 90' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 91', 'Neil Gaiman', 1971, 'fantasy,adventure', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 91' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 92', 'Isaac Asimov', 1972, 'science fiction,space', 4, 3
where not exists (select 1 from books where title = 'Library Collection Volume 92' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 93', 'Agatha Christie', 1973, 'mystery,thriller', 5, 4
where not exists (select 1 from books where title = 'Library Collection Volume 93' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 94', 'Martin Fowler', 1974, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Library Collection Volume 94' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 95', 'Walter Isaacson', 1975, 'history,biography', 2, 1
where not exists (select 1 from books where title = 'Library Collection Volume 95' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Library Collection Volume 96', 'Daniel Kahneman', 1976, 'psychology,self-help', 3, 2
where not exists (select 1 from books where title = 'Library Collection Volume 96' and author = 'Daniel Kahneman');
