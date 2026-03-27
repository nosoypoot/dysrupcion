# Design System — Dysrupcion

## Product Context
- **What this is:** Community governance micro-site for Dysrupcion, the Yucatan tech community
- **Who it's for:** ~400 community members (local Yucatecos, nationals from other states, foreigners), potential new members, other communities looking to fork the protocol
- **Space/industry:** Regional tech community governance, civic tech
- **Project type:** Micro-site (Cloudflare Workers + Supabase), mobile-first, bilingual ES/EN

## Aesthetic Direction
- **Direction:** Retro-Futurista Constructivista
- **Decoration level:** Intentional (logo and colors do the heavy lifting, subtle grain texture on dark backgrounds, geometric line separators)
- **Mood:** Bold, energetic, movement-like. The site should feel like a poster for a tech movement, not a generic SaaS landing page. The interlocking geometric logo sets the tone: modular, collaborative, built together.
- **Reference sites:** Research showed most tech community sites (Tequila Valley, Cabrito Valley, etc.) are generic white+blue. Dysrupcion's tri-color system on dark backgrounds is already more distinctive than anything in the Mexican tech community space.

## Typography
- **Display/Hero:** Clash Grotesk (weight 500-700) — geometric, bold, complements the constructivist logo energy. Used for page titles, hero text, section headings, metric values.
- **Body:** DM Sans (weight 300-600) — clean, legible, geometric enough to pair with Clash Grotesk. Used for paragraphs, descriptions, form labels, navigation.
- **UI/Labels:** DM Sans (weight 500-600) — same as body, slightly heavier for buttons and labels.
- **Data/Tables:** Geist Mono — tabular-nums for metrics dashboard, initiative board data, member counts. Also used for section labels, tags, and code snippets.
- **Code:** Geist Mono
- **Loading:** Google Fonts for DM Sans, Fontshare for Clash Grotesk, system fallback for Geist Mono (with self-hosted as option)
- **Scale:**
  - Display XL: 64px / 700 / 1.0 line-height
  - Display LG: 48px / 600 / 1.1
  - Display MD: 32px / 600 / 1.2
  - Display SM: 24px / 500 / 1.3
  - Body LG: 18px / 400 / 1.6
  - Body: 16px / 400 / 1.6
  - Body SM: 14px / 400 / 1.5
  - Mono: 14px / 400 / 1.5
  - Label: 11px / 500 / uppercase / 0.15em letter-spacing

## Color
- **Approach:** Expressive tri-color system derived from existing brand identity
- **System:** Pink = action (CTAs, links, destructive), Cyan = information (tags, highlights, success), Yellow = attention (warnings, feature highlights, beneficiary badges)

### Dark Mode (default)
- **Background:** #0B1120 — deep navy, consistent with existing social media posts
- **Surface:** #151D2F — cards, forms, elevated content
- **Surface Elevated:** #1C2540 — dropdowns, modals, hover states
- **Border:** #2A3350
- **Text Primary:** #F0F2F5
- **Text Muted:** #8B95A8
- **Pink:** #FF1654
- **Cyan:** #2EECC7
- **Yellow:** #FFD100
- **Semantic:** success #2EECC7, warning #FFD100, error #FF1654, info #2EECC7

### Light Mode
- **Background:** #F5F6F8 — warm off-white
- **Surface:** #FFFFFF
- **Surface Elevated:** #FFFFFF (with subtle box-shadow)
- **Border:** #E2E5EB
- **Text Primary:** #0B1120 — the dark mode background becomes light mode text (cohesion trick)
- **Text Muted:** #5C6578
- **Pink:** #E8104A — darkened ~10% for WCAG AA contrast on white
- **Cyan:** #0EBFA0 — desaturated ~15% for readability on light backgrounds
- **Yellow:** #D4AD00 — darkened for WCAG AA on white
- **Semantic:** success #0EBFA0, warning #D4AD00, error #E8104A, info #0EBFA0

