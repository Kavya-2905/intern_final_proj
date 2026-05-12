// Generate random card number
const generateCardNumber = () => {
  let cardNumber = '4'; // Visa cards start with 4
  for (let i = 1; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
};

// Generate random CVV
const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

// Generate expiry date (3 years from now)
const generateExpiryDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
};

// Format card number for display (XXXX XXXX XXXX 1234)
const formatCardNumber = (cardNumber) => {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// Mask card number (************1234)
const maskCardNumber = (cardNumber) => {
  return '**** **** **** ' + cardNumber.slice(-4);
};

module.exports = {
  generateCardNumber,
  generateCVV,
  generateExpiryDate,
  formatCardNumber,
  maskCardNumber
};
