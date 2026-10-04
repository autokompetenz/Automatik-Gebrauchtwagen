function calculateMonthlyPayment(price, months = 60, annualRate = 0.06) {
  const r = annualRate / 12;
  return Math.round((price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

function calculateOrderTotals(subtotal, paymentType) {
  switch (paymentType) {
    case 'full':
      return { totalPrice: subtotal * 0.95, discountAmount: subtotal * 0.05, depositAmount: null, monthlyAmount: null, monthlyDuration: null };
    case 'deposit':
      return { totalPrice: subtotal, discountAmount: null, depositAmount: Math.round(subtotal * 0.25), monthlyAmount: null, monthlyDuration: null };
    case 'monthly': {
      // Acompte 25% à régler immédiatement, le solde (75%) est financé sur 60 mois à 6%/an
      const depositAmount = Math.round(subtotal * 0.25);
      const financed = subtotal - depositAmount;
      const monthly = calculateMonthlyPayment(financed);
      return { totalPrice: subtotal, discountAmount: null, depositAmount, monthlyAmount: monthly, monthlyDuration: 60 };
    }
    default:
      throw new Error('Type de paiement invalide');
  }
}

function generateOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2,8).toUpperCase();
  return `AK${date}${rand}`;
}

function sanitizeRef(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function generatePaymentReference(user, car, orderNumber) {
  const name = sanitizeRef(user && user.lastName ? user.lastName : '');
  const initials = sanitizeRef(user && user.firstName ? user.firstName : '').slice(0, 2);
  const carRef = sanitizeRef(car ? `${car.make}${car.model}` : '');
  const suffix = sanitizeRef(orderNumber || '').replace(/^AK/, '');
  const base = `AUTOMATIK-${name}${initials}-${carRef}-${suffix}`;
  return base.replace(/-+$/, '').replace(/--+/g, '-');
}

module.exports = { calculateMonthlyPayment, calculateOrderTotals, generateOrderNumber, generatePaymentReference };
