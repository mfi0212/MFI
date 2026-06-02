document.addEventListener('contextmenu', e => e.preventDefault());

const USD_RATE = 87.85;
let currentCurrency = localStorage.getItem('currency') || '₹';
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
        coins: 800,
        loans: [
            { planDate: "11-05-2026", endDate: "11-06-2026", interest: 3560, takenAmount: 15000, takenFrom: "Golden", fineRate: 130 },
            { planDate: "25-05-2026", endDate: "24-06-2026", interest: 500, takenAmount: 2000, takenFrom: "Golden", fineRate: 130 },
        ],
        links: [],
       emote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif",
        defaultEmote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif"
    },
    "0212": {
        name: "Pavel Durov",
        coins: 1000,
        loans: [
             { planDate: "09-02-2026", endDate: "27-08-2026", interest: 1340, takenAmount: 12460, takenFrom: "Lendlink", fineRate: 50 },
             { planDate: "09-02-2026", endDate: "30-08-2026", interest: 1340, takenAmount: 12460, takenFrom: "Lendlink", fineRate: 50 },
             { planDate: "09-02-2026", endDate: "01-08-2026", interest: 1340, takenAmount: 12460, takenFrom: "Lendlink", fineRate: 50 },
            ],
        links: [],
        emote: "https://media.tenor.com/pT6HQx4wIogAAAAj/twitch-rpx-syria.gif",
        defaultEmote: "https://files.donationalerts.com/uploads/images/2/tb_5000.gif"
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
    const val = currentCurrency === '$' ? (amount / USD_RATE).toFixed(2) : amount;
    const symbol = currentCurrency === '₹' ? '₹' : '$';
    return `${symbol}${parseFloat(val).toLocaleString()}`;
}

// ====================== EXTRA-INFO HELPERS ======================

function calculateDaysLeft(endDateStr) {
    const clean = endDateStr.split('(')[0].trim();
    const end = new Date(clean.split('-').reverse().join('-'));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / 86400000);
}

function getDaysColor(daysLeft) {
    if (daysLeft <= 2) return '#ff1100';      // Urgent Red
    if (daysLeft <= 6) return '#ff8c00';      // Warning Orange
    return '#00d423';                          // Safe Green
}

function getDaysLeftText(daysLeft) {
    if (daysLeft < 0) return `Overdue ${Math.abs(daysLeft)}d`;
    if (daysLeft === 0) return "Due Today";
    if (daysLeft === 1) return "Due Tomorrow";
    return `${daysLeft} days`;
}

// ====================== MAIN RENDER FUNCTION ======================

function renderAmountButtons() {
    const container = document.getElementById("amountButtons");
    container.innerHTML = "";
    
    filteredLoans.forEach((loan, i) => {
        const originalIndex = currentUser.loans.indexOf(loan);
        const daysLeft = calculateDaysLeft(loan.endDate);
        
        const btn = document.createElement("button");
        btn.className = "amount-btn";
        
        btn.innerHTML = `
            <div class="extra-info" style="color: ${getDaysColor(daysLeft)};">
                ${getDaysLeftText(daysLeft)}
            </div>
            <div class="amounts-section">
                ${formatMoney(loan.takenAmount)}
                <div class="purpose-tag">${loan.purpose || 'Purpose'}</div>
            </div>
        `;
        
        btn.onclick = () => { 
            displayLoanDetails(loan, originalIndex); 
            switchView('list', false); 
        };
        
        container.appendChild(btn);
    });
}

