document.addEventListener('contextmenu', e => e.preventDefault());
function getTodayInterest() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('jh_today_interest');
  const storedDate = localStorage.getItem('jh_today_date');

  if (stored && storedDate === today) {
    return parseFloat(stored);
  }

  const dateStr = today;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rate = +(30 + (Math.abs(hash) % 500) / 100).toFixed(2);

  localStorage.setItem('jh_today_interest', rate);
  localStorage.setItem('jh_today_date', today);
  return rate;
}

const todayInterest = getTodayInterest();

function getFixedBars() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('jh_today_bars');
  const storedDate = localStorage.getItem('jh_today_date');

  if (stored && storedDate === today) {
    return JSON.parse(stored);
  }

  const bars = [];
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);

  for (let i = 0; i < 10; i++) {
    seed = (seed * 16807 + 7) % 2147483647;
    const variation = ((seed % 400) / 100) - 2;
    bars.push(+(Math.max(30, Math.min(35, todayInterest + variation)).toFixed(2)));
  }
  bars[9] = todayInterest;

  localStorage.setItem('jh_today_bars', JSON.stringify(bars));
  return bars;
}

function getEffectiveInterest() {
  if (currentUser && users[currentUser]) {
    const fixed = users[currentUser].fixedInterest;
    // Only use fixed rate if it exists AND is greater than 0
    if (fixed != null && fixed > 0) {
      return fixed;
    }
  }
  return todayInterest;
}

// ========== Date helpers (DD-MM-YYYY) ==========
function parseDate(str) {
  const parts = str.split('-');
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}

function daysBetween(d1, d2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / oneDay);
}

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ========== Status calculation ==========
// Overdue fee is ONLY applied AFTER the return date is crossed
function computeLoanStatus(loan) {
  const today = getTodayDate();
  const returnDate = parseDate(loan.return);
  const diff = daysBetween(returnDate, today); // positive = days after return date

  let overdueFee = 0;
  let status = 'Active';
  let daysInfo = '';

  if (diff > 0) {
    // Return date has been crossed → now apply the static overdue fee
    overdueFee = (loan.overdueFee != null) ? loan.overdueFee : (diff * 25);
    status = 'Overdue';
    daysInfo = diff + ' day(s) overdue';
  } else if (diff === 0) {
    // Due today
    status = 'Due Today';
    daysInfo = 'Due today';
  } else {
    // Still time left
    status = 'Active';
    daysInfo = Math.abs(diff);
  }

  return { overdueFee, status, daysInfo, daysDiff: diff };
}
// ========== THEME SYSTEM ==========
function openThemeModal() {
  const customSec = document.getElementById('custom-theme-section');
  if (currentUser && users[currentUser] && users[currentUser].customui === 'yes') {
    customSec.classList.remove('hidden');
  } else {
    customSec.classList.add('hidden');
  }
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-theme') === current);
  });
  const savedColor = localStorage.getItem('jh_custom_color');
  document.querySelectorAll('.custom-color-btn').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-color') === savedColor);
  });
  if (savedColor) {
    document.getElementById('custom-color-picker').value = savedColor;
  }
  document.getElementById('theme-modal').classList.add('show');
}

function closeThemeModal() {
  document.getElementById('theme-modal').classList.remove('show');
}

function selectTheme(themeName) {
  if (themeName !== 'custom') {
    localStorage.removeItem('jh_custom_color');
  }
  applyTheme(themeName);
  closeThemeModal();
}

function selectCustomColor(hex) {
  if (!currentUser || !users[currentUser] || users[currentUser].customui !== 'yes') {
    alert('Custom themes are only available for users with custom UI access.');
    return;
  }
  localStorage.setItem('jh_custom_color', hex);
  applyTheme('custom', hex);
  document.querySelectorAll('.custom-color-btn').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-color') === hex);
  });
  document.getElementById('custom-color-picker').value = hex;
  closeThemeModal();
}

