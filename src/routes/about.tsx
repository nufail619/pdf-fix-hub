import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "About — MY PDF FIX",
      description:
        "MY PDF FIX is a free, browser-based PDF toolkit. Learn who we are, what we believe, and how we keep your files private.",
      path: "/about",
    }),
  component: About,
});

function About() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose-content">
      <h1 className="text-4xl font-bold sm:text-5xl">About MY PDF FIX</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        MY PDF FIX exists because working with PDFs in 2026 still shouldn't require
        installing software, signing up for an account, or handing your files to a
        company you've never heard of.
      </p>
      <h2 className="mt-12 text-2xl font-bold">Our story</h2>
      <p className="mt-3 text-muted-foreground">
        We started MY PDF FIX after one too many afternoons spent searching for a
        free, trustworthy way to merge a few PDFs. The popular options were either
        slow, ad-riddled, or quietly uploaded our files to servers we couldn't audit.
        The good options cost a subscription. So we built the tool we wanted — one
        that runs entirely in your browser, costs nothing, and never asks you to
        sign up.
      </p>
      <h2 className="mt-10 text-2xl font-bold">What we believe</h2>
      <p className="mt-3 text-muted-foreground">
        Software for everyday tasks should be invisible. You should be able to open
        a website, get the thing done, and close the tab a minute later — without
        thinking about cookies, accounts, or where your file went. Every tool on
        MY PDF FIX is designed around that idea. If a tool can be done in your
        browser, we do it in your browser. If a tool genuinely needs a server, we
        say so up front and we work on a privacy-first server implementation rather
        than borrowing someone else's.
      </p>
      <h2 className="mt-10 text-2xl font-bold">How we pay the bills</h2>
      <p className="mt-3 text-muted-foreground">
        We may run modest, clearly-labelled ads on some pages to cover hosting and
        development. We do not sell user data, because we don't collect it — there
        is nothing to sell. We don't use trackers that follow you across the web.
        We measure aggregate usage to know which tools are popular, and that's it.
      </p>
      <h2 className="mt-10 text-2xl font-bold">Get in touch</h2>
      <p className="mt-3 text-muted-foreground">
        We love hearing from people who use these tools. Whether you've found a
        bug, want to suggest a new feature, or just want to say hello — the contact
        form is the fastest way to reach us.
      </p>
    </article>
  );
}
