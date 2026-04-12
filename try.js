       
const passwords = {
    "Mahesh888*": {
        name: "Mahesh Muthinti ⚡",
        membershipType: "",
        membershipIcon: "https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/100/2.gif",
        profileBackground: "#ff4500",
        stars: 0,
        coins: 1,
        tierPoints: 5,
        showCustomContent: "no",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/programx"
        },
        loans: [
           { planDate: "14-02-2026", endDate: "14-04-2026", interest: 3357, takenAmount: 11380, takenFrom: "Golden", fineRate: 50 },
            { planDate: "09-02-2026", endDate: "07-05-2026", interest: 875, takenAmount: 3500, takenFrom: "Lendlink", fineRate: 50 },
            { planDate: "11-01-2026", endDate: "08-05-2026", interest: 1370, takenAmount: 5480, takenFrom: "Golden", fineRate: 50 },
            { planDate: "14-01-2026", endDate: "11-05-2026", interest: 4220, takenAmount: 22813, takenFrom: "Golden", fineRate: 50 },
       ]
    },
};


const TIER_THRESHOLDS = [
    { tier: 1, points: 0,   interestRate: "Standard" },
    { tier: 2, points: 100, interestRate: "2% lower" }
];

function getTierInfo(points) {
    if (points >= 100) {
        return { tier: 2, points, needed: 0, nextRate: null };
    } else {
        return { tier: 1, points, needed: 100 - points, nextRate: "2% lower" };
    }
}

function showTierPopup(html) {
    const old = document.getElementById("tierPopupModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "tierPopupModal";
    modal.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.75); 
        display:flex; align-items:center; justify-content:center; z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:#111; color:#fff; padding:20px; border-radius:12px; max-width:320px; text-align:center; font-family:sans-serif;">
            <p style="margin:0 0 16px; line-height:1.5;">${html}</p>
            <button onclick="this.closest('#tierPopupModal').remove()" 
                    style="background:#00ff9d; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedPassword = localStorage.getItem("userPassword");
    if (savedPassword) {
        const passwordInput = document.getElementById("userPassword");
        passwordInput.value = savedPassword;
        document.getElementById("poweredBy").style.display = "block";
    }
});

