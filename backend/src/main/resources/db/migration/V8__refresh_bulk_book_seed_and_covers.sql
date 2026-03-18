create temporary table tmp_seed_books (
    seed_no integer,
    old_title varchar(255),
    title varchar(255),
    author varchar(255),
    publication_year integer,
    genres_csv varchar(255),
    total_copies integer,
    available_copies integer,
    isbn varchar(32),
    publisher varchar(255),
    language varchar(64),
    page_count integer,
    description varchar(2000),
    primary_color varchar(16),
    accent_color varchar(16),
    slug varchar(255)
) on commit drop;

insert into tmp_seed_books (
    seed_no, old_title, title, author, publication_year, genres_csv, total_copies, available_copies,
    isbn, publisher, language, page_count, description, primary_color, accent_color, slug
)
values
    (1, 'Library Collection Volume 1', 'The Hobbit', 'J.R.R. Tolkien', 1937, 'fantasy,adventure', 5, 3, '9781000000016', 'George Allen & Unwin', 'English', 310, 'Bilbo Baggins leaves his comfortable hobbit-hole for a treasure hunt that grows into an adventure about courage, friendship, and choosing mercy over greed.', '#312e81', '#7c3aed', 'the-hobbit'),
    (2, 'Library Collection Volume 2', 'Nineteen Eighty-Four', 'George Orwell', 1949, 'dystopian,political fiction', 4, 2, '9781000000023', 'Secker & Warburg', 'English', 328, 'Orwell''s bleak portrait of total surveillance follows Winston Smith as he struggles to keep private thoughts alive in a state built on fear and revisionism.', '#1f2937', '#6366f1', 'nineteen-eighty-four'),
    (3, 'Library Collection Volume 3', 'Pride and Prejudice', 'Jane Austen', 1813, 'classic,romance', 6, 4, '9781000000030', 'T. Egerton', 'English', 432, 'Elizabeth Bennet and Mr. Darcy navigate pride, misunderstanding, and social expectation in one of the sharpest and warmest comedies of manners ever written.', '#78350f', '#fbbf24', 'pride-and-prejudice'),
    (4, 'Library Collection Volume 4', 'Dune', 'Frank Herbert', 1965, 'science fiction,epic', 5, 2, '9781000000047', 'Chilton Books', 'English', 412, 'On the desert world Arrakis, Paul Atreides is drawn into a struggle over empire, ecology, prophecy, and the spice that powers interstellar civilization.', '#0f172a', '#0ea5e9', 'dune'),
    (5, 'Library Collection Volume 5', 'The Murder of Roger Ackroyd', 'Agatha Christie', 1926, 'mystery,crime', 4, 1, '9781000000054', 'William Collins, Sons', 'English', 312, 'Hercule Poirot investigates a country-house murder in a case famous for its elegant clues and one of the most daring endings in detective fiction.', '#1f2937', '#b91c1c', 'the-murder-of-roger-ackroyd'),
    (6, 'Library Collection Volume 6', 'The Left Hand of Darkness', 'Ursula K. Le Guin', 1969, 'science fiction,literary', 3, 2, '9781000000061', 'Ace Books', 'English', 304, 'An envoy to the icy planet Gethen learns how politics, loyalty, and gender shape culture in Le Guin''s thoughtful and humane classic.', '#0f172a', '#0ea5e9', 'the-left-hand-of-darkness'),
    (7, 'Library Collection Volume 7', 'To Kill a Mockingbird', 'Harper Lee', 1960, 'classic,historical fiction', 5, 3, '9781000000078', 'J. B. Lippincott & Co.', 'English', 336, 'Scout Finch remembers a childhood shaped by injustice, empathy, and her father''s quiet moral courage in Depression-era Alabama.', '#78350f', '#fbbf24', 'to-kill-a-mockingbird'),
    (8, 'Library Collection Volume 8', 'The Name of the Rose', 'Umberto Eco', 1980, 'historical mystery,literary', 3, 1, '9781000000085', 'Bompiani', 'Italian', 536, 'A Franciscan friar investigates a string of deaths in a medieval abbey where theology, politics, and hidden books become equally dangerous.', '#1f2937', '#6366f1', 'the-name-of-the-rose'),
    (9, 'Library Collection Volume 9', 'Neuromancer', 'William Gibson', 1984, 'cyberpunk,science fiction', 4, 2, '9781000000092', 'Ace Books', 'English', 271, 'A washed-up hacker gets one last job and plunges into a world of artificial intelligence, corporate intrigue, and neon-lit virtual space.', '#0f172a', '#0ea5e9', 'neuromancer'),
    (10, 'Library Collection Volume 10', 'The Giver', 'Lois Lowry', 1993, 'young adult,dystopian', 5, 4, '9781000000108', 'Houghton Mifflin', 'English', 240, 'Jonas grows up in an orderly community that has traded away pain and choice, until memory teaches him what a fully human life costs.', '#1d4ed8', '#60a5fa', 'the-giver'),
    (11, 'Library Collection Volume 11', 'American Gods', 'Neil Gaiman', 2001, 'fantasy,mythic fiction', 4, 2, '9781000000115', 'William Morrow', 'English', 465, 'Fresh out of prison, Shadow Moon becomes bodyguard to a mysterious grifter and is swept into a war between old gods and new American obsessions.', '#312e81', '#7c3aed', 'american-gods'),
    (12, 'Library Collection Volume 12', 'Foundation', 'Isaac Asimov', 1951, 'science fiction,space opera', 5, 3, '9781000000122', 'Gnome Press', 'English', 255, 'As the Galactic Empire declines, Hari Seldon''s followers try to shorten a coming dark age by preserving knowledge and planning for history at scale.', '#0f172a', '#0ea5e9', 'foundation'),
    (13, 'Library Collection Volume 13', 'Clean Code', 'Robert C. Martin', 2008, 'software engineering,programming', 6, 5, '9781000000139', 'Prentice Hall', 'English', 464, 'Martin distills habits for naming, structuring, and testing code so that software remains readable and adaptable as systems evolve.', '#0b3b2e', '#10b981', 'clean-code'),
    (14, 'Library Collection Volume 14', 'Steve Jobs', 'Walter Isaacson', 2011, 'biography,business', 3, 2, '9781000000146', 'Simon & Schuster', 'English', 656, 'Based on extensive interviews, this biography traces Steve Jobs''s exacting standards, contradictions, and influence on modern product design.', '#4c1d95', '#f59e0b', 'steve-jobs'),
    (15, 'Library Collection Volume 15', 'Thinking, Fast and Slow', 'Daniel Kahneman', 2011, 'psychology,nonfiction', 4, 3, '9781000000153', 'Farrar, Straus and Giroux', 'English', 499, 'Kahneman explains how intuitive and deliberate thinking interact, revealing why human judgment is both impressively efficient and predictably biased.', '#7c2d12', '#fb7185', 'thinking-fast-and-slow'),
    (16, 'Library Collection Volume 16', 'Deep Work', 'Cal Newport', 2016, 'productivity,career', 5, 4, '9781000000160', 'Grand Central Publishing', 'English', 304, 'Newport argues that focused, uninterrupted concentration is a rare and valuable skill, and offers practical ways to cultivate it.', '#164e63', '#06b6d4', 'deep-work'),
    (17, 'Library Collection Volume 17', 'Kafka on the Shore', 'Haruki Murakami', 2002, 'magical realism,literary fiction', 4, 2, '9781000000177', 'Shinchosha', 'Japanese', 505, 'Two interlaced quests—one by a runaway teenager and one by an aging simpleton—unfold in a dreamlike world of music, prophecy, and talking cats.', '#1e293b', '#a855f7', 'kafka-on-the-shore'),
    (18, 'Library Collection Volume 18', 'The Road', 'Cormac McCarthy', 2006, 'post-apocalyptic,literary fiction', 3, 1, '9781000000184', 'Alfred A. Knopf', 'English', 287, 'A father and son travel through a burned America, clinging to tenderness and moral resolve in a landscape stripped nearly bare.', '#1e293b', '#a855f7', 'the-road'),
    (19, 'Library Collection Volume 19', 'The Book Thief', 'Markus Zusak', 2005, 'historical fiction,young adult', 5, 3, '9781000000191', 'Picador', 'English', 552, 'Narrated by Death, the novel follows Liesel Meminger as she discovers books, friendship, and small acts of defiance in Nazi Germany.', '#3f3f46', '#f97316', 'the-book-thief'),
    (20, 'Library Collection Volume 20', 'Sapiens', 'Yuval Noah Harari', 2011, 'history,nonfiction', 6, 4, '9781000000207', 'Harvill Secker', 'English', 443, 'Harari surveys human history from prehistoric foragers to global networks, focusing on the stories and institutions that let strangers cooperate.', '#334155', '#94a3b8', 'sapiens'),
    (21, 'Library Collection Volume 21', 'Beloved', 'Toni Morrison', 1987, 'historical fiction,literary', 3, 2, '9781000000214', 'Alfred A. Knopf', 'English', 324, 'Morrison explores memory, motherhood, and the afterlife of slavery through a haunting story centered on Sethe and the house at 124 Bluestone Road.', '#3f3f46', '#f97316', 'beloved'),
    (22, 'Library Collection Volume 22', 'The Martian', 'Andy Weir', 2011, 'science fiction,thriller', 5, 4, '9781000000221', 'Crown Publishing Group', 'English', 387, 'Stranded on Mars after a mission disaster, Mark Watney survives through ingenuity, gallows humor, and relentless problem-solving.', '#0f172a', '#0ea5e9', 'the-martian'),
    (23, 'Library Collection Volume 23', 'Jane Eyre', 'Charlotte Brontë', 1847, 'classic,gothic', 4, 2, '9781000000238', 'Smith, Elder & Co.', 'English', 500, 'Jane Eyre''s fierce sense of self carries her from hardship to independence, love, and moral clarity in Brontë''s enduring novel.', '#78350f', '#fbbf24', 'jane-eyre'),
    (24, 'Library Collection Volume 24', 'The Shadow of the Wind', 'Carlos Ruiz Zafón', 2001, 'historical mystery,literary', 4, 3, '9781000000245', 'Planeta', 'Spanish', 487, 'In postwar Barcelona, a boy''s search for the author of a forgotten novel becomes a labyrinth of secrets, obsession, and literary intrigue.', '#1f2937', '#6366f1', 'the-shadow-of-the-wind'),
    (25, 'Library Collection Volume 25', 'The Alchemist', 'Paulo Coelho', 1988, 'philosophical fiction,adventure', 5, 4, '9781000000252', 'HarperTorch', 'Portuguese', 208, 'Santiago''s journey from Andalusia to the pyramids becomes a fable about listening to desire, reading omens, and pursuing personal destiny.', '#1f2937', '#6366f1', 'the-alchemist'),
    (26, 'Library Collection Volume 26', 'Brave New World', 'Aldous Huxley', 1932, 'dystopian,science fiction', 4, 2, '9781000000269', 'Chatto & Windus', 'English', 311, 'Huxley imagines a future built on engineered happiness, mass production, and social stability, then asks what freedom and truth are worth.', '#0f172a', '#0ea5e9', 'brave-new-world'),
    (27, 'Library Collection Volume 27', 'Rebecca', 'Daphne du Maurier', 1938, 'gothic,suspense', 3, 1, '9781000000276', 'Victor Gollancz', 'English', 449, 'A young bride arrives at Manderley and finds herself overshadowed by the memory of her husband''s charismatic first wife.', '#1f2937', '#6366f1', 'rebecca'),
    (28, 'Library Collection Volume 28', 'The Catcher in the Rye', 'J. D. Salinger', 1951, 'classic,coming-of-age', 4, 3, '9781000000283', 'Little, Brown and Company', 'English', 277, 'Holden Caulfield roams New York after leaving school, narrating adolescent grief, alienation, and flashes of tenderness in a voice that remains instantly recognizable.', '#78350f', '#fbbf24', 'the-catcher-in-the-rye'),
    (29, 'Library Collection Volume 29', 'A Wizard of Earthsea', 'Ursula K. Le Guin', 1968, 'fantasy,coming-of-age', 5, 4, '9781000000290', 'Parnassus Press', 'English', 205, 'Ged''s early hunger for power unleashes a shadow he must understand and face, making this a compact and profound fantasy about balance.', '#312e81', '#7c3aed', 'a-wizard-of-earthsea'),
    (30, 'Library Collection Volume 30', 'The Handmaid''s Tale', 'Margaret Atwood', 1985, 'dystopian,speculative fiction', 4, 2, '9781000000306', 'McClelland and Stewart', 'English', 311, 'In the theocracy of Gilead, Offred survives by observing, remembering, and preserving an inner life under authoritarian control.', '#1f2937', '#6366f1', 'the-handmaid-s-tale'),
    (31, 'Library Collection Volume 31', 'The Wind-Up Bird Chronicle', 'Haruki Murakami', 1994, 'literary fiction,magical realism', 3, 2, '9781000000313', 'Shinchosha', 'Japanese', 607, 'A missing cat leads Toru Okada into wells, war memories, and eerie encounters in Murakami''s sprawling meditation on violence and loneliness.', '#1e293b', '#a855f7', 'the-wind-up-bird-chronicle'),
    (32, 'Library Collection Volume 32', 'Snow Crash', 'Neal Stephenson', 1992, 'cyberpunk,satire', 4, 2, '9781000000320', 'Bantam Books', 'English', 470, 'Hiro Protagonist races through a hyper-commercialized future where virtual worlds, ancient language, and a dangerous meme-like virus collide.', '#7f1d1d', '#f97316', 'snow-crash'),
    (33, 'Library Collection Volume 33', 'The Dispossessed', 'Ursula K. Le Guin', 1974, 'science fiction,political fiction', 3, 2, '9781000000337', 'Harper & Row', 'English', 387, 'A physicist leaves an austere anarchist moon for its wealthy rival planet, testing whether freedom can survive institutions of any kind.', '#0f172a', '#0ea5e9', 'the-dispossessed'),
    (34, 'Library Collection Volume 34', 'Murder on the Orient Express', 'Agatha Christie', 1934, 'mystery,crime', 5, 3, '9781000000344', 'Collins Crime Club', 'English', 256, 'Poirot investigates a murder aboard a snowbound luxury train where every passenger has a secret and justice refuses to stay simple.', '#1f2937', '#b91c1c', 'murder-on-the-orient-express'),
    (35, 'Library Collection Volume 35', 'The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 1999, 'software engineering,programming', 6, 5, '9781000000351', 'Addison-Wesley', 'English', 352, 'This influential guide blends mindset and practice, encouraging developers to take ownership, automate repetition, and keep learning deliberately.', '#0b3b2e', '#10b981', 'the-pragmatic-programmer'),
    (36, 'Library Collection Volume 36', 'The Design of Everyday Things', 'Don Norman', 1988, 'design,nonfiction', 4, 3, '9781000000368', 'Basic Books', 'English', 368, 'Norman shows how thoughtful design makes objects understandable and humane, while bad design forces users to absorb the blame.', '#334155', '#94a3b8', 'the-design-of-everyday-things'),
    (37, 'Library Collection Volume 37', 'The Midnight Library', 'Matt Haig', 2020, 'contemporary,fantasy', 5, 4, '9781000000375', 'Canongate Books', 'English', 304, 'Between life and death, Nora Seed explores alternate versions of her existence and learns how regret reshapes the stories people tell about themselves.', '#155e75', '#22c55e', 'the-midnight-library'),
    (38, 'Library Collection Volume 38', 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005, 'crime,thriller', 4, 2, '9781000000382', 'Norstedts Förlag', 'Swedish', 465, 'Journalist Mikael Blomkvist and hacker Lisbeth Salander investigate a family disappearance tied to corruption, violence, and financial deceit.', '#111827', '#ef4444', 'the-girl-with-the-dragon-tattoo'),
    (39, 'Library Collection Volume 39', 'The Three-Body Problem', 'Liu Cixin', 2006, 'science fiction,first contact', 4, 3, '9781000000399', 'Chongqing Press', 'Chinese', 400, 'A secret military project, the Cultural Revolution, and an alien civilization converge in a hard-science mystery with vast cosmic stakes.', '#0f172a', '#0ea5e9', 'the-three-body-problem'),
    (40, 'Library Collection Volume 40', 'The Remains of the Day', 'Kazuo Ishiguro', 1989, 'literary fiction,historical', 3, 2, '9781000000405', 'Faber and Faber', 'English', 258, 'An aging English butler reviews a life of service, repression, and missed chances while motoring through the countryside.', '#1e293b', '#a855f7', 'the-remains-of-the-day'),
    (41, 'Library Collection Volume 41', 'Gone Girl', 'Gillian Flynn', 2012, 'thriller,psychological', 5, 3, '9781000000412', 'Crown Publishing Group', 'English', 432, 'Flynn dissects marriage, media spectacle, and self-invention through the disappearance of Amy Dunne and the poisonous narratives surrounding it.', '#111827', '#ef4444', 'gone-girl'),
    (42, 'Library Collection Volume 42', 'Station Eleven', 'Emily St. John Mandel', 2014, 'post-apocalyptic,literary fiction', 4, 3, '9781000000429', 'Knopf Canada', 'English', 352, 'After a flu pandemic collapses the world, artists and survivors keep moving, performing, and preserving memory across a fractured Great Lakes region.', '#1e293b', '#a855f7', 'station-eleven'),
    (43, 'Library Collection Volume 43', 'The Night Circus', 'Erin Morgenstern', 2011, 'fantasy,romance', 4, 2, '9781000000436', 'Doubleday', 'English', 387, 'A magical competition hidden inside an itinerant black-and-white circus becomes a lush love story shaped by illusion, discipline, and wonder.', '#312e81', '#7c3aed', 'the-night-circus'),
    (44, 'Library Collection Volume 44', 'The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 2010, 'science,biography', 3, 2, '9781000000443', 'Crown Publishing Group', 'English', 381, 'Skloot traces the woman behind the HeLa cell line and explores the ethical questions surrounding race, consent, and medical discovery.', '#4c1d95', '#f59e0b', 'the-immortal-life-of-henrietta-lacks'),
    (45, 'Library Collection Volume 45', 'The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'classic,philosophical fiction', 5, 4, '9781000000450', 'Reynal & Hitchcock', 'French', 96, 'This poetic novella uses a pilot''s encounter with a mysterious child to reflect on loneliness, imagination, love, and adult absurdity.', '#78350f', '#fbbf24', 'the-little-prince'),
    (46, 'Library Collection Volume 46', 'Cloud Atlas', 'David Mitchell', 2004, 'literary fiction,science fiction', 3, 2, '9781000000467', 'Sceptre', 'English', 544, 'Mitchell links six stories across centuries, showing how power, exploitation, and moral choice echo from one era into the next.', '#1e293b', '#a855f7', 'cloud-atlas'),
    (47, 'Library Collection Volume 47', 'The Secret History', 'Donna Tartt', 1992, 'literary fiction,psychological', 4, 2, '9781000000474', 'Alfred A. Knopf', 'English', 559, 'A classics student falls in with an elite group whose devotion to beauty and intellectual intensity turns fatally destructive.', '#1e293b', '#a855f7', 'the-secret-history'),
    (48, 'Library Collection Volume 48', 'Anxious People', 'Fredrik Backman', 2019, 'contemporary,humor', 5, 4, '9781000000481', 'Forum', 'Swedish', 352, 'A failed bank robbery turns into an accidental hostage situation, allowing Backman to weave comedy and compassion through a cast of wounded strangers.', '#155e75', '#22c55e', 'anxious-people'),
    (49, 'Library Collection Volume 49', 'All the Light We Cannot See', 'Anthony Doerr', 2014, 'historical fiction,war', 4, 3, '9781000000498', 'Scribner', 'English', 531, 'The paths of a blind French girl and a gifted German boy converge during World War II in a novel attentive to radios, memory, and fragile acts of kindness.', '#3f3f46', '#f97316', 'all-the-light-we-cannot-see'),
    (50, 'Library Collection Volume 50', 'Never Let Me Go', 'Kazuo Ishiguro', 2005, 'dystopian,literary fiction', 3, 2, '9781000000504', 'Faber and Faber', 'English', 304, 'Students at an English boarding school slowly realize the truth about their futures in Ishiguro''s devastating meditation on care and mortality.', '#1e293b', '#a855f7', 'never-let-me-go'),
    (51, 'Library Collection Volume 51', 'The Silent Patient', 'Alex Michaelides', 2019, 'thriller,psychological', 5, 3, '9781000000511', 'Celadon Books', 'English', 336, 'A psychotherapist becomes obsessed with a famous painter who has not spoken since the night she shot her husband.', '#111827', '#ef4444', 'the-silent-patient'),
    (52, 'Library Collection Volume 52', 'Educated', 'Tara Westover', 2018, 'memoir,nonfiction', 4, 3, '9781000000528', 'Random House', 'English', 352, 'Westover recounts her path from an isolated survivalist upbringing to higher education, emphasizing how learning can both fracture and rebuild identity.', '#334155', '#94a3b8', 'educated'),
    (53, 'Library Collection Volume 53', 'The Song of Achilles', 'Madeline Miller', 2011, 'historical fiction,myth retelling', 4, 2, '9781000000535', 'Ecco Press', 'English', 416, 'Patroclus narrates a luminous retelling of the Trojan War that focuses on intimacy, fate, and the cost of heroic glory.', '#3f3f46', '#f97316', 'the-song-of-achilles'),
    (54, 'Library Collection Volume 54', 'The Goldfinch', 'Donna Tartt', 2013, 'literary fiction,coming-of-age', 3, 1, '9781000000542', 'Little, Brown and Company', 'English', 771, 'After surviving an explosion at a museum, Theo Decker spends years drifting through grief, art, crime, and reinvention.', '#1e293b', '#a855f7', 'the-goldfinch'),
    (55, 'Library Collection Volume 55', 'Project Hail Mary', 'Andy Weir', 2021, 'science fiction,adventure', 5, 4, '9781000000559', 'Ballantine Books', 'English', 496, 'A lone astronaut wakes with fragmented memories and must solve an extinction-level crisis through science, improvisation, and unexpected friendship.', '#0f172a', '#0ea5e9', 'project-hail-mary'),
    (56, 'Library Collection Volume 56', 'The Pillars of the Earth', 'Ken Follett', 1989, 'historical fiction,epic', 4, 2, '9781000000566', 'Macmillan', 'English', 973, 'Follett follows builders, nobles, and clergy across decades as a cathedral rises amid ambition, famine, civil war, and devotion.', '#3f3f46', '#f97316', 'the-pillars-of-the-earth'),
    (57, 'Library Collection Volume 57', 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 1979, 'science fiction,comedy', 5, 4, '9781000000573', 'Pan Books', 'English', 224, 'Arthur Dent''s ordinary life ends when Earth is demolished, launching him into absurd interstellar misadventures with a towel and very bad timing.', '#0f172a', '#0ea5e9', 'the-hitchhiker-s-guide-to-the-galaxy'),
    (58, 'Library Collection Volume 58', 'The Master and Margarita', 'Mikhail Bulgakov', 1967, 'satire,fantasy', 3, 2, '9781000000580', 'YMCA Press', 'Russian', 384, 'The Devil visits Soviet Moscow, leaving chaos, dark comedy, and a parallel tale of Pontius Pilate in Bulgakov''s dazzling satire.', '#7f1d1d', '#f97316', 'the-master-and-margarita'),
    (59, 'Library Collection Volume 59', 'Fahrenheit 451', 'Ray Bradbury', 1953, 'dystopian,science fiction', 4, 3, '9781000000597', 'Ballantine Books', 'English', 194, 'Guy Montag burns books for a living until curiosity, conversation, and loss drive him to question a culture built on distraction.', '#0f172a', '#0ea5e9', 'fahrenheit-451'),
    (60, 'Library Collection Volume 60', 'The Picture of Dorian Gray', 'Oscar Wilde', 1890, 'classic,gothic', 4, 2, '9781000000603', 'Lippincott''s Monthly Magazine', 'English', 254, 'Wilde''s novel of vanity and corruption follows a beautiful young man whose portrait bears the marks of his moral decay.', '#78350f', '#fbbf24', 'the-picture-of-dorian-gray'),
    (61, 'Library Collection Volume 61', 'The Brothers Karamazov', 'Fyodor Dostoevsky', 1880, 'classic,philosophical', 3, 1, '9781000000610', 'The Russian Messenger', 'Russian', 824, 'Dostoevsky stages a family drama that becomes a searching inquiry into faith, doubt, freedom, and responsibility.', '#78350f', '#fbbf24', 'the-brothers-karamazov'),
    (62, 'Library Collection Volume 62', 'Frankenstein', 'Mary Shelley', 1818, 'classic,horror', 5, 4, '9781000000627', 'Lackington, Hughes, Harding, Mavor & Jones', 'English', 280, 'Shelley''s tale of scientific ambition and abandonment asks what creators owe the beings they bring into the world.', '#78350f', '#fbbf24', 'frankenstein'),
    (63, 'Library Collection Volume 63', 'The Queen''s Gambit', 'Walter Tevis', 1983, 'coming-of-age,sports drama', 4, 3, '9781000000634', 'Random House', 'English', 256, 'Orphan and chess prodigy Beth Harmon battles addiction, loneliness, and the pressure of genius as she climbs the international chess world.', '#1f2937', '#6366f1', 'the-queen-s-gambit'),
    (64, 'Library Collection Volume 64', 'A Brief History of Time', 'Stephen Hawking', 1988, 'science,nonfiction', 4, 3, '9781000000641', 'Bantam Dell Publishing Group', 'English', 256, 'Hawking offers an accessible tour of cosmology, introducing black holes, the Big Bang, and the search for a unified theory of physics.', '#334155', '#94a3b8', 'a-brief-history-of-time'),
    (65, 'Library Collection Volume 65', 'The Graveyard Book', 'Neil Gaiman', 2008, 'fantasy,young adult', 5, 4, '9781000000658', 'HarperCollins', 'English', 312, 'Raised by ghosts in a cemetery after his family is murdered, Nobody Owens grows up between the living and the dead.', '#312e81', '#7c3aed', 'the-graveyard-book'),
    (66, 'Library Collection Volume 66', 'I, Robot', 'Isaac Asimov', 1950, 'science fiction,short stories', 4, 3, '9781000000665', 'Gnome Press', 'English', 224, 'Asimov''s linked stories use the famous Three Laws of Robotics to explore logic, unintended consequences, and the ethics of intelligent machines.', '#0f172a', '#0ea5e9', 'i-robot'),
    (67, 'Library Collection Volume 67', 'And Then There Were None', 'Agatha Christie', 1939, 'mystery,thriller', 5, 3, '9781000000672', 'Collins Crime Club', 'English', 272, 'Ten strangers are invited to an island, where accusation and fear mount as they begin dying one by one.', '#1f2937', '#b91c1c', 'and-then-there-were-none'),
    (68, 'Library Collection Volume 68', 'Refactoring', 'Martin Fowler', 1999, 'software engineering,programming', 6, 5, '9781000000689', 'Addison-Wesley', 'English', 448, 'Fowler catalogues disciplined ways to improve code structure without changing behavior, making technical debt visible and manageable.', '#0b3b2e', '#10b981', 'refactoring'),
    (69, 'Library Collection Volume 69', 'The Code Breaker', 'Walter Isaacson', 2021, 'biography,science', 3, 2, '9781000000696', 'Simon & Schuster', 'English', 560, 'Isaacson chronicles Jennifer Doudna, CRISPR, and the scientific, personal, and ethical race to rewrite the code of life.', '#4c1d95', '#f59e0b', 'the-code-breaker'),
    (70, 'Library Collection Volume 70', 'Noise', 'Daniel Kahneman, Olivier Sibony & Cass R. Sunstein', 2021, 'psychology,decision-making', 4, 3, '9781000000702', 'Little, Brown Spark', 'English', 464, 'The authors examine unwanted variability in judgment and show how organizations can reduce costly inconsistency in medicine, law, and business.', '#7c2d12', '#fb7185', 'noise'),
    (71, 'Library Collection Volume 71', 'Digital Minimalism', 'Cal Newport', 2019, 'productivity,technology', 5, 4, '9781000000719', 'Portfolio', 'English', 304, 'Newport proposes a philosophy of technology use that favors intention, depth, and reclaimed attention over constant digital stimulation.', '#164e63', '#06b6d4', 'digital-minimalism'),
    (72, 'Library Collection Volume 72', 'Norwegian Wood', 'Haruki Murakami', 1987, 'literary fiction,romance', 4, 2, '9781000000726', 'Kodansha', 'Japanese', 296, 'Set against student unrest in late-1960s Tokyo, Murakami''s tender novel explores desire, grief, and the difficulty of growing up.', '#1e293b', '#a855f7', 'norwegian-wood'),
    (73, 'Library Collection Volume 73', 'The Count of Monte Cristo', 'Alexandre Dumas', 1844, 'classic,adventure', 4, 2, '9781000000733', 'Pétion', 'French', 1276, 'Wrongfully imprisoned Edmond Dantès returns with immense wealth and patient plans for revenge in Dumas''s grand adventure.', '#78350f', '#fbbf24', 'the-count-of-monte-cristo'),
    (74, 'Library Collection Volume 74', 'Life of Pi', 'Yann Martel', 2001, 'adventure,philosophical fiction', 4, 3, '9781000000740', 'Knopf Canada', 'English', 326, 'After a shipwreck, teenage Pi Patel survives on a lifeboat with a Bengal tiger, turning endurance into a meditation on belief and storytelling.', '#1f2937', '#6366f1', 'life-of-pi'),
    (75, 'Library Collection Volume 75', 'The Paris Library', 'Janet Skeslien Charles', 2021, 'historical fiction,war', 3, 2, '9781000000757', 'Atria Books', 'English', 368, 'Inspired by the American Library in Paris, the novel connects occupied France, librarianship, and the long reach of wartime choices.', '#3f3f46', '#f97316', 'the-paris-library'),
    (76, 'Library Collection Volume 76', 'Good Omens', 'Neil Gaiman & Terry Pratchett', 1990, 'fantasy,comedy', 5, 4, '9781000000764', 'Workman Publishing', 'English', 432, 'An angel and a demon who have grown fond of Earth try to prevent the apocalypse, with delightfully incompetent help from all sides.', '#312e81', '#7c3aed', 'good-omens'),
    (77, 'Library Collection Volume 77', 'The Caves of Steel', 'Isaac Asimov', 1953, 'science fiction,detective', 4, 2, '9781000000771', 'Doubleday', 'English', 224, 'Detective Elijah Baley and robot partner R. Daneel Olivaw investigate a murder that exposes fault lines between Earth and Spacer society.', '#0f172a', '#0ea5e9', 'the-caves-of-steel'),
    (78, 'Library Collection Volume 78', 'Death on the Nile', 'Agatha Christie', 1937, 'mystery,crime', 5, 3, '9781000000788', 'Collins Crime Club', 'English', 333, 'A luxury cruise on the Nile turns deadly, giving Poirot a glittering but emotionally tangled case to untangle.', '#1f2937', '#b91c1c', 'death-on-the-nile'),
    (79, 'Library Collection Volume 79', 'Patterns of Enterprise Application Architecture', 'Martin Fowler', 2002, 'software engineering,architecture', 5, 4, '9781000000795', 'Addison-Wesley', 'English', 560, 'Fowler surveys recurring enterprise design patterns, helping teams choose proven structures for layering, data access, and transactional workflows.', '#0b3b2e', '#10b981', 'patterns-of-enterprise-application-architecture'),
    (80, 'Library Collection Volume 80', 'Leonardo da Vinci', 'Walter Isaacson', 2017, 'biography,history', 3, 2, '9781000000801', 'Simon & Schuster', 'English', 624, 'Isaacson portrays Leonardo as an insatiably curious observer whose notebooks joined art, anatomy, engineering, and performance.', '#4c1d95', '#f59e0b', 'leonardo-da-vinci'),
    (81, 'Library Collection Volume 81', 'The Undoing Project', 'Michael Lewis', 2016, 'psychology,biography', 4, 3, '9781000000818', 'W. W. Norton & Company', 'English', 368, 'Lewis tells the story of Kahneman and Tversky, showing how friendship and disagreement transformed the study of decision-making.', '#7c2d12', '#fb7185', 'the-undoing-project'),
    (82, 'Library Collection Volume 82', 'So Good They Can''t Ignore You', 'Cal Newport', 2012, 'career,self-improvement', 5, 4, '9781000000825', 'Business Plus', 'English', 288, 'Newport challenges passion-first career advice and argues that rare, valuable skills create autonomy, purpose, and satisfying work.', '#1f2937', '#6366f1', 'so-good-they-can-t-ignore-you'),
    (83, 'Library Collection Volume 83', '1Q84', 'Haruki Murakami', 2009, 'magical realism,literary fiction', 3, 1, '9781000000832', 'Shinchosha', 'Japanese', 928, 'Murakami''s alternate 1984 follows Aomame and Tengo through cults, parallel moons, and the eerie logic of a slightly shifted reality.', '#1e293b', '#a855f7', '1q84'),
    (84, 'Library Collection Volume 84', 'The Once and Future King', 'T. H. White', 1958, 'fantasy,classic', 4, 2, '9781000000849', 'Collins', 'English', 639, 'White reimagines the Arthurian cycle as a witty and melancholy study of education, power, war, and idealism.', '#312e81', '#7c3aed', 'the-once-and-future-king'),
    (85, 'Library Collection Volume 85', 'Dracula', 'Bram Stoker', 1897, 'classic,horror', 5, 4, '9781000000856', 'Archibald Constable and Company', 'English', 418, 'Told through journals and letters, Stoker''s novel pits a group of determined hunters against the predatory Count Dracula.', '#78350f', '#fbbf24', 'dracula'),
    (86, 'Library Collection Volume 86', 'The Ocean at the End of the Lane', 'Neil Gaiman', 2013, 'fantasy,literary fiction', 4, 3, '9781000000863', 'William Morrow', 'English', 181, 'A middle-aged man returns to his childhood home and recalls a brief, uncanny friendship that opened onto cosmic danger.', '#312e81', '#7c3aed', 'the-ocean-at-the-end-of-the-lane'),
    (87, 'Library Collection Volume 87', 'The Gods Themselves', 'Isaac Asimov', 1972, 'science fiction,hard science fiction', 3, 2, '9781000000870', 'Doubleday', 'English', 288, 'A breakthrough energy source turns out to connect parallel universes, forcing scientists to weigh progress against planetary catastrophe.', '#0f172a', '#0ea5e9', 'the-gods-themselves'),
    (88, 'Library Collection Volume 88', 'Crooked House', 'Agatha Christie', 1949, 'mystery,crime', 4, 2, '9781000000887', 'Dodd, Mead and Company', 'English', 240, 'When a wealthy patriarch is poisoned, suspicion circles a brilliant and deeply dysfunctional family living under one roof.', '#1f2937', '#b91c1c', 'crooked-house'),
    (89, 'Library Collection Volume 89', 'Domain-Driven Design', 'Eric Evans', 2003, 'software engineering,architecture', 5, 4, '9781000000894', 'Addison-Wesley', 'English', 560, 'Evans lays out a shared language for modeling complex business domains and aligning software structure with real organizational knowledge.', '#0b3b2e', '#10b981', 'domain-driven-design'),
    (90, 'Library Collection Volume 90', 'Einstein: His Life and Universe', 'Walter Isaacson', 2007, 'biography,science', 3, 2, '9781000000900', 'Simon & Schuster', 'English', 704, 'This biography links Einstein''s imagination, rebelliousness, and scientific breakthroughs to the turbulent century he helped redefine.', '#4c1d95', '#f59e0b', 'einstein-his-life-and-universe'),
    (91, 'Library Collection Volume 91', 'Nudge', 'Richard H. Thaler & Cass R. Sunstein', 2008, 'psychology,economics', 4, 3, '9781000000917', 'Yale University Press', 'English', 320, 'Thaler and Sunstein explain how small design choices steer behavior and how policy can use that power without eliminating freedom of choice.', '#7c2d12', '#fb7185', 'nudge'),
    (92, 'Library Collection Volume 92', 'A Game of Thrones', 'George R. R. Martin', 1996, 'fantasy,epic', 5, 3, '9781000000924', 'Bantam Spectra', 'English', 694, 'Competing noble houses, ancient threats, and personal loyalties collide in the opening volume of a sprawling political fantasy.', '#312e81', '#7c3aed', 'a-game-of-thrones'),
    (93, 'Library Collection Volume 93', 'The Amazing Adventures of Kavalier & Clay', 'Michael Chabon', 2000, 'historical fiction,literary', 3, 2, '9781000000931', 'Random House', 'English', 639, 'Two Jewish cousins build a comic-book empire in wartime New York while wrestling with exile, ambition, and artistic identity.', '#3f3f46', '#f97316', 'the-amazing-adventures-of-kavalier-clay'),
    (94, 'Library Collection Volume 94', 'Wolf Hall', 'Hilary Mantel', 2009, 'historical fiction,political', 4, 2, '9781000000948', 'Fourth Estate', 'English', 532, 'Mantel reimagines Thomas Cromwell''s rise with sharp psychological insight and a richly textured portrait of Tudor power.', '#3f3f46', '#f97316', 'wolf-hall'),
    (95, 'Library Collection Volume 95', 'Pachinko', 'Min Jin Lee', 2017, 'historical fiction,family saga', 4, 3, '9781000000955', 'Grand Central Publishing', 'English', 496, 'Across generations, a Korean family in Japan confronts prejudice, sacrifice, and changing ideas of home and belonging.', '#3f3f46', '#f97316', 'pachinko'),
    (96, 'Library Collection Volume 96', 'The Priory of the Orange Tree', 'Samantha Shannon', 2019, 'fantasy,epic', 4, 2, '9781000000962', 'Bloomsbury Publishing', 'English', 848, 'Queens, mages, dragon riders, and divided traditions meet in a sweeping standalone fantasy about duty, faith, and ancient fire.', '#312e81', '#7c3aed', 'the-priory-of-the-orange-tree'),
    (97, 'Library Collection Volume 97', 'The House in the Cerulean Sea', 'TJ Klune', 2020, 'fantasy,feel-good', 5, 4, '9781000000979', 'Tor Books', 'English', 396, 'A by-the-book caseworker visits an orphanage for dangerous magical children and discovers a tender found-family story beneath the paperwork.', '#312e81', '#7c3aed', 'the-house-in-the-cerulean-sea'),
    (98, 'Library Collection Volume 98', 'The Lies of Locke Lamora', 'Scott Lynch', 2006, 'fantasy,heist', 4, 3, '9781000000986', 'Gollancz', 'English', 499, 'Master thief Locke Lamora runs elaborate confidence schemes in the city of Camorr until politics and underworld rivalries close in.', '#312e81', '#7c3aed', 'the-lies-of-locke-lamora'),
    (99, 'Library Collection Volume 99', 'A Psalm for the Wild-Built', 'Becky Chambers', 2021, 'science fiction,hopepunk', 3, 2, '9781000000993', 'Tordotcom', 'English', 160, 'A tea monk and a curious robot travel through a post-industrial world asking what people truly need to live meaningful lives.', '#0f172a', '#0ea5e9', 'a-psalm-for-the-wild-built'),
    (100, 'Library Collection Volume 100', 'The Paper Menagerie and Other Stories', 'Ken Liu', 2016, 'science fiction,short stories', 3, 2, '9781000001006', 'Saga Press', 'English', 450, 'Ken Liu''s collection moves from intimate family memory to speculative wonder, pairing emotional precision with inventive ideas.', '#0f172a', '#0ea5e9', 'the-paper-menagerie-and-other-stories'),
    (101, 'Library Collection Volume 101', 'Circe', 'Madeline Miller', 2018, 'myth retelling,fantasy', 4, 3, '9781000001013', 'Little, Brown and Company', 'English', 393, 'Miller gives the witch of Aiaia a voice of her own, turning exile into a story of craft, power, and self-possession.', '#312e81', '#7c3aed', 'circe'),
    (102, 'Library Collection Volume 102', 'The Ministry for the Future', 'Kim Stanley Robinson', 2020, 'science fiction,climate fiction', 3, 2, '9781000001020', 'Orbit', 'English', 563, 'Robinson imagines institutions, activists, and technologists wrestling with climate catastrophe through interconnected episodes of policy and survival.', '#0f172a', '#0ea5e9', 'the-ministry-for-the-future'),
    (103, 'Library Collection Volume 103', 'A Gentleman in Moscow', 'Amor Towles', 2016, 'historical fiction,literary', 4, 3, '9781000001037', 'Viking', 'English', 462, 'Confined to a Moscow hotel after the Russian Revolution, Count Rostov fashions a full life from ritual, friendship, and grace under pressure.', '#3f3f46', '#f97316', 'a-gentleman-in-moscow'),
    (104, 'Library Collection Volume 104', 'Sea of Tranquility', 'Emily St. John Mandel', 2022, 'science fiction,literary fiction', 3, 2, '9781000001044', 'Knopf', 'English', 272, 'Linked lives across centuries investigate a strange anomaly that folds together time travel, pandemics, performance, and memory.', '#0f172a', '#0ea5e9', 'sea-of-tranquility'),
    (105, 'Library Collection Volume 105', 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 2022, 'contemporary,literary fiction', 5, 4, '9781000001051', 'Alfred A. Knopf', 'English', 416, 'Two friends spend decades building video games and testing the limits of collaboration, rivalry, care, and creative obsession.', '#155e75', '#22c55e', 'tomorrow-and-tomorrow-and-tomorrow'),
    (106, 'Library Collection Volume 106', 'Yellowface', 'R. F. Kuang', 2023, 'satire,thriller', 4, 3, '9781000001068', 'William Morrow', 'English', 336, 'Kuang''s sharp contemporary novel follows a struggling writer whose act of literary theft spirals into viral fame and corrosive self-justification.', '#7f1d1d', '#f97316', 'yellowface'),
    (107, 'Library Collection Volume 107', 'Demon Copperhead', 'Barbara Kingsolver', 2022, 'literary fiction,coming-of-age', 4, 2, '9781000001075', 'Harper', 'English', 560, 'Kingsolver relocates Dickensian breadth to modern Appalachia, following a resilient boy through foster care, addiction, and hard-won self-knowledge.', '#1e293b', '#a855f7', 'demon-copperhead'),
    (108, 'Library Collection Volume 108', 'Babel', 'R. F. Kuang', 2022, 'historical fantasy,dark academia', 4, 3, '9781000001082', 'Harper Voyager', 'English', 560, 'At an alternate Oxford powered by translation magic, scholarship and empire become inseparable in a story about language, power, and resistance.', '#1f2937', '#6366f1', 'babel'),
    (109, 'Library Collection Volume 109', 'Legends & Lattes', 'Travis Baldree', 2022, 'fantasy,cozy fantasy', 5, 4, '9781000001099', 'Tor Books', 'English', 304, 'An orc mercenary retires to open a coffee shop, building community one cinnamon roll and improbable friendship at a time.', '#312e81', '#7c3aed', 'legends-lattes'),
    (110, 'Library Collection Volume 110', 'Small Things Like These', 'Claire Keegan', 2021, 'historical fiction,literary', 3, 2, '9781000001105', 'Faber and Faber', 'English', 128, 'In a small Irish town during Advent, a coal merchant confronts the quiet cruelty his community has learned to ignore and must decide what decency requires.', '#3f3f46', '#f97316', 'small-things-like-these')
;


insert into books (title, author, publication_year, genres_csv, total_copies, available_copies)
select s.title, s.author, s.publication_year, s.genres_csv, s.total_copies, s.available_copies
from tmp_seed_books s
where not exists (
    select 1 from books b where b.title = s.title and b.author = s.author
);

with legacy_books as (
    select id, row_number() over (order by id) as seed_no
    from books
    where title like 'Library Collection Volume %'
)
update books b
set title = s.title,
    author = s.author,
    publication_year = s.publication_year,
    genres_csv = s.genres_csv,
    total_copies = s.total_copies,
    available_copies = least(s.available_copies, s.total_copies),
    isbn = s.isbn,
    publisher = s.publisher,
    language = s.language,
    page_count = s.page_count,
    description = s.description,
    file_name = coalesce(nullif(b.file_name, ''), s.slug || '.pdf'),
    file_content_type = coalesce(nullif(b.file_content_type, ''), 'application/pdf'),
    cover_content_type = 'image/svg+xml',
    cover_data = convert_to(
        format(
            '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640">'
            || '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
            || '<stop offset="0%%" stop-color="%1$s"/><stop offset="100%%" stop-color="%2$s"/>'
            || '</linearGradient></defs>'
            || '<rect width="420" height="640" rx="28" fill="url(#bg)"/>'
            || '<rect x="28" y="28" width="364" height="584" rx="24" fill="rgba(15,23,42,0.18)"/>'
            || '<text x="42" y="92" fill="#f8fafc" font-family="Georgia, serif" font-size="18" letter-spacing="3">LIBRARY EDITION</text>'
            || '<foreignObject x="42" y="130" width="336" height="280">'
            || '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;font-size:34px;line-height:1.15;font-weight:700;color:#ffffff;">%3$s</div>'
            || '</foreignObject>'
            || '<foreignObject x="42" y="430" width="336" height="90">'
            || '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.3;color:#e2e8f0;">%4$s</div>'
            || '</foreignObject>'
            || '<rect x="42" y="548" width="150" height="34" rx="17" fill="rgba(255,255,255,0.18)"/>'
            || '<text x="58" y="571" fill="#f8fafc" font-family="Inter,Arial,sans-serif" font-size="16">%5$s</text>'
            || '</svg>',
            s.primary_color,
            s.accent_color,
            replace(s.title, '&', '&amp;'),
            replace(s.author, '&', '&amp;'),
            upper(split_part(s.genres_csv, ',', 1))
        ),
        'UTF8'
    )
from legacy_books lb
join tmp_seed_books s on s.seed_no = lb.seed_no
where b.id = lb.id;

update books b
set publication_year = s.publication_year,
    genres_csv = s.genres_csv,
    total_copies = s.total_copies,
    available_copies = least(coalesce(b.available_copies, s.available_copies), s.total_copies),
    isbn = s.isbn,
    publisher = s.publisher,
    language = s.language,
    page_count = s.page_count,
    description = s.description,
    file_name = coalesce(nullif(b.file_name, ''), s.slug || '.pdf'),
    file_content_type = coalesce(nullif(b.file_content_type, ''), 'application/pdf'),
    cover_content_type = 'image/svg+xml',
    cover_data = coalesce(b.cover_data, convert_to(
        format(
            '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640">'
            || '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
            || '<stop offset="0%%" stop-color="%1$s"/><stop offset="100%%" stop-color="%2$s"/>'
            || '</linearGradient></defs>'
            || '<rect width="420" height="640" rx="28" fill="url(#bg)"/>'
            || '<rect x="28" y="28" width="364" height="584" rx="24" fill="rgba(15,23,42,0.18)"/>'
            || '<text x="42" y="92" fill="#f8fafc" font-family="Georgia, serif" font-size="18" letter-spacing="3">LIBRARY EDITION</text>'
            || '<foreignObject x="42" y="130" width="336" height="280">'
            || '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;font-size:34px;line-height:1.15;font-weight:700;color:#ffffff;">%3$s</div>'
            || '</foreignObject>'
            || '<foreignObject x="42" y="430" width="336" height="90">'
            || '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.3;color:#e2e8f0;">%4$s</div>'
            || '</foreignObject>'
            || '<rect x="42" y="548" width="150" height="34" rx="17" fill="rgba(255,255,255,0.18)"/>'
            || '<text x="58" y="571" fill="#f8fafc" font-family="Inter,Arial,sans-serif" font-size="16">%5$s</text>'
            || '</svg>',
            s.primary_color,
            s.accent_color,
            replace(s.title, '&', '&amp;'),
            replace(s.author, '&', '&amp;'),
            upper(split_part(s.genres_csv, ',', 1))
        ),
        'UTF8'
    ))
from tmp_seed_books s
where b.title = s.title and b.author = s.author;
