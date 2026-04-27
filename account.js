document.addEventListener('contextmenu', e => e.preventDefault());

const USD_RATE = 87.85;
let currentCurrency = localStorage.getItem('currency') || 'Inr (₹)';
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
        coins: 0,
        loans: [

            { planDate: "09-02-2026", endDate: "07-05-2026", interest: 875, takenAmount: 3500, takenFrom: "Lendlink", fineRate: 35 },
            { planDate: "11-01-2026", endDate: "08-05-2026", interest: 1370, takenAmount: 5480, takenFrom: "Golden", fineRate: 40 },
            { planDate: "14-01-2026", endDate: "11-05-2026", interest: 4220, takenAmount: 22813, takenFrom: "Golden", fineRate: 65 },
            { planDate: "14-02-2026", endDate: "13-05-2026", interest: 2500, takenAmount: 10000, takenFrom: "Golden", fineRate: 65 },
            { planDate: "19-04-2026", endDate: "19-05-2026", interest: 300, takenAmount: 2000, takenFrom: "Lenlink", fineRate: 35 },
        ],
        links: [],
       emote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif"
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
    const val = currentCurrency === 'Usd ($)' ? (amount / USD_RATE).toFixed(2) : amount;
    const symbol = currentCurrency === 'Usd ($)' ? '$' : '₹';
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
                <button class="reminder-close-btn" title="Close reminder"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M256-227.69 227.69-256l224-224-224-224L256-732.31l224 224 224-224L732.31-704l-224 224 224 224L704-227.69l-224-224-224 224Z"/></svg></button>
            </div>
            <img style="width: 100px;" src="https://raw.githubusercontent.com/goforbg/telegram-emoji-gifs/refs/heads/master/trumpet.gif" alt="">
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
        alert("Delay requested → Implement date selection / fee logic here");
    } else if (action === 'split') {
        alert("Split payment requested → Implement partial payment flow here");
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
        currentCurrency === 'Usd ($)' ? '' : '';
}

