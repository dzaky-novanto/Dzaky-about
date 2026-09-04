// Dzaky Minimalist Portfolio JS

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // 2. Scroll Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-top, .reveal-right').forEach(el => {
    observer.observe(el);
  });
  
  // Quick reveal for header
  setTimeout(() => {
    document.querySelector('.nav-container').classList.add('active');
  }, 100);

  // 3. Anti-Spam Email 
  const contactBtn = document.getElementById('footer-contact');
  if (contactBtn) {
    contactBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const user = 'dzakyyoganovanto';
      const domain = 'gmail.com';
      window.location.href = 'mailto:' + user + '@' + domain;
    });
  }

  // 4. Guestbook Logic (Local Storage - 1 Device = 1 Message)
  const form = document.getElementById('messageForm');
  const nameInput = document.getElementById('senderName');
  const msgInput = document.getElementById('senderMessage');
  const submitBtn = document.getElementById('submitBtn');
  const statusTxt = document.getElementById('formStatus');
  const container = document.getElementById('messagesContainer');
  
  // Key for local storage checks
  const STORAGE_KEY = 'dzaky_portfolio_messages';
  const HAS_POSTED_KEY = 'dzaky_has_posted';

  // Load existing messages
  const loadMessages = () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    container.innerHTML = '';
    
    if (data.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No messages yet. Be the first!</p>';
      return;
    }

    // Sort newest first
    data.reverse().forEach(msg => {
      const card = document.createElement('div');
      card.className = 'msg-card reveal';
      card.innerHTML = `
        <div class="msg-text">${escapeHTML(msg.text)}</div>
        <div>
          <span class="msg-author">${escapeHTML(msg.name)}</span>
          <span class="msg-date">${msg.date}</span>
        </div>
      `;
      container.appendChild(card);
      // Trigger animation for newly loaded cards
      setTimeout(() => card.classList.add('active'), 50);
    });
  };

  // Check if device already posted
  const checkIfPosted = () => {
    if (localStorage.getItem(HAS_POSTED_KEY)) {
      form.style.opacity = '0.5';
      nameInput.disabled = true;
      msgInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Message Sent';
      submitBtn.style.background = 'var(--text-muted)';
      statusTxt.textContent = 'Thanks! You have already left a message from this device.';
      statusTxt.className = 'form-status success';
      return true;
    }
    return false;
  };

  // Handle Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (checkIfPosted()) return;

    const name = nameInput.value.trim();
    const text = msgInput.value.trim();
    
    if (!name || !text) return;

    // Create message object
    const newMsg = {
      id: Date.now(),
      name: name,
      text: text,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    // Save to "Database" (Local Storage)
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    existing.push(newMsg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    // Mark device as posted
    localStorage.setItem(HAS_POSTED_KEY, 'true');

    // UI Feedback
    nameInput.value = '';
    msgInput.value = '';
    loadMessages();
    checkIfPosted();
  });

  // Basic HTML Escaper to prevent XSS in local storage display
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
    );
  }

  // Initialize
  loadMessages();
  checkIfPosted();

});
