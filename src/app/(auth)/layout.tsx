export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-600">OngolaDrive</h1>
          <p className="text-gray-500 text-sm mt-1">Le marché à portée de main</p>
        </div>
        {children}
      </div>
    </main>
  )
}
