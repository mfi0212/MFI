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
        bulbs.forEach(b => { 
            b.style.background = c; 
            b.style.boxShadow = `0 0 30px 8px ${c}`; 
            b.style.opacity = 1; 
        });
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
    if(twinkleInt){ 
        clearInterval(twinkleInt); 
        twinkleInt=null; 
        this.textContent="Twinkle OFF"; 
        bulbs.forEach(b=>b.style.opacity=1); 
    }
    else { 
        this.textContent="Twinkle ON"; 
        startTwinkle(); 
    }
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
    if(discoInt){ 
        clearInterval(discoInt); 
        discoInt=null; 
        this.textContent="Disco OFF"; 
        (modeSelect.value==="single"?applySingleColor():startMode()); 
    }
    else { 
        this.textContent="Disco ON"; 
        clearInterval(modeInt); 
        startDisco(); 
    }
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

const USD_RATE = 87.85;
let currentCurrency = localStorage.getItem('currency') || 'INR';
let currentUser = null;
let currentLoanIndex = null;
let calendarMonth = new Date();
const PINNED_KEY = 'pinnedView';
let pendingLink = null;
let filteredLoans = [];
let hiddenLoans = new Set(); 
let loanChart = null; 

const usersDB = {
    "Mahesh888*": {
        name: "Mahesh Muthinti",
        coins: 400,
        loans: [
            { planDate: "14-01-2026", endDate: "14-03-2026", interest: 2850, takenAmount: 15230, takenFrom: "Golden", fineRate: 50 },
            { planDate: "14-02-2026", endDate: "16-03-2026", interest: 1880, takenAmount: 9500, takenFrom: "Golden", fineRate: 50 },
            { planDate: "09-02-2026", endDate: "08-04-2026", interest: 700, takenAmount: 2800, takenFrom: "Lendlink", fineRate: 50 },
            { planDate: "11-01-2026", endDate: "09-04-2026", interest: 1100, takenAmount: 4380, takenFrom: "Lendlink", fineRate: 50 },
            
        ],
        links: [],
        emote: "https://media.tenor.com/pT6HQx4wIogAAAAj/twitch-rpx-syria.gif"
    },
    "0212": {
        name: "Tony Mantana",
        coins: 4000,
        loans: [
             { planDate: "09-02-2026", endDate: "08-03-2026", interest: 1340, takenAmount: 12460, takenFrom: "Lendlink", fineRate: 50 },
            ],
        links: [],
        emote: "https://media.tenor.com/pT6HQx4wIogAAAAj/twitch-rpx-syria.gif"
    },
};

function parseDate(str) {
    const [dd, mm, yyyy] = str.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
}

function formatDateDDMMYYYY(date) {
    const d = String(date.getDate()).padStart(2,'0');
    const m = String(date.getMonth()+1).padStart(2,'0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatMoney(amount) {
    const val = currentCurrency === 'USD' ? (amount / USD_RATE).toFixed(2) : amount;
    const symbol = currentCurrency === 'USD' ? '$' : '₹';
    return `${symbol}${parseFloat(val).toLocaleString()}`;
}

function updateCoinsDisplay() {
    if (currentUser && document.getElementById('userCoinsDisplay')) {
        document.getElementById('userCoinsDisplay').textContent = currentUser.coins.toLocaleString();
    }
}

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

// === REPLACE YOUR EXISTING checkAndShowRepaymentReminders() FUNCTION WITH THIS UPDATED VERSION ===

function checkAndShowRepaymentReminders() {
    if (!currentUser || !currentUser.loans?.length) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);                    // normalize to start of day

    const remindersByDueDate = {};

    currentUser.loans.forEach((loan, idx) => {
        const end = parseDate(loan.endDate);
        end.setHours(0, 0, 0, 0);

        // NEW LOGIC: Start reminder 3 days before due date
        const reminderStartDate = new Date(end);
        reminderStartDate.setDate(end.getDate() - 3);

        // Show popup from 3 days before due date AND CONTINUE showing every day
        // (including due date + every day after if the loan amount is still displayed)
        if (now >= reminderStartDate) {
            const dueStr = loan.endDate.split('(')[0].trim();

            if (!remindersByDueDate[dueStr]) {
                remindersByDueDate[dueStr] = {
                    dueDate: dueStr,
                    totalAmount: 0,
                    count: 0
                };
            }
            remindersByDueDate[dueStr].totalAmount += loan.takenAmount + loan.interest;
            remindersByDueDate[dueStr].count++;
        }
    });

    // Show one popup per unique due date (grouped like before)
    Object.values(remindersByDueDate).forEach(rem => {
        showRepaymentReminderPopup(rem);
    });
}

