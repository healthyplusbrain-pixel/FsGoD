export const FSGOD_BRAND_CONTACT = {
  brandName: 'FsGoD Sportswear & Custom Studio',
  whatsappRaw: '573187801140',
  whatsappFormatted: '+57 318 780 1140',
  whatsappLink: 'https://wa.me/573187801140',
  email: 'contacto@fsgod.com',
  city: 'Barranquilla, Colombia',
  country: 'Colombia',
  instagram: '@fsgod_official',
  operationHours: 'Lunes a Sábado: 8:00 AM - 8:00 PM (Hora Colombia)',
  zelle: {
    recipientName: 'CLTV.DATA LLC',
    recipientIdentifier: 'xxxxxx8471',
    maskedIdentifier: 'xxxxxx8471',
    bank: 'JPMorgan Chase Bank, N.A.',
    accountType: 'Chase Business Checking',
    headline: 'Scan this code in your bank\'s app to pay',
    subtext: 'CLTV.DATA LLC at xxxxxx8471.',
    zelleLogoText: 'Żelle®',
    qrPayload: 'https://enroll.zellepay.com/qr-codes?data=CLTV.DATA%20LLC%3Axxxxxx8471',
  },
};

export const getZelleQrUrl = (memo?: string): string => {
  const payload = `zelle://pay?recipient=CLTV.DATA%20LLC&token=xxxxxx8471${memo ? `&memo=${encodeURIComponent(memo)}` : ''}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(payload)}`;
};

export const getWhatsAppUrl = (message?: string): string => {
  if (!message) {
    return FSGOD_BRAND_CONTACT.whatsappLink;
  }
  return `https://wa.me/${FSGOD_BRAND_CONTACT.whatsappRaw}?text=${encodeURIComponent(message)}`;
};