document.getElementById("submitBtn").addEventListener("click", () => {
    const userInput = document.getElementById("userPassword").value.trim();
    const errorMessage = document.getElementById("error-message");
    const user = passwords[userInput];

    if (!userInput) {
        errorMessage.textContent = "Enter a password.";
        return;
    }

    if (user) {
        localStorage.setItem("userPassword", userInput);
        document.getElementById("userName").textContent = user.name;
        document.getElementById("starCount").textContent = user.stars;
        document.getElementById("coinsCount").textContent = user.coins;

        const membershipTypeContainer = document.getElementById("membershipType");
        membershipTypeContainer.innerHTML = `
            <a href="https://blackswan19.github.io/golden/FM/duplicatelite">${user.membershipType}</a>
        `;

        const userNameContainer = document.getElementById("userNameContainer");
        userNameContainer.innerHTML = `
            <span id="userName">${user.name}</span>
            <img src="${user.membershipIcon}" alt="${user.membershipType} Icon" class="user-icon">
        `;

        const profilePicture = document.getElementById("profilePicture");
        profilePicture.style.backgroundColor = user.profileBackground;
        const nameParts = user.name.trim().split(/\s+/).slice(0, 2);
        const iconText = nameParts.map(part => part.charAt(0)).join("").toUpperCase();
        profilePicture.style.backgroundImage = "none";
        profilePicture.textContent = iconText;

        // === TIER PROGRESS ===
        const tierInfo = getTierInfo(user.tierPoints);
        const percent = tierInfo.tier === 2 ? 100 : (user.tierPoints / 100) * 100;

        let barColor = user.profileBackground;
        if (barColor.startsWith("rgb")) {
            const rgb = barColor.match(/\d+/g);
            if (rgb) barColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
        } else if (barColor.startsWith("#")) {
            barColor = barColor + "cc";
        }

        const tierProgressHTML = `
            <div id="tierProgress">
                <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;" id="tierClickTrigger">
                    <span style="color: #ffd700; font-weight: 600;">Tier ${tierInfo.tier}</span>
                    <div class='tiergraphbar'>
                        <div style="width: ${percent}%; height: 100%; background: ${barColor}; transition: width 0.4s ease;"></div>
                    </div>
                    <span style="color: #aaa; font-size: 12px;">${user.tierPoints} pts</span>
                </div>
            </div>
        `;

        const existingTier = document.getElementById("tierProgress");
        if (existingTier) existingTier.remove();
        userNameContainer.insertAdjacentHTML("afterend", tierProgressHTML);

        document.getElementById("tierClickTrigger").addEventListener("click", () => {
            const msg = tierInfo.tier === 2
                ? `You have <b>Tier 2</b> (${user.tierPoints} points).<br>You unlocked <b>2% lower interest rate</b>!`
                : `You have <b>Tier 1</b> (${user.tierPoints} points).<br>You need <b>${tierInfo.needed}</b> more points to reach <b>Tier 2</b> and get <b>2% lower interest</b>.`;
            showTierPopup(msg);
        });

        const borrowLimitMessage = document.createElement("div");
        borrowLimitMessage.id = "borrowLimitMessage";

        const ads = [
            {
                name: "LendLink - Mid",
                headline: "LendLink - Mid",
                link: "",
                desc: "A servive from lendlink by which you can turn your money into income.</red>",
                icon: "https://cdn.example.com/paymine-16.png",
            },
            {
                name: "Split half it",
                headline: "Split half it ",
                desc: "With Split half pay, you can pay half of the total amount and extend the remaining half with a flexibility while ensuring smooth repayment.",
                link: "https://blackswan19.github.io/golden/FM/solution",
                icon: "https://cdn.example.com/split-16.png"
            },
            {
                name: "Delay it",
                headline: "Delay it",
                desc: "It was a program by which you can Extend the returning date of your amounts.",
                link: "https://blackswan19.github.io/golden/FM/solution",
                icon: "https://cdn.example.com/delay-16.png"
            }
        ];

        const ad = ads[Math.floor(Math.random() * ads.length)];

        borrowLimitMessage.innerHTML = `
            <div class="bot">
                <p class="borrowLimitMessage">
                    <span>
                        <strong>${ad.headline}</strong> (Ad)
                    </span>  <br>
                    ${ad.desc}
                    <br><a class="exploreadds" href="${ad.link}" 
                       >
            <i  class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>
    </p>
    </div>
    `;
    //    Explore ${ad.name}
        const userInfoModal = document.getElementById("userInfoModal");
        const profilePictureContainer = profilePicture.parentElement;
        userInfoModal.insertBefore(borrowLimitMessage, profilePictureContainer);

        // === AMOUNT BUTTONS ===
        const amountButtons = document.getElementById("amountButtons");
        amountButtons.innerHTML = "";
        user.loans.forEach((loan, index) => {
            const btn = document.createElement("button");
            btn.className = "amount-btn";
            btn.innerHTML = `₹${loan.takenAmount}<span class="amount-id"> Amount ${index + 1}</span>`;
            btn.onclick = () => displayLoanDetails(loan, index);
            amountButtons.appendChild(btn);
        });

        // Apply initial status colors (non-active)
        updateAllButtonColors(user);

        // === SPECIAL CONTENT ===
        const specialContentDiv = document.getElementById("specialContent");
        try {
            if (user.showCustomContent === "yes" && user.customContent && user.customContent.value) {
                const contentUrl = user.customContent.url && /^https?:\/\//.test(user.customContent.url) ? user.customContent.url : null;
                const contentHtml = user.customContent.type === "text"
                    ? `<h3 style="color:white;font-size:16px;">Special Offer</h3><p style="color:#00aeff;font-size:14px;">${user.customContent.value}</p>`
                    : `<h3 style="color:white;font-size:16px;">Special Offer</h3><img class="applybtn" src="${user.customContent.value}" alt="Special Offer" style="cursor:pointer;" onerror="this.src='';">`;
                if (contentUrl) {
                    specialContentDiv.innerHTML = `<a href="${contentUrl}" style="text-decoration:none;display:block;" aria-label="Special offer">${contentHtml}</a>`;
                    specialContentDiv.onclick = (e) => { window.open(contentUrl, '_blank'); e.preventDefault(); };
                } else {
                    specialContentDiv.innerHTML = contentHtml;
                }
            } else {
                specialContentDiv.innerHTML = "";
            }
        } catch (error) {
            console.error("Error rendering specialContent:", error);
            specialContentDiv.innerHTML = "";
            errorMessage.textContent = "Error loading special content.";
        }

        // === SHOW FIRST LOAN & REMINDER ===
        if (user.loans.length > 0) {
            displayLoanDetails(user.loans[0], 0);
            checkDueReminders(user);
        } else {
            errorMessage.textContent = "No active loans found.";
        }

        document.getElementById("userInfoModal").style.display = "block";
        document.getElementById("passwordContainer").style.display = "none";
        errorMessage.textContent = "";
    } else {
        errorMessage.textContent = "Invalid password.";
    }
});
// ===============================================
// REMINDER: DUE TODAY + 1 DAY BEFORE (UPDATED)
// ===============================================
function checkDueReminders(user) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFormat = /^(\d{2})-(\d{2})-(\d{4})/;
    const formatDate = (d) => `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;

    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    let dueToday = null;
    let dueTomorrow = null;

    user.loans.forEach(loan => {
        const cleanEndDate = loan.endDate.split('(')[0].split('<')[0].trim();
        const match = cleanEndDate.match(dateFormat);
        if (!match) return;

        const endDateStr = `${match[1]}-${match[2]}-${match[3]}`;

        if (endDateStr === todayStr) dueToday = { loan, date: cleanEndDate };
        if (endDateStr === tomorrowStr) dueTomorrow = { loan, date: cleanEndDate };
    });

    const reminderModal = document.getElementById("reminderModal");
    const reminderMessage = document.getElementById("reminderMessage");

    if (dueToday) {
        reminderMessage.innerHTML = 
            `Mr. ${user.name}, <b>Today (${dueToday.date})</b> you have an amount to return from <b>${dueToday.loan.takenFrom}</b>.<br><br>Clear on time to avoid overdue interest. Thank you!`;
        reminderModal.style.display = "flex";
    } 
    else if (dueTomorrow) {
        // Custom tomorrow message with extension warning
        reminderMessage.innerHTML = 
            `Mr. ${user.name}, <b>Tomorrow (${dueTomorrow.date})</b> your Amount <b>${dueTomorrow.loan.takenAmount}</b> from <b>${dueTomorrow.loan.takenFrom}</b> has to be returned.<br><br>` +
            `<b>Try to return the amount today or by tomorrow 10 AM.</b><br><br>` +
            `Note: Do you like to extend? Do so today only. Tomorrow extension will not be provided and additional interest will be added.`;
        reminderModal.style.display = "flex";
    }
}
function closeReminderModal() {
    document.getElementById("reminderModal").style.display = "none";
}

// ===============================================
// OVERDUE & DUE TODAY CALCULATION
// ===============================================
function calculateDaysBetween(startDate, endDate) {
    try {
        const dateFormat = /^(\d{2})-(\d{2})-(\d{4})/;
        const startMatch = startDate.match(dateFormat);
        const endMatch = endDate.split('(')[0].match(dateFormat);
        if (startMatch && endMatch) {
            const start = new Date(`${startMatch[3]}-${startMatch[2]}-${startMatch[1]}`);
            const end = new Date(`${endMatch[3]}-${endMatch[2]}-${endMatch[1]}`);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return "Invalid date format";
    } catch (error) {
        return "Error";
    }
}

let sessionReferenceTime = null;

function calculateOverdueFine(endDateString, loan, user = {}) {
    try {
        // Clean any extra text: "(overdue)", HTML, etc.
        const clean = endDateString.split('(')[0].split('<')[0].trim();

        // Match DD-MM-YYYY strictly
        const match = clean.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) return { overdue: false, fine: 0, daysOverdue: 0, hoursOverdue: 0 };

        const [, day, month, year] = match;
        const endDate = new Date(`${year}-${month}-${day}`);
        
        // Fine starts the NEXT day → so we consider end of endDate as deadline
        endDate.setHours(23, 59, 59, 999);

        const now = new Date(); // Real current time

        if (now <= endDate) {
            return { overdue: false, fine: 0, daysOverdue: 0, hoursOverdue: 0 };
        }

        // Calculate exact days overdue (starts from the day after endDate)
        const diffMs = now - endDate;
        const hoursOverdue = Math.floor(diffMs / (1000 * 60 * 60));
        const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // This is key!

        const fineRate = loan?.fineRate ?? user?.fineRate ?? 0;
        const fine = daysOverdue * fineRate;

        return {
            overdue: true,
            fine,
            daysOverdue,
            hoursOverdue,
            fineRateUsed: fineRate,
            endDate: endDate.toISOString().split('T')[0],
            calculatedAt: now.toISOString()
        };

    } catch (err) {
        console.error("Fine calc error:", err);
        return { overdue: false, fine: 0, daysOverdue: 0, hoursOverdue: 0 };
    }
}

function isDueToday(endDate) {
    const today = new Date();
    const dateFormat = /^(\d{2})-(\d{2})-(\d{4})/;
    const todayStr = `${String(today.getDate()).padStart(2,'0')}-${String(today.getMonth()+1).padStart(2,'0')}-${today.getFullYear()}`;
    
    const cleanEndDate = endDate.split('(')[0].split('<')[0].trim();
    const match = cleanEndDate.match(dateFormat);
    if (!match) return false;
    
    const endDateStr = `${match[1]}-${match[2]}-${match[3]}`;
    return endDateStr === todayStr;
}

// ===============================================
// UPDATE NON-ACTIVE BUTTONS (STATUS COLORS)
// ===============================================
function updateAllButtonColors(user) {
    const buttons = document.querySelectorAll("#amountButtons .amount-btn");
    buttons.forEach((btn, idx) => {
        const loan = user.loans[idx];
        if (!loan) return;

        const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
        const dueToday = isDueToday(loan.endDate);

        // Only apply status color if NOT active
        if (!btn.classList.contains("active")) {
            if (overdueInfo.overdue) {
                btn.style.background = "rgb(195 86 0)"; // darkred
                btn.style.color = "white";
            } else if (dueToday) {
                btn.style.background = "#ff9900ff"; // orange
                btn.style.color = "white";
            } else {
                btn.style.background = "";
                btn.style.color = "";
                btn.style.border = "";
            }
        }
    });
}

// ===============================================
// DISPLAY LOAN DETAILS + ACTIVE BUTTON LOGIC
// ===============================================
function displayLoanDetails(loan, index) {
    const loanDetails = document.getElementById("loanDetails");
    const userInput = document.getElementById("userPassword").value.trim();
    const user = passwords[userInput];

    const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
    const fine = overdueInfo.fine || 0;
    const totalReturnAmount = (loan.takenAmount + loan.interest + fine).toFixed(2);
    const cleanEndDate = loan.endDate.split('(')[0].split('<')[0];
    const daysBetween = calculateDaysBetween(loan.planDate, cleanEndDate);

    // === REMOVE ACTIVE FROM ALL ===
    document.querySelectorAll(".amount-btn").forEach(btn => {
        btn.classList.remove("active");
        // Reset non-active buttons to status color
        updateAllButtonColors(user);
    });

    // === ADD ACTIVE TO CURRENT ===
    const activeBtn = document.getElementById("amountButtons").children[index];
    activeBtn.classList.add("active");

    // === APPLY ACTIVE STYLE (OVERRIDES STATUS) ===
    activeBtn.style.background = "#0066cc";
    activeBtn.style.color = "black";

    let overdueSection = "";
    if (overdueInfo.overdue) {
        overdueSection = `
             <h3>Overdue Details</h3>
            <p style="color: #ff9300;"><?xml version="1.0" encoding="UTF-8"?>
