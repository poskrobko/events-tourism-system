(function () {
  'use strict';

  const STORAGE_KEYS = {
    users: 'eventflow_users_v1',
    auth: 'eventflow_auth_v1',
    events: 'eventflow_events_v1',
    orders: 'eventflow_orders_v1',
  };

  const EVENT_TYPES = ['Бизнес', 'Фестиваль', 'Музыка', 'Творчество', 'Концерты', 'Образование', 'Спорт'];

  const DEFAULT_EVENTS = [
    { id: 'e1', title: 'Sunset Jazz Night', type: 'Музыка', city: 'Москва', date: '2026-04-26', time: '19:00', price: 1200, ticketLimit: 250, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1170&auto=format&fit=crop', description: 'Вечер живого джаза под открытым небом.', schedule: ['18:00 — Открытие площадки', '19:00 — Первый сет', '20:30 — Импровизация', '22:00 — Afterparty'] },
    { id: 'e2', title: 'Product Leaders Meetup', type: 'Бизнес', city: 'Санкт-Петербург', date: '2026-04-30', time: '11:00', price: 1800, ticketLimit: 120, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1170&auto=format&fit=crop', description: 'Нетворкинг и практики для product-менеджеров.', schedule: ['10:00 — Регистрация', '11:00 — Ключевой доклад', '13:00 — Панельная дискуссия'] },
    { id: 'e3', title: 'City Light Weekend', type: 'Фестиваль', city: 'Казань', date: '2026-05-05', time: '16:00', price: 1500, ticketLimit: 900, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop', description: 'Фестиваль света, музыки и уличного искусства.', schedule: ['16:00 — Открытие', '18:00 — Light show', '20:00 — Live set'] },
    { id: 'e4', title: 'Startup Pitch Day', type: 'Бизнес', city: 'Екатеринбург', date: '2026-05-09', time: '12:00', price: 1000, ticketLimit: 200, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1170&auto=format&fit=crop', description: 'Презентации стартапов перед инвесторами.', schedule: ['12:00 — Питч-сессия 1', '14:00 — Менторская зона'] },
    { id: 'e5', title: 'Open Air Rock', type: 'Концерты', city: 'Новосибирск', date: '2026-05-11', time: '18:30', price: 2200, ticketLimit: 800, image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1170&auto=format&fit=crop', description: 'Большой рок-концерт на открытой площадке.', schedule: ['18:30 — Разогрев', '20:00 — Главная группа'] },
    { id: 'e6', title: 'Art Lab Expo', type: 'Творчество', city: 'Москва', date: '2026-05-15', time: '14:00', price: 900, ticketLimit: 300, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1170&auto=format&fit=crop', description: 'Выставка современных творческих проектов.', schedule: ['14:00 — Открытие экспозиции', '16:00 — Мастер-класс'] },
    { id: 'e7', title: 'Design Sprint Weekend', type: 'Образование', city: 'Самара', date: '2026-05-18', time: '10:00', price: 1300, ticketLimit: 100, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1170&auto=format&fit=crop', description: 'Интенсив по дизайну цифровых продуктов.', schedule: ['10:00 — Воркшоп', '13:00 — Практика'] },
    { id: 'e8', title: 'Street Food Jam', type: 'Фестиваль', city: 'Краснодар', date: '2026-05-20', time: '13:00', price: 700, ticketLimit: 600, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop', description: 'Фестиваль гастрономии и локальных брендов.', schedule: ['13:00 — Открытие фуд-корта', '15:00 — Шоу поваров'] },
    { id: 'e9', title: 'Indie Music Fest', type: 'Музыка', city: 'Пермь', date: '2026-05-22', time: '17:00', price: 1600, ticketLimit: 500, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1170&auto=format&fit=crop', description: 'Фестиваль инди-исполнителей.', schedule: ['17:00 — Открытие', '18:00 — Сеты групп'] },
    { id: 'e10', title: 'Motion Graphics Day', type: 'Творчество', city: 'Нижний Новгород', date: '2026-05-25', time: '12:00', price: 1100, ticketLimit: 180, image: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=1170&auto=format&fit=crop', description: 'Конференция по motion-дизайну.', schedule: ['12:00 — Доклады', '15:00 — Q&A'] },
    { id: 'e11', title: 'Urban Run Club', type: 'Спорт', city: 'Москва', date: '2026-05-28', time: '09:00', price: 500, ticketLimit: 1000, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1170&auto=format&fit=crop', description: 'Массовый забег по городу.', schedule: ['09:00 — Старт', '11:00 — Награждение'] },
    { id: 'e12', title: 'Classical Night', type: 'Концерты', city: 'Сочи', date: '2026-06-01', time: '20:00', price: 2500, ticketLimit: 350, image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1170&auto=format&fit=crop', description: 'Симфонический концерт на берегу моря.', schedule: ['20:00 — I отделение', '21:30 — II отделение'] },
  ];

  function read(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function seed() {
    const users = read(STORAGE_KEYS.users, null);
    if (!users) {
      write(STORAGE_KEYS.users, [{
        id: 'u-admin', fullName: 'Администратор', email: 'admin123', password: 'admin123', role: 'admin', phone: '+70000000000',
      }]);
    }
    const events = read(STORAGE_KEYS.events, null);
    if (!events) write(STORAGE_KEYS.events, DEFAULT_EVENTS);
    if (!read(STORAGE_KEYS.orders, null)) write(STORAGE_KEYS.orders, []);
  }

  function getCurrentUser() {
    const auth = read(STORAGE_KEYS.auth, null);
    if (!auth) return null;
    return read(STORAGE_KEYS.users, []).find((u) => u.id === auth.userId) || null;
  }

  function requireAuth(redirect = 'login.html') {
    if (!getCurrentUser()) window.location.href = redirect;
  }

  function requireAdmin() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') window.location.href = 'events.html';
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.auth);
    window.location.href = 'events.html';
  }

  function headerLinks(pathname, user) {
    const links = [{ href: 'events.html', label: 'События' }];
    if (!user) {
      links.push({ href: 'login.html', label: 'Вход' });
      return links;
    }

    if (user.role === 'admin') {
      links.push({ href: 'admin.html', label: 'Админ' });
    } else {
      links.push({ href: 'profile.html', label: 'Профиль' }, { href: 'my-tickets.html', label: 'Мои билеты' });
    }
    links.push({ href: '#logout', label: 'Выход', logout: true });
    return links.map((link) => ({ ...link, active: pathname.endsWith(link.href) }));
  }

  function renderNavbar() {
    const navContainer = document.getElementById('mainNavLinks');
    if (!navContainer) return;
    const pathname = window.location.pathname;
    const user = getCurrentUser();
    const links = headerLinks(pathname, user);
    navContainer.innerHTML = links.map((link) => `<a class="nav-link ${link.active ? 'active' : ''}" href="${link.href}" ${link.logout ? 'data-logout="true"' : ''}>${link.label}</a>`).join('');
    const logoutLink = navContainer.querySelector('[data-logout="true"]');
    if (logoutLink) logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  function setupGenericFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        if (form.dataset.handled === 'custom') return;
        event.preventDefault();
        event.stopPropagation();
        const feedback = form.querySelector('[data-feedback]');
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          if (feedback) {
            feedback.className = 'alert alert-danger mt-3';
            feedback.textContent = 'Проверьте поля формы и попробуйте снова.';
          }
          return;
        }
        form.classList.add('was-validated');
        if (feedback) {
          feedback.className = 'alert alert-success mt-3';
          feedback.textContent = form.dataset.successMessage || 'Данные успешно отправлены.';
        }
      });
    });
  }

  function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.dataset.handled = 'custom';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const login = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const users = read(STORAGE_KEYS.users, []);
      const user = users.find((u) => (u.email === login) && u.password === password);
      const feedback = form.querySelector('[data-feedback]');
      if (!user) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = 'Неверный логин или пароль.';
        return;
      }

      write(STORAGE_KEYS.auth, { userId: user.id, loginAt: new Date().toISOString() });
      feedback.className = 'alert alert-success mt-3';
      feedback.textContent = 'Успешный вход. Перенаправляем...';
      setTimeout(() => { window.location.href = user.role === 'admin' ? 'admin.html' : 'events.html'; }, 400);
    });
  }

  function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.dataset.handled = 'custom';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('regPassword');
      const confirm = document.getElementById('regPasswordRepeat');
      confirm.setCustomValidity(password.value === confirm.value ? '' : 'Пароли не совпадают');

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const users = read(STORAGE_KEYS.users, []);
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const feedback = form.querySelector('[data-feedback]');
      if (users.some((u) => u.email.toLowerCase() === email)) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = 'Пользователь с таким логином/email уже существует.';
        return;
      }

      users.push({
        id: `u-${Date.now()}`,
        fullName: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`.trim(),
        email,
        password: password.value,
        phone: document.getElementById('phone').value.trim(),
        role: 'user',
      });
      write(STORAGE_KEYS.users, users);
      feedback.className = 'alert alert-success mt-3';
      feedback.textContent = 'Регистрация успешна. Теперь войдите в систему.';
      form.reset();
      form.classList.remove('was-validated');
    });
  }

  function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    const state = {
      page: 1,
      perPage: 10,
      type: 'all',
      from: '',
      to: '',
    };
    const events = read(STORAGE_KEYS.events, []);

    const typeSelect = document.getElementById('typeFilter');
    const fromInput = document.getElementById('dateFromFilter');
    const toInput = document.getElementById('dateToFilter');
    const pagination = document.getElementById('eventsPagination');

    EVENT_TYPES.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    function applyFilters() {
      return events
        .filter((event) => state.type === 'all' || event.type === state.type)
        .filter((event) => !state.from || event.date >= state.from)
        .filter((event) => !state.to || event.date <= state.to);
    }

    function render() {
      const filtered = applyFilters();
      const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * state.perPage;
      const pageItems = filtered.slice(start, start + state.perPage);

      grid.innerHTML = pageItems.map((event) => `
        <div class="col-md-6 col-lg-4">
          <article class="card event-card h-100">
            <img src="${event.image}" class="card-img-top" alt="${event.title}" style="height:190px; object-fit:cover" />
            <div class="card-body d-flex flex-column">
              <span class="badge badge-status mb-2">${event.type}</span>
              <h2 class="h5">${event.title}</h2>
              <p class="text-secondary mb-3">${new Date(event.date).toLocaleDateString('ru-RU')} · ${event.city} · ${event.time}</p>
              <a href="event-details.html?id=${event.id}" class="btn btn-primary w-100 mt-auto">Подробнее</a>
            </div>
          </article>
        </div>
      `).join('') || '<p class="text-secondary">По фильтрам ничего не найдено.</p>';

      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i += 1) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === state.page ? 'btn-primary' : 'btn-outline-secondary'}`;
        btn.textContent = String(i);
        btn.addEventListener('click', () => { state.page = i; render(); });
        pagination.appendChild(btn);
      }
    }

    typeSelect.addEventListener('change', () => { state.type = typeSelect.value; state.page = 1; render(); });
    fromInput.addEventListener('change', () => { state.from = fromInput.value; state.page = 1; render(); });
    toInput.addEventListener('change', () => { state.to = toInput.value; state.page = 1; render(); });

    render();
  }

  function initEventDetailsPage() {
    const titleNode = document.getElementById('eventTitle');
    if (!titleNode) return;
    const id = new URLSearchParams(window.location.search).get('id');
    const event = read(STORAGE_KEYS.events, []).find((item) => item.id === id) || read(STORAGE_KEYS.events, [])[0];
    document.getElementById('eventType').textContent = event.type;
    titleNode.textContent = event.title;
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventDate').textContent = `📅 ${new Date(event.date).toLocaleDateString('ru-RU')}`;
    document.getElementById('eventTime').textContent = `🕖 ${event.time}`;
    document.getElementById('eventCity').textContent = `📍 ${event.city}`;
    document.getElementById('eventImage').src = event.image;
    document.getElementById('eventPrice').textContent = `${event.price} ₽`;
    document.getElementById('buyTicketBtn').href = `ticket.html?id=${event.id}`;
    document.getElementById('eventSchedule').innerHTML = event.schedule.map((s) => `<li class="list-group-item">${s}</li>`).join('');
  }

  function initTicketPage() {
    const form = document.getElementById('ticketForm');
    if (!form) return;
    requireAuth();
    const id = new URLSearchParams(window.location.search).get('id');
    const event = read(STORAGE_KEYS.events, []).find((item) => item.id === id) || read(STORAGE_KEYS.events, [])[0];
    const user = getCurrentUser();

    const title = document.getElementById('ticketEventTitle');
    const qtyInput = document.getElementById('ticketQty');
    const totalNode = document.getElementById('ticketTotal');
    const buyerEmail = document.getElementById('buyerEmail');
    const ticketType = document.getElementById('ticketType');
    title.textContent = event.title;
    buyerEmail.value = user.email;

    function updateTotal() {
      const multi = Number(ticketType.value || 1);
      const qty = Number(qtyInput.value || 1);
      totalNode.textContent = `${event.price * multi * qty} ₽`;
    }
    qtyInput.addEventListener('input', updateTotal);
    ticketType.addEventListener('change', updateTotal);
    updateTotal();

    form.dataset.handled = 'custom';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const orders = read(STORAGE_KEYS.orders, []);
      orders.push({
        id: `o-${Date.now()}`,
        userId: user.id,
        eventId: event.id,
        eventTitle: event.title,
        qty: Number(qtyInput.value),
        typeMultiplier: Number(ticketType.value),
        total: event.price * Number(ticketType.value) * Number(qtyInput.value),
        createdAt: new Date().toISOString(),
        status: 'Оплачено',
      });
      write(STORAGE_KEYS.orders, orders);
      const feedback = form.querySelector('[data-feedback]');
      feedback.className = 'alert alert-success mt-3';
      feedback.textContent = 'Билет успешно приобретен. Переходим в «Мои билеты»...';
      setTimeout(() => { window.location.href = 'my-tickets.html'; }, 500);
    });
  }

  function initMyTicketsPage() {
    const list = document.getElementById('myTicketsList');
    if (!list) return;
    requireAuth();
    const user = getCurrentUser();
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }

    const orders = read(STORAGE_KEYS.orders, []).filter((o) => o.userId === user.id);
    if (!orders.length) {
      list.innerHTML = '<li class="list-group-item">Пока нет приобретенных билетов.</li>';
      return;
    }

    list.innerHTML = orders.map((o) => `<li class="list-group-item d-flex justify-content-between align-items-center"><div><strong>${o.eventTitle}</strong><div class="small text-secondary">${new Date(o.createdAt).toLocaleString('ru-RU')} · ${o.qty} шт.</div></div><span class="text-success fw-semibold">${o.total} ₽</span></li>`).join('');
  }

  function initProfilePage() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    requireAuth();
    const user = getCurrentUser();
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }

    const fullNameParts = user.fullName.split(' ');
    document.getElementById('profileName').textContent = user.fullName;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileFirstName').value = fullNameParts[0] || '';
    document.getElementById('profileLastName').value = fullNameParts.slice(1).join(' ');
    document.getElementById('profileEmailInput').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';

    form.dataset.handled = 'custom';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const users = read(STORAGE_KEYS.users, []);
      const idx = users.findIndex((u) => u.id === user.id);
      users[idx] = {
        ...users[idx],
        fullName: `${document.getElementById('profileFirstName').value.trim()} ${document.getElementById('profileLastName').value.trim()}`.trim(),
        email: document.getElementById('profileEmailInput').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
      };
      write(STORAGE_KEYS.users, users);
      document.getElementById('profileName').textContent = users[idx].fullName;
      document.getElementById('profileEmail').textContent = users[idx].email;
      const feedback = form.querySelector('[data-feedback]');
      feedback.className = 'alert alert-success mt-3';
      feedback.textContent = 'Профиль успешно обновлен.';
    });
  }

  function initAdminPage() {
    const wrap = document.getElementById('adminPanel');
    if (!wrap) return;
    requireAdmin();

    const eventsTable = document.getElementById('adminEventsTable');
    const ordersTable = document.getElementById('adminOrdersTable');
    const eventForm = document.getElementById('eventCrudForm');
    const scheduleInput = document.getElementById('eventScheduleInput');

    function renderAdmin() {
      const events = read(STORAGE_KEYS.events, []);
      const orders = read(STORAGE_KEYS.orders, []);
      document.getElementById('totalEvents').textContent = events.length;
      document.getElementById('totalTickets').textContent = orders.reduce((sum, o) => sum + o.qty, 0);
      document.getElementById('totalRevenue').textContent = `${orders.reduce((sum, o) => sum + o.total, 0)} ₽`;

      eventsTable.innerHTML = events.map((e) => `<tr>
        <td>${e.title}</td><td>${e.type}</td><td>${e.date}</td><td>${e.price} ₽</td><td>${e.ticketLimit}</td>
        <td class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" data-edit="${e.id}">Изменить</button><button class="btn btn-sm btn-outline-danger" data-delete="${e.id}">Удалить</button></td>
      </tr>`).join('');

      ordersTable.innerHTML = orders.map((o) => `<tr><td>${o.eventTitle}</td><td>${o.qty}</td><td>${o.total} ₽</td><td>${o.status}</td><td>${new Date(o.createdAt).toLocaleString('ru-RU')}</td></tr>`).join('') || '<tr><td colspan="5">Заказов пока нет.</td></tr>';

      eventsTable.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.delete;
          write(STORAGE_KEYS.events, read(STORAGE_KEYS.events, []).filter((e) => e.id !== id));
          renderAdmin();
        });
      });

      eventsTable.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const event = read(STORAGE_KEYS.events, []).find((e) => e.id === btn.dataset.edit);
          document.getElementById('eventId').value = event.id;
          document.getElementById('eventTitleInput').value = event.title;
          document.getElementById('eventTypeInput').value = event.type;
          document.getElementById('eventCityInput').value = event.city;
          document.getElementById('eventDateInput').value = event.date;
          document.getElementById('eventTimeInput').value = event.time;
          document.getElementById('eventPriceInput').value = event.price;
          document.getElementById('eventTicketLimitInput').value = event.ticketLimit;
          document.getElementById('eventImageInput').value = event.image;
          document.getElementById('eventDescriptionInput').value = event.description;
          scheduleInput.value = event.schedule.join('\n');
        });
      });
    }

    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!eventForm.checkValidity()) {
        eventForm.classList.add('was-validated');
        return;
      }
      const events = read(STORAGE_KEYS.events, []);
      const payload = {
        id: document.getElementById('eventId').value || `e-${Date.now()}`,
        title: document.getElementById('eventTitleInput').value.trim(),
        type: document.getElementById('eventTypeInput').value,
        city: document.getElementById('eventCityInput').value.trim(),
        date: document.getElementById('eventDateInput').value,
        time: document.getElementById('eventTimeInput').value,
        price: Number(document.getElementById('eventPriceInput').value),
        ticketLimit: Number(document.getElementById('eventTicketLimitInput').value),
        image: document.getElementById('eventImageInput').value.trim(),
        description: document.getElementById('eventDescriptionInput').value.trim(),
        schedule: scheduleInput.value.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      const idx = events.findIndex((x) => x.id === payload.id);
      if (idx >= 0) events[idx] = payload;
      else events.push(payload);
      write(STORAGE_KEYS.events, events);
      eventForm.reset();
      document.getElementById('eventId').value = '';
      eventForm.classList.remove('was-validated');
      renderAdmin();
    });

    document.getElementById('eventFormReset').addEventListener('click', () => {
      eventForm.reset();
      document.getElementById('eventId').value = '';
      eventForm.classList.remove('was-validated');
    });

    renderAdmin();
  }

  seed();
  renderNavbar();
  setupGenericFormValidation();
  initLoginPage();
  initRegisterPage();
  renderEvents();
  initEventDetailsPage();
  initTicketPage();
  initMyTicketsPage();
  initProfilePage();
  initAdminPage();
})();
