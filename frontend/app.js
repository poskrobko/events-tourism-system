(function () {
  'use strict';

  const STORAGE_KEYS = {
    users: 'eventflow_users_v1',
    auth: 'eventflow_auth_v1',
    events: 'eventflow_events_v1',
    orders: 'eventflow_orders_v1',
  };

  const EVENT_TYPES = ['Бизнес', 'Фестиваль', 'Музыка', 'Творчество', 'Концерты', 'Образование', 'Спорт'];
  const API_BASE = 'http://localhost:8080/api';

  const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop';

  function resolveEventImage(imageValue) {
    const raw = String(imageValue || '').trim();
    if (!raw) return DEFAULT_EVENT_IMAGE;
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:image/')) return raw;
    const normalized = raw.replace(/^\/+/, '');
    return `${window.location.origin}/images/${normalized}`;
  }


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
        id: 'u-admin',
        fullName: 'Администратор',
        email: 'admin123',
        password: 'admin123',
        role: 'admin',
        phone: '+70000000000',
      }]);
    }
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
      links.push({ href: 'admin.html', label: 'Админ' }, { href: 'users.html', label: 'Пользователи' });
    } else if (user.role === 'manager') {
      links.push({ href: 'my-events.html', label: 'Мои мероприятия' }, { href: 'my-tickets.html', label: 'Мои билеты' }, { href: 'profile.html', label: 'Профиль' });
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

      const login = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const feedback = form.querySelector('[data-feedback]');

      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: login, password }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || data.error || 'Неверный логин или пароль.');
          }

          const users = read(STORAGE_KEYS.users, []);
          let user = users.find((u) => (u.email || '').toLowerCase() === login);
          const normalizedRole = (data.role || '').toLowerCase();
          if (!user) {
            user = {
              id: `u-${Date.now()}`,
              fullName: login,
              email: login,
              password,
              role: normalizedRole === 'event_manager' ? 'manager' : (normalizedRole === 'admin' ? 'admin' : 'user'),
              phone: '',
            };
            users.push(user);
          } else {
            user.role = normalizedRole === 'event_manager' ? 'manager' : (normalizedRole === 'admin' ? 'admin' : 'user');
          }
          write(STORAGE_KEYS.users, users);
          write(STORAGE_KEYS.auth, { userId: user.id, email: login, token: data.token, role: user.role, loginAt: new Date().toISOString() });
          feedback.className = 'alert alert-success mt-3';
          feedback.textContent = 'Успешный вход. Перенаправляем...';
          setTimeout(() => { window.location.href = user.role === 'admin' ? 'admin.html' : 'events.html'; }, 400);
        })
        .catch((error) => {
          feedback.className = 'alert alert-danger mt-3';
          feedback.textContent = error.message;
        });
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

      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const fullName = `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`.trim();
      const feedback = form.querySelector('[data-feedback]');

      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password.value, fullName }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || data.error || 'Не удалось зарегистрироваться.');
          }
          const users = read(STORAGE_KEYS.users, []);
          if (!users.some((u) => u.email.toLowerCase() === email)) {
            users.push({
              id: `u-${Date.now()}`,
              fullName,
              email,
              password: password.value,
              phone: document.getElementById('phone').value.trim(),
              role: 'user',
            });
            write(STORAGE_KEYS.users, users);
          }
          feedback.className = 'alert alert-success mt-3';
          feedback.innerHTML = `
            <div class="mb-2">Регистрация успешна. Пользователь сохранен в базе данных.</div>
            <a class="btn btn-success btn-sm" href="login.html">Перейти на страницу входа</a>
          `;
          form.reset();
          form.classList.remove('was-validated');
        })
        .catch((error) => {
          feedback.className = 'alert alert-danger mt-3';
          feedback.textContent = error.message;
        });
    });
  }


  async function initForgotPasswordPage() {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    const emailInput = document.getElementById('restoreEmail');
    const newPasswordInput = document.getElementById('newPassword');
    const feedback = form.querySelector('[data-feedback]');
    const savePasswordBtn = document.getElementById('savePasswordBtn');

    function showFeedback(type, text) {
      feedback.className = `alert alert-${type} mt-3`;
      feedback.textContent = text;
    }

    async function validateEmailExistsInDb() {
      const email = emailInput.value.trim().toLowerCase();
      if (!email) return false;
      const response = await fetch(`${API_BASE}/auth/email-exists?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Не удалось проверить email.');
      if (!data.exists) {
        emailInput.setCustomValidity('Пользователь с таким email не найден');
        form.classList.add('was-validated');
        return false;
      }
      emailInput.setCustomValidity('');
      return true;
    }

    emailInput.addEventListener('input', () => emailInput.setCustomValidity(''));
    emailInput.addEventListener('blur', async () => {
      if (!emailInput.value.trim()) return;
      try {
        await validateEmailExistsInDb();
      } catch (e) {
        showFeedback('danger', e.message);
      }
    });

    savePasswordBtn.addEventListener('click', async () => {
      if (!emailInput.checkValidity() || !newPasswordInput.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      try {
        const exists = await validateEmailExistsInDb();
        if (!exists) return;

        const response = await fetch(`${API_BASE}/auth/password-reset/confirm`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value.trim().toLowerCase(),
            newPassword: newPasswordInput.value,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          if ((data.message || '').includes('User not found')) {
            emailInput.setCustomValidity('Пользователь с таким email не найден');
            form.classList.add('was-validated');
            return;
          }
          throw new Error(data.message || data.error || 'Не удалось обновить пароль.');
        }
        const normalizedEmail = emailInput.value.trim().toLowerCase();
        const updatedPassword = newPasswordInput.value;
        const users = read(STORAGE_KEYS.users, []);
        const userIndex = users.findIndex((u) => (u.email || '').toLowerCase() === normalizedEmail);
        if (userIndex >= 0) {
          users[userIndex].password = updatedPassword;
          write(STORAGE_KEYS.users, users);
        }

        showFeedback('success', data.message || 'Пароль обновлён. Теперь вы можете войти.');
        setTimeout(() => { window.location.href = 'login.html'; }, 600);
      } catch (e) { showFeedback('danger', e.message); }
    });
  }


  async function fetchEventsFromApi() {
    const response = await fetch(`${API_BASE}/events`);
    if (!response.ok) throw new Error('Не удалось загрузить события из базы данных.');
    return response.json();
  }

  function mapApiEventToUi(event) {
    const start = new Date(event.startDateTime);
    return {
      id: String(event.id),
      title: event.title,
      type: 'Событие',
      city: event.city,
      date: start.toISOString().slice(0, 10),
      time: start.toTimeString().slice(0, 5),
      image: resolveEventImage(event.imageUrl),
      description: event.description,
      venue: event.venue,
      price: Number(event.minPrice || 0),
      schedule: [],
    };
  }

  async function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const state = {
      page: 1,
      perPage: 12,
      type: 'all',
      city: 'all',
      from: '',
      to: '',
      events: [],
    };
    let events = read(STORAGE_KEYS.events, []);

    const typeSelect = document.getElementById('typeFilter');
    const citySelect = document.getElementById('cityFilter');
    const fromInput = document.getElementById('dateFromFilter');
    const toInput = document.getElementById('dateToFilter');
    const pagination = document.getElementById('eventsPagination');

    function normalizeEvent(event) {
      const start = new Date(event.startDateTime);
      return {
        id: event.id,
        title: event.title,
        type: event.venue || 'Событие',
        city: event.city,
        date: event.startDateTime ? event.startDateTime.slice(0, 10) : '',
        time: start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        image: resolveEventImage(event.imageUrl),
        description: event.description || '',
        price: Number(event.minTicketPrice || 0),
        schedule: [],
      };
    }

    try {
      const apiEvents = await fetchEventsFromApi();
      events = apiEvents.map(mapApiEventToUi);
      write(STORAGE_KEYS.events, events);
      const uniqueTypes = [...new Set(events.map((event) => event.type))];
      uniqueTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    } catch (error) {
      grid.innerHTML = `<p class="text-danger">${error.message}</p>`;
      return;
    }

    function applyFilters() {
      return state.events
        .filter((event) => state.type === 'all' || event.type === state.type)
        .filter((event) => state.city === 'all' || event.city === state.city)
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

    function renderTypes() {
      const types = Array.from(new Set(state.events.map((e) => e.type))).sort();
      typeSelect.innerHTML = '<option value="all">Все типы</option>';
      types.forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }
    function renderCities() {
      const cities = Array.from(new Set(state.events.map((e) => e.city))).sort();
      citySelect.innerHTML = '<option value="all">Все города</option>';
      cities.forEach((city) => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }

    async function loadEvents() {
      try {
        const response = await fetch(`${API_BASE}/events`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Не удалось загрузить события.');
        state.events = data.map(normalizeEvent);
        renderTypes();
        renderCities();
        render();
      } catch (error) {
        grid.innerHTML = `<p class="text-danger">${error.message}</p>`;
      }
    }

    typeSelect.addEventListener('change', () => { state.type = typeSelect.value; state.page = 1; render(); });
    citySelect.addEventListener('change', () => { state.city = citySelect.value; state.page = 1; render(); });
    fromInput.addEventListener('change', () => { state.from = fromInput.value; state.page = 1; render(); });
    toInput.addEventListener('change', () => { state.to = toInput.value; state.page = 1; render(); });

    loadEvents();
  }

  function initEventDetailsPage() {
    const titleNode = document.getElementById('eventTitle');
    if (!titleNode) return;
    const id = new URLSearchParams(window.location.search).get('id');
    fetch(`${API_BASE}/events`)
      .then((response) => response.json())
      .then((events) => {
        const event = events.map(mapApiEventToUi).find((item) => item.id === id) || events.map(mapApiEventToUi)[0];
        document.getElementById('eventType').textContent = event.type;
        titleNode.textContent = event.title;
        document.getElementById('eventDescription').textContent = event.description;
        document.getElementById('eventDate').textContent = `📅 ${new Date(event.date).toLocaleDateString('ru-RU')}`;
        document.getElementById('eventTime').textContent = `🕖 ${event.time}`;
        document.getElementById('eventCity').textContent = `📍 ${event.city}`;
        const eventImage = document.getElementById('eventImage');
        eventImage.src = event.image;
        eventImage.onerror = () => { eventImage.src = DEFAULT_EVENT_IMAGE; };
        document.getElementById('eventPrice').textContent = `${event.price} BYN`;
        const buyTicketBtn = document.getElementById('buyTicketBtn');
        buyTicketBtn.href = getCurrentUser() ? `ticket.html?id=${event.id}` : 'login.html';
        document.getElementById('eventSchedule').innerHTML = event.schedule.map((s) => `<li class="list-group-item">${s}</li>`).join('');
      });
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
      totalNode.textContent = `${event.price * multi * qty} BYN`;
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

    list.innerHTML = orders.map((o) => `<li class="list-group-item d-flex justify-content-between align-items-center"><div><strong>${o.eventTitle}</strong><div class="small text-secondary">${new Date(o.createdAt).toLocaleString('ru-RU')} · ${o.qty} шт.</div></div><span class="text-success fw-semibold">${o.total} BYN</span></li>`).join('');
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


  function initAdminUsersPage() {
    const wrap = document.getElementById('adminUsersPanel');
    if (!wrap) return;
    requireAdmin();

    const currentUser = getCurrentUser();
    const usersTable = document.getElementById('adminUsersTable');
    const createCard = document.getElementById('managerCreateCard');
    const openCreateBtn = document.getElementById('openManagerFormBtn');
    const closeCreateBtn = document.getElementById('closeManagerFormBtn');
    const createForm = document.getElementById('managerCreateForm');
    const usersSearchInput = document.getElementById('usersSearchInput');
    const usersUpdateToast = document.getElementById('usersUpdateToast');
    let updateToastTimer = null;

    function showUsersUpdateToast(message = 'Данные пользователя успешно обновлены.') {
      if (!usersUpdateToast) {
        alert(message);
        return;
      }
      usersUpdateToast.textContent = message;
      usersUpdateToast.classList.remove('d-none');
      clearTimeout(updateToastTimer);
      updateToastTimer = setTimeout(() => {
        usersUpdateToast.classList.add('d-none');
      }, 2500);
    }

    function splitName(fullName = '') {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
      };
    }

    async function renderUsers() {
      const auth = read(STORAGE_KEYS.auth, null);
      let users = [];

      if (auth?.token) {
        try {
          const response = await fetch(`${API_BASE}/admin/users`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (!response.ok) {
            throw new Error('Не удалось загрузить пользователей из базы данных.');
          }
          const dbUsers = await response.json();
          users = dbUsers.map((u) => ({
            id: String(u.id),
            fullName: u.fullName || '',
            email: u.email || '',
            password: '',
            role: u.role === 'ADMIN' ? 'admin' : (u.role === 'EVENT_MANAGER' ? 'manager' : 'user'),
          }));
        } catch (error) {
          const row = `<tr><td colspan="6" class="text-danger">${error.message}</td></tr>`;
          usersTable.innerHTML = row;
          return;
        }
      } else {
        users = read(STORAGE_KEYS.users, []);
      }
      const searchQuery = (usersSearchInput?.value || '').trim().toLowerCase();
      const visibleUsers = users.filter((u) => {
        if (!searchQuery) return true;
        const { firstName, lastName } = splitName(u.fullName);
        const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
        return u.email.toLowerCase().includes(searchQuery) || fullName.includes(searchQuery);
      });

      usersTable.innerHTML = visibleUsers.map((u) => {
        const { firstName, lastName } = splitName(u.fullName);
        const isAdminUser = u.role === 'admin';
        return `<tr>
        <td><input class="form-control form-control-sm" data-field="email" data-user-id="${u.id}" type="email" value="${u.email}" required /></td>
        <td><input class="form-control form-control-sm" data-field="firstName" data-user-id="${u.id}" value="${firstName}" minlength="2" required /></td>
        <td><input class="form-control form-control-sm" data-field="lastName" data-user-id="${u.id}" value="${lastName}" /></td>
        <td>
          <select class="form-select form-select-sm" data-field="role" data-user-id="${u.id}" ${isAdminUser ? 'disabled' : ''}>
            <option value="manager" ${u.role === 'manager' ? 'selected' : ''}>Менеджер</option>
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Пользователь</option>
            ${isAdminUser ? '<option value="admin" selected>Администратор</option>' : ''}
          </select>
        </td>
        <td><input class="form-control form-control-sm" data-field="password" data-user-id="${u.id}" type="password" minlength="8" placeholder="Новый пароль (мин. 8)" /></td>
        <td class="d-flex gap-2 justify-content-end">
          <button class="btn btn-sm btn-outline-secondary" data-save="${u.id}">Сохранить</button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${u.id}" ${isAdminUser ? 'disabled' : ''}>Удалить</button>
        </td>
      </tr>`;
      }).join('') || '<tr><td colspan="6" class="text-secondary">Ничего не найдено.</td></tr>';

      usersTable.querySelectorAll('[data-save]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.save;
          const auth = read(STORAGE_KEYS.auth, null);
          const currentRowUser = users.find((u) => u.id === userId);
          if (!currentRowUser) return;

          const emailInput = usersTable.querySelector(`[data-field="email"][data-user-id="${userId}"]`);
          const firstNameInput = usersTable.querySelector(`[data-field="firstName"][data-user-id="${userId}"]`);
          const lastNameInput = usersTable.querySelector(`[data-field="lastName"][data-user-id="${userId}"]`);
          const roleInput = usersTable.querySelector(`[data-field="role"][data-user-id="${userId}"]`);
          const passwordInput = usersTable.querySelector(`[data-field="password"][data-user-id="${userId}"]`);

          const editedUser = currentRowUser;
          const nextRole = roleInput ? roleInput.value : editedUser.role;
          const normalizedEmail = emailInput.value.trim().toLowerCase();
          const firstName = firstNameInput.value.trim();
          const lastName = lastNameInput.value.trim();

          const fullName = `${firstName} ${lastName}`.trim();
          if (!normalizedEmail || !emailInput.checkValidity() || fullName.length < 2) {
            alert('Проверьте корректность полей: email и ФИО обязательны.');
            return;
          }

          if (editedUser.role === 'admin' && nextRole !== 'admin') {
            alert('Роль администратора нельзя изменить.');
            return;
          }
          if (editedUser.role !== 'admin' && nextRole === 'admin') {
            alert('Назначение роли администратора через этот раздел запрещено.');
            return;
          }

          if (auth?.token) {
            try {
              const response = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                  email: normalizedEmail,
                  fullName,
                  role: nextRole === 'admin' ? 'ADMIN' : (nextRole === 'manager' ? 'EVENT_MANAGER' : 'USER'),
                  password: passwordInput.value.trim() || null,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data.message || data.error || 'Не удалось обновить пользователя в базе данных.');
              }
              renderUsers();
              showUsersUpdateToast('Данные успешно обновлены и сохранены в базе данных.');
              return;
            } catch (error) {
              alert(error.message);
              return;
            }
          }

          const allUsers = read(STORAGE_KEYS.users, []);
          if (allUsers.some((u) => u.id !== userId && u.email.toLowerCase() === normalizedEmail)) {
            alert('Пользователь с таким email уже существует.');
            return;
          }
          const idx = allUsers.findIndex((u) => u.id === userId);
          if (idx < 0) return;
          allUsers[idx] = {
            ...allUsers[idx],
            email: normalizedEmail,
            fullName,
            role: nextRole,
          };

          if (passwordInput.value.trim()) {
            if (passwordInput.value.trim().length < 8) {
              alert('Новый пароль должен быть не короче 8 символов.');
              return;
            }
            allUsers[idx].password = passwordInput.value.trim();
          }

          write(STORAGE_KEYS.users, allUsers);
          renderUsers();
          showUsersUpdateToast();
        });
      });

      usersTable.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.delete;
          const auth = read(STORAGE_KEYS.auth, null);
          const userToDelete = users.find((u) => u.id === userId);
          if (!userToDelete) return;

          if (currentUser.id === userId || userToDelete.role === 'admin') {
            alert('Нельзя удалить администратора.');
            return;
          }

          if (auth?.token) {
            try {
              const response = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(userId)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${auth.token}` },
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data.message || data.error || 'Не удалось удалить пользователя из базы данных.');
              }
              renderUsers();
              showUsersUpdateToast('Пользователь успешно удален из базы данных.');
              return;
            } catch (error) {
              alert(error.message);
              return;
            }
          }

          const allUsers = read(STORAGE_KEYS.users, []);
          write(STORAGE_KEYS.users, allUsers.filter((u) => u.id !== userId));
          renderUsers();
          showUsersUpdateToast('Пользователь успешно удален.');
        });
      });
    }

    openCreateBtn.addEventListener('click', () => createCard.classList.remove('d-none'));
    closeCreateBtn.addEventListener('click', () => {
      createCard.classList.add('d-none');
      createForm.reset();
      createForm.classList.remove('was-validated');
      const feedback = createForm.querySelector('[data-feedback]');
      feedback.textContent = '';
      feedback.className = 'mt-3';
    });
    if (usersSearchInput) {
      usersSearchInput.addEventListener('input', renderUsers);
    }

    createForm.dataset.handled = 'custom';
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!createForm.checkValidity()) {
        createForm.classList.add('was-validated');
        return;
      }

      const users = read(STORAGE_KEYS.users, []);
      const email = document.getElementById('managerEmail').value.trim().toLowerCase();
      const fullName = `${document.getElementById('managerFirstName').value.trim()} ${document.getElementById('managerLastName').value.trim()}`.trim();
      const password = document.getElementById('managerPassword').value;
      const feedback = createForm.querySelector('[data-feedback]');
      const auth = read(STORAGE_KEYS.auth, null);

      if (auth?.token) {
        fetch(`${API_BASE}/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ email, password, fullName }),
        })
          .then(async (response) => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data.message || data.error || 'Не удалось создать пользователя в базе данных.');
            }

            feedback.className = 'alert alert-success mt-3';
            feedback.textContent = `Пользователь ${email} успешно создан.`;
            createForm.reset();
            createForm.classList.remove('was-validated');
            renderUsers();
          })
          .catch((error) => {
            feedback.className = 'alert alert-danger mt-3';
            feedback.textContent = error.message;
          });
        return;
      }

      if (users.some((u) => u.email.toLowerCase() === email)) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = 'Пользователь с таким email уже существует.';
        return;
      }

      users.push({
        id: `u-${Date.now()}`,
        fullName,
        email,
        password,
        phone: '',
        role: 'manager',
      });
      write(STORAGE_KEYS.users, users);

      feedback.className = 'alert alert-success mt-3';
      feedback.textContent = `Пользователь ${email} успешно создан.`;
      createForm.reset();
      createForm.classList.remove('was-validated');
      renderUsers();
    });

    renderUsers();
  }

  async function initManagerEventsPage() {
    const wrap = document.getElementById('managerEventsPanel');
    if (!wrap) return;
    requireAuth();
    const user = getCurrentUser();
    if (user.role !== 'manager') {
      window.location.href = 'events.html';
      return;
    }

    const auth = read(STORAGE_KEYS.auth, null);
    const form = document.getElementById('managerEventForm');
    const table = document.getElementById('managerEventsTable');
    const resetBtn = document.getElementById('managerEventFormReset');

    async function loadManagerEvents() {
      const response = await fetch(`${API_BASE}/events`);
      if (!response.ok) throw new Error('Не удалось загрузить события.');
      const events = await response.json();
      table.innerHTML = events.map((event) => `<tr>
        <td>${event.title}</td><td>${event.city}</td><td>${new Date(event.startDateTime).toLocaleString('ru-RU')}</td>
        <td class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-edit="${event.id}">Изменить</button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${event.id}">Удалить</button>
        </td></tr>`).join('') || '<tr><td colspan="4">Событий пока нет.</td></tr>';

      table.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', async () => {
        const resp = await fetch(`${API_BASE}/manager/events/${btn.dataset.delete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
        if (!resp.ok) {
          alert('Не удалось удалить событие.');
          return;
        }
        await loadManagerEvents();
      }));

      table.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
        const event = events.find((e) => String(e.id) === btn.dataset.edit);
        document.getElementById('managerEventId').value = event.id;
        document.getElementById('managerEventTitle').value = event.title;
        document.getElementById('managerEventDescription').value = event.description;
        document.getElementById('managerEventCity').value = event.city;
        document.getElementById('managerEventVenue').value = event.venue;
        document.getElementById('managerEventStart').value = event.startDateTime.slice(0, 16);
        document.getElementById('managerEventEnd').value = event.endDateTime.slice(0, 16);
      }));
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = document.getElementById('managerEventId').value;
      const payload = {
        title: document.getElementById('managerEventTitle').value.trim(),
        description: document.getElementById('managerEventDescription').value.trim(),
        city: document.getElementById('managerEventCity').value.trim(),
        venue: document.getElementById('managerEventVenue').value.trim(),
        latitude: 53.9,
        longitude: 27.5667,
        mapUrl: '',
        startDateTime: document.getElementById('managerEventStart').value,
        endDateTime: document.getElementById('managerEventEnd').value,
      };
      const url = eventId ? `${API_BASE}/manager/events/${eventId}` : `${API_BASE}/manager/events`;
      const method = eventId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        alert('Не удалось сохранить событие.');
        return;
      }
      form.reset();
      document.getElementById('managerEventId').value = '';
      await loadManagerEvents();
      await renderEvents();
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('managerEventId').value = '';
    });

    await loadManagerEvents();
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
      document.getElementById('totalRevenue').textContent = `${orders.reduce((sum, o) => sum + o.total, 0)} BYN`;

      eventsTable.innerHTML = events.map((e) => `<tr>
        <td>${e.title}</td><td>${e.type}</td><td>${e.date}</td><td>${e.price} BYN</td><td>${e.ticketLimit}</td>
        <td class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" data-edit="${e.id}">Изменить</button><button class="btn btn-sm btn-outline-danger" data-delete="${e.id}">Удалить</button></td>
      </tr>`).join('');

      ordersTable.innerHTML = orders.map((o) => `<tr><td>${o.eventTitle}</td><td>${o.qty}</td><td>${o.total} BYN</td><td>${o.status}</td><td>${new Date(o.createdAt).toLocaleString('ru-RU')}</td></tr>`).join('') || '<tr><td colspan="5">Заказов пока нет.</td></tr>';

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
  initForgotPasswordPage();
  renderEvents();
  initEventDetailsPage();
  initTicketPage();
  initMyTicketsPage();
  initProfilePage();
  initAdminPage();
  initAdminUsersPage();
  initManagerEventsPage();
})();
