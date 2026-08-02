const usersDB = {
    "9919": {
        name: "Phanindra Yerra",
        coins: 2565,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 7000, takenAmount: 38000, takenFrom: "BsLends", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 4200, takenAmount: 22000, takenFrom: "BsLends", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2000, takenAmount: 10000, takenFrom: "BsLends", fineRate: 0 },
        ],
        fragment: "https://data.chpic.su/stickers/l/Loving_Gift_by_EmojiRu_Bot/Loving_Gift_by_EmojiRu_Bot_036.webp",
        defaultEmote: "https://scontent.cdninstagram.com/v/t51.82787-19/729808268_18106195441988721_2475922297071123598_n.jpg?_nc_cat=102&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=WSiK-y37FewQ7kNvwEXTS5V&_nc_oc=AdqIhCnR5fRfxxP4rFdW-FP5fSd10ycRSu_LD5l9MSdhG_K9UYY4tdJ4IcZY0B36bro&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=5esDC-_lMD4PfCHgJjFcyw&_nc_ss=7baaf&oh=00_AQGSji_r8lbq1YK3NBG9mchO5fev4qAveoOuE7fCmhY_VQ&oe=6A750324",
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
