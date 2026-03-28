import Link from 'next/link'
import { XCircle, RefreshCw } from 'lucide-react'

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement échoué</h1>
        <p className="text-sm text-gray-500 mb-6">
          Votre paiement n&apos;a pas pu être traité. Votre commande a été annulée. Aucun montant n&apos;a été débité.
        </p>

        <div className="space-y-2">
          {order_id && (
            <Link
              href={`/orders/${order_id}`}
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
            >
              <RefreshCw size={16} /> Voir ma commande
            </Link>
          )}
          <Link
            href="/cart"
            className="block w-full py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Retour au panier
          </Link>
        </div>
      </div>
    </div>
  )
}
