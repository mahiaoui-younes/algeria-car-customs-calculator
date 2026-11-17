/* ==========================================================
   حاسبة جمركة السيارات - الجزائر
   كل النسب في CONFIG أدناه: عدّلها هنا عند صدور قانون مالية جديد.
   ========================================================== */
const CONFIG = {
  // أسعار صرف احتياطية (تُستعمل إذا فشل التحديث التلقائي)
  officialRate: { EUR: 154, USD: 130 },   // سعر البنك (تُحسب به الجمركة)
  parallelRate: { EUR: 255, USD: 225 },   // سعر السوق الموازية (السكوار)

  ccThreshold: 1500,      // حد سعة المحرك لتغيير نسبة الحقوق الجمركية
  ddSmall: 15,            // الحقوق الجمركية % (سياحية بنزين/هجين ≤ الحد)
  ddLarge: 30,            // الحقوق الجمركية % (سياحية بنزين/هجين > الحد)
  ddElectric: 30,         // الحقوق الجمركية % (سياحية كهربائية)
  ddUtility: 5,           // الحقوق الجمركية % (نفعية)
  tcs: 2,                 // رسم التضامن %
  tva: 19,                // الرسم على القيمة المضافة %

  // تخفيضات المادة 110 من قانون المالية 2020 (المرسوم التنفيذي 23-74)
  reductionCc: 1800,
  reductionElectric: 80,
  reductionSmall: 50,     // بنزين/هجين ≤ 1800 سم³
  reductionLarge: 20,     // بنزين/هجين > 1800 سم³

  maxAgeMonths: 36,
};

/* ----------------------------------------------------------
   أمثلة السيارات الشائعة (الأسعار تقريبية - عدّلها متى شئت)
   region: china | europe   ·   price/shipping بعملة cur
   ---------------------------------------------------------- */
const EXAMPLES = [
  { name: 'Geely Coolray 1.5T', ar: 'جيلي كولراي', brand: 'GEELY', color: '#1f4e9c', fuel: 'petrol', cc: 1477, cur: 'USD', price: 14500, shipping: 1800, region: 'china', origin: 'الصين / دبي' },
  { name: 'Kia KX1 1.4', ar: 'كيا KX1', brand: 'KIA', color: '#05141f', fuel: 'petrol', cc: 1368, cur: 'USD', price: 11000, shipping: 1800, region: 'china', origin: 'الصين' },
  { name: 'MG ZS 1.5', ar: 'إم جي ZS', brand: 'MG', color: '#a3162b', fuel: 'petrol', cc: 1498, cur: 'USD', price: 13000, shipping: 1800, region: 'china', origin: 'الصين / دبي' },
  { name: 'MG 5 1.5', ar: 'إم جي 5', brand: 'MG', color: '#a3162b', fuel: 'petrol', cc: 1498, cur: 'USD', price: 11500, shipping: 1800, region: 'china', origin: 'الصين / دبي' },
  { name: 'Livan X3 Pro 1.5', ar: 'ليفان X3 برو', brand: 'LIVAN', color: '#0b6e69', fuel: 'petrol', cc: 1498, cur: 'USD', price: 9500, shipping: 1800, region: 'china', origin: 'الصين' },
  { name: 'Chery Tiggo 4 Pro 1.5', ar: 'شيري تيغو 4 برو', brand: 'CHERY', color: '#8f1022', fuel: 'petrol', cc: 1498, cur: 'USD', price: 12000, shipping: 1800, region: 'china', origin: 'الصين / دبي' },
  { name: 'Volkswagen Golf 8 1.5 TSI', ar: 'فولكسفاغن غولف 8', brand: 'VW', color: '#001e50', fuel: 'petrol', cc: 1498, cur: 'EUR', price: 22000, shipping: 800, region: 'europe', origin: 'ألمانيا / فرنسا' },
  { name: 'Dacia Sandero Stepway 1.0 TCe', ar: 'داسيا ستيبواي', brand: 'DACIA', color: '#4d5a3a', fuel: 'petrol', cc: 999, cur: 'EUR', price: 16000, shipping: 800, region: 'europe', origin: 'فرنسا / إسبانيا' },
  { name: 'Peugeot 208 1.2 PureTech', ar: 'بيجو 208', brand: 'PEUGEOT', color: '#1d1d1f', fuel: 'petrol', cc: 1199, cur: 'EUR', price: 17000, shipping: 800, region: 'europe', origin: 'فرنسا' },
  { name: 'Toyota Yaris Cross Hybrid', ar: 'تويوتا ياريس كروس هجين', brand: 'TOYOTA', color: '#b5091a', fuel: 'hybrid', cc: 1490, cur: 'EUR', price: 25000, shipping: 800, region: 'europe', origin: 'فرنسا / بلجيكا' },
  { name: 'Hyundai Tucson 1.6 Hybrid', ar: 'هيونداي توسان هجين', brand: 'HYUNDAI', color: '#002c5f', fuel: 'hybrid', cc: 1598, cur: 'EUR', price: 32000, shipping: 800, region: 'europe', origin: 'ألمانيا / بلجيكا' },
  { name: 'BYD Dolphin', ar: 'بي واي دي دولفين', brand: 'BYD', color: '#3b4a5c', fuel: 'electric', cc: 0, cur: 'USD', price: 15000, shipping: 1800, region: 'china', origin: 'الصين / دبي' },
];

