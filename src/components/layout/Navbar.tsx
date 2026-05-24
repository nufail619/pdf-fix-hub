import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { tools, TOOL_CATEGORIES } from "@/data/tools";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-background transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6"
        aria-label="Main"
      >
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <span>
            MY PDF <span className="text-primary">FIX</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          <li className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen((s) => !s)}
              onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
              className="flex items-center gap-1 text-sm font-medium hover:text-primary"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
            >
              Tools <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {toolsOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-[640px] -translate-x-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {TOOL_CATEGORIES.map((cat) => (
                    <div key={cat}>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {cat}
                      </h3>
                      <ul className="space-y-1.5">
                        {tools
                          .filter((t) => t.category === cat)
                          .map((t) => (
                            <li key={t.slug}>
                              <Link
                                to={"/" + t.slug as never}
                                className="block text-sm text-foreground hover:text-primary"
                              >
                                {t.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
          <li>
            <Link to="/guides" className="text-sm font-medium hover:text-primary">
              Guides
            </Link>
          </li>
          <li>
            <Link to="/blog" className="text-sm font-medium hover:text-primary">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-section"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-dvh w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-section"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <div className="space-y-6">
              {TOOL_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </h3>
                  <ul className="space-y-2">
                    {tools
                      .filter((t) => t.category === cat)
                      .map((t) => (
                        <li key={t.slug}>
                          <Link
                            to={"/" + t.slug as never}
                            className="block text-sm font-medium"
                            onClick={() => setOpen(false)}
                          >
                            {t.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
              <div className="border-t border-border pt-4 space-y-3">
                <Link to="/guides" className="block font-medium" onClick={() => setOpen(false)}>
                  Guides
                </Link>
                <Link to="/blog" className="block font-medium" onClick={() => setOpen(false)}>
                  Blog
                </Link>
                <Link to="/contact" className="block font-medium" onClick={() => setOpen(false)}>
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