function showRepaymentReminderPopup(reminder) {
    const { dueDate, totalAmount, count } = reminder;
    const name = currentUser.name.split(" ")[0] || currentUser.name;
    const loansText = count > 2 ? `(${count} loans)` : '';

    const modal = document.createElement("div");
    modal.className = "reminder-modal";
    modal.innerHTML = `
        <div class="reminder-content">
            <div class="reminder-header">
                <button class="reminder-close-btn" title="Close reminder">×</button>
            </div>
            <div class="reminder-body">
                <p>Mr. ${name} you have <strong>${formatMoney(totalAmount)}</strong> to return on <br><strong>${dueDate}</strong>${loansText}. Return before the end date or extra charges will be added.</p>
            </div>
            <div class="reminder-actions">
                <button class="reminder-btn delay"  data-action="delay"><a href="https://mfi0212.github.io/swan/offer/solution">Explore Solutions</a></button>
            </div>
        </div>
    `;

    modal.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'delay') {
            alert("We are redirecting you to BS&MFI Solutions page..!");
        }
        else if (action === 'close') {
            modal.remove();
        }
    });

    modal.querySelector('.reminder-close-btn').onclick = () => {
        modal.remove();
    };

    document.body.appendChild(modal);
}

function handleReminderAction(action) {
    if (action === 'delay') {
        alert("Delay requested → Please implement date selection / fee logic here");
    } else if (action === 'split') {
        alert("Split payment requested → Please implement partial payment flow here");
    }
    document.querySelectorAll('.reminder-modal').forEach(m => m.remove());
}

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
        setTimeout(checkAndShowRepaymentReminders, 1400);

    } else {
        err.textContent = "Invalid password!";
    }
};

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

document.getElementById('currencySwitch').onclick = toggleCurrency;

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

