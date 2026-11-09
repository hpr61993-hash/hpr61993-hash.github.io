/* ============================================================
   页面渲染与交互 —— 一般不用改这个文件，改内容请编辑 data.js
   ============================================================ */

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

/* ---------- 联系按钮 ---------- */
function renderContacts() {
  const wrap = $('#contactBtns');
  SITE.contacts.forEach((c) => {
    const a = el('a', 'contact-btn ghost', `<span>${c.label}</span><b>${c.value}</b>`);
    if (c.type === 'mail') {
      a.href = `mailto:${c.value}`;
    } else {
      a.href = '#';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        copyText(c.value, a);
      });
    }
    wrap.appendChild(a);
  });
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>✓ 已复制</span>';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  });
}
window.copyText = copyText;

/* ---------- 打字机标语 ---------- */
function typewriter() {
  const node = $('#tagline');
  const lines = SITE.taglines;
  let li = 0, ci = 0, deleting = false;
  const cursor = el('span', 'cursor');
  node.appendChild(cursor);

  function tick() {
    const line = lines[li];
    if (!deleting) {
      ci++;
      node.firstChild ? (node.firstChild.textContent = line.slice(0, ci)) : node.insertBefore(document.createTextNode(line.slice(0, ci)), cursor);
      if (ci === line.length) { deleting = true; return setTimeout(tick, 2200); }
      return setTimeout(tick, 70);
    } else {
      ci--;
      node.firstChild.textContent = line.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; return setTimeout(tick, 400); }
      return setTimeout(tick, 30);
    }
  }
  // 首次插入文本节点
  node.insertBefore(document.createTextNode(''), cursor);
  tick();
}

/* ---------- 各区块渲染 ---------- */
function renderAbout() {
  const card = el('div', 'glass about-text reveal');
  SITE.about.paragraphs.forEach((p) => card.appendChild(el('p', '', p)));
  const tags = el('div', 'about-tags');
  SITE.about.tags.forEach((t) => tags.appendChild(el('span', '', t)));
  card.appendChild(tags);

  const stats = el('div', 'about-stats');
  SITE.stats.forEach((s) => {
    const c = el('div', 'glass stat-card reveal', `<span class="stat-num">${s.num}</span><span class="stat-label">${s.label}</span>`);
    stats.appendChild(c);
  });

  $('#aboutGrid').append(card, stats);
}

function renderEducation() {
  const grid = $('#eduGrid');
  SITE.education.forEach((e) => {
    const card = el('div', 'glass edu-card reveal');
    card.innerHTML = `
      <p class="edu-time">${e.time}</p>
      <h3>${e.school}</h3>
      <p class="edu-major">${e.major}</p>
      <ul>${e.points.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    grid.appendChild(card);
  });
}

function renderExperience() {
  const tl = $('#expTimeline');
  SITE.experience.forEach((x) => {
    const item = el('div', 'tl-item reveal');
    item.innerHTML = `
      <div class="glass tl-card">
        <div class="tl-head"><h3>${x.company}</h3><span class="tl-time">${x.time}</span></div>
        <p class="tl-role"><b>${x.role}</b></p>
        <ul>${x.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      </div>`;
    tl.appendChild(item);
  });
}

function renderActivities() {
  const grid = $('#actGrid');
  if (!SITE.activities.length) {
    grid.appendChild(el('p', 'section-note reveal', '内容整理中，敬请期待 · 更多活动记录可见公众号'));
    return;
  }
  SITE.activities.forEach((a) => {
    const card = el('div', 'glass act-card reveal');
    const cover = el('div', 'act-cover');
    if (a.cover) {
      const img = el('img');
      img.src = a.cover;
      img.alt = a.title;
      img.loading = 'lazy';
      cover.appendChild(img);
    }
    if (a.badge) cover.appendChild(el('span', 'act-badge', a.badge));
    const body = el('div', 'act-body', `
      <h3>${a.title}</h3>
      <p class="act-meta">${a.time}${a.role ? ' · ' + a.role : ''}</p>
      <p class="act-desc">${a.desc}</p>`);
    if (a.links && a.links.length) {
      const links = el('div', 'act-links');
      a.links.forEach((l) => {
        const cls = /视频|video/i.test(l.label) ? 'link-video' : 'link-article';
        const link = el('a', cls, l.label);
        link.href = l.url;
        link.target = '_blank';
        link.rel = 'noopener';
        links.appendChild(link);
      });
      body.appendChild(links);
      // 整张卡片可点击，跳转到第一个链接
      card.classList.add('clickable');
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `打开：${a.title}`);
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // 点底部链接按钮时不重复跳转
        window.open(a.links[0].url, '_blank', 'noopener');
      });
    }
    card.append(cover, body);
    grid.appendChild(card);
  });
}

function renderHonors() {
  const list = $('#honorList');
  SITE.honors.forEach((h) => {
    list.appendChild(el('div', 'glass honor-item reveal', `
      <div class="honor-icon">🏆</div>
      <div><h4>${h.name}</h4><p>${h.org} · ${h.year}</p></div>`));
  });
}

function renderWorks() {
  const grid = $('#workGrid');
  if (!SITE.works.length) {
    grid.appendChild(el('p', 'section-note reveal', '成果文件整理中（已完成脱敏处理后上架）'));
    return;
  }
  SITE.works.forEach((w) => {
    const card = el('div', 'glass work-card reveal');
    card.innerHTML = `<img src="${w.img}" alt="${w.title}" loading="lazy">
      <div class="work-info"><h4>${w.title}</h4><p>${w.desc || ''}</p></div>`;
    card.addEventListener('click', () => openLightbox(w.img, w.title));
    grid.appendChild(card);
  });
}

function renderSkills() {
  const grid = $('#skillsGrid');
  SITE.skills.forEach((s) => {
    grid.appendChild(el('div', 'glass skill-card reveal', `
      <h3><span class="icon">${s.icon}</span>${s.title}</h3>
      <ul>${s.items.map((i) => `<li>${i}</li>`).join('')}</ul>`));
  });
}

/* ---------- Lightbox ---------- */
function openLightbox(src, alt) {
  $('#lightboxImg').src = src;
  $('#lightboxImg').alt = alt || '预览大图';
  $('#lightbox').classList.add('open');
}
function closeLightbox() { $('#lightbox').classList.remove('open'); }
window.openLightbox = openLightbox;

/* ---------- 滚动浮现 & 导航状态 ---------- */
function setupScroll() {
  const nav = $('#nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
}

/* ---------- 移动端菜单 ---------- */
function setupNavToggle() {
  const btn = $('#navToggle'), links = $('#navLinks');
  btn.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open')));
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderContacts();
  renderAbout();
  renderEducation();
  renderExperience();
  renderActivities();
  renderHonors();
  renderWorks();
  renderSkills();
  $('#footerContact').textContent = SITE.contacts.map((c) => `${c.label}：${c.value}`).join('  ·  ');
  typewriter();
  setupScroll();
  setupNavToggle();

  $('#lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.id === 'lightboxClose') closeLightbox();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
});
