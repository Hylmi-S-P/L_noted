---
name: Warm & Reliable Laundry Assistant
colors:
  surface: '#f7fafa'
  surface-dim: '#d7dbda'
  surface-bright: '#f7fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f4'
  surface-container: '#ebeeee'
  surface-container-high: '#e5e9e8'
  surface-container-highest: '#e0e3e3'
  on-surface: '#181c1c'
  on-surface-variant: '#3e4949'
  inverse-surface: '#2d3131'
  inverse-on-surface: '#eef1f1'
  outline: '#6e7979'
  outline-variant: '#bec9c9'
  surface-tint: '#00696d'
  primary: '#00595c'
  on-primary: '#ffffff'
  primary-container: '#0d7377'
  on-primary-container: '#a2f5f9'
  inverse-primary: '#81d4d8'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#7af8a2'
  on-secondary-container: '#00723a'
  tertiary: '#7a401c'
  on-tertiary: '#ffffff'
  tertiary-container: '#975731'
  on-tertiary-container: '#ffe1d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9df0f4'
  primary-fixed-dim: '#81d4d8'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f52'
  secondary-fixed: '#7dfba4'
  secondary-fixed-dim: '#5fde8a'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#6f3814'
  background: '#f7fafa'
  on-background: '#181c1c'
  surface-variant: '#e0e3e3'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.5px
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

The design system is centered on the concept of *Gotong Royong* and *Kepercayaan* (Trust). It is designed specifically for Indonesian women who may not be digital natives, prioritizing a "helpful tool" persona over a "complex software" feel. 

The visual style is a blend of **Minimalism** and **Corporate/Modern** sensibilities, adapted for high accessibility. By utilizing ample whitespace and a restricted color palette, the interface reduces cognitive load. The aesthetic is clean, uncluttered, and focuses on large, touch-friendly targets to ensure confidence in every interaction. The emotional goal is to make the user feel that their business is organized and their data is safe.

## Colors

The color palette is anchored by a deep Teal (Primary) and a vibrant Green (Secondary), evoking cleanliness and growth. 

- **Primary (#0D7377):** Used for main actions, navigation, and brand-heavy elements. It provides a sense of stability.
- **Secondary (#32B768):** Reserved for "Success" states and "Selesai" (Completed) markers.
- **Background (#F7F8FA):** A slightly cool off-white that prevents screen glare and differentiates itself clearly from white Surface elements.
- **Text Primary (#1A202C):** A high-contrast charcoal for maximum legibility in body copy and titles.
- **Text Secondary (#718096):** Used for "Catatan" (Notes) or "Keterangan" (Descriptions) that are auxiliary to the main task.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, rounded terminals which appear more approachable than traditional sans-serifs. 

To accommodate non-tech-savvy users, the scale is intentionally oversized. The minimum size for body text is set to **16sp** to ensure readability under various lighting conditions (e.g., in a bright laundry room). All instructional text (Labels) must not fall below **14sp**. 

The hierarchy is kept flat; we avoid using more than three weights to prevent the UI from feeling "busy." Use Bold (700) sparingly for primary headings to guide the eye to the most important information on the page.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first usage. 

- **Margins:** A generous 20px side margin ensures that content is never too close to the edge of the device, making the phone easier to hold without accidental touches.
- **Rhythm:** An 8px base unit controls all spacing. Vertical stacks of cards should use "stack-sm" (12px) for related items and "stack-md" (24px) for distinct sections.
- **Touch Targets:** No interactive element should have a height smaller than 48dp; however, per the system requirements, primary buttons are set to **56dp** to maximize ease of use for users with varying levels of motor precision.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to communicate hierarchy. 

The Background layer stays flat. **Cards** (the primary container for laundry orders) are elevated using a soft, subtle shadow (Elevation 2). The shadow should have a 4px Y-offset and a 12px blur, with a low-opacity tint of the Primary color (#0D7377 at 8% opacity) rather than pure black. This creates a warmer, more integrated feel.

Floating Action Buttons (FABs) or primary action bars may use a higher elevation (Elevation 4) to appear "closer" to the user, suggesting they are the next step in the process.

## Shapes

The shape language is **Rounded**, favoring organic curves over sharp corners to reduce the "industrial" feel of the app.

- **Cards:** Use a 12dp radius to appear friendly and soft.
- **Buttons & Inputs:** Use an 8dp radius. This differentiates them slightly from the more organic-looking cards while maintaining a modern, helpful appearance.
- **Status Badges:** Use a full Pill shape (height / 2 radius) to distinguish them from interactive buttons.

## Components

### Tombol (Buttons)
Primary buttons must be 56dp tall with an 8dp radius. The text should be centered, bold, and in Sentence Case (*Simpan Pesanan*). Secondary buttons use an outlined style with the same dimensions.

### Kartu (Cards)
White background, 12dp radius, with Elevation 2. Use cards to group information like "Detail Pelanggan" or "Status Cucian." Cards should have 16px of internal padding.

### Input Field
Outlined style with an 8dp radius. The border color should be Text Secondary (#718096) by default and switch to Primary (#0D7377) when active. Error states use Danger (#E53E3E).

### Badge Status (Status Badges)
Pill-shaped containers with a light background tint of the status color and dark text.
- *Proses:* Orange background, Dark Orange text.
- *Selesai:* Green background, Dark Green text.
- *Belum Bayar:* Red background, Dark Red text.

### List Item (Daftar)
Standardized rows for displaying laundry items (e.g., "Kiloan", "Satuan"). Each row should have a minimum height of 64dp with a clear divider line between items to prevent "fat-finger" errors.

### Bottom Sheet (Lembar Bawah)
Use for choosing options (e.g., "Pilih Jenis Layanan"). This is more accessible for non-tech-savvy users than dropdown menus as it presents options clearly at the bottom of the screen within thumb reach.