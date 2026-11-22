# VolleyAtlas 0.5 — Analytics and appearance

Theme switch: light, dark, system. Stored as `volleyatlas:theme` in localStorage. CSS theme tokens enable responsive dark mode.

Added user-facing analytics:
- Match set-points visualisation, attack/service/block breakdown, reception comparisons; only for actual available DataVolley stats.
- Player chart, attack kill percentage (kills/attempts, never average match percentages), serving aces, blocks, reception per attempts.
- Team/league cards and sample-scoped W/L, sets for/against, match breakdown.
- Responsive chart components (Recharts), club logo components with fallback initials, league logo with fallback flags.

Verified DataVolley source: https://lnv.fr/pdf/2026/DataVolley/Men/D1M042-2027.pdf
Tours vs Saint-Nazaire, played 13 Nov 2026. Contains full match and set statistics. The dataset is a curated snapshot and its figures are NOT a full-season ranking.
Source/provenance retained in JSON, match detail action "Otvori zapisnik". Images are optional and may fail due to provider hotlink restrictions; badge fallback remains usable.
Known gaps: no fully automated import, no full-season data for all clubs/players, women's match import pending.