function displayLoanDetails(loan, index) {
    currentLoanIndex = index;
    const now = new Date();
    const cleanEndDate = loan.endDate.split('(')[0].trim();
    const endDate = new Date(cleanEndDate.split('-').reverse().join('-'));
    const daysLeft = Math.ceil((endDate - now) / 86400000);
    let overdueFine = daysLeft < 0 ? Math.abs(daysLeft) * loan.fineRate : 0;
    const totalPayable = loan.takenAmount + loan.interest + overdueFine;

    const [d, m, y] = loan.planDate.split('-').map(Number);
    const takenDate = new Date(y, m - 1, d);
    const daysElapsed = Math.floor((now - takenDate) / 86400000);

    document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
    const btns = document.getElementById("amountButtons").children;
    if (btns[filteredLoans.indexOf(loan)]) btns[filteredLoans.indexOf(loan)].classList.add("active");

    document.getElementById("loanDetails").innerHTML = `
        <div class="loan-entry">
            <div class="details" style="transform: none;">
                <div class="leftflow">
                   <svg class="strokeadder" id="Layer_1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m17.009 5.577c.034-2.157.173-2.417.594-2.838.637-.637.607-.62.719-.732 1.016-1.016 1.889-1.21 2.375-.819.517.414.214 1.905.214 1.905s1.492-.304 1.905.214c.379.475.201 1.351-.823 2.375-.112.112-.094.081-.73.717-.487.487-.663.58-2.846.597l-3.711 3.711c-.391.391-1.023.391-1.414 0s-.391-1.023 0-1.414l3.716-3.716zm5.771 3.269c-.085-.544-.583-.917-1.143-.834-.546.085-.919.597-.834 1.143.13.834.196 1.792.196 2.846 0 6.561-2.439 9-9 9s-8.999-2.44-8.999-9.001 2.439-9 9-9c1.053 0 2.01.066 2.846.197.559.085 1.058-.289 1.143-.834.085-.546-.288-1.057-.834-1.143-.938-.146-1.999-.22-3.154-.22-7.711 0-11.001 3.29-11.001 11s3.29 11 11 11 11-3.29 11-11c0-1.173-.072-2.205-.22-3.154zm-8.783-2.737c.041-.551-.372-1.03-.923-1.071-.34-.025-.698-.038-1.074-.038-4.841 0-7 2.159-7 7s2.159 7 7 7 7-2.159 7-7c0-.376-.013-.734-.038-1.074-.041-.551-.514-.965-1.071-.923-.551.041-.964.52-.923 1.071.021.293.032.602.032.926 0 3.738-1.262 5-5 5s-5-1.262-5-5 1.262-5 5-5c.325 0 .633.01.926.032.54.041 1.03-.373 1.071-.923zm-2.763 3.644c-.373-.404-1.006-.432-1.413-.057-.553.51-.821 1.264-.821 2.304 0 1.991 1.009 3 3 3 1.041 0 1.795-.269 2.305-.821.374-.406.349-1.039-.058-1.413-.406-.375-1.038-.349-1.413.057-.049.054-.229.178-.834.178-.878 0-1-.122-1-1 0-.605.124-.785.178-.834.406-.375.431-1.007.057-1.413z"/></svg>
                   <h3>Purpose</h3>
                </div>
                <input type="text" class="purpose-input" placeholder="Eg : Shopping.." value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg class="strokeadder" xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 1" viewBox="0 0 24 24"><path d="m4,6.081c0-1.665,1.583-3.475,3.14-4.224-.183-.183-.359-.383-.51-.598-.372-.528.049-1.259.695-1.259h2.347c.683,0,1.056.776.651,1.326-.14.19-.298.368-.462.531,1.557.75,3.138,2.559,3.138,4.223,0,1.61-1.233,2.919-2.75,2.919h-3.5c-1.517,0-2.75-1.31-2.75-2.919Zm11.707-1.788l1.293-1.293v3c0,.552.447,1,1,1s1-.448,1-1v-3l1.293,1.293c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023,0-1.414l-2.293-2.293c-.373-.374-.859-.568-1.35-.584-.021-.001-.042-.002-.064-.002s-.043,0-.064.002c-.491.016-.977.21-1.35.584l-2.293,2.293c-.391.391-.391,1.023,0,1.414s1.023.391,1.414,0Zm7.441,4.388c-.515-.469-1.186-.712-1.878-.678-.697.032-1.339.334-1.794.835l-3.541,3.737c.032.21.065.42.065.638,0,2.083-1.555,3.876-3.617,4.17l-4.252.596c-.547.078-1.053-.302-1.131-.848-.078-.547.302-1.053.848-1.131l4.162-.583c.936-.134,1.748-.806,1.94-1.732.296-1.425-.79-2.685-2.164-2.685h-7.787c-2.209,0-4,1.791-4,4v5c0,2.209,1.791,4,4,4h4.262c2.805,0,5.48-1.178,7.374-3.246l7.702-8.409c.948-1.062.862-2.707-.189-3.665Z"/></svg>
                    <h3>Taken From</h3>
                </div>
                <p>${loan.takenFrom}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_3" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="m18.5,2h-.5v-.5c0-.829-.672-1.5-1.5-1.5s-1.5.671-1.5,1.5v.5h-6v-.5c0-.829-.672-1.5-1.5-1.5s-1.5.671-1.5,1.5v.5h-.5C2.468,2,0,4.467,0,7.5v11c0,3.033,2.468,5.5,5.5,5.5h13c3.032,0,5.5-2.467,5.5-5.5V7.5c0-3.033-2.468-5.5-5.5-5.5Zm0,19H5.5c-1.379,0-2.5-1.122-2.5-2.5v-9.5h18v9.5c0,1.378-1.121,2.5-2.5,2.5Zm-8.5-8.5v2c0,.828-.672,1.5-1.5,1.5h-2c-.828,0-1.5-.672-1.5-1.5v-2c0-.828.672-1.5,1.5-1.5h2c.828,0,1.5.672,1.5,1.5Z"/></svg>
                    <h3>Taken Date</h3>
                </div>
                <p>${loan.planDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_4" viewBox="0 0 24 24" width="512" height="512"><path d="M18.5,2H18V1.5A1.5,1.5,0,0,0,16.5,0h0A1.5,1.5,0,0,0,15,1.5V2H9V1.5A1.5,1.5,0,0,0,7.5,0h0A1.5,1.5,0,0,0,6,1.5V2H5.5A5.5,5.5,0,0,0,0,7.5v11A5.5,5.5,0,0,0,5.5,24h13A5.5,5.5,0,0,0,24,18.5V7.5A5.5,5.5,0,0,0,18.5,2Zm0,19H5.5A2.5,2.5,0,0,1,3,18.5V10H21v8.5A2.5,2.5,0,0,1,18.5,21Z"/></svg>
                    <h3>Return Date</h3>
                </div>
                <p style="color:${daysLeft <= 2 ? '#ff1100' : daysLeft <= 6 ? '#ffbf00' : '#00d423'};"> ${cleanEndDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                   <?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_5" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M10,22.5c0,.829-.671,1.5-1.5,1.5h-3c-3.033,0-5.5-2.467-5.5-5.5V7.5C0,4.467,2.467,2,5.5,2h.5v-.5c0-.829,.671-1.5,1.5-1.5s1.5,.671,1.5,1.5v.5h6v-.5c0-.829,.672-1.5,1.5-1.5s1.5,.671,1.5,1.5v.5h.5c3.032,0,5.5,2.467,5.5,5.5,0,.829-.672,1.5-1.5,1.5H3v9.5c0,1.378,1.122,2.5,2.5,2.5h3c.829,0,1.5,.671,1.5,1.5Zm14-5c0,3.59-2.91,6.5-6.5,6.5s-6.5-2.91-6.5-6.5,2.91-6.5,6.5-6.5,6.5,2.91,6.5,6.5Zm-4.156,.223l-.844-.844v-1.379c0-.828-.672-1.5-1.5-1.5s-1.5,.672-1.5,1.5v1.793c0,.53,.211,1.039,.586,1.414l1.137,1.137c.586,.586,1.535,.586,2.121,0,.586-.586,.586-1.535,0-2.121Z"/></svg>

                    <h3>Days Elapsed</h3>
                </div>
                <p>${daysElapsed} day${daysElapsed === 1 ? '' : 's'}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg id="Layer_6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m8.76 8.124c0-.428-.334-.844-.764-.854-1.453 0-2.634-1.182-2.634-2.634 0-1.1.679-2.042 1.639-2.436v-.198c0-.552.448-1 1-1s1 .448 1 1v.207c.362.15.692.373.959.671.368.412.333 1.044-.078 1.412-.413.368-1.045.333-1.412-.078-.071-.079-.227-.212-.473-.212-.35 0-.634.285-.634.635-.001.377.329.671.694.617 1.516.09 2.703 1.351 2.703 2.871 0 1.19-.727 2.213-1.759 2.65v.226c0 .552-.448 1-1 1s-1-.448-1-1v-.139c-.838-.271-1.527-.919-1.83-1.779-.184-.521.089-1.092.61-1.276.523-.184 1.092.089 1.276.61.124.349.456.584.827.584.483 0 .876-.393.876-.876zm4.741-1.624h2.5v1.5c0 .379.214.725.553.894.338.169.744.133 1.048-.095 1.215-.912 2.291-1.988 3.199-3.2.267-.355.267-.844 0-1.199-.908-1.212-1.984-2.288-3.199-3.2-.303-.227-.708-.265-1.048-.095s-.553.516-.553.894v1.5h-2.5c-.829 0-1.5.671-1.5 1.5s.671 1.5 1.5 1.5zm9.421 5.386c-.164-.647-.57-1.192-1.144-1.533-1.183-.705-2.72-.315-3.427.869-1.03 1.731-2.199 3.153-3.595 4.288-.372 1.02-1.156 1.857-2.214 2.275-1.006.429-2.568 1.112-4.543 1.215-.509 0-.945-.387-.995-.904-.053-.55.35-1.038.9-1.091 1.581-.152 2.971-.684 3.879-1.069.76-.301 1.217-.971 1.217-1.759 0-.752-.502-1.429-1.221-1.644-.008 0-1.779-.532-4.279-.532-2.985 0-5.081.497-5.19.519-.381.074-.686.362-.78.739-.021.086-.53 2.143-.53 4.242s.508 4.156.53 4.242c.094.375.395.663.774.738.106.021 2.632.52 5.696.52 6.431.026 11.306-3.592 14.648-9.22.342-.573.439-1.246.274-1.893z"/></svg>
                    <h3>Amount Taken</h3>
                </div>
                <p>${formatMoney(loan.takenAmount)}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_7" data-name="Layer 1" viewBox="0 0 24 24"><path d="m7,7.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm13,0c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5,1.5.672,1.5,1.5,1.5,1.5-.672,1.5-1.5Zm-14.5,5.5c-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5,1.5-.672,1.5-1.5-.672-1.5-1.5-1.5ZM18.5,2H5.5C2.468,2,0,4.467,0,7.5v7c0,3.032,2.468,5.5,5.5,5.5h5c.828,0,1.5-.672,1.5-1.5s-.672-1.5-1.5-1.5h-5c-1.379,0-2.5-1.121-2.5-2.5v-7c0-1.378,1.121-2.5,2.5-2.5h13c1.379,0,2.5,1.122,2.5,2.5v4c0,.829.672,1.5,1.5,1.5s1.5-.671,1.5-1.5v-4c0-3.033-2.468-5.5-5.5-5.5Zm4,19c-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5,1.5-.672,1.5-1.5-.672-1.5-1.5-1.5Zm-5.5-4.5c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5,1.5.672,1.5,1.5,1.5,1.5-.672,1.5-1.5Zm5.46-1.152c-.636-.529-1.581-.445-2.112.192l-5,6c-.53.636-.444,1.582.192,2.112.28.233.62.348.959.348.43,0,.856-.184,1.153-.54l5-6c.53-.636.444-1.582-.192-2.112Zm-7.46-4.348c0-1.657-1.343-3-3-3s-3,1.343-3,3,1.343,3,3,3,3-1.343,3-3Z"/></svg>
                    <h3>Interest</h3>
                </div>
                <p>${formatMoney(loan.interest)}</p>
            </div>
            <div class="details">
                ${overdueFine > 0 ? `
                    <div class="leftflow">
                        <svg class="strokeadder"  style="background: #ff1414;" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><g fill="none"><path  stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l2.5 2.5"/><path  d="m5.604 5.604l-.53-.53l.53.53ZM4.338 6.871l-.75.003a.75.75 0 0 0 .746.747l.004-.75Zm2.542.762a.75.75 0 1 0 .007-1.5l-.007 1.5ZM5.075 4.321a.75.75 0 0 0-1.5.008l1.5-.008ZM3.75 12a.75.75 0 0 0-1.5 0h1.5Zm13.125 8.445a.75.75 0 1 0-.75-1.298l.75 1.298Zm2.272-4.32a.75.75 0 1 0 1.298.75l-1.298-.75ZM5.14 5.07a.75.75 0 1 0 1.056 1.066L5.14 5.071Zm13.722.067c-3.82-3.82-9.993-3.859-13.788-.064l1.06 1.06c3.2-3.199 8.423-3.18 11.668.065l1.06-1.061ZM5.074 5.074L3.808 6.34l1.06 1.06l1.267-1.265l-1.061-1.061Zm-.74 2.547l2.546.012l.007-1.5l-2.545-.012l-.008 1.5Zm.754-.754L5.075 4.32l-1.5.008l.013 2.545l1.5-.007ZM12 3.75A8.25 8.25 0 0 1 20.25 12h1.5A9.75 9.75 0 0 0 12 2.25v1.5Zm0 16.5A8.25 8.25 0 0 1 3.75 12h-1.5A9.75 9.75 0 0 0 12 21.75v-1.5Zm4.125-1.103A8.209 8.209 0 0 1 12 20.25v1.5c1.775 0 3.44-.475 4.875-1.305l-.75-1.298ZM20.25 12a8.209 8.209 0 0 1-1.103 4.125l1.298.75A9.708 9.708 0 0 0 21.75 12h-1.5ZM6.196 6.137A8.221 8.221 0 0 1 12 3.75v-1.5a9.721 9.721 0 0 0-6.86 2.821l1.056 1.066Z"/></g></svg>
                        <h3>Overdue Fine</h3>
                    </div>
                    <p style='color: #ff4444;'>${formatMoney(overdueFine)} 
                        <small>(${Math.abs(daysLeft)} days)</small>
                    </p>` : ''}
            </div>

            <hr>
            <div class="totaldetails">
                <svg style='width: 30px;height: 30px;margin-top: 25px;opacity: 80%;' xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" ><g fill="none"  stroke-width="1.5"><path d="M17.414 10.414C18 9.828 18 8.886 18 7c0-1.886 0-2.828-.586-3.414m0 6.828C16.828 11 15.886 11 14 11h-4c-1.886 0-2.828 0-3.414-.586m10.828 0Zm0-6.828C16.828 3 15.886 3 14 3h-4c-1.886 0-2.828 0-3.414.586m10.828 0Zm-10.828 0C6 4.172 6 5.114 6 7c0 1.886 0 2.828.586 3.414m0-6.828Zm0 6.828ZM13 7a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/><path stroke-linecap="round" d="M18 6a3 3 0 0 1-3-3m3 5a3 3 0 0 0-3 3M6 6a3 3 0 0 0 3-3M6 8a3 3 0 0 1 3 3M4 21.388h2.26c1.01 0 2.033.106 3.016.308a14.85 14.85 0 0 0 5.33.118m-.93-3.297c.12-.014.235-.03.345-.047c.911-.145 1.676-.633 2.376-1.162l1.808-1.365a1.887 1.887 0 0 1 2.22 0c.573.433.749 1.146.386 1.728c-.423.678-1.019 1.545-1.591 2.075m-5.544-1.229a8.176 8.176 0 0 1-.11.012m.11-.012a.998.998 0 0 0 .427-.24a1.492 1.492 0 0 0 .126-2.134a1.9 1.9 0 0 0-.45-.367c-2.797-1.669-7.15-.398-9.779 1.467m9.676 1.274a.524.524 0 0 1-.11.012m0 0a9.274 9.274 0 0 1-1.814.004"/></g></svg>
                <h3 style="margin: 10px 0;font-weight: 600;font-size: 15px;color: #ffffff91;">Total amount to return</h3>
                <p style="font-size:60px;color:${overdueFine > 0 ? '#ff4000ff' : '#00b900ff'};
    font-weight: 600;
    font-family: 'Anton', sans-serif;
    letter-spacing: 4.5px;">
                    ${formatMoney(totalPayable)}
                </p>
            </div>
             <a target="_blank" href="https://forms.gle/RzTJ8W9bwmm8DVj2A"><button style="background-color: rgb(255 0 0 / 69%); padding: 10px; font-size: 13px; transition: all 0.3s ease; box-shadow: ... ; border: solid 1px #ffffff3b; width: 80%; left: 50%; max-width:300px; position: relative; transform: translate(-50%, 0%); margin-bottom: 10px; margin-top: 10px;" class="add-link-btn">I have an issue with my account.!</button></a>
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
        btn.onclick = () => { 
            displayLoanDetails(loan, originalIndex); 
            switchView('list', false); 
        };
        container.appendChild(btn);
    });
}
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
        <p style="font-size: 20px; margin-top: 10px; margin-bottom: -5px;">Total to Return: <strong>${formatMoney(total)}</strong></p>
    `;
    document.getElementById("totalPopup").style.display = "block";
}

