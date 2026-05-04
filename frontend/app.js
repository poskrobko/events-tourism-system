(function () {
  'use strict';

  const STORAGE_KEYS = {
    users: 'eventflow_users_v1',
    auth: 'eventflow_auth_v1',
    events: 'eventflow_events_v1',
    orders: 'eventflow_orders_v1',
    canceledEvents: 'eventflow_canceled_events_v1',
  };

  const EVENT_TYPES = ['Бизнес', 'Фестиваль', 'Музыка', 'Творчество', 'Концерты', 'Образование', 'Спорт', 'Другое'];
  const API_BASE = 'http://localhost:8080/api';

  const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1170&auto=format&fit=crop';

  function resolveEventImage(imageValue) {
    const raw = String(imageValue || '').trim();
    if (!raw) return DEFAULT_EVENT_IMAGE;
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:image/')) return raw;
    const normalized = raw.replace(/^\/+/, '');
    return `${window.location.origin}/images/${normalized}`;
  }


  function normalizeEventType(value) {
    const type = String(value || '').trim();
    if (!type) return 'Другое';
    if (type === 'Пинск' || type.toLowerCase() === 'pub club') return 'Другое';
    return EVENT_TYPES.includes(type) ? type : 'Другое';
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
        email: 'admin@event.local',
        password: 'admin123',
        role: 'admin',
        phone: '+70000000000',
      }]);
    }
    if (!read(STORAGE_KEYS.orders, null)) write(STORAGE_KEYS.orders, []);
  }

  function getCurrentUser() {
    const auth = read(STORAGE_KEYS.auth, null);
    if (!auth || !auth.token) return null;
    return read(STORAGE_KEYS.users, []).find((u) => u.id === auth.userId) || null;
  }

  function getAuthToken() {
    return read(STORAGE_KEYS.auth, {})?.token || '';
  }

  function requireAuth(redirect = 'login.html') {
    if (!getCurrentUser() || !getAuthToken()) window.location.href = redirect;
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
      type: normalizeEventType(event.venue),
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
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    function normalizeEvent(event) {
      const start = new Date(event.startDateTime);
      return {
        id: event.id,
        title: event.title,
        type: normalizeEventType(event.venue),
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


    function hasActiveFilters() {
      return state.type !== 'all' || state.city !== 'all' || Boolean(state.from) || Boolean(state.to);
    }

    function syncClearFiltersButton() {
      if (!clearFiltersBtn) return;
      clearFiltersBtn.classList.toggle('d-none', !hasActiveFilters());
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
            <img src="${event.image}" class="card-img-top" alt="${event.title}" loading="lazy" decoding="async" fetchpriority="low" style="height:190px; object-fit:cover" />
            <div class="card-body d-flex flex-column">
              <span class="badge badge-status mb-2">${event.type}</span>
              ${isEventCanceled(event.id) ? '<span class="badge text-bg-danger mb-2">Отменён</span>' : ''}
              <h2 class="h5">${event.title}</h2>
              <p class="text-secondary mb-3">${new Date(event.date).toLocaleDateString('ru-RU')} · ${event.city} · ${event.time}</p>
              <a href="event-details.html?id=${event.id}" class="btn btn-primary w-100 mt-auto">Подробнее</a>
            </div>
          </article>
        </div>
      `).join('') || '<p class="text-secondary">По фильтрам ничего не найдено.</p>';

      pagination.innerHTML = '';
      if (filtered.length > state.perPage) {
        for (let i = 1; i <= totalPages; i += 1) {
          const btn = document.createElement('button');
          btn.className = `btn btn-sm ${i === state.page ? 'btn-primary' : 'btn-outline-secondary'}`;
          btn.textContent = String(i);
          btn.addEventListener('click', () => { state.page = i; render(); });
          pagination.appendChild(btn);
        }
      }
      syncClearFiltersButton();
    }

    function renderTypes() {
      const types = Array.from(new Set(state.events.map((e) => normalizeEventType(e.type))))
        .filter((type) => type !== 'Пинск' && type.toLowerCase() !== 'pub club')
        .sort();
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


    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        state.type = 'all';
        state.city = 'all';
        state.from = '';
        state.to = '';
        typeSelect.value = 'all';
        citySelect.value = 'all';
        fromInput.value = '';
        toInput.value = '';
        state.page = 1;
        render();
      });
    }

    loadEvents();
  }

  function initEventDetailsPage() {
    const titleNode = document.getElementById('eventTitle');
    if (!titleNode) return;
    const id = new URLSearchParams(window.location.search).get('id');
    const paymentDeclineMessage = sessionStorage.getItem('eventflow_payment_declined_message');
    if (paymentDeclineMessage) {
      const main = document.querySelector('main.container');
      if (main) {
        const alertNode = document.createElement('div');
        alertNode.className = 'alert alert-danger';
        alertNode.textContent = paymentDeclineMessage;
        main.prepend(alertNode);
      }
      sessionStorage.removeItem('eventflow_payment_declined_message');
    }
    fetch(`${API_BASE}/events/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Не удалось загрузить детали события.');
        return data;
      })
      .then((details) => {
        const event = mapApiEventToUi(details.event);
        document.getElementById('eventType').textContent = event.type;
        titleNode.textContent = event.title;
        document.getElementById('eventDescription').textContent = event.description;
        document.getElementById('eventDate').textContent = `📅 ${new Date(event.date).toLocaleDateString('ru-RU')}`;
        document.getElementById('eventTime').textContent = `🕖 ${event.time}`;
        document.getElementById('eventCity').textContent = `📍 ${event.city}`;
        const eventImage = document.getElementById('eventImage');
        eventImage.loading = 'eager';
        eventImage.decoding = 'async';
        eventImage.fetchPriority = 'high';
        eventImage.src = event.image;
        eventImage.onerror = () => { eventImage.src = DEFAULT_EVENT_IMAGE; };
        const minTicket = details.ticketTypes?.[0]?.price ?? event.price;
        document.getElementById('eventPrice').textContent = `${minTicket} BYN`;
        const buyTicketBtn = document.getElementById('buyTicketBtn');
        const soldOutNotice = document.getElementById('soldOutNotice');
        const eventEndedNotice = document.getElementById('eventEndedNotice');
        const eventCanceledNotice = document.getElementById('eventCanceledNotice');
        const eventEndDateTime = details.event?.endDateTime ? new Date(details.event.endDateTime) : new Date(details.event?.startDateTime || event.date);
        const isEventEnded = !Number.isNaN(eventEndDateTime.getTime()) && eventEndDateTime < new Date();
        const totalAvailable = (details.ticketTypes || []).reduce((sum, tt) => sum + Number(tt.quantityAvailable || 0), 0);
        buyTicketBtn.href = getCurrentUser() ? `ticket.html?id=${event.id}` : 'login.html';
        if (isEventCanceled(event.id)) {
          buyTicketBtn.classList.add('disabled');
          buyTicketBtn.setAttribute('aria-disabled', 'true');
          buyTicketBtn.addEventListener('click', (e) => e.preventDefault());
          eventCanceledNotice?.classList.remove('d-none');
          soldOutNotice?.classList.add('d-none');
          eventEndedNotice?.classList.add('d-none');
        } else if (isEventEnded) {
          buyTicketBtn.classList.add('disabled');
          buyTicketBtn.setAttribute('aria-disabled', 'true');
          buyTicketBtn.addEventListener('click', (e) => e.preventDefault());
          eventCanceledNotice?.classList.add('d-none');
          soldOutNotice?.classList.add('d-none');
          eventEndedNotice?.classList.remove('d-none');
        } else if (totalAvailable <= 0) {
          buyTicketBtn.classList.add('disabled');
          buyTicketBtn.setAttribute('aria-disabled', 'true');
          buyTicketBtn.addEventListener('click', (e) => e.preventDefault());
          eventCanceledNotice?.classList.add('d-none');
          if (soldOutNotice) soldOutNotice.classList.remove('d-none');
          eventEndedNotice?.classList.add('d-none');
        } else {
          eventCanceledNotice?.classList.add('d-none');
          soldOutNotice?.classList.add('d-none');
          eventEndedNotice?.classList.add('d-none');
        }
        const ticketAvailability = document.getElementById('ticketAvailability');
        if (ticketAvailability) {
          ticketAvailability.innerHTML = (details.ticketTypes || []).length
            ? details.ticketTypes.map((tt) => `<li class="list-group-item d-flex justify-content-between"><span>${tt.name}</span><span>Осталось: ${tt.quantityAvailable}</span></li>`).join('')
            : '<li class="list-group-item text-muted">Типы билетов еще не добавлены.</li>';
        }
        const program = details.program || [];
        document.getElementById('eventSchedule').innerHTML = program.map((item) => (
          `<li class="list-group-item"><strong>${item.title}</strong> <small class="text-muted">${String(item.startDateTime || '').slice(11, 16)}</small>${item.description ? `<br>${item.description}` : ''}</li>`
        )).join('') || '<li class="list-group-item text-muted">Программа пока не добавлена</li>';
      })
      .catch((error) => {
        document.getElementById('eventSchedule').innerHTML = `<li class="list-group-item text-danger">${error.message}</li>`;
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
    let ticketTypes = [];
    title.textContent = event.title;
    buyerEmail.value = user.email;

    function updateTotal() {
      const selectedType = ticketTypes.find((item) => String(item.id) === String(ticketType.value));
      const price = selectedType ? Number(selectedType.price) : Number(event.price || 0);
      const qty = Number(qtyInput.value || 1);
      totalNode.textContent = `${price * qty} BYN`;
    }
    qtyInput.addEventListener('input', updateTotal);
    ticketType.addEventListener('change', updateTotal);
    fetch(`${API_BASE}/events/${id}/tickets`)
      .then((response) => response.json())
      .then((data) => {
        ticketTypes = data || [];
        if (ticketTypes.length) {
          ticketType.innerHTML = ticketTypes.map((item) => `<option value="${item.id}" ${Number(item.quantityAvailable) <= 0 ? 'disabled' : ''}>${item.name} — ${item.price} BYN (осталось: ${item.quantityAvailable})</option>`).join('');
        }
        updateTotal();
      })
      .catch(() => updateTotal());

    form.dataset.handled = 'custom';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const feedback = form.querySelector('[data-feedback]');
      try {
        const response = await fetch(`${API_BASE}/user/tickets/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
          body: JSON.stringify({ ticketTypeId: Number(ticketType.value), quantity: Number(qtyInput.value), paymentMethod: 'CARD' }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Не удалось создать заказ.');
        const eventTitleParam = encodeURIComponent(event.title || '');
        const ticketTypeLabel = ticketType.options[ticketType.selectedIndex]?.textContent || '';
        const quantityParam = encodeURIComponent(String(qtyInput.value || 1));
        const totalParam = encodeURIComponent(String((ticketTypes.find((item) => String(item.id) === String(ticketType.value))?.price || event.price || 0) * Number(qtyInput.value || 1)));
        const eventIdParam = encodeURIComponent(String(event.id || ''));
        window.location.href = `payment.html?orderId=${encodeURIComponent(data.id)}&eventId=${eventIdParam}&eventTitle=${eventTitleParam}&ticketType=${encodeURIComponent(ticketTypeLabel)}&qty=${quantityParam}&total=${totalParam}`;
      } catch (error) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = error.message;
      }
    });
  }


  async function initPaymentPage() {
    const title = document.getElementById('paymentTitle');
    if (!title) return;
    requireAuth();

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/user/orders`, { headers: { Authorization: `Bearer ${token}` } });
    const orders = await response.json();
    const order = (orders || []).find((o) => String(o.id) === String(orderId));
    if (!order) { window.location.href = 'my-tickets.html'; return; }

    title.textContent = `Оплата заказа №${order.id}`;
    const firstItem = order.items?.[0] || null;
    const fallbackEventTitle = params.get('eventTitle') || '';
    const fallbackTicketType = params.get('ticketType') || '';
    const fallbackQty = Number(params.get('qty') || 1);
    const fallbackTotal = params.get('total');

    document.getElementById('paymentEvent').textContent = firstItem?.eventTitle || fallbackEventTitle || `Заказ #${order.id}`;
    document.getElementById('paymentTicketType').textContent = firstItem?.ticketType || fallbackTicketType || 'Билет';
    document.getElementById('paymentQty').textContent = firstItem?.quantity || fallbackQty || 1;
    const totalAmount = order.totalAmount ?? fallbackTotal ?? 0;
    document.getElementById('paymentTotal').textContent = `${totalAmount} BYN`;
    const feedback = document.getElementById('paymentFeedback');

    document.getElementById('paySuccessBtn').addEventListener('click', async () => {
      const payResp = await fetch(`${API_BASE}/user/orders/${order.id}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paymentMethod: 'CARD' }) });
      if (payResp.ok) window.location.href = 'my-tickets.html';
    });
    document.getElementById('payDeclineBtn').addEventListener('click', async () => {
      await fetch(`${API_BASE}/user/orders/${order.id}/pay-decline`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      sessionStorage.setItem('eventflow_payment_declined_message', 'Оплата неуспешна. Попробуйте снова или выберите другой билет.');
      const eventId = firstItem?.eventId || params.get('eventId');
      if (eventId) {
        window.location.href = `event-details.html?id=${encodeURIComponent(eventId)}`;
        return;
      }
      window.location.href = 'events.html';
    });
    document.getElementById('payFailBtn').addEventListener('click', async () => {
      await fetch(`${API_BASE}/user/orders/${order.id}/pay-later`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      feedback.className = 'alert alert-warning';
      feedback.textContent = 'Заказ сохранен в статусе Ожидается оплата.';
      window.location.href = 'my-tickets.html';
    });
  }

  async function initMyTicketsPage() {
    const list = document.getElementById('myTicketsList');
    const pendingList = document.getElementById('myOrdersPendingList');
    const completedList = document.getElementById('myCompletedTicketsList');
    if (!list) return;
    requireAuth();
    const user = getCurrentUser();
    if (user.role === 'admin') { window.location.href = 'admin.html'; return; }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/user/orders`, { headers: { Authorization: `Bearer ${token}` } });
    const orders = await response.json();
    const activePaid = (orders || []).filter((o) => (o.paymentStatus === 'PAID' || o.paymentStatus === 'REFUNDED') && !o.isEventCompleted);
    const completed = (orders || []).filter((o) => (o.paymentStatus === 'PAID' || o.paymentStatus === 'REFUNDED') && o.isEventCompleted);
    const pending = (orders || []).filter((o) => o.paymentStatus === 'PENDING');
    const paymentStatusLabel = (status) => {
      if (status === 'PAID') return 'Оплачено';
      if (status === 'PENDING') return 'Ожидается оплата';
      if (status === 'REFUNDED') return 'Билет возвращен · Деньги возвращены';
      return status;
    };
    const paymentStatusClass = (status) => {
      if (status === 'PAID') return 'status-pill status-pill--paid';
      if (status === 'PENDING') return 'status-pill status-pill--pending';
      if (status === 'REFUNDED') return 'status-pill status-pill--refunded';
      return 'status-pill status-pill--default';
    };
    const paymentStatusBadge = (status) => `<span class='${paymentStatusClass(status)}'>${paymentStatusLabel(status)}</span>`;
    const eventLabel = (order) => order.items?.[0]?.eventTitle || `Заказ #${order.id}`;

    const renderPaginatedList = (items, listEl, pagerEl, renderItem, emptyText, pageSize = 7) => {
      if (!listEl) return;
      let currentPage = 1;
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

      const draw = () => {
        const startIdx = (currentPage - 1) * pageSize;
        const pageItems = items.slice(startIdx, startIdx + pageSize);
        listEl.innerHTML = pageItems.length ? pageItems.map(renderItem).join('') : `<li class="list-group-item">${emptyText}</li>`;
        if (!pagerEl) return;
        if (items.length <= pageSize) { pagerEl.innerHTML = ''; return; }
        pagerEl.innerHTML = `<button class="btn btn-sm btn-outline-secondary" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>Назад</button><span class="align-self-center small text-secondary">${currentPage} / ${totalPages}</span><button class="btn btn-sm btn-outline-secondary" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Вперед</button>`;
        pagerEl.querySelector('[data-page="prev"]')?.addEventListener('click', () => { if (currentPage > 1) { currentPage -= 1; draw(); } });
        pagerEl.querySelector('[data-page="next"]')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage += 1; draw(); } });
      };
      draw();
    };

    renderPaginatedList(activePaid, list, document.getElementById('myTicketsPagination'), (o) => {
      const isRefunded = o.paymentStatus === 'REFUNDED';
      return `<li class='list-group-item d-flex justify-content-between align-items-center'><div><strong>${eventLabel(o)}</strong><div class='small text-secondary'>Заказ #${o.id} · ${new Date(o.createdAt).toLocaleString('ru-RU')} · ${paymentStatusBadge(o.paymentStatus)}</div></div><div class='d-flex align-items-center gap-2'><span class='${isRefunded ? 'text-secondary' : 'text-success'} fw-semibold'>${o.totalAmount} BYN</span>${isRefunded ? '' : `<button class='btn btn-outline-danger btn-sm' data-refund-ticket='${o.id}'>Вернуть билет</button><button class='btn btn-outline-primary btn-sm' data-download-ticket='${o.id}'>Скачать PDF</button>`}</div></li>`;
    }, 'Пока нет оплаченных билетов.');

    renderPaginatedList(pending, pendingList, document.getElementById('myOrdersPagination'), (o) => `<li class='list-group-item d-flex justify-content-between align-items-center'><div><strong>${eventLabel(o)}</strong><div class='small text-secondary'>Заказ #${o.id} · ${paymentStatusBadge(o.paymentStatus)}</div></div><div class='d-flex gap-2'><button class='btn btn-primary btn-sm' data-pay-order='${o.id}'>Оплатить</button><button class='btn btn-outline-danger btn-sm' data-cancel-order='${o.id}'>Отменить покупку</button></div></li>`, 'Нет заказов в ожидании оплаты.');

    renderPaginatedList(completed, completedList, document.getElementById('myCompletedPagination'), (o) => `<li class='list-group-item d-flex justify-content-between align-items-center'><div><strong>${eventLabel(o)}</strong><div class='small text-secondary'>Заказ #${o.id} · Событие завершено · ${paymentStatusBadge(o.paymentStatus)}</div></div><span class='badge text-bg-secondary'>Завершено</span></li>`, 'Нет завершенных событий.');

    pendingList.querySelectorAll('[data-pay-order]').forEach((btn) => btn.addEventListener('click', async () => {
      await fetch(`${API_BASE}/user/orders/${btn.dataset.payOrder}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paymentMethod: 'CARD' }) });
      window.location.reload();
    }));

    const cancelPurchaseModalEl = document.getElementById('cancelPurchaseModal');
    const cancelPurchaseModal = cancelPurchaseModalEl && window.bootstrap?.Modal ? new window.bootstrap.Modal(cancelPurchaseModalEl) : null;
    const confirmCancelPurchaseBtn = document.getElementById('confirmCancelPurchaseBtn');
    let selectedCancelOrderId = null;

    pendingList.querySelectorAll('[data-cancel-order]').forEach((btn) => btn.addEventListener('click', async () => {
      selectedCancelOrderId = btn.dataset.cancelOrder;
      if (cancelPurchaseModal) {
        cancelPurchaseModal.show();
        return;
      }
      if (!window.confirm('Вы уверены, что хотите отменить покупку?')) return;
      await fetch(`${API_BASE}/user/orders/${selectedCancelOrderId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    }));

    if (confirmCancelPurchaseBtn) {
      confirmCancelPurchaseBtn.addEventListener('click', async () => {
        if (!selectedCancelOrderId) return;
        await fetch(`${API_BASE}/user/orders/${selectedCancelOrderId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        cancelPurchaseModal?.hide();
        window.location.reload();
      });
    }

    const refundModalEl = document.getElementById('refundConfirmModal');
    const refundModal = refundModalEl && window.bootstrap?.Modal ? new window.bootstrap.Modal(refundModalEl) : null;
    const confirmRefundBtn = document.getElementById('confirmRefundBtn');
    let selectedRefundOrderId = null;

    list.querySelectorAll('[data-refund-ticket]').forEach((btn) => btn.addEventListener('click', async () => {
      selectedRefundOrderId = btn.dataset.refundTicket;
      if (refundModal) {
        refundModal.show();
        return;
      }
      if (window.confirm('Вы уверены, что хотите вернуть билет?')) {
        await fetch(`${API_BASE}/user/orders/${selectedRefundOrderId}/refund`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        window.location.reload();
      }
    }));

    if (confirmRefundBtn) {
      confirmRefundBtn.addEventListener('click', async () => {
        if (!selectedRefundOrderId) return;
        await fetch(`${API_BASE}/user/orders/${selectedRefundOrderId}/refund`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        refundModal?.hide();
        window.location.reload();
      });
    }

    list.querySelectorAll('[data-download-ticket]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const order = activePaid.find((item) => String(item.id) === String(btn.dataset.downloadTicket));
        if (!order || order.paymentStatus === 'REFUNDED') return;
        await downloadTicketPdf(order, user);
      });
    });
  }



  const PDF_CYRILLIC_FONT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
  let pdfCyrillicFontLoaded = false;

  async function ensurePdfCyrillicFont(doc) {
    if (pdfCyrillicFontLoaded) {
      doc.setFont('Roboto', 'normal');
      return;
    }

    const response = await fetch(PDF_CYRILLIC_FONT_URL);
    if (!response.ok) {
      throw new Error('Не удалось загрузить шрифт для PDF.');
    }

    const fontBuffer = await response.arrayBuffer();
    const fontBytes = new Uint8Array(fontBuffer);
    let binary = '';
    fontBytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    const base64Font = btoa(binary);
    doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal', 'Identity-H');
    doc.setFont('Roboto', 'normal');
    pdfCyrillicFontLoaded = true;
  }

  function slugifyFilePart(value, fallback = 'ticket') {
    const normalized = String(value || '')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || fallback;
  }

  async function downloadTicketPdf(order, user) {
    const jsPdfLib = window.jspdf?.jsPDF;
    if (!jsPdfLib) {
      alert('Не удалось сформировать PDF. Попробуйте обновить страницу.');
      return;
    }

    const doc = new jsPdfLib({ putOnlyUsedFonts: true });
    const purchaseDate = new Date(order.createdAt).toLocaleString('ru-RU');
    const purchaseDateForFile = new Date(order.createdAt).toISOString().slice(0, 10);
    const ticketNumber = String(order.id).replace('o-', '');
    const firstItem = order.items?.[0] || null;
    const eventTitle = firstItem?.eventTitle || order.eventTitle || 'Без названия';
    const ticketTypeLabel = firstItem?.ticketType || order.ticketTypeLabel || 'Standard';
    const quantity = firstItem?.quantity || order.qty || 1;
    const total = order.totalAmount ?? order.total ?? 0;
    const lines = [
      'ЭЛЕКТРОННЫЙ БИЛЕТ',
      '',
      `Номер билета: ${ticketNumber}`,
      `Событие: ${eventTitle}`,
      `Покупатель: ${user.fullName || 'Не указан'}`,
      `Email: ${user.email || 'Не указан'}`,
      `Тип билета: ${ticketTypeLabel}`,
      `Количество: ${quantity}`,
      `Сумма: ${total} BYN`,
      `Дата покупки: ${purchaseDate}`,
      '',
      'Покажите этот билет на входе.',
    ];

    try {
      await ensurePdfCyrillicFont(doc);
    } catch (error) {
      alert('Не удалось загрузить шрифт для корректного отображения русских символов в PDF.');
      return;
    }

    doc.setFontSize(18);
    doc.text(lines[0], 20, 20);
    doc.setFontSize(12);
    doc.text(lines.slice(2), 20, 35, { maxWidth: 170 });

    const safeEventTitle = slugifyFilePart(eventTitle, 'event');
    const ticketFileName = `bilet-${safeEventTitle}-${purchaseDateForFile}-#${ticketNumber}.pdf`;
    doc.save(ticketFileName);

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

    const feedback = form.querySelector('[data-feedback]');
    const avatarImage = document.getElementById('profileAvatar');
    const avatarFileInput = document.getElementById('profileAvatarFile');
    let avatarValue = '';

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Не удалось загрузить изображение.'));
        reader.readAsDataURL(file);
      });
    }

    function renderProfile(profile) {
      document.getElementById('profileName').textContent = `${profile.firstName} ${profile.lastName}`.trim();
      document.getElementById('profileEmail').textContent = profile.email;
      document.getElementById('profileFirstName').value = profile.firstName || '';
      document.getElementById('profileLastName').value = profile.lastName || '';
      document.getElementById('profileEmailInput').value = profile.email;
      document.getElementById('profilePhoneInput').value = profile.phone || '';
      avatarValue = profile.avatarUrl || '';
      avatarImage.src = avatarValue || `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.firstName || 'User') + ' ' + (profile.lastName || ''))}&background=FFD150&color=3d2a00&size=120`;
    }

    fetch(`${API_BASE}/user/profile`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Не удалось загрузить профиль.');
        renderProfile(data);
      })
      .catch((error) => {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = error.message;
      });

    form.dataset.handled = 'custom';
    avatarFileInput.addEventListener('change', async () => {
      const [file] = avatarFileInput.files || [];
      if (!file) return;
      try {
        avatarValue = await readFileAsDataUrl(file);
        avatarImage.src = avatarValue;
      } catch (error) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = error.message;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
          body: JSON.stringify({
            firstName: document.getElementById('profileFirstName').value.trim(),
            lastName: document.getElementById('profileLastName').value.trim(),
            email: document.getElementById('profileEmailInput').value.trim().toLowerCase(),
            avatarUrl: avatarValue || null,
            phone: document.getElementById('profilePhoneInput').value.trim(),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Не удалось обновить профиль.');
        renderProfile(data);
        feedback.className = 'alert alert-success mt-3';
        feedback.textContent = 'Профиль успешно обновлен.';
      } catch (error) {
        feedback.className = 'alert alert-danger mt-3';
        feedback.textContent = error.message;
      }
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
            phone: u.phone || '',
            password: '',
            role: u.role === 'ADMIN' ? 'admin' : (u.role === 'EVENT_MANAGER' ? 'manager' : 'user'),
          }));
        } catch (error) {
          const row = `<tr><td colspan="7" class="text-danger">${error.message}</td></tr>`;
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
        <td><input class="form-control form-control-sm" data-field="phone" data-user-id="${u.id}" value="${u.phone || ''}" /></td>
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
      }).join('') || '<tr><td colspan="7" class="text-secondary">Ничего не найдено.</td></tr>';

      usersTable.querySelectorAll('[data-save]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.save;
          const auth = read(STORAGE_KEYS.auth, null);
          const currentRowUser = users.find((u) => u.id === userId);
          if (!currentRowUser) return;

          const emailInput = usersTable.querySelector(`[data-field="email"][data-user-id="${userId}"]`);
          const firstNameInput = usersTable.querySelector(`[data-field="firstName"][data-user-id="${userId}"]`);
          const lastNameInput = usersTable.querySelector(`[data-field="lastName"][data-user-id="${userId}"]`);
          const phoneInput = usersTable.querySelector(`[data-field="phone"][data-user-id="${userId}"]`);
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
                  phone: phoneInput.value.trim(),
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
            phone: phoneInput.value.trim(),
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

  function collectTicketRows(container, selectors) {
    if (!container) return [];
    const names = Array.from(container.querySelectorAll(selectors.name));
    const prices = Array.from(container.querySelectorAll(selectors.price));
    const quantities = Array.from(container.querySelectorAll(selectors.quantity));
    return names.flatMap((nameInput, index) => {
      const name = nameInput.value?.trim() || '';
      const price = Number(prices[index]?.value);
      const quantity = Number(quantities[index]?.value);
      if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) return [];
      return [{ name, price, quantityTotal: quantity }];
    });
  }

  function collectProgramRows(container, selectors) {
    if (!container) return [];
    const titles = Array.from(container.querySelectorAll(selectors.title));
    const descriptions = Array.from(container.querySelectorAll(selectors.description));
    const times = Array.from(container.querySelectorAll(selectors.time));
    return titles.flatMap((titleInput, index) => {
      const title = titleInput.value?.trim() || '';
      const description = descriptions[index]?.value?.trim() || '';
      const time = times[index]?.value || '';
      if (!title || !time) return [];
      return [{ title, description, time, sortOrder: index }];
    });
  }

  function getCanceledEventIds() {
    const value = read(STORAGE_KEYS.canceledEvents, []);
    return Array.isArray(value) ? value.map(String) : [];
  }

  function isEventCanceled(eventId) {
    return getCanceledEventIds().includes(String(eventId));
  }

  function setEventCanceled(eventId, canceled = true) {
    const ids = new Set(getCanceledEventIds());
    const normalizedId = String(eventId);
    if (canceled) ids.add(normalizedId);
    else ids.delete(normalizedId);
    write(STORAGE_KEYS.canceledEvents, Array.from(ids));
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
    const managerTicketRows = document.getElementById('managerTicketRows');
    const managerProgramRows = document.getElementById('managerProgramRows');
    const addManagerTicketRowBtn = document.getElementById('managerAddTicketRow');
    const addManagerProgramRowBtn = document.getElementById('managerAddProgramRow');

    function buildProgramItemsFromRows(rows, date) {
      return rows.map((row) => ({
        title: row.title,
        startDateTime: `${date}T${row.time}`,
        endDateTime: `${date}T${row.time}`,
        sortOrder: row.sortOrder,
        description: row.description,
      }));
    }

    async function syncManagerProgram(eventId, rows, date) {
      const existingProgramResp = await fetch(`${API_BASE}/events/${eventId}/program`);
      const existingProgram = existingProgramResp.ok ? await existingProgramResp.json() : [];
      for (const item of existingProgram) {
        await fetch(`${API_BASE}/manager/program/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
      const programItems = buildProgramItemsFromRows(rows, date);
      for (const programItem of programItems) {
        await fetch(`${API_BASE}/manager/events/${eventId}/program`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify(programItem),
        });
      }
    }

    addManagerTicketRowBtn?.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'row g-3 ticket-row';
      wrapper.innerHTML = `
        <div class="col-md-4"><input class="form-control manager-ticket-name" placeholder="Тип билета" required /></div>
        <div class="col-md-4"><input class="form-control manager-ticket-price" type="number" min="0" step="0.01" placeholder="Цена" required /></div>
        <div class="col-md-3"><input class="form-control manager-ticket-quantity" type="number" min="1" placeholder="Кол-во билетов" required /></div>
        <div class="col-md-1 d-grid"><button class="btn btn-outline-danger remove-ticket-row ticket-add-btn ms-auto" type="button">−</button></div>`;
      wrapper.querySelector('.remove-ticket-row').addEventListener('click', () => wrapper.remove());
      managerTicketRows?.appendChild(wrapper);
    });
    addManagerProgramRowBtn?.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'row g-2 program-row';
      wrapper.innerHTML = `
        <div class="col-md-4"><input class="form-control manager-program-title" placeholder="Заголовок пункта" required /></div>
        <div class="col-md-5"><input class="form-control manager-program-description" placeholder="Описание пункта (необязательно)" /></div>
        <div class="col-md-2"><input class="form-control manager-program-time" type="time" required /></div>
        <div class="col-md-1 d-grid"><button class="btn btn-outline-danger remove-program-row ticket-add-btn ms-auto" type="button">−</button></div>`;
      wrapper.querySelector('.remove-program-row').addEventListener('click', () => wrapper.remove());
      managerProgramRows?.appendChild(wrapper);
    });

    function resetManagerDynamicRows() {
      const keepFirstRow = (container, selector) => {
        if (!container) return;
        const rows = Array.from(container.querySelectorAll(selector));
        rows.slice(1).forEach((row) => row.remove());
      };
      keepFirstRow(managerTicketRows, '.ticket-row');
      keepFirstRow(managerProgramRows, '.program-row');
    }

    async function loadManagerEvents() {
      const response = await fetch(`${API_BASE}/manager/events`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) throw new Error('Не удалось загрузить события.');
      const events = await response.json();
      table.innerHTML = events.map((event) => `<tr>
        <td>${event.title}${isEventCanceled(event.id) ? ' <span class="badge text-bg-danger">Отменён</span>' : ''}</td><td>${event.city}</td><td>${new Date(event.startDateTime).toLocaleString('ru-RU')}</td><td>${event.availableTickets ?? 0}</td>
        <td class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-edit="${event.id}">Изменить</button>
          <button class="btn btn-sm btn-outline-warning" data-cancel="${event.id}">Отменить</button>
          <button class="btn btn-sm btn-outline-danger" data-delete="${event.id}">Удалить</button>
        </td></tr>`).join('') || '<tr><td colspan="5">Событий пока нет.</td></tr>';

      table.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', async () => {
        const resp = await fetch(`${API_BASE}/manager/events/${btn.dataset.delete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
        if (!resp.ok) {
          alert('Не удалось удалить событие.');
          return;
        }
        await loadManagerEvents();
      }));

      table.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', async () => {
        const event = events.find((e) => String(e.id) === btn.dataset.edit);
        document.getElementById('managerEventId').value = event.id;
        document.getElementById('managerEventTitle').value = event.title;
        document.getElementById('managerEventDescription').value = event.description;
        document.getElementById('managerEventCity').value = event.city;
        document.getElementById('managerEventType').value = normalizeEventType(event.venue);
        document.getElementById('managerEventDate').value = event.startDateTime.slice(0, 10);
        document.getElementById('managerEventTime').value = event.startDateTime.slice(11, 16);
        document.getElementById('managerEventImageUrl').value = event.imageUrl || '';
        try {
          const programResp = await fetch(`${API_BASE}/events/${event.id}/program`);
          const program = programResp.ok ? await programResp.json() : [];
          managerProgramRows.innerHTML = '';
          (program || []).forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'row g-2 program-row';
            wrapper.innerHTML = `
              <div class="col-md-4"><input class="form-control manager-program-title" value="${(item.title || '').replace(/\"/g, '&quot;')}" required /></div>
              <div class="col-md-5"><input class="form-control manager-program-description" value="${(item.description || '').replace(/\"/g, '&quot;')}" /></div>
              <div class="col-md-2"><input class="form-control manager-program-time" type="time" value="${String(item.startDateTime || '').slice(11, 16)}" required /></div>
              <div class="col-md-1 d-grid">${index === 0 ? '<button id="managerAddProgramRow" class="btn btn-outline-secondary ticket-add-btn ms-auto" type="button">+</button>' : '<button class="btn btn-outline-danger remove-program-row ticket-add-btn ms-auto" type="button">−</button>'}</div>`;
            managerProgramRows.appendChild(wrapper);
          });
        } catch {
          managerProgramRows.innerHTML = '';
        }
      }));

      table.querySelectorAll('[data-cancel]').forEach((btn) => btn.addEventListener('click', async () => {
        setEventCanceled(btn.dataset.cancel, true);
        await loadManagerEvents();
        await renderEvents();
      }));
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const eventId = document.getElementById('managerEventId').value;
      const date = document.getElementById('managerEventDate').value;
      const time = document.getElementById('managerEventTime').value;
      const startDateTime = `${date}T${time}`;
      const payload = {
        title: document.getElementById('managerEventTitle').value.trim(),
        description: document.getElementById('managerEventDescription').value.trim(),
        city: document.getElementById('managerEventCity').value.trim(),
        venue: normalizeEventType(document.getElementById('managerEventType').value),
        latitude: 53.9,
        longitude: 27.5667,
        mapUrl: '',
        startDateTime,
        endDateTime: startDateTime,
        imageUrl: document.getElementById('managerEventImageUrl').value.trim() || null,
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
      const savedEvent = await response.json();
      const programRows = collectProgramRows(managerProgramRows, { title: '.manager-program-title', description: '.manager-program-description', time: '.manager-program-time' });
      await syncManagerProgram(savedEvent.id, programRows, date);
      if (!eventId) {
        const tickets = collectTicketRows(managerTicketRows, {
          name: '.manager-ticket-name',
          price: '.manager-ticket-price',
          quantity: '.manager-ticket-quantity',
        });
        for (const ticket of tickets) {
          await fetch(`${API_BASE}/manager/events/${savedEvent.id}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
            body: JSON.stringify(ticket),
          });
        }
      }
      form.reset();
      resetManagerDynamicRows();
      document.getElementById('managerEventId').value = '';
      form.classList.remove('was-validated');
      await loadManagerEvents();
      await renderEvents();
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      resetManagerDynamicRows();
      document.getElementById('managerEventId').value = '';
      form.classList.remove('was-validated');
    });

    await loadManagerEvents();
  }

  function initAdminPage() {
    const wrap = document.getElementById('adminPanel');
    if (!wrap) return;
    requireAdmin();

    const auth = read(STORAGE_KEYS.auth, null);
    const eventsTable = document.getElementById('adminEventsTable');
    const eventsPagination = document.getElementById('adminEventsPagination');
    const ordersTable = document.getElementById('adminOrdersTable');
    const ordersPagination = document.getElementById('adminOrdersPagination');
    const ordersStatusFilter = document.getElementById('adminOrdersStatusFilter');
    const eventForm = document.getElementById('eventCrudForm');
    const adminProgramRows = document.getElementById('adminProgramRows');
    const adminTicketRows = document.getElementById('adminTicketRows');
    const addAdminTicketRowBtn = document.getElementById('adminAddTicketRow');
    const addAdminProgramRowBtn = document.getElementById('adminAddProgramRow');
    const ADMIN_PAGE_SIZE = 7;
    let adminEventsPage = 1;
    let adminOrdersPage = 1;

    addAdminTicketRowBtn?.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'row g-3 ticket-row';
      wrapper.innerHTML = `
        <div class="col-md-4"><input class="form-control admin-ticket-type" placeholder="Тип билета" required /></div>
        <div class="col-md-4"><input class="form-control admin-ticket-price" type="number" min="0" placeholder="Цена" required /></div>
        <div class="col-md-3"><input class="form-control admin-ticket-limit" type="number" min="1" placeholder="Кол-во билетов" required /></div>
        <div class="col-md-1 d-grid"><button class="btn btn-outline-danger remove-ticket-row ticket-add-btn ms-auto" type="button">−</button></div>`;
      wrapper.querySelector('.remove-ticket-row').addEventListener('click', () => wrapper.remove());
      adminTicketRows?.appendChild(wrapper);
    });

    addAdminProgramRowBtn?.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'row g-2 program-row';
      wrapper.innerHTML = `
        <div class="col-md-4"><input class="form-control admin-program-title" placeholder="Заголовок пункта" required /></div>
        <div class="col-md-5"><input class="form-control admin-program-description" placeholder="Описание пункта (необязательно)" /></div>
        <div class="col-md-2"><input class="form-control admin-program-time" type="time" required /></div>
        <div class="col-md-1 d-grid"><button class="btn btn-outline-danger remove-program-row ticket-add-btn ms-auto" type="button">−</button></div>`;
      wrapper.querySelector('.remove-program-row').addEventListener('click', () => wrapper.remove());
      adminProgramRows?.appendChild(wrapper);
    });

    const statusRu = { PAID: 'Оплачено', REFUNDED: 'Возвращен', DECLINED: 'Отменен', PENDING: 'В ожидании' };

    function isEventCompleted(event) {
      const endDate = event.endDateTime || event.startDateTime;
      return endDate ? new Date(endDate).getTime() < Date.now() : false;
    }

    function renderTablePagination(container, totalItems, currentPage, onPageChange, pageSize = ADMIN_PAGE_SIZE) {
      if (!container) return;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      container.innerHTML = '';
      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
        button.textContent = String(page);
        button.addEventListener('click', () => onPageChange(page));
        container.appendChild(button);
      }
    }

    function getPageSlice(items, currentPage, pageSize = ADMIN_PAGE_SIZE) {
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      const safePage = Math.min(Math.max(1, currentPage), totalPages);
      const start = (safePage - 1) * pageSize;
      return { pageItems: items.slice(start, start + pageSize), safePage };
    }

    function buildProgramItemsFromRows(rows, date) {
      return rows.map((row) => ({
        title: row.title,
        startDateTime: `${date}T${row.time}`,
        endDateTime: `${date}T${row.time}`,
        sortOrder: row.sortOrder,
        description: row.description,
      }));
    }

    async function syncAdminProgram(eventId, rows, date) {
      const existingProgramResp = await fetch(`${API_BASE}/events/${eventId}/program`);
      const existingProgram = existingProgramResp.ok ? await existingProgramResp.json() : [];
      for (const item of existingProgram) {
        await fetch(`${API_BASE}/admin/program/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
      const programItems = buildProgramItemsFromRows(rows, date);
      for (const programItem of programItems) {
        await fetch(`${API_BASE}/admin/events/${eventId}/program`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify(programItem),
        });
      }
    }

    function renderOrdersTable(orders) {
      const selectedStatus = ordersStatusFilter?.value || 'ALL';
      const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter((order) => order.paymentStatus === selectedStatus);

      const { pageItems, safePage } = getPageSlice(filteredOrders, adminOrdersPage);
      adminOrdersPage = safePage;
      const rows = [];
      pageItems.forEach((order) => (order.items || []).forEach((item) => rows.push(`<tr><td>${order.userFullName || order.userEmail}</td><td>${item.eventTitle}</td><td>${item.quantity}</td><td>${(Number(item.unitPrice||0)*Number(item.quantity||0)).toFixed(2)} BYN</td><td>${statusRu[order.paymentStatus] || order.paymentStatus}</td><td>${new Date(order.createdAt).toLocaleString('ru-RU')}</td></tr>`)));
      ordersTable.innerHTML = rows.join('') || '<tr><td colspan="6">Заказов по выбранному фильтру нет.</td></tr>';
      renderTablePagination(ordersPagination, filteredOrders.length, adminOrdersPage, (nextPage) => {
        adminOrdersPage = nextPage;
        renderOrdersTable(orders);
      });
    }

    async function loadAdminData() {
      const [eventsResp, ordersResp] = await Promise.all([
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${auth.token}` } }),
      ]);
      if (!eventsResp.ok || !ordersResp.ok) throw new Error('Не удалось загрузить данные админ-панели.');
      const events = await eventsResp.json();
      const orders = await ordersResp.json();

      document.getElementById('totalEvents').textContent = events.length;
      const soldTickets = orders.reduce((sum, order) => {
        if (order.paymentStatus !== 'PAID') return sum;
        const qty = (order.items || []).reduce((s, item) => s + Number(item.quantity || 0), 0);
        return sum + qty;
      }, 0);
      const revenue = orders.reduce((sum, order) => {
        const amount = Number(order.totalAmount || 0);
        if (order.paymentStatus === 'PAID') return sum + amount;
        if (order.paymentStatus === 'REFUNDED') return sum - amount;
        return sum;
      }, 0);
      document.getElementById('totalTickets').textContent = Math.max(0, soldTickets);
      document.getElementById('totalRevenue').textContent = `${Math.max(0, revenue).toFixed(2)} BYN`;

      const { pageItems: eventsPageItems, safePage } = getPageSlice(events, adminEventsPage);
      adminEventsPage = safePage;
      eventsTable.innerHTML = eventsPageItems.map((e) => {
        const priceList = `${e.minTicketPrice ?? 0} BYN`;
        const totalTickets = Number(e.availableTickets || 0);
        const managerLabel = e.managerFullName || e.managerEmail || '—';
        return `<tr>
          <td>${e.title}${isEventCompleted(e) ? ' <span class="badge text-bg-secondary">Завершено</span>' : ''}${isEventCanceled(e.id) ? ' <span class="badge text-bg-danger">Отменён</span>' : ''}</td><td>${e.city}</td><td>${managerLabel}</td><td>${new Date(e.startDateTime).toLocaleString('ru-RU')}</td><td>${priceList}</td><td>${totalTickets}</td>
          <td class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" data-edit="${e.id}">Изменить</button><button class="btn btn-sm btn-outline-warning" data-cancel="${e.id}">Отменить</button><button class="btn btn-sm btn-outline-danger" data-delete="${e.id}">Удалить</button></td>
        </tr>`;
      }).join('') || '<tr><td colspan="7">Событий пока нет.</td></tr>';
      renderTablePagination(eventsPagination, events.length, adminEventsPage, (nextPage) => {
        adminEventsPage = nextPage;
        loadAdminData();
      });

      renderOrdersTable(orders);

      eventsTable.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', async () => {
        const resp = await fetch(`${API_BASE}/admin/events/${btn.dataset.delete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
        if (!resp.ok) return alert('Не удалось удалить событие.');
        await loadAdminData();
      }));

      eventsTable.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', async () => {
        const event = events.find((ev) => String(ev.id) === btn.dataset.edit);
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitleInput').value = event.title;
        document.getElementById('eventTypeInput').value = 'Образование';
        document.getElementById('eventCityInput').value = event.city;
        const start = event.startDateTime?.slice(0, 16) || '';
        document.getElementById('eventDateInput').value = start.slice(0, 10);
        document.getElementById('eventTimeInput').value = start.slice(11, 16);
        document.getElementById('eventImageInput').value = event.imageUrl || '';
        document.getElementById('eventDescriptionInput').value = event.description || '';
        try {
          const programResp = await fetch(`${API_BASE}/events/${event.id}/program`);
          const program = programResp.ok ? await programResp.json() : [];
          adminProgramRows.innerHTML = (program || []).map((item) => `<div class="row g-2 program-row"><div class="col-md-4"><input class="form-control admin-program-title" value="${(item.title || "").replace(/"/g, "&quot;")}" required /></div><div class="col-md-5"><input class="form-control admin-program-description" value="${(item.description || "").replace(/"/g, "&quot;")}" /></div><div class="col-md-2"><input class="form-control admin-program-time" type="time" value="${String(item.startDateTime || "").slice(11, 16)}" required /></div><div class="col-md-1 d-grid"><button class="btn btn-outline-danger remove-program-row ticket-add-btn ms-auto" type="button">−</button></div></div>`).join('');
          adminProgramRows.querySelectorAll('.remove-program-row').forEach((b) => b.addEventListener('click', () => b.closest('.program-row')?.remove()));
        } catch {
          adminProgramRows.innerHTML = '';
        }
      }));

      eventsTable.querySelectorAll('[data-cancel]').forEach((btn) => btn.addEventListener('click', async () => {
        setEventCanceled(btn.dataset.cancel, true);
        await loadAdminData();
        await renderEvents();
      }));
    }

    ordersStatusFilter?.addEventListener('change', () => {
      adminOrdersPage = 1;
      loadAdminData();
    });

    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!eventForm.checkValidity()) { eventForm.classList.add('was-validated'); return; }
      const eventId = document.getElementById('eventId').value;
      const date = document.getElementById('eventDateInput').value;
      const time = document.getElementById('eventTimeInput').value;
      const startDateTime = `${date}T${time}`;
      const payload = {
        title: document.getElementById('eventTitleInput').value.trim(),
        description: document.getElementById('eventDescriptionInput').value.trim(),
        city: document.getElementById('eventCityInput').value.trim(),
        venue: document.getElementById('eventCityInput').value.trim(),
        latitude: 53.9, longitude: 27.5667, mapUrl: '',
        imageUrl: document.getElementById('eventImageInput').value.trim() || null,
        startDateTime,
        endDateTime: startDateTime,
      };
      const url = eventId ? `${API_BASE}/admin/events/${eventId}` : `${API_BASE}/admin/events`;
      const method = eventId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify(payload) });
      if (!response.ok) return alert('Не удалось сохранить событие.');
      const saved = await response.json();
      const programRows = collectProgramRows(adminProgramRows, { title: '.admin-program-title', description: '.admin-program-description', time: '.admin-program-time' });
      await syncAdminProgram(saved.id, programRows, date);
      if (!eventId) {
        const tickets = collectTicketRows(adminTicketRows, {
          name: '.admin-ticket-type',
          price: '.admin-ticket-price',
          quantity: '.admin-ticket-limit',
        });
        for (const ticket of tickets) {
          await fetch(`${API_BASE}/admin/events/${saved.id}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
            body: JSON.stringify(ticket),
          });
        }
      }
      eventForm.reset(); document.getElementById('eventId').value = ''; eventForm.classList.remove('was-validated');
      await loadAdminData();
    });

    document.getElementById('eventFormReset').addEventListener('click', () => { eventForm.reset(); document.getElementById('eventId').value = ''; eventForm.classList.remove('was-validated'); });
    loadAdminData().catch((e) => alert(e.message));
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
  initPaymentPage();
  initMyTicketsPage();
  initProfilePage();
  initAdminPage();
  initAdminUsersPage();
  initManagerEventsPage();
})();