### Theme Behavior
- Default: dark mode
- Respects `prefers-color-scheme` from user's OS
- Manual toggle via button in site header
- Implementation: CSS custom properties on `:root` (dark) and `[data-theme="light"]`

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable
- **Scale:**
  - 2xs: 4px
  - xs: 8px
  - sm: 12px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px

## Layout
- **Approach:** Hybrid — creative-editorial for landing/manifiesto (asymmetric, poster-like hero), grid-disciplined for functional pages (directory, initiatives, events, metrics)
- **Grid:** 12 columns. Mobile: 1 col. Tablet: 2 col. Desktop: 3-4 col for cards, full-width for hero.
- **Max content width:** 1120px
- **Border radius:**
  - sm: 4px (tags, small elements)
  - md: 8px (buttons, inputs, small cards)
  - lg: 12px (cards, forms, sections)
  - full: 9999px (avatars, pills, toggle)

## Motion
- **Approach:** Intentional — motion communicates "something is happening here" without being flashy
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:**
  - micro: 50-100ms (button hover, focus states)
  - short: 150-250ms (card hover, toggle, input focus)
  - medium: 250-400ms (page transitions, card entrance on scroll)
  - long: 400-700ms (hero animations, section reveals)
- **Rules:**
  - Cards get subtle entrance animation on scroll (fade-up, 200ms stagger)
  - Buttons: translateY(-1px) + opacity change on hover
  - No decorative animations (no floating blobs, no parallax)
  - Respect `prefers-reduced-motion`

## Component Patterns

### Buttons
- **Primary:** background var(--pink), white text. Used for main CTAs (register, submit).
- **Secondary:** transparent background, cyan border + text. Hover fills cyan. Used for secondary actions.
- **Ghost:** transparent background, muted border + text. Used for tertiary actions.
- Padding: 12px 24px. Border-radius: md (8px). Font: DM Sans 600 14px.

### Cards
- Background: var(--surface). Border: 1px solid var(--border). Border-radius: lg (12px). Padding: 24px.
- Hover: border-color transitions to relevant brand color (cyan for info, pink for action).

### Tags/Badges
- Pill shape (border-radius: full). Background: brand color at 15% opacity. Text: brand color.
- Font: Geist Mono 11px, 0.05em letter-spacing, uppercase.
- Track tags use cyan. Action tags use pink. Attention tags use yellow.

### Form Inputs
- Background: var(--bg). Border: 1px solid var(--border). Border-radius: md (8px).
- Focus: border-color transitions to cyan. No outline, border change only.
- Label: 13px DM Sans 500, muted color, above input.

### Alerts
- Left border: 3px solid semantic color. Background: semantic color at 8% opacity.
- Font: 14px DM Sans. Color: semantic color.

### Initiative Cards
- Standard card with initiative title (Clash Grotesk 16px 600), track tag, meta info.
- Yellow "beneficiary" badge at bottom: Geist Mono 12px, yellow background at 10% opacity.

### Event Cards
- Horizontal layout: date block (day in Clash Grotesk 28px pink, month in mono uppercase) + event info + track tag.
- Source platform shown as cyan mono text ("via lu.ma", "via meetup.com").

### Member Directory Rows
- Avatar circle (36px, brand color background, initials) + name + role + origin tag.
- Origin tags: Local = cyan, Foraneo = pink, Extranjero = yellow.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Initial design system created | Created by /design-consultation based on existing brand identity (logo, tri-color palette, social media posts) + competitive research of tech community sites |
| 2026-03-27 | Dark mode as default | Consistent with existing social media presence (dark backgrounds in event posts) and 2026 web design trends |
| 2026-03-27 | Tri-color semantic system | Pink=action, Cyan=info, Yellow=attention. Derived from brand colors. No other Mexican tech community uses this approach. |
| 2026-03-27 | Clash Grotesk for display | Geometric, bold, complements the constructivist logo. Available via Fontshare (free). |
| 2026-03-27 | Dual dark/light mode | Dark default, light mode uses inverted brand colors (navy becomes text, off-white becomes background) for brand cohesion across modes. |
| 2026-03-27 | Poster-style landing | Manifiesto landing page designed as movement poster, not typical SaaS hero+features. Deliberate creative risk for memorability. |
