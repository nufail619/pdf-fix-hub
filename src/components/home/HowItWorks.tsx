import { Upload, Settings2, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drag and drop your PDF or pick a file from your device.",
  },
  {
    icon: Settings2,
    title: "Process",
    body: "Choose your options and run the tool locally in your browser.",
  },
  {
    icon: Download,
    title: "Download",
    body: "Download the completed result — no email, no sign-up required.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three simple steps from messy PDF to finished file.
        </p>
        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-border bg-background p-6"
            >
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Step {i + 1}
              </span>
              <s.icon className="mt-2 h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
