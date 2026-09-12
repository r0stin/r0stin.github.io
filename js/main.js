/* =========================================================
   Rostin Maafi — Portfolio interactions
   Preloader · cursor · particles · split text · typewriter
   reveals · counters · timeline · spotlight/tilt · magnetic
   nav · mobile menu · clipboard · local time
   ========================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------------------------------------------------
     Split text (hero title) — must run before preloader ends
     --------------------------------------------------------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    const offset = parseInt(el.dataset.offset || '0', 10);
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--i', String(i + offset));
      s.textContent = ch === ' ' ? ' ' : ch;
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
  });

  /* ---------------------------------------------------------
     Preloader
     --------------------------------------------------------- */
  const preloader = $('#preloader');
  const preCount = $('#preCount');
  const preBar = $('#preBar');
  const PRE_DURATION = prefersReduced ? 0 : 1500;

  function finishPreloader() {
    preloader.classList.add('done');
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    setTimeout(() => preloader.remove(), 1000);
  }

  if (preloader) {
    const t0 = performance.now();
    const tick = (t) => {
      const p = PRE_DURATION ? clamp((t - t0) / PRE_DURATION, 0, 1) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(eased * 100);
      preCount.textContent = String(v).padStart(3, '0');
      preBar.style.width = v + '%';
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishPreloader, 250);
    };
    requestAnimationFrame(tick);
  } else {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }

  /* ---------------------------------------------------------
     Custom cursor
     --------------------------------------------------------- */
  (function initCursor() {
    if (isTouch || prefersReduced) return;
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    if (!dot || !ring) return;
    document.body.classList.add('has-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();

    const hoverSel = 'a, button, [data-hover], .card, .chip, .stat, .tag';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));
    document.documentElement.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.documentElement.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
  })();

  /* ---------------------------------------------------------
     Hero particle network
     --------------------------------------------------------- */
  (function initParticles() {
    const canvas = $('#heroCanvas');
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, pts = [], running = true, raf = 0;
    const LINK = 130;
    const MOUSE_LINK = 190;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.floor((w * h) / 13000), 40, 130);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
      }));
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) { p.x += (dx / d) * 0.9; p.y += (dy / d) * 0.9; }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < MOUSE_LINK * MOUSE_LINK) {
          const alpha = (1 - Math.sqrt(md2) / MOUSE_LINK) * 0.45;
          ctx.strokeStyle = `rgba(255,194,71,${alpha})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }

      for (const p of pts) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    function start() { if (!running) { running = true; step(); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    resize();
    step();
  })();

  /* ---------------------------------------------------------
     Typewriter roles
     --------------------------------------------------------- */
  (function initTypewriter() {
    const el = $('#typed');
    if (!el) return;
    const roles = ['Software Engineer', 'Robotics & AI Builder', 'Full-Stack Developer', "Queen's CS Graduate"];
    if (prefersReduced) { el.textContent = roles[0]; return; }
    let ri = 0, ci = 0, deleting = false;
    const type = () => {
      const word = roles[ri];
      ci += deleting ? -1 : 1;
      el.textContent = word.slice(0, ci);
      let delay = deleting ? 38 : 70;
      if (!deleting && ci === word.length) { delay = 1900; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
      setTimeout(type, delay);
    };
    setTimeout(type, 1600);
  })();

  /* ---------------------------------------------------------
     Hero parallax on scroll + code card tilt with mouse
     --------------------------------------------------------- */
  (function initHeroMotion() {
    const content = $('.hero__content');
    const card = $('#codecard');
    const hero = $('.hero');
    if (!hero || prefersReduced) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight && content) {
          content.style.transform = `translateY(${y * 0.18}px)`;
          content.style.opacity = String(clamp(1 - y / (window.innerHeight * 0.9), 0, 1));
        }
        ticking = false;
      });
    }, { passive: true });

    if (card && !isTouch) {
      card.classList.add('codecard__float');
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', `${-py * 6}deg`);
        card.style.setProperty('--ry', `${px * 8}deg`);
        card.style.transform = `rotateX(var(--rx)) rotateY(var(--ry))`;
      }, { passive: true });
      hero.addEventListener('mouseleave', () => { card.style.transform = ''; });
    }
  })();

  /* ---------------------------------------------------------
     Scroll reveals
     --------------------------------------------------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ---------------------------------------------------------
     Counters
     --------------------------------------------------------- */
  (function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const dur = 1700, t0 = performance.now();
      const f = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(f); else el.textContent = target + suffix;
      };
      requestAnimationFrame(f);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  })();

  /* ---------------------------------------------------------
     Timeline progress line
     --------------------------------------------------------- */
  (function initTimeline() {
    const tl = $('#timeline');
    const bar = $('#timelineProgress');
    if (!tl || !bar) return;
    const update = () => {
      const r = tl.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const p = clamp((mid - r.top) / r.height, 0, 1);
      bar.style.setProperty('--p', `${p * 100}%`);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------------------------------------------------------
     Card spotlight + 3D tilt
     --------------------------------------------------------- */
  (function initCards() {
    const cards = $$('.card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        if (card.hasAttribute('data-tilt') && !isTouch && !prefersReduced) {
          const rx = ((y / r.height) - 0.5) * -5;
          const ry = ((x / r.width) - 0.5) * 5;
          card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        }
      }, { passive: true });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  })();

  /* ---------------------------------------------------------
     Magnetic buttons
     --------------------------------------------------------- */
  (function initMagnetic() {
    if (isTouch || prefersReduced) return;
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }, { passive: true });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  })();

  /* ---------------------------------------------------------
     Nav: scrolled state, hide on scroll down, active link,
     scroll progress
     --------------------------------------------------------- */
  (function initNav() {
    const nav = $('#nav');
    const progress = $('#progress');
    const links = $$('.nav__links a');
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 24);
      if (!document.body.classList.contains('menu-open')) {
        nav.classList.toggle('hidden', y > lastY && y > 260);
      }
      lastY = y;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (progress) progress.style.width = `${total > 0 ? (y / total) * 100 : 0}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  })();

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  (function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    const nav = $('#nav');
    if (!burger || !menu) return;
    const setOpen = (open) => {
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) nav.classList.remove('hidden');
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  })();

  /* ---------------------------------------------------------
     Copy email + toast, back to top, year, local time
     --------------------------------------------------------- */
  (function initMisc() {
    const copyBtn = $('#copyEmail');
    const toast = $('#toast');
    let toastT;
    const showToast = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(() => toast.classList.remove('show'), 2200);
    };
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const email = $('span', copyBtn).textContent.trim();
        try {
          await navigator.clipboard.writeText(email);
          showToast('Email copied to clipboard');
        } catch {
          window.location.href = `mailto:${email}`;
        }
      });
    }

    const toTop = $('#toTop');
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    const timeEl = $('#localTime');
    if (timeEl) {
      const fmt = new Intl.DateTimeFormat('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Toronto' });
      const tickTime = () => { timeEl.textContent = fmt.format(new Date()); };
      tickTime();
      setInterval(tickTime, 30000);
    }
  })();
})();
