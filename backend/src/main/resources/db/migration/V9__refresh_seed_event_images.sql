update events
set image_url = case title
  when 'Sunset Jazz Night' then 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop'
  when 'Product Leaders Meetup' then 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop'
  when 'City Light Weekend' then 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop'
  when 'Startup Pitch Day' then 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200&auto=format&fit=crop'
  when 'Open Air Rock' then 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop'
  when 'Art Lab Expo' then 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop'
  when 'Design Sprint Weekend' then 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop'
  when 'Street Food Jam' then 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop'
  when 'Indie Music Fest' then 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop'
  when 'Motion Graphics Day' then 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=1200&auto=format&fit=crop'
  when 'Urban Run Club' then 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop'
  when 'Classical Night' then 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop'
  else image_url
end
where title in (
  'Sunset Jazz Night',
  'Product Leaders Meetup',
  'City Light Weekend',
  'Startup Pitch Day',
  'Open Air Rock',
  'Art Lab Expo',
  'Design Sprint Weekend',
  'Street Food Jam',
  'Indie Music Fest',
  'Motion Graphics Day',
  'Urban Run Club',
  'Classical Night'
);
