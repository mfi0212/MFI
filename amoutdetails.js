const usersDB = {
    "0212": {
        name: "BS&MFI",
        coins: 0,
        loans: [
            { planDate: "02-05-2026", endDate: "26-07-2026", interest: 2300, takenAmount: 10000, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "26-07-2026", interest: 1250, takenAmount: 5000, takenFrom: "Lendlink", fineRate: 0 },
        ],
       fragment: "",
    defaultEmote:""
    }
};



const allowedPasswords = ["9919", "0212"];
    const redirectUrl = "https://mfi0212.github.io/MFI/rate";

    function openPlan() {
        const input = document.getElementById('codeInput').value.trim();
        const errorDiv = document.getElementById('error');
        const popup = document.getElementById('popup');

        errorDiv.innerHTML = '';

        if (!input) {
            errorDiv.innerHTML = '<span style="color:#e02c2c;">Enter the password</span>';
            return;
        }

        if (allowedPasswords.includes(input)) {
            // Correct password - Remove popup
            errorDiv.innerHTML = '<span style="color:#0071e3;">Access Granted!</span>';
            
            setTimeout(() => {
                popup.remove(); // Removes the entire popup
            }, 800);

        } else {
            // Wrong password - Redirect
            errorDiv.innerHTML = '<span style="color:#e02c2c;">Invalid code. Redirecting...</span>';
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        }
    }

    // Enter key support
    document.getElementById('codeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') openPlan();
    });
