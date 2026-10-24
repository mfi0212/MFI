document.addEventListener("contextmenu", event => event.preventDefault());
const USERS = [
  {
    id: "psvkry",
    name: "Psvkry(@BS Owner)",
    password: "17891",
    premium: false,

    topBanner: [
      {
        text: "STL",
        href: "https://mfi0212.github.io/MFI/1.5.days"
      }
    ],

    entries: [
      {
        borrowedBy: "China Yerra",
        amount: 100000,
        interest: 2.2,
        takenDate: "2026-10-23",
        interestPaid: 0
      }
    ]
  },
  {
    id: "Test account",
    name: "Tony Montana",
    password: "0212",
    premium: true,

    topBanner: [
      {
        text: "STL",
        href: "https://mfi0212.github.io/MFI/1.5.days"
      }
    ],

    entries: [
      {
        borrowedBy: "Tony Montana",
        amount: 10000,
        interest: 3,
        takenDate: "2026-08-02",
        interestPaid: 0
      }
    ]
  }
];
