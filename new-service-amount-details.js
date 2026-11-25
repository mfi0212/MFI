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
        showCustomContent: "yes",
        customContent: {
          type: "image",
          value: "https://mfi0212.github.io/mfi.f/you.receive.gift.png",
          url: "https://mfi0212.github.io/mfi.f/mygifts"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Mr. Deepak Tallapudi, you've received a gift from your friend! 🎁 Click the banner below to open and view your gift.",
        loans: [
          { amount: 6000, interest: 2000, borrowed: "22-11-2026", return: "22-12-2026", overdueFee: 50 },
          { amount: 2000, interest: 600, borrowed: "25-11-2026", return: "25-12-2026", overdueFee: 50 },
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
