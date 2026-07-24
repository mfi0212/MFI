const users = {
    "9919888*": {
        name: "Mahesh Muthinti & Phanindra Yerra",
        poolEntries: [
            {
                id: 1,
                name: "Amount 1",
                amount: 10000,
                date: "16-08-2026",
                rate: 20,
                splits: [
                    { member: "Mahesh Muthinti", share: 5000 },
                    { member: "Phanindra Yerra", share: 5000 },
                ]
            },
            {
                id: 2,
                name: "Special 25% pass",
                amount: 29418,
                date: "21-08-2026",
                rate: 25,
                splits: [
                    { member: "Mahesh Muthinti", share: 14709 },
                    { member: "Muthinti Mahesh", share: 14709 },
                ]
            },
            {
                id: 3,
                name: "Special 25% pass",
                amount: 2425,
                date: "21-08-2026",
                rate: 25,
                splits: [
                    { member: "Mahesh Muthinti", share: 1000 },
                    { member: "Muthinti Mahesh", share: 1425 },
                ]
            }
        ]
    },
};

let currentUser = null;
document.addEventListener('contextmenu', e => e.preventDefault());
let membersCount = 4;
let memberAmounts = [];

window.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
        document.getElementById("username").value = savedUsername;
    }
});

function login() {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.toLowerCase().trim();

    if (users[username]) {
        localStorage.setItem("savedUsername", username);
        currentUser = users[username];

        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";
        document.getElementById("user-name-display").textContent = currentUser.name;

        renderPoolEntries();
    } else {
        alert("Invalid password.");
    }
}

function logout() {
    document.getElementById("main-app").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("username").value = localStorage.getItem("savedUsername") || "";
    currentUser = null;
}

