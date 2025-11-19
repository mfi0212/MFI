// document.addEventListener('contextmenu', e => e.preventDefault());
for(let i=0;i<15;i++){
    const b=document.createElement("div");b.className="bulb";
    const dur=6+Math.random()*5;
    b.style.animationDuration=dur+"s";
    b.style.animationDelay=Math.random()*dur+"s";
    document.getElementById("lights").appendChild(b);
}
const bulbs = document.querySelectorAll('.bulb');

document.getElementById("candy").onclick = () => document.getElementById("panel").classList.toggle("show");

// Elements
const modeSelect = document.getElementById("mode");
const singleColorRow = document.getElementById("singleColorRow");
const singleColorInput = document.getElementById("singleColor");

// Show/hide single color picker
modeSelect.onchange = function() {
    if(this.value === "single") {
        singleColorRow.style.display = "flex";
        applySingleColor();
    } else {
        singleColorRow.style.display = "none";
        startMode();
    }
};
singleColorInput.oninput = applySingleColor;

// Speed
function getSpeedDelay() {
    const val = document.getElementById("speed").value;
    return Math.round(2000 - val * 19); // 100 → ~100ms, 1 → ~1900ms
}
document.getElementById("speed").oninput = updateAllSpeeds;

// Intervals
let modeInt = null, twinkleInt = null, discoInt = null;

// Predefined modes
const modes = {
    "Classic Red & Green": ["#c00","#0a0"],
    "Warm White": ["#fff7e0","#ffe0b3"],
    "Multicolor Rainbow": ["#f00","#0f0","#00f","#ff0","#f0f","#0ff"],
    "Candy Cane Stripes": ["#fff","#ff3366"],
    "Ice Blue Winter": ["#62ff00ff","#0091ffff"],
    "Golden Elegance": ["#ff9900ff","#ffffffff"]
};

function startMode() {
    clearInterval(modeInt); clearInterval(discoInt);
    document.getElementById("disco").textContent = "Disco OFF";

    const colors = modes[modeSelect.value];
    let i = 0;
    modeInt = setInterval(() => {
        const c = colors[i++ % colors.length];
        bulbs.forEach(b => { b.style.background = c; b.style.boxShadow = `0 0 30px 8px ${c}`; b.style.opacity = 1; });
    }, getSpeedDelay());
}

// Single color mode
function applySingleColor() {
    clearInterval(modeInt); clearInterval(discoInt);
    document.getElementById("disco").textContent = "Disco OFF";
    const c = singleColorInput.value;
    bulbs.forEach(b => {
        b.style.background = c;
        b.style.boxShadow = `0 0 20px 8px ${c}`;
        b.style.opacity = 1;
    });
}

// Twinkle
document.getElementById("twinkle").onclick = function() {
    if(twinkleInt){ clearInterval(twinkleInt); twinkleInt=null; this.textContent="Twinkle OFF"; bulbs.forEach(b=>b.style.opacity=1); }
    else { this.textContent="Twinkle ON"; startTwinkle(); }
};
function startTwinkle() {
    clearInterval(twinkleInt);
    twinkleInt = setInterval(() => {
        const b = bulbs[Math.floor(Math.random()*bulbs.length)];
        b.style.opacity = 0.25;
        setTimeout(() => b.style.opacity = 1, 100 + Math.random()*200);
    }, getSpeedDelay() * 0.7);
}

// Disco
document.getElementById("disco").onclick = function() {
    if(discoInt){ clearInterval(discoInt); discoInt=null; this.textContent="Disco OFF"; (modeSelect.value==="single"?applySingleColor():startMode()); }
    else { this.textContent="Disco ON"; clearInterval(modeInt); startDisco(); }
};
function startDisco() {
    clearInterval(discoInt);
    discoInt = setInterval(() => {
        bulbs.forEach(b => {
            const h = Math.random()*360;
            const c = `hsl(${h},100%,62%)`;
            b.style.background = c;
            b.style.boxShadow = `0 0 20px 10px ${c}`;
            b.style.opacity = 1;
        });
    }, getSpeedDelay());
}

// Update all effects when speed changes
function updateAllSpeeds() {
    if(modeInt && modeSelect.value !== "single") { clearInterval(modeInt); startMode(); }
    if(discoInt) { clearInterval(discoInt); startDisco(); }
    if(twinkleInt) { clearInterval(twinkleInt); startTwinkle(); }
}