function applyTheme(themeName, customColor) {
  const html = document.documentElement;
  html.setAttribute('data-theme', themeName);

  if (themeName === 'custom') {
    const color = customColor || localStorage.getItem('jh_custom_color') || '#002aff';
    html.style.setProperty('--dark-blue', color);
    html.style.setProperty('--text-title', color);
  } else {
    html.style.removeProperty('--dark-blue');
    html.style.removeProperty('--text-title');
  }

  localStorage.setItem('jh_theme', themeName);
  if (themeName === 'custom' && customColor) {
    localStorage.setItem('jh_custom_color', customColor);
  }

  const labels = {
    light: '',
    dark: '',
    telegram: '',
    custom: ''
  };
  // document.getElementById('theme-btn').textContent = 'Themes (' + (labels[themeName] || themeName) + ')';

  drawBarGraph();
}

function enforceCustomUIAccess() {
  const hasCustom = currentUser && users[currentUser] && users[currentUser].customui === 'yes';
  const storedTheme = localStorage.getItem('jh_theme');

  if (!hasCustom && storedTheme === 'custom') {
    localStorage.removeItem('jh_theme');
    localStorage.removeItem('jh_custom_color');
    applyTheme('dark');
  }
}

// ========== Take Money ==========
function verifyTakeMoneyPassword() {
  const pass = document.getElementById('tm-password').value;
  if (pass !== '') {
    alert('');
    return;
  }
  document.getElementById('tm-password-step').classList.add('hidden');
  document.getElementById('tm-amount-step').classList.remove('hidden');

  const rate = getEffectiveInterest();
  const isFixed = currentUser && users[currentUser] && users[currentUser].fixedInterest != null;
  document.getElementById('tm-today-rate').textContent = rate + '%' + (isFixed ? ' (Your Fixed Rate)' : ' (Today\'s Rate)');
}

function calculateTakeMoneyInterest() {
  const amount = parseFloat(document.getElementById('tm-amount').value);
  if (!amount || amount < 100) {
    alert('Enter amount (minimum 100)');
    return;
  }
  const rate = getEffectiveInterest();
  const interestAmount = amount * (rate / 100);
  const total = amount + interestAmount;

  document.getElementById('tm-res-amount').textContent = amount.toLocaleString();
  document.getElementById('tm-res-interest').textContent = rate + '%  →  ' + interestAmount.toFixed(2);
  document.getElementById('tm-res-total').textContent = total.toFixed(2);
  document.getElementById('tm-result').classList.remove('hidden');
}

function applyTakeMoney() {
  const amount = document.getElementById('tm-amount').value;
  const rate = getEffectiveInterest();

  openServiceForm("Take Money");

  document.getElementById('apply-msg').innerHTML = 
    `You have applied for <strong>Take Money</strong><br>
     Amount: ${Number(amount).toLocaleString()}<br>
     Interest Rate: ${rate}%<br>
     The application form has been opened in a new tab.`;
  document.getElementById('apply-modal').classList.add('show');
}

const formLinks = {
  "Delay It":       "https://forms.gle/cAz9REnqvGtcEhcT7",
  "Split Pay":      "https://forms.gle/7rj2DSnZTQg5TX468",
  "Buy Limit":      "https://forms.gle/UjVvfCS6D6UoxyQW8",
  "Pre-Saver":      "https://forms.gle/3Z6eqPk6SmEDYZCu8",
  "Lendlink-Mid":   "https://forms.gle/Yj9vDP3NPv9pMTAo9",
  "BotPay":         "https://mfi0212.github.io/MFI/BsRora/payment.bot",
  "BsRora-Atdo":    "https://mfi0212.github.io/MFI/BsRora/bsrora.atdo",
  "Mining bot":     "https://mfi0212.github.io/MFI/BsRora/miningbot",
  "Tomar Juntos":   "https://mfi0212.github.io/MFI/multi.mem.acc",
  "Take Money":     "https://forms.gle/nLBmBgt2QEeYuaNa9",
};

function openServiceForm(serviceName) {
  const url = formLinks[serviceName];
  if (url) {
    window.open(url, "_self");
  }
}

function applyProduct(name) {
  openServiceForm(name);

  // No popup for direct bot/service pages
  const noPopup = ["BotPay", "BsRora-Atdo", "Mining bot"];
  if (noPopup.includes(name)) {
    return;
  }

  document.getElementById('apply-msg').innerHTML = 
    `You have successfully applied for <strong>${name}</strong>.<br>
     ${formLinks[name] ? "The application form has been opened in a new tab." : "Our team will contact you shortly."}`;
  document.getElementById('apply-modal').classList.add('show');
}

