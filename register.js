/* ROAR Registration — form logic */

/* =========================================================
   1. SET THIS to your deployed Google Apps Script Web App URL
      (Deploy > New deployment > Web app > Execute as: Me,
      Who has access: Anyone). See Code.gs for the backend.
   ========================================================= */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxstr-Jf851GQ_UhNFFA5WP8fyK6jUg9eglF9UHYGG58HxYrWnQWANp7QOCbUMhXC3B/exec";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('regForm');
  const progressFill = document.getElementById('progressFill');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');
  const successPanel = document.getElementById('success-panel');
  const processAgreeCheckbox = document.getElementById('processAgreeCheckbox');
  const registrationFormArea = document.getElementById('registrationFormArea');

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

  const toggleRegistrationAccess = () => {
    if (!registrationFormArea || !processAgreeCheckbox) return;
    const ready = processAgreeCheckbox.checked;
    registrationFormArea.classList.toggle('active', ready);
    registrationFormArea.setAttribute('aria-hidden', ready ? 'false' : 'true');
  };

  if (processAgreeCheckbox) {
    processAgreeCheckbox.addEventListener('change', toggleRegistrationAccess);
    toggleRegistrationAccess();
  }

  /* =========================================================
     Section 2 → Section 3 / 4 conditional logic
     ========================================================= */
  const categoryInputs = document.querySelectorAll('input[name="category"]');
  const prefectSection = document.getElementById('prefectInfoSection');
  const gradeField = document.getElementById('gradeField');
  const batchInput = document.getElementById('batchInput');
  const positionField = document.getElementById('positionField');
  const campAccessBox = document.getElementById('campAccessBox');
  const campAccessInput = document.getElementById('campAccessInput');
  const campAccessLabel = document.getElementById('campAccessLabel');
  const campAccessSub = document.getElementById('campAccessSub');

  const applyCategoryRules = (category) => {
    document.getElementById('categoryErr').style.display = 'none';

    const isPrefect = category === 'Prefect';
    const isOldPrefect = category === 'Old Prefect (Alumni)';
    const isInvited = category === 'Invited School Prefect';

    // Section 4 (Prefect Information) shows only for Prefect / Old Prefect
    const showPrefectSection = isPrefect || isOldPrefect;
    prefectSection.classList.toggle('active', showPrefectSection);
    batchInput.required = showPrefectSection;

    // Grade: "Students only" → hide for Old Prefect (alumni, not currently a student)
    gradeField.style.display = isOldPrefect ? 'none' : 'block';

    // Current Position: optional, only relevant for Old Prefects
    positionField.style.display = isOldPrefect ? 'block' : 'none';

    // Prefect Camp Access behaviour
    if (isPrefect) {
      campAccessInput.checked = true;
      campAccessInput.disabled = true;
      campAccessBox.classList.add('locked');
      campAccessLabel.textContent = 'Prefect Camp Access — Yes';
      campAccessSub.textContent = 'Automatically marked Yes for current Prefects.';
    } else if (isOldPrefect) {
      campAccessInput.disabled = false;
      campAccessBox.classList.remove('locked');
      campAccessLabel.textContent = 'Request Prefect Camp Access';
      campAccessSub.textContent = 'Old Prefects can have this enabled only if the organizers choose.';
    }
  };

  categoryInputs.forEach(input => {
    input.addEventListener('change', () => applyCategoryRules(input.value));
  });

  /* =========================================================
     Section 6 — Photo upload: validate + preview
     ========================================================= */
  const photoInput = document.getElementById('passportPhotoInput');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const photoPreviewBox = document.getElementById('photoPreviewBox');
  const photoFileName = document.getElementById('photoFileName');
  const photoError = document.getElementById('photoError');
  const photoUploadBtnLabel = document.getElementById('photoUploadBtnLabel');
  const photoRequiredErr = document.getElementById('photoRequiredErr');

  let photoDataUrl = '';
  let photoValid = false;

  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    photoError.classList.remove('show');
    photoRequiredErr.style.display = 'none';
    photoValid = false;
    photoDataUrl = '';

    if (!file) return;

    const isRightType = file.type === 'image/jpeg' || file.type === 'image/png';
    const isRightSize = file.size <= MAX_PHOTO_BYTES;

    if (!isRightType || !isRightSize) {
      photoError.classList.add('show');
      photoInput.value = '';
      photoFileName.textContent = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      photoDataUrl = ev.target.result;
      photoValid = true;
      photoPreviewImg.src = photoDataUrl;
      photoPreviewImg.style.display = 'block';
      const placeholder = photoPreviewBox.querySelector('.pp-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      photoFileName.textContent = file.name;
      photoUploadBtnLabel.textContent = 'Change Photo';
    };
    reader.readAsDataURL(file);
  });

  /* =========================================================
     Validation
     ========================================================= */
  const setInvalid = (field, invalid) => field.classList.toggle('invalid', invalid);

  const validate = () => {
    let ok = true;

    form.querySelectorAll('.field').forEach(field => {
      // skip validation for hidden conditional fields
      if (field.offsetParent === null) return;
      const input = field.querySelector('input[required], select[required]');
      if (!input) return;
      let fieldOk = true;
      if (input.type === 'email') {
        fieldOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else if (input.type === 'tel') {
        fieldOk = /^[0-9+\s-]{7,15}$/.test(input.value.trim());
      } else {
        fieldOk = input.value.trim().length > 0;
      }
      setInvalid(field, !fieldOk);
      if (!fieldOk) ok = false;
    });

    if (processAgreeCheckbox && !processAgreeCheckbox.checked) {
      formMsg.textContent = 'Please read the registration process and agree to continue before filling the form.';
      formMsg.classList.add('error');
      processAgreeCheckbox.closest('.process-check-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    /* category */
    const categoryChecked = form.querySelector('input[name="category"]:checked');
    document.getElementById('categoryErr').style.display = categoryChecked ? 'none' : 'block';
    if (!categoryChecked) ok = false;

    /* photo (required) */
    if (!photoValid) {
      photoRequiredErr.style.display = 'block';
      ok = false;
    }

    /* consent */
    const accurate = form.querySelector('input[name="confirmAccurate"]');
    const agree = form.querySelector('input[name="agreeRules"]');
    const consentOk = accurate.checked && agree.checked;
    document.getElementById('consentErr').style.display = consentOk ? 'none' : 'block';
    if (!consentOk) ok = false;

    return ok;
  };

  const fallbackRegId = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return 'ROAR-2026-' + rand;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    formMsg.className = 'form-msg';

    if (!validate()) {
      formMsg.textContent = 'Please complete all required fields correctly.';
      formMsg.classList.add('error');
      const firstInvalid = form.querySelector('.field.invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    // FormData duplicates the file input under "photo" as a File object — replace with base64
    delete data.photo;
    data.photoBase64 = photoDataUrl ? photoDataUrl.split(',')[1] : '';
    data.photoMime = photoInput.files[0] ? photoInput.files[0].type : '';
    data.photoName = photoInput.files[0] ? photoInput.files[0].name : '';
    data.campAccess = campAccessInput.checked;
    data.timestamp = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';

    let regId = fallbackRegId();

    try {
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PASTE_')) {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
          body: JSON.stringify(data)
        });
        try {
          const json = await res.json();
          if (json && json.regId) regId = json.regId;
        } catch (parseErr) {
          console.warn('Could not parse Apps Script response, using local fallback ID.');
        }
      } else {
        console.warn('APPS_SCRIPT_URL not set — skipping backend submission (demo mode).');
      }

      showSuccess(regId, data);
      form.reset();
    } catch (err) {
      console.error(err);
      formMsg.textContent = 'Something went wrong submitting your registration. Please try again.';
      formMsg.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Registration';
    }
  });

  function showSuccess(regId, data) {
    form.style.display = 'none';
    progressFill.style.width = '100%';
    successPanel.classList.add('show');
    document.getElementById('regIdDisplay').textContent = regId;
    document.getElementById('successCategory').textContent = (data.category || '').toUpperCase();
    document.getElementById('successName').textContent = data.preferredName || data.fullName || 'Guest';

    const qrPayload = encodeURIComponent(`${regId} | ${data.fullName} | ${data.category}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${qrPayload}`;
    document.getElementById('qrImage').src = qrUrl;

    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