// Snow
let snowInt;
document.getElementById("snow").oninput = function(){
    clearInterval(snowInt);
    const delay = 500 - this.value * 4.5;
    snowInt = setInterval(() => {
        const s=document.createElement("div");s.className="snow";
        s.style.left=Math.random()*100+"vw";
        s.style.animationDuration=(4+Math.random()*7)+"s";
        document.body.appendChild(s);
        setTimeout(()=>s.remove(),14000);
    }, delay);
};
document.getElementById("snow").oninput();

// Click glow
document.addEventListener("click", e => {
    if(e.target.closest("#panel") || e.target.id==="candy") return;
    const col = getComputedStyle(bulbs[Math.floor(Math.random()*bulbs.length)]).backgroundColor;
    document.body.style.transition = "background 1.6s ease";
    document.body.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, ${col}70, #000 75%)`;
});

// Initialize
startMode();


const USD_RATE = 87.85;
let currentCurrency = localStorage.getItem('currency') || 'INR';
let currentUser = null, currentLoanIndex = null, loanChart = null, calendarMonth = new Date();
const PINNED_KEY = 'pinnedView';
let pendingLink = null;
let filteredLoans = [];

const usersDB = {
    "0212*": {
        name: "Tony Mantana",
        coins: 0,
        loans: [
            { planDate: "25-05-2025", endDate: "21-11-2025(Extended to 15 days)", interest: 640, takenAmount: 5100, takenFrom: "Delayit offer", fineRate: 50, purpose: "" },
            { planDate: "29-09-2025", endDate: "14-12-2025(Extended to 30 days)", interest: 1380, takenAmount: 4720, takenFrom: "MLLD", fineRate: 40, purpose: "" },
        ],
        links: [],
        emote: "https://raw.githubusercontent.com/goforbg/telegram-emoji-gifs/refs/heads/master/christmas-tree.gif"
    },
};

function loadUserData() {
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    for (let pin in usersDB) {
        const saved = savedData[pin];
        if (saved) {
            usersDB[pin].links = saved.links || [];
            usersDB[pin].emote = saved.emote || usersDB[pin].emote;
            if (saved.purposes) {
                saved.purposes.forEach((p, i) => {
                    if (usersDB[pin].loans[i]) usersDB[pin].loans[i].purpose = p;
                });
            }
        }
    }
}

function saveUserData() {
    const data = {};
    for (let pin in usersDB) {
        data[pin] = {
            links: usersDB[pin].links,
            emote: usersDB[pin].emote,
            purposes: usersDB[pin].loans.map(l => l.purpose || "")
        };
    }
    localStorage.setItem('userData', JSON.stringify(data));
}

function formatMoney(amount) {
    const val = currentCurrency === 'USD' ? (amount / USD_RATE).toFixed(2) : amount;
    const symbol = currentCurrency === 'USD' ? '$' : '₹';
    return `${symbol}${parseFloat(val).toLocaleString()}`;
}

function updateCurrencyUI() {
    document.getElementById('currencyLabel').textContent = currentCurrency;
    document.querySelector('#currencySwitch i').className = 
        currentCurrency === 'USD' ? 'fa-solid fa-dollar-sign' : 'fa-solid fa-indian-rupee-sign';
}

function toggleCurrency() {
    currentCurrency = currentCurrency === 'INR' ? 'USD' : 'INR';
    localStorage.setItem('currency', currentCurrency);
    updateCurrencyUI();
    if (currentUser) {
        renderAmountButtons();
        if (currentLoanIndex !== null) displayLoanDetails(currentUser.loans[currentLoanIndex], currentLoanIndex);
        showTotalPopup();
        if (document.getElementById('graphContainer').style.display === 'block') renderChart();
        updateCoinsDisplay();
    }
}

function updateCoinsDisplay() {
    if (currentUser && document.getElementById('userCoinsDisplay')) {
        document.getElementById('userCoinsDisplay').textContent = currentUser.coins.toLocaleString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateCurrencyUI();
    document.getElementById('currencySwitch').onclick = toggleCurrency;
    const saved = localStorage.getItem('lastPassword');
    if (saved) setTimeout(() => document.getElementById("userPassword").value = saved, 300);
});

