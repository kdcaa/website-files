/* =========================================================
   KASHYAP DENTAL & AESTHETICS — site behaviour
   ========================================================= */

/* ---------- CLINIC SETTINGS: edit these ---------- */
const CLINIC = {
  // WhatsApp number: country code + number, digits only (no +, no spaces)
  whatsapp: '9779743679953',

  // Your Google review link. Get it from Google Business Profile →
  // "Ask for reviews" → copy link. Leave '' to hide the review button.
  reviewUrl: '',

  // Length of each booking time slot, in minutes
  slotMinutes: 30,

  // Clinic time zone (used for "Open now" and today's date)
  timeZone: 'Asia/Kathmandu'
};
/* -------------------------------------------------- */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* ---------- Helpers ---------- */
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fmtTime = min => {
    let h = Math.floor(min / 60); const m = min % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ap}`;
  };
  const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  const waLink = text => `https://wa.me/${CLINIC.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  // Current day/time in the clinic's time zone, regardless of visitor's location
  function clinicNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: CLINIC.timeZone, weekday: 'short', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type).value;
    const dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    const hour = Number(get('hour')) % 24;
    return { day: dayIdx, minutes: hour * 60 + Number(get('minute')), date: `${get('year')}-${get('month')}-${get('day')}` };
  }

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- WhatsApp & review links from settings ---------- */
  $$('[data-whatsapp]').forEach(a => { a.href = waLink(a.dataset.whatsapp); });
  $$('[data-review-link]').forEach(a => {
    if (CLINIC.reviewUrl) a.href = CLINIC.reviewUrl; else a.hidden = true;
  });

  /* ---------- Mobile navigation ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('.site-nav');
  if (toggle && nav) {
    const setNav = open => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
    });
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
  }

  /* ---------- Header shadow + back-to-top ---------- */
  const header = $('.site-header');
  const toTop = $('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));

  /* ---------- Highlight current section in nav ---------- */
  const navLinks = $$('.site-nav a[href^="#"]:not(.nav-cta)');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => ro.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Opening hours (read from the hours table) ---------- */
  const hours = {};
  $$('.hours-table tr[data-day]').forEach(row => {
    const d = Number(row.dataset.day);
    hours[d] = row.dataset.open && row.dataset.close
      ? { open: toMin(row.dataset.open), close: toMin(row.dataset.close) }
      : null;
  });
  const hasHours = Object.keys(hours).length > 0;

  function openStatus() {
    const now = clinicNow();
    const today = hours[now.day];
    if (today && now.minutes >= today.open && now.minutes < today.close) {
      return { open: true, text: `Open now · until ${fmtTime(today.close)}` };
    }
    for (let i = 0; i < 7; i++) {
      const d = (now.day + i) % 7;
      const h = hours[d];
      if (!h) continue;
      if (i === 0 && now.minutes >= h.open) continue;
      const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d];
      return { open: false, text: `Closed · opens ${when} ${fmtTime(h.open)}` };
    }
    return { open: false, text: 'Closed' };
  }

  function renderStatus() {
    if (!hasHours) return;
    const s = openStatus();
    $$('[data-open-status]').forEach(el => {
      $('.status-text', el).textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.hidden = false;
    });
    const now = clinicNow();
    $$('.hours-table tr[data-day]').forEach(r => r.classList.toggle('today', Number(r.dataset.day) === now.day));
  }
  renderStatus();
  setInterval(renderStatus, 60 * 1000);

  /* ---------- Service pop-up ---------- */
  const dialog = $('#service-dialog');
  const serviceSelect = $('#f-service');

  function selectService(name) {
    if (!serviceSelect) return;
    const opt = [...serviceSelect.options].find(o => o.value === name || o.text === name);
    if (opt) serviceSelect.value = opt.value;
  }

  if (dialog && typeof dialog.showModal === 'function') {
    const titleEl = $('.dialog-title', dialog);
    const bodyEl = $('.dialog-body', dialog);
    const bookBtn = $('.dialog-book', dialog);

    $$('.service-card').forEach(card => {
      const btn = $('.service-more-btn', card);
      const details = $('.service-details', card);
      if (!btn || !details) return;
      btn.addEventListener('click', () => {
        const name = $('h3', card).textContent.trim();
        titleEl.textContent = name;
        bodyEl.innerHTML = details.innerHTML;
        bookBtn.dataset.service = name;
        dialog.showModal();
      });
    });

    $$('[data-close-dialog]', dialog).forEach(b => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

    bookBtn.addEventListener('click', () => {
      dialog.close();
      selectService(bookBtn.dataset.service);
      const target = $('#contact');
      if (target) target.scrollIntoView({ behavior: scrollBehavior });
      setTimeout(() => { const n = $('#f-name'); if (n) n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    });
  } else {
    // Very old browsers: hide "Learn more" buttons instead of showing a broken pop-up
    $$('.service-more-btn').forEach(b => { b.hidden = true; });
  }

  /* ---------- Booking form ---------- */
  const form = $('#booking-form');
  if (!form) return;

  const dateIn = $('#f-date');
  const timeIn = $('#f-time');
  const slotsWrap = $('#slots');
  const slotNote = $('#slot-note');
  const statusEl = $('#form-status');
  const submitBtn = $('#submit-btn');
  const successBox = $('#booking-success');

  // Earliest date = today (clinic time); latest = 60 days ahead
  const todayIso = clinicNow().date;
  dateIn.min = todayIso;
  {
    const [y, m, d] = todayIso.split('-').map(Number);
    const max = new Date(y, m - 1, d + 60);
    dateIn.max = `${max.getFullYear()}-${String(max.getMonth() + 1).padStart(2, '0')}-${String(max.getDate()).padStart(2, '0')}`;
  }

  function setError(field, msg) {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg || '';
    const input = form.elements[field];
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function renderSlots() {
    slotsWrap.innerHTML = '';
    timeIn.value = '';
    if (!dateIn.value) { slotNote.textContent = 'Pick a date to see available times.'; return; }

    const [y, m, d] = dateIn.value.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    const h = hours[day];
    if (!h) {
      slotNote.textContent = hasHours
        ? `We're closed on ${DAYS[day]}s. Please choose another day.`
        : '';
      if (hasHours) setError('date', `Closed on ${DAYS[day]}s`);
      return;
    }
    setError('date', '');

    const now = clinicNow();
    const isToday = dateIn.value === now.date;
    let count = 0;
    for (let t = h.open; t + CLINIC.slotMinutes <= h.close; t += CLINIC.slotMinutes) {
      if (isToday && t <= now.minutes + 30) continue; // need at least 30 min notice
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = fmtTime(t);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        const wasOn = b.getAttribute('aria-pressed') === 'true';
        $$('.slot', slotsWrap).forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', String(!wasOn));
        timeIn.value = wasOn ? '' : fmtTime(t);
      });
      slotsWrap.appendChild(b);
      count++;
    }
    slotNote.textContent = count
      ? 'Preferred time (optional, we\'ll confirm with you):'
      : 'No more times available today. Please pick another day.';
  }

  dateIn.addEventListener('change', renderSlots);
  form.elements.name.addEventListener('input', () => setError('name', ''));
  form.elements.phone.addEventListener('input', () => setError('phone', ''));

  function validate() {
    let firstBad = null;
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.replace(/[\s()-]/g, '');

    if (name.length < 2) { setError('name', 'Please enter your name.'); firstBad = firstBad || form.elements.name; }
    if (!/^\+?\d{7,15}$/.test(phone)) { setError('phone', 'Please enter a valid phone number.'); firstBad = firstBad || form.elements.phone; }

    if (!dateIn.value) {
      setError('date', 'Please choose a date.'); firstBad = firstBad || dateIn;
    } else if (dateIn.value < dateIn.min) {
      setError('date', 'Please choose today or a later date.'); firstBad = firstBad || dateIn;
    } else if (hasHours) {
      const [y, m, d] = dateIn.value.split('-').map(Number);
      const day = new Date(y, m - 1, d).getDay();
      if (!hours[day]) { setError('date', `Closed on ${DAYS[day]}s`); firstBad = firstBad || dateIn; }
    }

    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function summary() {
    const f = form.elements;
    const bits = [f.service.value];
    if (f.date.value) bits.push(fmtDate(f.date.value));
    if (f.time.value) bits.push(f.time.value);
    return bits.join(' · ');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      $('#success-summary').textContent =
        `Thank you, ${form.elements.name.value.trim()}. We've received your request (${summary()}) and will contact you to confirm.`;
      form.hidden = true;
      successBox.hidden = false;
      successBox.focus();
    } catch (err) {
      statusEl.textContent = 'Sorry, the request could not be sent. Please use "Send via WhatsApp" or call the clinic.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request appointment';
    }
  });

  $('#book-another').addEventListener('click', () => {
    form.reset();
    renderSlots();
    successBox.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  // Send the same booking details as a WhatsApp message
  $('#wa-book').addEventListener('click', () => {
    const f = form.elements;
    const lines = ['Hello Kashyap Dental & Aesthetics, I would like to book an appointment.'];
    if (f.name.value.trim()) lines.push(`Name: ${f.name.value.trim()}`);
    if (f.phone.value.trim()) lines.push(`Phone: ${f.phone.value.trim()}`);
    lines.push(`Treatment: ${f.service.value}`);
    if (f.date.value) lines.push(`Preferred date: ${fmtDate(f.date.value)}`);
    if (f.time.value) lines.push(`Preferred time: ${f.time.value}`);
    if (f.message.value.trim()) lines.push(`Note: ${f.message.value.trim()}`);
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
})();
