import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin, Mail, FileText } from "lucide-react";
import { tools } from "@/data/tools";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function Footer() {
  const { siteName, contactEmail } = useSiteConfig();
  const topTools = tools.slice(0, 8);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-section">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Tools</h3>
            <ul className="space-y-2 text-sm">
              {topTools.map((t) => (
                <li key={t.slug}>
                  <Link
                    to={"/" + t.slug as never}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-primary">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Contact</h3>
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" aria-hidden /> {contactEmail}
            </a>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground hover:text-primary"
              >
                <Github className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" aria-hidden />
            </span>
            <span>
              © {year} {siteName}. All rights reserved.
            </span>
          </div>
          <span>Made with care for people who work with PDFs.</span>
        </div>
      </div>
    </footer>
  );
}
