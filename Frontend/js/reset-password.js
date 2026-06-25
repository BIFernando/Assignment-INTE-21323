document.addEventListener('DOMContentLoaded', () => {
 
    // Get token from URL: reset-password.html?token=abc123
    const token = new URLSearchParams(window.location.search).get('token');
 
    if (!token) {
      document.getElementById('errorAlert').textContent =
        'Invalid reset link. Please request a new one.';
      document.getElementById('errorAlert').classList.add('show');
      document.getElementById('resetBtn').disabled = true;
      return;
    }
 
    document.getElementById('resetBtn')
      .addEventListener('click', async () => {
      const newPassword     = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errEl           = document.getElementById('errorAlert');
      const sucEl           = document.getElementById('successAlert');
 
      errEl.classList.remove('show');
      sucEl.classList.remove('show');
 
      if (newPassword.length < 8 ||
          !/[A-Z]/.test(newPassword) ||
          !/[0-9]/.test(newPassword)) {
        errEl.textContent =
          'Password needs 8+ chars, 1 uppercase, 1 number.';
        errEl.classList.add('show');
        return;
      }
 
      if (newPassword !== confirmPassword) {
        errEl.textContent = 'Passwords do not match.';
        errEl.classList.add('show');
        return;
      }
 
      const btn = document.getElementById('resetBtn');
      btn.disabled    = true;
      btn.textContent = 'Resetting...';
 
      try {
        await fetch('/api/auth/reset-password-token', {
         method: 'POST',
         headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token, newPassword })
});
        const data = await res.json();
 
        if (!res.ok) {
          errEl.textContent = data.message || 'Reset failed.';
          errEl.classList.add('show');
          btn.disabled    = false;
          btn.textContent = 'Reset Password';
          return;
        }
 
        sucEl.textContent =
          'Password reset! Redirecting to login...';
        sucEl.classList.add('show');
 
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
 
      } catch (err) {
  console.error(err);

  errEl.textContent =
    err.message || 'Something went wrong. Please try again.';

  errEl.classList.add('show');

  btn.disabled = false;
  btn.textContent = 'Reset Password';
}
    });
 
  });
 