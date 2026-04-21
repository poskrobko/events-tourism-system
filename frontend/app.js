(function () {
  'use strict';

  const API_BASE = localStorage.getItem('eventflow_api_base') || '';
  const STORAGE_KEYS = {
    auth: 'eventflow_auth_v2',
    eventTypes: 'eventflow_event_types_v1',
  };
  const EVENT_TYPES = ['Бизнес', 'Фестиваль', 'Музыка', 'Творчество', 'Концерты', 'Образование', 'Спорт'];

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getAuth() {
    return read(STORAGE_KEYS.auth, null);
  }

  function setAuth(auth) {
    write(STORAGE_KEYS.auth, auth);
  }

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.auth);
  }

  function authHeaders() {
    const auth = getAuth();
    return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...authHeaders(),
      },
    });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        message = err.message || err.error || message;
      } catch (_) {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function currentPath() {
    return window.location.pathname.split('/').pop();
  }

  function getUser() {
    return getAuth();
  }

  function requireAuth(redirect = 'login.html') {
    if (!getUser()) window.location.href = redirect;
  }

  function requireAdmin() {
    const user = getUser();
    if (!user || user.role !== 'ADMIN') window.location.href = 'events.html';
  }

  function renderNavbar() {
    const node = document.getElementById('mainNavLinks');
    if (!node) return;
    const page = currentPath();
    const user = getUser();
    const links = [{ href: 'events.html', label: 'События' }];

    if (!user) {
      links.push({ href: 'login.html', label: 'Вход' });
    } else if (user.role === 'ADMIN') {
      links.push({ href: 'admin.html', label: 'Админ' });
      links.push({ href: '#logout', label: 'Выход', logout: true });
    } else {
      links.push({ href: 'profile.html', label: 'Профиль' });
      links.push({ href: 'my-tickets.html', label: 'Мои билеты' });
      links.push({ href: '#logout', label: 'Выход', logout: true });
    }

    node.innerHTML = links.map((link) => `<a class="nav-link ${page === link.href ? 'active' : ''}" href="${link.href}" ${link.logout ? 'data-logout="1"' : ''}>${link.label}</a>`).join('');
    const logout = node.querySelector('[data-logout="1"]');
    if (logout) {
      logout.addEventListener('click', (e) => {
        e.preventDefault();
        clearAuth();
        window.location.href = 'events.html';
      });
    }
  }

  function setupValidation() {
    document.querySelectorAll('.needs-validation').forEach((form) => {
      form.addEventListener('submit', (event) => {
        if (form.dataset.custom === '1') return;
        event.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          return;
        }
        form.classList.add('was-validated');
        const feedback = form.querySelector('[data-feedback]');
        if (feedback) {
          feedback.className = 'alert alert-success mt-3';
          feedback.textContent = form.dataset.successMessage || 'Успешно';
        }
      });
    });
  }

  function setFeedback(form, text, ok) {
    const feedback = form.querySelector('[data-feedback]');
    if (!feedback) return;
    feedback.className = `alert ${ok ? 'alert-success' : 'alert-danger'} mt-3`;
    feedback.textContent = text;
  }

  function mapType(eventId) {
    return read(STORAGE_KEYS.eventTypes, {})[eventId] || 'Концерты';
  }

  function saveType(eventId, type) {
    const map = read(STORAGE_KEYS.eventTypes, {});
    map[eventId] = type;
    write(STORAGE_KEYS.eventTypes, map);
  }

  function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.dataset.custom = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const emailInput = document.getElementById('email').value.trim();
      const email = emailInput === 'admin123' ? 'admin@event.local' : emailInput;
      const password = document.getElementById('password').value;

      try {
        const data = await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuth({ token: data.token, email: data.email, role: data.role });
        setFeedback(form, 'Вход выполнен. Перенаправляем...', true);
        setTimeout(() => {
          window.location.href = data.role === 'ADMIN' ? 'admin.html' : 'events.html';
        }, 300);
      } catch (err) {
        setFeedback(form, `Ошибка входа: ${err.message}`, false);
      }
    });
  }

  function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.dataset.custom = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = document.getElementById('regPassword').value;
      const pwd2 = document.getElementById('regPasswordRepeat').value;
      const confirm = document.getElementById('regPasswordRepeat');
      confirm.setCustomValidity(pwd === pwd2 ? '' : 'Пароли не совпадают');
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      try {
        await api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password: pwd,
            fullName: `${firstName} ${lastName}`.trim(),
          }),
        });
        setFeedback(form, 'Регистрация успешна. Теперь войдите в систему.', true);
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        setFeedback(form, `Ошибка регистрации: ${err.message}`, false);
      }
    });
  }

  async function initEventsPage() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const typeFilter = document.getElementById('typeFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');
    const pagination = document.getElementById('eventsPagination');

    EVENT_TYPES.forEach((type) => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      typeFilter.appendChild(opt);
    });

    const state = { page: 1, pageSize: 10, type: 'all', from: '', to: '' };

    function toRange(date, isEnd) {
      if (!date) return null;
      return `${date}T${isEnd ? '23:59:59' : '00:00:00'}`;
    }

    async function load() {
      const params = new URLSearchParams();
      const from = toRange(state.from, false);
      const to = toRange(state.to, true);
      if (from) params.set('dateFrom', from);
      if (to) params.set('dateTo', to);
      const events = await api(`/api/events${params.size ? `?${params}` : ''}`);
      return events.map((event) => ({ ...event, type: mapType(event.id) }));
    }

    async function render() {
      try {
        const events = await load();
        const filtered = events.filter((event) => state.type === 'all' || event.type === state.type);
        const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
        state.page = Math.min(state.page, totalPages);
        const start = (state.page - 1) * state.pageSize;
        const pageItems = filtered.slice(start, start + state.pageSize);

        grid.innerHTML = pageItems.map((event) => `
          <div class="col-md-6 col-lg-4">
            <article class="card event-card h-100">
              <img src="${event.mapUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1170&auto=format&fit=crop'}" class="card-img-top" alt="${event.title}" style="height:190px; object-fit:cover" />
              <div class="card-body d-flex flex-column">
                <span class="badge badge-status mb-2">${event.type}</span>
                <h2 class="h5">${event.title}</h2>
                <p class="text-secondary mb-3">${new Date(event.startDateTime).toLocaleDateString('ru-RU')} · ${event.city}</p>
                <a href="event-details.html?id=${event.id}" class="btn btn-primary w-100 mt-auto">Подробнее</a>
              </div>
            </article>
          </div>
        `).join('') || '<p class="text-secondary">События не найдены.</p>';

        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i += 1) {
          const btn = document.createElement('button');
          btn.className = `btn btn-sm ${i === state.page ? 'btn-primary' : 'btn-outline-secondary'}`;
          btn.textContent = String(i);
          btn.addEventListener('click', () => { state.page = i; render(); });
          pagination.appendChild(btn);
        }
      } catch (err) {
        grid.innerHTML = `<div class="alert alert-danger">Не удалось загрузить события: ${err.message}</div>`;
      }
    }

    typeFilter.addEventListener('change', () => { state.type = typeFilter.value; state.page = 1; render(); });
    dateFromFilter.addEventListener('change', () => { state.from = dateFromFilter.value; state.page = 1; render(); });
    dateToFilter.addEventListener('change', () => { state.to = dateToFilter.value; state.page = 1; render(); });
    render();
  }

  async function initEventDetailsPage() {
    const title = document.getElementById('eventTitle');
    if (!title) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    try {
      const details = await api(`/api/events/${id}`);
      const event = details.event;
      document.getElementById('eventType').textContent = mapType(event.id);
      document.getElementById('eventTitle').textContent = event.title;
      document.getElementById('eventDescription').textContent = event.description;
      document.getElementById('eventDate').textContent = `📅 ${new Date(event.startDateTime).toLocaleDateString('ru-RU')}`;
      document.getElementById('eventTime').textContent = `🕖 ${new Date(event.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      document.getElementById('eventCity').textContent = `📍 ${event.city}, ${event.venue}`;
      document.getElementById('eventImage').src = event.mapUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1170&auto=format&fit=crop';
      document.getElementById('eventPrice').textContent = `${event.minTicketPrice ?? 0} ₽`;
      document.getElementById('buyTicketBtn').href = `ticket.html?id=${event.id}`;
      document.getElementById('eventSchedule').innerHTML = (details.program || []).map((item) => `<li class="list-group-item">${new Date(item.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — ${item.title}</li>`).join('') || '<li class="list-group-item">Программа пока не добавлена.</li>';
    } catch (err) {
      title.textContent = 'Ошибка загрузки события';
      document.getElementById('eventDescription').textContent = err.message;
    }
  }

  async function initTicketPage() {
    const form = document.getElementById('ticketForm');
    if (!form) return;
    requireAuth();
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const ticketType = document.getElementById('ticketType');
    const qtyInput = document.getElementById('ticketQty');
    const totalNode = document.getElementById('ticketTotal');
    const eventTitle = document.getElementById('ticketEventTitle');
    const buyerEmail = document.getElementById('buyerEmail');
    buyerEmail.value = getUser().email;

    let ticketTypes = [];
    try {
      const details = await api(`/api/events/${id}`);
      eventTitle.textContent = details.event.title;
      ticketTypes = details.ticketTypes || [];
      ticketType.innerHTML = ticketTypes.map((t) => `<option value="${t.id}" data-price="${t.price}">${t.name} — ${t.price} ₽</option>`).join('');
    } catch (err) {
      setFeedback(form, `Не удалось загрузить типы билетов: ${err.message}`, false);
      return;
    }

    function updateTotal() {
      const selected = ticketType.selectedOptions[0];
      const price = Number(selected?.dataset.price || 0);
      totalNode.textContent = `${price * Number(qtyInput.value || 1)} ₽`;
    }

    qtyInput.addEventListener('input', updateTotal);
    ticketType.addEventListener('change', updateTotal);
    updateTotal();

    form.dataset.custom = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      try {
        await api('/api/user/tickets/purchase', {
          method: 'POST',
          body: JSON.stringify({ ticketTypeId: Number(ticketType.value), quantity: Number(qtyInput.value) }),
        });
        setFeedback(form, 'Билет успешно приобретен.', true);
        setTimeout(() => { window.location.href = 'my-tickets.html'; }, 400);
      } catch (err) {
        setFeedback(form, `Ошибка покупки: ${err.message}`, false);
      }
    });
  }

  async function initMyTicketsPage() {
    const list = document.getElementById('myTicketsList');
    if (!list) return;
    requireAuth();
    if (getUser().role === 'ADMIN') {
      window.location.href = 'admin.html';
      return;
    }
    try {
      const tickets = await api('/api/user/tickets');
      list.innerHTML = tickets.map((t) => `<li class="list-group-item d-flex justify-content-between align-items-center"><div><strong>${t.eventTitle}</strong><div class="small text-secondary">${t.ticketType} · ${new Date(t.purchasedAt).toLocaleString('ru-RU')}</div></div><span>${t.quantity} шт.</span></li>`).join('') || '<li class="list-group-item">Билетов пока нет.</li>';
    } catch (err) {
      list.innerHTML = `<li class="list-group-item text-danger">Ошибка загрузки: ${err.message}</li>`;
    }
  }

  function initProfilePage() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    requireAuth();
    if (getUser().role === 'ADMIN') {
      window.location.href = 'admin.html';
      return;
    }
    const email = getUser().email;
    const [first = '', ...rest] = email.split('@')[0].split('.');
    document.getElementById('profileName').textContent = getUser().email;
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('profileFirstName').value = first;
    document.getElementById('profileLastName').value = rest.join(' ');
    document.getElementById('profileEmailInput').value = email;
    document.getElementById('profilePhone').value = '+7';

    form.dataset.custom = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      setFeedback(form, 'Локально сохранено. Backend endpoint для профиля пока не подключен.', true);
    });
  }

  async function initAdminPage() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    requireAdmin();

    const form = document.getElementById('eventCrudForm');
    const eventsTable = document.getElementById('adminEventsTable');
    const ordersTable = document.getElementById('adminOrdersTable');

    async function refresh() {
      const [events, orders] = await Promise.all([api('/api/events'), api('/api/admin/orders')]);
      document.getElementById('totalEvents').textContent = events.length;
      document.getElementById('totalTickets').textContent = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
      document.getElementById('totalRevenue').textContent = `${orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)} ₽`;

      eventsTable.innerHTML = events.map((event) => `<tr>
        <td>${event.title}</td><td>${mapType(event.id)}</td><td>${new Date(event.startDateTime).toLocaleDateString('ru-RU')}</td><td>${event.minTicketPrice ?? 0} ₽</td><td>${event.venue}</td>
        <td class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" data-edit="${event.id}">Изменить</button><button class="btn btn-sm btn-outline-danger" data-delete="${event.id}">Удалить</button></td>
      </tr>`).join('');

      ordersTable.innerHTML = orders.map((o) => `<tr><td>${o.items.map((i) => i.ticketType).join(', ')}</td><td>${o.items.reduce((s, i) => s + i.quantity, 0)}</td><td>${o.totalAmount} ₽</td><td>${o.userEmail}</td><td>${new Date(o.createdAt).toLocaleString('ru-RU')}</td></tr>`).join('') || '<tr><td colspan="5">Заказов пока нет.</td></tr>';

      eventsTable.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await api(`/api/admin/events/${btn.dataset.delete}`, { method: 'DELETE' });
          refresh();
        });
      });

      eventsTable.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const d = await api(`/api/events/${btn.dataset.edit}`);
          const e = d.event;
          document.getElementById('eventId').value = e.id;
          document.getElementById('eventTitleInput').value = e.title;
          document.getElementById('eventTypeInput').value = mapType(e.id);
          document.getElementById('eventCityInput').value = e.city;
          document.getElementById('eventVenueInput').value = e.venue;
          document.getElementById('eventDateInput').value = e.startDateTime.slice(0, 10);
          document.getElementById('eventTimeInput').value = e.startDateTime.slice(11, 16);
          document.getElementById('eventEndTimeInput').value = e.endDateTime.slice(11, 16);
          document.getElementById('eventLatInput').value = e.latitude;
          document.getElementById('eventLngInput').value = e.longitude;
          document.getElementById('eventMapUrlInput').value = e.mapUrl || '';
          document.getElementById('eventDescriptionInput').value = e.description;
        });
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const id = document.getElementById('eventId').value;
      const date = document.getElementById('eventDateInput').value;
      const start = document.getElementById('eventTimeInput').value;
      const end = document.getElementById('eventEndTimeInput').value;

      const payload = {
        title: document.getElementById('eventTitleInput').value.trim(),
        description: document.getElementById('eventDescriptionInput').value.trim(),
        city: document.getElementById('eventCityInput').value.trim(),
        venue: document.getElementById('eventVenueInput').value.trim(),
        latitude: Number(document.getElementById('eventLatInput').value),
        longitude: Number(document.getElementById('eventLngInput').value),
        mapUrl: document.getElementById('eventMapUrlInput').value.trim(),
        startDateTime: `${date}T${start}:00`,
        endDateTime: `${date}T${end}:00`,
      };

      if (id) await api(`/api/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else {
        const created = await api('/api/admin/events', { method: 'POST', body: JSON.stringify(payload) });
        saveType(created.id, document.getElementById('eventTypeInput').value);
      }
      if (id) saveType(Number(id), document.getElementById('eventTypeInput').value);

      form.reset();
      document.getElementById('eventId').value = '';
      refresh();
    });

    document.getElementById('eventFormReset').addEventListener('click', () => {
      form.reset();
      document.getElementById('eventId').value = '';
    });

    refresh().catch((err) => {
      panel.innerHTML = `<div class="alert alert-danger">Ошибка админ-панели: ${err.message}</div>`;
    });
  }

  renderNavbar();
  setupValidation();
  initLoginPage();
  initRegisterPage();
  initEventsPage();
  initEventDetailsPage();
  initTicketPage();
  initMyTicketsPage();
  initProfilePage();
  initAdminPage();
})();
