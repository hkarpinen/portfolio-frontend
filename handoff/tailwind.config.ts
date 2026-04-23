import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────────────────────
      // All color values use oklch() for perceptual uniformity.
      // CSS custom properties (see globals.css) are the single source of truth.
      // Tailwind classes reference those vars via the mapping below.
      colors: {
        bg: {
          DEFAULT: 'var(--bg)',
          2:       'var(--bg-2)',
          3:       'var(--bg-3)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2:       'var(--surface-2)',
          3:       'var(--surface-3)',
        },
        border: {
          DEFAULT: 'var(--border)',
          2:       'var(--border-2)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2:       'var(--text-2)',
          3:       'var(--text-3)',
        },
        accent: {
          DEFAULT:  'var(--accent)',
          hi:       'var(--accent-hi)',
          v:        'var(--accent-v)',
          glow:     'var(--accent-glow)',
          subtle:   'var(--accent-subtle)',
        },
        success: {
          DEFAULT: 'var(--success)',
          s:       'var(--success-s)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          s:       'var(--warning-s)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          s:       'var(--danger-s)',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs:   ['11px', { lineHeight: '16px' }],
        sm:   ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md:   ['16px', { lineHeight: '24px' }],
        lg:   ['18px', { lineHeight: '28px' }],
        xl:   ['22px', { lineHeight: '30px' }],
        '2xl':['28px', { lineHeight: '36px' }],
        '3xl':['36px', { lineHeight: '44px' }],
        '4xl':['48px', { lineHeight: '56px' }],
        '5xl':['64px', { lineHeight: '72px' }],
      },
      fontWeight: {
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        extrabold:'800',
        black:    '900',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.025em',
        snug:    '-0.015em',
        normal:  '0',
        wide:    '0.02em',
        wider:   '0.06em',
        widest:  '0.1em',
      },

      // ── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
        full: '9999px',
      },

      // ── Spacing ──────────────────────────────────────────────────────────────
      // Uses a 4px base grid. Key stops:
      spacing: {
        '1':  '2px',   // 0.5 × 4px
        '2':  '4px',
        '3':  '6px',
        '4':  '8px',
        '5':  '10px',
        '6':  '12px',
        '8':  '16px',
        '10': '20px',
        '12': '24px',
        '16': '32px',
        '20': '40px',
        '24': '48px',
        '32': '64px',
        '40': '80px',
        '48': '96px',
      },

      // ── Box Shadow / Elevation ───────────────────────────────────────────────
      boxShadow: {
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
        none: 'none',
      },

      // ── Transitions / Motion ─────────────────────────────────────────────────
      transitionTimingFunction: {
        spring:   'cubic-bezier(0.16, 1, 0.3, 1)',
        out:      'cubic-bezier(0.2, 0, 0, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '110ms',
        mid:  '220ms',
        slow: '380ms',
        page: '500ms',
      },

      // ── Breakpoints ──────────────────────────────────────────────────────────
      screens: {
        xs:   '360px',   // small phones
        sm:   '390px',   // iPhone 14
        md:   '768px',   // tablet portrait
        lg:   '1024px',  // tablet landscape / small laptop
        xl:   '1280px',  // desktop
        '2xl':'1440px',  // wide desktop
      },

      // ── Keyframes ────────────────────────────────────────────────────────────
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        meshMove: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%':      { transform: 'translate(60px,-40px) scale(1.08)' },
        },
      },
      animation: {
        'fade-up':  'fadeUp 380ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fadeIn 220ms cubic-bezier(0.2,0,0,1) both',
        'scale-in': 'scaleIn 220ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slideIn 220ms cubic-bezier(0.16,1,0.3,1) both',
        shimmer:    'shimmer 1.6s ease-in-out infinite',
        spin:       'spin 0.8s linear infinite',
        mesh:       'meshMove 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