<svg style='    fill: #ff9300;' xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m17.776,21.334c-.564,1.595-2.085,2.666-3.781,2.666H4.005c-1.17,0-2.279-.51-3.044-1.398-.753-.875-1.087-2.025-.917-3.158.405-2.698,1.885-5.198,4.401-7.444C1.929,9.754.449,7.254.044,4.556c-.17-1.132.164-2.283.917-3.157C1.726.51,2.835,0,4.005,0h9.99c1.696,0,3.217,1.071,3.781,2.666.185.521-.088,1.092-.608,1.276-.521.187-1.092-.088-1.276-.608-.283-.798-1.045-1.334-1.896-1.334H4.005c-.587,0-1.145.257-1.528.703-.378.439-.539.991-.454,1.555.375,2.499,1.922,4.84,4.598,6.958.24.189.38.479.38.784s-.14.595-.38.784c-2.676,2.118-4.223,4.458-4.598,6.957-.085.564.076,1.117.454,1.556.384.446.941.703,1.528.703h9.99c.852,0,1.613-.536,1.896-1.333.185-.521.758-.796,1.276-.608.521.184.793.756.608,1.276Zm-8.15-7.39l.508.405c1.172.932,2.727,2.431,3.474,4.275.125.309.088.659-.098.935-.186.275-.496.441-.829.441h-7.362c-.332,0-.643-.166-.829-.441-.186-.275-.223-.625-.099-.933.746-1.853,2.3-3.346,3.472-4.273l.52-.411c.364-.289.88-.288,1.244.002Zm-.627,2.06c-.631.509-1.371,1.194-1.965,1.996h3.928c-.594-.798-1.332-1.484-1.963-1.996Zm15.001-4.003c0,3.309-2.691,6-6,6s-6-2.691-6-6,2.691-6,6-6,6,2.691,6,6Zm-2,0c0-2.206-1.794-4-4-4s-4,1.794-4,4,1.794,4,4,4,4-1.794,4-4Zm-3-.414v-1.586c0-.552-.447-1-1-1s-1,.448-1,1v2c0,.265.105.52.293.707l1,1c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023,0-1.414l-.707-.707Z"/>
</svg>
 You are overdue by : ${overdueInfo.daysOverdue} days (${overdueInfo.hoursOverdue} hours)</p>
            <p style="color: #ff9300;"><?xml version="1.0" encoding="UTF-8"?>
