document.addEventListener("contextmenu", event => event.preventDefault());
const USERS = [
  {
    id: "psvkry",
    name: "Psvkry(@BS Owner)",
    password: "17891",
    premium: true,

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
        interestPaid: 2000
      },
      {
        borrowedBy: "China Yerra",
        amount: 245,
        interest: 2.2,
        takenDate: "2026-11-23",
        interestPaid: 0
      }
    ]
  },
  {
    id: "BS Owner",
    name: "Phanindra Yerra",
    password: "040212",
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
      },
       {
        text: "Bont Int",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/bondint"
      },
       {
        text: "Interest Split",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/interest.split"
      },
       {
        text: "VSL INAP",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/vsl.lender.account.in.ap"
      },
       {
        text: "Mini Lends",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/mini.lends"
      },
    ],

    entries: [
      {
        borrowedBy: "Psvkry",
        amount: 35000,
        interest: 1.5,
        takenDate: "2026-10-01",
        interestPaid: 0
      },
      {
        borrowedBy: "Psvkry",
        amount: 50000,
        interest: 2.5,
        takenDate: "2026-10-23",
        interestPaid: 0
      },
      {
        borrowedBy: "Psvkry",
        amount: 45000,
        interest: 2.5,
        takenDate: "2026-03-23",
        interestPaid: 0
      },
      {
        borrowedBy: "Psvkry",
        amount: 20000,
        interest: 2,
        takenDate: "2026-06-23",
        interestPaid: 0
      }
    ]
  }
];
