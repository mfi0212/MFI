  const blockedPasswords = ["6275"];

 const specialRates = {
            'Thu Dec 10 2025': 30
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






