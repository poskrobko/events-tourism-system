update events
set created_by_user_id = u.id
from users u
where u.email = 'managertest@test.com'
  and events.created_by_user_id is null;