document.getElementById("submitBtn").onclick = () => {
    const input = document.getElementById("userPassword").value.trim();
    const user = usersDB[input];
    const err = document.getElementById("error-message");

    if (user) {
        localStorage.setItem('lastPassword', input);
        currentUser = user;
        filteredLoans = [...user.loans];

        document.getElementById("userName").textContent = user.name;
        document.getElementById("userEmote").src = user.emote;
        updateCoinsDisplay();
        renderLinks();
        renderAmountButtons();
        if (user.loans.length) displayLoanDetails(user.loans[0], 0);

        document.getElementById("userInfoModal").style.display = "block";
        document.getElementById("passwordContainer").style.display = "none";
        err.textContent = "";

        const pinned = localStorage.getItem(PINNED_KEY) || 'list';
        switchView(pinned, false);
        updateNavActive(pinned);
    } else {
        err.textContent = "Invalid password!";
    }
};

function showTotalPopup() {
    const now = new Date();
    let base = 0, interest = 0, overdue = 0;

    currentUser.loans.forEach(loan => {
        base += loan.takenAmount;
        interest += loan.interest;
        const cleanEnd = loan.endDate.split('(')[0].trim();
        const end = new Date(cleanEnd.split('-').reverse().join('-'));
        if (now > end) {
            const days = Math.ceil((now - end) / 86400000);
            overdue += days * loan.fineRate;
        }
    });

    const total = base + interest + overdue;

    document.getElementById("totalContent").innerHTML = `
        <p>Taken amount : <strong>${formatMoney(base)}</strong></p>
        <p style='margin-bottom: 20px;'>Total Interest : <strong>${formatMoney(interest)}</strong></p>
        ${overdue > 0 ? `<p style="color:#ff4444;margin-bottom: 20px;">Overdue Fine : <strong style='color: #ff4444;'>${formatMoney(overdue)}</strong></p>` : ''}
        <hr>
        <p style="font-size: 22px;margin-top: 22px;margin-bottom: 10px;">Total to Return: <strong>${formatMoney(total)}</strong></p>
    `;
    document.getElementById("totalPopup").style.display = "block";
}

function closeTotalPopup() { document.getElementById("totalPopup").style.display = "none"; }

function displayLoanDetails(loan, index) {
    currentLoanIndex = index;
    const now = new Date();
    const cleanEndDate = loan.endDate.split('(')[0].trim();
    const endDate = new Date(cleanEndDate.split('-').reverse().join('-'));
    const daysLeft = Math.ceil((endDate - now) / 86400000);
    let overdueFine = daysLeft < 0 ? Math.abs(daysLeft) * loan.fineRate : 0;
    const totalPayable = loan.takenAmount + loan.interest + overdueFine;

    document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
    const btns = document.getElementById("amountButtons").children;
    if (btns[filteredLoans.indexOf(loan)]) btns[filteredLoans.indexOf(loan)].classList.add("active");

    document.getElementById("loanDetails").innerHTML = `
        <div class="loan-entry">
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Purpose</h3>
                <input type="text" class="purpose-input" placeholder="e.g. Taken for shopping" value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
            </div>
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Taken From</h3>
                <p>${loan.takenFrom}</p>
            </div>
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Taken Date</h3>
                <p>${loan.planDate}</p>
            </div>
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Return Date</h3>
                <p style="color:${daysLeft <= 2 ? '#ff4444' : daysLeft <= 6 ? '#ffca00' : '#00ff88'};"> ${cleanEndDate}</p>
            </div>
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Amount Taken</h3>
                <p> ${formatMoney(loan.takenAmount)}</p>
            </div>
            <div class="details">
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Interest</h3>
                <p> ${formatMoney(loan.interest)}</p>
            </div>

            <div class="details">
                ${overdueFine > 0 ? `
                <h3 style=";margin:25px 0;font-weight:600;font-size:15px;">Overdue Fine</h3>
                <p style='color: #ff4444;'>${formatMoney(overdueFine)} 
                    <small>(${Math.abs(daysLeft)} days)</small>
                </p>` : ''}
            </div>
            <hr>
            <div class="totaldetails">
                <h3 style="margin: 10px 0;
    font-weight: 600;
    font-size: 15px;
    color: #ffffff91;">Total amount to return</h3>
                <p style="font-size:24px;color:${overdueFine > 0 ?  '#ff4444' : '#00ff00'};font-weight:bold;">
                    ${formatMoney(totalPayable)}
                </p>
            </div>
        </div>
    `;
}

function updatePurpose(index, value) {
    currentUser.loans[index].purpose = value.trim();
    saveUserData();
    renderAmountButtons();
}

function renderAmountButtons() {
    const container = document.getElementById("amountButtons");
    container.innerHTML = "";
    filteredLoans.forEach((loan, i) => {
        const originalIndex = currentUser.loans.indexOf(loan);
        const btn = document.createElement("button");
        btn.className = "amount-btn";
        btn.innerHTML = `${formatMoney(loan.takenAmount)}<div class="purpose-tag">${loan.purpose || 'Set Purpose'}</div>`;
        btn.onclick = () => { displayLoanDetails(loan, originalIndex); switchView('list', false); };
        container.appendChild(btn);
    });
}

