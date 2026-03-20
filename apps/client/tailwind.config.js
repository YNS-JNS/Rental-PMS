/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      // ── Font Families ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      // ── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        xl:  'calc(var(--radius) + 4px)',
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
      },

      // ── Letter Spacing ────────────────────────────────────────────────
      // Tighter tracking on large headings gives a modern, Stripe-like feel.
      // Use `tracking-heading` on h1/h2 and `tracking-subheading` on h3/h4.
      letterSpacing: {
        heading:    '-0.03em',   // h1, h2 — tight, confident
        subheading: '-0.015em',  // h3, h4 — slightly tight
      },

      // ── Box Shadows ───────────────────────────────────────────────────
      // Multi-layered, soft shadows inspired by Stripe's design system.
      // Each uses two layers: a broad ambient and a tight focus edge.
      // Never use Tailwind's default `shadow-md/lg` — use these instead.
      boxShadow: {
        /**
         * card — for Card components and elevated surfaces.
         * Layer 1: broad ambient (low opacity) for depth perception.
         * Layer 2: tight edge highlight for a clean boundary.
         */
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',

        /**
         * card-hover — applied on card hover for a lift effect.
         * Increases the ambient spread and opacity.
         */
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',

        /**
         * dialog — for Dialog and Sheet overlays.
         * Deeper shadow signals higher z-level in the visual hierarchy.
         */
        dialog: '0 8px 30px -4px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)',

        /**
         * dropdown — for Select, DropdownMenu, Popover, Combobox.
         * Tight, close shadow for elements that feel "near" the surface.
         */
        dropdown: '0 2px 8px -2px rgb(0 0 0 / 0.10), 0 1px 3px -1px rgb(0 0 0 / 0.06)',

        /**
         * input-focus — applied via ring on focused inputs.
         * Provides a subtle glow matching the primary color ring.
         */
        'input-focus': '0 0 0 3px hsl(var(--ring) / 0.15)',
      },

      // ── Color Tokens ──────────────────────────────────────────────────
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT:    'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT:    'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT:    'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        agency: {
          DEFAULT:    'hsl(var(--agency))',
          foreground: 'hsl(var(--agency-foreground))',
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        sidebar: 'hsl(var(--sidebar))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
