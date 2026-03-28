import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="OngolaDrive" width={220} height={80} className="mx-auto object-contain" priority />
          <p className="text-gray-500 text-sm mt-2">Le marché à portée de main</p>
        </div>
        {children}
      </div>
    </main>
  )
}