<svg  style='    fill: #ff9300;    width: 14px;
    height: 15px;
' xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" width="512" height="512"><path d="M18.5,0H13a1.5,1.5,0,0,0,0,3h5.5a2.43,2.43,0,0,1,.344.035l-18.4,18.4a1.5,1.5,0,0,0,2.122,2.122l18.4-18.4A2.43,2.43,0,0,1,21,5.5V11a1.5,1.5,0,0,0,3,0V5.5A5.507,5.507,0,0,0,18.5,0Z"/><path d="M6.5,11A4.5,4.5,0,1,0,2,6.5,4.505,4.505,0,0,0,6.5,11Zm0-6A1.5,1.5,0,1,1,5,6.5,1.5,1.5,0,0,1,6.5,5Z"/><path d="M17.5,13A4.5,4.5,0,1,0,22,17.5,4.505,4.505,0,0,0,17.5,13Zm0,6A1.5,1.5,0,1,1,19,17.5,1.5,1.5,0,0,1,17.5,19Z"/></svg>
 Overdue interest : ${fine} Rupees</p>
        `;
    }

    loanDetails.innerHTML = `
        <p id="scrotamts"></p>
        <div class="loan-entry">
            <p style="
    text-align: center;
    position: sticky;
    top: 70px;
    margin-top: 30px;
    right: 5px;
    float: right;
    margin-right: -15px;
    z-index: 1000000;">
                <button class="amounts-btn downsingle" style="width: 100%;
    font-size: 9px;
    padding: 2px 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 0px;
    font-weight: 400;
    letter-spacing: 0.2px;
    backdrop-filter: blur(1.5px);
    gap: 5px;" onclick="downloadSingleLoan(${index})">
                    <svg style="width: 14px;
    height: 20px;" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M19,6V4a4,4,0,0,0-4-4H9A4,4,0,0,0,5,4V6a5.006,5.006,0,0,0-5,5v5a5.006,5.006,0,0,0,5,5,3,3,0,0,0,3,3h8a3,3,0,0,0,3-3,5.006,5.006,0,0,0,5-5V11A5.006,5.006,0,0,0,19,6ZM7,4A2,2,0,0,1,9,2h6a2,2,0,0,1,2,2V6H7ZM17,21a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V17a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Zm5-5a3,3,0,0,1-3,3V17a3,3,0,0,0-3-3H8a3,3,0,0,0-3,3v2a3,3,0,0,1-3-3V11A3,3,0,0,1,5,8H19a3,3,0,0,1,3,3Z"/><path d="M18,10H16a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/></svg>

                        Download This Receipt
                </button>
            </p>
            <h3>Service</h3>
            <p><?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   version="1.1"
   id="svg423"
   xml:space="preserve"
   width="32"
   height="32"
   viewBox="0 0 32 32"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><defs
     id="defs427"><clipPath
       clipPathUnits="userSpaceOnUse"
       id="clipPath437"><path
         d="M 0,24 H 24 V 0 H 0 Z"
         id="path435" /></clipPath></defs><g
     id="g429"
     transform="matrix(1.3333333,0,0,-1.3333333,0,32)"><g
       id="g431"><g
         id="g433"
         clip-path="url(#clipPath437)"><g
           id="g439"
           transform="translate(1,1)"><path
             d="M 0,0 H 22"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path441" /></g><g
           id="g443"
           transform="translate(2,5)"><path
             d="M 0,0 H 20"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path445" /></g><g
           id="g447"
           transform="translate(21.4258,18.6245)"><path
             d="m 0,0 -7.501,3.907 c -1.2,0.625 -2.649,0.625 -3.85,0 L -18.852,0 c -0.523,-0.272 -0.966,-0.689 -1.308,-1.181 -0.726,-1.045 0.13,-2.444 1.442,-2.444 h 18.584 c 1.313,0 2.168,1.399 1.443,2.444 C 0.967,-0.689 0.523,-0.272 0,0 Z"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path449" /></g><g
           id="g451"
           transform="translate(9,15)"><path
             d="M 0,0 V -10"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path453" /></g><g
           id="g455"
           transform="translate(15,15)"><path
             d="M 0,0 V -10"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path457" /></g><g
           id="g459"
           transform="translate(4,15)"><path
             d="M 0,0 V -10"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path461" /></g><g
           id="g463"
           transform="translate(20,15)"><path
             d="M 0,0 V -10"
             style="fill:none;stroke:#a0a0a0;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path465" /></g></g></g></g></svg>
 Taken in : ${loan.takenFrom} </p>
            <h3>Amount</h3>
            <p><?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m23.018,8.785c-.595-.542-1.356-.82-2.169-.782-.804.037-1.545.386-2.085.981l-3.217,3.535c-.551-.91-1.55-1.519-2.689-1.519H4c-2.206,0-4,1.794-4,4v5c0,2.206,1.794,4,4,4h4.965c2.849,0,5.57-1.22,7.467-3.348l6.804-7.637c1.094-1.226.996-3.123-.218-4.23Zm-1.275,2.899l-6.804,7.638c-1.518,1.701-3.695,2.678-5.974,2.678h-4.965c-1.103,0-2-.897-2-2v-5c0-1.103.897-2,2-2h8.858c.629,0,1.142.513,1.142,1.143,0,.564-.421,1.051-.98,1.13l-5.161.737c-.546.078-.926.585-.848,1.132.078.548.587.928,1.131.849l5.161-.737c1.175-.168,2.129-.987,2.514-2.058l4.427-4.865c.181-.2.43-.316.699-.329.272-.008.529.082.728.262.407.372.44,1.009.072,1.421Zm-7.449-7.391c-.391-.391-.391-1.023,0-1.414l2.293-2.293c.373-.374.914-.586,1.414-.586s1.041.212,1.414.586l2.293,2.293c.391.391.391,1.023,0,1.414-.195.195-.451.293-.707.293s-.512-.098-.707-.293l-1.293-1.293v3c0,.552-.447,1-1,1s-1-.448-1-1v-3l-1.293,1.293c-.391.391-1.023.391-1.414,0Zm-7.543,4.707h3.5c1.517,0,2.75-1.31,2.75-2.919,0-1.665-1.581-3.473-3.138-4.223.164-.164.322-.342.462-.531.405-.55.032-1.326-.651-1.326h-2.347c-.646,0-1.067.73-.695,1.259.151.214.327.415.51.598-1.558.75-3.14,2.559-3.14,4.224,0,1.61,1.233,2.919,2.75,2.919Zm1.75-5.5c.745,0,2.5,1.527,2.5,2.581,0,.507-.336.919-.75.919h-3.5c-.414,0-.75-.413-.75-.919,0-1.054,1.755-2.581,2.5-2.581Z"/>
