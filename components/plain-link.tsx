import type { AnchorHTMLAttributes } from "react";

/** Enlace normal (navegación completa). Sustituye a next/link: el router cliente de vinext beta no navega en producción. */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean; replace?: boolean; scroll?: boolean };
export default function Link({ href, prefetch: _p, replace: _r, scroll: _s, ...rest }: Props) {
  return <a href={href} {...rest} />;
}