const FUEL = {
  petrol: { label: 'بنزين', icon: 'i-gas' },
  hybrid: { label: 'هجين', icon: 'i-leaf' },
  electric: { label: 'كهربائية', icon: 'i-bolt' },
  diesel: { label: 'ديزل', icon: 'i-drop' },
};

const $ = (id) => document.getElementById(id);
const form = () => $('calcForm');
const nf = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 2 });
const fmtDA = (v) => nf.format(Math.round(v)) + ' دج';
const millions = (v) => v / 10000;
const fmtM = (v) => nf2.format(Math.round(millions(v) * 10) / 10);
const icon = (id) => '<svg class="i"><use href="#' + id + '"/></svg>';

const num = (id) => {
  const v = parseFloat(String($(id).value).replace(',', '.').replace(/\s/g, ''));
  return isFinite(v) && v >= 0 ? v : 0;
};
const radio = (name) => (form().querySelector('input[name="' + name + '"]:checked') || {}).value;
const setRadio = (name, value) => {
  const el = form().querySelector('input[name="' + name + '"][value="' + value + '"]');
  if (el) el.checked = true;
};

let fetchedRates = null;

/* ---------- الإعدادات المتقدمة ---------- */
const ADV_FIELDS = [
  'ddSmall', 'ddLarge', 'ccThreshold', 'ddElectric', 'ddUtility', 'tcs', 'tva',
  'reductionElectric', 'reductionSmall', 'reductionLarge', 'reductionCc',
];

function fillAdvanced() {
  ADV_FIELDS.forEach((k) => { $('adv_' + k).value = CONFIG[k]; });
}

function readAdvanced() {
  const c = { ...CONFIG };
  ADV_FIELDS.forEach((k) => {
    const v = parseFloat($('adv_' + k).value);
    if (isFinite(v) && v >= 0) c[k] = v;
  });
  return c;
}

/* ---------- أسعار الصرف ---------- */
const officialFor = (cur) => (fetchedRates ? fetchedRates[cur] : CONFIG.officialRate[cur]);

function applyRates() {
  const cur = radio('currency');
  $('officialRate').value = Number(officialFor(cur)).toFixed(2);
  $('parallelRate').value = CONFIG.parallelRate[cur];
  document.querySelectorAll('.cur-label').forEach((el) => { el.textContent = cur === 'EUR' ? '€' : '$'; });
}

