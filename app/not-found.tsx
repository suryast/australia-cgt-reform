import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="mx-auto max-w-2xl pt-20">
        <div className="card-brutal bg-main p-8 text-center">
          <p className="text-sm font-black uppercase tracking-wide text-black">404</p>
          <h1 className="mt-2 text-3xl font-extrabold text-black">Page not found</h1>
          <p className="mt-3 text-sm text-black">
            This calculator only has a couple of routes. Head back to the main scenario page.
          </p>
          <Link href="/" className="btn-brutal btn-brutal-neutral mt-6">
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
