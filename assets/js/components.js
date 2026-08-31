function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      } else { field += c; }
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some(v => v !== '')) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] || '').trim(); });
    return obj;
  });
}

function formatMonth(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function sortByDateDesc(items) {
  return items.slice().sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });
}

function isActivePath(href) {
  const path = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
  const target = href.replace(/\/index\.html$/, '/').replace(/\/$/, '');
  return path === target;
}

class SiteNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
          <a class="navbar-brand" href="/">KOREA UNIVERSITY</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fas fa-bars"></i>
          </button>
          <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item"><a class="nav-link" href="/" data-nav="/">HOME</a></li>
              <li class="nav-item"><a class="nav-link" href="/pages/about" data-nav="/pages/about">ABOUT</a></li>
              <li class="nav-item"><a class="nav-link" href="/pages/professor" data-nav="/pages/professor">PROFESSOR</a></li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">MEMBER</a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/pages/students">STUDENTS</a></li>
                  <li><a class="dropdown-item" href="/pages/alumni">ALUMNI</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">PUBLICATION</a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/pages/researchs">RESEARCH</a></li>
                  <li><a class="dropdown-item" href="/pages/patents">PATENT</a></li>
                  <li><a class="dropdown-item" href="/pages/books">BOOK</a></li>
                  <li><a class="dropdown-item" href="/pages/guidelines">Generative AI Guidelines</a></li>
                </ul>
              </li>
              <li class="nav-item"><a class="nav-link" href="/pages/contact" data-nav="/pages/contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>
    `;
    this.querySelectorAll('[data-nav]').forEach(a => {
      if (isActivePath(a.getAttribute('data-nav'))) a.style.color = 'var(--ku-red)';
    });

    const nav = this.querySelector('.navbar');
    const hero = document.querySelector('site-hero');
    const getThreshold = () => {
      if (!hero) return 0;
      const masthead = hero.querySelector('.masthead');
      const el = masthead || hero;
      return Math.max(0, el.offsetHeight - nav.offsetHeight);
    };
    const update = () => {
      const scrolled = window.scrollY > getThreshold();
      nav.classList.toggle('is-fixed', scrolled || !hero);
    };
    requestAnimationFrame(update);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('load', update);

    const collapse = this.querySelector('#navbarResponsive');
    if (collapse) {
      collapse.addEventListener('show.bs.collapse', () => nav.classList.add('is-fixed'));
      collapse.addEventListener('hidden.bs.collapse', update);
    }
  }
}

class SiteHero extends HTMLElement {
  connectedCallback() {
    const background = this.getAttribute('background') || '';
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const variant = this.getAttribute('variant') || 'page';
    const bgStyle = background ? `style="background-image: url('${background}')"` : '';
    if (variant === 'home') {
      this.innerHTML = `
        <header class="masthead masthead-home" ${bgStyle}>
          <div class="overlay"></div>
          <div class="container">
            <div class="row"><div class="col-lg-8 col-md-10 mx-auto">
              <div class="home-hero-frame"><div class="home-hero-frame-inner">
                <h1>${title}</h1>
                ${description ? `<span class="subheading">${description}</span>` : ''}
              </div></div>
            </div></div>
          </div>
        </header>`;
    } else {
      this.innerHTML = `
        <header class="masthead" ${bgStyle}>
          <div class="overlay"></div>
          <div class="container">
            <div class="row"><div class="col-lg-8 col-md-10 mx-auto">
              <div class="page-heading">
                <h2>${title}</h2>
                ${description ? `<span class="subheading">${description}</span>` : ''}
              </div>
            </div></div>
          </div>
        </header>`;
    }
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const email = this.getAttribute('email') || 'antonio97k@korea.ac.kr';
    const author = this.getAttribute('author') || 'INI Lab';
    const year = new Date().getFullYear();
    this.innerHTML = `
      <hr>
      <footer>
        <div class="container">
          <div class="row"><div class="col-lg-8 col-md-10 mx-auto">
            <ul class="footer-icons">
              <li>
                <a href="mailto:${email}" aria-label="email">
                  <span class="fa-stack fa-lg">
                    <i class="fas fa-circle fa-stack-2x"></i>
                    <i class="far fa-envelope fa-stack-1x fa-inverse"></i>
                  </span>
                </a>
              </li>
            </ul>
            <p class="copyright">Copyright &copy; ${author} ${year}</p>
          </div></div>
        </div>
      </footer>`;
  }
}

class CSVListBase extends HTMLElement {
  sortItems(items) { return sortByDateDesc(items); }
  async connectedCallback() {
    const src = this.getAttribute('src');
    const limit = parseInt(this.getAttribute('limit') || '0', 10);
    if (!src) { this.innerHTML = '<p>src attribute is required.</p>'; return; }
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(res.statusText);
      const text = await res.text();
      let items = parseCSV(text);
      items = this.sortItems(items);
      if (limit > 0) items = items.slice(0, limit);
      this.innerHTML = items.length
        ? items.map(item => this.renderItem(item)).join('')
        : '<p><em>준비 중입니다.</em></p>';
    } catch (e) {
      this.innerHTML = `<p><em>목록을 불러오지 못했습니다: ${e.message}</em></p>`;
    }
  }
  renderItem() { return ''; }
}

class PaperList extends CSVListBase {
  renderItem(p) {
    return `
      <article class="post-preview">
        <h5 class="post-title">${p.title}</h5>
        <p class="post-meta">${p.author}, ${p.journal} in ${formatMonth(p.date)}</p>
      </article>
      <hr>`;
  }
}

class BookList extends CSVListBase {
  renderItem(b) {
    const img = b.image ? `<div class="book-cover"><img src="${b.image}" alt=""></div>` : '';
    return `
      <div class="book-item">
        ${img}
        <div class="book-info">
          <article class="post-preview">
            <h5 class="post-title">${b.title}</h5>
            <p class="post-meta">${b.authors} in ${formatMonth(b.date)}</p>
          </article>
        </div>
      </div>
      <hr>`;
  }
}

class PatentList extends CSVListBase {
  renderItem(p) {
    const appNum = p.application_number ? `, 출원번호 ${p.application_number}` : '';
    return `
      <article class="post-preview">
        <h5 class="post-title">${p.title}</h5>
        <p class="post-meta">${p.authors}${appNum} in ${formatMonth(p.date)}</p>
      </article>
      <hr>`;
  }
}

class ExperienceList extends CSVListBase {
  sortItems(items) { return items; }
  renderItem(e) {
    return `
      ${e.title}
      <blockquote>${e.period}</blockquote>
      <hr>`;
  }
}

class MemberList extends HTMLElement {
  parseSections() {
    const raw = this.getAttribute('sections') || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean).map(entry => {
      const idx = entry.indexOf(':');
      return idx === -1
        ? { key: entry, label: entry }
        : { key: entry.slice(0, idx).trim(), label: entry.slice(idx + 1).trim() };
    });
  }
  async connectedCallback() {
    const src = this.getAttribute('src');
    if (!src) { this.innerHTML = '<p>src attribute is required.</p>'; return; }
    const sections = this.parseSections();
    if (sections.length === 0) { this.innerHTML = '<p>sections attribute is required.</p>'; return; }
    const status = this.getAttribute('status');
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(res.statusText);
      let items = parseCSV(await res.text());
      if (status) items = items.filter(s => s.status === status);
      this.innerHTML = sections.map((section, i) => {
        const members = items.filter(s => s.degree === section.key);
        const style = i === 0
          ? 'margin-bottom: 1.25rem;'
          : 'margin-top: 3rem; margin-bottom: 1.25rem;';
        const body = members.map(s => {
          const interests = Object.keys(s)
            .filter(k => /^interest\d*$/i.test(k))
            .map(k => s[k])
            .filter(Boolean)
            .map(x => `<li>${x}</li>`)
            .join('');
          const photoInner = `<img src="${s.photo}" alt="${s.name}">`;
          const photo = s.link
            ? `<a href="${s.link}" target="_blank" rel="noopener">${photoInner}</a>`
            : photoInner;
          const name = s.link
            ? `<a href="${s.link}" target="_blank" rel="noopener">${s.name}</a>`
            : s.name;
          return `
            <div class="member-row">
              <div class="member-photo">${photo}</div>
              <div class="member-info">
                <h4>${name}</h4>
                <div class="email">${s.email}</div>
                <b>Research interests</b>
                <ul>${interests}</ul>
              </div>
            </div>
            <hr>`;
        }).join('');
        return `<h2 style="${style}">${section.label}</h2>${body}`;
      }).join('');
    } catch (e) {
      this.innerHTML = `<p><em>목록을 불러오지 못했습니다: ${e.message}</em></p>`;
    }
  }
}

customElements.define('site-nav', SiteNav);
customElements.define('site-hero', SiteHero);
customElements.define('site-footer', SiteFooter);
customElements.define('paper-list', PaperList);
customElements.define('book-list', BookList);
customElements.define('patent-list', PatentList);
customElements.define('experience-list', ExperienceList);
customElements.define('member-list', MemberList);