function closeTotalPopup() { 
    document.getElementById("totalPopup").style.display = "none"; 
}

function renderChart() {
    const ctx = document.getElementById('loanChart').getContext('2d');
    const now = new Date();

    const visibleLabels = [];
    const visibleData = [];
    const colors = [];
    const loanIndices = []; 
    currentUser.loans.forEach((loan, originalIdx) => {
        if (hiddenLoans.has(originalIdx)) return;

        const clean = loan.endDate.split('(')[0].trim();
        const end = new Date(clean.split('-').reverse().join('-'));
        const daysLeft = Math.ceil((end - now) / 86400000);

        let color = '#0011ff';
        if (daysLeft <= 2) color = '#ff1100';
        else if (daysLeft <= 6) color = '#ffbf00';

        const amount = currentCurrency === 'USD' 
            ? Number((loan.takenAmount / USD_RATE).toFixed(2))
            : Number(loan.takenAmount);

        visibleLabels.push(`Loan ${originalIdx + 1} • ${daysLeft} days left`);
        visibleData.push(amount);
        colors.push(color);
        loanIndices.push(originalIdx);
    });

    const chartElement = document.getElementById('loanChart');
    if (visibleData.length === 0) {
        if (chartElement) {
            chartElement.style.opacity = '0.25';
            chartElement.style.transition = 'opacity 0.6s ease';
        }
        if (loanChart) loanChart.update();
        renderLoanList();
        return;
    }

    if (chartElement) {
        chartElement.style.opacity = '1';
        chartElement.style.transition = 'opacity 0.6s ease';
    }

    if (!loanChart) {
        loanChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: visibleLabels,
                datasets: [{
                    data: visibleData,
                    backgroundColor: colors,
                    borderWidth: 4,
                    borderColor: '#000000',
                    hoverOffset: 30
                }]
            },
            options: {
                responsive: true,
                cutout: '42%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30,30,40,0.95)',
                        titleColor: '#fff',
                        bodyColor: '#ddd',
                        padding: 12
                    }
                },
                animation: {
                    duration: 1200,          
                    easing: 'easeOutQuart', 
                    animateRotate: true, 
                    animateScale: true
                }
            }
        });
    } else {
        loanChart.data.labels = visibleLabels;
        loanChart.data.datasets[0].data = visibleData;
        loanChart.data.datasets[0].backgroundColor = colors;
        loanChart.update();
    }

    renderLoanList();
}
function renderLoanList() {
    const container = document.getElementById('loans-list-container');
    if (!container) return;

    container.style.transition = 'opacity 0.4s ease';
    container.style.opacity = '0';

    setTimeout(() => {
        container.innerHTML = '';

        currentUser.loans.forEach((loan, idx) => {
            const isHidden = hiddenLoans.has(idx);

            const row = document.createElement('div');
            row.className = 'loan-row' + (isHidden ? ' hidden-loan' : '');

            if (!isHidden) {
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                row.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            }

            const daysLeft = calculateDaysLeft(loan.endDate);
            const amount = currentCurrency === 'USD'
                ? (loan.takenAmount / USD_RATE).toFixed(2)
                : loan.takenAmount;

            row.innerHTML = `
                <div class="loan-info">
                    <span class="loan-title">Loan ${idx + 1}</span>
                    <span class="loan-amount">${amount} ${currentCurrency}</span>
                    <span class="loan-days ${daysLeft <= 2 ? 'urgent' : daysLeft <= 6 ? 'warning' : 'safe'}">
                        ${daysLeft} days left
                    </span>
                </div>
                <div class="loan-actions">
                <button class="btn-hide" data-idx="${idx}">
                    ${isHidden ? '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2048 2048"><path  d="M1024 768q79 0 149 30t122 82t83 123t30 149q0 80-30 149t-82 122t-123 83t-149 30q-80 0-149-30t-122-82t-83-122t-30-150q0-79 30-149t82-122t122-83t150-30zm0 640q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100q0 53 20 99t55 82t81 55t100 20zm0-1152q143 0 284 35t266 105t226 170t166 234q40 83 61 171t21 181h-128q0-118-36-221t-99-188t-150-152t-185-113t-209-70t-217-24q-108 0-217 24t-208 70t-186 113t-149 152t-100 188t-36 221H0q0-92 21-180t61-172q64-132 165-233t227-171t266-104t284-36z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2048 2048"><path  d="m74 292l90-90l1630 1629l-91 91l-457-457q-54 35-105 53t-117 18q-80 0-150-30t-122-82t-82-122t-30-150q0-65 18-116t53-106L391 610Q266 715 197 851t-69 301H0q0-91 21-179t60-170t94-153t126-130L74 292zm694 860q0 53 20 99t55 82t81 55t100 20q36 0 67-9t62-27l-349-349q-17 31-26 62t-10 67zm328-245L963 774l30-4q15-2 31-2q79 0 149 30t122 82t83 123t30 149q0 15-2 30t-4 31l-133-133q-42-131-173-173zm952 245h-128q0-118-36-221t-99-188t-150-152t-185-113t-208-70t-218-24q-98 0-192 19t-185 56l-98-98q116-53 231-79t244-26q144 0 285 35t265 105t226 170t166 234q40 82 61 171t21 181z"/></svg>'}
                </button>
                <button class="btn-details" data-idx="${idx}"><svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M18.5,0H5.5C2.47,0,0,2.47,0,5.5v13c0,3.03,2.47,5.5,5.5,5.5h13c3.03,0,5.5-2.47,5.5-5.5V5.5c0-3.03-2.47-5.5-5.5-5.5Zm2.5,18.5c0,1.38-1.12,2.5-2.5,2.5H5.5c-1.38,0-2.5-1.12-2.5-2.5V5.5c0-1.38,1.12-2.5,2.5-2.5h13c1.38,0,2.5,1.12,2.5,2.5v13ZM5,6.5c0-.83,.67-1.5,1.5-1.5H14.5c.83,0,1.5,.67,1.5,1.5s-.67,1.5-1.5,1.5H6.5c-.83,0-1.5-.67-1.5-1.5Zm14,5.5c0,.83-.67,1.5-1.5,1.5H6.5c-.83,0-1.5-.67-1.5-1.5s.67-1.5,1.5-1.5h11c.83,0,1.5,.67,1.5,1.5Zm-9,5.5c0,.83-.67,1.5-1.5,1.5h-2c-.83,0-1.5-.67-1.5-1.5s.67-1.5,1.5-1.5h2c.83,0,1.5,.67,1.5,1.5Z"/></svg></button>
            </div>
            `;

            container.appendChild(row);

            if (!isHidden) {
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 30);
            }
        });
        container.querySelectorAll('.btn-hide').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (hiddenLoans.has(idx)) {
                    hiddenLoans.delete(idx);
                } else {
                    hiddenLoans.add(idx);
                }
                renderChart();
            });
        });

        container.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                showDatePopup(idx);
            });
        });

        container.style.opacity = '1';
    }, 420);
}

