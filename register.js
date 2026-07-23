/* ROAR Registration — form logic */

/* =========================================================
   1. SET THIS to your deployed Google Apps Script Web App URL
      (Deploy > New deployment > Web app > Execute as: Me,
      Who has access: Anyone). See Code.gs for the backend.
   ========================================================= */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxK4K2UwjxfuTb_SNHVWssC5AbDIyCdnYT8dCywATpzKZC7kpLfkCR_9kX6BqdsZQLM/exec";

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('regForm');
  const progressFill = document.getElementById('progressFill');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');
  const successPanel = document.getElementById('success-panel');

  /* --- progress bar tied to scroll through the form --- */
  const updateProgress = () => {
    const rect = form.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    progressFill.style.width = pct + '%';
  };
  document.addEventListener('scroll', updateProgress);
  updateProgress();

  /* --- role card visual sync (radio) --- */
  document.querySelectorAll('input[name="role"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('roleErr').style.display = 'none';
    });
  });

  /* --- field validation helpers --- */
  const setInvalid = (field, invalid) => {
    field.classList.toggle('invalid', invalid);
  };

  const validate = () => {
    let ok = true;

    form.querySelectorAll('.field').forEach(field => {
      const input = field.querySelector('input[required], select[required]');
      if(!input) return;
      let fieldOk = true;
      if(input.type === 'email'){
        fieldOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else if(input.type === 'tel'){
        fieldOk = /^[0-9+\s-]{7,15}$/.test(input.value.trim());
      } else {
        fieldOk = input.value.trim().length > 0;
      }
      setInvalid(field, !fieldOk);
      if(!fieldOk) ok = false;
    });

    /* role */
    const roleChecked = form.querySelector('input[name="role"]:checked');
    document.getElementById('roleErr').style.display = roleChecked ? 'none' : 'block';
    if(!roleChecked) ok = false;

    /* terms */
    const terms = form.querySelector('input[name="agreeTerms"]');
    document.getElementById('termsErr').style.display = terms.checked ? 'none' : 'block';
    if(!terms.checked) ok = false;

    return ok;
  };

  const genRegId = () => {
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    const rand = Math.floor(Math.random()*900+100);
    return `ROAR-${stamp}${rand}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    formMsg.className = 'form-msg';

    if(!validate()){
      formMsg.textContent = 'Please complete all required fields correctly.';
      formMsg.classList.add('error');
      const firstInvalid = form.querySelector('.field.invalid, #roleErr[style*="block"]');
      if(firstInvalid) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    const regId = genRegId();
    const data = Object.fromEntries(new FormData(form).entries());
    data.regId = regId;
    data.timestamp = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';

    try {
      if(APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PASTE_')){
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
          body: JSON.stringify(data)
        });
      } else {
        console.warn('APPS_SCRIPT_URL not set — skipping backend submission (demo mode).');
      }

      showSuccess(regId, data);
      form.reset();
    } catch(err){
      console.error(err);
      formMsg.textContent = 'Something went wrong submitting your registration. Please try again.';
      formMsg.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Registration';
    }
  });

  function showSuccess(regId, data){
    form.style.display = 'none';
    progressFill.style.width = '100%';
    successPanel.classList.add('show');
    document.getElementById('regIdDisplay').textContent = regId;

    const qrPayload = encodeURIComponent(`${regId} | ${data.fullName} | ${data.role}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${qrPayload}`;
    document.getElementById('qrImage').src = qrUrl;

    successPanel.scrollIntoView({ behavior:'smooth', block:'start' });
  }
});