function updateCoinsDisplay() {
    if (currentUser && document.getElementById('userCoinsDisplay')) {
        document.getElementById('userCoinsDisplay').textContent = currentUser.coins.toLocaleString();
        document.getElementById('userCoinsDisplays').textContent = currentUser.coins.toLocaleString();
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

// === Rest of your functions (unchanged except minor improvements) ===

function checkAndShowRepaymentReminders() {
    if (!currentUser || !currentUser.loans?.length) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const remindersByDueDate = {};

    currentUser.loans.forEach((loan, idx) => {
        const end = parseDate(loan.endDate);
        end.setHours(0, 0, 0, 0);

        const reminderStartDate = new Date(end);
        reminderStartDate.setDate(end.getDate() - 3);

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
                <button class="reminder-close-btn" title="Close reminder"><img class="closesymbol" src="service-icons/close_icon.png" alt=""></button>
            </div>
            <img style="width: 150px;" src="https://raw.githubusercontent.com/goforbg/telegram-emoji-gifs/refs/heads/master/trumpet.gif" alt="">
            <div class="iconsinfo" style='width: 85%; margin: 20px 0;'>
                <div class="icon">
                    <svg style="height: 23px; width: 23px; margin: 0px 0 -2px 0;" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24"><path d="M14.648,5.493c.873-.701,1.772-1.643,2.228-2.789,.238-.598,.161-1.277-.205-1.816-.377-.556-1.002-.888-1.671-.888h-6c-.669,0-1.294,.332-1.671,.888-.366,.539-.442,1.218-.205,1.816,.456,1.145,1.355,2.088,2.228,2.789C4.696,7.221,1,13.159,1,18c0,3.309,2.691,6,6,6h10c3.309,0,6-2.691,6-6,0-4.841-3.696-10.779-8.352-12.507Zm.369-3.528c-.516,1.297-2.094,2.393-3.019,2.91-.923-.513-2.495-1.6-2.999-2.875l6.018-.035Zm1.982,20.035H7c-2.206,0-4-1.794-4-4,0-5.243,4.71-11,9-11s9,5.757,9,11c0,2.206-1.794,4-4,4Zm-5,0c-.552,0-1-.448-1-1v-1h-.268c-1.068,0-2.063-.574-2.598-1.499-.276-.478-.113-1.089,.365-1.366,.476-.277,1.089-.114,1.366,.365,.178,.308,.511,.5,.867,.5h2.268c.551,0,1-.449,1-1,0-.378-.271-.698-.644-.76l-3.042-.507c-1.341-.223-2.315-1.373-2.315-2.733,0-1.654,1.346-3,3-3v-1c0-.552,.448-1,1-1s1,.448,1,1v1h.268c1.067,0,2.063,.575,2.598,1.5,.276,.478,.113,1.089-.365,1.366-.477,.277-1.089,.114-1.366-.365-.179-.309-.511-.5-.867-.5h-2.268c-.551,0-1,.449-1,1,0,.378,.271,.698,.644,.76l3.042,.507c1.341,.223,2.315,1.373,2.315,2.733,0,1.654-1.346,3-3,3v1c0,.552-.448,1-1,1Z"/></svg>
                    <div class="iconname">Borrowed Amount</div>
                </div>
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24"><path d="M19,2h-1V1c0-.552-.448-1-1-1s-1,.448-1,1v1H8V1c0-.552-.448-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm-3-6c0,.552-.448,1-1,1h-6c-.552,0-1-.448-1-1s.448-1,1-1h6c.552,0,1,.448,1,1Z"/></svg>
                    <div class="iconname">Return date</div>
                </div>
            </div>
            <div class="reminder-body">
                <p>Mr. ${name} you have <strong>${formatMoney(totalAmount)}</strong> to return on <strong>${dueDate}</strong>${loansText}. Return before the end date or extra charges will be added.</p>
                <p>If you have to extend do so on today only you can't extend on return date.</p>
            </div>
            <div class="reminder-actions">
                <button class="reminder-btn delay" data-action="delay"><a href="https://mfi0212.github.io/swan/offer/solution"><img class="closesymbol" src="service-icons/visit_icon.png" alt=""> Visit Solutions</a></button>
            </div>
        </div>
    `;

    modal.querySelector('.reminder-close-btn').onclick = () => modal.remove();
    document.body.appendChild(modal);
}

// ... [All your other functions remain the same: displayLoanDetails, updatePurpose, showTotalPopup, renderChart, etc.] ...

// Keep all your existing functions below (I didn't remove any)
document.getElementById("submitBtn").onclick = () => {
    const input = document.getElementById("userPassword").value.trim();
    const user = usersDB[input];
    const err = document.getElementById("error-message");

    if (user) {
        localStorage.setItem('lastPassword', input);
        currentUser = user;
        filteredLoans = [...user.loans];

        document.getElementById("userName").textContent = user.name;
        
        const emoteImg = document.getElementById("userEmote");
        if (user.emote) {
            emoteImg.src = user.emote;
            emoteImg.style.display = "block";
        } else {
            emoteImg.style.display = "none";
        }

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

        showTopLoginMessage();
        setTimeout(checkAndShowRepaymentReminders, 1400);
    } else {
        err.textContent = "Invalid password!";
    }
};

function showTopLoginMessage() {
    const msg = document.getElementById('topLoginMessage');
    const nameEl = document.getElementById('topUserName');
    const emoteEl = document.getElementById('topUserEmote');

    nameEl.textContent = currentUser.name;
    emoteEl.src = currentUser.emote || currentUser.defaultEmote || 'https://via.placeholder.com/45';

    msg.style.display = 'flex';

    setTimeout(() => {
        hideTopLoginMessage();
    },3000);
}

function hideTopLoginMessage() {
    const msg = document.getElementById('topLoginMessage');
    if (msg) {
        msg.style.transition = 'opacity 0.5s ease';
        msg.style.opacity = '0';
        
        setTimeout(() => {
            msg.style.display = 'none';
            msg.style.opacity = '1';
            msg.style.transition = '';
        }, 500);
    }
}
function updateCurrencyUI() {
    document.getElementById('currencyLabel').textContent = currentCurrency;
    document.querySelector('#currencySwitch i').className = 
        currentCurrency === '$' ? '' : '';
}

function toggleCurrency() {
    currentCurrency = currentCurrency === '₹' ? '$' : '₹';
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
            <div class="details" style="transform: none;
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    top: 190px;
    opacity: 100%;
    z-index: 10000000;
    padding: 20px 0 0 0;
    filter: drop-shadow(0 0 5px black);">

                <input type="text" class="purpose-input" placeholder="Purpose" value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
            </div>
            
<div class="totaldetails">
    <p style="font-size: 60px;
    font-weight: 800;
    letter-spacing: 1px;
    margin: 5px;
              color: ${overdueFine > 0 
                        ? '#ff0000' 
                        : daysLeft <= 2 
                            ? '#ff0000' 
                            : daysLeft <= 6 
                                ? '#ff8c00' 
                                : '#00d423'};">
        ${formatMoney(totalPayable)}
    </p><hr> <h3>
       Total amount</h3>
</div>   
    
           <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M236-299v-262q0-10.95 8.04-18.97 8.03-8.03 19-8.03 10.96 0 18.96 8.03 8 8.02 8 18.97v262q0 10.95-8.04 18.98-8.03 8.02-19 8.02-10.96 0-18.96-8.02-8-8.03-8-18.98Zm216 0v-262q0-10.95 8.04-18.97 8.03-8.03 19-8.03 10.96 0 18.96 8.03 8 8.02 8 18.97v262q0 10.95-8.04 18.98-8.03 8.02-19 8.02-10.96 0-18.96-8.02-8-8.03-8-18.98Zm369-369H136q-8.75 0-15.37-6.59-6.63-6.58-6.63-15.28v-14.42q0-5.71 3.38-11.61 3.37-5.91 8.62-8.1l317-153q17.75-9 36.87-9 19.13 0 37.13 9l315 152q5 4 9.5 9t4.5 13.07v10.19q0 10.74-7 17.74-7 7-18 7Zm-576-54h470L494-828q-7-3-14-3t-14 3L245-722ZM141-138q-10.95 0-18.97-8.04-8.03-8.03-8.03-19 0-10.96 8.03-18.96 8.02-8 18.97-8h375q10.95 0 18.97 8.04 8.03 8.03 8.03 19 0 10.96-8.03 18.96-8.02 8-18.97 8H141Zm523-233.02q-8-7.03-8-17.98v-170q0-11.95 8.04-20.47 8.03-8.53 19-8.53 11.96 0 19.96 8.53 8 8.52 7 20.47v170q1 9.95-7.54 17.48-8.53 7.52-19.5 7.52-10.96 0-18.96-7.02Zm-40 181.84V-255q0-12.16 6.5-22.58Q637-288 648-294l133-66q8.71-3 18.86-3 10.14 0 19.14 3l133 66q11 6 17.5 16.42Q976-267.16 976-255v65.82Q976-106 933.5-48T815.62 42.17Q814 43 800 47q-7 0-16-5-75-32-117.5-90T624-189.18ZM765-112l-61-61q-3-3-8.5-4t-9.5 3q-4 4-4 9.5t4 9.5l48 49q13 13 30 13t30-13l118-119q3-3 3.5-8.5T912-243q-4-4-9-4.5t-9 4.5L765-112ZM245-722h470-470Z"/></svg>


<h3>Service</h3>
                </div>
                <p>${loan.takenFrom}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_3" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M294.5-352.36q-26.5-26.36-26.5-63.5t26.36-63.64q26.36-26.5 63.5-26.5t63.64 26.36q26.5 26.36 26.5 63.5t-26.36 63.64q-26.36 26.5-63.5 26.5t-63.64-26.36ZM226-102q-36.73 0-61.36-24.64Q140-151.27 140-188v-508q0-36.72 24.64-61.36Q189.27-782 226-782h48v-59q0-12 8.5-20.5T303-870q12 0 20.5 8.5T332-841v59h300v-61q0-11 8-19t19-8q11 0 19 8t8 19v61h48q36.72 0 61.36 24.64T820-696v508q0 36.73-24.64 61.36Q770.72-102 734-102H226Zm0-54h508q12 0 22-10t10-22v-360H194v360q0 12 10 22t22 10Zm-32-446h572v-94q0-12-10-22t-22-10H226q-12 0-22 10t-10 22v94Zm0 0v-126 126Z"/></svg>
                <h3>Borrowed on</h3>
                </div>
                <p>${loan.planDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_4" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M528.5-266.36q-26.5-26.36-26.5-63.5t26.36-63.64q26.36-26.5 63.5-26.5t63.64 26.36q26.5 26.36 26.5 63.5t-26.36 63.64q-26.36 26.5-63.5 26.5t-63.64-26.36ZM226-102q-36.73 0-61.36-24.64Q140-151.27 140-188v-508q0-36.72 24.64-61.36Q189.27-782 226-782h48v-59q0-12 8.5-20.5T303-870q12 0 20.5 8.5T332-841v59h300v-61q0-11 8-19t19-8q11 0 19 8t8 19v61h48q36.72 0 61.36 24.64T820-696v508q0 36.73-24.64 61.36Q770.72-102 734-102H226Zm0-54h508q12 0 22-10t10-22v-360H194v360q0 12 10 22t22 10Zm-32-446h572v-94q0-12-10-22t-22-10H226q-12 0-22 10t-10 22v94Zm0 0v-126 126Z"/></svg>
<h3>Return on</h3>
                </div>
                <p style="color:${daysLeft <= 2 ? '#ff1100' : daysLeft <= 6 ? '#ff8c00' : '#00d423'};"> ${cleanEndDate}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_5" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M292.5-414.5Q282-425 282-438t10.5-23.5Q303-472 316-472t23.5 10.5Q350-451 350-438t-10.5 23.5Q329-404 316-404t-23.5-10.5Zm164 0Q446-425 446-438t10.5-23.5Q467-472 480-472t23.5 10.5Q514-451 514-438t-10.5 23.5Q493-404 480-404t-23.5-10.5Zm164 0Q610-425 610-438t10.5-23.5Q631-472 644-472t23.5 10.5Q678-451 678-438t-10.5 23.5Q657-404 644-404t-23.5-10.5ZM226-102q-36.73 0-61.36-24.64Q140-151.27 140-188v-508q0-36.72 24.64-61.36Q189.27-782 226-782h48v-59q0-12 8.5-20.5T303-870q12 0 20.5 8.5T332-841v59h300v-61q0-11 8-19t19-8q11 0 19 8t8 19v61h48q36.72 0 61.36 24.64T820-696v508q0 36.73-24.64 61.36Q770.72-102 734-102H226Zm0-54h508q12 0 22-10t10-22v-360H194v360q0 12 10 22t22 10Zm-32-446h572v-94q0-12-10-22t-22-10H226q-12 0-22 10t-10 22v94Zm0 0v-126 126Z"/></svg>
                   <h3>Days Passed</h3>
                </div>
                <p>${daysElapsed} day${daysElapsed === 1 ? '' : 's'}</p>
            </div>
            <div class="details">
                <div class="leftflow">
                    <?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M340-140q-82 0-140.5-58.5T141-339q0-35 11.5-68t34.5-60l145-173-58-118q-12-21 1-41.5t36-20.5h338q23 0 36.5 20.5T687-758l-58 118 145 173q23 27 34.5 60t11.5 68q0 82-58 140.5T621-140H340Zm140-192q-29 0-49-20t-20-50q0-30 20-50t49-20q30 0 50.5 20t20.5 50q0 30-20.5 50T480-332ZM380-663h202l51-104H327l53 104Zm-40 470h281q61 0 103.5-43T767-339q0-26-8-50t-25-44L586-610H375L228-433q-17 21-25.5 44.5T194-339q0 60 43 103t103 43Z"/></svg>
<h3>Borrowed Amount </h3>
                </div>
                <p>${formatMoney(loan.takenAmount)}</p>
            </div>
            <div class="details">
                <div class="leftflow">
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_7" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M302.91-535q-51.41 0-87.16-35.75T180-658q0-51.5 35.75-87.25T302.91-781q51.41 0 87.75 35.75T427-658q0 51.5-36.34 87.25T302.91-535Zm.03-53q29.56 0 50.31-20.38Q374-628.76 374-657.88t-20.59-49.62q-20.59-20.5-50-20.5t-49.91 20.38q-20.5 20.38-20.5 49.5t20.4 49.62q20.4 20.5 49.54 20.5ZM658-180q-51.5 0-87.25-35.75T535-302.91q0-51.41 35.75-87.75T658-427q51.5 0 87.25 36.34T781-302.91q0 51.41-35.75 87.16T658-180Zm49.5-73.4q20.5-20.4 20.5-49.54 0-29.56-20.38-50.31Q687.24-374 658.12-374t-49.62 20.59q-20.5 20.59-20.5 50t20.38 49.91q20.38 20.5 49.5 20.5t49.62-20.4ZM201-227.67q0-10.66 8-18.33l508-508q8-8 18-7.5t18 8.5q8 8 8 18.67 0 10.66-8 18.33L245-208q-8 8-18 7.5t-18-8.5q-8-8-8-18.67Z"/></svg>
<h3>Interest</h3>
                </div>
                <p>${formatMoney(loan.interest)}</p>
            </div>
            <div class="details" style='margin-bottom: -10px;'>
                    <div class="leftflow">
                       <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M501-300.82q9-8.83 9-21 0-12.18-8.82-21.18-8.83-9-21-9-12.18 0-21.18 8.82-9 8.83-9 21 0 12.18 8.82 21.18 8.83 9 21 9 12.18 0 21.18-8.82ZM500-442q8-8 8-19v-192q0-11-8-19t-19-8q-11 0-19 8t-8 19v192q0 11 8 19t19 8q11 0 19-8ZM354-180h-88q-37 0-61.5-24.5T180-266v-88l-65-66q-13-13-18.5-28.67-5.5-15.67-5.5-31.5t5.5-31.33Q102-527 115-540l65-66v-88q0-37 24.5-61.5T266-780h88l66-65q13-13 28.67-18.5 15.67-5.5 31.5-5.5t31.33 5.5Q527-858 540-845l66 65h88q37 0 61.5 24.5T780-694v88l65 66q13 13 18.5 28.67 5.5 15.67 5.5 31.5t-5.5 31.33Q858-433 845-420l-65 66v88q0 37-24.5 61.5T694-180h-88l-66 65q-13 13-28.67 18.5-15.67 5.5-31.5 5.5t-31.33-5.5Q433-102 420-115l-66-65Zm23.5-54 79.5 79q9 9 23 9t23-9l79.35-79.35h111.3q14 0 23-9t9-23v-111.3L805-457q9-9 9-23t-9-23l-79-79.5V-694q0-14-9-23t-23-9H582.5L503-805q-9-9-23-9t-23 9l-79.35 79.35h-111.3q-14 0-23 9t-9 23v111.3L155-503q-9 9-9 23t9 23l79 79.5V-266q0 14 9 23t23 9h111.5ZM480-480Z"/></svg>
                       <h3>Overdue Fine</h3>
                    </div>
                    <p style='color: #ff0000;'>${formatMoney(overdueFine)} 
                        <small></small>
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
        const daysLeft = calculateDaysLeft(loan.endDate);
        
        // Determine dot color
        const dotColor = daysLeft <= 2 ? '#ff1100' : 
                        daysLeft <= 6 ? '#ff8c00' : '#00d423';
        
        // Determine pulse speed (smaller duration = faster pulse)
        const animationDuration = getPulseDuration(daysLeft);
        
        const btn = document.createElement("button");
        btn.className = "amount-btn";
        
        btn.innerHTML = `
            <div class="extra-info" 
                 style="background-color: ${dotColor}; 
                        animation-duration: ${animationDuration}s;">
            </div>
            <div class="amounts-section">
                ${formatMoney(loan.takenAmount)}
                <div class="purpose-tag">${loan.purpose || 'Purpose'}</div>
            </div>
        `;
        
        btn.onclick = () => { 
            displayLoanDetails(loan, originalIndex); 
            switchView('list', false); 
        };
        
        container.appendChild(btn);
    });
}function getPulseDuration(daysLeft) {
    if (daysLeft <= 1) return 0.3;    
    if (daysLeft <= 2) return 0.5;  
    if (daysLeft <= 4) return 1;  
    if (daysLeft <= 7) return 1.5;      
    return 2.5;                       
}
function calculateDaysLeft(endDateStr) {
    const clean = endDateStr.split('(')[0].trim();
    const end = new Date(clean.split('-').reverse().join('-'));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
        else if (daysLeft <= 6) color = '#ff8c00';

        const amount = currentCurrency === '$' 
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

    container.style.transition = 'opacity 0.4s ease, all 0.3s ease-in-out';
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
            const amount = currentCurrency === '$'
                ? (loan.takenAmount / USD_RATE).toFixed(2)
                : loan.takenAmount;

            row.innerHTML = `
                <div class="loan-info">
                    <span class="loan-title">Amount ${idx + 1}</span>
                    <span class="loan-amount">${amount} ${currentCurrency}</span>
                    <span class="loan-days ${daysLeft <= 2 ? 'urgent' : daysLeft <= 6 ? 'warning' : 'safe'}">
                        ${daysLeft} days left
                    </span>
                </div>
                <div class="loan-actions">
                <button class="btn-hide" data-idx="${idx}">
                    ${isHidden ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M600.65-379.35q49.5-49.5 49.5-120.65t-49.5-120.65q-49.5-49.5-120.65-49.5t-120.65 49.5q-49.5 49.5-49.5 120.65t49.5 120.65q49.5 49.5 120.65 49.5t120.65-49.5ZM402-422.12q-32-32.12-32-78T402.12-578q32.12-32 78-32T558-577.88q32 32.12 32 78T557.88-422q-32.12 32-78 32T402-422.12ZM242.42-277.27Q133.46-344.54 70.54-456.38q-6-10.24-8.62-21.12-2.61-10.88-2.61-22.42 0-11.54 2.61-22.5 2.62-10.96 8.62-21.2 62.92-111.84 171.88-179.11Q351.38-790 480-790t237.58 67.27q108.96 67.27 171.88 179.11 6 10.24 8.62 21.12 2.61 10.88 2.61 22.42 0 11.54-2.61 22.5-2.62 10.96-8.62 21.2-62.92 111.84-171.88 179.11Q608.62-210 480-210t-237.58-67.27ZM480-500Zm211.87 163.42Q788.74-397.16 840-500q-51.26-102.84-148.13-163.42Q595-724 480-724t-211.87 60.58Q171.26-602.84 120-500q51.26 102.84 148.13 163.42Q365-276 480-276t211.87-60.58Z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M600.15-620.15q22.77 22.77 37.39 60.03 14.61 37.27 13.15 73.58 0 13.08-8.11 21.58-8.12 8.5-21.2 8.5-13.07 0-21.57-8.5t-8.5-21.58q1.69-27.77-7.69-51.5-9.39-23.73-26.39-40.73-17-17-41.5-25.61-24.5-8.62-50.73-6.16-13.08.77-22.85-6.96-9.77-7.73-10.53-20.81-.77-13.07 7.84-22.84 8.62-9.77 21.69-10.54 37.85-3 75.89 11.73t63.11 39.81ZM480-724q-20.62 0-40.62 2.65-20 2.66-40.61 6.2-13.54 2.23-26.5-5.31-12.96-7.54-16.65-20.08-3.7-13.31 2.57-24.23t19.58-14.15q25.31-5.54 51.11-8.31Q454.69-790 480-790q130.85 0 242.69 67 111.85 67 171 184.62 5 10.23 7.12 19.19 2.11 8.96 2.11 19.19t-2 19.69q-2 9.46-7 19.69-17.77 38.93-43.88 70.47-26.12 31.53-57.35 60.23-10.61 9.61-24.04 7.77-13.42-1.85-22.8-11.93-9.39-10.07-7.27-23.73 2.11-13.65 12.73-24.27 28.15-26.07 50.27-54.8Q823.69-465.62 840-500q-51-103-148-163.5T480-724Zm0 514q-129.62 0-238.58-67.5Q132.46-345 70.31-458.62q-5-10.23-8.12-20.57-3.11-10.35-3.11-20.81 0-10.46 2.5-21.69t7.5-20.69q22.61-39.54 50.57-75.81 27.97-36.27 64.35-63.73l-90.62-91.85q-9.61-9.85-9.88-22.88-.27-13.04 10.12-23.43 10.38-10.38 23.15-10.38 12.77 0 23.15 10.38l680.16 680.16q9.61 9.61 9.61 23.15t-9.61 23.15q-10.39 10.39-23.16 10.39t-23.15-10.39L629.23-237.69q-34.77 16.38-72.96 22.04Q518.08-210 480-210ZM232.31-634.62q-36.31 27.31-64.89 60.85Q138.85-540.23 120-500q51 103 148 163.5T480-276q23.54 0 47.96-2.42 24.42-2.43 45.66-12.89L528.38-339q-10.3 6.62-23.03 7.88-12.73 1.27-25.35 1.27-71.15 0-120.65-49.5T309.85-500q0-12.62 1.65-25.35 1.65-12.73 7.5-23.03l-86.69-86.24ZM543-532Zm-139.54 68.54Z"/></svg>'}
                </button>
                <button class="btn-details" data-idx="${idx}"> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-88q-13.64 0-22.82-9.73T128-121.07q0-13.61 9.73-22.77T161-153h398.62q13.63 0 22.81 9.16 9.19 9.16 9.19 22.77t-9.19 23.34Q573.25-88 559.62-88H160Zm0-160.38q-13.64 0-22.82-9.74-9.18-9.73-9.18-23.33 0-13.61 9.73-22.77t23.27-9.16h639q13.64 0 22.82 9.16t9.18 22.77q0 13.6-9.18 23.33-9.18 9.74-22.82 9.74H160Zm58.62-160.39q-38.35 0-64.48-26.14Q128-461.04 128-499.38v-282q0-38.35 26.14-64.48Q180.27-872 218.62-872h522.76q38.35 0 64.48 26.14Q832-819.73 832-781.38v282q0 38.34-26.14 64.47-26.13 26.14-64.48 26.14H218.62Zm-1-65h524.76q10.77 0 17.7-6.92 6.92-6.93 6.92-17.69v-284q0-10.77-6.92-17.7-6.93-6.92-17.7-6.92H217.62q-10.77 0-17.7 6.92-6.92 6.93-6.92 17.7v284q0 10.76 6.92 17.69 6.93 6.92 17.7 6.92Zm-24.62 0V-807v333.23Z"/></svg>
                                 </button>
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
    width: 98%;
    margin-bottom: 20px;
    margin-top: 0px;
    border-radius: 30px;
    padding: 10px;
    transition: all 0.3s ease;
    transform: translate(-50%, 0);
    left: 50%;
    filter: saturate(2);
    position: relative;
    background: #303030;
">

<a class="calndarCntnrbtn" href='https://blackswan19.github.io/bscrop/reminder.html'><button>Date Note</button></a>
<span style="font-weight: 100;
    color: #eee;
    font-size: 14px;
    letter-spacing: 0px;">${calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="move-asaid" onclick="prevMonth()"><?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M10.6,12.71a1,1,0,0,1,0-1.42l4.59-4.58a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L9.19,9.88a3,3,0,0,0,0,4.24l4.59,4.59a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z"/></svg></button>
        <button class="move-asaid" onclick="nextMonth()"><?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M15.4,9.88,10.81,5.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L14,11.29a1,1,0,0,1,0,1.42L9.4,17.29a1,1,0,0,0,1.41,1.42l4.59-4.59A3,3,0,0,0,15.4,9.88Z"/></svg></button>
    </div>
    <div style="display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap:5px;
    text-align: center;
    padding: 15px 10px;
    margin-top: -10px;
    border-radius: 35px;
    background: linear-gradient(0deg, #191919, transparent);">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>`
        ;

    for (let i = 0; i < first; i++) html += `<div></div>`;
    for (let d = 1; d <= days; d++) {
        const ds = `${String(d).padStart(2,'0')}-${String(m+1).padStart(2,'0')}-${y}`;
        const idx = dueMap[ds];
        let style = `border-radius:9999px;cursor:${idx!==undefined?'pointer':'default'};transition:all .2s;`;
        if (idx !== undefined) {
            const end = new Date(currentUser.loans[idx].endDate.split('(')[0].trim().split('-').reverse().join('-'));
            const daysLeft = Math.ceil((end - today) / 86400000);
            let bg = '#00bb06';
            if (daysLeft <= 2) bg = '#ff1100';
            else if (daysLeft <= 6) bg = '#ff8c00';
            style += `background:${bg};color: black;font-weight:bold;`;
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
        <p style='color: #ffc000;font-weight: 600;    font-size: 20px;'><strong>Status:</strong> <span style="color:${daysLeft<=2?'#ff1100':daysLeft<=6?'#ff8c00':'#00d609'}">
            ${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}
        </span></p>
        <div class="detailbuttons" style="display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 0px;
    margin-bottom: -10px;">
    <button style="width: 100%;
    background: #0026ff;
    border-radius: 200px;" onclick="goToList(${idx})"><img class="closesymbol" src="service-icons/details_icon.png" alt=""> Details</button>
    <button onclick="closeDatePopup()" style="width: 100%;
    background: #ff0000;
    border-radius: 200px;background-color: red;" onclick="goToList(${idx})"><img class="closesymbol" src="service-icons/close_icon.png" alt=""> Close</button>
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

  const emoteImg = document.getElementById("userEmote");
  emoteImg.src = src;
  emoteImg.style.display = "block";

  saveUserData();
  closeEmoteChooser();
}
function resetUserEmote() {
  currentUser.emote = currentUser.defaultEmote || "";

  const emoteImg = document.getElementById("userEmote");

  if (currentUser.emote) {
    emoteImg.src = currentUser.emote;
    emoteImg.style.display = "block";
  } else {
    emoteImg.style.display = "none";
  }

  saveUserData();
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

        // High Quality Settings
        const SCALE = 2;
        const BASE_WIDTH = 850;
        const width = BASE_WIDTH * SCALE;

        const baseHeight = 320;
        const perLoanHeight = 148;
        const footerHeight = 220;
        const canvasHeight = (baseHeight + (user.loans.length * perLoanHeight) + footerHeight) * SCALE;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });

        canvas.width = width;
        canvas.height = canvasHeight;

        ctx.scale(SCALE, SCALE);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, BASE_WIDTH, canvasHeight / SCALE);

        let y = 80;

        ctx.fillStyle = '#1a1a1a';
        ctx.font = '700 44px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BsLends', BASE_WIDTH / 2, y);
        y += 30;

        ctx.fillStyle = '#555555';
        ctx.font = '400 18px Arial';
        ctx.fillText('Borrow Statement', BASE_WIDTH / 2, y);
        y += 52;

        ctx.textAlign = 'left';
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 24px Arial';
        ctx.fillText(user.name, 75, y);
        y += 34;

        ctx.font = '400 15.5px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText('Password • ' + (user === usersDB["0212"] ? "0212" : "BsPasgenerater"), 75, y);
        y += 58;

        ctx.fillStyle = '#1a1a1a';
        ctx.font = '600 20px Arial';
        ctx.fillText('Active Loans', 75, y);
        y += 38;

        user.loans.forEach((loan, i) => {
            const total = loan.takenAmount + loan.interest;

            ctx.strokeStyle = '#eeeeee';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(75, y - 8);
            ctx.lineTo(BASE_WIDTH - 75, y - 8);
            ctx.stroke();

            y += 30;
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '600 19px Arial';
            ctx.fillText(`Loan ${i + 1}`, 75, y);
            y += 34;

            ctx.font = '400 16.8px Arial';
            ctx.fillStyle = '#333333';

            ctx.fillText('Principal Amount', 75, y);
            ctx.textAlign = 'right';
            ctx.fillText(`₹${loan.takenAmount.toLocaleString('en-IN')}`, BASE_WIDTH - 75, y);
            ctx.textAlign = 'left';
            y += 30;

            ctx.fillText('Interest', 75, y);
            ctx.textAlign = 'right';
            ctx.fillText(`₹${loan.interest.toLocaleString('en-IN')}`, BASE_WIDTH - 75, y);
            ctx.textAlign = 'left';
            y += 32;

            ctx.fillStyle = '#1a1a1a';
            ctx.font = '600 19px Arial';
            ctx.fillText('Total Payable', 75, y);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#0000ff';
            ctx.fillText(`₹${total.toLocaleString('en-IN')}`, BASE_WIDTH - 75, y);
            ctx.textAlign = 'left';
            y += 30;

            ctx.fillStyle = '#555555';
            ctx.font = '400 15.8px Arial';
            ctx.fillText(`Due on ${loan.endDate}`, 75, y);
            y += 55;
        });
        y += 45;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '500 17.5px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Try to clear on time, Thank you', BASE_WIDTH / 2, y);
        y += 62;
        ctx.fillStyle = '#444444';
        ctx.font = 'italic 400 15px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Powered by BsBookpad', BASE_WIDTH - 75, y);

        y += 38;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '400 13.5px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BsLends Services • Confidential', BASE_WIDTH / 2, y);

        y += 70;
        try {
            const link = document.createElement('a');
            link.download = user.name.replace(/[^a-zA-Z0-9]/g, '_') + '_BsLends_Statement.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`✅ High-Quality Receipt downloaded for ${user.name}`);
        } catch (err) {
            console.error("Download error:", err);
            alert("Could not download. Try using Live Server.");
        }
    });
});

function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        alert(" Back button clicked!\n\n(In a real app this would take you to previous screen or home.)");
      }
    }