async function loadRates() {
  const status = $('rateStatus');
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', { signal: ctrl.signal });
    clearTimeout(t);
    const data = await res.json();
    const dzd = data && data.rates && data.rates.DZD;
    const usd = data && data.rates && data.rates.USD;
    if (!dzd || !usd) throw new Error('no rate');
    fetchedRates = { EUR: dzd, USD: dzd / usd };
    status.textContent = 'محدّث اليوم';
  } catch (e) {
    status.textContent = 'تقريبي';
  }
  applyRates();
  calculate();
  renderExamples();
}

/* ---------- الحساب (دالة واحدة للحاسبة والأمثلة) ---------- */
function computeTaxes({ type, fuel, cc, cifForeign, official }, C) {
  const customsValue = cifForeign * official;

  let ddRate;
  if (type === 'utility') ddRate = C.ddUtility;
  else if (fuel === 'electric') ddRate = C.ddElectric;
  else ddRate = cc > C.ccThreshold ? C.ddLarge : C.ddSmall;

  const reduction = fuel === 'electric'
    ? C.reductionElectric
    : (cc > C.reductionCc ? C.reductionLarge : C.reductionSmall);

  const dd = customsValue * ddRate / 100;
  const tcs = customsValue * C.tcs / 100;
  const tva = (customsValue + dd + tcs) * C.tva / 100;
  const gross = dd + tcs + tva;
  const keep = 1 - reduction / 100;

  return { customsValue, ddRate, reduction, dd, tcs, tva, gross, keep, taxes: gross * keep };
}

/* عدّاد متحرك للرقم الكبير */
let animFrame = null;
let shownValue = 0;
function animateTo(el, target) {
  cancelAnimationFrame(animFrame);
  const from = shownValue;
  const start = performance.now();
  const dur = 450;
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    shownValue = from + (target - from) * e;
    el.textContent = fmtM(shownValue);
    if (p < 1) animFrame = requestAnimationFrame(step);
  };
  animFrame = requestAnimationFrame(step);
}

let hasResult = false;

function showAlerts(list) {
  $('warnings').innerHTML = list.map((a) =>
    '<div class="alert ' + a.kind + '">' + icon(a.kind === 'danger' ? 'i-ban' : 'i-alert') + '<span>' + a.text + '</span></div>'
  ).join('');
}

function setHasResult(v) {
  hasResult = v;
  $('emptyState').hidden = v;
  $('resultContent').hidden = !v;
  updateMobileBar();
}

