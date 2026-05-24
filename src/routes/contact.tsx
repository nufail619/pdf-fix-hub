import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { seoHead } from "@/components/common/SEO";
import { Button } from "@/components/common/Button";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact — MY PDF FIX",
      description:
        "Get in touch with the MY PDF FIX team. Send bug reports, feature requests, or just say hello.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const input =
    "h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill out every field.");
      return;
    }
    toast.success("Thanks! We'll get back to you within 1–2 business days.");
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Contact us</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Have a question, a bug to report, or a tool you'd love to see? Drop us a
        line.
      </p>
      <a
        href="mailto:hello@example.com"
        className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
      >
        <Mail className="h-4 w-4" aria-hidden /> hello@example.com
      </a>

      <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-2xl border border-border bg-background p-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold">
            Your name
          </label>
          <input
            id="name"
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-semibold">
            Message
          </label>
          <textarea
            id="message"
            rows={6}
            className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg">Send message</Button>
      </form>
    </div>
  );
}
