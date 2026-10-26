export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-[#fff5f4] to-transparent" />
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          25 tools to help you work with <span className="text-primary">PDFs</span> in one place
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Merge, split, convert and edit PDFs for free. Document processing runs in your browser
          without uploading your document contents.
        </p>
      </div>
    </section>
  );
}
