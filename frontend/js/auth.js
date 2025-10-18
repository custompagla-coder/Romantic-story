const API_URL = 'http://localhost:5000/api';

// Check if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
}

// Toggle between login and signup forms
document.getElementById('showSignup')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
  clearAlerts();
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  clearAlerts();
});

// Login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);
    } else {
      showAlert(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Connection error. Please make sure the server is running.', 'error');
  }
});

// Signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (!username || !email || !password || !confirmPassword) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters long', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('Account created successfully! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showAlert(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showAlert('Connection error. Please make sure the server is running.', 'error');
  }
});

// Alert functions
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
  
  alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      ${type === 'success' ? '✓' : '⚠'} ${message}
    </div>
  `;
}

function clearAlerts() {
  document.getElementById('alertContainer').innerHTML = '';
}
