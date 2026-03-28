import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams
  const supabase = await createClient()

  const { data: order } = order_id
    ? await supabase
        .from('orders')
        .select('order_number, status, total')
        .eq('id', order_id)
        .single() as { data: { order_number: string; status: string; total: number } | null; error: unknown }
    : { data: null }

  // Polling court : CinetPay peut appeler le webhook avant la redirection
  // On affiche le succès même si le webhook n'est pas encore arrivé (il arrive en arrière-plan)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-primary" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement reçu !</h1>
        <p className="text-sm text-gray-500 mb-5">
          Votre commande a bien été enregistrée et sera préparée dans les plus brefs délais.
        </p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Commande</span>
              <span className="font-semibold text-gray-800">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className="font-semibold text-primary">
                {order.status === 'confirmed' ? 'Confirmée' : 'En cours de confirmation'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {order_id && (
            <Link
              href={`/orders/${order_id}`}
              className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors text-sm"
            >
              Suivre ma commande <ArrowRight size={16} />
            </Link>
          )}
          <Link
            href="/dashboard"
            className="block w-full py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