function renderChart() {
    const ctx = document.getElementById('loanChart').getContext('2d');
    const now = new Date();
    const labels = [], data = [], colors = [];

    currentUser.loans.forEach((loan, i) => {
        const clean = loan.endDate.split('(')[0].trim();
        const end = new Date(clean.split('-').reverse().join('-'));
        const daysLeft = Math.ceil((end - now) / 86400000);
        let color = '#4CAF50';
        if (daysLeft <= 2) color = '#F44336';
        else if (daysLeft <= 6) color = '#FFCA28';

        labels.push(`Loan ${i+1}`);
        data.push(currentCurrency === 'USD' ? (loan.takenAmount / USD_RATE).toFixed(2) : loan.takenAmount);
        colors.push(color);
    });

    if (loanChart) loanChart.destroy();
    loanChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 1.5 }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderCalendar() {
    const c = document.getElementById('calendarContainer');
    const y = calendarMonth.getFullYear(), m = calendarMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const today = new Date();

    const dueMap = {};
    currentUser.loans.forEach((loan, i) => {
        const clean = loan.endDate.split('(')[0].trim();
        const [d, mm, yy] = clean.split('-');
        dueMap[`${d.padStart(2,'0')}-${mm.padStart(2,'0')}-${yy}`] = i;
    });

    let html = `<div style="    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    position: sticky;
    top: -20px;
    background: transparent;
    padding: 13px 0px 10px 0px;
    backdrop-filter: blur(3px);
    width: 100%;    margin-bottom: 20px;
">
        <span style="font-weight:600;color:#eee;">${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="move-asaid" onclick="prevMonth()"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="move-asaid" onclick="nextMonth()"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;color:#888;font-weight:600;">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>`;

    for (let i = 0; i < first; i++) html += `<div></div>`;
    for (let d = 1; d <= days; d++) {
        const ds = `${String(d).padStart(2,'0')}-${String(m+1).padStart(2,'0')}-${y}`;
        const idx = dueMap[ds];
        let style = `border-radius:12px;cursor:${idx!==undefined?'pointer':'default'};transition:all .2s;`;
        if (idx !== undefined) {
            const end = new Date(currentUser.loans[idx].endDate.split('(')[0].trim().split('-').reverse().join('-'));
            const daysLeft = Math.ceil((end - today) / 86400000);
            let bg = '#4CAF50';
            if (daysLeft <= 2) bg = '#F44336';
            else if (daysLeft <= 6) bg = '#ffbf00ff';
            style += `background:${bg};color:black;font-weight:bold;`;
        }
        if (ds === today.toLocaleDateString('en-GB').split('/').reverse().join('-')) {
            style += `border:2px solid #00aaff;box-sizing:border-box;`;
        }
        html += `<div style="${style}" ${idx!==undefined?`onclick="showDatePopup(${idx})"`:''}>${d}</div>`;
    }
    html += `</div>`;
    c.innerHTML = html;
}

function prevMonth() { calendarMonth.setMonth(calendarMonth.getMonth() - 1); renderCalendar(); }
function nextMonth() { calendarMonth.setMonth(calendarMonth.getMonth() + 1); renderCalendar(); }

function showDatePopup(idx) {
    const loan = currentUser.loans[idx];
    const cleanEnd = loan.endDate.split('(')[0].trim();
    const daysLeft = Math.ceil((new Date(cleanEnd.split('-').reverse().join('-')) - new Date()) / 86400000);
    document.getElementById('popupContent').innerHTML = `
        <p style='color: #e2b325;font-weight: 800;font-size: 18px;'><strong>Amount:</strong> ${formatMoney(loan.takenAmount)}</p>
        <p style='color: #e2b325;font-weight: 800;font-size: 18px;'><strong>Purpose:</strong> ${loan.purpose || 'Not set'}</p>
        <p style='color: #e2b325;font-weight: 800;font-size: 18px;'><strong>Due:</strong> ${cleanEnd}</p>
        <p style='color: #e2b325;font-weight: 800;font-size: 18px;'><strong>Status:</strong> <span style="color:${daysLeft<=2?'#F44336':daysLeft<=6?'#FFCA28':'#4CAF50'}">
            ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}
        </span></p>
        <button style="margin-top:15px;width:100%;padding:10px;background:#004fff;border-radius:20px;" onclick="goToList(${idx})">View Full</button>
    `;
    document.getElementById('datePopup').style.display = 'block';
}

