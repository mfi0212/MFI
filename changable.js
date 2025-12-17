  const blockedPasswords = ["6275"];

 const specialRates = {
            'Wed Dec 17 2025': 36
 };

     function getDailyInterestRate() {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 5381;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) + hash + today.charCodeAt(i)) | 0;
    }
    const rate = 30 + (Math.abs(hash) % 8);
    return rate;
}