</svg>
 Taken Amount : ${loan.takenAmount} Rupees</p>
            <h3>Taken & Return</h3>
            <p><?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="m8,12h-2c-1.103,0-2,.897-2,2v2c0,1.103.897,2,2,2h2c1.103,0,2-.897,2-2v-2c0-1.103-.897-2-2-2Zm-2,4v-2h2v2s-2,0-2,0ZM19,2h-1v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-8v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5Zm-14,2h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3v-9h20v9c0,1.654-1.346,3-3,3Z"/></svg>
Taken date : ${loan.planDate}</p>
            <p><?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M17,10.039c-3.859,0-7,3.14-7,7,0,3.838,3.141,6.961,7,6.961s7-3.14,7-7c0-3.838-3.141-6.961-7-6.961Zm0,11.961c-2.757,0-5-2.226-5-4.961,0-2.757,2.243-5,5-5s5,2.226,5,4.961c0,2.757-2.243,5-5,5Zm1.707-4.707c.391,.391,.391,1.023,0,1.414-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-1-1c-.188-.188-.293-.442-.293-.707v-2c0-.552,.447-1,1-1s1,.448,1,1v1.586l.707,.707Zm5.293-10.293v2c0,.552-.447,1-1,1s-1-.448-1-1v-2c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v1H11c.552,0,1,.448,1,1s-.448,1-1,1H2v9c0,1.654,1.346,3,3,3h4c.552,0,1,.448,1,1s-.448,1-1,1H5c-2.757,0-5-2.243-5-5V7C0,4.243,2.243,2,5,2h1V1c0-.552,.448-1,1-1s1,.448,1,1v1h8V1c0-.552,.447-1,1-1s1,.448,1,1v1h1c2.757,0,5,2.243,5,5Z"/></svg>
