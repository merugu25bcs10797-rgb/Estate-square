export const formatPrice = (price, listingType = 'sale') => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';

  const num = Number(price);

  if (listingType === 'rent') {
    return `₹${num.toLocaleString('en-IN')}/mo`;
  }

  // Sale format: Crores, Lakhs, or Thousands
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2);
    return `₹${lakh.replace(/\.00$/, '')} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatISTDateTime = (utcDateString) => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatISTDate = (utcDateString) => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatISTTime = (utcDateString) => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};
