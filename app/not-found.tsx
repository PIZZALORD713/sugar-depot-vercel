export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-sm opacity-70">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block mt-4 underline">
          Go home
        </a>
      </div>
    </main>
  )
}
