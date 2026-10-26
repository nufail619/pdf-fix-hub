import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { useSiteConfig } from "@/context/SiteConfigContext";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy — MY PDF FIX",
      description:
        "How MY PDF FIX handles your files and data. Your files are processed in your browser and never uploaded.",
      path: "/privacy",
    }),
  component: Privacy,
});

function Privacy() {
  const { contactEmail } = useSiteConfig();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 26 October 2026</p>
      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          MY PDF FIX (mypdffix.com) is operated by Mohamed Nufail, Founder of WOWZOO (PVT) LTD, Sri
          Lanka. This policy explains what happens to your files and your data when you use the
          site.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Your files stay on your device</h2>
        <p>
          All PDF tools on MY PDF FIX run inside your web browser. When you choose a file, it is
          read into your browser’s memory, processed on your own device, and offered back to you as
          a download. Your files are never uploaded to our servers or to any third party. We cannot
          see them, store them or share them.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Information we collect</h2>
        <p>
          We do not ask you to create an account, and we do not collect your name, email address or
          files through the tools. If you email us, we receive your email address and the message
          you send, and we use them only to reply to you.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Analytics and advertising</h2>
        <p>
          Optional analytics and ad requests stay disabled until you accept the corresponding
          category. Google's AdSense site-verification script loads on eligible production content
          pages and may send Google standard request information, such as your IP address, before
          you choose. Ad requests start paused and Google consent defaults are denied. Searchable
          listings, missing pages and utility pages do not load the ad script, even with saved
          advertising consent. You can reject optional services or change your choice through
          Privacy settings in the footer. We remember that choice in browser storage for up to 180
          days. Global Privacy Control and Do Not Track signals keep optional services off.
        </p>
        <p>
          We may use Google Analytics to understand, in aggregate, which pages and tools are used.
          We may also show ads served by Google AdSense. Google and its partners may use cookies or
          similar technologies to measure traffic, and to show and measure ads, including ads based
          on your earlier visits to this or other websites.
        </p>
        <p>
          When configured and accepted, Google Tag Manager may manage analytics tags, and Microsoft
          Clarity may help us understand page interactions. Tool workspaces are marked for Clarity
          masking. Our application does not send selected documents, passwords or document contents
          to analytics services. Review the relevant provider's privacy information before accepting
          optional services.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Hosting and admin sign-in</h2>
        <p>
          Cloudflare hosts the website and may process standard request information such as your IP
          address for delivery and security. The public PDF tools require no account. Authorized
          content editors use GitHub sign-in for the separate admin panel; GitHub repository
          permissions control access, and published blog content and uploaded images are stored in
          the repository.
        </p>
        <p>
          You can read how Google handles data from sites that use its services at{" "}
          <a
            className="text-primary hover:underline"
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            How Google uses data from sites that use our services
          </a>
          . You can manage personalised advertising in{" "}
          <a
            className="text-primary hover:underline"
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          .
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Cookies</h2>
        <p>
          See our{" "}
          <a className="text-primary hover:underline" href="/cookie-policy">
            Cookie Policy
          </a>{" "}
          for details about the cookies used on this site.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Your choices and rights</h2>
        <p>
          Because we do not store your files or build profiles about you, there is very little
          personal data for us to hold. If you have emailed us and want your message deleted, write
          to us at{" "}
          <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>{" "}
          and we will remove it.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Children</h2>
        <p>
          MY PDF FIX is not directed at children under 13, and we do not knowingly collect personal
          information from them.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Changes to this policy</h2>
        <p>If we change this policy, we will update the date at the top of this page.</p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact</h2>
        <p>
          Questions about privacy? Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
