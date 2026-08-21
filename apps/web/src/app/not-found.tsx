export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-light">404 — Page Not Found</h1>
          <p className="mt-4 text-muted-foreground">The page you requested does not exist.</p>
        </div>
      </body>
    </html>
  );
}
