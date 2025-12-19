document.addEventListener('contextmenu', e => e.preventDefault());

// for(let i=0;i<15;i++){
//     const b=document.createElement("div");b.className="bulb";
//     const dur=6+Math.random()*5;
//     b.style.animationDuration=dur+"s";
//     b.style.animationDelay=Math.random()*dur+"s";
//     document.getElementById("lights").appendChild(b);
// }
// const bulbs = document.querySelectorAll('.bulb');

document.getElementById("candy").onclick = () => document.getElementById("panel").classList.toggle("show");

const modeSelect = document.getElementById("mode");
const singleColorRow = document.getElementById("singleColorRow");
const singleColorInput = document.getElementById("singleColor");

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

function getSpeedDelay() {
    const val = document.getElementById("speed").value;
    return Math.round(2000 - val * 19); 
}
document.getElementById("speed").oninput = updateAllSpeeds;

let modeInt = null, twinkleInt = null, discoInt = null;

const modes = {
    "Classic Red & Green": ["#c00","#0a0"],
    "Warm White": ["#fff7e0","#ffe0b3"],
    "Multicolor Rainbow": ["#f00","#0f0","#00f","#ff0","#f0f","#0ff"],
    "Candy Red & white": ["#ffffffff","#ff0000ff"],
    "Ice Blue Winter": ["#000dffff","#0091ffff"],
    "Golden Elegance": ["#ffc400ff","#ffffffff"]
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

function updateAllSpeeds() {
    if(modeInt && modeSelect.value !== "single") { clearInterval(modeInt); startMode(); }
    if(discoInt) { clearInterval(discoInt); startDisco(); }
    if(twinkleInt) { clearInterval(twinkleInt); startTwinkle(); }
}

// let snowInt;
// document.getElementById("snow").oninput = function(){
//     clearInterval(snowInt);
//     const delay = 500 - this.value * 4.5;
//     snowInt = setInterval(() => {
//         const s=document.createElement("div");s.className="snow";
//         s.style.left=Math.random()*100+"vw";
//         s.style.animationDuration=(4+Math.random()*7)+"s";
//         document.body.appendChild(s);
//         setTimeout(()=>s.remove(),14000);
//     }, delay);
// };
// document.getElementById("snow").oninput();

document.addEventListener("click", e => {
    if(e.target.closest("#panel") || e.target.id==="candy") return;
    const col = getComputedStyle(bulbs[Math.floor(Math.random()*bulbs.length)]).backgroundColor;
    document.body.style.transition = "background 1.6s ease";
    document.body.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, ${col}70, #000 75%)`;
});

startMode();
 document.addEventListener("DOMContentLoaded", function () {
        let helperButton = document.querySelector(".helper-button");
        helperButton.classList.add("animated-border");
        setTimeout(() => {
            helperButton.classList.remove("animated-border");
        }, 10000000);
    });
const USD_RATE = 87.85;
let currentCurrency = localStorage.getItem('currency') || 'INR';
let currentUser = null, currentLoanIndex = null, loanChart = null, calendarMonth = new Date();
const PINNED_KEY = 'pinnedView';
let pendingLink = null;
let filteredLoans = [];

const usersDB = {
    "Mahesh888*": {
        name: "Mahesh Muthinti",
        coins: 63,
        loans: [
            { planDate: "03-12-2025", endDate: "02-01-2026", interest: 1705, takenAmount: 5500, takenFrom: "MLendings", fineRate: 40 },
            { planDate: "29-09-2025", endDate: "12-01-2026(Extended to 30 days)", interest: 1600, takenAmount: 6100, takenFrom: "MLLD", fineRate: 40 },
            { planDate: "16-12-2025", endDate: "15-01-2026", interest: 1240, takenAmount: 4000, takenFrom: "Lendlink", fineRate: 40 },
            { planDate: "25-05-2025", endDate: "16-01-2026(Extended to 30 days)", interest: 660, takenAmount: 2420, takenFrom: "Delayit offer", fineRate: 50 },
        ],
        links: [],
        emote: "https://media.tenor.com/pT6HQx4wIogAAAAj/twitch-rpx-syria.gif"
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
// Load saved background
window.onload = () => {
  const saved = localStorage.getItem('userBG');
  if (saved === 'black') {
    applyBlack();
  } else if (saved) {
    applyImage(saved, false); // false = no repeat
  }
};

const fab = document.getElementById('fab');
const sheet = document.getElementById('sheet');
const overlay = document.getElementById('overlay');

fab.onclick = () => {
  sheet.classList.toggle('active');
  overlay.classList.toggle('active');
};

overlay.onclick = () => {
  sheet.classList.remove('active');
  overlay.classList.remove('active');
  document.getElementById('presetSection').style.display = 'none';
  document.getElementById('uploadSection').style.display = 'none';
};

// Preset Wallpapers
document.getElementById('presetBtn').onclick = () => {
  const section = document.getElementById('presetSection');
  section.style.display = section.style.display === 'block' ? 'none' : 'block';
  document.getElementById('uploadSection').style.display = 'none';
};

document.querySelectorAll('.wallpaper-thumb').forEach(img => {
  img.onclick = () => {
    applyImage(img.src, false);
    closeSheet();
  };
});

// Upload Image
document.getElementById('uploadBtn').onclick = () => {
  const section = document.getElementById('uploadSection');
  section.style.display = section.style.display === 'block' ? 'none' : 'block';
  document.getElementById('presetSection').style.display = 'none';
};

document.getElementById('dropArea').onclick = () => {
  document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      applyImage(ev.target.result, false);
      closeSheet();
    };
    reader.readAsDataURL(file);
  }
};

// Original Black
document.getElementById('originalBtn').onclick = () => {
  applyBlack();
  closeSheet();
};

function applyImage(url, repeat = false) {
  document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundRepeat = repeat ? 'repeat' : 'no-repeat';
  document.body.style.backgroundSize = '115%';
  document.body.style.backgroundPosition = 'center';
  localStorage.setItem('userBG', url);
}

function applyBlack() {
  document.body.style.background = '#000';
  document.body.style.backgroundImage = 'none';
  localStorage.setItem('userBG', 'black');
}

function closeSheet() {
  sheet.classList.remove('active');
  overlay.classList.remove('active');
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

    // New: Calculate Days Elapsed since loan was taken
    const [d, m, y] = loan.planDate.split('-').map(Number);
    const takenDate = new Date(y, m - 1, d);
    const daysElapsed = Math.floor((now - takenDate) / 86400000);

    document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
    const btns = document.getElementById("amountButtons").children;
    if (btns[filteredLoans.indexOf(loan)]) btns[filteredLoans.indexOf(loan)].classList.add("active");

    document.getElementById("loanDetails").innerHTML = `
        <div class="loan-entry">
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><g fill="none"><circle cx="11.5" cy="5.5" r="2.5" stroke="#ffffff" stroke-width="1.5"/><path stroke="#ffffff" stroke-linecap="round" stroke-width="1.5" d="M9 16.5s-.426 1.62-1 2.5c-.603.925-2 2-2 2"/><path fill="#ffffff" d="m10.21 11.901l.746.075l-.746-.075Zm-.069.686l-.746-.075l.746.075Zm8.436-2.734l-.48-.576l.48.576Zm.903.223a.75.75 0 0 0-.96-1.152l.96 1.152Zm-8.276 4.677l-.397.636l.397-.636Zm.333.208l.398-.636l-.398.636Zm2.72 4.432l.747-.067l-.747.067Zm-.604 1.674a.75.75 0 1 0 1.494-.134l-1.494.134ZM13 10.5l-.386.643a.75.75 0 0 0 .05.028L13 10.5Zm-3.536 1.326l-.069.686l1.492.15l.07-.686l-1.493-.15Zm9.593-1.397l.423-.353l-.96-1.152l-.424.353l.96 1.152Zm-8.25 4.96l.333.208l.795-1.272l-.333-.208l-.795 1.272Zm2.703 4.07l.143 1.608l1.494-.134l-.143-1.607l-1.494.133Zm-.845-8.288a5.878 5.878 0 0 0 6.392-.742l-.96-1.152a4.378 4.378 0 0 1-4.762.552l-.67 1.342Zm-1.525 4.426a5.086 5.086 0 0 1 2.37 3.862l1.494-.133a6.586 6.586 0 0 0-3.07-5.001l-.794 1.272Zm-1.745-3.085a3.036 3.036 0 0 0 1.412 2.877l.795-1.272a1.536 1.536 0 0 1-.715-1.455l-1.492-.15Zm1.561-.536a1.098 1.098 0 0 1 1.658-.833l.772-1.286c-1.634-.98-3.733.073-3.922 1.97l1.492.149Z"/><path stroke="#ffffff" stroke-linecap="round" stroke-width="1.5" d="M19 14V7m0 14v-3"/></g></svg>    
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Purpose</h3>
                </div>
                <input type="text" class="purpose-input" placeholder="Eg : Shopping.." value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff"><g fill="none" stroke="#ffffff" stroke-width="1.5"><path d="M8.796 6.64a2.718 2.718 0 1 1 3.845-3.844l2.563 2.563a2.719 2.719 0 0 1-3.845 3.845L8.796 6.64Z"/><path d="M14 4s-.225 1.168-1.529 2.471C11.167 7.775 10 8 10 8"/><path stroke-linecap="round" d="M4 21.388h2.26c1.01 0 2.033.106 3.016.308a14.85 14.85 0 0 0 5.33.118m-.93-3.297c.12-.014.235-.03.345-.047c.911-.145 1.676-.633 2.376-1.162l1.808-1.365a1.887 1.887 0 0 1 2.22 0c.573.433.749 1.146.386 1.728c-.423.678-1.019 1.545-1.591 2.075m-5.544-1.229a8.176 8.176 0 0 1-.11.012m.11-.012a.998.998 0 0 0 .427-.24a1.492 1.492 0 0 0 .126-2.134a1.9 1.9 0 0 0-.45-.367c-2.797-1.669-7.15-.398-9.779 1.467m9.676 1.274a.524.524 0 0 1-.11.012m0 0a9.274 9.274 0 0 1-1.814.004"/></g></svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Taken From</h3>
                </div>
                <p>${loan.takenFrom}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffffff"><g fill="none" stroke="#ffffffff" stroke-width="1.5"><path stroke-linecap="round" d="M7 4V2.5M17 4V2.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path stroke-linecap="round" d="M21.5 9H10.75M2 9h3.875M14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14v-2c0-3.771 0-5.657 1.172-6.828C4.343 4 6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172C22 6.343 22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828c-.653.654-1.528.943-2.828 1.07"/></g></svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Taken Date</h3>
                </div>
                <p>${loan.planDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="m9.5 14.4l1.429 1.6l3.571-4"/><path d="M2 12c0-4.714 0-7.071 1.464-8.536c1.241-1.24 3.123-1.43 6.536-1.46M22 12c0-4.714 0-7.071-1.465-8.536c-1.24-1.24-3.122-1.43-6.535-1.46"/><path d="M10 22c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 18.2 2 16.8 2 14c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 6.545C5.8 6 7.2 6 10 6h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C22 9.8 22 11.2 22 14c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C18.2 22 16.8 22 14 22"/></g></svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Return Date</h3>
                </div>
                <p style="color:${daysLeft <= 2 ? '#ff4000ff' : daysLeft <= 6 ? '#ffca00' : '#00b900ff'};"> ${cleanEndDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff">
                        <g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="1.5">
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M12 7v5l3 3"/>
                        </g>
                    </svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Days Elapsed</h3>
                </div>
                <p>${daysElapsed} day${daysElapsed === 1 ? '' : 's'}${daysElapsed > 90 ? '' : daysElapsed > 60 ? '' : ''}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="1.5"><path d="M2 12c0-4.714 0-7.07 1.464-8.535C4.705 2.224 6.587 2.035 10 2.005M22 12c0-4.714 0-7.07-1.465-8.535c-1.24-1.241-3.122-1.43-6.535-1.46"/><path d="M10 22c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 18.2 2 16.8 2 14c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 6.545C5.8 6 7.2 6 10 6h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C22 9.8 22 11.2 22 14c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C18.2 22 16.8 22 14 22"/><path stroke-linejoin="round" d="M12 11v6m0 0l2.5-2.5M12 17l-2.5-2.5"/></g></svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Amount Taken</h3>
                </div>
                <p>${formatMoney(loan.takenAmount)}</p>
            </div>

            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"/><path d="M22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464c.974.974 1.3 2.343 1.41 4.536"/></g></svg>
                    <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Interest</h3>
                </div>
                <p>${formatMoney(loan.interest)}</p>
            </div>

            <div class="details">
                ${overdueFine > 0 ? `
                    <div class="leftflow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><g fill="none"><path stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l2.5 2.5"/><path fill="#ffffff" d="m5.604 5.604l-.53-.53l.53.53ZM4.338 6.871l-.75.003a.75.75 0 0 0 .746.747l.004-.75Zm2.542.762a.75.75 0 1 0 .007-1.5l-.007 1.5ZM5.075 4.321a.75.75 0 0 0-1.5.008l1.5-.008ZM3.75 12a.75.75 0 0 0-1.5 0h1.5Zm13.125 8.445a.75.75 0 1 0-.75-1.298l.75 1.298Zm2.272-4.32a.75.75 0 1 0 1.298.75l-1.298-.75ZM5.14 5.07a.75.75 0 1 0 1.056 1.066L5.14 5.071Zm13.722.067c-3.82-3.82-9.993-3.859-13.788-.064l1.06 1.06c3.2-3.199 8.423-3.18 11.668.065l1.06-1.061ZM5.074 5.074L3.808 6.34l1.06 1.06l1.267-1.265l-1.061-1.061Zm-.74 2.547l2.546.012l.007-1.5l-2.545-.012l-.008 1.5Zm.754-.754L5.075 4.32l-1.5.008l.013 2.545l1.5-.007ZM12 3.75A8.25 8.25 0 0 1 20.25 12h1.5A9.75 9.75 0 0 0 12 2.25v1.5Zm0 16.5A8.25 8.25 0 0 1 3.75 12h-1.5A9.75 9.75 0 0 0 12 21.75v-1.5Zm4.125-1.103A8.209 8.209 0 0 1 12 20.25v1.5c1.775 0 3.44-.475 4.875-1.305l-.75-1.298ZM20.25 12a8.209 8.209 0 0 1-1.103 4.125l1.298.75A9.708 9.708 0 0 0 21.75 12h-1.5ZM6.196 6.137A8.221 8.221 0 0 1 12 3.75v-1.5a9.721 9.721 0 0 0-6.86 2.821l1.056 1.066Z"/></g></svg>
                        <h3 style="margin:25px 0;font-weight:600;font-size:15px;">Overdue Fine</h3>
                    </div>
                    <p style='color: #ff4444;'>${formatMoney(overdueFine)} 
                        <small>(${Math.abs(daysLeft)} days)</small>
                    </p>` : ''}
            </div>

            <hr>
            <div class="totaldetails">
                <svg style='width: 30px;height: 30px;margin-top: 25px;opacity: 80%;' xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="#ffffff"><g fill="none" stroke="#ffffff" stroke-width="1.5"><path d="M17.414 10.414C18 9.828 18 8.886 18 7c0-1.886 0-2.828-.586-3.414m0 6.828C16.828 11 15.886 11 14 11h-4c-1.886 0-2.828 0-3.414-.586m10.828 0Zm0-6.828C16.828 3 15.886 3 14 3h-4c-1.886 0-2.828 0-3.414.586m10.828 0Zm-10.828 0C6 4.172 6 5.114 6 7c0 1.886 0 2.828.586 3.414m0-6.828Zm0 6.828ZM13 7a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/><path stroke-linecap="round" d="M18 6a3 3 0 0 1-3-3m3 5a3 3 0 0 0-3 3M6 6a3 3 0 0 0 3-3M6 8a3 3 0 0 1 3 3M4 21.388h2.26c1.01 0 2.033.106 3.016.308a14.85 14.85 0 0 0 5.33.118m-.93-3.297c.12-.014.235-.03.345-.047c.911-.145 1.676-.633 2.376-1.162l1.808-1.365a1.887 1.887 0 0 1 2.22 0c.573.433.749 1.146.386 1.728c-.423.678-1.019 1.545-1.591 2.075m-5.544-1.229a8.176 8.176 0 0 1-.11.012m.11-.012a.998.998 0 0 0 .427-.24a1.492 1.492 0 0 0 .126-2.134a1.9 1.9 0 0 0-.45-.367c-2.797-1.669-7.15-.398-9.779 1.467m9.676 1.274a.524.524 0 0 1-.11.012m0 0a9.274 9.274 0 0 1-1.814.004"/></g></svg>
                <h3 style="margin: 10px 0;font-weight: 600;font-size: 15px;color: #ffffff91;">Total amount to return</h3>
                <p style="font-size:24px;color:${overdueFine > 0 ? '#ff4000ff' : '#00b900ff'};font-weight:bold;">
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

    let html = `<div style="text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    position: sticky;
    top: -20px;
    background: #000000e0;
    padding: 10px 10px 0px 15px;
    width: 100%;
    margin-bottom: 20px;
    border-radius: 1000px;
">
        <span style="    font-weight: 600;
    color: #eee;
    position: relative;
    top: -5px;">${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
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
        <p style='color: #e2b325;font-weight: 600;'><strong>Taken Amount:</strong> ${formatMoney(loan.takenAmount)}</p>
        <p style='color: #e2b325;font-weight: 600;'><strong>Purpose:</strong> ${loan.purpose || 'Not set'}</p>
        <p style='color: #e2b325;font-weight: 600;'><strong>Return date :</strong> ${cleanEnd}</p>
        <hr style='margin: 15px 0px;'>
        <p style='color: #e2b325;font-weight: 600;    font-size: 20px;'><strong>Status:</strong> <span style="color:${daysLeft<=2?'#F44336':daysLeft<=6?'#FFCA28':'#4CAF50'}">
            ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}
        </span></p>
        <button style="margin-top:15px;width:100%;padding:10px;background:#004fff;border-radius:20px;margin-bottom:-5px" onclick="goToList(${idx})">View Full</button>
    `;
    document.getElementById('datePopup').style.display = 'block';
}

function closeDatePopup() { document.getElementById('datePopup').style.display = 'none'; }
function goToList(idx) { closeDatePopup(); switchView('list', true); displayLoanDetails(currentUser.loans[idx], idx); }

function renderLinks() {
    const c = document.getElementById("userLinks");
    c.innerHTML = "";                     // clear previous content

    if (!currentUser.links || currentUser.links.length === 0) {
        // ---- No links → show a message ----
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "user-link empty-message";
        emptyMsg.innerHTML = `
            <i class="fa-solid fa-info-circle"></i>
            No links saved yet.
        `;
        c.appendChild(emptyMsg);
        return;                           // stop here, nothing else to render
    }

    // ---- There are links → render them ----
    currentUser.links.forEach((link, i) => {
        const div = document.createElement("div");
        div.className = "user-link";
        div.innerHTML = `<i class="fa-solid fa-link"></i> ${link.title}`;
        div.onclick = () => { 
            pendingLink = {link, i}; 
            document.getElementById("linkConfirmPopup").style.display = "block"; 
        };
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

    coinSection.addEventListener('click', () => {
      popupOverlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      popupOverlay.classList.remove('active');
    });

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
      }
    });


