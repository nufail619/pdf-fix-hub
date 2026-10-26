import { ShieldCheck, Sparkles, MonitorOff } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    body: "The PDF tools process document contents in your browser without uploading them. Website requests and optional tracking are explained in our Privacy Policy.",
  },
  {
    icon: Sparkles,
    title: "Free to use",
    body: "All 25 tools are currently free, with no account required or branding watermark added.",
  },
  {
    icon: MonitorOff,
    title: "No installation",
    body: "Runs in an up-to-date browser without installing an app. Large files may exceed device memory.",
  },
];

export function Features() {
  return (
    <section className="bg-section py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Why people choose MY PDF FIX</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          A faster, calmer way to handle the everyday paperwork in your life.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl bg-background p-6 text-center shadow-sm">
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