Return date : ${loan.endDate}</p>
            <h3>Duration</h3>
            <p><?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   version="1.1"
   id="svg693"
   xml:space="preserve"
   width="32"
   height="32"
   viewBox="0 0 32 32"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><defs
     id="defs697"><clipPath
       clipPathUnits="userSpaceOnUse"
       id="clipPath707"><path
         d="M 0,24 H 24 V 0 H 0 Z"
         id="path705" /></clipPath></defs><g
     id="g699"
     transform="matrix(1.3333333,0,0,-1.3333333,0,32)"><g
       id="g701"><g
         id="g703"
         clip-path="url(#clipPath707)"><g
           id="g709"
           transform="translate(14.1309,5)"><path
             d="m 0,0 v 0 h -2.131 -2.132 c -0.289,0 -0.558,0.144 -0.72,0.383 -0.162,0.239 -0.194,0.543 -0.086,0.81 0.367,0.909 1.073,1.782 2.099,2.593 l 0.301,0.237 c 0.316,0.251 0.764,0.25 1.08,-0.002 L -1.295,3.787 C -0.268,2.971 0.438,2.098 0.805,1.194 0.913,0.926 0.882,0.622 0.72,0.383 0.559,0.144 0.289,0 0,0"
             style="fill:#a0a0a0;fill-opacity:1;fill-rule:nonzero;stroke:none"
             id="path711" /></g><g
           id="g713"
           transform="translate(14.7402,12)"><path
             d="M 0,0 C 1.913,-1.521 4.248,-3.957 4.741,-7.252 4.998,-8.965 3.637,-10.5 1.904,-10.5 l -9.263,10e-4 c -1.734,0 -3.095,1.536 -2.837,3.251 0.496,3.302 2.824,5.731 4.741,7.248 -1.917,1.517 -4.245,3.946 -4.741,7.248 -0.258,1.715 1.103,3.251 2.837,3.251 L 1.904,10.5 C 3.637,10.5 4.998,8.965 4.741,7.252 4.248,3.957 1.913,1.521 0,0 Z"
             style="fill:none;stroke:#a0a0a0;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
             id="path715" /></g></g></g></g></svg>
 Taken for : ${daysBetween} days</p>
            <h3>Interest</h3>
            <p><?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m14,1.5c0-.828.672-1.5,1.5-1.5s1.5.672,1.5,1.5-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5Zm8.5,3.5c-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5,1.5-.672,1.5-1.5-.672-1.5-1.5-1.5Zm-4.667,3L22.5,0h-2.333l-4.667,8h2.333Zm5.167,4.5v8c0,1.995-2.58,3.5-6,3.5-2.151,0-3.968-.596-5.022-1.534-1.217,1.01-3.353,1.534-5.478,1.534-3.23,0-6.5-1.202-6.5-3.5V4.5C0,2.202,3.27,1,6.5,1s6.5,1.202,6.5,3.5v5.353c1.047-.534,2.433-.853,4-.853,3.42,0,6,1.505,6,3.5ZM2,4.5c0,.436,1.577,1.5,4.5,1.5s4.5-1.064,4.5-1.5-1.577-1.5-4.5-1.5-4.5,1.064-4.5,1.5Zm0,4c0,.436,1.577,1.5,4.5,1.5s4.5-1.064,4.5-1.5v-1.409c-1.226.601-2.867.909-4.5.909s-3.274-.308-4.5-.909v1.409Zm0,4c0,.436,1.577,1.5,4.5,1.5s4.5-1.064,4.5-1.5v-1.409c-1.226.601-2.867.909-4.5.909s-3.274-.308-4.5-.909v1.409Zm0,4c0,.436,1.577,1.5,4.5,1.5s4.5-1.064,4.5-1.5v-1.409c-1.226.601-2.867.909-4.5.909s-3.274-.308-4.5-.909v1.409Zm9,4v-1.409c-1.226.601-2.867.909-4.5.909s-3.274-.308-4.5-.909v1.409c0,.436,1.577,1.5,4.5,1.5s4.5-1.064,4.5-1.5Zm10,0v-1.353c-1.047.534-2.433.853-4,.853s-2.953-.319-4-.853v1.353c0,.529,1.519,1.5,4,1.5s4-.971,4-1.5Zm0-4v-1.353c-1.047.534-2.433.853-4,.853s-2.953-.319-4-.853v1.353c0,.529,1.519,1.5,4,1.5s4-.971,4-1.5Zm0-4c0-.529-1.519-1.5-4-1.5s-4,.971-4,1.5,1.519,1.5,4,1.5,4-.971,4-1.5Z"/>
