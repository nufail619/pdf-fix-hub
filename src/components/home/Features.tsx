import { ShieldCheck, Sparkles, MonitorOff } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    body: "Your PDFs are processed locally on your device. We never upload, store, or peek at your files.",
  },
  {
    icon: Sparkles,
    title: "Free forever",
    body: "All client-side tools are 100% free. No accounts, no daily limits, no watermarks.",
  },
  {
    icon: MonitorOff,
    title: "No installation",
    body: "Works in your browser on any device. Nothing to download, install, or update.",
  },
];

export function Features() {
  return (
    <section className="bg-section py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Why people choose MY PDF FIX
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          A faster, calmer way to handle the everyday paperwork in your life.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl bg-background p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <it.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-bold">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
