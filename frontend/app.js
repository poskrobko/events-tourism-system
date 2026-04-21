(function () {
  'use strict';

  const STORAGE_KEYS = {
    users: 'eventflow_users',
    auth: 'eventflow_auth',
    events: 'eventflow_events',
    orders: 'eventflow_orders',
  };

  const DEFAULT_EVENTS = [
    { id: 'e1', title: 'Sunset Jazz Night', type: 'музыка', city: 'Москва', date: '2026-05-02', time: '19:00', price: 1200, ticketsLeft: 120, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1170&auto=format&fit=crop', description: 'Вечер живого джаза под открытым небом.', program: [{ time: '19:00', title: 'Открытие', speaker: 'DJ Alina' }, { time: '19:30', title: 'Jazz Set', speaker: 'Moscow Trio' }, { time: '21:00', title: 'Jam Session', speaker: 'All Artists' }] },
    { id: 'e2', title: 'Product Leaders Meetup', type: 'бизнес', city: 'Санкт-Петербург', date: '2026-05-05', time: '11:00', price: 1600, ticketsLeft: 80, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1170&auto=format&fit=crop', description: 'Практика развития цифровых продуктов.', program: [{ time: '11:00', title: 'Ключевой доклад', speaker: 'Anna Moroz' }, { time: '12:00', title: 'Panel', speaker: 'CMO / CPO' }] },
    { id: 'e3', title: 'City Light Weekend', type: 'фестиваль', city: 'Казань', date: '2026-05-08', time: '16:00', price: 2200, ticketsLeft: 200, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop', description: 'Уличный фестиваль света и музыки.', program: [{ time: '16:00', title: 'Opening Show', speaker: 'Light Team' }, { time: '18:00', title: 'Live Stage', speaker: 'Neon Band' }] },
    { id: 'e4', title: 'Creative Market', type: 'творчество', city: 'Екатеринбург', date: '2026-05-10', time: '13:00', price: 900, ticketsLeft: 140, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1170&auto=format&fit=crop', description: 'Ярмарка локальных дизайнеров.', program: [{ time: '13:00', title: 'Маркет', speaker: '50 брендов' }] },
    { id: 'e5', title: 'Startup Pitch Day', type: 'бизнес', city: 'Москва', date: '2026-05-12', time: '10:00', price: 1800, ticketsLeft: 60, image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1170&auto=format&fit=crop', description: 'Питч-сессии стартапов для инвесторов.', program: [{ time: '10:00', title: 'Pitch Session', speaker: '12 стартапов' }] },
    { id: 'e6', title: 'Rock Arena Live', type: 'концерты', city: 'Новосибирск', date: '2026-05-15', time: '20:00', price: 2500, ticketsLeft: 90, image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1170&auto=format&fit=crop', description: 'Большой рок-концерт на открытой арене.', program: [{ time: '20:00', title: 'Main Show', speaker: 'Red Horizon' }] },
    { id: 'e7', title: 'Food Street Fest', type: 'фестиваль', city: 'Сочи', date: '2026-05-17', time: '14:00', price: 1100, ticketsLeft: 150, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop', description: 'Гастро-фестиваль и мастер-классы.', program: [{ time: '14:00', title: 'Открытие фуд-корта', speaker: 'Chef Team' }] },
    { id: 'e8', title: 'Design Sprint Camp', type: 'творчество', city: 'Москва', date: '2026-05-20', time: '12:00', price: 1400, ticketsLeft: 70, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1170&auto=format&fit=crop', description: 'Интенсив по дизайну цифровых продуктов.', program: [{ time: '12:00', title: 'Workshop', speaker: 'UX Team' }] },
    { id: 'e9', title: 'Indie Music Open Air', type: 'музыка', city: 'Тула', date: '2026-05-22', time: '18:30', price: 1300, ticketsLeft: 110, image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1170&auto=format&fit=crop', description: 'Инди-группы на свежем воздухе.', program: [{ time: '18:30', title: 'Live Bands', speaker: '5 групп' }] },
    { id: 'e10', title: 'Tech Expo Summit', type: 'бизнес', city: 'Казань', date: '2026-05-25', time: '09:30', price: 2000, ticketsLeft: 95, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1170&auto=format&fit=crop', description: 'Выставка IT-решений и доклады.', program: [{ time: '09:30', title: 'Expo Opening', speaker: 'Оргкомитет' }] },
    { id: 'e11', title: 'Acoustic Stories', type: 'концерты', city: 'Самара', date: '2026-05-28', time: '19:30', price: 1500, ticketsLeft: 130, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1170&auto=format&fit=crop', description: 'Акустический вечер известных артистов.', program: [{ time: '19:30', title: 'Acoustic Set', speaker: 'Guest Stars' }] },
    { id: 'e12', title: 'Art & Craft Weekend', type: 'творчество', city: 'Пермь', date: '2026-05-30', time: '12:30', price: 1000, ticketsLeft: 160, image: 'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?q=80&w=1170&auto=format&fit=crop', description: 'Мастер-классы и арт-инсталляции.', program: [{ time: '12:30', title: 'Open Workshops', speaker: 'Художники' }] },
  ];

  const PAGE_SIZE = 10;

  function load(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.events)) save(STORAGE_KEYS.events, DEFAULT_EVENTS);
    if (!localStorage.getItem(STORAGE_KEYS.orders)) save(STORAGE_KEYS.orders, []);

    const users = load(STORAGE_KEYS.users, []);
    const hasAdmin = users.some((u) => u.username === 'admin123');
    if (!hasAdmin) {
      users.push({ id: crypto.randomUUID(), firstName: 'Admin', lastName: 'User', username: 'admin123', email: 'admin123@eventflow.local', phone: '+70000000000', password: 'admin123', role: 'admin' });
      save(STORAGE_KEYS.users, users);
    }
  }

  function getAuth() { return load(STORAGE_KEYS.auth, null); }
  function setAuth(user) { save(STORAGE_KEYS.auth, user); }
  function logout() { localStorage.removeItem(STORAGE_KEYS.auth); }

  function getEvents() { return load(STORAGE_KEYS.events, DEFAULT_EVENTS); }
  function setEvents(events) { save(STORAGE_KEYS.events, events); }
  function getOrders() { return load(STORAGE_KEYS.orders, []); }
  function setOrders(orders) { save(STORAGE_KEYS.orders, orders); }
  function getUsers() { return load(STORAGE_KEYS.users, []); }
  function setUsers(users) { save(STORAGE_KEYS.users, users); }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function renderHeader() {
    const container = document.getElementById('mainNav');
    if (!container) return;
    const auth = getAuth();
    const path = location.pathname.split('/').pop();

    const links = [{ href: 'events.html', text: 'События' }];
    if (!auth) {
      links.push({ href: 'login.html', text: 'Вход' });
    } else if (auth.role === 'admin') {
      links.length = 0;
      links.push({ href: 'admin.html', text: 'Админ' }, { href: '#', text: 'Выход', id: 'logoutLink' });
    } else {
      links.push({ href: 'profile.html', text: 'Профиль' }, { href: 'my-tickets.html', text: 'Мои билеты' }, { href: '#', text: 'Выход', id: 'logoutLink' });
    }

    container.innerHTML = `
      <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div class="container">
          <a class="navbar-brand" href="events.html">EventFlow</a>
          <div class="navbar-nav ms-auto gap-2">
            ${links.map((l) => `<a class="nav-link ${path === l.href ? 'active' : ''}" href="${l.href}" ${l.id ? `id="${l.id}"` : ''}>${l.text}</a>`).join('')}
          </div>
        </div>
      </nav>`;

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        location.href = 'events.html';
      });
    }
  }

  function feedback(node, ok, msg) {
    if (!node) return;
    node.className = `alert mt-3 ${ok ? 'alert-success' : 'alert-danger'}`;
    node.textContent = msg;
  }

  function setupEventsPage() {
    const list = document.getElementById('eventsList');
    if (!list) return;

    const type = document.getElementById('filterType');
    const from = document.getElementById('filterFrom');
    const to = document.getElementById('filterTo');
    const reset = document.getElementById('resetFilters');
    const pagination = document.getElementById('eventsPagination');
    let currentPage = 1;

    function applyFilters() {
      const events = getEvents();
      let filtered = [...events];
      if (type.value) filtered = filtered.filter((e) => e.type === type.value);
      if (from.value) filtered = filtered.filter((e) => e.date >= from.value);
      if (to.value) filtered = filtered.filter((e) => e.date <= to.value);
      return filtered.sort((a, b) => a.date.localeCompare(b.date));
    }

    function render() {
      const filtered = applyFilters();
      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(start, start + PAGE_SIZE);

      list.innerHTML = pageItems.map((event) => `
      <div class="col-md-6 col-lg-4">
        <article class="card event-card h-100">
          <img src="${event.image}" class="card-img-top" alt="${event.title}" style="height:190px; object-fit:cover" />
          <div class="card-body d-flex flex-column">
            <span class="badge badge-status mb-2">${event.type}</span>
            <h2 class="h5">${event.title}</h2>
            <p class="text-secondary mb-2">${formatDate(event.date)} · ${event.city} · ${event.time}</p>
            <p class="small text-secondary mb-3">От ${event.price} ₽</p>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary mt-auto w-100">Подробнее</a>
          </div>
        </article>
      </div>`).join('') || '<p>Ничего не найдено по фильтрам.</p>';

      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i += 1) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'btn-secondary' : 'btn-outline-secondary'} me-2`;
        btn.textContent = String(i);
        btn.addEventListener('click', () => { currentPage = i; render(); });
        pagination.appendChild(btn);
      }
    }

    [type, from, to].forEach((el) => el.addEventListener('change', () => { currentPage = 1; render(); }));
    reset.addEventListener('click', () => {
      type.value = '';
      from.value = '';
      to.value = '';
      currentPage = 1;
      render();
    });
    render();
  }

  function setupAuthPages() {
    const auth = getAuth();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackNode = document.getElementById('loginFeedback');
        if (!loginForm.checkValidity()) return feedback(feedbackNode, false, 'Проверьте заполнение полей.');

        const loginValue = document.getElementById('loginValue').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const user = getUsers().find((u) => (u.email.toLowerCase() === loginValue || u.username === loginValue) && u.password === password);
        if (!user) return feedback(feedbackNode, false, 'Неверный логин или пароль.');

        setAuth({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, role: user.role });
        feedback(feedbackNode, true, 'Успешный вход.');
        setTimeout(() => { location.href = user.role === 'admin' ? 'admin.html' : 'events.html'; }, 500);
      });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = document.getElementById('registerFeedback');
        if (!registerForm.checkValidity()) return feedback(f, false, 'Проверьте поля регистрации.');
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regPassword2').value;
        if (password !== confirm) return feedback(f, false, 'Пароли не совпадают.');

        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const username = document.getElementById('regUsername').value.trim().toLowerCase();
        const users = getUsers();
        if (users.some((u) => u.email.toLowerCase() === email || u.username === username)) return feedback(f, false, 'Пользователь с таким email/логином уже существует.');

        users.push({
          id: crypto.randomUUID(),
          firstName: document.getElementById('firstName').value.trim(),
          lastName: document.getElementById('lastName').value.trim(),
          username,
          email,
          phone: document.getElementById('phone').value.trim(),
          password,
          role: 'user',
        });
        setUsers(users);
        feedback(f, true, 'Регистрация успешна. Теперь войдите в систему.');
        registerForm.reset();
      });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = document.getElementById('forgotFeedback');
        if (!forgotForm.checkValidity()) return feedback(f, false, 'Введите корректный email.');
        feedback(f, true, 'Если email зарегистрирован, инструкция отправлена.');
      });
    }

    if (auth && (location.pathname.endsWith('login.html') || location.pathname.endsWith('register.html'))) {
      location.href = auth.role === 'admin' ? 'admin.html' : 'events.html';
    }
  }

  function enforceRoleRoutes() {
    const auth = getAuth();
    if (!auth) return;
    const page = location.pathname.split('/').pop();
    const userOnlyPages = ['profile.html', 'my-tickets.html', 'ticket.html', 'event-details.html', 'events.html'];
    if (auth.role === 'admin' && userOnlyPages.includes(page)) {
      location.href = 'admin.html';
    }
  }

  function getQueryId() {
    return new URLSearchParams(location.search).get('id');
  }

  function setupEventDetailsPage() {
    const root = document.getElementById('eventDetails');
    if (!root) return;
    const eventId = getQueryId();
    const event = getEvents().find((e) => e.id === eventId) || getEvents()[0];
    if (!event) return;

    root.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-lg-8">
          <img src="${event.image}" class="img-fluid rounded-4 shadow-sm mb-4" alt="${event.title}" />
          <p class="section-label mb-2">${event.type}</p>
          <h1 class="page-title h2">${event.title}</h1>
          <p class="lead">${event.description}</p>
          <div class="row row-cols-1 row-cols-md-3 g-3 mb-4">
            <div class="col"><div class="p-3 bg-white rounded-3 border">📅 ${formatDate(event.date)}</div></div>
            <div class="col"><div class="p-3 bg-white rounded-3 border">🕖 ${event.time}</div></div>
            <div class="col"><div class="p-3 bg-white rounded-3 border">📍 ${event.city}</div></div>
          </div>
          <div class="card page-card p-4">
            <h2 class="h5 mb-3">Программа мероприятия</h2>
            <ul class="list-group list-group-flush">
              ${event.program.map((item) => `<li class="list-group-item d-flex justify-content-between px-0"><span>${item.title}</span><span class="text-secondary">${item.time} · ${item.speaker}</span></li>`).join('')}
            </ul>
          </div>
        </div>
        <aside class="col-lg-4">
          <div class="card page-card">
            <div class="card-header card-header-themed">Быстрая информация</div>
            <div class="card-body">
              <p class="mb-2"><strong>Цена от:</strong> ${event.price} ₽</p>
              <p class="mb-2"><strong>Осталось билетов:</strong> ${event.ticketsLeft}</p>
              <a class="btn btn-primary w-100" href="ticket.html?id=${event.id}">Купить билет</a>
            </div>
          </div>
        </aside>
      </div>`;
  }

  function setupTicketPage() {
    const form = document.getElementById('ticketForm');
    if (!form) return;
    const auth = getAuth();
    if (!auth) {
      location.href = 'login.html';
      return;
    }

    const eventId = getQueryId();
    const event = getEvents().find((e) => e.id === eventId) || getEvents()[0];
    document.getElementById('ticketEventLabel').textContent = `${event.title} · ${formatDate(event.date)}`;

    const typeSelect = document.getElementById('ticketType');
    const qtyInput = document.getElementById('ticketQty');
    const totalNode = document.getElementById('ticketTotal');
    const feedbackNode = document.getElementById('ticketFeedback');

    const multipliers = { standard: 1, premium: 1.7, vip: 2.4 };

    function updateTotal() {
      const qty = Number(qtyInput.value || 1);
      const total = Math.round(event.price * multipliers[typeSelect.value] * qty);
      totalNode.textContent = `${total} ₽`;
      return total;
    }

    qtyInput.addEventListener('input', updateTotal);
    typeSelect.addEventListener('change', updateTotal);
    updateTotal();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return feedback(feedbackNode, false, 'Проверьте данные покупки.');

      const qty = Number(qtyInput.value);
      if (qty > event.ticketsLeft) return feedback(feedbackNode, false, `Доступно только ${event.ticketsLeft} билетов.`);

      const total = updateTotal();
      const orders = getOrders();
      orders.push({ id: crypto.randomUUID(), userId: auth.id, eventId: event.id, eventTitle: event.title, eventDate: event.date, type: typeSelect.value, qty, total, createdAt: new Date().toISOString() });
      setOrders(orders);

      const events = getEvents();
      const idx = events.findIndex((ev) => ev.id === event.id);
      events[idx].ticketsLeft -= qty;
      setEvents(events);

      feedback(feedbackNode, true, 'Билет успешно приобретен. Переходим в "Мои билеты"...');
      setTimeout(() => { location.href = 'my-tickets.html'; }, 700);
    });
  }

  function setupMyTicketsPage() {
    const list = document.getElementById('myTicketsList');
    if (!list) return;
    const auth = getAuth();
    if (!auth) return location.href = 'login.html';

    const orders = getOrders().filter((o) => o.userId === auth.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    list.innerHTML = orders.length ? orders.map((o) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">${o.eventTitle}</div>
          <div class="small text-secondary">${formatDate(o.eventDate)} · ${o.type.toUpperCase()} · ${o.qty} шт.</div>
        </div>
        <span class="badge text-bg-success">${o.total} ₽</span>
      </li>`).join('') : '<li class="list-group-item">Пока нет купленных билетов.</li>';
  }

  function setupProfilePage() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    const auth = getAuth();
    if (!auth) return location.href = 'login.html';

    document.getElementById('profileName').textContent = `${auth.firstName} ${auth.lastName}`;
    document.getElementById('profileEmail').textContent = auth.email;
    document.getElementById('pFirstName').value = auth.firstName;
    document.getElementById('pLastName').value = auth.lastName;
    document.getElementById('pEmail').value = auth.email;
    const user = getUsers().find((u) => u.id === auth.id);
    document.getElementById('pPhone').value = user?.phone || '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = document.getElementById('profileFeedback');
      if (!form.checkValidity()) return feedback(f, false, 'Проверьте поля профиля.');

      const users = getUsers();
      const idx = users.findIndex((u) => u.id === auth.id);
      users[idx] = { ...users[idx], firstName: document.getElementById('pFirstName').value.trim(), lastName: document.getElementById('pLastName').value.trim(), email: document.getElementById('pEmail').value.trim(), phone: document.getElementById('pPhone').value.trim() };
      setUsers(users);
      setAuth({ ...auth, firstName: users[idx].firstName, lastName: users[idx].lastName, email: users[idx].email });
      feedback(f, true, 'Профиль обновлён.');
    });
  }

  function setupAdminPage() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    const auth = getAuth();
    if (!auth || auth.role !== 'admin') return location.href = 'events.html';

    const eventsTable = document.getElementById('adminEventsTable');
    const ordersTable = document.getElementById('adminOrdersTable');
    const form = document.getElementById('adminEventForm');
    const feedbackNode = document.getElementById('adminFeedback');
    let editingId = null;

    function renderTables() {
      const events = getEvents();
      eventsTable.innerHTML = events.map((e) => `
        <tr>
          <td>${e.title}</td><td>${e.type}</td><td>${formatDate(e.date)}</td><td>${e.price} ₽</td><td>${e.ticketsLeft}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" data-edit="${e.id}">Изм.</button>
            <button class="btn btn-sm btn-outline-danger" data-del="${e.id}">Удал.</button>
          </td>
        </tr>`).join('');

      const orders = getOrders();
      ordersTable.innerHTML = orders.map((o) => {
        const user = getUsers().find((u) => u.id === o.userId);
        return `<tr><td>${o.eventTitle}</td><td>${user ? user.email : '—'}</td><td>${o.qty}</td><td>${o.total} ₽</td></tr>`;
      }).join('') || '<tr><td colspan="4">Заказов пока нет.</td></tr>';
    }

    function loadToForm(id) {
      const event = getEvents().find((e) => e.id === id);
      if (!event) return;
      editingId = id;
      document.getElementById('aTitle').value = event.title;
      document.getElementById('aType').value = event.type;
      document.getElementById('aCity').value = event.city;
      document.getElementById('aDate').value = event.date;
      document.getElementById('aTime').value = event.time;
      document.getElementById('aPrice').value = event.price;
      document.getElementById('aTickets').value = event.ticketsLeft;
      document.getElementById('aDesc').value = event.description;
      document.getElementById('aProgram').value = event.program.map((p) => `${p.time}|${p.title}|${p.speaker}`).join('\n');
    }

    eventsTable.addEventListener('click', (e) => {
      const edit = e.target.getAttribute('data-edit');
      const del = e.target.getAttribute('data-del');
      if (edit) loadToForm(edit);
      if (del) {
        const events = getEvents().filter((ev) => ev.id !== del);
        setEvents(events);
        renderTables();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return feedback(feedbackNode, false, 'Проверьте поля мероприятия.');

      const program = document.getElementById('aProgram').value.trim().split('\n').filter(Boolean).map((line) => {
        const [time, title, speaker] = line.split('|');
        return { time: (time || '').trim(), title: (title || '').trim(), speaker: (speaker || '').trim() };
      });

      const payload = {
        id: editingId || crypto.randomUUID(),
        title: document.getElementById('aTitle').value.trim(),
        type: document.getElementById('aType').value,
        city: document.getElementById('aCity').value.trim(),
        date: document.getElementById('aDate').value,
        time: document.getElementById('aTime').value,
        price: Number(document.getElementById('aPrice').value),
        ticketsLeft: Number(document.getElementById('aTickets').value),
        description: document.getElementById('aDesc').value.trim(),
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1170&auto=format&fit=crop',
        program,
      };

      const events = getEvents();
      const idx = events.findIndex((ev) => ev.id === payload.id);
      if (idx >= 0) events[idx] = payload;
      else events.push(payload);
      setEvents(events);
      editingId = null;
      form.reset();
      feedback(feedbackNode, true, 'Мероприятие сохранено.');
      renderTables();
    });

    document.getElementById('adminReset').addEventListener('click', () => {
      editingId = null;
      form.reset();
    });

    renderTables();
  }

  initData();
  enforceRoleRoutes();
  renderHeader();
  setupAuthPages();
  setupEventsPage();
  setupEventDetailsPage();
  setupTicketPage();
  setupMyTicketsPage();
  setupProfilePage();
  setupAdminPage();
})();
