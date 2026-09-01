import type { SocialLinks, SocialPlatform } from "@/lib/affiliates";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/affiliates";

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
        fill="currentColor"
      />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48" fill="white" />
    </svg>
  );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .53.04.78.1v-3.5a6.37 6.37 0 0 0-.78-.05A6.34 6.34 0 0 0 3.14 15.3 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.35-6.36V8.66A8.24 8.24 0 0 0 20.7 10.5V7.04a4.79 4.79 0 0 1-1.11-.35z"
        fill="currentColor"
      />
    </svg>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICON_MAP: Record<SocialPlatform, (props: { size: number }) => React.ReactNode> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  twitter: XIcon,
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: "#E4405F",
  youtube: "#FF0000",
  tiktok: "#010101",
  twitter: "#14171A",
};

export function SocialLinkIcons({ links, size = 18 }: { links: SocialLinks; size?: number }) {
  const entries = (["instagram", "youtube", "tiktok", "twitter"] as SocialPlatform[]).filter(
    (p) => links[p]
  );

  if (entries.length === 0) return <span style={{ opacity: 0.4 }}>—</span>;

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      {entries.map((platform) => {
        const Icon = ICON_MAP[platform];
        return (
          <a
            key={platform}
            href={links[platform]}
            target="_blank"
            rel="noopener noreferrer"
            title={SOCIAL_PLATFORM_LABELS[platform]}
            style={{ color: PLATFORM_COLORS[platform], display: "inline-flex", lineHeight: 0 }}
          >
            <Icon size={size} />
          </a>
        );
      })}
    </span>
  );
}