function renderPoolEntries() {
    const container = document.getElementById("pool-entries");
    container.innerHTML = "";

    currentUser.poolEntries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "pool-card";
        
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <div style="font-weight: 300; font-size: 13px; color: #ffffffc9;">${entry.name}</div>
                    <div style="font-size: 20px; font-weight: 600; margin-top: 5px;">
                        ₹${entry.amount.toLocaleString("en-IN")}
                    </div>
                </div>
                <div style="text-align: right; display: flex; justify-content: space-between; align-items: end; flex-direction: column; height: -webkit-fill-available;">
                    <div style="color: #0a95ff; font-size: 20px; font-weight: 600;">
                        ${entry.rate}%
                    </div>
                    <div style="font-weight: 300; font-size: 13px; color: #ffffffc9; margin-top:4px;">
                        ${entry.date}
                    </div>
                </div>
            </div>
        `;

        card.onclick = () => showEntryDetail(entry);
        container.appendChild(card);
    });
}

function showEntryDetail(entry) {
    document.getElementById("modal-title").textContent = entry.name;
    document.getElementById("modal-date").textContent = entry.date;
    document.getElementById("modal-total").textContent = `₹${entry.amount.toLocaleString("en-IN")}`;
    document.getElementById("modal-rate").textContent = `${entry.rate}%`;

    const totalMonthlyInterest = Math.round(entry.amount * entry.rate / 100);
    document.getElementById("modal-total-interest").textContent = `₹${totalMonthlyInterest.toLocaleString("en-IN")}`;

    const container = document.getElementById("member-splits");
    container.innerHTML = "";

    entry.splits.forEach(split => {
        const memberInterest = Math.round(totalMonthlyInterest * (split.share / entry.amount));

        const row = document.createElement("div");
        row.className = "split-row";
        row.innerHTML = `
            <div>
                <div>${split.member}</div>
                <div style="color: white; font-size: 20px; font-weight: 600;">₹${split.share.toLocaleString("en-IN")}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight: 600; font-size: 20px; color: #0a95ff;">₹${memberInterest.toLocaleString("en-IN")}</div>
                <div style="font-weight: 300; font-size: 13px; color: #ffffffc9;">per month</div>
            </div>
        `;
        container.appendChild(row);
    });

    document.getElementById("entry-detail-modal").style.display = "flex";
}

function hideEntryDetail() {
    document.getElementById("entry-detail-modal").style.display = "none";
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert("Back button clicked!");
    }
}

// ==================== IMPROVED SPLIT CALCULATOR ====================

function openCalculator() {
    document.getElementById("calculator-modal").style.display = "flex";
    resetCalculator();
}

function closeCalculator() {
    document.getElementById("calculator-modal").style.display = "none";
}

function resetCalculator() {
    membersCount = 4;
    document.getElementById("calc-members").value = membersCount;
    document.getElementById("calc-total").value = "";
    document.getElementById("calc-rate").value = 12;
    updateMembers();
}

function changeMembers(delta) {
    membersCount = Math.max(1, Math.min(20, membersCount + delta));
    document.getElementById("calc-members").value = membersCount;
    updateMembers();
}

function updateMembers() {
    membersCount = parseInt(document.getElementById("calc-members").value) || 4;
    membersCount = Math.max(1, Math.min(20, membersCount));
    document.getElementById("calc-members").value = membersCount;
    
    const totalAmount = parseFloat(document.getElementById("calc-total").value) || 0;
    const equalShare = totalAmount / membersCount;
    
    memberAmounts = Array(membersCount).fill(equalShare);
    renderMemberList();
    calculateSplit();
}

function renderMemberList() {
    const container = document.getElementById("member-list");
    container.innerHTML = "";
    
    const total = parseFloat(document.getElementById("calc-total").value) || 0;
    const rate = parseFloat(document.getElementById("calc-rate").value) || 0;
    const totalInterest = total * (rate / 100);
    
    memberAmounts.forEach((amount, index) => {
        const memberInterest = total > 0 ? (amount / total) * totalInterest : 0;
        
        const div = document.createElement("div");
        div.className = "member-item";
        div.innerHTML = `
            <div class="member-name">${index + 1}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="adjustMember(${index}, -100)" class="adjust-btn" style="background:#ff4444;">−</button>
                <input type="number" class="member-amount" value="${amount.toFixed(2)}" onchange="updateMemberAmount(${index}, this.value)">
                <button onclick="adjustMember(${index}, 100)" class="adjust-btn">＋</button>
            </div>
            <div style="margin-left: 12px;
    font-size: 13px;
    color: #0a95ff;
    min-width: 80px;
    text-align: justify;">
                ₹${memberInterest.toFixed(0)}
            </div>
        `;
        container.appendChild(div);
    });
}

function adjustMember(index, delta) {
    memberAmounts[index] = Math.max(0, memberAmounts[index] + delta);
    autoAdjustRemaining(index);
    renderMemberList();
    calculateSplit();
}

function updateMemberAmount(index, value) {
    const newValue = parseFloat(value) || 0;
    memberAmounts[index] = Math.max(0, newValue);
    autoAdjustRemaining(index);
    renderMemberList();
    calculateSplit();
}

// Auto-adjust other members to keep total amount fixed
function autoAdjustRemaining(changedIndex) {
    const total = parseFloat(document.getElementById("calc-total").value) || 0;
    if (total <= 0) return;

    let currentSum = memberAmounts.reduce((a, b) => a + b, 0);
    let difference = total - currentSum;

    if (Math.abs(difference) < 1) return;

    // Distribute the difference among other members
    let otherMembersCount = membersCount - 1;
    if (otherMembersCount <= 0) return;

    const adjustmentPerMember = difference / otherMembersCount;

    for (let i = 0; i < membersCount; i++) {
        if (i !== changedIndex) {
            memberAmounts[i] = Math.max(0, memberAmounts[i] + adjustmentPerMember);
        }
    }

    // Final check to ensure exact total
    currentSum = memberAmounts.reduce((a, b) => a + b, 0);
    if (Math.abs(currentSum - total) > 0.1) {
        memberAmounts[changedIndex] = total - (currentSum - memberAmounts[changedIndex]);
    }
}

function calculateSplit() {
    const total = parseFloat(document.getElementById("calc-total").value) || 0;
    const rate = parseFloat(document.getElementById("calc-rate").value) || 0;
    
    const interest = total * (rate / 100);
    const totalWithInterest = total + interest;
    
    document.getElementById("result-total-interest").textContent = "₹" + totalWithInterest.toFixed(2);
    document.getElementById("result-interest").textContent = "₹" + interest.toFixed(2);
    document.getElementById("result-per-member").textContent = "₹" + (totalWithInterest / membersCount).toFixed(2);
}

// Close modal when clicking outside
document.addEventListener("click", function(e) {
    const modal = document.getElementById("calculator-modal");
    if (modal && modal.style.display === "flex" && e.target === modal) {
        closeCalculator();
    }
});
