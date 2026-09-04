// Dzaky Portfolio — interactive layer
// Sections: nav reveal, typing headline, scroll reveals, guestbook (marquee), back-to-top

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     1. Footer year
     --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     2. Nav reveal on load
     --------------------------------------------------------- */
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelector('.nav-container')?.classList.add('active');
    }, 100);
  });

  /* ---------------------------------------------------------
     3. Hero headline typing effect (single orchestrated moment)
     --------------------------------------------------------- */
  const typeTarget = document.querySelector('.type-target');
  if (typeTarget) {
    const words = ['networks.', 'systems.', 'servers.', 'firewalls.'];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      typeTarget.textContent = words[0];
      typeTarget.classList.add('done');
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = words[wordIndex];

        if (!deleting) {
          charIndex++;
          typeTarget.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            typeTarget.classList.add('done');
            setTimeout(tick, 1600);
            return;
          }
        } else {
          charIndex--;
          typeTarget.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
        setTimeout(tick, deleting ? 45 : 85);
      };
      setTimeout(tick, 500);
    }
  }

  /* ---------------------------------------------------------
     4. Scroll reveal (IntersectionObserver)
     --------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-right, .stagger').forEach(el => {
    revealObserver.observe(el);
  });

  /* ---------------------------------------------------------
     5. Back to top button
     --------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     6. Guestbook — LocalStorage, 1 device = 1 message,
        rendered as an auto-scrolling marquee ticker
     --------------------------------------------------------- */
  const form = document.getElementById('messageForm');
  const nameInput = document.getElementById('senderName');
  const msgInput = document.getElementById('senderMessage');
  const submitBtn = document.getElementById('submitBtn');
  const statusTxt = document.getElementById('formStatus');
  const track = document.getElementById('marqueeTrack');
  const emptyState = document.getElementById('marqueeEmpty');
  const charCount = document.getElementById('charCount');

  const STORAGE_KEY = 'dzaky_portfolio_messages';
  const HAS_POSTED_KEY = 'dzaky_has_posted';
  const MIN_CARDS_FOR_LOOP = 6; // duplicate list until it comfortably fills the marquee

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  function buildCard(msg) {
    const card = document.createElement('div');
    card.className = 'msg-card';
    card.innerHTML = `
      <div class="msg-text">${escapeHTML(msg.text)}</div>
      <div class="msg-meta">
        <span class="msg-author">${escapeHTML(msg.name)}</span>
        <span class="msg-date">${msg.date}</span>
      </div>
    `;
    return card;
  }

  function loadMessages() {
    if (!track) return;
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    track.innerHTML = '';
    track.style.animation = 'none';

    if (data.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      track.style.width = '100%';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const newestFirst = [...data].reverse();

    // Duplicate the set so the marquee loops seamlessly (transform -50%)
    let renderSet = newestFirst;
    while (renderSet.length < MIN_CARDS_FOR_LOOP) {
      renderSet = renderSet.concat(newestFirst);
    }
    const full = renderSet.concat(renderSet); // duplicate for seamless loop

    full.forEach(msg => track.appendChild(buildCard(msg)));

    // Duration scales with content so speed feels consistent regardless of count
    const duration = Math.max(20, renderSet.length * 6);
    track.style.setProperty('--marquee-duration', duration + 's');
    // Force reflow then re-enable animation
    void track.offsetWidth;
    track.style.animation = '';
  }

  function checkIfPosted() {
    if (!form) return false;
    if (localStorage.getItem(HAS_POSTED_KEY)) {
      form.style.opacity = '0.6';
      nameInput.disabled = true;
      msgInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Message sent ✓';
      statusTxt.textContent = 'Thanks! You have already left a message from this device.';
      statusTxt.className = 'form-status success';
      return true;
    }
    return false;
  }

  if (msgInput && charCount) {
    const updateCount = () => {
      charCount.textContent = `${msgInput.value.length}/150`;
    };
    msgInput.addEventListener('input', updateCount);
    updateCount();
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (checkIfPosted()) return;

      const name = nameInput.value.trim();
      const text = msgInput.value.trim();
      if (!name || !text) return;

      const newMsg = {
        id: Date.now(),
        name,
        text,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      existing.push(newMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      localStorage.setItem(HAS_POSTED_KEY, 'true');

      nameInput.value = '';
      msgInput.value = '';
      if (charCount) charCount.textContent = '0/150';

      loadMessages();
      checkIfPosted();
    });
  }

  loadMessages();
  checkIfPosted();

  /* ---------------------------------------------------------
     7. Anti-spam obfuscated email link
     --------------------------------------------------------- */
  const contactBtn = document.getElementById('footer-contact');
  if (contactBtn) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const user = 'dzakyyoganovanto';
      const domain = 'gmail.com';
      window.location.href = 'mailto:' + user + '@' + domain;
    });
  }

});
