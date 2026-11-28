document.addEventListener("contextmenu", event => event.preventDefault());
const USERS = [
  {
    id: "psvkry",
    name: "China Yerra",
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
        interestPaid: 2245
      },
    ]
  },


    {
    id: "Kiran Tummala",
    name: "Kiran Tummala",
    password: "Kiran@2004",
    premium: false,

    sites: [
      {
        text: "lend money",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/lender.lending.clients"
      },
       {
        text: "calculator",
        href: "https://mfi0212.github.io/MFI/service.solutions/VSL/interest.checker"
      },
    ],

    entries: [
      {
        borrowedBy: "Kiran Tummala",
        amount: 0,
        interest: 0,
        takenDate: "",
        interestPaid: 0
      },
    ]
  },

   {
    id: "Tony Montana",
    name: "Tony Montana",
    password: "9919",
    premium: true,
    sites: [
      {
        text: "New Entry",
        href: "https://forms.gle/XntQLZXgpZAD8Quw7"
      },
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
            amount: 40000,
            interest: 2,
            takenDate: "2026-05-30",
            borrowedBy: "Pawan naidu",
            interestPaid: 2800
          },
          {
            amount: 47800,
            interest: 2,
            takenDate: "2026-09-12",
            borrowedBy: "Pawan naidu",
            interestPaid: 0
          },
          {
            amount: 12200,
            interest: 2,
            takenDate: "2026-09-12",
            borrowedBy: "Pawan naidu",
            interestPaid: 0
          }
    ]
  },
];
