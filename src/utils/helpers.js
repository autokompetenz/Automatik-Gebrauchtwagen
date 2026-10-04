// Format price in EUR (English format: €25,000)
export const formatEuro = (amount) => {
  if (!amount && amount !== 0) return '—';
  return '€' + new Intl.NumberFormat('en-US').format(Math.round(amount));
};
// Alias
export const formatFCFA = formatEuro;

export function calculateMonthlyPayment(price, months = 60, annualRate = 0.06) {
  const r = annualRate / 12;
  return Math.round((price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export function calculateOrderTotals(subtotal, paymentType) {
  switch (paymentType) {
    case 'full':
      return { total: subtotal * 0.95, discount: subtotal * 0.05, deposit: null, monthly: null };
    case 'deposit':
      return { total: subtotal, discount: null, deposit: subtotal * 0.25, monthly: null };
    case 'monthly': {
      // Acompte 25% à régler immédiatement, le solde (75%) est financé sur 60 mois à 6%/an
      const deposit = subtotal * 0.25;
      const financed = subtotal - deposit;
      const monthly = calculateMonthlyPayment(financed);
      return { total: subtotal, discount: null, deposit, monthly };
    }
    default:
      return { total: subtotal, discount: null, deposit: null, monthly: null };
  }
}

export const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
export const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export const PAYMENT_LABELS = {
  full: 'Paiement intégral (-5%)', deposit: 'Acompte 25%', monthly: 'Acompte 25% + 60 mensualités',
};

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