function calculate() {
  const C = readAdvanced();
  const type = radio('vehicleType');
  const fuel = radio('fuel');
  const cc = num('cc');
  const price = num('price');
  const shipping = num('shipping');
  const insurance = num('insurance');
  const removeVat = $('removeVat').checked;
  const foreignVat = num('foreignVat');
  const official = num('officialRate');
  const parallel = num('parallelRate');
  const otherFees = num('otherFees');
  const cur = radio('currency') === 'EUR' ? '€' : '$';

  $('vatRow').hidden = !removeVat;
  $('ccRow').hidden = fuel === 'electric';

  const alerts = [];

  const reg = $('firstReg').value;
  if (reg) {
    const [y, m] = reg.split('-').map(Number);
    const now = new Date();
    const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
    if (months > C.maxAgeMonths) {
      alerts.push({ kind: 'warn', text: 'عمر السيارة ' + months + ' شهراً، أي أكثر من 3 سنوات: لا يُسمح بجمركتها في إطار المادة 110.' });
    }
  }

  if (fuel === 'diesel') {
    alerts.unshift({ kind: 'danger', text: 'السيارات المستعملة بمحرك ديزل (مازوت) غير مسموح باستيرادها للأفراد. اختر بنزين أو هجين أو كهربائية.' });
    showAlerts(alerts);
    setHasResult(false);
    return;
  }

  if (fuel !== 'electric' && price && !cc) {
    alerts.push({ kind: 'warn', text: 'أدخل سعة المحرك (سم³) للحصول على نسبة دقيقة.' });
  }
  showAlerts(alerts);

  if (!price || !official) { setHasResult(false); return; }

  const priceNet = removeVat && foreignVat > 0 ? price / (1 + foreignVat / 100) : price;
  const cifForeign = priceNet + shipping + insurance;
  const r = computeTaxes({ type, fuel, cc, cifForeign, official }, C);

  const purchaseRate = parallel || official;
  const purchaseDZD = cifForeign * purchaseRate;
  const total = purchaseDZD + r.taxes + otherFees;

  setHasResult(true);
  animateTo($('r_taxes_m'), r.taxes);
  $('r_taxes').textContent = fmtDA(r.taxes);
  $('r_total_m').textContent = fmtM(total) + ' مليون';
  $('r_total').textContent = fmtDA(total);
  $('r_effective').textContent = nf2.format(r.customsValue ? r.taxes / r.customsValue * 100 : 0) + '%';
  $('mb_value').textContent = fmtM(r.taxes) + ' مليون سنتيم';

  // شريط التوزيع
  const parts = [
    ['c-car', purchaseDZD], ['c-dd', r.dd * r.keep], ['c-tcs', r.tcs * r.keep],
    ['c-tva', r.tva * r.keep], ['c-fees', otherFees],
  ];
  $('r_bar').innerHTML = parts.map((p) => '<i class="' + p[0] + '" style="width:' + (total ? p[1] / total * 100 : 0) + '%"></i>').join('');

  const rows = [
    ['القيمة الجمركية CIF', nf2.format(cifForeign) + ' ' + cur],
    ['بالدينار (سعر البنك ' + nf2.format(official) + ')', fmtDA(r.customsValue)],
    ['الحقوق الجمركية (' + r.ddRate + '%)', fmtDA(r.dd)],
    ['رسم التضامن (' + C.tcs + '%)', fmtDA(r.tcs)],
    ['TVA (' + C.tva + '%)', fmtDA(r.tva)],
    ['تخفيض المادة 110 (' + r.reduction + '%)', '− ' + fmtDA(r.gross - r.taxes), 'minus'],
    ['الرسوم الجمركية', fmtDA(r.taxes), 'strong'],
    ['ثمن الشراء (سعر السوق ' + nf2.format(purchaseRate) + ')', fmtDA(purchaseDZD)],
    ['مصاريف أخرى', fmtDA(otherFees)],
    ['التكلفة الإجمالية', fmtDA(total), 'strong'],
  ];
  $('r_table').innerHTML = rows.map((row) =>
    '<tr' + (row[2] ? ' class="' + row[2] + '"' : '') + '><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>'
  ).join('');

  window.__shareText =
    'حساب جمركة سيارتي 🚗\n' +
    'السعر: ' + nf2.format(price) + ' ' + cur + ' | ' + FUEL[fuel].label + (cc && fuel !== 'electric' ? ' ' + cc + ' سم³' : '') + '\n' +
    'الجمركة: ' + fmtM(r.taxes) + ' مليون سنتيم\n' +
    'التكلفة الإجمالية: ' + fmtM(total) + ' مليون سنتيم\n' +
    'احسب جمركة سيارتك مجاناً: ' + location.origin + '/';
}

/* ---------- الأمثلة ---------- */
let exFilter = 'all';

