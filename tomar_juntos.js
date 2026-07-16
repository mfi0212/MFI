 const users = {
            "9919888*": {
                name: "Mahesh & Phani",
                poolEntries: [
                    {
                        id: 1,
                        name: "Amount 1",
                        amount: 10000,
                        date: "15-05-2026",
                        rate: 20,
                        splits: [
                            { member: "Mahesh Muthinti", share: 5000 },
                            { member: "Phanindra Yerra", share: 5000 },
                        ]
                    }
                ]
            },
        };

        let currentUser = null;
document.addEventListener('contextmenu', e => e.preventDefault());
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
                            <div style="    font-weight: 500;
    font-size: 13px;
    color: #79838f;">${entry.name}</div>
                            <div style="font-size: 20px;
                                        font-weight: 600;
                                        margin-top: 5px;">
                                ₹${entry.amount.toLocaleString("en-IN")}
                            </div>
                        </div>
                        <div style="text-align: right;
    display: flex;
    justify-content: space-between;
    align-items: end;
    flex-direction: column;
    height: -webkit-fill-available;">
                            <div style="color: #22c55e;
                                        font-size: 20px;
                                        font-weight: 600;">
                                ${entry.rate}%
                            </div>
                            <div style="color:#79838f;font-size:13px;margin-top:4px;">
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
                        <div style="    color: white;
    font-size: 20px;
">₹${split.share.toLocaleString("en-IN")}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight: 600;
    color: #45a4e3;">₹${memberInterest.toLocaleString("en-IN")}</div>
                        <div style="font-size:12px;color:#79838f;">per month</div>
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
        alert(" Back button clicked!\n\n(In a real app this would take you to previous screen or home.)");
      }
    }
