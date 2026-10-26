import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "About — MY PDF FIX",
      description:
        "MY PDF FIX offers free PDF tools that run in your browser, so your files never leave your device. Built by Mohamed Nufail, Sri Lanka.",
      path: "/about",
    }),
  component: About,
});

const link = "text-primary hover:underline";

function About() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">About MY PDF FIX</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        MY PDF FIX is a set of free PDF tools that run in your web browser. Your files are processed
        on your own device without uploading their contents. Loading the website and Google
        verification can still make network requests.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Why it exists</h2>
      <p className="mt-3 text-muted-foreground">
        MY PDF FIX provides common document tasks without requiring a file-processing server or a
        user account. Each tool explains its controls and limits, including when the output becomes
        an image or an overlay leaves the original content underneath. Keep your originals and
        inspect the downloaded result before sharing it.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Who builds it</h2>
      <p className="mt-3 text-muted-foreground">
        MY PDF FIX is built and run by Mohamed Nufail, a Digital Product Strategist and the Founder
        of WOWZOO (PVT) LTD in Sri Lanka. You can learn more about my work at{" "}
        <a className={link} href="https://nufail.cc" target="_blank" rel="noopener noreferrer">
          nufail.cc
        </a>
        .
      </p>
      <p className="mt-3 text-muted-foreground">Other projects I work on:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
        <li>
          <a className={link} href="https://wowzoo.lk" target="_blank" rel="noopener noreferrer">
            wowzoo.lk
          </a>{" "}
          — my company, WOWZOO (PVT) LTD
        </li>
        <li>
          <a
            className={link}
            href="https://wpshopefy.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            wpshopefy.com
          </a>{" "}
          — WordPress and online store work
        </li>
        <li>
          <a
            className={link}
            href="https://nufail360.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            nufail360.com
          </a>{" "}
          — digital services and projects
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold">How the site pays for itself</h2>
      <p className="mt-3 text-muted-foreground">
        The tools are free. To cover hosting and my time, the site may show Google ads. We never see
        your files, so they are never used for ads. Read the{" "}
        <a className={link} href="/privacy">
          Privacy Policy
        </a>{" "}
        for details.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Get in touch</h2>
      <p className="mt-3 text-muted-foreground">
        Found a bug or have an idea? Visit the{" "}
        <a className={link} href="/contact">
          contact page
        </a>
        . I read every message.
      </p>
    </article>
  );
}