function renderExamples() {
  const C = readAdvanced();
  const grid = $('exGrid');
  grid.innerHTML = EXAMPLES.map((ex, i) => {
    const show = exFilter === 'all' || ex.region === exFilter || (exFilter === 'green' && ex.fuel !== 'petrol');
    if (!show) return '';
    const sym = ex.cur === 'EUR' ? '€' : '$';
    const official = officialFor(ex.cur);
    const r = computeTaxes({ type: 'tourism', fuel: ex.fuel, cc: ex.cc, cifForeign: ex.price + ex.shipping, official }, C);
    const f = FUEL[ex.fuel];
    return (
      '<article class="ex">' +
        '<div class="ex-top">' +
          '<div class="brand' + (ex.brand.length > 5 ? ' xl' : ex.brand.length > 3 ? ' lg' : '') + '" style="background:' + ex.color + '">' + ex.brand + '</div>' +
          '<div><h3>' + ex.name + '</h3><div class="meta">' + ex.ar + ' · ' + ex.origin + '</div></div>' +
        '</div>' +
        '<div class="tags">' +
          '<span class="tag ' + ex.fuel + '">' + icon(f.icon) + f.label + '</span>' +
          (ex.cc ? '<span class="tag">' + nf.format(ex.cc) + ' سم³</span>' : '') +
          '<span class="tag">DD ' + r.ddRate + '% · تخفيض ' + r.reduction + '%</span>' +
        '</div>' +
        '<div class="ex-nums">' +
          '<div><span>السعر التقريبي</span><strong>' + nf.format(ex.price) + ' ' + sym + '</strong></div>' +
          '<div class="hl"><span>الجمركة ≈</span><strong>' + fmtM(r.taxes) + ' مليون</strong></div>' +
        '</div>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-ex="' + i + '">' + icon('i-calc') + 'احسب بهذه السيارة</button>' +
      '</article>'
    );
  }).join('');
}

function loadExample(i) {
  const ex = EXAMPLES[i];
  setRadio('vehicleType', 'tourism');
  setRadio('fuel', ex.fuel);
  setRadio('currency', ex.cur);
  $('cc').value = ex.cc || '';
  $('price').value = ex.price;
  $('shipping').value = ex.shipping;
  $('insurance').value = '';
  $('removeVat').checked = false;
  $('firstReg').value = '';
  applyRates();
  calculate();
  $('calc').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => $('price').focus({ preventScroll: true }), 600);
}

/* ---------- شريط الهاتف ---------- */
let resultInView = false;
function updateMobileBar() {
  $('mobileBar').classList.toggle('show', hasResult && !resultInView);
}

/* ---------- مشاركة ---------- */
function shareWhatsApp() {
  if (!window.__shareText) return;
  window.open('https://wa.me/?text=' + encodeURIComponent(window.__shareText), '_blank', 'noopener');
}

function shareFacebook() {
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.origin + '/'), '_blank', 'noopener');
}

async function copyResult() {
  if (!window.__shareText) return;
  const label = $('copyBtn').querySelector('span');
  try {
    await navigator.clipboard.writeText(window.__shareText);
    label.textContent = 'تم النسخ ✓';
  } catch (e) {
    label.textContent = 'تعذّر النسخ';
  }
  setTimeout(() => { label.textContent = 'نسخ النتيجة'; }, 2000);
}

/* ---------- تشغيل ---------- */
document.addEventListener('DOMContentLoaded', () => {
  fillAdvanced();
  applyRates();
  renderExamples();

  const f = form();
  f.addEventListener('input', (e) => {
    if (e.target.id && e.target.id.startsWith('adv_')) renderExamples();
    calculate();
  });
  f.addEventListener('change', (e) => {
    if (e.target.name === 'currency') applyRates();
    calculate();
  });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('resetAdv').addEventListener('click', () => { fillAdvanced(); calculate(); renderExamples(); });
  $('waBtn').addEventListener('click', shareWhatsApp);
  $('fbBtn').addEventListener('click', shareFacebook);
  $('copyBtn').addEventListener('click', copyResult);

  $('exGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ex]');
    if (b) loadExample(Number(b.dataset.ex));
  });
  $('exFilters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    exFilter = b.dataset.f;
    document.querySelectorAll('#exFilters .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderExamples();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      resultInView = entries[0].isIntersecting;
      updateMobileBar();
    }, { threshold: 0.15 }).observe($('result'));
  }

  $('year').textContent = new Date().getFullYear();
  loadRates();
});