// ========== USERS ==========
const users = {
  "Mahesh Muthinti": {
    password: "Mahesh888*",
    displayName: "Mahesh Muthinti",
    premiumType: "Premium+",
    fixedInterest: 0,
    customui: "yes",

    // NEW system (replaced old special)
    showCustomContent: "no",
    customContent: {
      type: "image",
      value: "programXoffer.png",
      url: "https://mfi0212.github.io/swan/offer/solution"
    },
    showSpecialNotice: "yes",
    specialNoticeText: "Mr.<strong>Mahesh Muthinti</strong>, your BotPay bot will handle everything for you, including applying and paying your fees. The fees will be added directly to your amount. Simply and easily.",

    loans: [
      { amount: 960,  interest: 250,  borrowed: "15-08-2026", return: "30-08-2026", overdueFee: 0 },
      { amount: 29418,interest: 7355, borrowed: "11-05-2026", return: "10-09-2026", overdueFee: 0 },
      { amount: 15000,interest: 4500, borrowed: "15-08-2026", return: "15-09-2026", overdueFee: 0 },
      { amount: 3475, interest: 1407, borrowed: "21-07-2026", return: "20-09-2026", overdueFee: 0 },
      { amount: 2990, interest: 1170, borrowed: "24-07-2026", return: "23-09-2026", overdueFee: 0 },
      { amount: 3940, interest: 1280,  borrowed: "28-07-2026", return: "28-09-2026", overdueFee: 25 },
    ],
    access: {
      "Delay It": true,
      "Split Pay": false,
      "Buy Limit": false,
      "Pre-Saver": true,
      "Lendlink-Mid": false,
      "Mining bot": false,
      "BotPay": true,
      "Tomar Juntos": true,
      "BsRora-Atdo": false,
    }
  },
};

let currentUser = null;
let pendingFeeService = null;
let pendingFeeAmount = 0;
let pendingFeeValue = 0;

const allProducts = [
  { name: "Delay It",      icon: "⏳", desc: "Extend repayment date", needsFee: true,  feeRate: 0.065, feeLabel: "Pay dee to continue" },
  { name: "Split Pay",     icon: "📅", desc: "Split payment into smaller amounts", needsFee: true,  feeRate: 0.075, feeLabel: "Pay fee to continue" },
  { name: "Buy Limit",     icon: "📈", desc: "Increase your borrowing limit", needsFee: true,  feeRate: 0.08, feeLabel: "Pay fee to continue" },
  { name: "Pre-Saver",     icon: "💰", desc: "Save first, enjoy better rates", needsFee: false },
  { name: "Mining bot",    icon: "⛏️", desc: "Automated mining bot", needsFee: false },
  { name: "BotPay",        icon: "💳", desc: "Fast payment solution", needsFee: false },
  { name: "BsRora-Atdo",   icon: "⚡", desc: "Advanced automated system", needsFee: false },
  { name: "Tomar Juntos",   icon: "🧑‍🤝‍🧑", desc: "Borrow combine", needsFee: false }
];

