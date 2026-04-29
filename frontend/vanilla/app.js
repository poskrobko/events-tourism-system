(function () {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
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

  const qtyInput = document.getElementById('ticketQty');
  const typeSelect = document.getElementById('ticketType');
  const totalNode = document.getElementById('ticketTotal');

  const prices = {
    standard: 1200,
    premium: 2200,
    vip: 3500,
  };

  function updateTotal() {
    if (!qtyInput || !typeSelect || !totalNode) return;
    const qty = Number(qtyInput.value || 1);
    const price = prices[typeSelect.value] || prices.standard;
    totalNode.textContent = `${qty * price} BYN`;
  }

  if (qtyInput && typeSelect) {
    qtyInput.addEventListener('input', updateTotal);
    typeSelect.addEventListener('change', updateTotal);
    updateTotal();
  }

  const approveButtons = document.querySelectorAll('[data-approve]');
  approveButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('tr');
      const status = row?.querySelector('.request-status');
      if (status) {
        status.textContent = 'Одобрено';
        status.className = 'request-status text-success fw-semibold';
      }
    });
  });

  const userSearch = document.getElementById('userSearch');
  const userRows = Array.from(document.querySelectorAll('[data-user-row]'));
  const userFeedback = document.getElementById('userEditFeedback');
  const roleSelects = document.querySelectorAll('[data-role-select]');

  if (userSearch && userRows.length) {
    userSearch.addEventListener('input', () => {
      const query = userSearch.value.trim().toLowerCase();
      userRows.forEach((row) => {
        const inputs = row.querySelectorAll('input');
        const email = inputs[0]?.value.toLowerCase() || '';
        const firstName = inputs[1]?.value.toLowerCase() || '';
        const lastName = inputs[2]?.value.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const match = !query || email.includes(query) || fullName.includes(query);
        row.classList.toggle('d-none', !match);
      });
    });
  }

  roleSelects.forEach((select) => {
    select.addEventListener('change', () => {
      if (select.value === 'ADMIN') {
        select.value = 'MANAGER';
        if (userFeedback) {
          userFeedback.className = 'alert alert-warning mt-3 mb-0';
          userFeedback.textContent = 'Назначение роли ADMIN через список пользователей запрещено.';
        }
      }
    });
  });

  const saveButtons = document.querySelectorAll('[data-save-user]');
  saveButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('[data-user-row]');
      if (!row) return;
      const rowInputs = row.querySelectorAll('input');
      const allValid = Array.from(rowInputs).every((input) => input.checkValidity());
      rowInputs.forEach((input) => input.classList.toggle('is-invalid', !input.checkValidity()));

      if (!userFeedback) return;
      if (!allValid) {
        userFeedback.className = 'alert alert-danger mt-3 mb-0';
        userFeedback.textContent = 'Проверьте email, имя и фамилию перед сохранением.';
        return;
      }

      userFeedback.className = 'alert alert-success mt-3 mb-0';
      userFeedback.textContent = 'Изменения пользователя сохранены.';
    });
  });
})();
