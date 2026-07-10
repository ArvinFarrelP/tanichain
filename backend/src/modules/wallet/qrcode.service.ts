import QRCode from 'qrcode';

/**
 * Builds a SEP-0007 compatible "web+stellar:pay" URI. Wallets that support
 * this URI scheme (e.g. Lobstr, Freighter-linked flows) can prefill a
 * payment from it.
 */
export function buildStellarPayUri(params: { destination: string; amount?: string; memo?: string }): string {
  const query = new URLSearchParams();
  if (params.amount) query.set('amount', params.amount);
  if (params.memo) query.set('memo', params.memo);
  query.set('asset_code', 'native');

  return `web+stellar:pay?destination=${encodeURIComponent(params.destination)}&${query.toString()}`;
}

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
  });
}

export async function generateWalletReceiveQr(publicKey: string) {
  const uri = buildStellarPayUri({ destination: publicKey });
  const dataUrl = await generateQrDataUrl(uri);
  return { uri, dataUrl };
}

export async function generateOrderPaymentQr(params: { destination: string; amount: string; memo?: string }) {
  const uri = buildStellarPayUri(params);
  const dataUrl = await generateQrDataUrl(uri);
  return { uri, dataUrl };
}
