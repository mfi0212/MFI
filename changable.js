const blockedPasswords = ["6275"];

const specialRates = {
  '2026-05-03': 30
};

function getDailyInterestRate() {
  const today = new Date().toISOString().slice(0, 10); 
  if (specialRates[today]) {
    return specialRates[today];
  }
  let hash = 5381;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) + hash + today.charCodeAt(i)) | 0;
  }
  const rate = 23 + (Math.abs(hash) % 2);
  return rate;
}

