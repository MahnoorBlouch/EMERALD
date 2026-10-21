/* Emerald website: projects, project detail view, mobile menu, WhatsApp links and inquiry form.
   Project data lives in js/projects.js. */
(function () {
  'use strict';
  var WA = '923450007888';
  var D = window.PROJECTS || [], DIMS = window.IMG_DIMS || {};
  var STATUS = { completed: 'Completed', ongoing: 'Under construction', future: 'Upcoming' };
  var $ = function (s) { return document.querySelector(s); };
  var track = function (n, p) { if (window.emeraldTrack) window.emeraldTrack(n, p); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };
  var typeOf = function (p) { return p.area === 'Residential' ? 'Residential homes' : p.name === 'Niaz Bakery' ? 'Renovation' : 'Commercial plaza'; };

  /* ---------- WhatsApp links (one place, optional campaign reference) ---------- */
  function campaign() {
    var q = new URLSearchParams(location.search), ok = /^[a-z0-9_-]{1,30}$/i, parts = [];
    ['utm_source', 'utm_campaign'].forEach(function (k) { var v = q.get(k); if (v && ok.test(v)) parts.push(v); });
    return parts.length ? ' (' + parts.join(' / ') + ')' : '';
  }
  function waLink(text, placement) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text + '\nRef: web-' + placement + campaign());
  }
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = waLink('Hello Emerald, I would like to discuss a project.', a.dataset.wa);
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (a.dataset.wa) track('whatsapp_click', { placement: a.dataset.wa });
    else if (a.dataset.track) track(a.dataset.track);
    else if (a.getAttribute('href') && a.getAttribute('href').indexOf('tel:') === 0)
      track('phone_click', { placement: a.closest('footer') ? 'footer' : a.closest('.top') ? 'topbar' : 'contact' });
  });

  /* ---------- Mobile menu ---------- */
  var btn = $('#menu-btn'), nav = $('#site-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  var isOpen = function () { return btn.getAttribute('aria-expanded') === 'true'; };
  btn.addEventListener('click', function () { setMenu(!isOpen()); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { setMenu(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (isOpen() && !e.target.closest('header')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) setMenu(false); });

  /* ---------- Images ---------- */
  function img(path, alt, sizes, lazy, id) {
    var d = DIMS[path], small = path.replace('.webp', '-480.webp');
    var set = d && d[0] > 480 ? ' srcset="' + esc(small) + ' 480w, ' + esc(path) + ' ' + d[0] + 'w" sizes="' + sizes + '"' : '';
    return '<img' + (id ? ' id="' + id + '"' : '') + ' src="' + esc(path) + '"' + set + (d ? ' width="' + d[0] + '" height="' + d[1] + '"' : '') +
      ' alt="' + esc(alt) + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">';
  }
  var altOf = function (p) { return p.name + ', ' + typeOf(p).toLowerCase() + ' by Emerald'; };

  /* ---------- Projects grid ---------- */
  var grid = $('#grid'), more = $('#more'), home = $('#top'), view = $('#detail'), count = $('#pcount');
  var baseTitle = document.title, filter = 'completed', showAll = false;
  function renderGrid() {
    var list = D.filter(function (p) { return p.status === filter; });
    var limit = window.innerWidth <= 860 ? 6 : 9, cut = !showAll && list.length > limit;
    var shown = cut ? list.slice(0, limit) : list;
    more.hidden = !cut;
    more.textContent = 'Show all ' + list.length + ' projects';
    count.textContent = 'Showing ' + shown.length + ' of ' + list.length + ' ' + STATUS[filter].toLowerCase() + ' projects.';
    grid.innerHTML = shown.map(function (p) {
      var ph = p.img
        ? '<div class="ph">' + img(p.img, altOf(p), '(max-width:860px) 92vw, 360px', true) + '<span class="badge">' + esc(p.tag) + '</span></div>'
        : '<div class="ph none" role="img" aria-label="Photo not available yet">' + esc(p.name[0]) + '<span class="badge">' + esc(p.tag) + '</span></div>';
      return '<a class="card" href="#project/' + p.slug + '">' + ph + '<div class="tx"><span class="stl ' + p.status + '">' + STATUS[p.status] + '</span><h3>' + esc(p.name) +
        '</h3><div class="ar">' + esc(p.area) + '</div><p>' + esc(p.desc) + '</p></div></a>';
    }).join('');
    document.querySelectorAll('.tabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === filter)); });
  }
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.f; showAll = false; renderGrid(); track('project_filter', { status: filter }); });
  });
  more.addEventListener('click', function () { showAll = true; renderGrid(); });
  grid.addEventListener('click', function (e) {
    var a = e.target.closest('a.card');
    if (a) track('project_open', { project: a.getAttribute('href').replace('#project/', '') });
  });

  /* ---------- Project detail view (hash route: #project/slug) ---------- */
  function route() {
    var m = location.hash.match(/^#project\/([a-z0-9-]+)$/);
    if (!m) {
      var wasDetail = !view.hidden;
      view.hidden = true; home.hidden = false; document.title = baseTitle;
      var el = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
      if (el) { el.scrollIntoView(); if (wasDetail) { var h = el.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } } }
      return;
    }
    var p = D.find(function (x) { return x.slug === m[1]; });
    if (!p) { location.hash = 'projects'; return; }
    var same = D.filter(function (x) { return x.status === p.status; });
    var j = same.indexOf(p), pv = same[(j - 1 + same.length) % same.length], nx = same[(j + 1) % same.length];
    var thumbs = '', cap = '';
    if (p.gallery) {
      thumbs = '<div class="th" role="group" aria-label="Photo gallery">' + p.gallery.map(function (g, k) {
        return '<button type="button" aria-label="Show photo ' + (k + 1) + ' of ' + p.gallery.length + '" aria-pressed="' + (k === 0) + '" data-i="' + k + '">' +
          '<img src="' + esc(g.replace('.webp', '-480.webp')) + '" alt="' + esc(p.name + ' photo ' + (k + 1)) + '" width="96" height="72" loading="lazy"></button>';
      }).join('') + '</div>';
      cap = '<p class="gc" id="gc" aria-live="polite">Photo 1 of ' + p.gallery.length + '</p>';
    }
    var ph = p.img
      ? '<div><div class="ph">' + img(p.img, altOf(p), '(max-width:860px) 92vw, 560px', false, 'mi') + '</div>' + thumbs + cap + '</div>'
      : '<div class="ph" role="img" aria-label="Photo not available yet">' + esc(p.name[0]) + '</div>';
    var facts = [['Location', p.area], ['Status', STATUS[p.status] + ' (' + p.tag + ')'], ['Type', typeOf(p)], ['Year completed', p.year], ['Size', p.size], ['Floors', p.floors]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    var wa = waLink('Hello Emerald, I saw ' + p.name + ' on your website and would like to know more.', 'project-' + p.slug);
    view.innerHTML = '<div class="w dt"><a class="bk" href="#projects">&larr; All projects</a><h1 id="dh" tabindex="-1">' + esc(p.name) + '</h1>' +
      '<div class="dg">' + ph + '<div><dl>' + facts + '</dl><p class="lead" style="margin:0 0 28px">' + esc(p.desc) + '</p>' +
      '<div class="row" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn p" data-wa="project-' + p.slug + '" href="' + wa + '" target="_blank" rel="noopener">Ask about this project</a><a class="btn g" href="#contact">Start a similar project</a></div></div></div>' +
      '<nav class="pn" aria-label="Project navigation"><a href="#project/' + pv.slug + '" rel="prev"><small>Previous project</small>&larr; ' + esc(pv.name) + '</a><a href="#project/' + nx.slug + '" rel="next"><small>Next project</small>' + esc(nx.name) + ' &rarr;</a></nav></div>';
    home.hidden = true; view.hidden = false;
    document.title = p.name + ' | Emerald';
    window.scrollTo(0, 0);
    $('#dh').focus({ preventScroll: true });
  }
  view.addEventListener('click', function (e) {
    var b = e.target.closest('.th button');
    if (!b) return;
    var p = D.find(function (x) { return x.slug === location.hash.replace('#project/', ''); }), k = +b.dataset.i;
    $('#mi').src = p.gallery[k]; $('#mi').removeAttribute('srcset');
    view.querySelectorAll('.th button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $('#gc').textContent = 'Photo ' + (k + 1) + ' of ' + p.gallery.length;
  });
  window.addEventListener('hashchange', route);
  $('.skip').addEventListener('click', function (e) { if (!view.hidden) { e.preventDefault(); $('#dh').focus(); } });

  /* ---------- Contact form (email) ----------
     Configuration: set data-endpoint on the <form id="f"> in index.html.
       - empty (default): opens the visitor's email app with the message ready (mailto). Nothing is sent from the page.
       - a URL (for example /api/contact or a Formspree address): the message is posted as JSON and success is shown only when the server answers OK. */
  var CONTACT_EMAIL = 'emeraldbuilders888@gmail.com';
  var form = $('#f'), status = $('#fstat'), send = $('#fsend'), started = false;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var fields = [
    { id: 'fn', check: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; } },
    { id: 'fe', check: function (v) { return EMAIL_RE.test(v.trim()) ? '' : 'Please enter a valid email address.'; } },
    { id: 'fsub', check: function (v) { return v.trim().length >= 3 ? '' : 'Please enter a subject.'; } },
    { id: 'fm', check: function (v) { return v.trim().length >= 10 ? '' : 'Please write a message of at least 10 characters.'; } }
  ];
  function say(msg, cls) { status.textContent = msg; status.className = cls || ''; }
  function validate() {
    var first = null;
    fields.forEach(function (f) {
      var input = $('#' + f.id), msg = f.check(input.value);
      $('#e-' + f.id).textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { track('form_validation_error', { field: f.id }); if (!first) first = input; }
    });
    return first;
  }
  fields.forEach(function (f) {
    $('#' + f.id).addEventListener('input', function () {
      if (this.getAttribute('aria-invalid') === 'true') { var m = f.check(this.value); $('#e-' + f.id).textContent = m; this.setAttribute('aria-invalid', m ? 'true' : 'false'); }
    });
  });
  if (!(form.dataset.endpoint || '').trim()) $('#fnote').textContent = 'All fields are required. Send Message opens your email app with your message ready.';
  form.addEventListener('focusin', function () { if (!started) { started = true; track('form_start'); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    if (form.elements.company && form.elements.company.value) return;          /* spam trap: real visitors never fill it */
    var bad = validate();
    if (bad) { bad.focus(); return; }
    var data = { name: $('#fn').value.trim(), email: $('#fe').value.trim(), subject: $('#fsub').value.trim(), message: $('#fm').value.trim() };
    var endpoint = (form.dataset.endpoint || '').trim();
    track('form_submit_attempt');
    if (!endpoint) {
      var body = data.message + '\n\nName: ' + data.name + '\nEmail: ' + data.email;
      var a = document.createElement('a');
      a.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(data.subject) + '&body=' + encodeURIComponent(body);
      document.body.appendChild(a); a.click(); a.remove();
      say('Your email app should open with your message ready. Press Send there to deliver it. Nothing has been sent yet. If nothing opens, write to ' + CONTACT_EMAIL + '.', '');
      return;
    }
    send.disabled = true; send.textContent = 'Sending...';
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset(); say('Thank you. Your message was sent and we will reply to ' + data.email + '.', 'ok'); track('form_submit_success');
      })
      .catch(function () { say('Sorry, your message could not be sent. Please email ' + CONTACT_EMAIL + ' or call 0345-0007888.', 'bad'); })
      .then(function () { send.disabled = false; send.textContent = 'Send Message'; });
  });

  renderGrid();
  route();
})();
