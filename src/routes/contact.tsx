import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { seoHead } from "@/components/common/SEO";
import { useSiteConfig } from "@/context/SiteConfigContext";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact — MY PDF FIX",
      description:
        "Contact MY PDF FIX by email. Send a bug report, a feature request or a question. We reply within 2 working days.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const { contactEmail } = useSiteConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Contact us</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Have a question, a bug to report, or a tool you would like to see? Send us an email.
      </p>
      <a
        href={`mailto:${contactEmail}`}
        className="mt-8 inline-flex min-h-12 max-w-full items-center gap-2 break-all rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground hover:opacity-90 sm:px-6"
      >
        <Mail className="h-4 w-4" aria-hidden /> Email {contactEmail}
      </a>
      <p className="mt-4 text-sm text-muted-foreground">We reply within 2 working days.</p>
      <p className="mt-10 text-sm text-muted-foreground">
        MY PDF FIX is run by Mohamed Nufail, WOWZOO (PVT) LTD, Sri Lanka.
      </p>
    </div>
  );
}
