/* ROAR — shared interactions */
document.addEventListener('DOMContentLoaded', () => {

  /* Preloader */
  const pre = document.getElementById('preloader');
  if(pre){
    const bar = pre.querySelector('.pre-bar span');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random()*18;
      if(p >= 100){ p = 100; clearInterval(iv); }
      if(bar) bar.style.width = p + '%';
    }, 140);
    window.addEventListener('load', () => {
      setTimeout(() => {
        pre.classList.add('hidden');
        document.body.style.overflow = '';
      }, 500);
    });
    setTimeout(() => { pre.classList.add('hidden'); }, 3500); // safety fallback
  }

  /* Nav scroll state */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if(!nav) return;
    if(window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll);
  onScroll();

  /* Mobile nav toggle */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '☰';
    }));
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const prog = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString() + suffix;
      if(prog < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    };
    requestAnimationFrame(step);
  };
  if('IntersectionObserver' in window){
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){ animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => co.observe(c));
  }

  /* Countdown to event */
  const cd = document.getElementById('countdown');
  if(cd){
    const target = new Date(cd.dataset.date).getTime();
    const dEl = cd.querySelector('[data-d]');
    const hEl = cd.querySelector('[data-h]');
    const mEl = cd.querySelector('[data-m]');
    const sEl = cd.querySelector('[data-s]');
    const tick = () => {
      const diff = target - Date.now();
      if(diff <= 0){ [dEl,hEl,mEl,sEl].forEach(e=>e && (e.textContent='00')); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff/3600000)%24);
      const m = Math.floor((diff/60000)%60);
      const s = Math.floor((diff/1000)%60);
      if(dEl) dEl.textContent = String(d).padStart(2,'0');
      if(hEl) hEl.textContent = String(h).padStart(2,'0');
      if(mEl) mEl.textContent = String(m).padStart(2,'0');
      if(sEl) sEl.textContent = String(s).padStart(2,'0');
    };
    tick();
    setInterval(tick, 1000);
  }

});
