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
          value: "https://mfi0212.github.io/mfi.f/special.offer/offer.png",
          url: "https://mfi0212.github.io/mfi.f/special.offer/program.x"
        },
        showSpecialNotice: "yes",
        specialNoticeText: "Mr. Deepak Tallapudi, The special offer available to you will be active from today, 23rd November, at 11:30 AM until 25th November at 12:00 PM. Click the offer banner to view and apply for your eligible offer before it expires.",
        loans: [
          { amount: 6000, interest: 2500, borrowed: "22-11-2026", return: "22-12-2027", overdueFee: 50 },
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
