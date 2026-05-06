export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="mx-auto max-w-3xl py-10">
        <div className="card-brutal p-6 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold">Privacy</h1>
          <div className="mt-4 space-y-4 text-sm text-foreground-muted">
            <p>
              This page is a static public calculator. It does not ask for names, tax file numbers,
              account details, or investment account credentials.
            </p>
            <p>
              Standard web server and analytics logs may record coarse usage information such as page
              views, browser type, and approximate location. No personal tax advice is generated or stored.
            </p>
            <p>
              If analytics are added later, this page should continue to avoid collecting sensitive
              financial inputs beyond what is necessary to render the calculator in-browser.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