</svg>
 Normal Interest : ${loan.interest} Rupees</p>
            <hr>
            ${overdueSection}
            <hr>
            <h3>Total to Return</h3>
            <p><?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m19,18c-1.379,0-2.5-1.121-2.5-2.5s1.121-2.5,2.5-2.5,2.5,1.121,2.5,2.5-1.121,2.5-2.5,2.5Zm2-14H5c-.856,0-1.653-.381-2.216-1.004.549-.607,1.335-.996,2.216-.996h18c.552,0,1-.448,1-1s-.448-1-1-1H5C2.239,0,0,2.239,0,5v10c0,2.761,2.239,5,5,5h8c.552,0,1-.448,1-1s-.448-1-1-1H5c-1.657,0-3-1.343-3-3V5s.002-.001.005-.002c.853.638,1.901,1.002,2.995,1.002h16c.552,0,1,.448,1,1v5c0,.552.448,1,1,1s1-.448,1-1v-5c0-1.657-1.343-3-3-3Zm-2,15c-2.333,0-4.375,1.538-4.966,3.741-.143.533.173,1.082.707,1.225.534.143,1.081-.173,1.225-.707.357-1.33,1.605-2.259,3.034-2.259s2.677.929,3.034,2.259c.12.447.524.741.965.741.085,0,.173-.011.26-.035.533-.143.85-.692.707-1.225-.591-2.203-2.633-3.741-4.966-3.741Z"/>
