// Trainer Tab — server-compatible, no hooks.
// Phase 1: profile block (name/stable/location/philosophy/bio/contact).
// Phase 1.5: website + socials icon row (same icon language as landing footer).
// RENDER-ONLY-EXISTING: links render only when their prop is truthy.

interface TrainerTabProps {
  trainerName: string;
  stableName: string;
  location?: string;
  philosophy?: string;
  bio?: string;
  contactName?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
}

const ICON_CLASSES = 'h-5 w-5 text-muted-foreground transition-colors duration-300 hover:text-accent';

function GlobeIcon() {
  return (
    <svg className={ICON_CLASSES} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className={ICON_CLASSES} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className={ICON_CLASSES} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.667.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.667-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.885z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className={ICON_CLASSES} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.438 12 12.435v-8.807H7.344v-3.627H24z" transform="scale(0.8) translate(3 3)" />
    </svg>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function TrainerTab({
  trainerName,
  stableName,
  location,
  philosophy,
  bio,
  contactName,
  website,
  facebookUrl,
  instagramUrl,
  xUrl,
}: TrainerTabProps) {
  const trimmedBio = bio?.trim();
  const trimmedPhilosophy = philosophy?.trim();

  return (
    <div>
      <h3 className="text-lg font-medium text-heading">Trainer Profile</h3>
      <p className="mt-2 text-sm font-medium text-heading">
        {trainerName}
        {location && <span className="text-muted-foreground font-light"> · {location}</span>}
      </p>
      <p className="text-xs font-light text-muted-foreground">{stableName}</p>

      {trimmedPhilosophy && (
        <p className="mt-3 text-[15px] leading-[1.8] font-light text-foreground">{trimmedPhilosophy}</p>
      )}

      {trimmedBio && (
        <p className="mt-3 text-[14px] leading-[1.8] font-light text-muted-foreground">{trimmedBio}</p>
      )}

      {contactName && (
        <p className="mt-3 text-xs text-muted-foreground">
          Contact: <span className="text-foreground">{contactName}</span>
        </p>
      )}

      {(website || xUrl || instagramUrl || facebookUrl) && (
        <div className="mt-5 flex items-center gap-3">
          {website && (
            <IconLink href={website} label="Website">
              <GlobeIcon />
            </IconLink>
          )}
          {xUrl && (
            <IconLink href={xUrl} label="X (Twitter)">
              <XIcon />
            </IconLink>
          )}
          {instagramUrl && (
            <IconLink href={instagramUrl} label="Instagram">
              <InstagramIcon />
            </IconLink>
          )}
          {facebookUrl && (
            <IconLink href={facebookUrl} label="Facebook">
              <FacebookIcon />
            </IconLink>
          )}
        </div>
      )}
    </div>
  );
}