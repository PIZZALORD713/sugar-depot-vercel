// Server Component (no 'use client', no wagmi/rainbowkit/viem hooks)
export default function NotFound() {
  return (
    <main className="mx-auto max-w-screen-md p-8">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-500">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-6">
        <a href="/" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">
          ← Back home
        </a>
      </div>
    </main>
  )
}
