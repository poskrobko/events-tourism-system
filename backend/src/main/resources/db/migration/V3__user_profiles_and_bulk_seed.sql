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
select 'The Hobbit', 'J.R.R. Tolkien', 1937, 'fantasy,adventure', 5, 3
where not exists (select 1 from books where title = 'The Hobbit' and author = 'J.R.R. Tolkien');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Nineteen Eighty-Four', 'George Orwell', 1949, 'dystopian,political fiction', 4, 2
where not exists (select 1 from books where title = 'Nineteen Eighty-Four' and author = 'George Orwell');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Pride and Prejudice', 'Jane Austen', 1813, 'classic,romance', 6, 4
where not exists (select 1 from books where title = 'Pride and Prejudice' and author = 'Jane Austen');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Dune', 'Frank Herbert', 1965, 'science fiction,epic', 5, 2
where not exists (select 1 from books where title = 'Dune' and author = 'Frank Herbert');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Murder of Roger Ackroyd', 'Agatha Christie', 1926, 'mystery,crime', 4, 1
where not exists (select 1 from books where title = 'The Murder of Roger Ackroyd' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Left Hand of Darkness', 'Ursula K. Le Guin', 1969, 'science fiction,literary', 3, 2
where not exists (select 1 from books where title = 'The Left Hand of Darkness' and author = 'Ursula K. Le Guin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'To Kill a Mockingbird', 'Harper Lee', 1960, 'classic,historical fiction', 5, 3
where not exists (select 1 from books where title = 'To Kill a Mockingbird' and author = 'Harper Lee');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Name of the Rose', 'Umberto Eco', 1980, 'historical mystery,literary', 3, 1
where not exists (select 1 from books where title = 'The Name of the Rose' and author = 'Umberto Eco');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Neuromancer', 'William Gibson', 1984, 'cyberpunk,science fiction', 4, 2
where not exists (select 1 from books where title = 'Neuromancer' and author = 'William Gibson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Giver', 'Lois Lowry', 1993, 'young adult,dystopian', 5, 4
where not exists (select 1 from books where title = 'The Giver' and author = 'Lois Lowry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'American Gods', 'Neil Gaiman', 2001, 'fantasy,mythic fiction', 4, 2
where not exists (select 1 from books where title = 'American Gods' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Foundation', 'Isaac Asimov', 1951, 'science fiction,space opera', 5, 3
where not exists (select 1 from books where title = 'Foundation' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Clean Code', 'Robert C. Martin', 2008, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Clean Code' and author = 'Robert C. Martin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Steve Jobs', 'Walter Isaacson', 2011, 'biography,business', 3, 2
where not exists (select 1 from books where title = 'Steve Jobs' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Thinking, Fast and Slow', 'Daniel Kahneman', 2011, 'psychology,nonfiction', 4, 3
where not exists (select 1 from books where title = 'Thinking, Fast and Slow' and author = 'Daniel Kahneman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Deep Work', 'Cal Newport', 2016, 'productivity,career', 5, 4
where not exists (select 1 from books where title = 'Deep Work' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Kafka on the Shore', 'Haruki Murakami', 2002, 'magical realism,literary fiction', 4, 2
where not exists (select 1 from books where title = 'Kafka on the Shore' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Road', 'Cormac McCarthy', 2006, 'post-apocalyptic,literary fiction', 3, 1
where not exists (select 1 from books where title = 'The Road' and author = 'Cormac McCarthy');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Book Thief', 'Markus Zusak', 2005, 'historical fiction,young adult', 5, 3
where not exists (select 1 from books where title = 'The Book Thief' and author = 'Markus Zusak');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Sapiens', 'Yuval Noah Harari', 2011, 'history,nonfiction', 6, 4
where not exists (select 1 from books where title = 'Sapiens' and author = 'Yuval Noah Harari');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Beloved', 'Toni Morrison', 1987, 'historical fiction,literary', 3, 2
where not exists (select 1 from books where title = 'Beloved' and author = 'Toni Morrison');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Martian', 'Andy Weir', 2011, 'science fiction,thriller', 5, 4
where not exists (select 1 from books where title = 'The Martian' and author = 'Andy Weir');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Jane Eyre', 'Charlotte Brontë', 1847, 'classic,gothic', 4, 2
where not exists (select 1 from books where title = 'Jane Eyre' and author = 'Charlotte Brontë');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Shadow of the Wind', 'Carlos Ruiz Zafón', 2001, 'historical mystery,literary', 4, 3
where not exists (select 1 from books where title = 'The Shadow of the Wind' and author = 'Carlos Ruiz Zafón');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Alchemist', 'Paulo Coelho', 1988, 'philosophical fiction,adventure', 5, 4
where not exists (select 1 from books where title = 'The Alchemist' and author = 'Paulo Coelho');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Brave New World', 'Aldous Huxley', 1932, 'dystopian,science fiction', 4, 2
where not exists (select 1 from books where title = 'Brave New World' and author = 'Aldous Huxley');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Rebecca', 'Daphne du Maurier', 1938, 'gothic,suspense', 3, 1
where not exists (select 1 from books where title = 'Rebecca' and author = 'Daphne du Maurier');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Catcher in the Rye', 'J. D. Salinger', 1951, 'classic,coming-of-age', 4, 3
where not exists (select 1 from books where title = 'The Catcher in the Rye' and author = 'J. D. Salinger');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'A Wizard of Earthsea', 'Ursula K. Le Guin', 1968, 'fantasy,coming-of-age', 5, 4
where not exists (select 1 from books where title = 'A Wizard of Earthsea' and author = 'Ursula K. Le Guin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Handmaid''s Tale', 'Margaret Atwood', 1985, 'dystopian,speculative fiction', 4, 2
where not exists (select 1 from books where title = 'The Handmaid''s Tale' and author = 'Margaret Atwood');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Wind-Up Bird Chronicle', 'Haruki Murakami', 1994, 'literary fiction,magical realism', 3, 2
where not exists (select 1 from books where title = 'The Wind-Up Bird Chronicle' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Snow Crash', 'Neal Stephenson', 1992, 'cyberpunk,satire', 4, 2
where not exists (select 1 from books where title = 'Snow Crash' and author = 'Neal Stephenson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Dispossessed', 'Ursula K. Le Guin', 1974, 'science fiction,political fiction', 3, 2
where not exists (select 1 from books where title = 'The Dispossessed' and author = 'Ursula K. Le Guin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Murder on the Orient Express', 'Agatha Christie', 1934, 'mystery,crime', 5, 3
where not exists (select 1 from books where title = 'Murder on the Orient Express' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 1999, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'The Pragmatic Programmer' and author = 'Andrew Hunt & David Thomas');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Design of Everyday Things', 'Don Norman', 1988, 'design,nonfiction', 4, 3
where not exists (select 1 from books where title = 'The Design of Everyday Things' and author = 'Don Norman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Midnight Library', 'Matt Haig', 2020, 'contemporary,fantasy', 5, 4
where not exists (select 1 from books where title = 'The Midnight Library' and author = 'Matt Haig');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005, 'crime,thriller', 4, 2
where not exists (select 1 from books where title = 'The Girl with the Dragon Tattoo' and author = 'Stieg Larsson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Three-Body Problem', 'Liu Cixin', 2006, 'science fiction,first contact', 4, 3
where not exists (select 1 from books where title = 'The Three-Body Problem' and author = 'Liu Cixin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Remains of the Day', 'Kazuo Ishiguro', 1989, 'literary fiction,historical', 3, 2
where not exists (select 1 from books where title = 'The Remains of the Day' and author = 'Kazuo Ishiguro');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Gone Girl', 'Gillian Flynn', 2012, 'thriller,psychological', 5, 3
where not exists (select 1 from books where title = 'Gone Girl' and author = 'Gillian Flynn');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Station Eleven', 'Emily St. John Mandel', 2014, 'post-apocalyptic,literary fiction', 4, 3
where not exists (select 1 from books where title = 'Station Eleven' and author = 'Emily St. John Mandel');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Night Circus', 'Erin Morgenstern', 2011, 'fantasy,romance', 4, 2
where not exists (select 1 from books where title = 'The Night Circus' and author = 'Erin Morgenstern');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 2010, 'science,biography', 3, 2
where not exists (select 1 from books where title = 'The Immortal Life of Henrietta Lacks' and author = 'Rebecca Skloot');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'classic,philosophical fiction', 5, 4
where not exists (select 1 from books where title = 'The Little Prince' and author = 'Antoine de Saint-Exupéry');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Cloud Atlas', 'David Mitchell', 2004, 'literary fiction,science fiction', 3, 2
where not exists (select 1 from books where title = 'Cloud Atlas' and author = 'David Mitchell');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Secret History', 'Donna Tartt', 1992, 'literary fiction,psychological', 4, 2
where not exists (select 1 from books where title = 'The Secret History' and author = 'Donna Tartt');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Anxious People', 'Fredrik Backman', 2019, 'contemporary,humor', 5, 4
where not exists (select 1 from books where title = 'Anxious People' and author = 'Fredrik Backman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'All the Light We Cannot See', 'Anthony Doerr', 2014, 'historical fiction,war', 4, 3
where not exists (select 1 from books where title = 'All the Light We Cannot See' and author = 'Anthony Doerr');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Never Let Me Go', 'Kazuo Ishiguro', 2005, 'dystopian,literary fiction', 3, 2
where not exists (select 1 from books where title = 'Never Let Me Go' and author = 'Kazuo Ishiguro');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Silent Patient', 'Alex Michaelides', 2019, 'thriller,psychological', 5, 3
where not exists (select 1 from books where title = 'The Silent Patient' and author = 'Alex Michaelides');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Educated', 'Tara Westover', 2018, 'memoir,nonfiction', 4, 3
where not exists (select 1 from books where title = 'Educated' and author = 'Tara Westover');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Song of Achilles', 'Madeline Miller', 2011, 'historical fiction,myth retelling', 4, 2
where not exists (select 1 from books where title = 'The Song of Achilles' and author = 'Madeline Miller');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Goldfinch', 'Donna Tartt', 2013, 'literary fiction,coming-of-age', 3, 1
where not exists (select 1 from books where title = 'The Goldfinch' and author = 'Donna Tartt');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Project Hail Mary', 'Andy Weir', 2021, 'science fiction,adventure', 5, 4
where not exists (select 1 from books where title = 'Project Hail Mary' and author = 'Andy Weir');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Pillars of the Earth', 'Ken Follett', 1989, 'historical fiction,epic', 4, 2
where not exists (select 1 from books where title = 'The Pillars of the Earth' and author = 'Ken Follett');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 1979, 'science fiction,comedy', 5, 4
where not exists (select 1 from books where title = 'The Hitchhiker''s Guide to the Galaxy' and author = 'Douglas Adams');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Master and Margarita', 'Mikhail Bulgakov', 1967, 'satire,fantasy', 3, 2
where not exists (select 1 from books where title = 'The Master and Margarita' and author = 'Mikhail Bulgakov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Fahrenheit 451', 'Ray Bradbury', 1953, 'dystopian,science fiction', 4, 3
where not exists (select 1 from books where title = 'Fahrenheit 451' and author = 'Ray Bradbury');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Picture of Dorian Gray', 'Oscar Wilde', 1890, 'classic,gothic', 4, 2
where not exists (select 1 from books where title = 'The Picture of Dorian Gray' and author = 'Oscar Wilde');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Brothers Karamazov', 'Fyodor Dostoevsky', 1880, 'classic,philosophical', 3, 1
where not exists (select 1 from books where title = 'The Brothers Karamazov' and author = 'Fyodor Dostoevsky');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Frankenstein', 'Mary Shelley', 1818, 'classic,horror', 5, 4
where not exists (select 1 from books where title = 'Frankenstein' and author = 'Mary Shelley');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Queen''s Gambit', 'Walter Tevis', 1983, 'coming-of-age,sports drama', 4, 3
where not exists (select 1 from books where title = 'The Queen''s Gambit' and author = 'Walter Tevis');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'A Brief History of Time', 'Stephen Hawking', 1988, 'science,nonfiction', 4, 3
where not exists (select 1 from books where title = 'A Brief History of Time' and author = 'Stephen Hawking');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Graveyard Book', 'Neil Gaiman', 2008, 'fantasy,young adult', 5, 4
where not exists (select 1 from books where title = 'The Graveyard Book' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'I, Robot', 'Isaac Asimov', 1950, 'science fiction,short stories', 4, 3
where not exists (select 1 from books where title = 'I, Robot' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'And Then There Were None', 'Agatha Christie', 1939, 'mystery,thriller', 5, 3
where not exists (select 1 from books where title = 'And Then There Were None' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Refactoring', 'Martin Fowler', 1999, 'software engineering,programming', 6, 5
where not exists (select 1 from books where title = 'Refactoring' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Code Breaker', 'Walter Isaacson', 2021, 'biography,science', 3, 2
where not exists (select 1 from books where title = 'The Code Breaker' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Noise', 'Daniel Kahneman, Olivier Sibony & Cass R. Sunstein', 2021, 'psychology,decision-making', 4, 3
where not exists (select 1 from books where title = 'Noise' and author = 'Daniel Kahneman, Olivier Sibony & Cass R. Sunstein');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Digital Minimalism', 'Cal Newport', 2019, 'productivity,technology', 5, 4
where not exists (select 1 from books where title = 'Digital Minimalism' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Norwegian Wood', 'Haruki Murakami', 1987, 'literary fiction,romance', 4, 2
where not exists (select 1 from books where title = 'Norwegian Wood' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Count of Monte Cristo', 'Alexandre Dumas', 1844, 'classic,adventure', 4, 2
where not exists (select 1 from books where title = 'The Count of Monte Cristo' and author = 'Alexandre Dumas');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Life of Pi', 'Yann Martel', 2001, 'adventure,philosophical fiction', 4, 3
where not exists (select 1 from books where title = 'Life of Pi' and author = 'Yann Martel');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Paris Library', 'Janet Skeslien Charles', 2021, 'historical fiction,war', 3, 2
where not exists (select 1 from books where title = 'The Paris Library' and author = 'Janet Skeslien Charles');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Good Omens', 'Neil Gaiman & Terry Pratchett', 1990, 'fantasy,comedy', 5, 4
where not exists (select 1 from books where title = 'Good Omens' and author = 'Neil Gaiman & Terry Pratchett');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Caves of Steel', 'Isaac Asimov', 1953, 'science fiction,detective', 4, 2
where not exists (select 1 from books where title = 'The Caves of Steel' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Death on the Nile', 'Agatha Christie', 1937, 'mystery,crime', 5, 3
where not exists (select 1 from books where title = 'Death on the Nile' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Patterns of Enterprise Application Architecture', 'Martin Fowler', 2002, 'software engineering,architecture', 5, 4
where not exists (select 1 from books where title = 'Patterns of Enterprise Application Architecture' and author = 'Martin Fowler');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Leonardo da Vinci', 'Walter Isaacson', 2017, 'biography,history', 3, 2
where not exists (select 1 from books where title = 'Leonardo da Vinci' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Undoing Project', 'Michael Lewis', 2016, 'psychology,biography', 4, 3
where not exists (select 1 from books where title = 'The Undoing Project' and author = 'Michael Lewis');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'So Good They Can''t Ignore You', 'Cal Newport', 2012, 'career,self-improvement', 5, 4
where not exists (select 1 from books where title = 'So Good They Can''t Ignore You' and author = 'Cal Newport');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select '1Q84', 'Haruki Murakami', 2009, 'magical realism,literary fiction', 3, 1
where not exists (select 1 from books where title = '1Q84' and author = 'Haruki Murakami');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Once and Future King', 'T. H. White', 1958, 'fantasy,classic', 4, 2
where not exists (select 1 from books where title = 'The Once and Future King' and author = 'T. H. White');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Dracula', 'Bram Stoker', 1897, 'classic,horror', 5, 4
where not exists (select 1 from books where title = 'Dracula' and author = 'Bram Stoker');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Ocean at the End of the Lane', 'Neil Gaiman', 2013, 'fantasy,literary fiction', 4, 3
where not exists (select 1 from books where title = 'The Ocean at the End of the Lane' and author = 'Neil Gaiman');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Gods Themselves', 'Isaac Asimov', 1972, 'science fiction,hard science fiction', 3, 2
where not exists (select 1 from books where title = 'The Gods Themselves' and author = 'Isaac Asimov');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Crooked House', 'Agatha Christie', 1949, 'mystery,crime', 4, 2
where not exists (select 1 from books where title = 'Crooked House' and author = 'Agatha Christie');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Domain-Driven Design', 'Eric Evans', 2003, 'software engineering,architecture', 5, 4
where not exists (select 1 from books where title = 'Domain-Driven Design' and author = 'Eric Evans');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Einstein: His Life and Universe', 'Walter Isaacson', 2007, 'biography,science', 3, 2
where not exists (select 1 from books where title = 'Einstein: His Life and Universe' and author = 'Walter Isaacson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Nudge', 'Richard H. Thaler & Cass R. Sunstein', 2008, 'psychology,economics', 4, 3
where not exists (select 1 from books where title = 'Nudge' and author = 'Richard H. Thaler & Cass R. Sunstein');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'A Game of Thrones', 'George R. R. Martin', 1996, 'fantasy,epic', 5, 3
where not exists (select 1 from books where title = 'A Game of Thrones' and author = 'George R. R. Martin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Amazing Adventures of Kavalier & Clay', 'Michael Chabon', 2000, 'historical fiction,literary', 3, 2
where not exists (select 1 from books where title = 'The Amazing Adventures of Kavalier & Clay' and author = 'Michael Chabon');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Wolf Hall', 'Hilary Mantel', 2009, 'historical fiction,political', 4, 2
where not exists (select 1 from books where title = 'Wolf Hall' and author = 'Hilary Mantel');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Pachinko', 'Min Jin Lee', 2017, 'historical fiction,family saga', 4, 3
where not exists (select 1 from books where title = 'Pachinko' and author = 'Min Jin Lee');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Priory of the Orange Tree', 'Samantha Shannon', 2019, 'fantasy,epic', 4, 2
where not exists (select 1 from books where title = 'The Priory of the Orange Tree' and author = 'Samantha Shannon');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The House in the Cerulean Sea', 'TJ Klune', 2020, 'fantasy,feel-good', 5, 4
where not exists (select 1 from books where title = 'The House in the Cerulean Sea' and author = 'TJ Klune');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Lies of Locke Lamora', 'Scott Lynch', 2006, 'fantasy,heist', 4, 3
where not exists (select 1 from books where title = 'The Lies of Locke Lamora' and author = 'Scott Lynch');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'A Psalm for the Wild-Built', 'Becky Chambers', 2021, 'science fiction,hopepunk', 3, 2
where not exists (select 1 from books where title = 'A Psalm for the Wild-Built' and author = 'Becky Chambers');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Paper Menagerie and Other Stories', 'Ken Liu', 2016, 'science fiction,short stories', 3, 2
where not exists (select 1 from books where title = 'The Paper Menagerie and Other Stories' and author = 'Ken Liu');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Circe', 'Madeline Miller', 2018, 'myth retelling,fantasy', 4, 3
where not exists (select 1 from books where title = 'Circe' and author = 'Madeline Miller');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'The Ministry for the Future', 'Kim Stanley Robinson', 2020, 'science fiction,climate fiction', 3, 2
where not exists (select 1 from books where title = 'The Ministry for the Future' and author = 'Kim Stanley Robinson');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'A Gentleman in Moscow', 'Amor Towles', 2016, 'historical fiction,literary', 4, 3
where not exists (select 1 from books where title = 'A Gentleman in Moscow' and author = 'Amor Towles');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Sea of Tranquility', 'Emily St. John Mandel', 2022, 'science fiction,literary fiction', 3, 2
where not exists (select 1 from books where title = 'Sea of Tranquility' and author = 'Emily St. John Mandel');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 2022, 'contemporary,literary fiction', 5, 4
where not exists (select 1 from books where title = 'Tomorrow, and Tomorrow, and Tomorrow' and author = 'Gabrielle Zevin');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Yellowface', 'R. F. Kuang', 2023, 'satire,thriller', 4, 3
where not exists (select 1 from books where title = 'Yellowface' and author = 'R. F. Kuang');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Demon Copperhead', 'Barbara Kingsolver', 2022, 'literary fiction,coming-of-age', 4, 2
where not exists (select 1 from books where title = 'Demon Copperhead' and author = 'Barbara Kingsolver');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Babel', 'R. F. Kuang', 2022, 'historical fantasy,dark academia', 4, 3
where not exists (select 1 from books where title = 'Babel' and author = 'R. F. Kuang');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Legends & Lattes', 'Travis Baldree', 2022, 'fantasy,cozy fantasy', 5, 4
where not exists (select 1 from books where title = 'Legends & Lattes' and author = 'Travis Baldree');

insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select 'Small Things Like These', 'Claire Keegan', 2021, 'historical fiction,literary', 3, 2
where not exists (select 1 from books where title = 'Small Things Like These' and author = 'Claire Keegan');
