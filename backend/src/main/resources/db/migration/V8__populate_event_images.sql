update events
set image_url = case title
  when 'Sunset Jazz Night' then 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop'
  when 'Product Leaders Meetup' then 'product-leaders-meetup.jpg'
  when 'City Light Weekend' then 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop'
  when 'Startup Pitch Day' then 'startup-pitch-day.jpg'
  when 'Open Air Rock' then 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop'
  when 'Art Lab Expo' then 'art-lab-expo.jpg'
  when 'Design Sprint Weekend' then 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop'
  when 'Street Food Jam' then 'street-food-jam.jpg'
  when 'Indie Music Fest' then 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop'
  when 'Motion Graphics Day' then 'motion-graphics-day.jpg'
  when 'Urban Run Club' then 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop'
  when 'Classical Night' then 'classical-night.jpg'
  else image_url
end
where coalesce(image_url, '') = '';
