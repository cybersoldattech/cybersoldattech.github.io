/* ==========================================================================
   PORTFOLIO — main.js
   Loader d'ouverture · curseur spotlight · nav mobile · terminal interactif
   (hero + overlay flottant) · reveal au scroll · filtre de projets.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Thème clair / sombre (clair par défaut) ---------- */
  const THEME_COLORS = { light: '#f7f9fc', dark: '#060a14' };
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const applyThemeUI = () => {
    const isDark = htmlEl.classList.contains('dark');
    iconSun && iconSun.classList.toggle('hidden', isDark);
    iconMoon && iconMoon.classList.toggle('hidden', !isDark);
    if (metaTheme) metaTheme.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
    themeToggle && themeToggle.setAttribute('aria-label', isDark ? 'Passer en mode clair' : 'Passer en mode sombre');
  };
  applyThemeUI(); // la classe .dark (si besoin) a déjà été posée par le script anti-flash dans <head>

  themeToggle && themeToggle.addEventListener('click', () => {
    htmlEl.classList.toggle('dark');
    try { localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light'); } catch (e) {}
    applyThemeUI();
  });

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  if (loader){
    const hideLoader = () => {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 600);
    };
    const minDelay = new Promise(r => setTimeout(r, 900));
    const pageReady = new Promise(r => {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r, { once: true });
    });
    Promise.all([minDelay, pageReady]).then(hideLoader);
  }

  /* ---------- Curseur spotlight ---------- */
  const glow = document.getElementById('cursor-glow');
  const dot  = document.getElementById('cursor-dot');
  const canGlow = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (glow && dot && canGlow){
    document.body.classList.add('has-glow-cursor');
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let cx = gx, cy = gy;

    window.addEventListener('pointermove', (e) => {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('is-active');
      dot.classList.add('is-active');
    });
    window.addEventListener('pointerleave', () => {
      glow.classList.remove('is-active');
      dot.classList.remove('is-active');
    });

    const HOVER_SELECTOR = 'a, button, input, [role="button"], .glow-target, .project-card, .skill-card, .timeline-card';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) glow.classList.add('is-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) glow.classList.remove('is-hover');
    });

    const render = () => {
      cx += (gx - cx) * 0.16;
      cy += (gy - cy) * 0.16;
      glow.style.transform = `translate(${cx}px, ${cy}px)`;
      dot.style.transform  = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  } else if (glow && dot){
    glow.style.display = 'none';
    dot.style.display = 'none';
  }

  /* ---------- Année dans le footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Menu mobile ---------- */
  // Géré inline dans chaque page (id="burger" / id="mobileNav") car les classes
  // Tailwind à basculer (hidden/flex) sont propres à chaque bouton.

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Filtre projets (page /projets) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('[data-tags]');
  if (filterBtns.length){
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        projectCards.forEach(card => {
          const tags = card.dataset.tags.split(',');
          card.style.display = (f === 'all' || tags.includes(f)) ? '' : 'none';
        });
      });
    });
  }

  /* =========================================================================
     TERMINAL — moteur partagé par le terminal du hero et le terminal flottant
     ========================================================================= 
    */


  const IDENTITY = {
    name: 'TAKOUGNE NDE CHRIS SAMORY',
    role: 'CTO | Teach Lead | Software Engineer',
    location: 'Yaoundé, Cameroun',
    email: 'samorytakougne@gmail.com',
    github: 'https://github.com/cybersoldattech',
    linkedin: 'https://www.linkedin.com/in/chris-samory-takougne-nde-003084224',
  };

  function typeLine(container, html){
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = html;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
    return line;
  }

  function commandList(){
    return [
      ['help',      'affiche la liste des commandes'],
      ['whoami',    'un résumé de qui je suis'],
      ['skills',    'mes compétences techniques'],
      ['parcours',  'ouvre la page /parcours'],
      ['projets',   'ouvre la page /projets'],
      ['contact',   'ouvre la page /contact'],
      ['clear',     'vide le terminal'],
    ];
  }

  function runCommand(raw, out){
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    switch (cmd){
      case 'help': {
        typeLine(out, `<span class="out-dim">Commandes disponibles :</span>`);
        commandList().forEach(([c, desc]) => {
          typeLine(out, `  <span class="prompt">${c.padEnd(10, ' ')}</span><span class="out-dim">${desc}</span>`);
        });
        break;
      }
      case 'whoami': {
        typeLine(out, `<span class="out-ok">${IDENTITY.name}</span> — ${IDENTITY.role}`);
        typeLine(out, `<span class="out-dim">${IDENTITY.location}</span>`);
        typeLine(out, `<span class="out-dim">Tape "parcours" ou "projets" pour en savoir plus.</span>`);
        break;
      }
      case 'skills': {
        typeLine(out, `<span class="out-dim">// Stack principale</span>`);
        typeLine(out, `Frontend  <span class="path-inline">HTML · CSS · JavaScript · React</span>`);
        typeLine(out, `Backend   <span class="path-inline">Node.js · Express · REST / API</span>`);
        typeLine(out, `Outils    <span class="path-inline">Git · Docker · CI/CD</span>`);
        typeLine(out, `<span class="out-dim">Voir la page d'accueil pour le détail complet.</span>`);
        break;
      }
      case 'parcours':
      case 'cd parcours':
        typeLine(out, `<span class="out-dim">→ ouverture de /parcours ...</span>`);
        setTimeout(() => location.href = 'parcours.html', 350);
        break;
      case 'projets':
      case 'cd projets':
        typeLine(out, `<span class="out-dim">→ ouverture de /projets ...</span>`);
        setTimeout(() => location.href = 'projets.html', 350);
        break;
      case 'accueil':
      case 'cd accueil':
      case 'cd ~':
        typeLine(out, `<span class="out-dim">→ retour à l'accueil ...</span>`);
        setTimeout(() => location.href = 'index.html', 350);
        break;
      case 'contact':
      case 'cd contact':
        typeLine(out, `email     <a class="out-link" href="mailto:${IDENTITY.email}">${IDENTITY.email}</a>`);
        typeLine(out, `<span class="out-dim">→ ouverture de /contact ...</span>`);
        setTimeout(() => location.href = 'contact.html', 450);
        break;
      case 'clear':
        out.innerHTML = '';
        break;
      case 'sudo':
      case 'sudo su':
        typeLine(out, `<span class="out-warn">Permission refusée : ce site n'a pas besoin de super-pouvoirs, juste de café.</span>`);
        break;
      case 'date':
        typeLine(out, `<span class="out-dim">${new Date().toLocaleString('fr-FR')}</span>`);
        break;
      case 'exit': {
        const openOverlay = document.querySelector('.terminal-overlay.open');
        if (openOverlay) { typeLine(out, `<span class="out-dim">À bientôt.</span>`); setTimeout(() => openOverlay.classList.remove('open'), 250); }
        else { typeLine(out, `<span class="out-dim">Rien à fermer ici.</span>`); }
        break;
      }
      default:
        typeLine(out, `<span class="out-warn">commande introuvable :</span> ${cmd}. Tape <span class="prompt">help</span> pour la liste.`);
    }
  }

  function initTerminal(root){
    const out   = root.querySelector('.terminal-body');
    const input = root.querySelector('.terminal-inputline input');
    if (!out || !input) return;

    const history = [];
    let hIndex = -1;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){
        const val = input.value;
        typeLine(out, `<span class="prompt">visiteur@portfolio</span><span class="out-dim">:</span><span class="path-inline">~</span><span class="out-dim">$</span> ${val}`);
        if (val.trim()) { history.unshift(val); hIndex = -1; }
        runCommand(val, out);
        input.value = '';
      } else if (e.key === 'ArrowUp'){
        if (history.length){ hIndex = Math.min(hIndex + 1, history.length - 1); input.value = history[hIndex]; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown'){
        if (hIndex > 0){ hIndex--; input.value = history[hIndex]; } else { hIndex = -1; input.value = ''; }
        e.preventDefault();
      }
    });

    root.addEventListener('click', () => input.focus());

    if (root.dataset.boot === 'true' && !root.dataset.booted){
      root.dataset.booted = 'true';
      const bootLines = [
        `<span class="out-dim">Dernière connexion : ${new Date().toLocaleDateString('fr-FR')}</span>`,
        `Chargement du profil <span class="path-inline">${IDENTITY.name}</span>... <span class="out-ok">OK</span>`,
        `<span class="out-dim">Tape "help" pour découvrir les commandes disponibles.</span>`,
      ];
      let i = 0;
      const step = () => {
        if (i < bootLines.length){ typeLine(out, bootLines[i]); i++; setTimeout(step, 340); }
        else { input.focus(); }
      };
      step();
    }
  }

  document.querySelectorAll('.terminal').forEach(initTerminal);

  const fab = document.querySelector('.term-fab');
  const overlay = document.querySelector('.terminal-overlay');
  if (fab && overlay){
    const overlayRoot = overlay.querySelector('.terminal');
    const closeBtn = overlay.querySelector('.terminal-close');
    const openOverlay = () => {
      overlay.classList.add('open');
      overlayRoot.querySelector('.terminal-inputline input').focus();
    };
    const closeOverlay = () => overlay.classList.remove('open');

    fab.addEventListener('click', openOverlay);
    closeBtn?.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });
  }


  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const toast = document.getElementById('formToast');
    const CONTACT_EMAIL = 'samorytakougne@gmail.com';

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('#cf-name').value.trim();
      const email = contactForm.querySelector('#cf-email').value.trim();
      const subject = contactForm.querySelector('#cf-subject').value.trim();
      const message = contactForm.querySelector('#cf-message').value.trim();
      if (!name || !email || !message) return;

      const mailSubject = subject ? subject : `Contact depuis le portfolio — ${name}`;
      const mailBody = `${message}\n\n—\n${name}\n${email}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

      window.location.href = mailto;

      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4500);
      }
    });
  }

});
