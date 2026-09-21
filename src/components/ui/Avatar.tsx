/**
 * Avatar — بدون أول حرفين
 * - لو مفيش صورة → Placeholder احترافي (رمز عام موحّد)
 * - ممنوع استخدام initials
 */

interface AvatarProps {
  name?: string;
  size?: number;
  variant?: 'navy' | 'red' | 'gradient' | 'light';
  src?: string;
}

const BG: Record<string, string> = {
  navy: 'var(--c-navy)',
  red: 'var(--c-red)',
  gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))',
  light: 'var(--c-off-white)',
};

export function Avatar({
  name,
  size = 44,
  variant = 'navy',
  src,
}: AvatarProps) {
  const isLight = variant === 'light';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 2px 8px rgba(21, 26, 69, 0.12)',
        }}
      />
    );
  }

  return (
    <div
      aria-label={name ?? 'صورة العضو'}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: BG[variant],
        color: isLight ? 'var(--c-navy)' : '#fff',
        flexShrink: 0,
        border: isLight ? '1.5px solid var(--c-line-mid)' : '2px solid rgba(255,255,255,0.15)',
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(21, 26, 69, 0.10)',
      }}
    >
      <svg
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </div>
  );
}