function renderProducts() {
  const container = document.getElementById('products-container');

  if (!currentUser) {
    container.innerHTML = `
      <div class="login-required">
        <h3>🔒 Login Required</h3>
        <p>Login to your account to view the services you have access to.</p>
        <button class="btn" style="margin-top:16px;" onclick="showLogin()">Go to Login</button>
      </div>
    `;
    return;
  }

  const user = users[currentUser];
  const accessible = allProducts.filter(p => user.access[p.name] === true);

  if (accessible.length === 0) {
    container.innerHTML = `<div class="login-required"><p>You currently have no services available.</p></div>`;
    return;
  }

  let html = `<p style="margin-bottom:14px;color:var(--text-muted);">
    Showing <strong>${accessible.length}</strong> service(s) available for <strong>${user.displayName}</strong>
  </p>
  <div class="product-grid">`;

  accessible.forEach(p => {
    html += `
      <div class="product-card">
        <div class="icon">${p.icon}</div>
        <div class="access-badge access-yes">✓ Access Granted</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <button class="btn" onclick="handleProductClick('${p.name}')">Apply</button>
      </div>
    `;
  });

  html += `</div>`;

  const locked = allProducts.filter(p => !user.access[p.name]);
  if (locked.length > 0) {
    html += `<p style="margin:20px 0 10px;color:var(--text-muted);font-size:13px;">Services you do not have access to:</p>
    <div class="product-grid" style="opacity:0.6;">`;
    locked.forEach(p => {
      html += `
        <div class="product-card">
          <div class="icon">${p.icon}</div>
          <div class="access-badge access-no">✗ No Access</div>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <button class="btn btn-disabled" disabled>Locked</button>
        </div>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function handleProductClick(name) {
  if (!currentUser) {
    alert('Login first');
    showLogin();
    return;
  }

  const user = users[currentUser];
  if (!user.access[name]) {
    alert('You do not have access to this service.');
    return;
  }

  const product = allProducts.find(p => p.name === name);
  if (product && product.needsFee) {
    pendingFeeService = name;
    document.getElementById('fee-modal-title').textContent = 'Apply: ' + name;
    document.getElementById('fee-modal-desc').textContent = product.desc + ' — Enter amount to calculate the service fee.';
    document.getElementById('fee-amount').value = '';
    document.getElementById('fee-result').classList.add('hidden');
    document.getElementById('fee-apply-btn').disabled = true;
    document.getElementById('fee-modal').classList.add('show');
  } else {
    applyProduct(name);
  }
}

function calculateFee() {
  const amount = parseFloat(document.getElementById('fee-amount').value);
  if (!amount || amount < 100) {
    alert('Enter a valid amount (minimum 100)');
    return;
  }

  const product = allProducts.find(p => p.name === pendingFeeService);
  if (!product) return;

  const fee = +(amount * product.feeRate).toFixed(2);
  pendingFeeAmount = amount;
  pendingFeeValue = fee;

  document.getElementById('fee-display').textContent = fee.toLocaleString() + ' (currency)';
  document.getElementById('fee-formula').textContent = product.feeLabel + ' → ' + amount.toLocaleString() + ' × ' + (product.feeRate * 100) + '%';
  document.getElementById('fee-result').classList.remove('hidden');
  document.getElementById('fee-apply-btn').disabled = false;
}

function confirmFeeApply() {
  if (!pendingFeeService || !pendingFeeAmount) return;

  const key = 'jh_applied_' + currentUser;
  let list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({
    service: pendingFeeService,
    amount: pendingFeeAmount,
    fee: pendingFeeValue,
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  });
  localStorage.setItem(key, JSON.stringify(list));

  openServiceForm(pendingFeeService);

  closeFeeModal();
  document.getElementById('apply-msg').innerHTML = 
    `You have successfully applied for <strong>${pendingFeeService}</strong>.<br>
     Amount: ${pendingFeeAmount.toLocaleString()}<br>
     Service Fee: <strong>${pendingFeeValue.toLocaleString()}</strong><br>
     The application form has been opened in a new tab.`;
  document.getElementById('apply-modal').classList.add('show');

  renderAppliedServices();
}

function closeFeeModal() {
  document.getElementById('fee-modal').classList.remove('show');
  pendingFeeService = null;
  pendingFeeAmount = 0;
  pendingFeeValue = 0;
}

function renderAppliedServices() {
  if (!currentUser) return;

  const key = 'jh_applied_' + currentUser;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const tbody = document.getElementById('applied-body');
  const noMsg = document.getElementById('no-applied');

  tbody.innerHTML = '';
  if (list.length === 0) {
    noMsg.classList.remove('hidden');
    return;
  }
  noMsg.classList.add('hidden');

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.service}</td>
      <td>${item.amount.toLocaleString()}</td>
      <td style="font-weight:bold;color:var(--text-title);">${item.fee.toLocaleString()}</td>
      <td>${item.date}</td>
      <td>${item.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

function doSearch() {
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();
  const resultsBox = document.getElementById('search-results');
  const list = document.getElementById('search-list');
  if (!keyword) { alert('Enter a keyword'); return; }

  const matched = allProducts.filter(p => 
    p.name.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword)
  );

  list.innerHTML = matched.length === 0 
    ? `<div class="search-item">No results for "<strong>${keyword}</strong>"</div>`
    : matched.map(p => `
      <div class="search-item">
        <div><strong>${p.name}</strong> <span style="font-size:12px;color:var(--text-muted);">${p.desc}</span></div>
        <div>
          <button class="btn" style="padding:5px 12px;font-size:13px;" onclick="handleProductClick('${p.name}')">Apply</button>
          <a href="#products" style="margin-left:8px;font-size:13px;">View</a>
        </div>
      </div>
    `).join('');

  resultsBox.style.display = 'block';
  resultsBox.scrollIntoView({ behavior: 'smooth' });
}

function clearSearch() {
  document.getElementById('search-results').style.display = 'none';
  document.getElementById('search-input').value = '';
}

function closeModal() {
  document.getElementById('apply-modal').classList.remove('show');
}

function showLogin() {
  document.getElementById('account').scrollIntoView({ behavior: 'smooth' });
}

function doLogin() {
  const password = document.getElementById('login-pass').value;
  let matchedUser = null;
  for (const key in users) {
    if (users[key].password === password) {
      matchedUser = key;
      break;
    }
  }
  if (!matchedUser) {
    alert('Wrong password');
    return;
  }
  currentUser = matchedUser;
  localStorage.setItem('jh_user', matchedUser);
  showLoanDetails();
  renderProducts();
  updateInterestDisplay();
  enforceCustomUIAccess();
}

function updateInterestDisplay() {
  const rate = getEffectiveInterest();
  const note = document.getElementById('fixed-rate-note');
  
  if (currentUser && users[currentUser]) {
    const fixed = users[currentUser].fixedInterest;
    if (fixed != null && fixed > 0) {
      note.style.display = 'inline';
      note.textContent = `  |  Your Fixed Rate: ${fixed}%`;
      note.style.color = '#38a169';
    } else {
      note.style.display = 'none';
    }
  } else {
    note.style.display = 'none';
  }
}

function showLoanDetails() {
  if (!currentUser || !users[currentUser]) return;
  const user = users[currentUser];

  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('loan-section').classList.remove('hidden');
  document.getElementById('logout-btn').classList.remove('hidden');
  document.getElementById('top-user').textContent = 'Hi, ' + user.displayName;
  document.getElementById('current-user').textContent = user.displayName;
  document.getElementById('account-status').textContent = 'Logged in';

  // ===== Custom Content (image) =====
  const customBox = document.getElementById('custom-content-box');
  if (user.showCustomContent === "yes" && user.customContent) {
    if (user.customContent.type === "image") {
      customBox.innerHTML = `
        <a href="${user.customContent.url}" target="_blank">
          <img src="${user.customContent.value}" alt="Offer" style="max-width:100%;border-radius:6px;">
        </a>
      `;
      customBox.classList.remove('hidden');
    }
  } else {
    customBox.classList.add('hidden');
  }

  // ===== Special Notice =====
  const specialBox = document.getElementById('special-banner');
  if (user.showSpecialNotice === "yes" && user.specialNoticeText) {
    document.getElementById('special-message').innerHTML = user.specialNoticeText;
    specialBox.classList.remove('hidden');
  } else {
    specialBox.classList.add('hidden');
  }

  // Summary
  document.getElementById('sum-username').textContent = user.displayName;
  document.getElementById('sum-premium').textContent = user.premiumType;

  // Total Amount (amount + interest only)
  const totalAmount = user.loans.reduce((sum, l) => sum + l.amount, 0);
  const totalInterest = user.loans.reduce((sum, l) => sum + l.interest, 0);
  const grandTotal = totalAmount + totalInterest;

  const sumTotalEl = document.getElementById('sum-total');
  sumTotalEl.innerHTML = `<strong>${grandTotal.toLocaleString()}</strong>`;
  sumTotalEl.style.cursor = 'pointer';
  sumTotalEl.onclick = function () {
    openTotalPopup(totalAmount, totalInterest, grandTotal);
  };

  // Interest rate display
  if (user.fixedInterest != null && user.fixedInterest > 0) {
    document.getElementById('sum-interest').textContent = user.fixedInterest + '% (Fixed)';
  } else {
    document.getElementById('sum-interest').textContent = todayInterest + '% (Daily)';
  }

  // ===== Amount tabs + detail view (Amount 1, Amount 2, ...) =====
  window._loanList = user.loans;
  window._activeLoanIndex = 0;
  renderAmountSwitcher(user.loans, 0);

  const reminders = [];
  user.loans.forEach((loan, idx) => {
    const { overdueFee, status, daysInfo, daysDiff } = computeLoanStatus(loan);
    const thisTotal = loan.amount + loan.interest + (overdueFee > 0 ? overdueFee : 0);

    if (daysDiff >= -3 && daysDiff <= 0) {
      const daysLeft = Math.abs(daysDiff);
      let msg = '';
      if (daysDiff === 0) {
        msg = `<strong>Amount ${idx + 1}</strong> (${loan.amount.toLocaleString()}) is <strong>due today</strong>. Total (amount + interest${overdueFee > 0 ? ' + overdue' : ''}): <strong>${thisTotal.toLocaleString()}</strong>. Clear it or use <strong>Delay It</strong>.`;
      } else {
        msg = `<strong>Amount ${idx + 1}</strong> (${loan.amount.toLocaleString()}) has to be returned in <strong>${daysLeft} day(s)</strong>. Total (amount + interest): <strong>${(loan.amount + loan.interest).toLocaleString()}</strong>. Clear it or use <strong>Delay It</strong> before ${loan.return}.`;
      }
      reminders.push(msg);
    } else if (daysDiff > 0) {
      reminders.push(`<strong>Amount ${idx + 1}</strong> (${loan.amount.toLocaleString()}) is <strong>overdue</strong> by ${daysDiff} day(s). Total (amount + interest + overdue): <strong>${thisTotal.toLocaleString()}</strong>. Use <strong>Delay It</strong>.`);
    }
  });

  const reminderBox = document.getElementById('reminder-banner');
  const reminderMessages = document.getElementById('reminder-messages');
  if (reminders.length > 0) {
    reminderMessages.innerHTML = reminders.map(m => `<p style="margin-bottom:6px;">${m}</p>`).join('');
    reminderBox.classList.remove('hidden');
  } else {
    reminderBox.classList.add('hidden');
  }

  renderAppliedServices();
  updateInterestDisplay();
}

/* ===== Amount switcher UI ===== */
function renderAmountSwitcher(loans, activeIndex) {
  const tabsEl = document.getElementById('amount-tabs');
  const detailEl = document.getElementById('amount-detail-container');
  if (!tabsEl || !detailEl) return;

  if (!loans || loans.length === 0) {
    tabsEl.innerHTML = '';
    detailEl.innerHTML = '<div class="no-loans">No loan amounts found.</div>';
    return;
  }

  window._activeLoanIndex = activeIndex;
  tabsEl.innerHTML = loans.map((loan, i) =>
    `<button type="button" class="amount-tab ${i === activeIndex ? 'active' : ''}" onclick="switchAmount(${i})">Amount ${i + 1}</button>`
  ).join('');

  const loan = loans[activeIndex];
  const { overdueFee, status, daysInfo, daysDiff } = computeLoanStatus(loan);
  const totalAI = loan.amount + loan.interest;

  detailEl.innerHTML = `
    <div class="amount-detail-card">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${loan.amount.toLocaleString()}</span></div>
      <div class="detail-row"><span class="detail-label">Interest</span><span class="detail-value">${loan.interest.toLocaleString()}</span></div>
      <div class="detail-row"><span class="detail-label">Taken on</span><span class="detail-value">${loan.borrowed}</span></div>
      <div class="detail-row"><span class="detail-label">Return on</span><span class="detail-value">${loan.return}</span></div>
      <div class="detail-row"><span class="detail-label">Days Left</span><span class="detail-value">${daysInfo}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${status}</span></div>
      <div class="detail-row ${overdueFee > 0 ? 'overdue' : ''}"><span class="detail-label">Overdue Fee</span><span class="detail-value">${overdueFee > 0 ? overdueFee.toLocaleString() : '0'}</span></div>
      <div class="detail-row total-row"><span class="detail-label">Total (amount + interest)</span><span class="detail-value">${totalAI.toLocaleString()}</span></div>
    </div>
  `;
}

function switchAmount(index) {
  if (!window._loanList) return;
  renderAmountSwitcher(window._loanList, index);
}

function openTotalPopup(amount, interest, total) {
  const modal = document.getElementById('total-popup-modal');
  if (!modal) return;
  document.getElementById('tp-amount').textContent = amount.toLocaleString();
  document.getElementById('tp-interest').textContent = interest.toLocaleString();
  document.getElementById('tp-total').textContent = total.toLocaleString();
  modal.classList.add('show');
}

function closeTotalPopup() {
  const modal = document.getElementById('total-popup-modal');
  if (modal) modal.classList.remove('show');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('jh_user');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('loan-section').classList.add('hidden');
  document.getElementById('logout-btn').classList.add('hidden');
  document.getElementById('top-user').textContent = '';
  document.getElementById('account-status').textContent = '';
  document.getElementById('special-banner').classList.add('hidden');
  document.getElementById('custom-content-box').classList.add('hidden');
  document.getElementById('reminder-banner').classList.add('hidden');
  renderProducts();
  updateInterestDisplay();
  enforceCustomUIAccess();
}

function drawBarGraph() {
  const canvas = document.getElementById('interestChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const bars = getFixedBars();

  const minR = 29, maxR = 36;
  const barCount = bars.length;
  const gap = 12;
  const barWidth = (width - (barCount + 1) * gap) / barCount;
  const chartBottom = height - 30;
  const chartHeight = chartBottom - 25;

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#d0d8e4';
  ctx.lineWidth = 1;
  ctx.font = '11px sans-serif';
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#666';

  for (let i = 0; i <= 4; i++) {
    const val = minR + (maxR - minR) * (i / 4);
    const y = chartBottom - (chartHeight * (i / 4));
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.fillText(val.toFixed(0) + '%', 4, y - 3);
  }

  bars.forEach((val, i) => {
    const x = gap + i * (barWidth + gap);
    const barH = ((val - minR) / (maxR - minR)) * chartHeight;
    const y = chartBottom - barH;

    ctx.fillStyle = (i === bars.length - 1) ? '#38a169' : '#3182ce';
    ctx.fillRect(x, y, barWidth, barH);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val.toFixed(1) + '%', x + barWidth / 2, y - 5);
  });

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#666';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Today'];
  bars.forEach((_, i) => {
    const x = gap + i * (barWidth + gap) + barWidth / 2;
    ctx.fillText(labels[i], x, height - 8);
  });
}

window.onload = function() {
  let savedTheme = localStorage.getItem('jh_theme') || 'light';
  const savedColor = localStorage.getItem('jh_custom_color');

  const savedUser = localStorage.getItem('jh_user');
  if (savedUser && users[savedUser]) {
    currentUser = savedUser;
  }

  enforceCustomUIAccess();

  savedTheme = localStorage.getItem('jh_theme') || 'light';
  if (savedTheme === 'custom' && savedColor) {
    applyTheme('custom', savedColor);
  } else {
    applyTheme(savedTheme);
  }

  document.getElementById('today-rate-display').textContent = todayInterest + '%';
  drawBarGraph();

  if (currentUser) {
    showLoanDetails();
  }

  renderProducts();
  updateInterestDisplay();
};



/* ===== ACTIVE NAVBAR HIGHLIGHT (Scroll Spy) ===== */
(function() {
  // Map section ID → data-section value
  const sectionMap = {
    graph: 'interest',   // #graph → data-section="interest"
    turbo: 'turbo',
    takemoney: 'takemoney',
    products: 'products',
    account: 'account'
  };

  const sections = Object.keys(sectionMap);
  const navLinks = document.querySelectorAll('.quick a[data-section]');

  function setActive(sectionId) {
    const activeKey = sectionMap[sectionId] || sectionId;
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === activeKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: '-15% 0px -15% 0px',
    threshold: 0
  });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Instant highlight on click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const key = link.getAttribute('data-section');
      // Find the real section id from the map
      const realId = Object.keys(sectionMap).find(k => sectionMap[k] === key) || key;
      setActive(realId);
    });
  });

  // Initial check on page load
  window.addEventListener('load', () => {
    let current = null;
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.3) {
          current = id;
        }
      }
    });
    if (current) setActive(current);
  });
})();
