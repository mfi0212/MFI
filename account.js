
        const USD_RATE = 87.85;
        let currentCurrency = localStorage.getItem('currency') || 'INR';

        function formatMoney(amount) {
            const val = currentCurrency === 'USD' ? (amount / USD_RATE) : amount;
            const symbol = currentCurrency === 'USD' ? '$' : '₹';
            return `${symbol}${val.toFixed(2)}`;
        }

        function updateCurrencyUI() {
            document.getElementById('currencyLabel').textContent = currentCurrency;
            document.querySelector('#currencySwitch i').className = 
                currentCurrency === 'USD' ? 'fa-solid fa-dollar-sign' : 'fa-solid fa-rupee-sign';
        }

        function toggleCurrency() {
            currentCurrency = currentCurrency === 'INR' ? 'USD' : 'INR';
            localStorage.setItem('currency', currentCurrency);
            updateCurrencyUI();
            // Refresh everything that shows money
            if (currentUser) {
                renderAmountButtons();
                if (currentLoanIndex !== null) displayLoanDetails(currentUser.loans[currentLoanIndex], currentLoanIndex);
                showTotalPopup(); 
                if (document.getElementById('graphContainer').style.display === 'block') renderChart();
            }
        }
        const passwords = {
            "0212": {
                name: "Tony Mantana",
                loans: [
                    {planDate:"10-08-2025",endDate:"25-08-2025",interest:1360,takenAmount:5000,takenFrom:"MLLD",fineRate:86},
                    {planDate:"15-08-2025",endDate:"30-08-2025",interest:4800,takenAmount:20000,takenFrom:"MLending",fineRate:320},
                    {planDate:"16-08-2025",endDate:"31-08-2025",interest:1275,takenAmount:5000,takenFrom:"MLLD",fineRate:90},
                    {planDate:"18-08-2025",endDate:"02-09-2025",interest:1380,takenAmount:5000,takenFrom:"MLLD",fineRate:88},
                    {planDate:"18-08-2025",endDate:"02-09-2025",interest:690,takenAmount:2500,takenFrom:"MLLD",fineRate:46},
                    {planDate:"13-10-2025",endDate:"28-10-2025",interest:0,takenAmount:10000,takenFrom:"MLending",fineRate:46},
                    {planDate:"14-10-2025",endDate:"29-10-2025",interest:0,takenAmount:2700,takenFrom:"MLLD",fineRate:46},
                    {planDate:"23-10-2025",endDate:"07-11-2025",interest:1320,takenAmount:4000,takenFrom:"MLLD",fineRate:46},
                ],
                links: [],
                emote: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_7d7473ef8ba54ce2b2f8e29d078f90bf/default/dark/2.0"
            }
        };

        let currentUser = null, currentLoanIndex = null, loanChart = null, calendarMonth = new Date();
        const PINNED_KEY = 'pinnedView';
        let pendingLink = null;
        let filteredLoans = [];

        document.addEventListener('DOMContentLoaded', () => {
            const saved = localStorage.getItem('lastPassword');
            if (saved) setTimeout(() => document.getElementById("userPassword").value = saved, 300);
            loadUserData();
            updateCurrencyUI(); // restore saved currency
            document.getElementById('currencySwitch').onclick = toggleCurrency;
        });

        function loadUserData() {
            const data = JSON.parse(localStorage.getItem('userData')) || {};
            for (let k in passwords) {
                if (data[k]) {
                    passwords[k].links = data[k].links || [];
                    passwords[k].emote = data[k].emote || passwords[k].emote;
                    passwords[k].loans.forEach((loan, i) => loan.purpose = data[k].purposes?.[i] || "");
                }
            }
        }

        function saveUserData() {
            const data = {};
            for (let k in passwords) {
                data[k] = {
                    links: passwords[k].links,
                    emote: passwords[k].emote,
                    purposes: passwords[k].loans.map(l => l.purpose)
                };
            }
            localStorage.setItem('userData', JSON.stringify(data));
        }

        document.getElementById("submitBtn").onclick = () => {
            const input = document.getElementById("userPassword").value.trim();
            const user = passwords[input];
            const err = document.getElementById("error-message");

            localStorage.setItem('lastPassword', input);

            if (user) {
                currentUser = user;
                filteredLoans = [...user.loans];
                document.getElementById("userName").textContent = user.name;
                document.getElementById("userEmote").src = user.emote;

                renderLinks();
                renderAmountButtons();
                if (user.loans.length) displayLoanDetails(user.loans[0], 0);

                document.getElementById("userInfoModal").style.display = "block";
                err.textContent = "";

                const pinned = localStorage.getItem(PINNED_KEY) || 'list';
                switchView(pinned, false);
                updateNavActive(pinned);
            } else {
                err.textContent = "Invalid password!";
            }
        };

        let searchOpen = false;
        function toggleSearch() {
            const input = document.getElementById("searchInput");
            const icon = document.getElementById("searchIcon");
            const buttons = document.getElementById("amountButtons");

            searchOpen = !searchOpen;
            if (searchOpen) {
                input.classList.add("active");
                icon.style.transform = "rotate(90deg)";
                buttons.style.transform = "translateY(0px)";
                setTimeout(() => input.focus(), 300);
            } else {
                input.classList.remove("active");
                icon.style.transform = "rotate(0deg)";
                buttons.style.transform = "translateY(0)";
                input.value = "";
                filterLoans();
            }
        }

        function filterLoans() {
            const query = document.getElementById("searchInput").value.toLowerCase();
            filteredLoans = currentUser.loans.filter(loan =>
                loan.takenAmount.toString().includes(query) ||
                (loan.purpose && loan.purpose.toLowerCase().includes(query)) ||
                loan.takenFrom.toLowerCase().includes(query)
            );
            renderAmountButtons();
        }

        function renderAmountButtons() {
            const btns = document.getElementById("amountButtons");
            btns.innerHTML = "";
            filteredLoans.forEach((loan, i) => {
                const originalIndex = currentUser.loans.indexOf(loan);
                const b = document.createElement("button");
                b.className = "amount-btn";
                b.innerHTML = `
                    ${formatMoney(loan.takenAmount)}
                    <div class="purpose-tag">${loan.purpose || 'Set Purpose'}</div>
                `;
                b.onclick = () => { displayLoanDetails(loan, originalIndex); switchView('list', false); };
                btns.appendChild(b);
            });
        }

        function displayLoanDetails(loan, index) {
            currentLoanIndex = index;
            const now = new Date();
            const end = new Date(loan.endDate.split('-').reverse().join('-'));
            const daysLeft = Math.ceil((end - now) / 86400000);
            let total = loan.takenAmount + loan.interest;
            let extra = 0;
            if (now > end) {
                const hrs = Math.floor((now - end) / 3600000);
                extra = hrs * 30;
                total += extra;
            }

            document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
            const activeBtn = document.getElementById("amountButtons").children[filteredLoans.indexOf(loan)];
            if (activeBtn) activeBtn.classList.add("active");

            document.getElementById("loanDetails").innerHTML = `
                <div class="loan-entry" id="loanCard${index}">
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Purpose</h3>
                    <input type="text" class="purpose-input" placeholder="e.g. Taken for shoes" value="${loan.purpose || ''}" onchange="updatePurpose(${index}, this.value)">
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Taken service</h3>
                    <p>${loan.takenFrom}</p>
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Amount taken</h3>
                    <p><i class="fa-solid fa-money-bill-transfer"></i> ${formatMoney(loan.takenAmount)}</p>
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Taken & Ends</h3>
                    <p><i class="fa-solid fa-calendar-day"></i> ${loan.planDate}</p>
                    <p><i class="fa-solid fa-calendar-check"></i> ${loan.endDate}</p>
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Interest</h3>
                    <p><i class="fa-solid fa-arrow-up-wide-short"></i> ${formatMoney(loan.interest)}</p>
                    ${extra > 0 ? `<p style="color:#cf8500;"><i class="fa-solid fa-exclamation-circle"></i> Overdue: ${formatMoney(extra)}</p>` : ''}
                    <h3 style="text-decoration:underline;margin:25px 0;font-weight:600;font-size:15px;">Total to Pay</h3>
                    <p><i class="fa-solid fa-money-check-alt"></i> ${formatMoney(total)}</p>
                </div>
            `;
        }

        function updatePurpose(index, value) {
            currentUser.loans[index].purpose = value.trim();
            saveUserData();
            filterLoans();
        }

        function renderLinks() {
            const c = document.getElementById("userLinks"); c.innerHTML = "";
            currentUser.links.forEach((link, i) => {
                const a = document.createElement("div");
                a.className = "user-link";
                a.innerHTML = `<i class="fa-solid fa-link"></i> ${link.title}`;
                a.onclick = () => openLinkConfirm(link, i);
                c.appendChild(a);
            });
        }

        function addLink() {
            const title = prompt("Link title:");
            if (!title) return;
            const url = prompt("Full URL[](https://...):");
            if (url && url.startsWith('http')) {
                currentUser.links.push({ title, url });
                renderLinks();
                saveUserData();
            }
        }

        function openLinkConfirm(link, index) {
            pendingLink = { link, index };
            document.getElementById("linkConfirmText").textContent = `Do you like to visit "${link.title}"? or you like delete it?`;
            document.getElementById("linkConfirmPopup").style.display = "block";
        }

        document.getElementById("linkYesBtn").onclick = () => {
            window.open(pendingLink.link.url, '_blank');
            document.getElementById("linkConfirmPopup").style.display = "none";
        };

        document.getElementById("linkDeleteBtn").onclick = () => {
            currentUser.links.splice(pendingLink.index, 1);
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

        // ==================== TOTAL POPUP ====================
        function showTotalPopup() {
            const now = new Date();
            let base = 0, interest = 0, overdue = 0;
            currentUser.loans.forEach(loan => {
                base += loan.takenAmount;
                interest += loan.interest;
                const end = new Date(loan.endDate.split('-').reverse().join('-'));
                if (now > end) {
                    const hrs = Math.floor((now - end) / 3600000);
                    overdue += hrs * 30;
                }
            });
            const total = base + interest + overdue;

            document.getElementById("totalContent").innerHTML = `
                <p>Taken amount : <strong>${formatMoney(base)}</strong></p>
                <p>Total Interest : <strong>${formatMoney(interest)}</strong></p>
                <hr>
                <p style='margin:0;padding:10px;'>Overdue : <strong>${formatMoney(overdue)}</strong></p>
                <hr>
                <p style='margin-top:15px;color:#00ff00;'>Total to re-pay : <strong style='color:#00ff00;'>${formatMoney(total)}</strong></p>
            `;
            document.getElementById("totalPopup").style.display = "block";
        }

        function closeTotalPopup() { document.getElementById("totalPopup").style.display = "none"; }

        // ==================== NAV & VIEWS ====================
        function updateNavActive(view) {
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.toggle('active', n.dataset.view === view);
                const pin = n.querySelector('.toggle-pin');
                const isPinned = localStorage.getItem(PINNED_KEY) === n.dataset.view;
                pin.className = `fa-solid fa-toggle-${isPinned ? 'on' : 'off'} toggle-pin ${isPinned ? 'on' : ''}`;
            });
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = () => {
                const view = item.dataset.view;
                switchView(view, true);
            };
        });

        document.querySelectorAll('.toggle-pin').forEach(pin => {
            pin.onclick = (e) => {
                e.stopPropagation();
                const view = pin.dataset.view;
                const current = localStorage.getItem(PINNED_KEY);
                if (current === view) localStorage.removeItem(PINNED_KEY);
                else localStorage.setItem(PINNED_KEY, view);
                updateNavActive(document.querySelector('.nav-item.active').dataset.view);
            };
        });

        function switchView(view, changeNav = true) {
            document.getElementById('loanDetails').style.display = view === 'list' ? 'block' : 'none';
            const graph = document.getElementById('graphContainer');
            const cal = document.getElementById('calendarContainer');
            graph.style.display = view === 'graph' ? 'block' : 'none';
            cal.style.display = view === 'calendar' ? 'block' : 'none';

            if (view === 'graph') renderChart();
            if (view === 'calendar') renderCalendar();

            if (changeNav) updateNavActive(view);
        }

        function renderChart() {
            const ctx = document.getElementById('loanChart').getContext('2d');
            const now = new Date();
            const labels = [], data = [], colors = [];

            currentUser.loans.forEach((loan, i) => {
                const end = new Date(loan.endDate.split('-').reverse().join('-'));
                const days = Math.ceil((end - now) / 86400000);
                let col = '#4CAF50';
                if (days <= 2) col = 'red';
                else if (days <= 6) col = '#004fff';
                labels.push(`L${i+1}`);
                data.push(currentCurrency === 'USD' ? loan.takenAmount / USD_RATE : loan.takenAmount);
                colors.push(col);
            });

            if (loanChart) loanChart.destroy();
            loanChart = new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#333', borderWidth: 1 }] },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { grid: { color: '#333' }, ticks: { color: '#aaa' } } },
                    onClick: (e, el) => { if (el.length) showDatePopup(currentUser.loans.indexOf(filteredLoans[el[0].index])); }
                }
            });
        }
        function renderCalendar() {
            const c = document.getElementById('calendarContainer');
            const y = calendarMonth.getFullYear(), m = calendarMonth.getMonth();
            const first = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            const today = new Date();
            const todayStr = `${today.getDate()}-${String(today.getMonth()+1).padStart(2,'0')}-${today.getFullYear()}`;

            const dueMap = {};
            currentUser.loans.forEach((l, i) => {
                const [d,m,y] = l.endDate.split('-');
                dueMap[`${d}-${m}-${y}`] = i;
            });

            let html = `<div style="text-align:center;margin:12px 0;display:flex;justify-content:space-between;align-items:center;">
                <button class='move-asaid' onclick="prevMonth()">Previous</button>
                <span style="margin:0 16px;font-weight:600;color:#eee;">${calendarMonth.toLocaleString('default', { month: 'long'})}</span>
                <button class='move-asaid' onclick="nextMonth()">Next</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-weight:600;color:#888;">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>`;

            for (let i = 0; i < first; i++) html += `<div></div>`;
            for (let d = 1; d <= days; d++) {
                const ds = `${d}-${String(m+1).padStart(2,'0')}-${y}`;
                const isToday = ds === todayStr;
                const idx = dueMap[ds];
                let style = `cursor:${idx!==undefined?'pointer':'default'};`;
                if (isToday) style += `border:2px solid #ffffff6a;border-radius:10px;`;
                if (idx !== undefined) {
                    const daysLeft = Math.ceil((new Date(ds.split('-').reverse().join('-')) - today) / 86400000);
                    let bg = '#4CAF50';
                    if (daysLeft <= 2) bg = 'red';
                    else if (daysLeft <= 6) bg = '#004fff';
                    style += `background:${bg};color:#000;border-radius:10px;`;
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
            const now = new Date();
            const end = new Date(loan.endDate.split('-').reverse().join('-'));
            const daysLeft = Math.ceil((end - now) / 86400000);
            const status = daysLeft > 0 ? `${daysLeft} day${daysLeft>1?'s':''} left` : 'Overdue';

            document.getElementById('popupContent').innerHTML = `
                <p><strong>Amount:</strong> ${formatMoney(loan.takenAmount)}</p>
                <p><strong>Purpose:</strong> ${loan.purpose || 'Not set'}</p>
                <p><strong>Taken On:</strong> ${loan.planDate}</p>
                <p><strong>Due:</strong> ${loan.endDate}</p>
                <p><strong>Interest:</strong> ${formatMoney(loan.interest)}</p>
                <p><strong>Status:</strong> <span style="color:${daysLeft<=2?'#00fff2':daysLeft<=6?'#004fff':'#4CAF50'}">${status}</span></p>
                <button style='text-align:center;display:flex;justify-content:center;align-items:center;width:100%;' onclick="goToList(${idx})">View Full</button>
            `;
            document.getElementById('datePopup').style.display = 'block';
        }

        function closeDatePopup() { document.getElementById('datePopup').style.display = 'none'; }
        function goToList(idx) { closeDatePopup(); switchView('list', true); displayLoanDetails(currentUser.loans[idx], idx); }

        function closeModal() {
            document.getElementById("userInfoModal").style.display = "none";
            saveUserData();
            currentUser = null;
        }
         document.addEventListener("DOMContentLoaded", () => {
            const customMenu = document.querySelector(".custom-menu");

            document.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                if (customMenu) {
                    customMenu.style.display = "block";
                    customMenu.style.top = `${event.pageY}px`;
                    customMenu.style.left = `${event.pageX}px`;
                }
            });

            document.addEventListener("click", () => {
                if (customMenu) {
                    customMenu.style.display = "none";
                }
            });
        });
