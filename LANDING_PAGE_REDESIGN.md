# Landing Page Redesign Documentation: Scroll-Snap & Visual Upgrades

This document summarizes the architecture, design changes, and code updates made to the Livaxis Landing Page. It serves as a direct reference for future sessions or other developers to quickly understand the changes without having to manually scan the codebase.

## 📌 Summary of Redesign

The goal of this redesign was to transform the landing page into an editorial, full-screen scroll-snap layout (slideshow style) with smooth animations and clean responsive fallbacks.

- **Removed**: "Bộ sưu tập tuyển chọn" (Curated products list section) to keep the landing page focused and performant.
- **Expanded**: From 3 sections to **8 fullscreen scroll-snap sections**, adding Features, Stats, Testimonials, Pricing Preview, and FAQ.
- **Architecture**: Custom JS scroll-hijack engine, IntersectionObserver sync, Framer Motion animations, full i18n (VI + EN).

---

## 🗺️ Section Map (Current — 7 Sections)

| # | Section ID | Background | Purpose |
|---|-----------|------------|---------|
| 1 | `hero` | Warm gradient | Hero + Before/After AI showcase |
| 2 | `process` | `#faf9f7` | 3-step how-it-works flow |
| 3 | `features` | White | 4 feature cards (AI viz, styles, comparison, shopping) |
| 4 | `testimonials` | `#faf9f7` | 3 customer quotes with stars and author info |
| 5 | `pricing` | White | 4 pricing plan cards, CTA → `/subscription` |
| 6 | `stats` | Dark charcoal `#1a1714` | Social proof numbers (12k+ rooms, 50+ styles, 4.9★, <60s) |
| 7 | `footer` | White | Global footer with links |

---

## 🛠️ Detailed Changes

### Target Files

- `FE/src/page/Hompage.tsx` — Main page file (complete rewrite)
- `FE/src/contexts/translations.ts` — Added ~50 new i18n keys (VI + EN)

---

### `FE/src/page/Hompage.tsx`

#### 1. New Type: `SectionId`

```typescript
type SectionId = 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'process' | 'faq' | 'footer'
```

Previously `activeSection` was typed as `'hero' | 'process' | 'footer'`. Now it is a dedicated named type for clarity.

#### 2. Scroll Engine — Updated for 8 Sections

- `sectionsList: SectionId[]` now contains all 8 section IDs.
- IntersectionObserver iterates over all 8 section IDs.
- Each section's `ChevronDown` button calls `scrollToSection()` pointing to the next section in sequence.

#### 3. Side Dot Navigation — 8 Dots

`dotNavItems` array now contains 8 entries with localized labels. On desktop, 8 dots appear on the right side. Clicking any dot smooth-scrolls to that section.

#### 4. New Component: `FAQItem`

An animated accordion item component:
- Uses `useState` for open/close toggle
- `AnimatePresence` + height animation for smooth expand/collapse
- `motion.span` rotates the ChevronDown icon when open

#### 3. New Section: Features & Benefits (`id="features"`)

- White background with radial gradient top decoration
- 4 feature cards using `features[]` data array
- Each card: icon badge (colored bg), gold accent line (expands on hover), title, description
- `staggerChildren` Framer Motion for sequential card reveal
- Hover: `-translate-y-1` lift + shadow bloom

#### 7. New Section: Stats (`id="stats"`)

- Dark charcoal background (`#1a1714`) with subtle grid texture overlay
- 4 large stat numbers from translation keys: `stat1Value`–`stat4Value`
- Numbers animate in with `scale: 0.9 → 1` + stagger
- CTA button below stats linking to `/ai-room-planner`

#### 4. New Section: Testimonials (`id="testimonials"`)

- Light `#faf9f7` background
- 3 testimonial cards from `testimonials[]` data array
- Each card: 5 gold stars, italic quote in Playfair Display, decorative `"` quotemark, author avatar (initial letter)
- Cards animate in with stagger

#### 5. New Section: Pricing Preview (`id="pricing"`)

- White background
- 4 pricing plan cards from `pricingPlans[]` data array
- Standard plan highlighted with dark charcoal background + "Popular" badge
- All other plans use light gradient background
- CTA button navigates to `/subscription`



### `FE/src/contexts/translations.ts`

Added to **both `vi` and `en`** homepage sections:

**Features keys**: `featuresLabel`, `featuresTitle`, `featuresDesc`, `feature1Title/Desc` through `feature4Title/Desc`

**Stats keys**: `statsLabel`, `statsTitle`, `stat1Value/Label` through `stat4Value/Label`

**Testimonials keys**: `testimonialsLabel`, `testimonialsTitle`, `testimonial1-3 Quote/Author/Role`

**Pricing keys**: `pricingLabel`, `pricingTitle`, `pricingDesc`, `pricingCta`, `pricingFreeName/Price/Desc` through `pricingPremiumName/Price/Desc`

**FAQ keys**: `faqLabel`, `faqTitle`, `faq1Q/A` through `faq5Q/A`

---

## 📱 Responsive Strategy

- **Desktop (≥ 768px)**: Scroll hijacking is active, all 7 sections take up exactly `100vh`, dot navigation (7 dots) is visible on the right, scrollbar is hidden.
- **Mobile (< 768px)**: All scroll-hijacking listeners and dot navigation are bypassed. Sections fall back to `min-h-[100dvh]` and scroll naturally.

---

## 🧪 Verification Results

- **Build Check**: `npm run build` completes successfully with **0 errors**. Vite correctly bundles all 7 sections.
- **Translation Coverage**: All new keys present in both `vi` and `en` locales (verified with `Select-String`).
- **Section IDs**: All 7 section IDs (`hero`, `process`, `features`, `testimonials`, `pricing`, `stats`, `footer`) confirmed present in the compiled output.
- **Scroll Engine**: `sectionsList` contains all 7 IDs; each ChevronDown correctly targets the next section; dot nav has 7 items.
