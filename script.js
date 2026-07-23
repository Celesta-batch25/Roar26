/* ROAR — Guild Protocol build: interactions */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  if(pre){
    const bar = pre.querySelector('.pre-bar span');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random()*18;
      if(p >= 100){ p = 100; clearInterval(iv); }
      if(bar) bar.style.width = p + '%';
    }, 130);
    window.addEventListener('load', () => setTimeout(() => pre.classList.add('hidden'), 450));
    setTimeout(() => pre.classList.add('hidden'), 3200);
  }

  /* ---------- Navbar ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if(!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll);
  onScroll();

  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
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

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  /* ---------- Countdown ---------- */
  document.querySelectorAll('[data-countdown]').forEach(cd => {
    const target = new Date(cd.dataset.date).getTime();
    const dEl = cd.querySelector('[data-d]'), hEl = cd.querySelector('[data-h]'),
          mEl = cd.querySelector('[data-m]'), sEl = cd.querySelector('[data-s]');
    const tick = () => {
      const diff = target - Date.now();
      if(diff <= 0){ [dEl,hEl,mEl,sEl].forEach(e=>e && (e.textContent='00')); return; }
      const d = Math.floor(diff/86400000), h = Math.floor((diff/3600000)%24),
            m = Math.floor((diff/60000)%60), s = Math.floor((diff/1000)%60);
      if(dEl) dEl.textContent = String(d).padStart(2,'0');
      if(hEl) hEl.textContent = String(h).padStart(2,'0');
      if(mEl) mEl.textContent = String(m).padStart(2,'0');
      if(sEl) sEl.textContent = String(s).padStart(2,'0');
    };
    tick(); setInterval(tick, 1000);
  });

  /* ---------- Headliners mobile indicators ---------- */
  const hlGrid = document.getElementById('hlGrid');
  const hlIndicators = document.querySelectorAll('#hlIndicators .hl-indicator');
  if(hlGrid && hlIndicators.length){
    const slides = hlGrid.querySelectorAll('.hl-slide');
    hlIndicators.forEach(ind => {
      ind.addEventListener('click', () => {
        const i = parseInt(ind.dataset.i, 10);
        const target = slides[i];
        if(target) target.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
      });
    });
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if(e.isIntersecting){
            const idx = Array.from(slides).indexOf(e.target);
            hlIndicators.forEach(i => i.classList.remove('active'));
            if(hlIndicators[idx]) hlIndicators[idx].classList.add('active');
          }
        });
      }, { root: hlGrid.parentElement, threshold: .6 });
      slides.forEach(s => io.observe(s));
    }
  }

  /* ---------- Pointer-follow glow (Gateway + Sponsor cards) ---------- */
  document.querySelectorAll('.ag-card, .spn-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });
  });

  /* ---------- ROAR Meter (Cyber Clicker) ---------- */
  const ccBtn = document.getElementById('ccBtn');
  const ccCircle = document.getElementById('ccCircle');
  const ccPercent = document.getElementById('ccPercent');
  const ccTotal = document.getElementById('ccTotal');
  const ccMult = document.getElementById('ccMult');
  const ccLocked = document.getElementById('ccLocked');
  const meterPopup = document.getElementById('meterPopup');
  const meterPopupClose = document.getElementById('meterPopupClose');
  const meterPopupBackdrop = document.getElementById('meterPopupBackdrop');
  const meterConfetti = document.getElementById('meterConfetti');

  const spawnConfetti = () => {
    if(!meterConfetti) return;
    meterConfetti.innerHTML = '';
    const colors = ['#D4AF37', '#F5D76E', '#fff', '#5C0A1D'];
    for(let i = 0; i < 28; i++){
      const bit = document.createElement('i');
      bit.style.left = Math.random() * 100 + '%';
      bit.style.background = colors[Math.floor(Math.random() * colors.length)];
      bit.style.animationDelay = (Math.random() * 0.5) + 's';
      bit.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
      bit.style.transform = `rotate(${Math.random() * 360}deg)`;
      meterConfetti.appendChild(bit);
    }
  };

  const openMeterPopup = () => {
    if(!meterPopup) return;
    spawnConfetti();
    meterPopup.classList.add('show');
  };
  const closeMeterPopup = () => { if(meterPopup) meterPopup.classList.remove('show'); };
  if(meterPopupClose) meterPopupClose.addEventListener('click', closeMeterPopup);
  if(meterPopupBackdrop) meterPopupBackdrop.addEventListener('click', closeMeterPopup);

  if(ccBtn && ccCircle){
    const CIRCUMFERENCE = 283; // 2 * PI * 45, matches r=45 in the SVG
    let charge = 0, total = 0, unlocked = false;

    ccBtn.addEventListener('click', () => {
      if(unlocked) return;
      charge = Math.min(charge + 2, 100);
      total += 1;
      const mult = 1 + Math.floor(total / 25);

      ccCircle.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * charge / 100);
      ccPercent.textContent = charge + '%';
      ccTotal.textContent = total;
      ccMult.textContent = '×' + mult;

      ccBtn.style.transform = 'scale(0.94)';
      setTimeout(() => { ccBtn.style.transform = ''; }, 120);

      if(charge >= 100 && !unlocked){
        unlocked = true;
        if(ccLocked){
          ccLocked.querySelector('.lock-icon').textContent = '🏅';
          ccLocked.querySelector('span:nth-child(2)').textContent = 'Reward Unlocked!';
          ccLocked.querySelector('.lock-tag').textContent = 'SHOW THIS AT THE ROAR DESK';
        }
        openMeterPopup();
        setTimeout(() => {
          charge = 0; unlocked = false;
          ccCircle.style.strokeDashoffset = CIRCUMFERENCE;
          ccPercent.textContent = '0%';
          if(ccLocked){
            ccLocked.querySelector('.lock-icon').textContent = '🔒';
            ccLocked.querySelector('span:nth-child(2)').textContent = 'Reward locks at 100%';
            ccLocked.querySelector('.lock-tag').textContent = 'KEEP CLICKING';
          }
        }, 4000);
      }
    });
  }

  /* ---------- ROAR Pass generator modal ---------- */
  const openBtn = document.getElementById('openPassModal');
  const modal = document.getElementById('passModal');
  const closeBtn = document.getElementById('passModalClose');
  const backdrop = document.getElementById('passModalBackdrop');
  const passForm = document.getElementById('passForm');
  const passNameInput = document.getElementById('passInputName');
  const passRoleInput = document.getElementById('passInputRole');
  const passBirthdayInput = document.getElementById('passInputBirthday');
  const passPhotoInput = document.getElementById('passInputPhoto');
  const passNameDisplay = document.getElementById('passName');
  const passRoleDisplay = document.getElementById('passRole');
  const passBirthdayDisplay = document.getElementById('passBirthday');
  const passPhotoImg = document.getElementById('passPhotoImg');
  const photoUploadPreview = document.getElementById('photoUploadPreview');
  const photoUploadPreviewImg = document.getElementById('photoUploadPreviewImg');
  const photoUploadLabel = document.getElementById('photoUploadLabel');

  let uploadedPhotoDataUrl = '';

  const openModal = () => { if(modal){ modal.style.display = 'flex'; modal.classList.add('show'); } };
  const closeModal = () => { if(modal){ modal.style.display = 'none'; modal.classList.remove('show'); } };

  if(openBtn) openBtn.addEventListener('click', openModal);
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(backdrop) backdrop.addEventListener('click', closeModal);

  if(passPhotoInput){
    passPhotoInput.addEventListener('change', () => {
      const file = passPhotoInput.files && passPhotoInput.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadedPhotoDataUrl = ev.target.result;
        if(photoUploadPreviewImg){
          photoUploadPreviewImg.src = uploadedPhotoDataUrl;
          photoUploadPreviewImg.style.display = 'block';
        }
        const placeholder = photoUploadPreview && photoUploadPreview.querySelector('.ph-placeholder');
        if(placeholder) placeholder.style.display = 'none';
        if(photoUploadLabel) photoUploadLabel.textContent = file.name.length > 22 ? file.name.slice(0, 19) + '…' : file.name;
      };
      reader.readAsDataURL(file);
    });
  }

  if(passForm){
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (passNameInput.value || 'GUEST').trim().toUpperCase();
      const role = passRoleInput.value;
      const birthday = passBirthdayInput.value ? new Date(passBirthdayInput.value).toLocaleDateString('en-GB') : 'DATE NOT SET';

      if(passNameDisplay) passNameDisplay.textContent = name;
      if(passRoleDisplay) passRoleDisplay.textContent = role + ' // ROAR-2026';
      if(passBirthdayDisplay) passBirthdayDisplay.textContent = birthday;
      if(passPhotoImg){
        passPhotoImg.src = uploadedPhotoDataUrl || 'assets/logo.png';
        passPhotoImg.alt = uploadedPhotoDataUrl ? `${name} photo` : 'ROAR placeholder image';
      }

      closeModal();
      const card = document.getElementById('passCardPreview');
      if(card){
        card.scrollIntoView({ behavior:'smooth', block:'center' });
        card.style.transform = 'scale(1.04)';
        setTimeout(() => { card.style.transform = ''; }, 400);
      }
    });
  }

});
