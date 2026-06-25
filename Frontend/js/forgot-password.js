 document.addEventListener('DOMContentLoaded', () => {
 
    document.getElementById('submitBtn')
      .addEventListener('click', async () => {
      const email  = document.getElementById('email').value.trim();
      const errEl  = document.getElementById('errorAlert');
      const sucEl  = document.getElementById('successAlert');
 
      errEl.classList.remove('show');
      sucEl.classList.remove('show');
 
      if (!email) {
        errEl.textContent = 'Email is required.';
        errEl.classList.add('show');
        return;
      }
 
      const btn = document.getElementById('submitBtn');
      btn.disabled    = true;
      btn.textContent = 'Sending...';
      try {

  await authAPI.forgotPassword(email);

  sucEl.textContent =
    'If that email exists, a reset link has been sent. Check your inbox.';
  sucEl.classList.add('show');

  document.getElementById('email').value = '';

} catch (err) {

  console.error(err);

  errEl.textContent =
    err.message || 'Something went wrong. Please try again.';

  errEl.classList.add('show');

}
       finally {
        btn.disabled    = false;
        btn.textContent = 'Send Reset Link';
      }
    });
 
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')
        document.getElementById('submitBtn').click();
    });
 
  });
 