</svg>
 Full Amount : ${totalReturnAmount} Rupees</p>
            <hr>
            <div class="issuebtn" style="padding-top: 20px;width: 102.5%;">  
                <a target="_blank" href="https://forms.gle/RzTJ8W9bwmm8DVj2A"><button>I have an issue here.!</button></a>
            </div>
        </div>
    `;
}

// ===============================================
// MODALS & UTILITIES
// ===============================================
function showAmountsModal() {
    const userInput = document.getElementById("userPassword").value.trim();
    const user = passwords[userInput];
    if (!user) return;

    let totalTaken = 0;
    let totalInterest = 0;
    user.loans.forEach(loan => {
        const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
        const fine = overdueInfo.fine || 0;
        totalTaken += loan.takenAmount;
        totalInterest += loan.interest + fine;
    });
    const totalReturn = (totalTaken + totalInterest).toFixed(2);

    document.getElementById("totalTaken").textContent = totalTaken;
    document.getElementById("totalInterest").textContent = totalInterest;
    document.getElementById("totalReturn").textContent = totalReturn;

    document.getElementById("amountsModal").style.display = "";
}

function closeAmountsModal() {
    document.getElementById("amountsModal").style.display = "none";
}

function closeModal() {
    document.getElementById("userInfoModal").style.display = "none";
    document.getElementById("passwordContainer").style.display = "flex";
    document.getElementById("userPassword").value = "";
    document.getElementById("specialContent").innerHTML = "";
    document.getElementById("borrowLimitMessage")?.remove();
    document.getElementById("tierProgress")?.remove();
    sessionReferenceTime = null;
}

// ===============================================
// RECEIPT GENERATION
// ===============================================
function generateStyledReceipt(textLines, filename) {
    const canvas = document.createElement('canvas');
    const lineHeight = 38;
    const leftMargin = 40;
    const topStart = 80;
    const headingY = 50;

    canvas.width = 720;
    canvas.height = topStart + textLines.length * lineHeight + 60;

    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00BFFF';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BS&MFI MONEY RECEIPT', leftMargin, headingY);

    textLines.forEach((line, i) => {
        const y = topStart + i * lineHeight;
        if (line === 'Try to clear in time, Thank you.') {
            ctx.fillStyle = '#00BFFF';
            ctx.font = 'bold 22px Arial, sans-serif';
        } else {
            ctx.fillStyle = '#000000';
            ctx.font = '22px Arial, sans-serif';
        }
        ctx.textAlign = 'left';
        ctx.fillText(line, leftMargin, y);
    });

    ctx.fillStyle = '#777777';
    ctx.font = 'italic 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Powered by BsBookpad', canvas.width - 30, canvas.height - 25);

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Receipt has Downloaded..! Verify once...!");
}

function formatReturnDateForReceipt(loan) {
    const userInput = document.getElementById("userPassword").value.trim();
    const user = passwords[userInput];
    if (!user) return "Error";
    
    const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
    if (overdueInfo.overdue) return "till today";
    
    const cleanEndDate = loan.endDate.split('(')[0].split('<')[0];
    const [d, m, y] = cleanEndDate.split('-');
    return `${d}/${m}/${y.slice(-2)}`;
}

function downloadSingleLoan(index) {
    const userInput = document.getElementById("userPassword").value.trim();
    const user = passwords[userInput];
    if (!user || !user.loans[index]) {
        alert("No loan found! Enter password first.");
        return;
    }

    const loan = user.loans[index];
    const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
    const fine = overdueInfo.fine || 0;
    const total = (loan.takenAmount + loan.interest + fine).toFixed(2);

    const lines = [
        `Mr. ${user.name}`,
        `Total amount to repay : ₹${total}`,
        '',
        `Amount ${index + 1} total : ₹${total}`,
        `Return date : ${formatReturnDateForReceipt(loan)}`,
        '',
        'Try to clear in time, Thank you.'
    ];

    generateStyledReceipt(lines, `receipt_${user.name}_${index + 1}.png`);
}

function downloadAllLoans() {
    const userInput = document.getElementById("userPassword").value.trim();
    const user = passwords[userInput];
    if (!user || user.loans.length === 0) {
        alert("No loans found! Enter password first.");
        return;
    }

    let totalTaken = 0, totalInterest = 0;
    const amountLines = [];

    user.loans.forEach((loan, i) => {
        const overdueInfo = calculateOverdueFine(loan.endDate, loan, user);
        const fine = overdueInfo.fine || 0;
        const total = (loan.takenAmount + loan.interest + fine).toFixed(2);
        totalTaken += loan.takenAmount;
        totalInterest += loan.interest + fine;

        amountLines.push(`Amount ${i + 1} total : ₹${total}`);
        amountLines.push(`Return date : ${formatReturnDateForReceipt(loan)}`);
        if (i < user.loans.length - 1) amountLines.push('');
    });

    const grandTotal = (totalTaken + totalInterest).toFixed(2);
    const lines = [
        '',
        `Mr. ${user.name}`,
        `Total amount to repay : ₹${grandTotal}`,
        '',
        ...amountLines,
        '',
        'Try to clear in time, Thank you.'
    ];

    generateStyledReceipt(lines, `all_receipts_${user.name}.png`);
}

function showStarCount() {
    const stars = document.getElementById('starCount').textContent.trim();
    if(stars == 0){
        alert(`BsRora(Bot) : \n\nYou have ${stars} stars.\n\nYou can buy the stars to reduce the interest when you think the interest to high.`);
    }
    else{
        alert(`BsRora(Bot) : \n\nYou have ${stars} stars.\n\nYou can use these stars when you think interest is high to reduce the interest.`);
    }
}

function showCoinsCount() {
    const coins = document.getElementById('coinsCount').textContent.trim();
    alert(`BsRora(Bot) : \n\nYou have using ${coins} Duplicate Clone account.`);
}





