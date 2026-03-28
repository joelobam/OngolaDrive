const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2'
const API_KEY = process.env.CINETPAY_API_KEY!
const SITE_ID = process.env.CINETPAY_SITE_ID!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export interface CinetPayInitPayload {
  orderId: string        // ID unique côté OngolaDrive
  amount: number         // En XAF, minimum 100
  description: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
}

export interface CinetPayInitResult {
  paymentUrl: string
  transactionId: string
}

/**
 * Initie un paiement CinetPay et retourne l'URL de redirection.
 */
export async function initiateCinetPayPayment(payload: CinetPayInitPayload): Promise<CinetPayInitResult> {
  const transactionId = `OD-${payload.orderId}-${Date.now()}`

  const body = {
    apikey: API_KEY,
    site_id: SITE_ID,
    transaction_id: transactionId,
    amount: payload.amount,
    currency: 'XAF',
    alternative_currency: '',
    description: payload.description,
    customer_id: payload.orderId,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail ?? '',
    customer_phone_number: payload.customerPhone ?? '',
    customer_address: '',
    customer_city: 'Yaoundé',
    customer_country: 'CM',
    customer_state: 'CM',
    customer_zip_code: '00000',
    notify_url: `${APP_URL}/api/webhooks/cinetpay`,
    return_url: `${APP_URL}/payment/success?order_id=${payload.orderId}`,
    channels: 'ALL',
    metadata: payload.orderId,
    lang: 'FR',
  }

  const res = await fetch(`${CINETPAY_BASE_URL}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (data.code !== '201') {
    throw new Error(data.message ?? 'Erreur CinetPay lors de l\'initiation du paiement')
  }

  return {
    paymentUrl: data.data.payment_url,
    transactionId,
  }
}

/**
 * Vérifie le statut d'un paiement CinetPay.
 */
export async function verifyCinetPayPayment(transactionId: string): Promise<{
  status: 'ACCEPTED' | 'REFUSED' | 'PENDING'
  amount: number
  paymentMethod: string
}> {
  const res = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: transactionId,
    }),
  })

  const data = await res.json()

  if (data.code !== '00') {
    throw new Error(data.message ?? 'Erreur lors de la vérification du paiement')
  }

  const statusMap: Record<string, 'ACCEPTED' | 'REFUSED' | 'PENDING'> = {
    ACCEPTED: 'ACCEPTED',
    REFUSED: 'REFUSED',
    PENDING: 'PENDING',
  }

  return {
    status: statusMap[data.data.status] ?? 'PENDING',
    amount: Number(data.data.amount),
    paymentMethod: data.data.payment_method ?? 'unknown',
  }
}

/**
 * Mappe le code de méthode CinetPay vers nos types internes.
 */
export function mapCinetPayMethod(method: string): 'mtn_momo' | 'orange_money' | 'card' {
  if (method.toLowerCase().includes('mtn')) return 'mtn_momo'
  if (method.toLowerCase().includes('orange')) return 'orange_money'
  return 'card'
}
