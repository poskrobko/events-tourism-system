alter table books add column if not exists isbn varchar(64);
alter table books add column if not exists publisher varchar(255);
alter table books add column if not exists language varchar(64);
alter table books add column if not exists page_count integer;
alter table books add column if not exists description varchar(2000);
alter table books add column if not exists file_name varchar(255);
alter table books add column if not exists file_content_type varchar(128);
alter table books add column if not exists file_data blob;
alter table books add column if not exists cover_content_type varchar(128);
alter table books add column if not exists cover_data blob;

update books
set isbn = '978-0-679-73232-2',
    publisher = 'Vintage',
    language = 'en',
    page_count = 864,
    description = 'Epic science fiction novel about politics, ecology, and power.'
where title = 'Dune' and author = 'Frank Herbert';

update books
set file_name = 'dune-sample.pdf',
    file_content_type = 'application/pdf',
    file_data = X'255044462D312E310A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020333030203134345D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E677468203534203E3E0A73747265616D0A4254202F463120313820546620353020313030205464202853616D706C652050444620666F7220646F776E6C6F61642E2920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A747261696C65720A3C3C202F526F6F74203120302052203E3E0A2525454F460A'
where title = 'Dune' and author = 'Frank Herbert' and file_data is null;
