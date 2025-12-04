import { type Ref } from "react";
import { Twitter, Github, Linkedin, Youtube, Facebook, Instagram, type IconProps } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface FooterLinkProps {
  label: string;
  href: string;
}

export interface FooterColumnProps {
  title: string;
  links: FooterLinkProps[];
}

export type SocialPlatform = "twitter" | "github" | "linkedin" | "youtube" | "facebook" | "instagram";

export interface SocialLinkProps {
  platform: SocialPlatform;
  href: string;
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoText?: string;
  tagline?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  socialLinks?: SocialLinkProps[];
  ref?: Ref<HTMLElement>;
}

const socialIcons: Record<SocialPlatform, React.ComponentType<IconProps>> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
};

function Footer({
  logo,
  logoText = "PLUXITY",
  tagline = "Building amazing digital experiences",
  columns = [],
  copyright = `© ${new Date().getFullYear()} PLUXITY. All rights reserved.`,
  socialLinks,
  className,
  ref,
  ...props
}: FooterProps) {
  return (
    <footer
      ref={ref}
      className={cn("border-t border-[#E6E6E8] bg-white", className)}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              {logo || (
                <span className="text-xl font-bold text-brand">{logoText}</span>
              )}
            </div>
            {tagline && (
              <p className="mb-4 max-w-xs text-sm text-[#666673]">{tagline}</p>
            )}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = socialIcons[social.platform];
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="text-[#808088] transition-colors hover:text-brand"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon size="md" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="mb-4 text-sm font-bold text-[#333340]">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-[#666673] transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {copyright && (
          <div className="mt-12 border-t border-[#E6E6E8] pt-8">
            <p className="text-center text-sm text-[#808088]">{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}

export { Footer };
