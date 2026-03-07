/* ===== Page 6 — Request AI Consultation ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Textarea auto-grow
  const textarea = document.querySelector('.form-textarea');
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(157, textarea.scrollHeight) + 'px';
    });
  }

  // Submit button — collect all form data and POST to server
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const message = textarea ? textarea.value.trim() : '';

      if (!message) {
        // Shake textarea if empty
        const wrapper = document.querySelector('.textarea-wrapper');
        if (wrapper) {
          wrapper.style.animation = 'shake 0.4s ease';
          setTimeout(() => wrapper.style.animation = '', 400);
        }
        return;
      }

      // Animate button
      submitBtn.style.transform = 'scale(0.96)';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      // Gather all data from localStorage + this page
      const formData = JSON.parse(localStorage.getItem('ryvonLead') || '{}');
      formData.message = message;

      try {
        const response = await fetch('http://localhost:3000/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          // Clear localStorage and navigate to Thank You page
          localStorage.removeItem('ryvonLead');
          window.location.href = '../Page 7/index.html';
        } else {
          throw new Error(result.message || 'Server error');
        }
      } catch (error) {
        console.error('Failed to submit lead:', error);
        submitBtn.style.transform = '';
        submitBtn.style.pointerEvents = '';
        submitBtn.style.opacity = '';

        // Show error feedback
        const card = document.querySelector('.form-card');
        if (card) {
          card.style.animation = 'shake 0.4s ease';
          setTimeout(() => card.style.animation = '', 400);
        }
        alert('Could not save your data. Please make sure the server is running (node server.js).');
      }
    });
  }
});

/* Shake keyframes injected via JS */
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);