function toggleCurrency() {
    currentCurrency = currentCurrency === 'Inr (₹)' ? 'Usd ($)' : 'Inr (₹)';
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
                  <?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,7c-2.757,0-5,2.243-5,5s2.243,5,5,5,5-2.243,5-5-2.243-5-5-5Zm0,8c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Zm12-4h-2.05c-.471-4.717-4.233-8.48-8.95-8.95V0h-2V2.05C6.283,2.52,2.52,6.283,2.05,11H0v2H2.05c.471,4.717,4.233,8.48,8.95,8.95v2.05h2v-2.05c4.717-.471,8.48-4.233,8.95-8.95h2.05v-2Zm-12,9c-4.411,0-8-3.589-8-8S7.589,4,12,4s8,3.589,8,8-3.589,8-8,8Z"/></svg>
<h3>Purpose</h3>
                </div>
                <input type="text" class="purpose-input" placeholder="Eg : Shopping.." value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
            </div>
            <div class="details">
                <div class="leftflow">
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m24,12c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0c.553,0,1,.447,1,1s-.447,1-1,1C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10c0-.553.447-1,1-1s1,.447,1,1ZM22,0h-4c-.553,0-1,.447-1,1s.447,1,1,1h2.586l-3.293,3.293c-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293l3.293-3.293v2.586c0,.553.447,1,1,1s1-.447,1-1V2c0-1.103-.897-2-2-2Zm-9,6c0-.553-.447-1-1-1s-1,.447-1,1v1c-1.654,0-3,1.346-3,3,0,1.359.974,2.51,2.315,2.733l3.04.506c.374.062.645.382.645.761,0,.552-.448,1-1,1h-2.268c-.356,0-.688-.191-.867-.501-.276-.479-.887-.643-1.366-.364-.478.276-.642.888-.364,1.366.534.925,1.53,1.499,2.598,1.499h.268v1c0,.553.447,1,1,1s1-.447,1-1v-1c1.654,0,3-1.346,3-3,0-1.359-.974-2.51-2.315-2.733l-3.04-.506c-.374-.062-.645-.382-.645-.761,0-.552.448-1,1-1h2.268c.356,0,.688.191.867.501.275.478.886.642,1.366.364.478-.276.642-.888.364-1.366-.534-.925-1.53-1.499-2.598-1.499h-.268v-1Z"/>
</svg>


<h3>Taken From</h3>
                </div>
                <p>${loan.takenFrom}</p>
            </div>
            <div class="details">
                <div class="leftflow"><svg xmlns="http://www.w3.org/2000/svg" id="Layer_3" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="m8,12h-2c-1.103,0-2,.897-2,2v2c0,1.103.897,2,2,2h2c1.103,0,2-.897,2-2v-2c0-1.103-.897-2-2-2Zm-2,4v-2h2v2s-2,0-2,0ZM19,2h-1v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-8v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5Zm-14,2h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3v-9h20v9c0,1.654-1.346,3-3,3Z"/></svg>
<h3>Taken Date</h3>
                </div>
                <p>${loan.planDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_4" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M19,2h-1V1c0-.552-.448-1-1-1s-1,.448-1,1v1H8V1c0-.552-.448-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm-3-6c0,.552-.448,1-1,1h-6c-.552,0-1-.448-1-1s.448-1,1-1h6c.552,0,1,.448,1,1Z"/></svg>
<h3>Return Date</h3>
                </div>
                <p style="color:${daysLeft <= 2 ? '#ff1100' : daysLeft <= 6 ? '#ffbf00' : '#00d423'};"> ${cleanEndDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_5" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M17,10.039c-3.859,0-7,3.14-7,7,0,3.838,3.141,6.961,7,6.961s7-3.14,7-7c0-3.838-3.141-6.961-7-6.961Zm0,11.961c-2.757,0-5-2.226-5-4.961,0-2.757,2.243-5,5-5s5,2.226,5,4.961c0,2.757-2.243,5-5,5Zm1.707-4.707c.391,.391,.391,1.023,0,1.414-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-1-1c-.188-.188-.293-.442-.293-.707v-2c0-.552,.447-1,1-1s1,.448,1,1v1.586l.707,.707Zm5.293-10.293v2c0,.552-.447,1-1,1s-1-.448-1-1v-2c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v1H11c.552,0,1,.448,1,1s-.448,1-1,1H2v9c0,1.654,1.346,3,3,3h4c.552,0,1,.448,1,1s-.448,1-1,1H5c-2.757,0-5-2.243-5-5V7C0,4.243,2.243,2,5,2h1V1c0-.552,.448-1,1-1s1,.448,1,1v1h8V1c0-.552,.447-1,1-1s1,.448,1,1v1h1c2.757,0,5,2.243,5,5Z"/></svg>

                    <h3>Days Passed</h3>
                </div>
                <p>${daysElapsed} day${daysElapsed === 1 ? '' : 's'}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M14.648,5.493c.873-.701,1.772-1.643,2.228-2.789,.238-.598,.161-1.277-.205-1.816-.377-.556-1.002-.888-1.671-.888h-6c-.669,0-1.294,.332-1.671,.888-.366,.539-.442,1.218-.205,1.816,.456,1.145,1.355,2.088,2.228,2.789C4.696,7.221,1,13.159,1,18c0,3.309,2.691,6,6,6h10c3.309,0,6-2.691,6-6,0-4.841-3.696-10.779-8.352-12.507Zm.369-3.528c-.516,1.297-2.094,2.393-3.019,2.91-.923-.513-2.495-1.6-2.999-2.875l6.018-.035Zm1.982,20.035H7c-2.206,0-4-1.794-4-4,0-5.243,4.71-11,9-11s9,5.757,9,11c0,2.206-1.794,4-4,4Zm-5,0c-.552,0-1-.448-1-1v-1h-.268c-1.068,0-2.063-.574-2.598-1.499-.276-.478-.113-1.089,.365-1.366,.476-.277,1.089-.114,1.366,.365,.178,.308,.511,.5,.867,.5h2.268c.551,0,1-.449,1-1,0-.378-.271-.698-.644-.76l-3.042-.507c-1.341-.223-2.315-1.373-2.315-2.733,0-1.654,1.346-3,3-3v-1c0-.552,.448-1,1-1s1,.448,1,1v1h.268c1.067,0,2.063,.575,2.598,1.5,.276,.478,.113,1.089-.365,1.366-.477,.277-1.089,.114-1.366-.365-.179-.309-.511-.5-.867-.5h-2.268c-.551,0-1,.449-1,1,0,.378,.271,.698,.644,.76l3.042,.507c1.341,.223,2.315,1.373,2.315,2.733,0,1.654-1.346,3-3,3v1c0,.552-.448,1-1,1Z"/></svg>
<h3>Amount Taken</h3>
                </div>
                <p>${formatMoney(loan.takenAmount)}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_7" viewBox="0 0 24 24" width="512" height="512"><path d="M19,0H14a1,1,0,0,0,0,2h5a2.951,2.951,0,0,1,1.285.3L.293,22.293a1,1,0,1,0,1.414,1.414L21.7,3.715A2.951,2.951,0,0,1,22,5v5a1,1,0,0,0,2,0V5A5.006,5.006,0,0,0,19,0Z"/><path d="M6,10A4,4,0,1,0,2,6,4,4,0,0,0,6,10ZM6,4A2,2,0,1,1,4,6,2,2,0,0,1,6,4Z"/><path d="M18,14a4,4,0,1,0,4,4A4,4,0,0,0,18,14Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,18,20Z"/></svg>
<h3>Interest</h3>
                </div>
                <p>${formatMoney(loan.interest)}</p>
            </div>
            <div class="details">
                ${overdueFine > 0 ? `
                    <div class="leftflow">
                        <svg class="strokeadder"  style="background: #ff0000;
    padding: 2px;
    fill: white;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M497.35-308.81q7.27-7.27 7.27-17.34 0-10.08-7.27-17.35-7.27-7.27-17.35-7.27-10.08 0-17.35 7.27-7.27 7.27-7.27 17.35 0 10.07 7.27 17.34t17.35 7.27q10.08 0 17.35-7.27ZM460-433.85h40v-240h-40v240Zm20 350.47L362.75-200H200v-162.75L83.38-480 200-597.25V-760h162.75L480-876.62 597.25-760H760v162.75L876.62-480 760-362.75V-200H597.25L480-83.38Zm0-56.62 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z"/></svg>
                        <h3>Overdue Fine</h3>
                    </div>
                    <p style='color: #ff0000;'>${formatMoney(overdueFine)} 
                        <small>(${Math.abs(daysLeft)} days)</small>
                    </p>` : ''}
            </div>

            <hr>
            <div class="totaldetails">
    <svg style='width: 30px;height: 30px;margin-top: 25px;opacity: 80%;' xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
        <g fill="none" stroke-width="1.5">
            <path d="M17.414 10.414C18 9.828 18 8.886 18 7c0-1.886 0-2.828-.586-3.414m0 6.828C16.828 11 15.886 11 14 11h-4c-1.886 0-2.828 0-3.414-.586m10.828 0Zm0-6.828C16.828 3 15.886 3 14 3h-4c-1.886 0-2.828 0-3.414.586m10.828 0Zm-10.828 0C6 4.172 6 5.114 6 7c0 1.886 0 2.828.586 3.414m0-6.828Zm0 6.828ZM13 7a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/>
            <path stroke-linecap="round" d="M18 6a3 3 0 0 1-3-3m3 5a3 3 0 0 0-3 3M6 6a3 3 0 0 0 3-3M6 8a3 3 0 0 1 3 3M4 21.388h2.26c1.01 0 2.033.106 3.016.308a14.85 14.85 0 0 0 5.33.118m-.93-3.297c.12-.014.235-.03.345-.047c.911-.145 1.676-.633 2.376-1.162l1.808-1.365a1.887 1.887 0 0 1 2.22 0c.573.433.749 1.146.386 1.728c-.423.678-1.019 1.545-1.591 2.075m-5.544-1.229a8.176 8.176 0 0 1-.11.012m.11-.012a.998.998 0 0 0 .427-.24a1.492 1.492 0 0 0 .126-2.134a1.9 1.9 0 0 0-.45-.367c-2.797-1.669-7.15-.398-9.779 1.467m9.676 1.274a.524.524 0 0 1-.11.012m0 0a9.274 9.274 0 0 1-1.814.004"/>
        </g>
    </svg>
    
    <h3 style="    margin: 10px 0;
    font-weight: 100;">
        Total amount to return
    </h3>
    
    <p style="font-size:60px;
              font-weight: 600;
              font-family: 'Anton', sans-serif;
              letter-spacing: 4.5px;
              color: ${overdueFine > 0 
                        ? '#ff0000' 
                        : daysLeft <= 2 
                            ? '#ff0000' 
                            : daysLeft <= 6 
                                ? '#ffbf00' 
                                : '#00d423'};">
        ${formatMoney(totalPayable)}
    </p>
</div>
             <a target="_blank" href="https://forms.gle/RzTJ8W9bwmm8DVj2A"><button style="background-color: #ff0000;
    padding: 8px 15px;
    font-size: 16px;
    transition: all 0.3s ease;
    left: 50%;
    position: relative;
    transform: translate(-50%, 0%);
    margin-bottom: 20px;
    margin-top: 10px;
    font-weight: 100;
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
    border: solid 1px #ffffff00;" class="add-link-btn">I have an issue with my account.!</button></a>
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
        btn.innerHTML = `${formatMoney(loan.takenAmount)}<div class="purpose-tag">${loan.purpose || 'Purpose'}</div>`;
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
        ${overdue > 0 ? `<p style="
    margin: -17px 0 0 0;
    font-size: 16px;">Overdue Fine : <strong style='    color: #ff2424;
    border-radius: 100px;
    padding: 0 10px;'>${formatMoney(overdue)}</strong></p>` : ''}
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

        const amount = currentCurrency === 'Usd ($)' 
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
            const amount = currentCurrency === 'Usd ($)'
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
                    ${isHidden ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/></svg>'}
                </button>
                <button class="btn-details" data-idx="${idx}"> <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="M429.5-197.5q-19.6 0-32.55-12.68-12.95-12.68-12.95-32t13.13-33.07Q410.25-289 429.5-289h102q18.6 0 31.8 13.93 13.2 13.92 13.2 33.24T563.13-210q-13.38 12.5-32.63 12.5h-101Zm-163-238q-19.6 0-32.3-12.43-12.7-12.43-12.7-32t12.7-32.82Q246.9-526 266.5-526h426q19.6 0 32.8 13.43 13.2 13.42 13.2 32.99t-13.2 31.83q-13.2 12.25-32.8 12.25h-426ZM145-672q-19.6 0-32.3-13.18-12.7-13.18-12.7-32.5t13.38-32.57Q126.75-763.5 146-763.5h669.5q19.1 0 32.3 13.43 13.2 13.42 13.2 32.74T847.13-685q-13.88 13-32.63 13H145Z"/></svg></button>
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
    width: 100%;
    margin-bottom: 20px;
    margin-top: 5px;
    border-radius: 1008px;
    padding:  5px 8px;;
    transition: all 0.3s ease;
    transform: translate(-50%, 0);
    left: 50%;filter: saturate(2);
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

<a class="calndarCntnrbtn" href='https://blackswan19.github.io/bscrop/reminder.html'><button>Date Note</button></a>
<span style="font-weight: 100;
    color: #eee;
    font-size: 14px;
    letter-spacing: 0px;">${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="move-asaid" onclick="prevMonth()"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M640-107.69 267.69-480 640-852.31l42.54 42.54L352.77-480l329.77 329.77L640-107.69Z"/></svg></button>
        <button class="move-asaid" onclick="nextMonth()"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m320.23-107.69-42.54-42.54L607.46-480 277.69-809.77l42.54-42.54L692.54-480 320.23-107.69Z"/></svg></button>
    </div>
    <div style="display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    text-align: center;
    color: #888;
    font-weight: 600;
    background: linear-gradient(0deg, #ffffff1a, transparent);
    padding: 20px;
    margin-top: -15px;
    corner-shape: squircle;
    border-radius: 75px;">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>`
        ;

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
    
        <p style='color: #ffc000;font-weight: 600;'><strong>Taken Amount:</strong> ${formatMoney(loan.takenAmount)}</p>
        <p style='color: #ffc000;font-weight: 600;'><strong>Purpose:</strong> ${loan.purpose || 'Not set'}</p>
        <p style='color: #ffc000;font-weight: 600;'><strong>Return date :</strong> ${cleanEnd}</p>
        <hr style='margin: 5px;'>
        <p style='color: #ffc000;font-weight: 600;    font-size: 20px;'><strong>Status:</strong> <span style="color:${daysLeft<=2?'#ff1100':daysLeft<=6?'#ffbf00':'#00d609'}">
            ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}
        </span></p>
        <div class="detailbuttons" style="display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 0px;
    margin-bottom: -10px;">
    <button style="width: 100%;
    background: #0026ff;
    border-radius: 200px;" onclick="goToList(${idx})"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M442.31-280q-8.5 0-14.25-5.76t-5.75-14.27q0-8.51 5.75-14.24t14.25-5.73h74.61q8.5 0 14.25 5.76t5.75 14.27q0 8.51-5.75 14.24T516.92-280h-74.61Zm-150-180q-8.5 0-14.25-5.76t-5.75-14.27q0-8.51 5.75-14.24t14.25-5.73h374.61q8.5 0 14.25 5.76t5.75 14.27q0 8.51-5.75 14.24T666.92-460H292.31ZM180-640q-8.5 0-14.25-5.76T160-660.03q0-8.51 5.75-14.24T180-680h600q8.5 0 14.25 5.76t5.75 14.27q0 8.51-5.75 14.24T780-640H180Z"/></svg> Details</button>
    <button onclick="closeDatePopup()" style="width: 100%;
    background: #ff0000;
    border-radius: 200px;background-color: red;" onclick="goToList(${idx})"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"/></svg> Close Now</button>
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

document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('download-receipt');
    if (!downloadBtn) {
        console.error("Button with id='download-receipt' NOT FOUND!");
        return;
    }
    console.log("✅ Receipt button initialized");
    downloadBtn.addEventListener('click', function() {
        if (!currentUser) {
            alert("Login first!");
            return;
        }
        const user = currentUser;
        if (!user.loans || user.loans.length === 0) {
            alert("No active loans found.");
            return;
        }
        const baseHeight = 320;
        const perLoanHeight = 148;
        const footerHeight = 110;
        const canvasHeight = baseHeight + (user.loans.length * perLoanHeight) + footerHeight;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 850;
        canvas.width = width;
        canvas.height = canvasHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, canvasHeight);
        let y = 80;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BsLends', width / 2, y);
        y += 28;
        ctx.fillStyle = '#666666';
        ctx.font = '400 18px Arial';
        ctx.fillText('Borrow Statement', width / 2, y);
        y += 48;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 23px Arial';
        ctx.fillText(user.name, 75, y);
        y += 32;
        ctx.font = '400 15px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText('Password • ' + (user === usersDB["0212"] ? "0212" : "BsPasgenerater"), 75, y);
        y += 55;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 19px Arial';
        ctx.fillText('Active Loans', 75, y);
        y += 35;
        user.loans.forEach((loan, i) => {
            const total = loan.takenAmount + loan.interest;
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(75, y - 6);
            ctx.lineTo(width - 75, y - 6);
            ctx.stroke();
            y += 28;
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '600 18px Arial';
            ctx.fillText(`Loan ${i + 1}`, 75, y);
            y += 32;
            ctx.font = '400 16.5px Arial';
            ctx.fillStyle = '#444444';
            ctx.fillText('Principal Amount', 75, y);
            ctx.textAlign = 'right';
            ctx.fillText(`₹${loan.takenAmount.toLocaleString('en-IN')}`, width - 75, y);
            ctx.textAlign = 'left';
            y += 28;
            ctx.fillText('Interest', 75, y);
            ctx.textAlign = 'right';
            ctx.fillText(`₹${loan.interest.toLocaleString('en-IN')}`, width - 75, y);
            ctx.textAlign = 'left';
            y += 30;
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '600 18px Arial';
            ctx.fillText('Total Payable', 75, y);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#d32f2f';
            ctx.fillText(`₹${total.toLocaleString('en-IN')}`, width - 75, y);
            ctx.textAlign = 'left';
            y += 28;
            ctx.fillStyle = '#555555';
            ctx.font = '400 15.5px Arial';
            ctx.fillText(`Due on ${loan.endDate}`, 75, y);
            y += 52;
        });
        y += 35;
        ctx.fillStyle = '#999999';
        ctx.font = '400 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Power by BsBookpad', width / 2, y);
        y += 28;
        ctx.fillStyle = '#bbbbbb';
        ctx.font = '400 13px Arial';
        ctx.fillText('BsLends Services • Confidential', width / 2, y);
        try {
            const link = document.createElement('a');
            link.download = user.name.replace(/[^a-zA-Z0-9]/g, '_') + '_BsLends_Statement.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`✅ Receipt downloaded successfully for ${user.name}`);
        } catch (err) {
            console.error("Download error:", err);
            alert("Could not download. Try using Live Server instead of opening file directly.");
        }
    });
});
