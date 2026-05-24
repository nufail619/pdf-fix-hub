import { useEffect } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";

function inject(id: string, html: string) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  Array.from(wrap.children).forEach((node, i) => {
    (node as HTMLElement).id = i === 0 ? id : `${id}-${i}`;
    document.head.appendChild(node);
  });
}

export function HeadScripts() {
  const cfg = useSiteConfig();

  useEffect(() => {
    if (cfg.adsenseId) {
      inject(
        "head-adsense",
        `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adsenseId}" crossorigin="anonymous"></script>`,
      );
    }
    if (cfg.gaId) {
      inject(
        "head-ga",
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${cfg.gaId}');</script>`,
      );
    }
    if (cfg.gtmId) {
      inject(
        "head-gtm",
        `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtmId}');</script>`,
      );
    }
    if (cfg.clarityId) {
      inject(
        "head-clarity",
        `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${cfg.clarityId}");</script>`,
      );
    }
  }, [cfg.adsenseId, cfg.gaId, cfg.gtmId, cfg.clarityId]);

  return null;
}