function closeDatePopup() { document.getElementById('datePopup').style.display = 'none'; }
function goToList(idx) { closeDatePopup(); switchView('list', true); displayLoanDetails(currentUser.loans[idx], idx); }

function renderLinks() {
    const c = document.getElementById("userLinks"); c.innerHTML = "";
    currentUser.links.forEach((link, i) => {
        const div = document.createElement("div");
        div.className = "user-link";
        div.innerHTML = `<i class="fa-solid fa-link"></i> ${link.title}`;
        div.onclick = () => { pendingLink = {link, i}; document.getElementById("linkConfirmPopup").style.display = "block"; };
        c.appendChild(div);
    });
}

function addLink() {
    const title = prompt("Link title:");
    if (!title) return;
    const url = prompt("URL:");
    if (url && url.startsWith('http')) {
        currentUser.links.push({title, url});
        renderLinks();
        saveUserData();
    }
}

document.getElementById("linkYesBtn").onclick = () => {
    window.open(pendingLink.link.url, '_blank');
    document.getElementById("linkConfirmPopup").style.display = "none";
};

document.getElementById("linkDeleteBtn").onclick = () => {
    currentUser.links.splice(pendingLink.i, 1);
    renderLinks();
    saveUserData();
    document.getElementById("linkConfirmPopup").style.display = "none";
};

function openEmoteChooser() { document.getElementById("emoteChooser").style.display = "block"; }
function closeEmoteChooser() { document.getElementById("emoteChooser").style.display = "none"; }
function setUserEmote(src) {
    currentUser.emote = src;
    document.getElementById("userEmote").src = src;
    saveUserData();
    closeEmoteChooser();
}

function updateNavActive(view) {
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.view === view);
        const pin = n.querySelector('.toggle-pin');
        const isOn = localStorage.getItem(PINNED_KEY) === n.dataset.view;
        pin.className = `fa-solid fa-toggle-${isOn ? 'on' : 'off'} toggle-pin ${isOn ? 'on' : ''}`;
    });
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.onclick = () => switchView(item.dataset.view, true);
});

document.querySelectorAll('.toggle-pin').forEach(pin => {
    pin.onclick = (e) => {
        e.stopPropagation();
        const view = pin.closest('.nav-item').dataset.view;
        if (localStorage.getItem(PINNED_KEY) === view) localStorage.removeItem(PINNED_KEY);
        else localStorage.setItem(PINNED_KEY, view);
        updateNavActive(document.querySelector('.nav-item.active')?.dataset.view || 'list');
    };
});

function switchView(view, nav = true) {
    document.getElementById('loanDetails').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('graphContainer').style.display = view === 'graph' ? 'block' : 'none';
    document.getElementById('calendarContainer').style.display = view === 'calendar' ? 'block' : 'none';
    if (view === 'graph') renderChart();
    if (view === 'calendar') renderCalendar();
    if (nav) updateNavActive(view);
}

function closeModal() {
    document.getElementById("userInfoModal").style.display = "none";
    document.getElementById("passwordContainer").style.display = "flex";
    saveUserData();
    currentUser = null;
}

let searchOpen = false;
function toggleSearch() {
    const input = document.getElementById("searchInput");
    const icon = document.getElementById("searchIcon");
    searchOpen = !searchOpen;
    input.classList.toggle("active", searchOpen);
    icon.style.transform = searchOpen ? "rotate(90deg)" : "rotate(0deg)";
    if (searchOpen) setTimeout(() => input.focus(), 300);
    else { input.value = ""; filterLoans(); }
}

function filterLoans() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    filteredLoans = currentUser.loans.filter(loan =>
        loan.takenAmount.toString().includes(q) ||
        (loan.purpose && loan.purpose.toLowerCase().includes(q)) ||
        loan.takenFrom.toLowerCase().includes(q)
    );
    renderAmountButtons();
}
const coinSection = document.getElementById('coinSection');
    const popupOverlay = document.getElementById('swanShopPopup');
    const closeBtn = document.querySelector('.close-btn');

    // Open popup when clicking the coin display
    coinSection.addEventListener('click', () => {
      popupOverlay.classList.add('active');
    });

    // Close when clicking X or outside the popup
    closeBtn.addEventListener('click', () => {
      popupOverlay.classList.remove('active');
    });

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
      }
    });

