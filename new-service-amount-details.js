document.addEventListener('contextmenu', e => e.preventDefault());
    const users = {
      "Deepak Tallapudi": {
        password: "Deepak@1",
        displayName: "Deepak Tallapudi",
        premiumType: "Normal",
        fixedInterest: 0,
        customui: "no",
        showBottomNav: "yes",
        bottomNavItems: ["amounts", "borrow", "settings"],
        showCustomContent: "no",
        customContent: {
          type: "image",
          value: "https://mfi0212.github.io/MFI/servoces.special.offer/offer.png",
          url: "https://mfi0212.github.io/MFI/servoces.special.offer/eligible.offer"
        },
        showSpecialNotice: "no",
        specialNoticeText: "",
        loans: [
          { amount: 6000, interest: 1800, borrowed: "22-11-2026", return: "22-12-2027", overdueFee: 50 },
        ],
        access: {
          "Delay It": true,
          "Split Pay": true,
          "Buy Limit": true,
          "Pre-Saver": true,
          "Lendlink-Mid": false,
          "Mining bot": false,
          "BotPay": false,
          "Tomar Juntos": false,
          "BsRora-Atdo": false,
          "STL": false,
        }
      },
      "Tony Montana": {
        password: "929",
        displayName: "Tony Montana",
        premiumType: "Premium+",
        fixedInterest: 20,
        customui: "no",
        showBottomNav: "yes",
        bottomNavItems: ["amounts", "borrow", "settings", "search"],
        showCustomContent: "yes",
        customContent: {
          type: "image",
          value: "https://mfi0212.github.io/MFI/servoces.special.offer/offer.png",
          url: "https://mfi0212.github.io/MFI/servoces.special.offer/eligible.offer"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Welcome",
        loans: [
          { amount: 150000, interest: 4500, borrowed: "08-09-2024", return: "08-10-2026", overdueFee: 50 },
          { amount: 155000, interest: 4500, borrowed: "08-09-2024", return: "08-10-2026", overdueFee: 50 },
        ],
        access: {
          "Delay It": true,
          "Split Pay": true,
          "Buy Limit": true,
          "Pre-Saver": false,
          "Lendlink-Mid": false,
          "Mining bot": false,
          "BotPay": false,
          "Tomar Juntos": false,
          "BsRora-Atdo": false,
          "STL": false,
        }
      },
    };
