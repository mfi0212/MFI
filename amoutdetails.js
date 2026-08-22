const usersDB = {
    "Mahesh888*": {
        name: "Mahesh Muthinti",
        coins: 0,
        loans: [
            { planDate: "24-07-2026", endDate: "24-08-2026", interest: 990, takenAmount: 2000, takenFrom: "MLendings", fineRate: 130 },
            { planDate: "11-08-2026", endDate: "26-08-2026", interest: 280, takenAmount: 800, takenFrom: "BotPay Fee", fineRate: 130 },
            { planDate: "28-07-2026", endDate: "28-08-2026", interest: 990, takenAmount: 2000, takenFrom: "MLendings", fineRate: 130 },
            { planDate: "15-08-2026", endDate: "30-08-2026", interest: 90, takenAmount: 960, takenFrom: "BotPay Fee", fineRate: 130 },
            { planDate: "11-05-2026", endDate: "10-09-2026", interest: 7355, takenAmount: 29418, takenFrom: "Tomar Juntos", fineRate: 130 },
            { planDate: "15-08-2026", endDate: "15-09-2026", interest: 4500, takenAmount: 15000, takenFrom: "MLendings", fineRate: 130 },
            { planDate: "21-07-2026", endDate: "20-09-2026", interest: 1407, takenAmount: 3475, takenFrom: "MLendings & BotPay Fee", fineRate: 130 },
        ],
        fragment: "",
        defaultEmote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif",
        showCustomContent: "no",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/solution"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Mr.<strong>Mahesh Muthinti</strong>, your BotPay bot will handle everything for you, including applying and paying your fees. The fees will be added directly to your amount. Simply and easily."
    },
};


const allowedPasswords = ["9919", "0212","Mahesh888*"];
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
