const usersDB = {
    "9919": {
        name: "Pavel Durov",
        coins: 1508,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2300, takenAmount: 15826, takenFrom: "Lendlink", fineRate: 0 },
            // { planDate: "02-05-2026", endDate: "26-09-2026", interest: 1250, takenAmount: 2026, takenFrom: "Lendlink", fineRate: 0 },
        ],
        fragment: "https://pbs.twimg.com/media/GV16TLTWAAAjU7U?format=webp&name=medium",
        defaultEmote: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/1280px-Telegram_2019_Logo.svg.png",
        showCustomContent: "yes",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/programx"
        },
        showSpecialNotice: "no",
        specialNoticeText: "Dear <strong>Charlie</strong>, Lendlink amounts are running. Kindly return on or before the due date."
    },
    "0021": {
        name: "Chmbad arlie",
        coins: 205,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2300, takenAmount: 21907, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "16-09-2026", interest: 1250, takenAmount: 12000, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "6-09-2026", interest: 1250, takenAmount: 20026, takenFrom: "Lendlink", fineRate: 0 },
        ],
        fragment: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_b431fc1e14d642a781c8116343c15967/default/dark/3.0#e=0",
        defaultEmote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif",
        showCustomContent: "yes",
        customContent: {
            type: "image",
            value: "programXoffer.png",        
            url: "https://mfi0212.github.io/swan/offer/solution"
        },
        showSpecialNotice: "no",
        specialNoticeText: "Dear <strong>Chmbad arlie</strong>, multiple Lendlink loans are active. Please clear them before the earliest due date to avoid extra charges."
    },
    "00221": {
        name: "Chmbad arlie",
        coins: 205,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2300, takenAmount: 21907, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "16-09-2026", interest: 1250, takenAmount: 12000, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "6-09-2026", interest: 1250, takenAmount: 20026, takenFrom: "Lendlink", fineRate: 0 },
        ],
        fragment: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_b431fc1e14d642a781c8116343c15967/default/dark/3.0#e=0",
        defaultEmote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif",
        showCustomContent: "no",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/solution"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Dear <strong>Chmbad arlie</strong>, multiple Lendlink loans are active. Please clear them before the earliest due date to avoid extra charges."
    },
    "002211": {
        name: "Chmbad arlie",
        coins: 205,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2300, takenAmount: 21907, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "16-09-2026", interest: 1250, takenAmount: 12000, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "6-09-2026", interest: 1250, takenAmount: 20026, takenFrom: "Lendlink", fineRate: 0 },
        ],
        fragment: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_b431fc1e14d642a781c8116343c15967/default/dark/3.0#e=0",
        defaultEmote: "https://media.tenor.com/cxAQToMOeykAAAAj/twitch-rpx-syria.gif",
        showCustomContent: "yes",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/solution"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Dear <strong>Chmbad arlie</strong>, multiple Lendlink loans are active. Please clear them before the earliest due date to avoid extra charges."
    },
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
