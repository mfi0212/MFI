const usersDB = {
    "9919": {
        name: "Pskry",
        coins: 3205,
        loans: [
            { planDate: "02-05-2026", endDate: "26-09-2026", interest: 2300, takenAmount: 21907, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "16-09-2026", interest: 1250, takenAmount: 12000, takenFrom: "Lendlink", fineRate: 0 },
            { planDate: "02-05-2026", endDate: "6-09-2026", interest: 1250, takenAmount: 20026, takenFrom: "Lendlink", fineRate: 0 },
        ],
        fragment: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/refs/heads/main/Flags/Flag%20India.webp",
        defaultEmote: "https://scontent.cdninstagram.com/v/t51.82787-19/729808268_18106195441988721_2475922297071123598_n.jpg?_nc_cat=102&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=MT7bDHgKvaAQ7kNvwHgY194&_nc_oc=AdqD7H6FTnpgRCQ_AKhYFDK9Bv2U7w8hA_cHbLxvJTpVhbiNyL72tWJO7xg2P1o28lw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=020JzCbJWuBei1EYUOI0gg&_nc_ss=7baaf&oh=00_AQHeFh5qfJokqlp2Gdx86LtRXVoGl0hlCaHGkM2RspHqXw&oe=6A7A10E4",
        showCustomContent: "yes",
        customContent: {
            type: "image",
            value: "programXoffer.png",
            url: "https://mfi0212.github.io/swan/offer/solution"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Dear <strong>Pskry</strong>, Welcome to OFFER CLAIMER TLL AUGUST 15TH.!"
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
