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
    totalNode.textContent = `${qty * price} ₽`;
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
})();
