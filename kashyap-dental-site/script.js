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
  timeZone: 'Asia/Kathmandu',

  // Online booking: paste your Google Apps Script "Web app URL" here
  // (ends in /exec — see README §5). While empty, the form sends
  // requests to Netlify Forms instead and the clinic confirms by phone.
  bookingApi: 'https://script.google.com/macros/s/AKfycbzjJS0rV6EMZ1e65p7nxpUaYN7f_MBRXIuVpw5tQgI_0zFTvInwfA8fndmyjmsjXvFiJg/exec'
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

  /* ---------- Booking form ----------
     With CLINIC.bookingApi set: live availability + instant booking via Google.
     Without it (or if Google can't be reached): request sent to Netlify Forms. */
  const form = $('#booking-form');
  if (!form) return;

  const API = (CLINIC.bookingApi || '').trim();
  const dateIn = $('#f-date');
  const timeIn = $('#f-time');
  const slotsWrap = $('#slots');
  const slotNote = $('#slot-note');
  const statusEl = $('#form-status');
  const submitBtn = $('#submit-btn');
  const successBox = $('#booking-success');
  const hhmm = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const prettyTime = v => v ? fmtTime(toMin(v)) : '';

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
    if (input && input.type !== 'hidden') input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  let availToken = 0;

  async function renderSlots() {
    const token = ++availToken;
    slotsWrap.innerHTML = '';
    timeIn.value = '';
    setError('time', '');
    if (!dateIn.value) { slotNote.textContent = 'Pick a date to see available times.'; return; }

    const date = dateIn.value;
    const [y, m, d] = date.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    const h = hours[day];
    if (!h) {
      slotNote.textContent = hasHours ? `We're closed on ${DAYS[day]}s. Please choose another day.` : '';
      if (hasHours) setError('date', `Closed on ${DAYS[day]}s`);
      return;
    }
    setError('date', '');

    // Ask Google which slots are already taken
    let full = new Set();
    if (API) {
      slotNote.textContent = 'Checking available times…';
      slotsWrap.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(`${API}?action=availability&date=${encodeURIComponent(date)}`);
        const data = await res.json();
        if (token !== availToken) return; // user picked another date meanwhile
        if (data.closed) {
          slotsWrap.removeAttribute('aria-busy');
          slotNote.textContent = `The clinic is closed on this date${data.reason ? ` (${data.reason})` : ''}. Please choose another day.`;
          setError('date', 'Clinic closed on this date');
          return;
        }
        full = new Set(data.full || []);
      } catch (err) {
        if (token !== availToken) return;
        // Offline or Google unreachable: show all times; request goes to Netlify instead
      }
      slotsWrap.removeAttribute('aria-busy');
    }

    const now = clinicNow();
    const isToday = date === now.date;
    let free = 0;
    for (let t = h.open; t + CLINIC.slotMinutes <= h.close; t += CLINIC.slotMinutes) {
      if (isToday && t <= now.minutes + 30) continue; // need at least 30 min notice
      const value = hhmm(t);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.dataset.value = value;
      if (full.has(value)) {
        b.disabled = true;
        b.classList.add('full');
        b.innerHTML = `${fmtTime(t)}<small>Booked</small>`;
        b.setAttribute('aria-label', `${fmtTime(t)}, already booked`);
      } else {
        b.textContent = fmtTime(t);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          $$('.slot', slotsWrap).forEach(x => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          timeIn.value = value;
          setError('time', '');
        });
        free++;
      }
      slotsWrap.appendChild(b);
    }
    slotNote.textContent = free
      ? 'Choose a time:'
      : (isToday ? 'No more times available today. Please pick another day.' : 'All times are booked on this day. Please pick another day.');
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

    let dateOk = false;
    if (!dateIn.value) {
      setError('date', 'Please choose a date.'); firstBad = firstBad || dateIn;
    } else if (dateIn.value < dateIn.min) {
      setError('date', 'Please choose today or a later date.'); firstBad = firstBad || dateIn;
    } else if (form.querySelector('[data-error-for="date"]').textContent) {
      firstBad = firstBad || dateIn; // closed day / holiday message already shown
    } else {
      dateOk = true;
    }

    if (dateOk && !timeIn.value) {
      setError('time', 'Please choose a time.');
      firstBad = firstBad || slotsWrap.querySelector('.slot:not([disabled])') || dateIn;
    }

    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function bookingData() {
    const f = form.elements;
    return {
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      service: f.service.value,
      date: f.date.value,
      time: timeIn.value,
      message: f.message.value.trim(),
      bot: f['bot-field'].value
    };
  }

  // Google Calendar "add to my calendar" link for the patient
  function calendarLink(b, id) {
    const start = b.date.replace(/-/g, '') + 'T' + b.time.replace(':', '') + '00';
    const endMin = toMin(b.time) + CLINIC.slotMinutes;
    const end = b.date.replace(/-/g, '') + 'T' + hhmm(endMin).replace(':', '') + '00';
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Dental appointment: Kashyap Dental & Aesthetics',
      dates: `${start}/${end}`,
      ctz: CLINIC.timeZone,
      details: `${b.service}${id ? `\nBooking ref: ${id}` : ''}\nClinic phone: +977 974-3679953`,
      location: 'Kashyap Dental & Aesthetics, Tilottama Path, near Gastrocare, Butwal'
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  function showSuccess(b, confirmed, id) {
    const when = `${fmtDate(b.date)} at ${prettyTime(b.time)}`;
    $('#success-title').textContent = confirmed ? 'Appointment booked' : 'Request received';
    $('#success-summary').textContent = confirmed
      ? `Thank you, ${b.name}. Your ${b.service === 'Not sure / Check-up' ? 'appointment' : b.service + ' appointment'} is booked for ${when}. Please arrive 10 minutes early. We may call you on ${b.phone} if anything changes.`
      : `Thank you, ${b.name}. We've received your request for ${when} and will call you on ${b.phone} to confirm.`;
    const ref = $('#success-ref');
    ref.hidden = !id;
    if (id) {
      ref.textContent = 'Booking reference: ';
      const s = document.createElement('strong');
      s.textContent = id;
      ref.appendChild(s);
    }
    const cal = $('#add-cal');
    cal.hidden = !confirmed;
    if (confirmed) cal.href = calendarLink(b, id);
    form.hidden = true;
    successBox.hidden = false;
    successBox.focus();
  }

  async function sendToNetlify(b) {
    const fd = new FormData(form);
    fd.set('time', prettyTime(b.time));
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fd).toString()
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  }

  function showError(msg) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status error';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    if (!validate()) return;

    const b = bookingData();
    submitBtn.disabled = true;
    submitBtn.textContent = API ? 'Booking…' : 'Sending…';
    try {
      if (API) {
        let result = null;
        try {
          // Sent as plain text so the browser doesn't need a CORS pre-check
          const res = await fetch(API, { method: 'POST', body: JSON.stringify(b) });
          result = await res.json();
        } catch (netErr) { result = null; }

        if (result && result.ok) { showSuccess(b, true, result.id); return; }
        if (result && result.error === 'taken') {
          await renderSlots();
          showError('Sorry, that time was just booked by someone else. Please choose another time.');
          return;
        }
        if (result && result.message) { showError(result.message); return; }
        // Google unreachable → fall through and send as a request instead
      }
      await sendToNetlify(b);
      showSuccess(b, false);
    } catch (err) {
      showError('Your request could not be sent. Please check your internet connection and try again, or book on WhatsApp.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = API ? 'Book appointment' : 'Request appointment';
    }
  });

  if (API) submitBtn.textContent = 'Book appointment';

  $('#book-another').addEventListener('click', () => {
    form.reset();
    renderSlots();
    successBox.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  // Send the same booking details as a WhatsApp message
  $('#wa-book').addEventListener('click', () => {
    const b = bookingData();
    const lines = ['Hello Kashyap Dental & Aesthetics, I would like to book an appointment.'];
    if (b.name) lines.push(`Name: ${b.name}`);
    if (b.phone) lines.push(`Phone: ${b.phone}`);
    lines.push(`Treatment: ${b.service}`);
    if (b.date) lines.push(`Preferred date: ${fmtDate(b.date)}`);
    if (b.time) lines.push(`Preferred time: ${prettyTime(b.time)}`);
    if (b.message) lines.push(`Note: ${b.message}`);
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
})();
