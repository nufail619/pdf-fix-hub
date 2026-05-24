import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function Icon({
  name,
  className,
  ...rest
}: { name: string; className?: string } & React.SVGProps<SVGSVGElement>) {
  const Comp = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.File;
  return <Comp className={className} aria-hidden {...rest} />;
}
