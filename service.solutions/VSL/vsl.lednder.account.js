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
      },
      {
        text: "Bond Int",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/bondint"
      },
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
    id: "Psvkry",
    name: "Psvkry",
    password: "0212",
    premium: true,

    topBanner: [
      {
        text: "STL",
        href: "https://mfi0212.github.io/MFI/1.5.days"
      }, {
        text: "calculator",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/interest.checker"
      },
       {
        text: "lend money",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/lender.lending.clients"
      }
    ],

    entries: [
      {
        borrowedBy: "Psvkry",
        amount: 50000,
        interest: 3,
        takenDate: "2026-10-01",
        interestPaid: 0
      },
      {
        borrowedBy: "Psvkry",
        amount: 50000,
        interest: 2.5,
        takenDate: "2026-10-23",
        interestPaid: 0
      }
    ]
  },
  {
    id: "Test account",
    name: "Tony Montana",
    password: "9919",
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