function calculateDaysLeft(endDateStr) {
    const clean = endDateStr.split('(')[0].trim();
    const end = new Date(clean.split('-').reverse().join('-'));
    const now = new Date();
    return Math.ceil((end - now) / 86400000);
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
    width: 95%;
    margin-bottom: 20px;
    margin-top: 5px;
    border-radius: 1008px;
    padding: 5px 5px 5px 20px;
    transition: all 0.3s ease;
    transform: translate(-50%, 0);
    left: 50%;
    position: relative;
    box-shadow: inset 0 0 0 1px 
 color-mix(in srgb, #ffffff00 calc(var(--glass-reflex-light) * 10%), transparent), inset 2.8px 2px 2px -2px 
 color-mix(in srgb, #ffffff4a calc(var(--glass-reflex-light) * 90%), transparent), inset -2.5px -1px 3px -2px 
 color-mix(in srgb, #ffffff54 calc(var(--glass-reflex-light) * 80%), transparent), inset -4px -7px 6px -7px 
 color-mix(in srgb, #ffffff5e calc(var(--glass-reflex-light) * 60%), transparent), inset -0.3px -1px 4px 0px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 12%), transparent), inset -1.5px 2.5px 0px -2px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent), inset 0px 3px 4px -2px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent), inset 2px -6.5px 1px -4px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent), 0px 1px 5px 0px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent), 0px 6px 16px 0px 
 color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
    border: solid 1px #ffffff00;
    background: #0020ff;
">
        <span style="font-weight: 600;
    color: #eee;
    font-size: 16px;
    letter-spacing: 0px;">${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="move-asaid" onclick="prevMonth()"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="move-asaid" onclick="nextMonth()"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div style="display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    text-align: center;
    color: #888;
    font-weight: 600;
    background: linear-gradient(0deg, #ffffff1a, transparent);
    padding: 15px;
    border-radius: 31px;
    margin-top: -15px;">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>`;

    for (let i = 0; i < first; i++) html += `<div></div>`;
    for (let d = 1; d <= days; d++) {
        const ds = `${String(d).padStart(2,'0')}-${String(m+1).padStart(2,'0')}-${y}`;
        const idx = dueMap[ds];
        let style = `border-radius:12px;cursor:${idx!==undefined?'pointer':'default'};transition:all .2s;`;
        if (idx !== undefined) {
            const end = new Date(currentUser.loans[idx].endDate.split('(')[0].trim().split('-').reverse().join('-'));
            const daysLeft = Math.ceil((end - today) / 86400000);
            let bg = '#00bb06';
            if (daysLeft <= 2) bg = '#ff1100';
            else if (daysLeft <= 6) bg = '#ffbf00';
            style += `background:${bg};color:white;font-weight:bold;`;
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
        <hr style='margin: 5px;'>
        <p style='color: #e2b325;font-weight: 600;    font-size: 20px;'><strong>Status:</strong> <span style="color:${daysLeft<=2?'#F44336':daysLeft<=6?'#FFCA28':'#4CAF50'}">
            ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}
        </span></p>
        <div class="detailbuttons" style="display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 0px;
    margin-bottom: -10px;">
    <button style="width: 100%;
    padding: 8px;
    background: #0026ff;
    border-radius: 20px;" onclick="goToList(${idx})">View Full Details</button>
    <button onclick="closeDatePopup()" style="width: 100%;
    padding: 8px;
    background: #ff0000;
    border-radius: 20px;background-color: red;" onclick="goToList(${idx})">Close Now</button>
</div>
    `;
    document.getElementById('datePopup').style.display = 'block';
}

function closeDatePopup() { document.getElementById('datePopup').style.display = 'none'; }
function goToList(idx) { closeDatePopup(); switchView('list', true); displayLoanDetails(currentUser.loans[idx], idx); }

function renderLinks() {
    const c = document.getElementById("userLinks");
    c.innerHTML = "";                

    if (!currentUser.links || currentUser.links.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "user-link empty-message";
        emptyMsg.innerHTML = `
            <i class="fa-solid fa-info-circle"></i>
            No links saved yet.
        `;
        c.appendChild(emptyMsg);
        return;                          
    }
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
    window.open(pendingLink.link.url, '_parent');
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


const container = document.getElementById('glowContainer');
const toggle = document.getElementById('glowToggle');
const STORAGE_KEY = 'siriEdgeGlowState';
const savedState = localStorage.getItem(STORAGE_KEY);
let isOn = savedState === 'on';

function updateGlow() {
    if (isOn) {
        container.classList.add('on');
    } else {
        container.classList.remove('on');
    }
    toggle.checked = isOn;
}

toggle.addEventListener('change', function() {
    isOn = toggle.checked;
    localStorage.setItem(STORAGE_KEY, isOn ? 'on' : 'off');
    updateGlow();
});
updateGlow();

window.onload = () => {
    const saved = localStorage.getItem('userBG');
    if (saved === 'black') {
        applyBlack();
    } else if (saved) {
        applyImage(saved, false);
    }

    loadUserData();
    updateCurrencyUI();

    const savedPass = localStorage.getItem('lastPassword');
    if (savedPass) {
        setTimeout(() => {
            document.getElementById("userPassword").value = savedPass;
        }, 300);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    let helperButton = document.querySelector(".helper-button");
    if (helperButton) {
        helperButton.classList.add("animated-border");
        setTimeout(() => {
            helperButton.classList.remove("animated-border");
        }, 10000000);
    }
});
