 // Define light background colors and corresponding dark font colors
        const colorPairs = [
            { background: 'rgb(55 20 0)', font: 'rgb(255 93 0)' }, // Light Brown, Dark Brown
            { background: 'rgb(0 53 14)', font: 'rgb(0 255 66)' },// Light Green, Dark Green
            { background: 'rgb(0 45 20)', font: 'rgb(0 255 113)' }, // Light Blue, Dark Blue
            { background: 'rgb(63 25 0)', font: 'rgb(255 100 0)' }  // Light Sky Blue, Dark Sky Blue
        ];

        // Function to generate a unique number for a user based on their name
        function getUserIndex(name) {
            let sum = 0;
            for (let i = 0; i < name.length; i++) {
                sum += name.charCodeAt(i);
            }
            return sum;
        }

        // Function to get background and font color based on hour and user
        function getColorPair(name, hour) {
            const userIndex = getUserIndex(name);
            const colorIndex = (hour + userIndex) % colorPairs.length;
            return colorPairs[colorIndex];
        }

        // Function to generate unique icon for a user
        function generateIcon(name, userIndex) {
            const nameParts = name.trim().split(/\s+/).slice(0, 2);
            let iconText = nameParts.map(part => part.charAt(0)).join("").toUpperCase();
            // Handle single-word names or conflicts (e.g., multiple users with same initials)
            if (nameParts.length === 1) {
                iconText = nameParts[0].charAt(0).toUpperCase();
            }
            return iconText;
        }

        // Load saved password and notes from localStorage when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            const savedPassword = localStorage.getItem('lastPassword');
            if (savedPassword) {
                setTimeout(() => {
                    document.getElementById("userPassword").value = savedPassword;
                    document.getElementById("poweredByMsg").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("poweredByMsg").style.display = "none";
                    }, 500);
                }, 500);
            }

            loadSavedNotes();
        });

        const passwords = {
            "0212": {
                name: "Phanindra yerra",
                loans: [
                    
                    {
                        planDate: "14-08-2025",
                        endDate: "13-09-2025",
                        interest: 5200,
                        takenAmount: 25000,
                        takenFrom: "Golden"
                    },
                    {
                        planDate: "16-08-2025",
                        endDate: "20-09-2025",
                        interest: 1600,
                        takenAmount: 8000,
                        takenFrom: "STO Offer"
                    },
                    {
                        planDate: "01-08-2025",
                        endDate: "30-09-2025",
                        interest: 2500,
                        takenAmount: 5000,
                        takenFrom: "Lendlink"
                    },            
                ]
            },
        };

        let currentUser = null;
        let currentLoanIndex = null;
        let timeoutId = null; // To manage the delay timeout

        // Function to load saved notes from localStorage
        function loadSavedNotes() {
            const savedNotes = JSON.parse(localStorage.getItem('loanNotes')) || {};
            for (let password in passwords) {
                if (savedNotes[password]) {
                    passwords[password].notes = savedNotes[password];
                } else {
                    passwords[password].notes = {};
                }
            }
        }

        // Function to save notes to localStorage
        function saveNotesToStorage() {
            const notesToSave = {};
            for (let password in passwords) {
                notesToSave[password] = passwords[password].notes;
            }
            localStorage.setItem('loanNotes', JSON.stringify(notesToSave));
        }

        document.getElementById("submitBtn").addEventListener("click", () => {
            const userInput = document.getElementById("userPassword").value.trim();
            const errorMessage = document.getElementById("error-message");
            const user = passwords[userInput];

            localStorage.setItem('lastPassword', userInput);

            if (user) {
                currentUser = user;
                document.getElementById("userName").textContent = user.name;

                // Set up profile picture
                const profilePicture = document.getElementById("profilePicture");
                const currentHour = new Date().getHours();
                const colorPair = getColorPair(user.name, currentHour);
                profilePicture.style.backgroundColor = colorPair.background;
                profilePicture.style.color = colorPair.font;
                profilePicture.style.backgroundImage = "none";
                const userKeys = Object.keys(passwords);
                const userIndex = userKeys.indexOf(userInput);
                profilePicture.textContent = generateIcon(user.name, userIndex);

                const amountButtons = document.getElementById("amountButtons");
                amountButtons.innerHTML = "";

                user.loans.forEach((loan, index) => {
                    const btn = document.createElement("button");
                    btn.className = "amount-btn";
                    btn.textContent = ` ${loan.takenAmount} Rupees`;
                    btn.onclick = () => {
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        timeoutId = setTimeout(() => {
                            displayLoanDetails(loan, index);
                        }, 100);
                    };
                    amountButtons.appendChild(btn);
                });

                if (user.loans.length > 0) {
                    displayLoanDetails(user.loans[0], 0);
                }

                document.getElementById("addNoteBtnInitial").style.display = "block";
                document.getElementById("addNoteBtn").style.display = "block";
                document.getElementById("toggleLoanBtn").style.display = "block";
                document.getElementById("userInfoModal").style.display = "block";
                errorMessage.textContent = "";
            } else {
                errorMessage.textContent = "Amount returned (or) Invalid password!";
            }
        });

        function displayLoanDetails(loan, index) {
            currentLoanIndex = index;
            const loanDetails = document.getElementById("loanDetails");
            
            // Calculate the base total return amount
            let totalReturnAmount = (loan.takenAmount + loan.interest).toFixed(2);
            let additionalInterest = 0;

            // Parse the end date (remove any text like "(Extended to 5 days)")
            const endDateStr = loan.endDate.split('(')[0];
            const endDate = new Date(endDateStr.split('-').reverse().join('-'));
            const currentDate = new Date();

            // Calculate the number of days between planDate and endDate
            const startDate = new Date(loan.planDate.split('-').reverse().join('-'));
            const timeDiff = endDate - startDate;
            const daysDiff = Math.abs(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

            // Check if current date is past the end date
            if (currentDate > endDate) {
                // Calculate hours elapsed since end date
                const timeElapsed = currentDate - endDate;
                const hoursElapsed = Math.floor(timeElapsed / (1000 * 60 * 60));
                // Calculate additional interest (30 rupees per hour)
                additionalInterest = hoursElapsed * 30;
                // Update total return amount
                totalReturnAmount = (loan.takenAmount + loan.interest + additionalInterest).toFixed(2);
            }

            // Update the active button
            document.querySelectorAll(".amount-btn").forEach(btn => btn.classList.remove("active"));
            document.getElementById("amountButtons").children[index].classList.add("active");

            // Update loan details HTML
            loanDetails.innerHTML = `
                <div class="loan-entry">
                    <span class="amount-label">${index + 1} amount</span>
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Taken service
                    </h3>
                    <p>${loan.takenFrom}</p>
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Amount taken
                    </h3>
                    <p><i class="fa-solid fa-money-bill-transfer"></i>Amount: ${loan.takenAmount} Rupees</p>
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Taken & Ends
                    </h3>
                    <p><i class="fa-solid fa-calendar-day"></i> Taken on: ${loan.planDate}</p>
                    <p><i class="fa-solid fa-calendar-check"></i> Ends on: ${loan.endDate}</p>
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Duration
                    </h3>
                    <p><i class="fa-solid fa-clock"></i> No. of Days: ${daysDiff} days</p>
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Interest
                    </h3>
                    <p><i class="fa-solid fa-arrow-up-wide-short"></i> Base Interest: ${loan.interest} Rupees</p>
                    ${additionalInterest > 0 ? `
                        <p><i class="fa-solid fa-exclamation-circle"></i>Overdue interest : ${additionalInterest} Rupees</p>
                        <p style="color: #ff0000; font-size: 12px;">Overdue by ${Math.floor((currentDate - endDate) / (1000 * 60 * 60))} hours</p>
                    ` : ''}
                    <h3 style="text-decoration: underline; margin: 25px 0px; font-weight: 600; font-size: 15px;">
                        Total Amount to Re-Pay
                    </h3>
                    <p><i class="fa-solid fa-money-check-alt"></i> ${totalReturnAmount} Rupees</p>
                </div>
            `;

            // Display existing note if any
            const savedNoteDiv = document.getElementById("savedNote");
            if (currentUser.notes[index]) {
                savedNoteDiv.innerHTML = `<p>Note: ${currentUser.notes[index]}</p>`;
            } else {
                savedNoteDiv.innerHTML = '';
            }
        }

        function closeModal() {
            document.getElementById("userInfoModal").style.display = "none";
            document.getElementById("addNoteBtn").style.display = "none";
            document.getElementById("addNoteBtnInitial").style.display = "none";
            document.getElementById("toggleLoanBtn").style.display = "none";
            currentUser = null;
            currentLoanIndex = null;
            saveNotesToStorage();
            if (timeoutId) {
                clearTimeout(timeoutId); // Clear any pending timeout
            }
        }

        document.getElementById("addNoteBtnInitial").addEventListener("click", openNotePopup);
        document.getElementById("addNoteBtn").addEventListener("click", openNotePopup);

        function openNotePopup() {
            document.getElementById("notePopup").style.display = "block";
            const noteInput = document.getElementById("noteInput");
            noteInput.value = currentUser.notes[currentLoanIndex] || '';
        }

        function closeNotePopup() {
            document.getElementById("notePopup").style.display = "none";
        }

        function saveNote() {
            const noteInput = document.getElementById("noteInput").value.trim();
            if (currentUser && currentLoanIndex !== null) {
                currentUser.notes[currentLoanIndex] = noteInput;
                displayLoanDetails(currentUser.loans[currentLoanIndex], currentLoanIndex);
                saveNotesToStorage();
            }
            closeNotePopup();
        }

        // Add toggle functionality for loan details
        document.getElementById("toggleLoanBtn").addEventListener("click", () => {
            const loanDetails = document.getElementById("loanDetails");
            const savedNote = document.getElementById("savedNote");
            if (loanDetails.style.display === "none" || loanDetails.style.display === "") {
                loanDetails.style.display = "block";
                savedNote.style.display = "block";
                document.getElementById("toggleLoanBtn").textContent = "Hide";
            } else {
                loanDetails.style.display = "none";
                savedNote.style.display = "none";
                document.getElementById("toggleLoanBtn").textContent = "Show";
            }
        });
