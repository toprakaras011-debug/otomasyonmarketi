export default function CategoriesLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="container relative mx-auto px-4 py-12">
        <div className="mb-16 mt-8">
          <div className="h-16 w-64 bg-muted animate-pulse rounded-lg mb-4 mx-auto" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg mx-auto" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}

