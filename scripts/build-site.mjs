import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const outDirArgIndex = process.argv.indexOf("--out-dir");
const outDirEqualsArg = process.argv.find((arg) => arg.startsWith("--out-dir="));
const outDirArg = outDirEqualsArg
  ? outDirEqualsArg.slice("--out-dir=".length)
  : outDirArgIndex >= 0 ? process.argv[outDirArgIndex + 1] : process.env.SANJO_BUILD_DIR;
const OUTPUT_DIR = outDirArg ? path.resolve(ROOT, outDirArg) : ROOT;
const DEPLOY_BUILD = OUTPUT_DIR !== ROOT;
const BASE_URL = "https://sanjo.in";
const YEAR = new Date().getFullYear();
const GA_ID = "G-6RXTX63CVY";
const FORM_ACCESS_KEY = "f9c83cdc-a3a4-4441-922b-dced7f52a1cd";

const SITE_CSS = String.raw`
:root {
  --bg: #f5f0e8;
  --bg-alt: #fffaf4;
  --surface: rgba(255, 255, 255, 0.9);
  --surface-strong: #ffffff;
  --text: #16233f;
  --muted: #5e6983;
  --line: rgba(22, 35, 63, 0.1);
  --primary: #1d4f91;
  --secondary: #0e7a72;
  --accent: #c8912b;
  --accent-soft: rgba(200, 145, 43, 0.12);
  --shadow: 0 24px 60px rgba(22, 35, 63, 0.12);
  --shadow-soft: 0 16px 36px rgba(22, 35, 63, 0.08);
  --radius: 26px;
  --radius-lg: 36px;
  --radius-sm: 18px;
  --container: min(1240px, calc(100vw - 32px));
  --font-body: "Manrope", sans-serif;
  --font-display: "Fraunces", serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-gentle: cubic-bezier(0.25, 0.9, 0.3, 1);
  --dur-fast: 180ms;
  --dur-base: 320ms;
  --dur-slow: 620ms;
}

body.page-wami {
  --primary: #1676c4;
  --secondary: #00a88b;
  --accent: #f4a100;
}

body.page-nova {
  --primary: #3357a6;
  --secondary: #6f7ef7;
  --accent: #ff9b42;
}

body.page-lq {
  --primary: #184d79;
  --secondary: #0e7a72;
  --accent: #8f57d9;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(29, 79, 145, 0.12), transparent 28%),
    radial-gradient(circle at 100% 14%, rgba(200, 145, 43, 0.14), transparent 22%),
    linear-gradient(180deg, #fffdf9 0%, #f6f0e8 55%, #fffdf9 100%);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.65;
}

body.nav-open {
  overflow: hidden;
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
summary:focus-visible {
  outline: 3px solid rgba(29, 79, 145, 0.3);
  outline-offset: 4px;
}

h1,
h2,
h3,
h4,
h5,
h6,
p,
ul,
ol {
  margin: 0;
}

ul,
ol {
  padding-left: 1.1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: 16px;
  top: -64px;
  z-index: 200;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  transition: top var(--dur-fast) ease;
}

.skip-link:focus {
  top: 12px;
}

.bg-orb {
  position: fixed;
  z-index: -2;
  width: 420px;
  height: 420px;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.24;
  pointer-events: none;
}

.bg-orb.a {
  top: -120px;
  right: -120px;
  background: rgba(14, 122, 114, 0.5);
}

.bg-orb.b {
  left: -160px;
  bottom: -160px;
  background: rgba(200, 145, 43, 0.36);
}

.site-shell {
  position: relative;
  isolation: isolate;
}

.container {
  width: var(--container);
  margin-inline: auto;
}

.section {
  position: relative;
  padding: 76px 0;
}

.section.tight {
  padding-top: 52px;
  padding-bottom: 52px;
}

.section-header {
  display: grid;
  gap: 14px;
  margin-bottom: 28px;
  max-width: 780px;
}

.section-header.centered {
  margin-inline: auto;
  text-align: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--secondary);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.eyebrow::before {
  content: "";
  width: 42px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--secondary));
}

.section-header h2,
.page-hero h1,
.hero-title,
.cta-band h2,
.quote-panel blockquote,
.story-card h3,
.stat-card strong,
.blog-post-header h2 {
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 40, "WONK" 0;
  line-height: 1.08;
}

.section-header h2,
.page-hero h1 {
  font-size: clamp(2rem, 4vw, 3.55rem);
}

.section-header p,
.page-hero p,
.lede,
.muted {
  color: var(--muted);
}

.hero-section {
  padding: 34px 0 24px;
}

.page-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: clamp(28px, 4vw, 40px);
  background:
    radial-gradient(circle at top right, rgba(200, 145, 43, 0.16), transparent 20%),
    radial-gradient(circle at left center, rgba(14, 122, 114, 0.12), transparent 26%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(243, 248, 255, 0.9));
  box-shadow: var(--shadow);
}

.page-hero::before,
.page-hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.page-hero::before {
  inset: auto auto -90px -90px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(14, 122, 114, 0.18), transparent 68%);
}

.page-hero::after {
  inset: 18px 18px auto auto;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(200, 145, 43, 0.28);
}

.page-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 30px;
  padding: clamp(28px, 4vw, 52px);
  align-items: stretch;
}

.hero-copy {
  display: grid;
  align-content: start;
  gap: 18px;
}

.hero-copy .lede {
  font-size: clamp(1.02rem, 2vw, 1.16rem);
}

.hero-actions,
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.95rem;
  font-weight: 800;
  transition:
    transform var(--dur-fast) ease,
    box-shadow var(--dur-fast) ease,
    background var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.btn:hover,
.btn:focus-visible {
  transform: translateY(-2px);
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  box-shadow: 0 18px 34px rgba(29, 79, 145, 0.22);
}

.btn-secondary {
  color: var(--primary);
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(29, 79, 145, 0.18);
}

.btn-soft {
  color: var(--secondary);
  background: rgba(14, 122, 114, 0.1);
}

.btn-linkish {
  padding-inline: 0;
  border: 0;
  min-height: auto;
  border-radius: 0;
  color: var(--primary);
}

.hero-panel,
.glass-card,
.card,
.stat-card,
.quote-panel,
.cta-band,
.info-panel,
.faq-item,
.timeline-card,
.path-card,
.resource-card,
.gallery-card,
.blog-card,
.audience-card,
.metric-card,
.process-card {
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(16px);
}

.hero-panel {
  display: grid;
  gap: 18px;
  padding: 24px;
  align-content: start;
}

.hero-media {
  overflow: hidden;
  border-radius: calc(var(--radius) - 8px);
  min-height: 260px;
  background:
    linear-gradient(135deg, rgba(29, 79, 145, 0.12), rgba(14, 122, 114, 0.12)),
    #eef3fb;
}

.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-panel-title {
  font-size: 1.35rem;
}

.hero-list,
.bullet-list,
.mini-list {
  display: grid;
  gap: 10px;
  color: var(--muted);
}

.hero-list {
  padding-left: 0;
  list-style: none;
}

.hero-list li,
.bullet-list li,
.mini-list li {
  position: relative;
  padding-left: 18px;
}

.hero-list li::before,
.bullet-list li::before,
.mini-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72rem;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--secondary));
}

.hero-stats,
.stats-grid,
.grid,
.grid-2,
.grid-3,
.grid-4,
.grid-5 {
  display: grid;
  gap: 16px;
}

.hero-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 8px;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.stat-card,
.metric-card,
.process-card,
.path-card,
.audience-card,
.resource-card,
.gallery-card,
.blog-card,
.card,
.timeline-card {
  padding: 22px;
}

.stat-card small,
.metric-card small,
.label {
  display: block;
  color: var(--muted);
  font-size: 0.88rem;
}

.stat-card strong,
.metric-card strong {
  display: block;
  margin-top: 8px;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
}

.icon-badge,
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(22, 35, 63, 0.08);
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.split-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 22px;
  align-items: stretch;
}

.card-grid {
  display: grid;
  gap: 16px;
}

.feature-card,
.program-card,
.framework-card,
.faq-preview-card {
  display: grid;
  gap: 14px;
  padding: 24px;
}

.feature-card h3,
.program-card h3,
.framework-card h3,
.quote-panel blockquote,
.story-card h3,
.faq-preview-card h3,
.resource-card h3,
.gallery-card h3,
.blog-card h3,
.timeline-card h3,
.path-card h3,
.process-card h3,
.audience-card h3,
.card h3 {
  font-size: 1.18rem;
}

.feature-card p,
.program-card p,
.framework-card p,
.resource-card p,
.gallery-card p,
.blog-card p,
.timeline-card p,
.path-card p,
.process-card p,
.audience-card p,
.card p,
.quote-panel p {
  color: var(--muted);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
  font-size: 0.84rem;
  font-weight: 700;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 120;
  border-bottom: 1px solid rgba(22, 35, 63, 0.08);
  background: rgba(255, 251, 244, 0.82);
  backdrop-filter: blur(18px);
}

.site-header.scrolled {
  background: rgba(255, 251, 244, 0.95);
}

.header-inner {
  display: grid;
  gap: 12px;
  padding: 14px 0 16px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-lockup {
  display: grid;
  gap: 4px;
  margin-right: auto;
}

.brand-lockup strong {
  font-family: var(--font-display);
  font-size: 1.32rem;
  line-height: 1;
}

.brand-lockup span {
  color: var(--muted);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.primary-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 18px;
}

.primary-nav a,
.route-strip a,
.drawer-links a,
.footer-links a {
  color: var(--muted);
  transition: color var(--dur-fast) ease;
}

.primary-nav a:hover,
.route-strip a:hover,
.drawer-links a:hover,
.footer-links a:hover,
.primary-nav a.active,
.route-strip a.active,
.drawer-links a.active,
.footer-links a:focus-visible {
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-button {
  display: none;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
}

.menu-button span {
  display: block;
  width: 20px;
  height: 2px;
  margin: 4px auto;
  border-radius: 999px;
  background: var(--text);
}

.route-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.route-strip::-webkit-scrollbar {
  display: none;
}

.route-strip a {
  flex: 0 0 auto;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  background: rgba(255, 255, 255, 0.66);
  font-size: 0.9rem;
  font-weight: 700;
}

.route-strip a.active {
  background: linear-gradient(135deg, rgba(29, 79, 145, 0.14), rgba(14, 122, 114, 0.12));
}

.drawer {
  display: none;
}

.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 18px;
  color: var(--muted);
  font-size: 0.94rem;
}

.breadcrumbs ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  list-style: none;
  padding: 0;
}

.breadcrumbs li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.breadcrumbs li + li::before {
  content: "/";
  color: rgba(94, 105, 131, 0.65);
}

.quote-panel {
  display: grid;
  gap: 14px;
  padding: 26px;
  background:
    radial-gradient(circle at top right, rgba(200, 145, 43, 0.16), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(245, 251, 255, 0.94));
}

.quote-panel blockquote {
  font-size: 1.65rem;
}

.quote-panel cite {
  color: var(--secondary);
  font-style: normal;
  font-weight: 800;
}

.cta-band {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 4vw, 36px);
  background:
    radial-gradient(circle at top right, rgba(200, 145, 43, 0.18), transparent 24%),
    linear-gradient(135deg, rgba(19, 61, 117, 0.96), rgba(14, 122, 114, 0.92));
  color: #fff;
}

.cta-band::after {
  content: "";
  position: absolute;
  right: -26px;
  bottom: -28px;
  width: 140px;
  height: 140px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.cta-band p,
.cta-band .muted {
  color: rgba(255, 255, 255, 0.86);
}

.cta-band .btn-secondary {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.08);
}

.cta-band .btn-soft {
  color: #0f2f58;
  background: #fff3da;
}

.faq-list {
  display: grid;
  gap: 14px;
}

.faq-item {
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  font-weight: 800;
}

.faq-question span:last-child {
  font-size: 1.2rem;
  color: var(--secondary);
}

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--dur-base) var(--ease), padding-bottom var(--dur-base) var(--ease);
  padding: 0 22px;
}

.faq-answer-inner {
  min-height: 0;
  overflow: hidden;
  color: var(--muted);
}

.faq-item.open .faq-answer {
  grid-template-rows: 1fr;
  padding-bottom: 20px;
}

.faq-item.open .faq-question span:last-child {
  transform: rotate(45deg);
}

.form-shell {
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
}

.form-card,
.contact-card {
  padding: 24px;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 8px;
}

.field label {
  font-size: 0.92rem;
  font-weight: 800;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(22, 35, 63, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text);
}

.field textarea {
  min-height: 150px;
  resize: vertical;
}

.notice {
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(200, 145, 43, 0.24);
  background: rgba(255, 250, 240, 0.84);
  color: #6b5731;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.gallery-card {
  overflow: hidden;
  padding: 0;
  cursor: pointer;
}

.gallery-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery-card-content {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.gallery-lightbox {
  position: fixed;
  inset: 0;
  z-index: 160;
  display: none;
  place-items: center;
  padding: 24px;
  background: rgba(9, 16, 29, 0.78);
}

.gallery-lightbox.open {
  display: grid;
}

.gallery-lightbox-inner {
  position: relative;
  max-width: min(1100px, 92vw);
  width: 100%;
}

.gallery-lightbox img {
  width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 24px;
}

.gallery-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 1.3rem;
  font-weight: 800;
}

.blog-card img,
.story-image,
.resource-image {
  border-radius: calc(var(--radius) - 8px);
  object-fit: cover;
}

.blog-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  margin-bottom: 14px;
}

.blog-controls,
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.blog-controls {
  margin-bottom: 28px;
}

.blog-controls input {
  min-width: min(100%, 320px);
  flex: 1 1 280px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 13px 18px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}

.filter-chip {
  border: 1px solid rgba(29, 79, 145, 0.14);
  border-radius: 999px;
  padding: 9px 13px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--muted);
  cursor: pointer;
  font-weight: 800;
}

.filter-chip.active,
.filter-chip:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.blog-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
  margin-bottom: 30px;
}

.featured-blog-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
  gap: 22px;
}

.blog-card-featured img {
  aspect-ratio: 16 / 8;
}

.blog-lanes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.mini-section,
.blog-sidebar {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-soft);
}

.mini-section h3,
.blog-sidebar h3,
.blog-results-header h3 {
  font-family: var(--font-display);
  line-height: 1.1;
}

.mini-post-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.mini-post {
  display: grid;
  gap: 3px;
  border-radius: 16px;
  padding: 12px;
  background: rgba(245, 240, 232, 0.72);
}

.mini-post span {
  color: var(--secondary);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.blog-results-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin: 24px 0 18px;
}

.article-content {
  display: grid;
  gap: 16px;
}

.article-content h2,
.article-content h3 {
  font-family: var(--font-display);
  line-height: 1.12;
  margin-top: 10px;
}

.article-content ul,
.article-content ol {
  display: grid;
  gap: 8px;
}

.article-content a {
  color: var(--primary);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.source-note {
  border-top: 1px solid var(--line);
  padding-top: 14px;
}

.shop-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 24px;
  align-items: stretch;
}

.store-grid {
  display: grid;
  gap: 16px;
}

.store-card {
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 18px;
  background: rgba(245, 240, 232, 0.72);
}

.store-card h3 {
  margin-bottom: 12px;
  font-family: var(--font-display);
}

.inline-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  color: var(--primary);
  font-weight: 700;
}

.story-layout {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
}

.story-card {
  padding: 28px;
}

.stack {
  display: grid;
  gap: 16px;
}

.comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.comparison .card {
  padding: 22px;
}

.timeline {
  display: grid;
  gap: 14px;
}

.timeline-card {
  position: relative;
  padding-left: 28px;
}

.timeline-card::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 26px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
}

.list-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.footer {
  padding: 30px 0 42px;
}

.footer-shell {
  display: grid;
  gap: 22px;
  padding: 28px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(243, 248, 255, 0.92));
  box-shadow: var(--shadow);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.footer-column {
  display: grid;
  gap: 12px;
}

.footer-column h3 {
  font-size: 0.98rem;
}

.footer-links {
  display: grid;
  gap: 8px;
}

.footer-note,
.footer-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(22, 35, 63, 0.08);
  color: var(--muted);
  font-size: 0.92rem;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  background: rgba(255, 255, 255, 0.82);
}

.reveal {
  opacity: 1;
  transform: none;
}

.js-motion .reveal {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity var(--dur-slow) var(--ease),
    transform var(--dur-slow) var(--ease);
}

.js-motion .reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-animated .hero-copy > * {
  opacity: 0;
  transform: translateY(16px);
  animation: heroRise 660ms var(--ease) forwards;
}

.hero-animated .hero-copy > *:nth-child(1) { animation-delay: 80ms; }
.hero-animated .hero-copy > *:nth-child(2) { animation-delay: 150ms; }
.hero-animated .hero-copy > *:nth-child(3) { animation-delay: 230ms; }
.hero-animated .hero-copy > *:nth-child(4) { animation-delay: 310ms; }
.hero-animated .hero-copy > *:nth-child(5) { animation-delay: 390ms; }
.hero-animated .hero-copy > *:nth-child(6) { animation-delay: 470ms; }

@keyframes heroRise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-cue {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 700;
}

.scroll-cue::before {
  content: "";
  width: 20px;
  height: 34px;
  border: 2px solid rgba(22, 35, 63, 0.16);
  border-radius: 999px;
  background:
    linear-gradient(180deg, transparent 0%, transparent 38%, rgba(29, 79, 145, 0.2) 38%, rgba(29, 79, 145, 0.2) 58%, transparent 58%);
}

.article-layout {
  display: grid;
  gap: 24px;
}

.article-layout .section {
  padding: 46px 0;
}

.blog-post-header {
  display: grid;
  gap: 16px;
  max-width: 820px;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(22, 35, 63, 0), rgba(22, 35, 63, 0.14), rgba(22, 35, 63, 0));
}

:root {
  --color-navy: #142643;
  --color-teal: #1d7a74;
  --color-emerald: #16846c;
  --color-cream: #fbf6ee;
  --color-soft-blue: #e6f0fb;
  --color-gold: #ba8a31;
  --color-text: #16233f;
  --color-muted: #5e6983;
  --color-border: rgba(22, 35, 63, 0.1);
  --shadow-card: 0 20px 42px rgba(20, 38, 67, 0.1);
  --radius-card: 22px;
  --radius-section: 32px;
  --container: min(1120px, calc(100vw - 32px));
}

body {
  background:
    radial-gradient(circle at top left, rgba(29, 79, 145, 0.1), transparent 24%),
    radial-gradient(circle at 100% 8%, rgba(186, 138, 49, 0.12), transparent 20%),
    linear-gradient(180deg, #fffdf9 0%, #f8f3eb 52%, #fffdf9 100%);
}

.section {
  padding: clamp(4.5rem, 6vw, 5.5rem) 0;
}

.section.tight {
  padding-top: clamp(3.25rem, 4vw, 4rem);
  padding-bottom: clamp(3.25rem, 4vw, 4rem);
}

.section-header {
  gap: 12px;
  margin-bottom: 22px;
  max-width: 720px;
}

.section-header h2,
.page-hero h1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
}

.section-header p,
.lede,
.muted,
.page-hero p,
.feature-card p,
.program-card p,
.framework-card p,
.card p,
.story-card p,
.timeline-card p,
.path-card p,
.resource-card p,
.blog-card p,
.gallery-card p,
.audience-card p,
.metric-card p {
  font-size: 1rem;
  line-height: 1.72;
}

.hero-section {
  padding: 18px 0 10px;
}

.page-hero {
  border-radius: clamp(24px, 4vw, 34px);
}

.page-hero-grid {
  gap: 22px;
  padding: clamp(24px, 3.5vw, 40px);
}

.hero-copy {
  gap: 14px;
}

.hero-title {
  letter-spacing: -0.03em;
}

.hero-actions,
.button-row {
  gap: 10px;
}

.hero-stats {
  gap: 12px;
  margin-top: 10px;
}

.hero-panel,
.card,
.feature-card,
.program-card,
.framework-card,
.faq-preview-card,
.timeline-card,
.path-card,
.resource-card,
.gallery-card,
.blog-card,
.audience-card,
.metric-card,
.process-card,
.story-card,
.form-card,
.contact-card {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.card,
.feature-card,
.program-card,
.framework-card,
.faq-preview-card,
.timeline-card,
.path-card,
.resource-card,
.gallery-card,
.blog-card,
.audience-card,
.metric-card,
.process-card,
.story-card {
  position: relative;
  overflow: hidden;
}

.card::before,
.feature-card::before,
.program-card::before,
.framework-card::before,
.faq-preview-card::before,
.timeline-card::before,
.path-card::before,
.resource-card::before,
.blog-card::before,
.audience-card::before,
.metric-card::before,
.process-card::before {
  content: "";
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, rgba(29, 79, 145, 0.92), rgba(14, 122, 114, 0.74), rgba(186, 138, 49, 0.6));
  opacity: 0.82;
}

.card:hover,
.feature-card:hover,
.program-card:hover,
.framework-card:hover,
.faq-preview-card:hover,
.timeline-card:hover,
.path-card:hover,
.resource-card:hover,
.blog-card:hover,
.audience-card:hover,
.metric-card:hover,
.process-card:hover,
.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 52px rgba(20, 38, 67, 0.14);
}

.site-header {
  background: rgba(255, 251, 244, 0.72);
}

.header-inner {
  padding: 10px 0 12px;
}

.header-row {
  gap: 12px;
}

.brand-lockup strong {
  font-size: 1.2rem;
}

.brand-lockup span {
  font-size: 0.72rem;
}

.primary-nav {
  gap: 8px 12px;
}

.primary-nav > a,
.nav-group-summary {
  position: relative;
  padding: 8px 10px;
  border-radius: 999px;
  color: var(--color-muted);
  font-size: 0.92rem;
  font-weight: 700;
}

.primary-nav > a.active,
.nav-group.active > .nav-group-summary {
  color: var(--primary);
  background: rgba(29, 79, 145, 0.08);
}

.primary-nav > a.active::after,
.nav-group.active > .nav-group-summary::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -6px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
}

.nav-group {
  position: relative;
}

.nav-group summary {
  list-style: none;
  cursor: pointer;
}

.nav-group summary::-webkit-details-marker {
  display: none;
}

.nav-group-summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.nav-group-summary a {
  color: inherit;
}

.nav-group-summary span:last-child {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 800;
}

.nav-submenu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  min-width: 250px;
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 54px rgba(20, 38, 67, 0.14);
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition: opacity var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.nav-group[open] .nav-submenu,
.nav-group:hover .nav-submenu,
.nav-group:focus-within .nav-submenu {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.nav-submenu a {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(248, 243, 235, 0.84);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
}

.nav-submenu a:hover,
.nav-submenu a:focus-visible {
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
}

.route-strip {
  display: none !important;
}

.drawer {
  inset: 76px 16px auto 16px;
}

.drawer-links {
  grid-template-columns: 1fr;
}

.drawer-links a {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
}

.footer {
  padding: 18px 0 28px;
}

.footer-shell {
  gap: 18px;
  padding: 22px;
  border-radius: 28px;
}

.footer-cta-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 20px;
  border: 1px solid rgba(22, 35, 63, 0.06);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(19, 61, 117, 0.96), rgba(14, 122, 114, 0.9));
  color: #fff;
}

.footer-cta-band h2 {
  font-size: clamp(1.3rem, 2.6vw, 1.85rem);
}

.footer-cta-band p {
  color: rgba(255, 255, 255, 0.84);
}

.footer-grid {
  grid-template-columns: 1.15fr repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.footer-column {
  gap: 10px;
}

.footer-column h3 {
  font-size: 0.94rem;
}

.footer-links {
  gap: 7px;
}

.footer-links a,
.footer-column p,
.footer-meta {
  font-size: 0.9rem;
}

.footer-meta {
  padding-top: 12px;
}

.gallery-grid {
  gap: 14px;
}

.form-shell {
  gap: 18px;
}

.field input,
.field select,
.field textarea {
  transition: border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease, background var(--dur-fast) ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(29, 79, 145, 0.34);
  box-shadow: 0 0 0 4px rgba(29, 79, 145, 0.08);
  background: #fff;
}

.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 50%, transparent 78%);
  transform: translateX(-120%);
  transition: transform 520ms var(--ease);
}

.btn-primary:hover::after,
.btn-primary:focus-visible::after {
  transform: translateX(120%);
}

.page-wami .page-hero {
  background:
    radial-gradient(circle at top right, rgba(244, 161, 0, 0.2), transparent 22%),
    radial-gradient(circle at 14% 22%, rgba(0, 168, 139, 0.16), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(234, 247, 255, 0.94));
}

.page-wami .page-hero::after {
  display: none;
}

.wami-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wami-star {
  position: absolute;
  width: 16px;
  height: 16px;
  clip-path: polygon(50% 0%, 61% 36%, 100% 36%, 68% 57%, 79% 100%, 50% 72%, 21% 100%, 32% 57%, 0% 36%, 39% 36%);
  background: linear-gradient(135deg, #ffd85c, #f4a100);
  opacity: 0.92;
}

.wami-star.alt {
  background: linear-gradient(135deg, #4ec4ff, #00a88b);
}

.wami-star:nth-child(1) { top: 10%; left: 8%; }
.wami-star:nth-child(2) { top: 18%; right: 12%; transform: scale(0.72); }
.wami-star:nth-child(3) { bottom: 18%; left: 12%; transform: scale(0.86); }
.wami-star:nth-child(4) { bottom: 14%; right: 18%; transform: scale(0.64); }
.wami-star:nth-child(5) { top: 42%; left: 5%; transform: scale(0.58); }
.wami-star:nth-child(6) { top: 52%; right: 7%; transform: scale(0.76); }
.wami-star:nth-child(7) { top: 8%; left: 48%; transform: scale(0.52); }
.wami-star:nth-child(8) { bottom: 32%; right: 36%; transform: scale(0.62); }
.wami-star:nth-child(9) { top: 66%; left: 28%; transform: scale(0.5); }
.wami-star:nth-child(10) { top: 28%; right: 32%; transform: scale(0.56); }

.page-wami .hero-panel .hero-media {
  display: grid;
  place-items: center;
  padding: 18px;
  background: radial-gradient(circle at top, rgba(255, 216, 92, 0.42), transparent 28%), rgba(255, 255, 255, 0.88);
}

.page-wami .hero-panel .hero-media img {
  object-fit: contain;
}

.floating-mascot {
  animation: softFloat 5.8s ease-in-out infinite;
}

.chip-cloud .chip {
  animation: chipRise 640ms var(--ease) both;
}

.chip-cloud .chip:nth-child(2) { animation-delay: 60ms; }
.chip-cloud .chip:nth-child(3) { animation-delay: 120ms; }
.chip-cloud .chip:nth-child(4) { animation-delay: 180ms; }
.chip-cloud .chip:nth-child(5) { animation-delay: 240ms; }
.chip-cloud .chip:nth-child(6) { animation-delay: 300ms; }
.chip-cloud .chip:nth-child(7) { animation-delay: 360ms; }
.chip-cloud .chip:nth-child(8) { animation-delay: 420ms; }

.timeline-steps,
.nova-stages {
  display: grid;
  gap: 14px;
}

.timeline-step,
.nova-stage {
  position: relative;
  padding: 20px 20px 20px 74px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: var(--shadow-card);
}

.timeline-step::before,
.nova-stage::before {
  content: attr(data-step);
  position: absolute;
  left: 18px;
  top: 18px;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff;
  font-weight: 800;
}

.page-nova .nova-stage {
  overflow: hidden;
}

.page-nova .nova-stage::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(111, 126, 247, 0.95), rgba(14, 122, 114, 0.85));
}

.page-lq .dimension-card:nth-child(1) { --dimension-accent: #2a6fd1; }
.page-lq .dimension-card:nth-child(2) { --dimension-accent: #c45c43; }
.page-lq .dimension-card:nth-child(3) { --dimension-accent: #16846c; }
.page-lq .dimension-card:nth-child(4) { --dimension-accent: #7f56d9; }
.page-lq .dimension-card:nth-child(5) { --dimension-accent: #c8912b; }

.dimension-card {
  border-top: 4px solid var(--dimension-accent, var(--primary));
}

.dimension-card .meta-pill {
  color: var(--dimension-accent, var(--primary));
  background: color-mix(in srgb, var(--dimension-accent, var(--primary)) 10%, white);
}

.site-header {
  min-height: 78px;
  background: rgba(255, 251, 244, 0.88);
  border-bottom: 1px solid rgba(20, 38, 67, 0.1);
  box-shadow: 0 10px 28px rgba(20, 38, 67, 0.045);
}

.site-header.scrolled {
  background: rgba(255, 251, 244, 0.96);
  box-shadow: 0 14px 34px rgba(20, 38, 67, 0.08);
}

.site-header .container,
.footer .container {
  width: min(1180px, calc(100vw - 48px));
}

.header-inner {
  display: flex;
  align-items: center;
  min-height: 78px;
  padding: 0;
}

.header-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.brand-lockup {
  flex: 0 0 184px;
  gap: 5px;
  margin-right: 0;
}

.brand-lockup strong {
  color: var(--color-navy);
  font-size: 1.22rem;
  line-height: 1.02;
  white-space: nowrap;
}

.brand-lockup span {
  color: rgba(94, 105, 131, 0.9);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.15;
}

.primary-nav {
  flex: 1 1 auto;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 20px;
  min-width: 0;
}

.primary-nav > a,
.nav-group-summary {
  position: relative;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(22, 35, 63, 0.74);
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.primary-nav > a::after,
.nav-group-summary::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0;
  transform: scaleX(0.45);
  transform-origin: center;
  transition: opacity var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.primary-nav > a:hover,
.primary-nav > a:focus-visible,
.nav-group-summary:hover,
.nav-group:focus-within .nav-group-summary,
.primary-nav > a.active,
.nav-group.active > .nav-group-summary {
  color: var(--color-navy);
  background: transparent;
}

.primary-nav > a:hover::after,
.primary-nav > a:focus-visible::after,
.nav-group-summary:hover::after,
.nav-group:focus-within .nav-group-summary::after,
.primary-nav > a.active::after,
.nav-group.active > .nav-group-summary::after {
  opacity: 1;
  transform: scaleX(1);
}

.nav-group {
  position: relative;
}

.nav-group-summary {
  cursor: pointer;
}

.nav-chevron {
  width: 15px;
  height: 15px;
  color: var(--secondary);
  transition: transform var(--dur-fast) ease;
}

.nav-group[open] .nav-chevron,
.nav-group:hover .nav-chevron,
.nav-group:focus-within .nav-chevron {
  transform: rotate(180deg);
}

.nav-group-summary span:last-child {
  display: contents;
  width: auto;
  height: auto;
  background: transparent;
}

.nav-submenu {
  top: calc(100% + 14px);
  left: 50%;
  min-width: 270px;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(20, 38, 67, 0.1);
  border-radius: 18px;
  background: rgba(255, 253, 249, 0.98);
  box-shadow: 0 24px 50px rgba(20, 38, 67, 0.15);
  transform: translate(-50%, 8px);
  backdrop-filter: blur(18px);
}

.nav-group[open] .nav-submenu,
.nav-group:hover .nav-submenu,
.nav-group:focus-within .nav-submenu {
  transform: translate(-50%, 0);
}

.nav-submenu-link {
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  color: var(--color-navy);
  font-size: 0.88rem;
  font-weight: 800;
}

.nav-submenu-link small {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.35;
}

.nav-submenu-link:hover,
.nav-submenu-link:focus-visible,
.nav-submenu-link[aria-current="page"] {
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
}

.header-actions {
  flex: 0 0 auto;
  gap: 8px;
}

.header-actions .btn {
  min-height: 44px;
  padding: 10px 15px;
  font-size: 0.82rem;
  box-shadow: none;
}

.header-actions .btn-primary {
  box-shadow: 0 12px 24px rgba(29, 79, 145, 0.18);
}

.header-actions .btn-secondary {
  color: var(--color-navy);
  background: rgba(255, 255, 255, 0.74);
  border-color: rgba(20, 38, 67, 0.14);
}

.menu-button {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.drawer {
  inset: 86px 24px auto 24px;
}

.drawer-links {
  display: grid;
  gap: 8px;
}

.drawer-group {
  display: grid;
  gap: 7px;
  padding: 8px;
  border: 1px solid rgba(20, 38, 67, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.66);
}

.drawer-subnav {
  display: grid;
  gap: 6px;
  padding-left: 10px;
}

.drawer-subnav a {
  font-size: 0.92rem;
}

.footer {
  padding: 24px 0 34px;
}

.footer-shell {
  gap: 20px;
  padding: 30px;
  border: 1px solid rgba(20, 38, 67, 0.1);
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255, 253, 249, 0.98), rgba(239, 247, 252, 0.92));
  box-shadow: 0 22px 54px rgba(20, 38, 67, 0.1);
}

.footer-cta-band {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 22px;
  padding: 20px 22px;
  border: 0;
  border-radius: 22px;
  background: linear-gradient(135deg, #123b6d, #0f766e);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.footer-cta-band .stack {
  gap: 7px;
}

.footer-cta-band h2 {
  color: #fff;
  font-size: clamp(1.18rem, 2vw, 1.55rem);
  line-height: 1.14;
}

.footer-cta-band p {
  max-width: 720px;
  color: rgba(238, 247, 255, 0.9);
  font-size: 0.92rem;
  line-height: 1.55;
}

.footer-cta-band .button-row {
  flex-wrap: nowrap;
}

.footer-cta-primary,
.footer-cta-secondary {
  min-height: 44px;
  padding: 10px 16px;
  font-size: 0.86rem;
}

.footer-cta-primary {
  color: #123b6d;
  background: #fff7e8;
  border-color: rgba(255, 255, 255, 0.6);
}

.footer-cta-secondary {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.42);
}

.footer-grid {
  grid-template-columns: minmax(220px, 1.2fr) repeat(4, minmax(130px, 1fr));
  gap: 20px;
  align-items: start;
}

.footer-column {
  gap: 10px;
  align-content: start;
}

.footer-column h3 {
  color: var(--color-navy);
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.2;
}

.footer-column p {
  max-width: 280px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-links {
  gap: 7px;
}

.footer-links a {
  width: fit-content;
  color: rgba(94, 105, 131, 0.98);
  font-size: 0.88rem;
  line-height: 1.45;
  transition: color var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.footer-links a:hover,
.footer-links a:focus-visible {
  color: var(--secondary);
  transform: translateX(2px);
}

.social-links a {
  width: 36px;
  height: 36px;
  color: var(--color-navy);
  font-size: 0.78rem;
  font-weight: 900;
  border-color: rgba(20, 38, 67, 0.12);
  background: rgba(255, 255, 255, 0.74);
  transition: background var(--dur-fast) ease, color var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.social-links a:hover,
.social-links a:focus-visible {
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  transform: translateY(-2px);
}

.footer-meta {
  align-items: center;
  gap: 14px;
  padding-top: 16px;
  color: rgba(94, 105, 131, 0.95);
  font-size: 0.82rem;
  line-height: 1.55;
}

.footer-meta a:hover,
.footer-meta a:focus-visible {
  color: var(--secondary);
}

/* Global polish pass: stable header, tighter rhythm, reusable decorations, and cleaner reading layouts. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 140;
  overflow: visible;
  min-height: 76px;
}

.site-header .container {
  width: min(1240px, calc(100vw - 48px));
  margin-inline: auto;
}

.header-inner {
  min-height: 76px;
}

.header-row {
  display: grid;
  grid-template-columns: minmax(190px, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.brand-lockup {
  min-width: 190px;
  max-width: 230px;
}

.primary-nav {
  min-width: 0;
  justify-content: center;
  gap: clamp(14px, 1.55vw, 22px);
}

.primary-nav > a,
.nav-group-summary {
  min-height: 40px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

.header-actions {
  min-width: 0;
  gap: 8px;
}

.header-actions .btn {
  min-height: 40px;
  max-height: 42px;
  padding: 9px 13px;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
}

.header-actions .btn-secondary {
  max-width: 174px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-submenu {
  z-index: 180;
  overflow: visible;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 253, 248, 0.98);
}

.nav-submenu-link {
  padding: 11px 12px;
}

.hero-section {
  padding: clamp(24px, 3vw, 38px) 0 16px;
}

.section {
  padding: clamp(3.5rem, 5vw, 4.5rem) 0;
}

.section.tight {
  padding-top: clamp(2.75rem, 4vw, 3.5rem);
  padding-bottom: clamp(2.75rem, 4vw, 3.5rem);
}

.page-hero {
  overflow: hidden;
}

.page-hero-grid {
  position: relative;
  padding: clamp(28px, 4vw, 52px);
}

.page-hero::before {
  width: 210px;
  height: 210px;
  border: 1px solid rgba(200, 145, 43, 0.24);
  background: radial-gradient(circle, rgba(200, 145, 43, 0.1), transparent 62%);
}

.page-hero::after {
  width: 120px;
  height: 120px;
  border: 1px solid rgba(14, 122, 114, 0.24);
  background: radial-gradient(circle, rgba(14, 122, 114, 0.09), transparent 66%);
}

.section::before,
.cta-band::before,
.story-card::after,
.quote-panel::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.section::before {
  right: max(18px, calc((100vw - 1240px) / 2));
  top: 26px;
  width: 72px;
  height: 72px;
  border: 1px solid rgba(200, 145, 43, 0.16);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 60%);
  opacity: 0.7;
  z-index: -1;
}

.cta-band {
  position: relative;
  overflow: hidden;
}

.cta-band::before {
  right: 28px;
  top: 24px;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(255, 255, 255, 0.34);
}

.story-card,
.quote-panel,
.feature-card,
.program-card,
.framework-card,
.card,
.blog-card {
  position: relative;
}

.story-card::after,
.quote-panel::after {
  right: 18px;
  top: 16px;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(14, 122, 114, 0.12);
  opacity: 0.65;
}

.bullet-list {
  list-style: none;
  padding-left: 0;
}

.article-content ul,
.article-content ol {
  padding-left: 1.25rem;
}

.article-content .bullet-list {
  padding-left: 0;
}

.page-wami .hero-section {
  padding-top: 24px;
}

.page-wami .page-hero {
  min-height: 0;
}

.page-wami .page-hero-grid {
  align-items: center;
  padding: clamp(30px, 5vw, 64px);
}

.page-wami .hero-panel {
  align-self: center;
  min-height: 0;
}

.page-wami .hero-panel .hero-media {
  min-height: 0;
}

.page-wami .hero-panel .hero-media img,
.page-wami .floating-mascot {
  max-height: 320px;
  width: auto;
  margin-inline: auto;
  object-fit: contain;
}

.page-wami .framework-card,
.page-wami .card {
  border-top: 4px solid rgba(244, 161, 0, 0.72);
}

.blog-hub {
  position: relative;
}

.blog-controls {
  align-items: stretch;
}

.blog-controls input {
  min-height: 48px;
}

.filter-chip,
.tag-filter,
.clear-filters {
  transition: transform var(--dur-fast) ease, background var(--dur-fast) ease, color var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.filter-chip.active,
.tag-filter.active {
  box-shadow: 0 12px 26px rgba(29, 79, 145, 0.18);
}

.clear-filters {
  border: 1px solid rgba(20, 38, 67, 0.14);
  border-radius: 999px;
  padding: 9px 13px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--primary);
  cursor: pointer;
  font-weight: 800;
}

.blog-layout {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
}

.mini-post {
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
}

.mini-post img {
  width: 76px;
  height: 68px;
  border-radius: 14px;
  object-fit: cover;
}

.mini-post-body {
  display: grid;
  gap: 4px;
}

.blog-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tag-filter,
.blog-tag-link {
  border: 1px solid rgba(14, 122, 114, 0.15);
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(14, 122, 114, 0.08);
  color: var(--secondary);
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.blog-card[hidden] {
  display: none;
}

.blog-count-line {
  margin-top: 8px;
}

.article-layout {
  grid-template-columns: minmax(0, 820px) minmax(260px, 340px);
  align-items: start;
}

.article-content {
  max-width: 820px;
  font-size: clamp(1.02rem, 1vw, 1.1rem);
  line-height: 1.75;
}

.article-content p {
  color: var(--muted);
}

.article-side-card {
  position: sticky;
  top: 104px;
}

.related-posts {
  margin-top: 28px;
}

.share-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.share-row a,
.share-row button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 11px;
  background: rgba(255, 255, 255, 0.78);
  color: var(--primary);
  font-weight: 800;
  cursor: pointer;
}

.decor-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.decor-ring,
.decor-dot,
.floating-icon {
  position: absolute;
  display: block;
  border-radius: 999px;
  pointer-events: none;
}

.decor-ring {
  border: 1px solid rgba(14, 122, 114, 0.22);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.36), transparent 62%);
  animation: ringFloat 7s ease-in-out infinite;
}

.decor-ring.ring-a {
  width: 118px;
  height: 118px;
  right: 7%;
  top: 14%;
}

.decor-ring.ring-b {
  width: 72px;
  height: 72px;
  left: 7%;
  bottom: 13%;
  border-color: rgba(200, 145, 43, 0.25);
  animation-delay: -1.8s;
}

.decor-ring.ring-c {
  width: 44px;
  height: 44px;
  right: 33%;
  bottom: 10%;
  border-color: rgba(29, 79, 145, 0.2);
  animation-delay: -3s;
}

.decor-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, rgba(200, 145, 43, 0.88), rgba(14, 122, 114, 0.74));
  box-shadow: 0 0 0 8px rgba(14, 122, 114, 0.06);
  animation: softFloat 5.5s ease-in-out infinite;
}

.decor-dot.dot-a {
  left: 18%;
  top: 17%;
}

.decor-dot.dot-b {
  right: 18%;
  bottom: 18%;
  animation-delay: -2s;
}

.floating-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(22, 35, 63, 0.08);
  background: rgba(255, 255, 255, 0.74);
  color: var(--primary);
  box-shadow: 0 16px 34px rgba(20, 38, 67, 0.12);
  animation: softFloat 6.5s ease-in-out infinite;
}

.floating-icon svg,
.icon-mark svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.floating-icon.icon-a {
  right: 18%;
  top: 20%;
}

.floating-icon.icon-b {
  left: 18%;
  bottom: 18%;
  animation-delay: -2.4s;
}

.page-hero > *:not(.decor-field),
.cta-band > *,
.section-ornate > .container {
  position: relative;
  z-index: 1;
}

.page-home {
  background:
    radial-gradient(circle at 18% 6%, rgba(31, 121, 116, 0.16), transparent 24%),
    radial-gradient(circle at 82% 12%, rgba(200, 145, 43, 0.16), transparent 22%),
    radial-gradient(circle at 44% 36%, rgba(29, 79, 145, 0.1), transparent 26%),
    linear-gradient(180deg, #fffdf9 0%, #f3f8fb 38%, #fbf3e8 70%, #fffdf9 100%);
}

.page-home .site-shell {
  overflow: clip;
}

.page-home .section {
  isolation: isolate;
}

.page-home .home-hero {
  background:
    radial-gradient(circle at 82% 18%, rgba(200, 145, 43, 0.22), transparent 25%),
    radial-gradient(circle at 12% 80%, rgba(14, 122, 114, 0.22), transparent 27%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(231, 244, 249, 0.94) 48%, rgba(255, 246, 228, 0.9));
}

.page-home .home-hero .page-hero-grid {
  grid-template-columns: minmax(0, 1.12fr) minmax(300px, 0.88fr);
  align-items: center;
}

.founder-badge {
  display: inline-grid;
  gap: 3px;
  width: fit-content;
  padding: 11px 14px;
  border: 1px solid rgba(200, 145, 43, 0.22);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 249, 236, 0.92), rgba(235, 249, 247, 0.88));
  color: var(--text);
  font-weight: 800;
  box-shadow: 0 16px 32px rgba(20, 38, 67, 0.08);
}

.founder-badge small {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.hero-panel {
  position: relative;
}

.hero-panel::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: calc(var(--radius-card) - 8px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.hero-media,
.story-image,
.blog-card-media {
  background:
    radial-gradient(circle at top left, rgba(14, 122, 114, 0.18), transparent 44%),
    linear-gradient(135deg, #e9f4fb, #fff4da);
}

.icon-mark {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(14, 122, 114, 0.16);
  border-radius: 15px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(233, 247, 245, 0.82));
  color: var(--secondary);
  box-shadow: 0 14px 30px rgba(20, 38, 67, 0.08);
}

.home-identity-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
  gap: 24px;
  align-items: center;
}

.identity-copy {
  display: grid;
  gap: 18px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.role-chip {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 16px 32px rgba(20, 38, 67, 0.08);
}

.role-chip strong {
  font-size: 0.96rem;
  line-height: 1.25;
}

.role-grid .role-chip {
  animation: chipRise 680ms var(--ease) both;
}

.role-grid .role-chip:nth-child(2) { animation-delay: 80ms; }
.role-grid .role-chip:nth-child(3) { animation-delay: 160ms; }
.role-grid .role-chip:nth-child(4) { animation-delay: 240ms; }
.role-grid .role-chip:nth-child(5) { animation-delay: 320ms; }
.role-grid .role-chip:nth-child(6) { animation-delay: 400ms; }

.feature-card,
.program-card,
.path-card,
.metric-card {
  display: grid;
  align-content: start;
  gap: 14px;
}

.program-card {
  min-height: 100%;
}

.program-card .button-row,
.blog-card .button-row {
  margin-top: auto;
}

.program-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.program-badge,
.category-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.outcome-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.outcome-chips span {
  display: inline-flex;
  align-items: center;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(14, 122, 114, 0.08);
  color: var(--secondary);
  font-size: 0.76rem;
  font-weight: 800;
}

.program-card-inspire::before,
.program-card-exam-stress::before {
  background: linear-gradient(90deg, #1d4f91, #23a6a1, #d8a130);
}

.program-card-empower-to-empowerment::before {
  background: linear-gradient(90deg, #184d79, #bd5c8a, #c8912b);
}

.program-card-c3::before {
  background: linear-gradient(90deg, #1d4f91, #0e7a72, #7f56d9);
}

.program-card-parenting-with-passion::before {
  background: linear-gradient(90deg, #0e7a72, #5aa67d, #c8912b);
}

.program-card-personal-effectiveness-mentorship::before,
.program-card-corporate-excellence::before {
  background: linear-gradient(90deg, #142643, #1d4f91, #0e7a72);
}

.waymaker-bridge {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 3.8vw, 34px);
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 30px;
  background:
    radial-gradient(circle at 10% 20%, rgba(200, 145, 43, 0.16), transparent 28%),
    radial-gradient(circle at 92% 70%, rgba(14, 122, 114, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(235, 247, 249, 0.9));
  box-shadow: var(--shadow-card);
}

.waymaker-bridge::after {
  content: "";
  position: absolute;
  inset: 24px 12% auto 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(14, 122, 114, 0.34), rgba(200, 145, 43, 0.28), transparent);
}

.book-showcase {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 4vw, 38px);
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 30px;
  background:
    radial-gradient(circle at 78% 50%, rgba(200, 145, 43, 0.22), transparent 22%),
    linear-gradient(135deg, rgba(20, 38, 67, 0.96), rgba(14, 122, 114, 0.92));
  color: #fff;
  box-shadow: 0 30px 70px rgba(20, 38, 67, 0.18);
}

.book-showcase .muted,
.book-showcase p {
  color: rgba(255, 255, 255, 0.84);
}

.book-showcase .section-header h2,
.book-showcase .section-header p,
.book-showcase .eyebrow {
  color: #fff;
}

.book-showcase .section-header {
  margin-bottom: 16px;
}

.book-cover-wrap {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 330px;
}

.book-cover-wrap::before {
  content: "";
  position: absolute;
  width: min(78%, 320px);
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 62%);
  animation: ringFloat 8s ease-in-out infinite;
}

.book-cover-wrap img {
  position: relative;
  z-index: 1;
  width: min(260px, 72vw);
  max-height: 360px;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 28px 58px rgba(0, 0, 0, 0.28);
}

.blog-library-hero {
  background:
    radial-gradient(circle at 14% 72%, rgba(14, 122, 114, 0.18), transparent 26%),
    radial-gradient(circle at 86% 18%, rgba(200, 145, 43, 0.18), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(234, 246, 251, 0.93));
}

.blog-search-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-card);
}

.blog-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  border: 1px solid rgba(22, 35, 63, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.blog-search-icon {
  width: 46px;
  flex: 0 0 46px;
  display: inline-flex;
  justify-content: center;
  color: var(--secondary);
}

.blog-search-wrap input {
  min-width: 0;
  width: 100%;
  flex: 1;
  border: 0;
  box-shadow: none;
  background: transparent;
  padding: 13px 8px 13px 0;
}

.blog-search-clear {
  margin-right: 8px;
  border: 0;
  border-radius: 999px;
  padding: 7px 10px;
  background: rgba(20, 38, 67, 0.08);
  color: var(--primary);
  cursor: pointer;
  font-weight: 900;
}

.blog-filter-row {
  display: grid;
  gap: 10px;
}

.blog-filter-label {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-chips,
.chip-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.chip-cloud {
  margin-top: 12px;
}

.blog-tag-extra[hidden],
.blog-search-clear[hidden],
.blog-tag-toggle[hidden] {
  display: none;
}

.blog-tag-extra {
  display: contents;
}

.blog-tag-toggle {
  border: 1px solid rgba(20, 38, 67, 0.12);
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.76);
  color: var(--primary);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 900;
}

.blog-layout {
  gap: 28px;
}

.blog-sidebar {
  display: grid;
  gap: 18px;
}

@media (min-width: 981px) {
  .blog-sidebar,
  .article-side-card {
    position: sticky;
    top: 100px;
  }
}

.blog-side-block {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.62);
}

.blog-card {
  display: grid;
  grid-template-rows: auto auto auto 1fr auto auto;
  gap: 12px;
  height: 100%;
}

.blog-card img,
.blog-card-media {
  width: 100%;
  aspect-ratio: 16 / 10;
  margin-bottom: 0;
  border-radius: 18px;
  object-fit: cover;
}

.blog-card-featured {
  grid-template-rows: auto auto auto 1fr auto auto;
}

.blog-card-featured img,
.blog-card-featured .blog-card-media {
  aspect-ratio: 16 / 8.5;
}

.fallback-thumb {
  display: grid;
  place-items: center;
  min-height: 150px;
  color: rgba(20, 38, 67, 0.72);
  font-family: var(--font-display);
  font-size: 1.15rem;
  text-align: center;
}

.fallback-thumb span {
  max-width: 14ch;
}

.blog-card h3 {
  line-height: 1.24;
}

.blog-card p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.mini-post {
  min-width: 0;
  border: 1px solid rgba(22, 35, 63, 0.06);
  transition: transform var(--dur-fast) ease, background var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

.mini-post:hover,
.mini-post:focus-visible {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 14px 28px rgba(20, 38, 67, 0.1);
}

.mini-post strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text);
  font-size: 0.92rem;
  line-height: 1.32;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mini-post small {
  color: var(--muted);
  font-size: 0.78rem;
}

.mini-post .fallback-thumb {
  width: 76px;
  min-height: 68px;
  aspect-ratio: 1 / 1;
  font-size: 0.72rem;
}

.mini-post .blog-card-media,
.mini-post img {
  width: 76px;
  height: 68px;
  min-height: 68px;
  aspect-ratio: auto;
  border-radius: 14px;
  object-fit: cover;
}

.blog-empty-card {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 26px;
  border: 1px solid rgba(200, 145, 43, 0.2);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 249, 236, 0.92), rgba(238, 248, 247, 0.86));
  box-shadow: var(--shadow-soft);
}

.article-hero .page-hero-grid {
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
}

.page-blog-detail .hero-media {
  min-height: 300px;
}

.article-hero-image {
  height: 100%;
  min-height: 300px;
}

.page-blog-detail .article-content {
  padding: clamp(24px, 3vw, 34px);
  background:
    radial-gradient(circle at 100% 0%, rgba(14, 122, 114, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 252, 247, 0.9));
}

.article-content p,
.article-content li {
  font-size: 1.06rem;
  line-height: 1.75;
}

.article-content p + p,
.article-content ul + p,
.article-content ol + p,
.article-content p + ul,
.article-content p + ol {
  margin-top: 4px;
}

.article-content h2 {
  font-size: clamp(1.55rem, 2.5vw, 2rem);
  margin-top: 20px;
}

.article-content h3 {
  font-size: clamp(1.25rem, 2vw, 1.55rem);
  margin-top: 16px;
}

.article-content li p {
  margin: 0;
}

.article-bottom {
  display: grid;
  gap: 24px;
}

.post-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.post-nav a {
  display: grid;
  gap: 6px;
  padding: 18px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-soft);
}

.post-nav span {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes ringFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -8px, 0); }
}

@keyframes chipRise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes softFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 1120px) {
  .page-hero-grid,
  .split-panel,
  .story-layout,
  .form-shell,
  .article-layout {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .footer-grid .footer-column:first-child {
    grid-column: 1 / -1;
  }

  .grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .primary-nav,
  .header-actions .desktop-only,
  .route-strip.desktop-only {
    display: none;
  }

  .menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .drawer {
    display: none;
    position: fixed;
    inset: 84px 24px auto 24px;
    z-index: 140;
    max-height: calc(100vh - 110px);
    overflow: auto;
    padding: 18px;
    border: 1px solid rgba(22, 35, 63, 0.1);
    border-radius: 28px;
    background: rgba(255, 251, 244, 0.98);
    box-shadow: var(--shadow);
  }

  .drawer.open {
    display: grid;
    gap: 18px;
  }

  .drawer-links,
  .drawer-routes {
    display: grid;
    gap: 10px;
  }

  .drawer-links a,
  .drawer-routes a {
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(22, 35, 63, 0.08);
    background: rgba(255, 255, 255, 0.78);
    font-weight: 700;
  }

  .drawer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 780px) {
  .section {
    padding: 44px 0;
  }

  .grid-2,
  .grid-3,
  .grid-4,
  .grid-5,
  .gallery-grid,
  .blog-layout,
  .featured-blog-grid,
  .blog-lanes,
  .shop-grid,
  .comparison,
  .list-columns,
  .form-grid.two {
    grid-template-columns: 1fr;
  }

  .article-layout {
    grid-template-columns: 1fr;
  }

  .page-home .home-hero .page-hero-grid,
  .home-identity-grid,
  .article-hero .page-hero-grid,
  .post-nav {
    grid-template-columns: 1fr;
  }

  .role-grid {
    grid-template-columns: 1fr;
  }

  .book-showcase,
  .waymaker-bridge,
  .blog-search-card {
    border-radius: 24px;
  }

  .book-cover-wrap {
    min-height: 260px;
  }

  .floating-icon,
  .decor-ring.ring-c {
    display: none;
  }

  .page-hero-grid {
    padding: 26px;
  }

  .hero-stats {
    grid-template-columns: 1fr 1fr;
  }

  .blog-results-header {
    display: grid;
    align-items: start;
  }

  .footer-shell,
  .quote-panel,
  .story-card,
  .cta-band,
  .card,
  .feature-card,
  .program-card,
  .framework-card,
  .resource-card,
  .blog-card,
  .gallery-card,
  .timeline-card,
  .process-card,
  .path-card,
  .audience-card,
  .metric-card,
  .form-card,
  .contact-card {
    padding: 20px;
  }

  .site-header .container,
  .footer .container {
    width: min(100% - 32px, 1180px);
  }

  .header-inner {
    position: relative;
    min-height: 72px;
  }

  .header-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }

  .brand-lockup {
    flex-basis: auto;
    max-width: calc(100% - 62px);
    min-width: 0;
    padding-right: 0;
  }

  .brand-lockup strong {
    white-space: normal;
  }

  .header-actions {
    position: static;
    transform: none;
    margin-left: auto;
  }

  .menu-button {
    position: relative;
    top: auto;
    right: auto;
    z-index: 1;
    flex: 0 0 44px;
    background: rgba(255, 255, 255, 0.94);
    border-color: rgba(20, 38, 67, 0.16);
    box-shadow: 0 10px 22px rgba(20, 38, 67, 0.08);
  }

  .page-hero h1 {
    max-width: 100%;
    font-size: 1.48rem;
    overflow-wrap: anywhere;
  }

  .hero-copy {
    min-width: 0;
  }

  .drawer {
    inset: 78px 16px auto 16px;
    max-height: calc(100vh - 96px);
  }

  .article-side-card {
    position: static;
  }

  .page-wami .wami-stars .wami-star:nth-child(n+7) {
    display: none;
  }

  .footer-cta-band {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .footer-cta-band .button-row {
    flex-wrap: wrap;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid .footer-column:first-child {
    grid-column: auto;
  }
}

@media (max-width: 520px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .button-row,
  .hero-actions,
  .footer-note,
  .footer-meta {
    flex-direction: column;
    align-items: stretch;
  }

  .brand-lockup strong {
    font-size: 1.16rem;
  }

  .page-hero::after {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .js-motion .reveal {
    opacity: 1;
    transform: none;
  }
}
`;

const SITE_JS = String.raw`
(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topbar = document.querySelector("[data-site-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const drawer = document.querySelector("[data-drawer]");
  const body = document.body;

  function setYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function handleScrollHeader() {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 8);
  }

  function closeDrawer() {
    if (!drawer || !menuButton) return;
    drawer.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
  }

  function bindDrawer() {
    if (!drawer || !menuButton) return;

    menuButton.addEventListener("click", function () {
      const isOpen = drawer.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("nav-open", isOpen);
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });

    document.addEventListener("click", function (event) {
      if (!drawer.classList.contains("open")) return;
      if (drawer.contains(event.target) || menuButton.contains(event.target)) return;
      closeDrawer();
    });
  }

  function bindNavDropdowns() {
    document.querySelectorAll(".nav-group").forEach(function (group) {
      const summary = group.querySelector(".nav-group-summary");
      if (!summary) return;

      function syncExpanded() {
        summary.setAttribute("aria-expanded", String(group.open));
      }

      group.addEventListener("toggle", syncExpanded);
      summary.addEventListener("click", function () {
        window.setTimeout(syncExpanded, 0);
      });
      syncExpanded();
    });
  }

  function bindFaq() {
    document.querySelectorAll("[data-faq-item]").forEach(function (item) {
      const button = item.querySelector("[data-faq-button]");
      if (!button) return;

      button.addEventListener("click", function () {
        const expanded = item.classList.toggle("open");
        button.setAttribute("aria-expanded", String(expanded));
      });
    });
  }

  function bindReveals() {
    const nodes = Array.from(document.querySelectorAll(".reveal"));
    if (!nodes.length) return;

    if (prefersReducedMotion) {
      nodes.forEach(function (node) {
        node.classList.add("visible");
      });
      return;
    }

    document.body.classList.add("js-motion");
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function bindCounters() {
    const counters = Array.from(document.querySelectorAll("[data-count]"));
    if (!counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach(function (node) {
        node.textContent = node.getAttribute("data-count");
      });
      return;
    }

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          const target = Number(entry.target.getAttribute("data-count"));
          const start = performance.now();
          const duration = 1300;

          function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            entry.target.textContent = String(current);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              entry.target.textContent = String(target);
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function bindLightbox() {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) return;

    const image = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");

    function close() {
      lightbox.classList.remove("open");
      body.style.overflow = "";
    }

    document.querySelectorAll("[data-lightbox-src]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (!image) return;
        image.src = button.getAttribute("data-lightbox-src");
        image.alt = button.getAttribute("data-lightbox-alt") || "";
        lightbox.classList.add("open");
        body.style.overflow = "hidden";
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", close);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });
  }

  async function submitForm(form) {
    const submitButton = form.querySelector("[type='submit']");
    const kind = form.getAttribute("data-form-kind") || "form";
    if (!submitButton) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitButton.disabled = true;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.access_key = form.getAttribute("data-access-key");
      payload.subject = kind === "consultation"
        ? "New consultation request from sanjo.in"
        : "New contact enquiry from sanjo.in";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        window.alert(
          kind === "consultation"
            ? "Your consultation request has been sent. Sanjo's team will respond soon."
            : "Your message has been sent. Sanjo's team will get back to you soon."
        );
        form.reset();
      } catch (error) {
        console.error(error);
        window.alert("Unable to submit right now. Please use email or WhatsApp while this is retried.");
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function bindForms() {
    document.querySelectorAll("[data-web3-form]").forEach(function (form) {
      submitForm(form);
    });
  }

  function bindBlogFilters() {
    const hub = document.querySelector("[data-blog-hub]");
    if (!hub) return;

    const search = hub.querySelector("[data-blog-search]");
    const cards = Array.from(hub.querySelectorAll("[data-blog-card]"));
    const resultCards = Array.from(hub.querySelectorAll("[data-blog-result]"));
    const buttons = Array.from(hub.querySelectorAll("[data-blog-category]"));
    const tagButtons = Array.from(hub.querySelectorAll("[data-blog-tag]"));
    const clearButtons = Array.from(hub.querySelectorAll("[data-blog-clear]"));
    const searchClearButton = hub.querySelector("[data-blog-search-clear]");
    const tagToggleButton = hub.querySelector("[data-blog-tag-toggle]");
    const extraTags = hub.querySelector("[data-blog-extra-tags]");
    const count = hub.querySelector("[data-blog-count]");
    const total = hub.querySelector("[data-blog-total]");
    const empty = hub.querySelector("[data-blog-empty]");
    const params = new URLSearchParams(window.location.search);
    let activeCategory = "All";
    let activeTag = "";

    if (params.get("category")) activeCategory = params.get("category");
    if (params.get("tag")) activeTag = params.get("tag");
    if (search && params.get("search")) search.value = params.get("search");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function setUrl(query) {
      const next = new URL(window.location.href);
      ["category", "tag", "search"].forEach(function (key) {
        next.searchParams.delete(key);
      });
      if (activeCategory && activeCategory !== "All") next.searchParams.set("category", activeCategory);
      if (activeTag) next.searchParams.set("tag", activeTag);
      if (query) next.searchParams.set("search", query);
      window.history.replaceState({}, "", next);
    }

    function syncActiveButtons() {
      buttons.forEach(function (button) {
        button.classList.toggle("active", button.getAttribute("data-blog-category") === activeCategory);
      });
      tagButtons.forEach(function (button) {
        button.classList.toggle("active", normalize(button.getAttribute("data-blog-tag")) === normalize(activeTag));
      });
    }

    function applyFilters() {
      const query = search ? search.value.trim().toLowerCase() : "";
      let visibleResults = 0;
      cards.forEach(function (card) {
        const categoryMatches = activeCategory === "All" || card.getAttribute("data-category") === activeCategory;
        const tagList = normalize(card.getAttribute("data-tags"));
        const tagMatches = !activeTag || tagList.split("|").includes(normalize(activeTag));
        const searchMatches = !query || (card.getAttribute("data-search") || "").includes(query);
        const show = categoryMatches && tagMatches && searchMatches;
        card.hidden = !show;
        if (show && card.hasAttribute("data-blog-result")) visibleResults += 1;
      });
      if (count) count.textContent = String(visibleResults);
      if (total) total.textContent = String(resultCards.length);
      if (empty) empty.hidden = visibleResults !== 0;
      clearButtons.forEach(function (button) {
        button.hidden = activeCategory === "All" && !activeTag && !query;
      });
      if (searchClearButton) searchClearButton.hidden = !query;
      syncActiveButtons();
      setUrl(query);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-blog-category") || "All";
        applyFilters();
      });
    });

    tagButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const tag = button.getAttribute("data-blog-tag") || "";
        activeTag = normalize(activeTag) === normalize(tag) ? "" : tag;
        applyFilters();
      });
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (searchClearButton) {
      searchClearButton.addEventListener("click", function () {
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
      });
    }

    clearButtons.forEach(function (clearButton) {
      clearButton.addEventListener("click", function () {
        activeCategory = "All";
        activeTag = "";
        if (search) search.value = "";
        applyFilters();
      });
    });

    if (tagToggleButton && extraTags) {
      tagToggleButton.addEventListener("click", function () {
        extraTags.toggleAttribute("hidden");
        const isHidden = extraTags.hasAttribute("hidden");
        tagToggleButton.textContent = isHidden ? "Show more tags" : "Show fewer tags";
        tagToggleButton.setAttribute("aria-expanded", String(!isHidden));
      });
    }

    applyFilters();
  }

  function bindImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        const fallback = document.createElement("div");
        fallback.className = image.className ? image.className + " fallback-thumb" : "fallback-thumb";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", image.alt || "Insight thumbnail");
        const label = document.createElement("span");
        label.textContent = image.getAttribute("data-fallback-label") || "Insight";
        fallback.appendChild(label);
        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  function bindCopyLinks() {
    document.querySelectorAll("[data-copy-link]").forEach(function (button) {
      button.addEventListener("click", async function () {
        const value = button.getAttribute("data-copy-link");
        try {
          await navigator.clipboard.writeText(value);
          button.textContent = "Copied";
          window.setTimeout(function () {
            button.textContent = "Copy link";
          }, 1400);
        } catch (error) {
          window.prompt("Copy this link", value);
        }
      });
    });
  }

  setYear();
  handleScrollHeader();
  bindDrawer();
  bindNavDropdowns();
  bindFaq();
  bindReveals();
  bindCounters();
  bindLightbox();
  bindForms();
  bindBlogFilters();
  bindCopyLinks();
  bindImageFallbacks();
  window.addEventListener("scroll", handleScrollHeader, { passive: true });
})();
`;

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sanjocinemathew/", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com/sanjocinemathew/", icon: "ig" },
  { label: "Facebook", href: "https://www.facebook.com/sanjo.mathew.39", icon: "fb" }
];

const routes = {
  home: "/",
  about: "/about-sanjo-cine-mathew/",
  aboutAlias: "/about/",
  expertise: "/expertise/",
  programs: "/programs/",
  corporateLearning: "/corporate-learning/",
  counselling: "/counselling-coaching/",
  schools: "/schools-students-parents/",
  women: "/women-empowerment/",
  waymaker: "/waymaker-skills-founder-sanjo-cine-mathew/",
  waymakerAlias: "/waymaker-skills/",
  wami: "/wami-childrens-life-skills/",
  nova: "/nova-human-development-methodology/",
  novaAlias: "/nova-methodology/",
  lq: "/lq-life-intelligence-quotient-framework/",
  lqAlias: "/lq-life-intelligence-quotient/",
  resume: "/resume/",
  gallery: "/gallery/",
  blog: "/blog-insights/",
  blogAlias: "/blog/",
  contact: "/contact/",
  consultation: "/book-consultation/",
  resources: "/resources/",
  impact: "/impact/",
  faq: "/faq/",
  shop: "/shop/",
  shopAlias: "/shop.html",
  shopBookAlias: "/shop-the-resilience-response/"
};

const canonicalRouteMap = {
  [routes.aboutAlias]: routes.about,
  [routes.waymakerAlias]: routes.waymaker,
  [routes.blogAlias]: routes.blog,
  [routes.novaAlias]: routes.nova,
  [routes.lqAlias]: routes.lq,
  [routes.shopAlias]: routes.shop,
  [routes.shopBookAlias]: routes.shop
};

const primaryNav = [
  { label: "Home", route: routes.home },
  { label: "About", route: routes.about },
  { label: "Expertise", route: routes.expertise },
  { label: "Programs", route: routes.programs },
  { label: "WayMaker Skills™", route: routes.waymaker },
  { label: "Blog", route: routes.blog },
  { label: "More", route: "#more" }
];

const allRoutesNav = [
  { label: "Home", route: routes.home },
  { label: "About Sanjo", route: routes.about },
  { label: "Expertise", route: routes.expertise },
  { label: "Programs", route: routes.programs },
  { label: "Corporate Learning", route: routes.corporateLearning },
  { label: "Counselling & Coaching", route: routes.counselling },
  { label: "Schools, Students & Parents", route: routes.schools },
  { label: "Women Empowerment", route: routes.women },
  { label: "WayMaker Skills™", route: routes.waymaker },
  { label: "WAMI™", route: routes.wami },
  { label: "NOVA™ Methodology", route: routes.nova },
  { label: "LQ™ Framework", route: routes.lq },
  { label: "Resume / Credentials", route: routes.resume },
  { label: "Gallery", route: routes.gallery },
  { label: "Blog / Insights", route: routes.blog },
  { label: "Contact", route: routes.contact },
  { label: "Book a Consultation", route: routes.consultation },
  { label: "Shop", route: routes.shop },
  { label: "Resources", route: routes.resources },
  { label: "Impact", route: routes.impact },
  { label: "FAQ", route: routes.faq }
];

const programMenu = [
  { label: "All Programs", route: routes.programs, description: "Full index of personal and institutional pathways." },
  { label: "Corporate Learning", route: routes.corporateLearning, description: "Human-centered leadership, culture, and team learning." },
  { label: "Counselling & Coaching", route: routes.counselling, description: "Clarity-centered personal support and growth." },
  { label: "Schools, Students & Parents", route: routes.schools, description: "Life skills, parenting, and educator development." },
  { label: "Women Empowerment", route: routes.women, description: "Confidence, identity, and purposeful action." }
];

const frameworkMenu = [
  { label: "WayMaker Skills™ Overview", route: routes.waymaker, description: "Founder bridge and organizational context." },
  { label: "WAMI™", route: routes.wami, description: "Children's life skills through stories and play." },
  { label: "NOVA™ Methodology", route: routes.nova, description: "Notice, Own, Visualize, and Act." },
  { label: "LQ™ Framework", route: routes.lq, description: "Think, feel, connect, act, and adapt." }
];

const moreMenu = [
  { label: "Resume", route: routes.resume, description: "Professional background and credentials." },
  { label: "Gallery", route: routes.gallery, description: "Workshops, schools, and learning moments." },
  { label: "Shop", route: routes.shop, description: "The Resilience Response book page." },
  { label: "Contact", route: routes.contact, description: "Email, WhatsApp, and enquiry form." }
];

const waymakerLinks = {
  company: "https://waymakerskills.com",
  wami: "https://waymakerskills.com/wami-childrens-life-skills",
  nova: "https://waymakerskills.com/nova-human-development-methodology",
  lq: "https://waymakerskills.com/lq-life-intelligence-quotient-framework"
};

const galleryItems = [
  {
    file: "academic-rediness-proramme-for-students-bishop-moore-vidyapith-cherthala-sanjo-mathew-trainer.png",
    category: "School Programs",
    title: "Academic readiness session for students",
    caption: "Student development session focused on confidence, discipline, and readiness for the academic year."
  },
  {
    file: "creative-thinking-session-unity-womens-college-malappuram-sanjo-mathew-trainer.jpg",
    category: "Community Programs",
    title: "Creative thinking session for women learners",
    caption: "Interactive facilitation around creative confidence, voice, and reflective learning."
  },
  {
    file: "learning-science-experimental-way-sri-vijaya-vidaya-metric-school-salem-tamil-nadu-sanjo-mathew-trainer.jpg",
    category: "Workshops",
    title: "Learning science through an experiential lens",
    caption: "A practical session making abstract learning concepts accessible and memorable."
  },
  {
    file: "makam-english-medium-public-school-trivandrum-sanjo-mathew-trainer.jpeg",
    category: "Training Events",
    title: "School transformation facilitation",
    caption: "A live engagement designed to strengthen learner motivation and institutional alignment."
  },
  {
    file: "mathi-coding-ai-residentail-summer-camp-nit-calicut-sanjo-mathew-trainer.jpg",
    category: "Workshops",
    title: "Summer camp learning lab",
    caption: "A future-readiness environment combining curiosity, skill development, and collaborative energy."
  },
  {
    file: "parents-orientation-program-vimala-central-school-chathanoor-kollam-sanjo-mathew-trainer.jpeg",
    category: "Parents",
    title: "Parent orientation program",
    caption: "Guidance for families on communication, developmental support, and healthy learning routines."
  },
  {
    file: "parents-orientation-programme-de-paul-school-thodupuzha-idukki-sanjo-mathew-trainer.jpeg",
    category: "Parents",
    title: "Parenting partnership conversation",
    caption: "Helping parents build connection, boundaries, and emotional safety at home."
  },
  {
    file: "parents-orientation-programme-st-maria-goretti-public-school-ernakulam-sanjo-mathew-trainer.jpeg",
    category: "School Programs",
    title: "Family-school partnership session",
    caption: "Support for parents and school communities to create stronger developmental ecosystems."
  },
  {
    file: "pathanamthitta-summer-camp-students-vacation-sanjo-mathew-trainer.png",
    category: "School Programs",
    title: "Vacation program for students",
    caption: "A high-energy learning experience centered on expression, discipline, and confidence."
  },
  {
    file: "school-reopening-njanodayam-public-school-edakochi-ernakulam-sanjo-mathew-trainer.jpg",
    category: "Training Events",
    title: "School reopening motivation session",
    caption: "A reset for learners and educators to step into the year with clarity and intention."
  },
  {
    file: "students-training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg",
    category: "School Programs",
    title: "Student training programme",
    caption: "A structured intervention around life skills, self-belief, and practical growth habits."
  },
  {
    file: "summer-camp-for-students-at-pathanamthitta-sanjo-mathew-trainer.png",
    category: "Community Programs",
    title: "Student summer camp pathway",
    caption: "Blending play, guided reflection, and skill activation for holistic student development."
  },
  {
    file: "teachers-training-belibers-church-school-thiruvalla-sanjo-mathew-trainer.jpeg",
    category: "Training Events",
    title: "Teacher training and facilitation",
    caption: "Capacity-building for educators on learner psychology, communication, and classroom presence."
  },
  {
    file: "teachers-training-programme-believers-church-english-medium-school-alleppey-sanjo-mathew-trainer.jpeg",
    category: "Training Events",
    title: "Teacher development workshop",
    caption: "Professional learning for schools seeking reflective, human-centered teaching cultures."
  },
  {
    file: "teachers-training-programme-gregorian-public-school-kottayam-sanjo-mathew-trainer.jpg",
    category: "Training Events",
    title: "Teacher leadership programme",
    caption: "A session on teaching effectiveness, emotional maturity, and student-facing influence."
  },
  {
    file: "teachers-training-programme-nizamia-public-school-trivandrum-sanjo-mathew-trainer.jpg",
    category: "Training Events",
    title: "Educator growth and mindset workshop",
    caption: "Strengthening reflective teaching, student connection, and institutional responsibility."
  },
  {
    file: "teachers-training-programme-st-marys-english-medium-school-kollam-sanjo-mathew-trainer.jpeg",
    category: "Training Events",
    title: "Teaching excellence development session",
    caption: "A practical session on instructional presence, learner engagement, and communication."
  },
  {
    file: "teachers=training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg",
    category: "Training Events",
    title: "School training event",
    caption: "An institutional learning intervention shaped around growth mindset and classroom culture."
  }
];

const expertiseAreas = [
  { title: "Counselling Psychology", copy: "Clarity-centered support for emotional awareness, life transitions, resilience, and direction.", href: routes.counselling },
  { title: "Human Development", copy: "Integrated growth pathways for learners, families, professionals, and institutions.", href: routes.waymaker },
  { title: "Corporate Training", copy: "Human-centered learning journeys for culture, communication, and leadership capability.", href: routes.corporateLearning },
  { title: "Leadership Coaching", copy: "Performance, self-awareness, and influence development for emerging and established leaders.", href: routes.corporateLearning },
  { title: "Emotional Intelligence", copy: "Helping people notice, regulate, express, and apply emotions productively.", href: routes.lq },
  { title: "Communication Skills", copy: "Practical communication for students, teachers, parents, professionals, and teams.", href: routes.programs },
  { title: "Wellness & Mindfulness", copy: "Stress regulation, reflective practices, and sustainable personal well-being.", href: routes.counselling },
  { title: "Learning & Development", copy: "Experiential pedagogy and high-retention facilitation for institutional and professional growth.", href: routes.expertise },
  { title: "Parenting Guidance", copy: "Helping families create healthy boundaries, emotional security, and developmental support.", href: routes.schools },
  { title: "Student Mentorship", copy: "Confidence, study strategies, life skills, and purposeful preparation for the future.", href: routes.schools },
  { title: "Women Empowerment", copy: "Strength-based interventions for identity, confidence, expression, and purposeful action.", href: routes.women },
  { title: "Future Skills", copy: "Readiness for a changing world through adaptability, self-management, and applied intelligence.", href: routes.nova }
];

const signaturePrograms = [
  {
    id: "inspire",
    title: "I.N.S.P.I.R.E. Series",
    description: "A 5-day immersive creative workshop for junior creators, creative dynamos, and leadership catalysts.",
    bestFor: "Students, school communities, young creators",
    outcomes: "Creativity, confidence, collaboration, leadership, communication",
    detailHref: `${routes.schools}#inspire-series`
  },
  {
    id: "empower-to-empowerment",
    title: "Empower to Empowerment",
    description: "A women empowerment intervention focused on self-discovery, confidence, and action-led growth.",
    bestFor: "Women, colleges, communities, support groups",
    outcomes: "Self-worth, clarity, action planning, well-being, voice",
    detailHref: `${routes.women}#empower-to-empowerment`
  },
  {
    id: "c3",
    title: "Clarity Crest Counselling / C3",
    description: "A personalized counselling and coaching journey for emotional strength, purpose, and personal effectiveness.",
    bestFor: "Individuals navigating transitions, stress, or confusion",
    outcomes: "Clarity, resilience, mindset shifts, purposeful action",
    detailHref: `${routes.counselling}#c3-program`
  },
  {
    id: "parenting-with-passion",
    title: "Parenting With Passion",
    description: "A developmental support programme for parents seeking stronger connection and confident guidance at home.",
    bestFor: "Parents, caregivers, school parent communities",
    outcomes: "Emotional security, discipline, communication, boundaries",
    detailHref: `${routes.schools}#parenting-with-passion`
  },
  {
    id: "personal-effectiveness-mentorship",
    title: "Personal Effectiveness Mentorship",
    description: "A guided development process for life skills, personality growth, and leadership readiness.",
    bestFor: "Students, young adults, professionals, growth seekers",
    outcomes: "Presence, communication, initiative, discipline, confidence",
    detailHref: `${routes.programs}#personal-effectiveness-mentorship`
  },
  {
    id: "exam-stress",
    title: "Overcome Exam Stress Through Smart Learning",
    description: "A focused intervention for exam-time stress, study routines, and confidence-building.",
    bestFor: "Students, parents, schools",
    outcomes: "Calm, planning, smart learning, confidence, emotional steadiness",
    detailHref: `${routes.schools}#exam-stress`
  },
  {
    id: "corporate-excellence",
    title: "Corporate Excellence & Transformational Learning",
    description: "Psychology-based learning experiences for professionals and organizations seeking better human performance.",
    bestFor: "Corporate teams, managers, HR and L&D leaders",
    outcomes: "Leadership, collaboration, emotional intelligence, communication",
    detailHref: `${routes.corporateLearning}#corporate-excellence`
  },
  {
    id: "elevate",
    title: "E.L.E.V.A.T.E.",
    description: "A premium transformation journey for organizations navigating change, leadership, and culture building.",
    bestFor: "Organizations, emerging leaders, teams in transition",
    outcomes: "Leadership capability, engagement, storytelling, resilience, alignment",
    detailHref: `${routes.corporateLearning}#elevate`
  }
];

const fallbackBlogPosts = [
  {
    slug: "why-life-skills-matter-more-than-ever",
    title: "Why Life Skills Matter More Than Ever",
    category: "Life Skills",
    readTime: "5 min read",
    image: "/assets/imgs/blog1.jpg",
    excerpt: "Why technical knowledge alone is no longer enough, and what practical life intelligence looks like in daily decisions.",
    intro: "Life skills are no longer optional extras. They are the bridge between what people know and how they actually live, relate, decide, and grow.",
    points: [
      "Knowledge without application often creates pressure instead of progress.",
      "Communication, self-awareness, and adaptability shape outcomes in school, work, and relationships.",
      "Future readiness depends on the capacity to think clearly under changing conditions."
    ],
    practices: [
      "Reflect on one recurring challenge and identify the human skill it demands.",
      "Build one daily practice for emotional regulation or clarity.",
      "Measure growth not only by output, but by how you respond under pressure."
    ]
  },
  {
    slug: "helping-children-build-confidence-through-reflection-and-play",
    title: "Helping Children Build Confidence Through Reflection and Play",
    category: "Children & Parents",
    readTime: "4 min read",
    image: "/assets/imgs/blog2.jpg",
    excerpt: "Confidence grows through experience, reflection, and supportive guidance, not pressure alone.",
    intro: "Children grow in confidence when they are allowed to explore, make meaning, and feel safe enough to try again.",
    points: [
      "Play gives children a low-risk environment to practise decision making and expression.",
      "Reflection helps them connect action with learning instead of chasing approval alone.",
      "Consistent adult language shapes whether confidence becomes genuine or performative."
    ],
    practices: [
      "Ask children what they noticed, not only what they achieved.",
      "Create small tasks that stretch capacity without overwhelming them.",
      "Respond to effort, curiosity, and recovery, not only visible success."
    ]
  },
  {
    slug: "from-awareness-to-action-the-nova-way",
    title: "From Awareness to Action: The NOVA™ Way",
    category: "Methodology",
    readTime: "6 min read",
    image: "/assets/imgs/blog3.jpg",
    excerpt: "A practical overview of how NOVA™ moves people from noticing, to owning, to visualizing, to acting.",
    intro: "Transformation becomes sustainable when insight is sequenced properly. NOVA™ provides a human development rhythm that people can actually follow.",
    points: [
      "Notice creates awareness and helps people slow down enough to see their patterns.",
      "Own invites responsibility without shame or avoidance.",
      "Visualize and Act turn insight into aligned behaviour and visible change."
    ],
    practices: [
      "Name one pattern you keep repeating in pressure situations.",
      "Visualize the response, behavior, or direction you want to embody more clearly.",
      "Take one concrete action within the next 24 hours."
    ]
  },
  {
    slug: "beyond-iq-and-eq-understanding-life-intelligence",
    title: "Beyond IQ and EQ: Understanding Life Intelligence",
    category: "Applied Intelligence",
    readTime: "5 min read",
    image: "/assets/imgs/branding-1.jpg",
    excerpt: "Why a fuller model of intelligence must include how people think, feel, connect, act, and adapt.",
    intro: "IQ and EQ are useful, but they do not explain the full range of what real-world effectiveness requires.",
    points: [
      "People need more than mental horsepower; they need usable judgment.",
      "Life intelligence includes action, relationships, adaptability, and context reading.",
      "The strongest performers integrate internal clarity with external responsibility."
    ],
    practices: [
      "Observe where you are strong: thinking, feeling, connecting, acting, or adapting.",
      "Strengthen the dimension you usually neglect under pressure.",
      "Use reflection after difficult conversations to build transferable wisdom."
    ]
  },
  {
    slug: "how-parents-can-support-emotional-growth-at-home",
    title: "How Parents Can Support Emotional Growth at Home",
    category: "Parenting",
    readTime: "4 min read",
    image: "/assets/imgs/parenting-with-passion.jpg",
    excerpt: "Emotional growth is shaped by everyday responses, not only major parenting decisions.",
    intro: "Home becomes an emotional training ground through repeated interactions, language, routines, and repair.",
    points: [
      "Children learn emotional meaning from how adults respond to discomfort.",
      "Boundaries and warmth work best together, not against each other.",
      "Repair after conflict can strengthen trust more than the conflict weakens it."
    ],
    practices: [
      "Name emotions calmly and concretely during ordinary moments.",
      "Set boundaries without attacking the child's identity.",
      "Normalize apology, repair, and emotional responsibility."
    ]
  },
  {
    slug: "leadership-begins-with-self-awareness",
    title: "Leadership Begins with Self-Awareness",
    category: "Leadership",
    readTime: "5 min read",
    image: "/assets/imgs/elevate.png",
    excerpt: "Leadership maturity starts with noticing how your own patterns affect people, energy, and culture.",
    intro: "Before a leader can shape teams, they must understand the internal habits shaping their own choices.",
    points: [
      "Self-awareness improves trust because people experience consistency, not unpredictability.",
      "Leaders who notice their triggers recover faster and communicate more clearly.",
      "Culture is built by repeated micro-signals, not only formal strategy."
    ],
    practices: [
      "Ask where your energy changes in difficult interactions.",
      "Notice the gap between your intent and your impact.",
      "Build one pause habit before key conversations."
    ]
  },
  {
    slug: "managing-exam-stress-through-smart-learning",
    title: "Managing Exam Stress Through Smart Learning",
    category: "Students",
    readTime: "5 min read",
    image: "/assets/imgs/exam-stress.jpg",
    excerpt: "Students need better systems, not just more pressure, when stress rises around exams.",
    intro: "Exam stress is often a signal of overwhelm, uncertainty, or ineffective preparation habits rather than a lack of ability.",
    points: [
      "Stress reduces recall when students rely only on last-minute intensity.",
      "Smart learning combines planning, spaced practice, and emotional regulation.",
      "Parents and schools should support consistency rather than fear-driven urgency."
    ],
    practices: [
      "Break preparation into small blocks with review checkpoints.",
      "Use brief reset routines before and after study sessions.",
      "Track progress through completion and understanding, not just hours spent."
    ]
  },
  {
    slug: "the-role-of-communication-in-personal-effectiveness",
    title: "The Role of Communication in Personal Effectiveness",
    category: "Communication",
    readTime: "4 min read",
    image: "/assets/imgs/branding-2.jpg",
    excerpt: "Personal effectiveness rises when communication becomes clear, grounded, and aligned with purpose.",
    intro: "Communication is not only about speaking well. It is about thinking clearly, listening honestly, and acting responsibly in context.",
    points: [
      "Clarity reduces friction and increases trust.",
      "Good communication depends on emotional regulation as much as vocabulary.",
      "Influence grows when words, tone, and intent reinforce each other."
    ],
    practices: [
      "Pause before important conversations and identify the one outcome that matters most.",
      "Listen for meaning, not only for openings to respond.",
      "Use follow-through to make communication credible."
    ]
  }
];

const importedBlogPosts = JSON.parse(readFileSync(path.join(ROOT, "data", "blogPosts.json"), "utf8"));
const blogPosts = (importedBlogPosts.length ? importedBlogPosts : fallbackBlogPosts)
  .map((post, index) => normalizeBlogPost(post, index))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const routeToLabel = Object.fromEntries(allRoutesNav.map((item) => [item.route, item.label]));
routeToLabel[routes.blogAlias] = "Blog / Insights";
routeToLabel[routes.shopAlias] = "Books & Publications";
routeToLabel[routes.shopBookAlias] = "The Resilience Response";
routeToLabel[routes.aboutAlias] = "About Sanjo";
routeToLabel[routes.waymakerAlias] = "WayMaker Skills™";
routeToLabel[routes.novaAlias] = "NOVA™ Methodology";
routeToLabel[routes.lqAlias] = "LQ™ Framework";

const footerColumns = [
  {
    title: "About Sanjo",
    links: [
      { label: "Home", href: routes.home },
      { label: "About", href: routes.about },
      { label: "Expertise", href: routes.expertise },
      { label: "Resume / Credentials", href: routes.resume },
      { label: "Gallery", href: routes.gallery },
      { label: "Blog / Insights", href: routes.blog },
      { label: "Books & Publications", href: routes.shop },
      { label: "Contact", href: routes.contact }
    ]
  },
  {
    title: "Services",
    links: [
      { label: "Services", href: routes.programs },
      { label: "Counselling & Coaching", href: routes.counselling },
      { label: "Schools, Students & Parents", href: routes.schools },
      { label: "Corporate Learning", href: routes.corporateLearning },
      { label: "Women Empowerment", href: routes.women },
      { label: "Book a Consultation", href: routes.consultation }
    ]
  },
  {
    title: "WayMaker Ecosystem",
    links: [
      { label: "WayMaker Skills™", href: routes.waymaker },
      { label: "WAMI™", href: routes.wami },
      // { label: "NOVA™ Methodology", href: routes.nova },
      // { label: "LQ™ Framework", href: routes.lq },
      { label: "Official Website", href: waymakerLinks.company, external: true }
    ]
  },
  {
    title: "Contact",
    links: [
      { label: "WhatsApp: +91 96453 43777", href: "https://wa.me/919645343777", external: true },
      { label: "Email: biosanjo@gmail.com", href: "mailto:biosanjo@gmail.com", external: true },
      { label: "WayMaker: waymakerskills@gmail.com", href: "mailto:waymakerskills@gmail.com", external: true },
      { label: "Feedback", href: "/feedback/" }
    ]
  }
];

function fullUrl(route) {
  return route.startsWith("http") ? route : `${BASE_URL}${routeHref(route)}`;
}

function routeHref(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }

  const [pathname, hash = ""] = href.split("#");
  const normalized = canonicalRouteMap[pathname] || pathname;
  return hash ? `${normalized}#${hash}` : normalized;
}

function canonicalizeMarkup(html) {
  return html.replace(/href="([^"]+)"/g, (_match, href) => `href="${routeHref(href)}"`);
}

function slugToOutputPath(route) {
  if (route === "/") return path.join(OUTPUT_DIR, "index.html");
  const clean = route.replace(/^\//, "");
  if (clean.endsWith("/")) {
    return path.join(OUTPUT_DIR, clean, "index.html");
  }
  return path.join(OUTPUT_DIR, clean);
}

async function safeWrite(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

function isSubPath(parent, child) {
  const relative = path.relative(parent, child);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function prepareOutputDir() {
  if (!DEPLOY_BUILD) return;
  if (!isSubPath(ROOT, OUTPUT_DIR)) {
    throw new Error(`Refusing to clean output directory outside the project: ${OUTPUT_DIR}`);
  }
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
}

async function copyIfExists(from, to) {
  if (!existsSync(from)) return;
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
}

function anchor(href, label, className = "btn btn-secondary", extra = "") {
  const finalHref = routeHref(href);
  const attrs = finalHref.startsWith("http")
    ? ` target="_blank" rel="noopener noreferrer"${extra ? ` ${extra}` : ""}`
    : extra;
  return `<a class="${className}" href="${finalHref}"${attrs}>${label}</a>`;
}

function list(items, className = "bullet-list") {
  return `<ul class="${className}">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slugify(value) {
  return String(value || "insight")
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "insight";
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadTime(value) {
  const words = stripHtml(value).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 190));
  return `${minutes} min read`;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag || "").trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function cleanArticleContent(html) {
  return String(html || "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/\s+target="_new"/gi, ' target="_blank" rel="noopener noreferrer"')
    .trim();
}

function normalizeBlogPost(post, index) {
  const title = String(post.title || post.slug || post.id || `Insight ${index + 1}`).trim();
  const slug = slugify(post.slug || post.id || title);
  const content = cleanArticleContent(post.content || "");
  const excerpt = String(post.excerpt || post.intro || stripHtml(content).slice(0, 180) || title).trim();
  const category = String(post.category || "Insights").trim() || "Insights";
  const tags = normalizeTags(post.tags);

  return {
    id: post.id || slug,
    slug,
    title,
    category,
    tags,
    readTime: post.readTime || estimateReadTime(content || excerpt),
    date: post.date || "2024-01-01",
    author: post.author || "Dr. Sanjo Cine Mathew",
    image: post.image || "",
    imageAlt: post.imageAlt || title,
    excerpt,
    intro: post.intro || excerpt,
    content,
    points: Array.isArray(post.points) ? post.points : [],
    practices: Array.isArray(post.practices) ? post.practices : [],
    sourceUrl: post.sourceUrl || `${routes.blogAlias}${slug}/`,
    featured: Boolean(post.featured),
    editorPick: Boolean(post.editorPick || post.editorsPick),
    trending: Boolean(post.trending),
    popular: Boolean(post.popular)
  };
}

function iconSvg(name = "spark") {
  const icons = {
    spark: '<path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.8 4.8l2.8 2.8M12.4 12.4l2.8 2.8M15.2 4.8l-2.8 2.8M7.6 12.4l-2.8 2.8"/>',
    mind: '<path d="M7 17v-3H5a3 3 0 0 1-3-3c0-4.4 3.4-8 8-8 4.1 0 7 2.8 7 6.5 0 3.2-2.1 5.5-5 6.2V18"/><path d="M8 9h4M10 7v4"/>',
    growth: '<path d="M4 16 16 4M8 4h8v8"/><path d="M4 12v4h4"/>',
    people: '<path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM13 17v-1a6 6 0 0 0-12 0v1"/><path d="M14 9a2.5 2.5 0 1 0 0-5"/><path d="M19 17v-1a5 5 0 0 0-4-4.8"/>',
    calm: '<path d="M3 12c2.4-2 4.6-2 7 0s4.6 2 7 0"/><path d="M3 7c2.4-2 4.6-2 7 0s4.6 2 7 0"/><path d="M3 17c2.4-2 4.6-2 7 0s4.6 2 7 0"/>',
    book: '<path d="M4 3h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z"/><path d="M14 6a3 3 0 0 1 3-3h1v14h-1a3 3 0 0 0-3 3z"/>',
    bridge: '<path d="M3 15c3-5 11-5 14 0"/><path d="M5 15V9M10 15V6M15 15V9"/><path d="M2 15h16"/>',
    family: '<path d="M3 9 10 3l7 6"/><path d="M5 8v9h10V8"/><path d="M8 17v-5h4v5"/>',
    leadership: '<path d="M10 3l2.2 4.4 4.8.7-3.5 3.4.8 4.8L10 14l-4.3 2.3.8-4.8L3 8.1l4.8-.7z"/>',
    message: '<path d="M4 5h12v8H7l-3 3z"/><path d="M7 8h6M7 11h4"/>'
  };
  return `<span class="icon-mark" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false">${icons[name] || icons.spark}</svg></span>`;
}

function floatingIcon(name) {
  return `<span class="floating-icon" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false">${iconSvg(name).match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || ""}</svg></span>`;
}

function decorLayer(extraClass = "") {
  return `
    <div class="decor-field ${extraClass}" aria-hidden="true">
      <span class="decor-ring ring-a"></span>
      <span class="decor-ring ring-b"></span>
      <span class="decor-ring ring-c"></span>
      <span class="decor-dot dot-a"></span>
      <span class="decor-dot dot-b"></span>
      <span class="floating-icon icon-a"><svg viewBox="0 0 20 20" focusable="false">${iconSvg("book").match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || ""}</svg></span>
      <span class="floating-icon icon-b"><svg viewBox="0 0 20 20" focusable="false">${iconSvg("spark").match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || ""}</svg></span>
    </div>
  `;
}

function blogFilterText(post) {
  return escapeAttr(`${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")} ${post.author}`.toLowerCase());
}

function blogTagsAttr(post) {
  return escapeAttr(post.tags.map((tag) => tag.toLowerCase()).join("|"));
}

function escapeHtml(value) {
  return escapeAttr(value);
}

function initials(value) {
  return String(value || "Insight")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderPostImage(post, className = "") {
  const classes = ["blog-card-media", className].filter(Boolean).join(" ");
  if (!post.image) {
    return `<div class="${classes} fallback-thumb" role="img" aria-label="${escapeAttr(post.imageAlt)}"><span>${escapeHtml(initials(post.title))}</span></div>`;
  }
  return `<img class="${classes}" src="${post.image}" alt="${escapeAttr(post.imageAlt)}" loading="lazy" decoding="async" data-fallback-thumb data-fallback-label="${escapeAttr(initials(post.title))}">`;
}

function renderTagButtons(post, limit = 3) {
  return post.tags.slice(0, limit).map((tag) => `<button class="tag-filter" type="button" data-blog-tag="${escapeAttr(tag)}">${escapeHtml(tag)}</button>`).join("");
}

function renderBlogCard(post, { featured = false, cta = "Read More", reveal = true, result = true } = {}) {
  return `
    <article class="blog-card${featured ? " blog-card-featured" : ""}${reveal ? " reveal" : ""}" data-blog-card${result ? " data-blog-result" : ""} data-category="${escapeAttr(post.category)}" data-tags="${blogTagsAttr(post)}" data-search="${blogFilterText(post)}">
      ${renderPostImage(post)}
      ${metaPills(featured ? ["Featured Article", post.category, post.readTime, post.date] : [post.category, post.readTime, post.date])}
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      ${post.tags.length ? `<div class="blog-card-tags">${renderTagButtons(post, 3)}</div>` : ""}
      <div class="button-row">
        <a class="btn ${featured ? "btn-primary" : "btn-secondary"}" href="${routes.blog}${post.slug}/">${cta}</a>
      </div>
    </article>
  `;
}

function renderMiniPost(post) {
  return `
    <a class="mini-post" href="${routes.blog}${post.slug}/">
      ${renderPostImage(post, "mini-post-thumb")}
      <span class="mini-post-body"><span>${post.category}</span><strong>${post.title}</strong><small>${post.date} - ${post.readTime}</small></span>
    </a>
  `;
}

function uniquePosts(posts) {
  const seen = new Set();
  return posts.filter((post) => {
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });
}

function fallbackPosts(primary, fallback, count) {
  return uniquePosts([...primary, ...fallback]).slice(0, count);
}

function popularVarietyPosts(count = 5) {
  const picked = [];
  const usedCategories = new Set();
  blogPosts.forEach((post) => {
    if (picked.length >= count) return;
    if (usedCategories.has(post.category)) return;
    picked.push(post);
    usedCategories.add(post.category);
  });
  return fallbackPosts(picked, blogPosts, count);
}

function getBlogSelections() {
  const latest = blogPosts.slice(0, 8);
  return {
    featured: fallbackPosts(blogPosts.filter((post) => post.featured), latest, 1),
    editorPicks: fallbackPosts(blogPosts.filter((post) => post.editorPick), latest, 3),
    trending: fallbackPosts(blogPosts.filter((post) => post.trending), latest, 5),
    popular: fallbackPosts(blogPosts.filter((post) => post.popular), popularVarietyPosts(5), 5)
  };
}

function getTopTags() {
  const counts = new Map();
  blogPosts.forEach((post) => {
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

function getBlogCategories() {
  const preferred = ["All", "Life Skills", "Parenting", "Leadership", "Communication", "Counselling", "Students", "WayMaker Skills", "WAMI", "NOVA", "LQ", "Women Empowerment", "Insights"];
  const actual = blogPosts.map((post) => post.category).filter(Boolean);
  return Array.from(new Set([...preferred, ...actual]));
}

function sectionHeader({ eyebrow, title, copy, centered = false }) {
  return `
    <div class="section-header${centered ? " centered" : ""} reveal">
      ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
      <h2>${title}</h2>
      ${copy ? `<p>${copy}</p>` : ""}
    </div>
  `;
}

function metaPills(items) {
  return `<div class="meta-row">${items.map((item) => `<span class="meta-pill">${item}</span>`).join("")}</div>`;
}

function ariaCurrent(page, route) {
  return normalizeRoute(page.route) === normalizeRoute(route) ? ' aria-current="page"' : "";
}

function chevronIcon() {
  return `<svg class="nav-chevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderMenuLinks(items, page) {
  return items.map((entry) => `
    <a class="nav-submenu-link" href="${entry.route}" role="listitem"${ariaCurrent(page, entry.route)}>
      <span>${entry.label}</span>
      ${entry.description ? `<small>${entry.description}</small>` : ""}
    </a>
  `).join("");
}

function renderPrimaryNav(page) {
  const linkMap = primaryNav.map((item) => {
    if (item.route === routes.programs) {
      const active = isSectionActive(page, item.route) ? "active" : "";
      return `
        <details class="nav-group ${active}">
          <summary class="nav-group-summary" aria-haspopup="true" aria-expanded="false">
            <span>${item.label}</span>
            ${chevronIcon()}
          </summary>
          <div class="nav-submenu" role="list">
            ${renderMenuLinks(programMenu, page)}
          </div>
        </details>
      `;
    }

    if (item.route === routes.waymaker) {
      const active = isSectionActive(page, item.route) ? "active" : "";
      return `
        <details class="nav-group ${active}">
          <summary class="nav-group-summary" aria-haspopup="true" aria-expanded="false">
            <span>${item.label}</span>
            ${chevronIcon()}
          </summary>
          <div class="nav-submenu" role="list">
            ${renderMenuLinks(frameworkMenu, page)}
          </div>
        </details>
      `;
    }

    if (item.route === "#more") {
      const active = [routes.resume, routes.gallery, routes.shop, routes.contact].includes(normalizeRoute(page.route)) ? "active" : "";
      return `
        <details class="nav-group ${active}">
          <summary class="nav-group-summary" aria-haspopup="true" aria-expanded="false">
            <span>${item.label}</span>
            ${chevronIcon()}
          </summary>
          <div class="nav-submenu" role="list">
            ${renderMenuLinks(moreMenu, page)}
          </div>
        </details>
      `;
    }

    const active = isSectionActive(page, item.route) ? "active" : "";
    return `<a class="${active}" href="${item.route}"${ariaCurrent(page, item.route)}>${item.label}</a>`;
  });

  return linkMap.join("");
}

function renderMobileNav(page) {
  return `
    <a class="${isSectionActive(page, routes.home) ? "active" : ""}" href="${routes.home}"${ariaCurrent(page, routes.home)}>Home</a>
    <a class="${isSectionActive(page, routes.about) ? "active" : ""}" href="${routes.about}"${ariaCurrent(page, routes.about)}>About</a>
    <a class="${isSectionActive(page, routes.expertise) ? "active" : ""}" href="${routes.expertise}"${ariaCurrent(page, routes.expertise)}>Expertise</a>
    <div class="drawer-group">
      <a class="${isSectionActive(page, routes.programs) ? "active" : ""}" href="${routes.programs}">Programs</a>
      <div class="drawer-subnav">
        ${programMenu.filter((entry) => entry.route !== routes.programs).map((entry) => `<a href="${entry.route}"${ariaCurrent(page, entry.route)}>${entry.label}</a>`).join("")}
      </div>
    </div>
    <div class="drawer-group">
      <a class="${isSectionActive(page, routes.waymaker) ? "active" : ""}" href="${routes.waymaker}">WayMaker Skills™</a>
      <div class="drawer-subnav">
        ${frameworkMenu.filter((entry) => entry.route !== routes.waymaker).map((entry) => `<a href="${entry.route}"${ariaCurrent(page, entry.route)}>${entry.label}</a>`).join("")}
      </div>
    </div>
    <a class="${isSectionActive(page, routes.blog) ? "active" : ""}" href="${routes.blog}"${ariaCurrent(page, routes.blog)}>Blog</a>
    <a class="${isSectionActive(page, routes.resume) ? "active" : ""}" href="${routes.resume}"${ariaCurrent(page, routes.resume)}>Resume</a>
    <a class="${isSectionActive(page, routes.gallery) ? "active" : ""}" href="${routes.gallery}"${ariaCurrent(page, routes.gallery)}>Gallery</a>
    <a class="${isSectionActive(page, routes.shop) ? "active" : ""}" href="${routes.shop}"${ariaCurrent(page, routes.shop)}>Shop</a>
    <a class="${isSectionActive(page, routes.contact) ? "active" : ""}" href="${routes.contact}"${ariaCurrent(page, routes.contact)}>Contact</a>
  `;
}

function renderRouteStrip(page) {
  return allRoutesNav
    .map((item) => {
      const active = normalizeRoute(page.route) === normalizeRoute(item.route) ? "active" : "";
      return `<a class="${active}" href="${item.route}">${item.label}</a>`;
    })
    .join("");
}

function normalizeRoute(route) {
  if (route === "/") return route;
  return route.endsWith("/") ? route : `${route}/`;
}

function isSectionActive(page, route) {
  if (route === routes.programs) {
    return [routes.programs, routes.corporateLearning, routes.counselling, routes.schools, routes.women].includes(normalizeRoute(page.route));
  }
  if (route === routes.waymaker) {
    return [routes.waymaker, routes.wami, routes.nova, routes.lq].includes(normalizeRoute(page.route));
  }
  if (route === routes.blog) {
    return normalizeRoute(page.route).startsWith(routes.blog);
  }
  return normalizeRoute(page.route) === normalizeRoute(route);
}

function renderSocialLinks() {
  return socialLinks
    .map((link) => `<a href="${link.href}" aria-label="${link.label}" target="_blank" rel="noopener noreferrer">${link.icon.toUpperCase()}</a>`)
    .join("");
}

function renderHeader(page) {
  return `
    <header class="site-header" data-site-header>
      <div class="container header-inner">
        <div class="header-row">
          <a class="brand-lockup" href="${routes.home}">
            <strong>Sanjo Cine Mathew</strong>
            <span>Personal Brand Website</span>
          </a>
          <nav class="primary-nav" aria-label="Primary navigation">
            ${renderPrimaryNav(page)}
          </nav>
          <div class="header-actions">
            <a class="btn btn-secondary desktop-only" href="${waymakerLinks.company}" target="_blank" rel="noopener noreferrer">Visit WayMaker Skills™</a>
            <a class="btn btn-primary desktop-only" href="${routes.consultation}">Book a Consultation</a>
            <button class="menu-button" type="button" data-menu-button aria-controls="site-drawer" aria-expanded="false" aria-label="Toggle navigation">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
      <div class="drawer" id="site-drawer" data-drawer>
        <div class="drawer-links">
          ${renderMobileNav(page)}
        </div>
        <div class="drawer-actions">
          <a class="btn btn-primary" href="${routes.consultation}">Book a Consultation</a>
          <a class="btn btn-secondary" href="${waymakerLinks.company}" target="_blank" rel="noopener noreferrer">Visit WayMaker Skills™</a>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-shell">
          <div class="footer-cta-band">
            <div class="stack">
              <h2>For schools, organizations, and institutional programs, explore WayMaker Skills™.</h2>
              <p>Sanjo.in is Dr. Sanjo Cine Mathew's personal brand platform. For large-scale institutional and company engagements, connect through the organization he founded.</p>
            </div>
            <div class="button-row">
              <a class="btn footer-cta-primary" href="${waymakerLinks.company}" target="_blank" rel="noopener noreferrer">Visit WayMaker Skills™</a>
              <a class="btn footer-cta-secondary" href="${routes.contact}">Contact Sanjo</a>
            </div>
          </div>
          <div class="footer-grid">
            <div class="footer-column">
              <h3>Dr. Sanjo Cine Mathew</h3>
              <p class="muted">Performance Strategist, Counsellor, Mentor, Educator, Author and Founder of WayMaker Skills™</p>
              <div class="social-links">${renderSocialLinks()}</div>
            </div>
            ${footerColumns.map((column) => `
              <div class="footer-column">
                <h3>${column.title}</h3>
                <div class="footer-links">
                  ${column.links.map((link) => `<a href="${routeHref(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${link.label}</a>`).join("")}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="footer-meta">
            <span>© <span data-current-year>${YEAR}</span> Sanjo Cine Mathew. All rights reserved.</span>
            <span>WhatsApp: <a href="https://wa.me/919645343777" target="_blank" rel="noopener noreferrer">+91 96453 43777</a> | Email: <a href="mailto:biosanjo@gmail.com">biosanjo@gmail.com</a> | <a href="mailto:waymakerskills@gmail.com">waymakerskills@gmail.com</a></span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function renderBreadcrumbs(page) {
  if (!page.breadcrumbs || !page.breadcrumbs.length) return "";
  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        ${page.breadcrumbs.map((crumb, index) => `
          <li>
            ${index === page.breadcrumbs.length - 1 ? `<span aria-current="page">${crumb.label}</span>` : `<a href="${routeHref(crumb.route)}">${crumb.label}</a>`}
          </li>
        `).join("")}
      </ol>
    </nav>
  `;
}

function renderHero(hero, withBreadcrumbs = "") {
  return `
    <section class="hero-section">
      <div class="container">
        ${withBreadcrumbs}
        <div class="page-hero hero-animated${hero.className ? ` ${hero.className}` : ""}">
          ${decorLayer(hero.decorClass || "hero-decor")}
          <div class="page-hero-grid">
            <div class="hero-copy">
              ${hero.eyebrow ? `<p class="eyebrow">${hero.eyebrow}</p>` : ""}
              <h1 class="hero-title">${hero.title}</h1>
              <p class="lede">${hero.copy}</p>
              ${hero.pills ? metaPills(hero.pills) : ""}
              ${hero.actions ? `<div class="hero-actions">${hero.actions.join("")}</div>` : ""}
              ${hero.scrollCue ? `<div class="scroll-cue">${hero.scrollCue}</div>` : ""}
              ${hero.stats ? `
                <div class="hero-stats">
                  ${hero.stats.map((stat) => `
                    <article class="stat-card">
                      <small>${stat.label}</small>
                      <strong><span data-count="${stat.value}">${stat.value}</span>${stat.suffix || ""}</strong>
                    </article>
                  `).join("")}
                </div>
              ` : ""}
            </div>
            <aside class="hero-panel">
              ${hero.media ? `
                <div class="hero-media">
                  ${hero.media.html || (hero.media.image ? `<img src="${hero.media.image}" alt="${hero.media.alt}">` : "")}
                </div>
              ` : ""}
              ${hero.panelTitle ? `<h2 class="hero-panel-title">${hero.panelTitle}</h2>` : ""}
              ${hero.panelCopy ? `<p class="muted">${hero.panelCopy}</p>` : ""}
              ${hero.panelHtml || ""}
              ${hero.panelList ? list(hero.panelList, "hero-list") : ""}
              ${hero.panelMeta ? metaPills(hero.panelMeta) : ""}
            </aside>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCards(items, className = "feature-card", columns = "grid-3") {
  return `
    <div class="${columns}">
      ${items.map((item) => `
        <article class="${className} reveal">
          ${item.icon ? iconSvg(item.icon) : ""}
          ${item.badge ? `<span class="program-badge">${item.badge}</span>` : ""}
          ${item.eyebrow ? `<p class="eyebrow">${item.eyebrow}</p>` : ""}
          <h3>${item.title}</h3>
          ${item.copy ? `<p>${item.copy}</p>` : ""}
          ${item.outcomes ? `<div class="outcome-chips">${item.outcomes.map((outcome) => `<span>${outcome}</span>`).join("")}</div>` : ""}
          ${item.meta ? metaPills(item.meta) : ""}
          ${item.list ? list(item.list) : ""}
          ${item.links ? `<div class="button-row">${item.links.join("")}</div>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function faqSection({ eyebrow, title, copy, items }) {
  return `
    <section class="section">
      <div class="container">
        ${sectionHeader({ eyebrow, title, copy })}
        <div class="faq-list">
          ${items.map((item, index) => `
            <article class="faq-item reveal${index === 0 ? " open" : ""}" data-faq-item>
              <button class="faq-question" type="button" data-faq-button aria-expanded="${index === 0 ? "true" : "false"}">
                <span>${item.q}</span>
                <span aria-hidden="true">+</span>
              </button>
              <div class="faq-answer">
                <div class="faq-answer-inner">
                  <p>${item.a}</p>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function ctaBand({ title, copy, actions }) {
  return `
    <section class="section tight">
      <div class="container">
        <div class="cta-band reveal">
          ${decorLayer("cta-decor")}
          <div class="stack">
            <h2>${title}</h2>
            <p>${copy}</p>
            <div class="button-row">${actions.join("")}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function programVisual(program) {
  const visuals = {
    inspire: { icon: "spark", badge: "Creativity / youth" },
    "empower-to-empowerment": { icon: "people", badge: "Women / strength" },
    c3: { icon: "calm", badge: "Clarity / counselling" },
    "parenting-with-passion": { icon: "family", badge: "Family / guidance" },
    "personal-effectiveness-mentorship": { icon: "growth", badge: "Growth / leadership" },
    "exam-stress": { icon: "book", badge: "Learning / calm" },
    "corporate-excellence": { icon: "leadership", badge: "Leadership / teams" },
    elevate: { icon: "bridge", badge: "Culture / change" }
  };
  return visuals[program.id] || { icon: "spark", badge: "Development" };
}

function splitStory({ eyebrow, title, copy, paragraphs, points, image, imageAlt, quoteTitle, quoteCopy, quoteBy }) {
  return `
    <section class="section">
      <div class="container story-layout">
        <div class="story-card reveal">
          ${sectionHeader({ eyebrow, title, copy })}
          <div class="stack">
            ${paragraphs.map((paragraph) => `<p class="muted">${paragraph}</p>`).join("")}
            ${points ? list(points) : ""}
          </div>
        </div>
        <div class="stack">
          ${image ? `<img class="story-image reveal" src="${image}" alt="${imageAlt}">` : ""}
          <div class="quote-panel reveal">
            <blockquote>${quoteTitle}</blockquote>
            <p>${quoteCopy}</p>
            <cite>${quoteBy}</cite>
          </div>
        </div>
      </div>
    </section>
  `;
}

function programCards(programs) {
  return `
    <div class="grid-2">
      ${programs.map((program) => {
        const visual = programVisual(program);
        const outcomes = program.outcomes.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4);
        return `
        <article class="program-card program-card-${program.id} reveal" id="${program.id}">
          <div class="program-card-head">
            ${iconSvg(visual.icon)}
            <span class="program-badge">${visual.badge}</span>
          </div>
          <h3>${program.title}</h3>
          <p>${program.description}</p>
          <div class="outcome-chips">${outcomes.map((item) => `<span>${item}</span>`).join("")}</div>
          ${metaPills([`Best for: ${program.bestFor}`])}
          <div class="button-row">
            <a class="btn btn-secondary" href="${routeHref(program.detailHref)}">View Details</a>
            <a class="btn btn-primary" href="${routes.contact}#contact-form">Enquire Now</a>
          </div>
        </article>
      `;
      }).join("")}
    </div>
  `;
}

function gallerySection() {
  return `
    <section class="section">
      <div class="container">
        ${sectionHeader({
          eyebrow: "Gallery",
          title: "Impact Across Schools, Communities & Organizations.",
          copy: "A glimpse into learning, growth, leadership, and transformation across schools, communities, families, and organizations."
        })}
        <div class="gallery-grid">
          ${galleryItems.map((item) => {
            const src = `/assets/imgs/gallery/${item.file}`;
            return `
              <button class="gallery-card reveal" type="button" data-lightbox-src="${src}" data-lightbox-alt="${item.title}">
                <img src="${src}" alt="${item.title}" loading="lazy" decoding="async">
                <div class="gallery-card-content">
                  <span class="meta-pill">${item.category}</span>
                  <h3>${item.title}</h3>
                  <p>${item.caption}</p>
                </div>
              </button>
            `;
          }).join("")}
        </div>
      </div>
      <div class="gallery-lightbox" data-lightbox>
        <div class="gallery-lightbox-inner">
          <button class="gallery-close" type="button" aria-label="Close image preview" data-lightbox-close>×</button>
          <img src="" alt="">
        </div>
      </div>
    </section>
  `;
}

function faqSchema(items) {
  if (!items || !items.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };
}

function breadcrumbSchema(crumbs) {
  if (!crumbs || !crumbs.length) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: fullUrl(crumb.route)
    }))
  };
}

function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: "Dr. Sanjo Cine Mathew",
    alternateName: "Sanjo Cine Mathew",
    url: `${BASE_URL}/`,
    image: `${BASE_URL}/assets/imgs/avatar.jpg`,
    jobTitle: "Counselling Psychologist, Skill Coach, Learning Facilitator, Human Development Practitioner, and Founder of WayMaker Skills™",
    description: "Dr. Sanjo Cine Mathew is a counselling psychologist in India, skill coach, learning facilitator, author, and founder of WayMaker Skills™.",
    sameAs: socialLinks.map((link) => link.href),
    email: "biosanjo@gmail.com",
    telephone: "+91 96453 43777",
    knowsAbout: [
      "Counselling Psychology",
      "Human Development",
      "Leadership Coaching",
      "Emotional Intelligence",
      "Student Development Programs",
      "Parenting Workshops",
      "Women Empowerment Training",
      "Corporate Learning Programs",
      "Life Skills Programs",
      "Communication Skills Training"
    ]
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Sanjo Cine Mathew",
    url: `${BASE_URL}/`,
    description: "Personal brand website of Dr. Sanjo Cine Mathew.",
    inLanguage: "en-IN"
  };
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${BASE_URL}${routes.waymaker}#organization`,
    name: "WayMaker Skills™",
    url: waymakerLinks.company,
    founder: {
      "@id": `${BASE_URL}/#person`
    },
    description: "WayMaker Skills™ is the human development and applied intelligence organization founded by Dr. Sanjo Cine Mathew.",
    sameAs: [waymakerLinks.company]
  };
}

function serviceSchema(name, description, route) {
  return {
    "@type": "Service",
    name,
    description,
    provider: {
      "@id": `${BASE_URL}/#person`
    },
    areaServed: "India",
    url: fullUrl(route)
  };
}

function articleSchema(post) {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${BASE_URL}${post.image || "/assets/imgs/blog1.jpg"}`,
    url: fullUrl(`${routes.blog}${post.slug}/`),
    datePublished: post.date,
    keywords: post.tags,
    author: {
      "@id": `${BASE_URL}/#person`
    },
    publisher: {
      "@id": `${BASE_URL}/#website`
    }
  };
}

function bookSchema() {
  return {
    "@type": "Book",
    name: "The Resilience Response: The Blueprint for Intentional Living",
    author: {
      "@id": `${BASE_URL}/#person`
    },
    image: `${BASE_URL}/blog/images/post/the-resilience-response-sanjo-blog.png`,
    isbn: "9789334282962",
    bookFormat: ["EBook", "Paperback"],
    url: fullUrl(routes.shop),
    description: "A practical read on intentional living, emotional resilience, and growth-oriented mindset building."
  };
}

function renderSchemas(page) {
  const graph = [websiteSchema(), personSchema()];
  if (page.breadcrumbs) {
    const crumbs = breadcrumbSchema(page.breadcrumbs);
    if (crumbs) graph.push(crumbs);
  }
  if (page.faqItems) {
    const faq = faqSchema(page.faqItems);
    if (faq) graph.push(faq);
  }
  if (page.service) {
    graph.push(serviceSchema(page.service.name, page.service.description, page.route));
  }
  if (page.route === routes.waymaker) {
    graph.push(organizationSchema());
  }
  if (page.article) {
    graph.push(articleSchema(page.article));
  }
  if (page.route === routes.shop) {
    graph.push(bookSchema());
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function renderPage(page) {
  const title = page.title;
  const description = page.description;
  const canonical = fullUrl(page.route);
  const bodyClass = page.bodyClass ? ` class="${page.bodyClass}"` : "";
  const ogImage = page.ogImage ? `${BASE_URL}${page.ogImage}` : `${BASE_URL}/assets/imgs/avatar.jpg`;
  const content = canonicalizeMarkup(page.content);

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="Jijish Thomas">
  <meta name="theme-color" content="#1d4f91">
  <link rel="canonical" href="${canonical}">
  <meta property="og:locale" content="en_IN">
  <meta property="og:type" content="${page.article ? "article" : "website"}">
  <meta property="og:site_name" content="Sanjo Cine Mathew">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="${page.ogAlt || "Sanjo Cine Mathew"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  </script>
  <script type="application/ld+json">${renderSchemas(page)}</script>
</head>
<body${bodyClass}>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <div class="bg-orb a" aria-hidden="true"></div>
  <div class="bg-orb b" aria-hidden="true"></div>
  <div class="site-shell">
    ${renderHeader(page)}
    <main id="main-content">
      ${content}
    </main>
    ${renderFooter()}
  </div>
  <script src="/assets/js/site.js"></script>
</body>
</html>`;
}

function page(route, data) {
  return {
    route,
    breadcrumbs: route === "/" ? null : [{ label: "Home", route: "/" }, ...(data.breadcrumbs || [{ label: routeToLabel[route] || data.title.replace(/ \|.*/, ""), route }])],
    ...data
  };
}

const homeFaq = [
  { q: "Who are Sanjo's programs designed for?", a: "The programmes are designed for students, parents, educators, women, professionals, leaders, schools, and organizations seeking clarity, life skills, emotional intelligence, leadership, and human development support." },
  { q: "Can I request one-to-one counselling or coaching?", a: "Yes. Sanjo offers clarity-centered counselling, coaching, and consultation pathways for personal growth, emotional resilience, and life transitions." },
  { q: "Do you offer school and institutional programs?", a: "Yes. Sanjo works with schools, colleges, educators, and parent communities through student programmes, teacher capacity building, parenting interventions, and future-readiness sessions." },
  { q: "How do I start quickly?", a: "Use the contact or consultation booking page, share your context, and Sanjo's team will guide you toward the right programme, session format, or organizational pathway." }
];

const programDetails = [
  {
    route: "/programs/inspire-creative-innovator-workshop/",
    sourceId: "inspire",
    title: "I.N.S.P.I.R.E. Series: Creative Innovator Workshop / Summer Camp",
    eyebrow: "Student & Youth Program",
    description: "Ignite Your Potential, Empower Your Minds through creativity, innovation, personal development, communication mastery, team building, cognitive drills, and artistic kinesthetics.",
    image: "/summer-camp/images/hero.jpg",
    audience: ["Junior Creators: 10-15", "Creative Dynamo: 16-25", "Leadership Catalysts: Women 18-35", "Kerala and international Zoom groups"],
    highlights: ["Online and offline availability", "Workshop insights", "Team building activities", "Innovative games", "Multiple intelligence skills", "Communication mastery", "Cognitive drills", "Artistic kinesthetics", "Offline workshop at chosen venue", "Online workshop across time zones"],
    outcomes: ["Creativity and innovation", "Confidence and expression", "Collaborative learning", "Leadership readiness", "Personal development"],
    brochure: "/summer-camp/summer-camp-brochure-sanjo.pdf"
  },
  {
    route: "/programs/empower-to-empowerment-women/",
    sourceId: "empower-to-empowerment",
    title: "Empower to Empowerment",
    eyebrow: "Women's Program",
    description: "A women-focused personal growth and self-discovery program that builds skill development, empowerment strategies, action planning, inner brilliance, and community impact.",
    image: "/assets/imgs/women-empowerment-brochure.png",
    audience: ["Women", "Colleges", "Communities", "Support groups"],
    highlights: ["Skill Enhancement", "Fostering Empowerment", "Community Impact", "Recognition of Inner Brilliance", "Catalyzing Positive Transformation", "Mindfulness and well-being practices"],
    outcomes: ["Skill Development", "Self-Discovery", "Empowerment Strategies", "Goal Setting and Action Planning", "Personalized Feedback"],
    brochure: "/assets/women-empowerment-brochure-sanjo.pdf"
  },
  {
    route: "/programs/clarity-crest-counselling-c3/",
    sourceId: "c3",
    title: "Clarity Crest Counselling / C3",
    eyebrow: "Counselling & Coaching",
    description: "A personalized coaching journey for clarity, goal setting, personal effectiveness, tailored one-to-one support, accountability, and actionable insights.",
    image: "/assets/imgs/clarity-crest.png",
    audience: ["Any age group can benefit", "Students", "Professionals", "People navigating transitions"],
    highlights: ["Tailored Approach", "Peak Clarity", "Goal Mastery", "Insights for Impact", "Efficiency in Every Session"],
    outcomes: ["Improved focus", "Stronger decision-making", "Increased confidence", "Academic, career, and life goal clarity"],
    brochure: "/assets/clarity-crest-counsel-sanjo.pdf"
  },
  {
    route: "/programs/parenting-with-passion/",
    sourceId: "parenting-with-passion",
    title: "Parenting With Passion",
    eyebrow: "Parenting Workshop",
    description: "A practical parenting workshop for secure emotional foundations, healthy communication, positive discipline, resilient children, and long-term family development outcomes.",
    image: "/assets/imgs/parenting-with-passion.jpg",
    audience: ["Parents", "Caregivers", "School parent communities"],
    highlights: ["Building Strong Emotional Foundations", "Forming Secure Attachments", "Effective Communication", "Positive Discipline", "Stimulating Cognitive Development", "Balancing Technology and Well-being"],
    outcomes: ["Future Success Orientation", "Academic Success Support", "Stronger Family Bond", "Improved Social Competence", "Better Emotional Well-being"],
    brochure: "/assets/Sanjo-Parenting-With-passion-brochure.pdf"
  },
  {
    route: "/programs/personal-effectiveness-mentorship/",
    sourceId: "personal-effectiveness-mentorship",
    title: "Personal Effectiveness Mentorship Program",
    eyebrow: "Mentorship",
    description: "A holistic interactive initiative for life skills, personality growth, leadership strength, assessment-led guidance, one-to-one mentoring, workshops, counselling support, and long-term action planning.",
    image: "/assets/imgs/personal-effectiveness-mentorship-program-sanjo.png",
    audience: ["Parents", "Teachers", "Students", "Women", "Corporates"],
    highlights: ["Understand strengths, weaknesses, and potential through assessments", "One-to-one mentoring", "Life-skill workshops", "Personalized action plan"],
    outcomes: ["Building a Strong Foundation", "Effective Communication and Active Listening", "Developing Emotional Intelligence", "Team Collaboration", "Leadership, Decision Making, and Problem Solving", "Ethics, Integrity, Career Exploration, and Planning"],
    brochure: "/assets/personal-effectiveness-mentorship-program-sanjo.pdf"
  },
  {
    route: "/programs/overcome-exam-stress-smart-learning/",
    sourceId: "exam-stress",
    title: "Overcome Exam Stress Through Transformational Smart Learning",
    eyebrow: "Student Workshop",
    description: "An activity-based student workshop to reduce exam stress, improve learning quality, build structure and strategy, and shift anxious studying into deep, constructive, meaningful learning.",
    image: "/assets/imgs/exam-stress.jpg",
    audience: ["Students", "Parents", "Schools", "English and Malayalam Zoom batches where relevant"],
    highlights: ["Understanding Exam Stress", "Time Management Techniques", "Effective Study Strategies", "Mindfulness and Relaxation", "Building a Positive Mindset"],
    outcomes: ["Personalized Counselling Insights", "Stress-Free Exam Strategies", "Strategic Goal Planning", "Better confidence", "Emotional control", "Better focus and retention"],
    brochure: "/assets/overcome-exam-stress-transformational-smart-learning-workshop-sanjo.pdf"
  },
  {
    route: "/programs/corporate-excellence-transformational-learning/",
    sourceId: "corporate-excellence",
    title: "Corporate Excellence & Transformational Learning / E.L.E.V.A.T.E.",
    eyebrow: "Corporate Learning",
    description: "A corporate learning experience built around Empowerment, Leadership, Engagement, Values, Alignment, Transformation & Excellence.",
    image: "/assets/imgs/elevate.png",
    audience: ["Corporate teams", "Managers", "HR and L&D leaders", "Organizations in transition"],
    highlights: ["Leadership Elevation", "Engage & Empower / DEI", "Voice & Influence / Storytelling", "Adventure Labs / Outbound Learning", "Transformation Mindset", "Emotional Mastery"],
    outcomes: ["Executive capability enhancement", "Team-building", "Experiential outbound learning", "Emotional intelligence", "Communication", "Behavioral effectiveness", "Productivity", "Collaboration", "Organizational growth"],
    brochure: null
  }
];

programDetails.forEach((detail) => {
  const program = signaturePrograms.find((item) => item.id === detail.sourceId);
  if (program) program.detailHref = detail.route;
});

const programDetailPages = programDetails.map((detail) => page(detail.route, {
  title: `${detail.title} | Sanjo Cine Mathew`,
  description: detail.description,
  ogImage: detail.image,
  service: { name: detail.title, description: detail.description },
  breadcrumbs: [{ label: "Programs", route: routes.programs }, { label: detail.title, route: detail.route }],
  content: [
    renderHero({
      eyebrow: detail.eyebrow,
      title: detail.title,
      copy: detail.description,
      actions: [
        anchor(routes.consultation, "Book a Consultation", "btn btn-primary"),
        anchor(routes.contact, "Register Interest", "btn btn-secondary"),
        detail.brochure ? anchor(detail.brochure, "Download Brochure", "btn btn-soft") : anchor(routes.corporateLearning, "Explore Corporate Learning", "btn btn-soft")
      ],
      media: { image: detail.image, alt: detail.title },
      panelTitle: "Best for",
      panelList: detail.audience
    }, renderBreadcrumbs({ route: detail.route, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Programs", route: routes.programs }, { label: detail.title, route: detail.route }] })),
    `
    <section class="section">
      <div class="container split-panel">
        <article class="story-card reveal">
          ${sectionHeader({ eyebrow: "Program Highlights", title: "What the program includes.", copy: "Old program detail content is restored here in a structured, SEO-friendly format." })}
          ${list(detail.highlights)}
        </article>
        <article class="story-card reveal">
          ${sectionHeader({ eyebrow: "Outcomes", title: "What participants work toward.", copy: "Each detail page keeps practical outcomes visible instead of burying them in a summary card." })}
          ${list(detail.outcomes)}
        </article>
      </div>
    </section>
    `,
    ctaBand({
      title: "Ready to adapt this program to your context?",
      copy: "Share the audience, preferred format, venue or online need, and intended outcomes so the program can be shaped clearly.",
      actions: [
        anchor(routes.contact, "Enquire Now", "btn btn-soft"),
        anchor(routes.consultation, "Book a Consultation", "btn btn-secondary"),
        anchor(routes.programs, "Back to Programs", "btn btn-secondary")
      ]
    })
  ].join("")
}));

const pages = [
  ...programDetailPages,
  page("/", {
    title: "Sanjo Cine Mathew | Counselling Psychologist, Skill Coach & Founder of WayMaker Skills™",
    description: "Discover Dr. Sanjo Cine Mathew, counselling psychologist in India, skill coach, learning facilitator, human development practitioner, author, and founder of WayMaker Skills™.",
    ogImage: "/assets/imgs/avatar.jpg",
    bodyClass: "page-home",
    content: [
      renderHero({
        className: "home-hero",
        eyebrow: "Counselling Psychologist & Performance Strategist",
        title: "Transforming Potential into Purpose.",
        copy: "I am Dr. Sanjo Cine Mathew, a Counselling Psychologist, Educator, Author, and Human Development Practitioner committed to helping people discover their strengths, develop essential life skills, and create meaningful change. Founder, WayMaker Skills™.",
        actions: [
          anchor("/programs/", "Explore Programs", "btn btn-primary"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary"),
          anchor(`${routes.corporateLearning}#elevate`, "Explore E.L.E.V.A.T.E.", "btn btn-soft"),
          anchor(waymakerLinks.company, "WayMaker Skills™", "btn btn-soft")
        ],
        scrollCue: "Scroll to explore Sanjo's pathways for growth",
        stats: [
          { label: "Years of professional insight", value: 20, suffix: "+" },
          { label: "Lives impacted", value: 7000, suffix: "+" },
          { label: "Sessions delivered", value: 700, suffix: "+" },
          { label: "Certifications", value: 50, suffix: "+" }
        ],
        media: {
          image: "/assets/imgs/avatar.jpg",
          alt: "Portrait of Dr. Sanjo Cine Mathew"
        },
        panelTitle: "The Strategist for Transformative Growth",
        panelCopy: "Sanjo's work blends psychology, education, practical life intelligence, and human-centered performance development.",
        panelHtml: `<div class="founder-badge"><small>Founder of</small><span>WayMaker Skills</span></div>`,
        panelList: [
          "Mindset Architect",
          "Skill Development Strategist",
          "Performance Mentor",
          "Women Empowerment Advocate",
          "Corporate Trainer",
          "Learning & Development Consultant"
        ],
        panelMeta: ["Dr. Sanjo Cine Mathew", "Founder, WayMaker Skills™", "Counselling Psychologist in India"]
      }),
      `
      <section class="section section-ornate">
        <div class="container home-identity-grid">
          <div class="identity-copy reveal">
            ${sectionHeader({
              eyebrow: "Personal Brand",
              title: "The strategist for transformative growth.",
              copy: "Sanjo's personal brand sits at the intersection of emotional depth, practical skill-building, future readiness, and purposeful action."
            })}
            <p class="muted">His work connects counselling psychology, education, personal effectiveness, communication, leadership, parenting, empowerment, and institutional learning into practical growth pathways.</p>
            <div class="button-row">
              <a class="btn btn-primary" href="/about/">Explore My Journey</a>
            </div>
          </div>
          <div class="role-grid reveal" aria-label="Sanjo's professional roles">
            ${[
              ["Mindset Architect", "mind"],
              ["Skill Development Strategist", "growth"],
              ["Performance Mentor", "leadership"],
              ["Women Empowerment Advocate", "people"],
              ["Learning Facilitator", "book"],
              ["Corporate Trainer", "bridge"]
            ].map(([role, icon]) => `<div class="role-chip">${iconSvg(icon)}<strong>${role}</strong></div>`).join("")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "About Preview",
            title: "Expertise that blends psychology, education, leadership, and human development.",
            copy: "Each intervention is designed to move people from insight to action with practical structure and emotional intelligence."
          })}
          ${renderCards(expertiseAreas.slice(0, 6).map((item, index) => ({
            icon: ["calm", "growth", "bridge", "leadership", "mind", "message"][index] || "spark",
            title: item.title,
            copy: item.copy,
            links: [anchor(item.href, "Explore Area", "btn btn-secondary")]
          })), "feature-card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Signature Programs",
            title: "Signature interventions designed for measurable outcomes.",
            copy: "Personal programmes across counselling, student development, leadership, parenting, empowerment, and corporate transformation."
          })}
          ${programCards(signaturePrograms.slice(0, 7))}
        </div>
      </section>
      `,
      `
      <section class="section section-ornate">
        <div class="container waymaker-bridge reveal">
          ${decorLayer("bridge-decor")}
          <div class="split-panel">
          <div class="quote-panel reveal">
            <blockquote>Founder of WayMaker Skills™</blockquote>
            <p>WayMaker Skills™ is the human development and applied intelligence organization founded by Sanjo Cine Mathew. It helps learners, educators, families, professionals, leaders, and organizations build future-ready skills, leadership, emotional intelligence, communication, purpose, and growth.</p>
            <div class="chips">
              ${["Human Development", "Applied Intelligence", "Leadership", "Emotional Intelligence", "Future Skills", "Purposeful Growth"].map((item) => `<span class="chip">${item}</span>`).join("")}
            </div>
            <div class="button-row">
              ${anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-soft")}
              ${anchor(routes.waymaker, "Explore WayMaker Programs on Sanjo.in", "btn btn-secondary")}
            </div>
          </div>
          <div class="stack">
            ${renderCards([
              {
                title: "WAMI™ — Children's Life Skills",
                copy: "A joyful children's life skills world built around stories, games, activities, confidence, creativity, communication, character, and reflection.",
                links: [
                  anchor(routes.wami, "Read Overview", "btn btn-secondary"),
                  anchor(waymakerLinks.wami, "Learn More at WayMaker Skills™", "btn btn-soft")
                ]
              },
              {
                title: "NOVA™ — Human Development Methodology",
                copy: "A clear developmental pathway built around Notice, Own, Visualize, and Act.",
                links: [
                  anchor(routes.nova, "Read Overview", "btn btn-secondary"),
                  anchor(waymakerLinks.nova, "Learn More at WayMaker Skills™", "btn btn-soft")
                ]
              },
              {
                title: "LQ™ — Life Intelligence Quotient Framework",
                copy: "A five-dimensional framework for how people think, feel, connect, act, and adapt in life.",
                links: [
                  anchor(routes.lq, "Read Overview", "btn btn-secondary"),
                  anchor(waymakerLinks.lq, "Learn More at WayMaker Skills™", "btn btn-soft")
                ]
              }
            ], "framework-card", "grid-1")}
          </div>
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Audience Pathways",
            title: "Quick pathway selector.",
            copy: "Each audience enters from a different need, but the goal is the same: clarity, capability, and meaningful transformation."
          })}
          ${renderCards([
            { icon: "book", title: "I am a Student", copy: "Exam confidence, future readiness, self-expression, and learning habits.", links: [anchor("/schools-students-parents/", "See Student Pathway", "btn btn-secondary")] },
            { icon: "family", title: "I am a Parent", copy: "Emotional guidance, communication, boundaries, and developmental support at home.", links: [anchor("/schools-students-parents/#parenting-with-passion", "See Parent Pathway", "btn btn-secondary")] },
            { icon: "people", title: "I represent a School", copy: "Whole-ecosystem support across students, parents, and educators.", links: [anchor("/schools-students-parents/", "See School Pathway", "btn btn-secondary")] },
            { icon: "bridge", title: "I represent an Organization", copy: "Leadership, collaboration, culture, and human-centered performance.", links: [anchor("/corporate-learning/", "See Organization Pathway", "btn btn-secondary")] },
            { icon: "calm", title: "I want Counselling", copy: "Clarity, emotional steadiness, decision support, and one-to-one growth.", links: [anchor("/counselling-coaching/", "See Counselling Pathway", "btn btn-secondary")] },
            { icon: "growth", title: "I want Women Empowerment", copy: "Identity, confidence, voice, well-being, and action planning.", links: [anchor("/women-empowerment/", "See Women Pathway", "btn btn-secondary")] }
          ], "path-card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section section-ornate">
        <div class="container">
          <div class="book-showcase split-panel reveal">
            ${decorLayer("book-decor")}
            <article class="stack">
              ${sectionHeader({
                eyebrow: "Featured Book",
                title: "The Resilience Response: The Blueprint for Intentional Living",
                copy: "A practical read on intentional living, emotional resilience, and growth-oriented mindset building."
              })}
              <p>by Dr. Sanjo Cine Mathew</p>
              <div class="outcome-chips">
                ${["Intentional living", "Emotional resilience", "Growth mindset"].map((item) => `<span>${item}</span>`).join("")}
              </div>
              <div class="button-row">
                ${anchor(routes.shop, "View Book", "btn btn-soft")}
                ${anchor("https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0", "Buy / Explore", "btn btn-secondary")}
                ${anchor(routes.consultation, "Pair with Consultation", "btn btn-secondary")}
              </div>
            </article>
            <div class="book-cover-wrap">
              <img src="/blog/images/post/the-resilience-response-sanjo-blog.png" alt="The Resilience Response book cover by Dr. Sanjo Cine Mathew" loading="lazy" decoding="async">
            </div>
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Latest Insights",
            title: "Fresh reflections from the blog.",
            copy: "Latest posts are populated from the same JSON file used by the blog index and article pages."
          })}
          <div class="grid-3">
            ${blogPosts.slice(0, 3).map((post) => renderBlogCard(post, { cta: "Read Insight" })).join("")}
          </div>
          <div class="button-row reveal" style="margin-top:20px;">
            ${anchor(routes.blog, "View all insights", "btn btn-primary")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section" id="impact">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Transformation Outcomes",
            title: "What transformation looks like in practice.",
            copy: "Sanjo's work is designed to move people from confusion to confidence and from awareness to applied change."
          })}
          ${renderCards([
            { icon: "growth", title: "Confidence", copy: "A stronger sense of self, voice, and healthy initiative." },
            { icon: "message", title: "Communication", copy: "Clearer expression, listening, empathy, and influence." },
            { icon: "calm", title: "Emotional Maturity", copy: "Better regulation, reflection, and resilience under stress." },
            { icon: "leadership", title: "Leadership", copy: "Personal responsibility, presence, and purpose-led decision making." },
            { icon: "bridge", title: "Adaptability", copy: "The ability to adjust intelligently in changing situations." },
            { icon: "spark", title: "Purposeful Action", copy: "Practical life intelligence for school, work, and relationships." }
          ], "metric-card", "grid-3")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "FAQ Preview",
        title: "Common questions about working with Sanjo.",
        copy: "A quick orientation to consultations, programmes, and partnership pathways.",
        items: homeFaq
      }),
      ctaBand({
        title: "Let us build your next transformation roadmap.",
        copy: "Start with a consultation, share your context, and move toward a pathway that fits your life stage, goals, or organizational reality.",
        actions: [
          anchor("/book-consultation/", "Book a Consultation", "btn btn-soft"),
          anchor("/contact/", "Send a Message", "btn btn-secondary"),
          anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-secondary")
        ]
      })
    ].join(""),
    faqItems: homeFaq
  }),
  page(routes.about, {
    title: "About Sanjo Cine Mathew | Counselling Psychologist & Founder of WayMaker Skills™",
    description: "Learn about Dr. Sanjo Cine Mathew, counselling psychologist, educator, human development practitioner, author, and founder of WayMaker Skills™.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: [
      renderHero({
        eyebrow: "About Sanjo",
        title: "About Sanjo Cine Mathew",
        copy: "Counselling Psychologist, Educator, Author, Skill Coach, Learning Facilitator, and Founder of WayMaker Skills™.",
        actions: [
          anchor("/programs/", "Explore Programs", "btn btn-primary"),
          anchor("/contact/", "Work With Sanjo", "btn btn-secondary")
        ],
        media: { image: "/assets/imgs/avatar.jpg", alt: "Dr. Sanjo Cine Mathew portrait" },
        panelTitle: "A personal brand rooted in human growth",
        panelCopy: "Sanjo.in is the personal website of Dr. Sanjo Cine Mathew. WayMaker Skills™ is the organization he founded to scale human development and applied intelligence programmes."
      }, renderBreadcrumbs({ route: routes.about, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "About Sanjo", route: routes.about }] })),
      splitStory({
        eyebrow: "Story",
        title: "A journey shaped by psychology, education, and the real human work of growth.",
        copy: "Sanjo's work has grown from a deep interest in human behavior into a multi-dimensional practice serving learners, families, professionals, leaders, and institutions.",
        paragraphs: [
          "Over the years, he has worked across counselling psychology, student development, parenting guidance, educator support, wellness, communication, and leadership transformation. That breadth matters because people do not grow in isolated compartments.",
          "His practice is not built on abstract theory alone. It draws from live facilitation, individual support, school environments, institutional learning, and corporate transformation contexts where emotional intelligence and practical capability must work together.",
          "This blend of psychological insight, educational thinking, and real-world facilitation has shaped Sanjo into a trusted guide for people who want change that is both meaningful and usable."
        ],
        image: "/assets/imgs/header.jpg",
        imageAlt: "Sanjo Cine Mathew at a live training session",
        quoteTitle: "Transforming Potential into Purpose",
        quoteCopy: "Growth happens when mindset, emotional strength, practical skills, and purposeful action come together in a way people can sustain.",
        quoteBy: "Dr. Sanjo Cine Mathew"
      }),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Journey Timeline",
            title: "A connected path from insight to institution-building.",
            copy: "The About page now groups Sanjo's journey as a clear set of milestones instead of disconnected content blocks."
          })}
          <div class="timeline-steps">
            ${[
              ["Psychology foundation", "Counselling psychology, emotional insight, and human behavior form the base of Sanjo's work."],
              ["Education and facilitation", "Teaching, learning strategy, and student development shaped his practical approach."],
              ["Counselling and coaching practice", "One-to-one support brought clarity, goal setting, personal effectiveness, and emotional resilience into focus."],
              ["Corporate and institutional training", "Leadership, team building, communication, and professional development expanded the work into organizations."],
              ["Founder of WayMaker Skills™", "WayMaker Skills™ became the organization bridge for broader human development and applied intelligence pathways."]
            ].map(([title, copy]) => `
              <article class="timeline-step reveal">
                <h3>${title}</h3>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Professional Identity",
            title: "Roles that define Sanjo's contribution.",
            copy: "His professional identity is intentionally multidisciplinary because people and institutions need integrated support."
          })}
          ${renderCards([
            { title: "Director & Founder", copy: "Leading the vision and strategic direction behind WayMaker Skills™." },
            { title: "Human Development Specialist", copy: "Designing growth pathways that connect awareness, learning, and action." },
            { title: "Corporate Trainer", copy: "Facilitating human-centered professional learning for organizations and teams." },
            { title: "Leadership Coach", copy: "Helping leaders build self-awareness, emotional steadiness, and influence." },
            { title: "Counselling Psychologist", copy: "Supporting clarity, emotional resilience, and personal transitions." },
            { title: "Wellness & Mindfulness Coach", copy: "Promoting reflective living, balance, and sustainable well-being." },
            { title: "Learning & Development Consultant", copy: "Building experiences that improve retention, relevance, and behavior change." },
            { title: "Learning Strategist", copy: "Translating knowledge into engagement, structure, and practical outcomes." }
          ], "card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container comparison">
          <article class="card reveal">
            <h3>Sanjo.in</h3>
            <p>This is Sanjo's personal brand website. It focuses on who he is, what he stands for, his expertise, personal programmes, credentials, and consultation pathways.</p>
          </article>
          <article class="card reveal">
            <h3>WayMaker Skills™</h3>
            <p>This is the organization founded by Sanjo. It carries broader institutional, organizational, methodology, and scalable human development initiatives.</p>
            <div class="button-row" style="margin-top:14px;">
              ${anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-soft")}
            </div>
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container split-panel">
          <div class="story-card reveal">
            ${sectionHeader({
              eyebrow: "Mission",
              title: "Helping people discover strengths, build clarity, and create meaningful change.",
              copy: "Sanjo's mission is not simply to motivate people but to help them understand themselves better and move with greater maturity, confidence, and direction."
            })}
            ${list([
              "Support people through confusion, transition, pressure, and untapped potential.",
              "Build essential life skills that make growth usable in daily life.",
              "Strengthen personal, relational, and professional effectiveness.",
              "Create learning experiences that are reflective, practical, and deeply human."
            ])}
          </div>
          <div class="timeline">
            ${[
              ["Psychology", "Bringing emotional insight, behavioural awareness, and clarity to personal growth."],
              ["Education", "Helping learners and educators build effective, human-centered development pathways."],
              ["Leadership", "Supporting people who influence others to lead with greater self-awareness and responsibility."],
              ["Human Development", "Building frameworks that connect thinking, emotion, action, and adaptability."]
            ].map(([title, copy]) => `
              <article class="timeline-card reveal">
                <h3>${title}</h3>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section tight">
        <div class="container">
          <div class="cta-band reveal">
            <div class="stack">
              <p class="eyebrow">Core Philosophy</p>
              <h2>Awareness. Clarity. Skill. Purpose. Action.</h2>
              <div class="chips">
                ${["Awareness", "Clarity", "Skill", "Purpose", "Action"].map((item) => `<span class="chip">${item}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </section>
      `,
      ctaBand({
        title: "Explore Sanjo's programmes, expertise, and consultation pathways.",
        copy: "If you are looking for a personal, institutional, or organizational growth roadmap, begin with the pathway that matches your current context.",
        actions: [
          anchor("/programs/", "Explore Programs", "btn btn-soft"),
          anchor("/contact/", "Work With Sanjo", "btn btn-secondary"),
          anchor("/resume/", "View Credentials", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/expertise/", {
    title: "Expertise | Sanjo Cine Mathew",
    description: "Explore Sanjo Cine Mathew's expertise in counselling psychology, leadership, emotional intelligence, life skills, corporate training, student development, parenting, and human development.",
    ogImage: "/assets/imgs/header_small.jpg",
    service: {
      name: "Human development, counselling, and learning facilitation expertise",
      description: "Integrated expertise across counselling psychology, leadership, life skills, parenting, student development, and corporate learning."
    },
    content: [
      renderHero({
        eyebrow: "Expertise",
        title: "Expertise across psychology, education, leadership, and life skills.",
        copy: "Sanjo's work is shaped by how people actually learn, feel, decide, relate, and perform under real conditions.",
        actions: [anchor("/programs/", "Explore Programs", "btn btn-primary"), anchor("/contact/", "Discuss Your Context", "btn btn-secondary")],
        media: { image: "/assets/imgs/header_small.jpg", alt: "Sanjo Cine Mathew teaching and facilitating" },
        panelTitle: "Approach that is psychology-based and outcome-oriented",
        panelList: ["Psychology-based", "Experiential", "Reflective", "Practical", "Outcome-oriented", "Purpose-driven"]
      }, renderBreadcrumbs({ route: "/expertise/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Expertise", route: "/expertise/" }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Expertise Grid",
            title: "Core domains of Sanjo's work.",
            copy: "Each area connects to specific audience needs, program formats, and measurable developmental outcomes."
          })}
          ${renderCards(expertiseAreas.map((item) => ({
            title: item.title,
            copy: item.copy,
            links: [anchor(item.href, "Relevant Pathway", "btn btn-secondary")]
          })), "card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container split-panel">
          <div class="story-card reveal">
            ${sectionHeader({
              eyebrow: "Approach",
              title: "How Sanjo works across diverse audiences.",
              copy: "The method is always adaptive, but the underlying discipline remains consistent: create safe awareness, practical structure, and action-led movement."
            })}
            ${list([
              "Begin with context rather than assumptions.",
              "Translate psychological insight into usable action.",
              "Use experiential facilitation to improve retention and engagement.",
              "Measure success through visible change in confidence, communication, decision making, and accountability."
            ])}
          </div>
          ${renderCards([
            { title: "Students", copy: "Confidence, life skills, focus, study habits, and future readiness." },
            { title: "Parents", copy: "Communication, emotional guidance, discipline, and developmental clarity." },
            { title: "Teachers", copy: "Capacity building, learner connection, and reflective classroom practice." },
            { title: "Women", copy: "Identity, confidence, clarity, emotional strength, and empowerment." },
            { title: "Professionals", copy: "Personal effectiveness, communication, leadership presence, and adaptability." },
            { title: "Leaders & Teams", copy: "Culture, collaboration, emotional intelligence, and performance under change." }
          ], "audience-card", "grid-2")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Questions",
        title: "Choosing the right expertise area.",
        copy: "These questions often come up when individuals or institutions are trying to decide where to begin.",
        items: [
          { q: "Can one program combine multiple expertise areas?", a: "Yes. Many of Sanjo's interventions combine counselling insight, emotional intelligence, communication, and leadership development because real needs rarely fit into one isolated category." },
          { q: "Do these expertise areas apply only to formal workshops?", a: "No. They apply to one-to-one work, school interventions, parent sessions, group facilitation, leadership programmes, and corporate learning pathways." },
          { q: "How do I know which pathway fits my need?", a: "Start with the context: who the audience is, what challenge they are facing, and what visible outcomes you want. The consultation process can then shape the right pathway." },
          { q: "Can organizational and personal needs be addressed differently?", a: "Yes. Sanjo.in focuses on the personal brand and personal pathways, while WayMaker Skills™ provides the broader organizational bridge when scale and institutional depth are needed." }
        ]
      }),
      ctaBand({
        title: "Turn expertise into the right next step.",
        copy: "Move from exploration to a concrete pathway for counselling, learning, student development, leadership, or organizational growth.",
        actions: [
          anchor("/programs/", "See Programs", "btn btn-soft"),
          anchor("/contact/", "Contact Sanjo", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.programs, {
    title: "Programs | Sanjo Cine Mathew",
    description: "Explore counselling, coaching, student development, parenting, women empowerment, leadership, and corporate training programs by Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/program-banner-header.png",
    service: {
      name: "Programs by Sanjo Cine Mathew",
      description: "Counselling, coaching, life skills, student development, parenting, women empowerment, and corporate learning programmes."
    },
    content: [
      renderHero({
        eyebrow: "Programs",
        title: "Programs for clarity, confidence, capability, and purposeful growth.",
        copy: "A complete index of Sanjo's signature programs across personal development, education, institutional support, and corporate learning.",
        actions: [anchor("/contact/", "Enquire Now", "btn btn-primary"), anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")],
        media: { image: "/assets/imgs/program-banner-header.png", alt: "Sanjo Cine Mathew program banner" },
        panelTitle: "Program categories",
        panelMeta: ["Students", "Parents", "Women", "Professionals", "Corporates", "Schools", "Personal Growth"]
      }, renderBreadcrumbs({ route: routes.programs, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Programs", route: routes.programs }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Program Index",
            title: "Signature interventions across audiences and outcomes.",
            copy: "Each card points to the most relevant details page and a direct enquiry path."
          })}
          ${programCards(signaturePrograms)}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "How Programs Are Delivered",
            title: "Formats that match the context instead of forcing a generic approach.",
            copy: "Sanjo's programs can be delivered as one-to-one support, intensive workshops, short interventions, or broader learning journeys."
          })}
          ${renderCards([
            { title: "One-to-one Pathways", copy: "Counselling, clarity, coaching, and personal effectiveness work for individuals." },
            { title: "Group Workshops", copy: "Programs for students, parents, women, and community audiences built around shared themes." },
            { title: "Institutional Interventions", copy: "School-wide and educator-facing programmes with developmental continuity." },
            { title: "Corporate Learning Journeys", copy: "Multi-module learning pathways for leadership, communication, culture, and performance." }
          ], "process-card", "grid-4")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "FAQ",
        title: "Questions about program fit and customization.",
        copy: "Start here if you are comparing pathways or considering a customized intervention.",
        items: [
          { q: "Can programs be customized?", a: "Yes. Program design can be adapted to age, audience, time available, developmental need, and organizational context." },
          { q: "Do all programs have to be long-format?", a: "No. Some programmes work as focused sessions or short series, while others are more effective as immersive journeys." },
          { q: "What if I am not sure whether I need counselling, coaching, or a workshop?", a: "That is a common starting point. A consultation helps clarify the need and routes you to the most relevant format." },
          { q: "Are these programs available for institutions and organizations?", a: "Yes. Personal brand pathways begin here, and broader institutional engagements can also connect to WayMaker Skills™ when scale is needed." }
        ]
      }),
      ctaBand({
        title: "Choose the pathway that matches your audience and goals.",
        copy: "Move into program details for corporates, counselling, schools, women empowerment, or broader human development work.",
        actions: [
          anchor("/corporate-learning/", "Corporate Learning", "btn btn-soft"),
          anchor("/counselling-coaching/", "Counselling & Coaching", "btn btn-secondary"),
          anchor("/schools-students-parents/", "Schools, Students & Parents", "btn btn-secondary"),
          anchor("/women-empowerment/", "Women Empowerment", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/corporate-learning/", {
    title: "Corporate Learning & E.L.E.V.A.T.E. | Sanjo Cine Mathew",
    description: "Corporate learning, leadership development, DEI, storytelling, emotional intelligence, team building, and transformation programs by Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/elevate.png",
    service: {
      name: "Corporate learning and E.L.E.V.A.T.E.",
      description: "Leadership, DEI, emotional intelligence, storytelling, communication, and team transformation programs for organizations."
    },
    content: [
      renderHero({
        eyebrow: "Corporate Learning",
        title: "Corporate Learning for Leadership, Culture, and Human-Centered Performance.",
        copy: "Sanjo brings psychology-based facilitation into organizational environments that need stronger leadership, healthier culture, and more adaptive teams.",
        actions: [anchor("/contact/", "Enquire for Corporate Learning", "btn btn-primary"), anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-secondary")],
        media: { image: "/assets/imgs/elevate.png", alt: "E.L.E.V.A.T.E. corporate learning program" },
        panelTitle: "Featured program: E.L.E.V.A.T.E.",
        panelCopy: "Empowerment, Leadership, Engagement, Values, Alignment, Transformation & Excellence.",
        panelList: [
          "Designed for organizations navigating change and complexity",
          "Built for human-centered culture and performance",
          "Structured around measurable capability shifts"
        ]
      }, renderBreadcrumbs({ route: "/corporate-learning/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Programs", route: "/programs/" }, { label: "Corporate Learning", route: "/corporate-learning/" }] })),
      `
      <section class="section" id="elevate">
        <div class="container">
          ${sectionHeader({
            eyebrow: "E.L.E.V.A.T.E.",
            title: "A premium corporate transformation journey.",
            copy: "Designed for organizations that want more than a one-off session and need a deeper shift in leadership behavior, communication, engagement, and adaptability."
          })}
          ${renderCards([
            { title: "Leadership Elevation", copy: "Presence, accountability, decision quality, and responsible influence." },
            { title: "Engage & Empower / DEI", copy: "Human dignity, belonging, collaboration, and inclusive growth." },
            { title: "Voice & Influence / Storytelling", copy: "Communication, meaning-making, and persuasive leadership narratives." },
            { title: "Adventure Labs / Outbound Learning", copy: "Experiential learning for collaboration, trust, and resilience." },
            { title: "Transformation Mindset", copy: "Adapting to complexity with maturity and strategic focus." },
            { title: "Emotional Mastery", copy: "Regulation, self-awareness, and performance steadiness under stress." },
            { title: "Communication Excellence", copy: "Clarity, listening, constructive conversations, and stakeholder trust." },
            { title: "Team Collaboration", copy: "Shared ownership, psychological safety, and aligned execution." },
            { title: "Resilience & Sustainable Performance", copy: "Energy, consistency, and well-directed effort over time." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section" id="corporate-excellence">
        <div class="container comparison">
          <article class="card reveal">
            <h3>Best for</h3>
            ${list(["Managers", "Emerging leaders", "Corporate teams", "HR / L&D teams", "Organizations undergoing change"])}
          </article>
          <article class="card reveal">
            <h3>Outcomes</h3>
            ${list(["Better leadership confidence", "Improved collaboration", "Stronger culture", "Psychological safety", "Communication clarity", "Adaptive thinking", "Accountability"])}
          </article>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Corporate FAQ",
        title: "Questions from teams and decision-makers.",
        copy: "These answers help clarify how Sanjo's personal brand offering connects to broader organizational engagement.",
        items: [
          { q: "Can corporate programmes be designed for one department or an entire organization?", a: "Yes. Interventions can be scoped for leadership groups, functional teams, or broader organizational cohorts depending on the change need." },
          { q: "Is E.L.E.V.A.T.E. only a leadership program?", a: "No. Leadership is central, but the design also addresses culture, communication, engagement, emotional intelligence, and aligned performance." },
          { q: "How does this connect with WayMaker Skills™?", a: "Sanjo leads and shapes the work personally, and large-scale organizational pathways can also be routed through WayMaker Skills™ for broader implementation." },
          { q: "Can programs be delivered offline, online, or hybrid?", a: "Yes. Delivery can be adapted to organizational logistics, geography, and learning goals." }
        ]
      }),
      ctaBand({
        title: "For large-scale organizational programs, visit WayMaker Skills™.",
        copy: "Sanjo's personal brand site provides the leadership and human development bridge. The organizational scale-up lives through WayMaker Skills™.",
        actions: [
          anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-soft"),
          anchor("/contact/", "Send an Enquiry", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/counselling-coaching/", {
    title: "Counselling & Coaching | Sanjo Cine Mathew",
    description: "Counselling, coaching, clarity, stress management, emotional resilience, mindfulness, and personal growth support with Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/clarity-crest.png",
    service: {
      name: "Counselling and coaching",
      description: "Counselling, clarity coaching, exam stress support, emotional resilience, and personal growth pathways."
    },
    content: [
      renderHero({
        eyebrow: "Counselling & Coaching",
        title: "Counselling, Coaching, and Clarity-Centered Growth.",
        copy: "A space for personal clarity, emotional resilience, stress support, performance mindset, and meaningful next steps.",
        actions: [anchor("/book-consultation/", "Book a Consultation", "btn btn-primary"), anchor("/contact/", "Send a Message", "btn btn-secondary")],
        media: { image: "/assets/imgs/clarity-crest.png", alt: "Clarity Crest counselling program visual" },
        panelTitle: "Clarity Crest Counselling / C3 Program",
        panelCopy: "A personalized support pathway for emotional strength, purpose discovery, and personal effectiveness."
      }, renderBreadcrumbs({ route: "/counselling-coaching/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Programs", route: "/programs/" }, { label: "Counselling & Coaching", route: "/counselling-coaching/" }] })),
      `
      <section class="section" id="c3-program">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Support Areas",
            title: "Growth support that meets people where they are.",
            copy: "Counselling and coaching with Sanjo are designed to move beyond surface advice and toward grounded clarity."
          })}
          ${renderCards([
            { title: "One-to-One Counselling", copy: "For personal clarity, emotional processing, and difficult transitions." },
            { title: "Personal Effectiveness Coaching", copy: "For direction, disciplined action, communication, and self-leadership." },
            { title: "Emotional Resilience Support", copy: "For pressure, overwhelm, emotional fatigue, and recovery." },
            { title: "Exam Stress Support", copy: "For students who need calm, structure, and smarter preparation habits." },
            { title: "Wellness & Mindfulness Coaching", copy: "For reflective living, energy balance, and sustainable well-being." },
            { title: "Goal Clarity Sessions", copy: "For people who know they need change but need help seeing the next step clearly." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container comparison">
          <article class="card reveal">
            <h3>What people often seek</h3>
            ${list(["Personal clarity", "Stress management", "Purpose discovery", "Life transitions", "Emotional resilience", "Performance mindset support"])}
          </article>
          <article class="notice reveal">
            <strong>Important note</strong>
            <p>This website shares personal development and counselling support information. It does not replace emergency medical, psychiatric, or crisis care. If someone is in immediate danger, they should contact local emergency support.</p>
          </article>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Counselling FAQ",
        title: "Questions people ask before booking.",
        copy: "A quick orientation for individuals considering one-to-one work with Sanjo.",
        items: [
          { q: "Is this only for people in crisis?", a: "No. People also come for clarity, decision support, personal effectiveness, emotional strength, and reflective growth." },
          { q: "What is the difference between counselling and coaching here?", a: "Counselling often supports emotional processing and resilience, while coaching focuses more on goals, behavior, performance, and forward movement. In practice, the pathway may draw from both." },
          { q: "Can students or parents book support directly?", a: "Yes. Students, parents, and young adults can begin through the consultation pathway and move into the most appropriate support format." },
          { q: "Will sessions stay private and respectful?", a: "Yes. The process is designed to be respectful, thoughtful, and clarity-centered." }
        ]
      }),
      ctaBand({
        title: "Start with a private and respectful conversation.",
        copy: "Book a consultation if you are seeking clarity, support, or the right next step for personal growth.",
        actions: [
          anchor("/book-consultation/", "Book a Consultation", "btn btn-soft"),
          anchor("/contact/", "Send a Message", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/schools-students-parents/", {
    title: "Schools, Students & Parents | Sanjo Cine Mathew",
    description: "Life skills, confidence, emotional awareness, parenting support, student development, and school programs with Dr. Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/parenting-with-passion.jpg",
    service: {
      name: "School, student, and parent development programs",
      description: "Student mentorship, parent guidance, teacher capacity building, exam stress support, and life skills programs."
    },
    content: [
      renderHero({
        eyebrow: "Schools, Students & Parents",
        title: "Life skills, emotional strength, and future readiness for learners and families.",
        copy: "A connected pathway for students, parents, teachers, and schools that want more than academic pressure and need deeper developmental support.",
        actions: [anchor("/contact/", "Enquire for a School or Family Program", "btn btn-primary"), anchor("/programs/", "Explore Programs", "btn btn-secondary")],
        media: { image: "/assets/imgs/parenting-with-passion-2.jpg", alt: "Parents and students in a learning support context" },
        panelTitle: "Audience blocks",
        panelMeta: ["Students", "Parents", "Teachers", "Schools"]
      }, renderBreadcrumbs({ route: "/schools-students-parents/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Programs", route: "/programs/" }, { label: "Schools, Students & Parents", route: "/schools-students-parents/" }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Program Highlights",
            title: "Development pathways for learners and families.",
            copy: "These offerings combine emotional awareness, communication, structure, and practical readiness."
          })}
          ${renderCards([
            { title: "Overcome Exam Stress Through Smart Learning", copy: "Reduce stress, improve planning, and build calm confidence during exam seasons.", links: [anchor("#exam-stress", "View Focus", "btn btn-secondary")] },
            { title: "Parenting With Passion", copy: "Help parents create stronger emotional connection, boundaries, and developmental guidance.", links: [anchor("#parenting-with-passion", "View Focus", "btn btn-secondary")] },
            { title: "Personal Effectiveness Mentorship", copy: "Develop maturity, discipline, communication, and leadership readiness in young people.", links: [anchor("/programs/#personal-effectiveness-mentorship", "View Program", "btn btn-secondary")] },
            { title: "I.N.S.P.I.R.E. Series", copy: "An immersive student experience that develops creativity, confidence, and collaboration.", links: [anchor("#inspire-series", "View Focus", "btn btn-secondary")] },
            { title: "WAMI™ Children's Life Skills", copy: "Early life skill development through structured play, reflection, and emotional learning.", links: [anchor("/wami-childrens-life-skills/", "View Framework", "btn btn-secondary")] }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container grid-2">
          <article class="story-card reveal" id="exam-stress">
            <h3>Overcome Exam Stress Through Smart Learning</h3>
            <p class="muted">Supports students with stress management, time planning, smart learning, and confidence-building.</p>
            ${list(["Stress management", "Study structure", "Healthy preparation habits", "Confidence under pressure"])}
          </article>
          <article class="story-card reveal" id="parenting-with-passion">
            <h3>Parenting With Passion</h3>
            <p class="muted">Helps families strengthen communication, positive discipline, emotional security, and developmental understanding.</p>
            ${list(["Positive discipline", "Emotional security", "Boundaries", "Child development awareness"])}
          </article>
          <article class="story-card reveal" id="inspire-series">
            <h3>I.N.S.P.I.R.E. Series</h3>
            <p class="muted">A creative and leadership-oriented learning camp for junior creators, creative dynamos, and leadership catalysts.</p>
            ${list(["Creativity", "Communication", "Leadership", "Collaboration", "Confidence"])}
          </article>
          <article class="quote-panel reveal">
            <blockquote>Schools grow stronger when students, parents, and educators are developed together.</blockquote>
            <p>Sanjo's work in school ecosystems focuses on long-term human readiness, not just one-time motivation.</p>
            <cite>Integrated family-school development</cite>
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container split-panel">
          <div class="story-card reveal">
            ${sectionHeader({
              eyebrow: "Development Focus",
              title: "What these programs help people build.",
              copy: "The emphasis is practical and human: better habits, healthier communication, emotional steadiness, and future readiness."
            })}
            ${list([
              "Study skills and smart learning systems",
              "Emotional awareness and resilience",
              "Confidence and healthy self-expression",
              "Positive discipline and relational boundaries",
              "Teacher capacity building and classroom insight",
              "Future readiness and practical life skills"
            ])}
          </div>
          <div class="quote-panel reveal">
            <blockquote>WAMI™ expands this work for children's life skills.</blockquote>
            <p>Sanjo.in provides the overview and bridge. WayMaker Skills™ carries the broader framework and scaling pathway.</p>
            <div class="button-row">
              ${anchor("/wami-childrens-life-skills/", "Explore WAMI™", "btn btn-soft")}
              ${anchor(waymakerLinks.wami, "Learn More at WayMaker Skills™", "btn btn-secondary")}
            </div>
          </div>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "FAQ",
        title: "Questions from schools and families.",
        copy: "The most common questions before a student, parent, or school pathway begins.",
        items: [
          { q: "Do you offer separate sessions for students, parents, and teachers?", a: "Yes. Program design can address one audience or a full school ecosystem depending on the need." },
          { q: "Can schools request customized life skills or orientation programmes?", a: "Yes. Student development, parent orientation, teacher capacity building, and school culture sessions can be tailored to context." },
          { q: "Is exam stress support only for high-performing students?", a: "No. It is for any student who needs a calmer, smarter, and more structured approach to learning." },
          { q: "How does WAMI™ connect here?", a: "WAMI™ is a dedicated children's life skills framework presented on Sanjo.in and connected outward to WayMaker Skills™ for deeper organizational context." }
        ]
      }),
      ctaBand({
        title: "Build stronger pathways for learners and families.",
        copy: "Start a conversation if you are a parent, educator, school leader, or student community looking for practical and human-centered development support.",
        actions: [
          anchor("/contact/", "Contact Sanjo", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/women-empowerment/", {
    title: "Women Empowerment | Sanjo Cine Mathew",
    description: "Women empowerment training, identity work, confidence building, well-being, and practical growth support with Dr. Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/women-empowerment-brochure.png",
    service: {
      name: "Women empowerment programs",
      description: "Women empowerment interventions focused on confidence, self-discovery, clarity, emotional strength, and purpose-led action."
    },
    content: [
      renderHero({
        eyebrow: "Women Empowerment",
        title: "Confidence, clarity, voice, and purposeful growth for women.",
        copy: "Sanjo's women empowerment work supports self-discovery, inner strength, emotional well-being, and practical action in personal and community contexts.",
        actions: [anchor("/contact/", "Enquire About a Women's Program", "btn btn-primary"), anchor("/programs/", "See Related Programs", "btn btn-secondary")],
        media: { image: "/assets/imgs/women-empowerment-brochure.png", alt: "Women empowerment program visual" },
        panelTitle: "Featured program: Empower to Empowerment",
        panelCopy: "A structured journey toward self-belief, expression, and meaningful personal movement."
      }, renderBreadcrumbs({ route: "/women-empowerment/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Programs", route: "/programs/" }, { label: "Women Empowerment", route: "/women-empowerment/" }] })),
      `
      <section class="section" id="empower-to-empowerment">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Empower to Empowerment",
            title: "A women-focused intervention rooted in self-discovery and strength.",
            copy: "Designed for women who want to build confidence, emotional clarity, and action-led growth in their personal or community roles."
          })}
          ${renderCards([
            { title: "Self-Discovery", copy: "Recognizing strengths, patterns, internal blocks, and authentic desires." },
            { title: "Inner Strength", copy: "Building emotional steadiness, courage, and grounded self-worth." },
            { title: "Goal Setting", copy: "Turning reflection into meaningful and realistic next steps." },
            { title: "Action Planning", copy: "Creating momentum through practical structure and ownership." },
            { title: "Confidence", copy: "Strengthening voice, presence, and self-expression." },
            { title: "Well-Being", copy: "Supporting energy, balance, and sustainable personal growth." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container comparison">
          <article class="card reveal">
            <h3>Ideal for</h3>
            ${list(["Women's communities", "Colleges", "Support groups", "Leadership circles", "Personal transformation cohorts"])}
          </article>
          <article class="card reveal">
            <h3>Transformation outcomes</h3>
            ${list(["Self-belief", "Emotional strength", "Healthy voice", "Clarity and direction", "Action readiness", "Purposeful confidence"])}
          </article>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Questions",
        title: "How the women empowerment pathway works.",
        copy: "A few common questions before beginning this work.",
        items: [
          { q: "Is this only for women in leadership roles?", a: "No. The pathway is for women across life stages who want strength, clarity, confidence, and meaningful movement." },
          { q: "Can this be delivered for communities or institutions?", a: "Yes. It can be adapted for colleges, groups, organizations, support networks, and community contexts." },
          { q: "Does the work include emotional well-being?", a: "Yes. Emotional clarity and well-being are central because empowerment without inner steadiness is rarely sustainable." },
          { q: "Can this connect with broader institutional programs?", a: "Yes. Personal pathways begin here, and institutional scaling can also connect through WayMaker Skills™ where appropriate." }
        ]
      }),
      ctaBand({
        title: "Create a women-centered growth journey with depth and direction.",
        copy: "Move from aspiration to a structured empowerment pathway built on confidence, inner strength, and practical action.",
        actions: [
          anchor("/contact/", "Contact Sanjo", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.waymaker, {
    title: "WayMaker Skills™ | Sanjo Cine Mathew",
    description: "Learn how WayMaker Skills™, founded by Dr. Sanjo Cine Mathew, connects human development, applied intelligence, future skills, and transformational learning.",
    ogImage: "/assets/imgs/sanjo-cine-mathew.png",
    content: [
      renderHero({
        eyebrow: "WayMaker Skills™",
        title: "The organization founded by Sanjo Cine Mathew.",
        copy: "WayMaker Skills™ is the human development and applied intelligence organization founded by Dr. Sanjo Cine Mathew. Sanjo.in is the personal brand site; WayMaker Skills™ is the organization bridge for broader frameworks and scalable work.",
        actions: [anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-primary"), anchor(routes.programs, "Explore Related Programs", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-cine-mathew.png", alt: "WayMaker Skills visual identity" },
        panelTitle: "What WayMaker Skills™ stands for",
        panelMeta: ["Human Development", "Applied Intelligence", "Leadership", "Emotional Intelligence", "Future Skills", "Purposeful Growth"]
      }, renderBreadcrumbs({ route: routes.waymaker, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "WayMaker Skills™", route: routes.waymaker }] })),
      `
      <section class="section">
        <div class="container comparison">
          <article class="card reveal">
            <h3>Sanjo.in</h3>
            <p>The personal platform of Dr. Sanjo Cine Mathew, focusing on his identity, expertise, programs, credentials, and consultation pathways.</p>
          </article>
          <article class="card reveal">
            <h3>WayMaker Skills™</h3>
            <p>The organization he founded to deliver broader human development, applied intelligence, and scalable learning pathways for multiple audiences and institutions.</p>
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Bridge Clarity",
            title: "Why this page exists on Sanjo.in.",
            copy: "Sanjo.in offers the founder context, the personal brand credibility, and the overview of the frameworks. Larger organizational enquiries should move to WayMaker Skills™."
          })}
          ${renderCards([
            {
              title: "Founder context",
              copy: "Use Sanjo.in to understand who Sanjo is, what he stands for, and how the personal brand connects to the work."
            },
            {
              title: "Framework overview",
              copy: "Use these pages to understand the shape and language of WAMI™, NOVA™, and LQ™ before moving into larger implementations."
            },
            {
              title: "Organizational pathway",
              copy: "Use WayMaker Skills™ when the conversation becomes institutional, multi-program, or company-facing."
            }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Frameworks",
            title: "Featured WayMaker Skills™ frameworks on Sanjo.in.",
            copy: "These pages give a strong internal overview while still bridging visitors to the intended production URLs on WayMaker Skills™."
          })}
          ${renderCards([
            {
              title: "WAMI™ — Children's Life Skills",
              copy: "A joyful children's life skills world built around stories, games, activities, confidence, creativity, communication, character, and reflection.",
              links: [anchor(routes.wami, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.wami, "Learn More at WayMaker Skills™", "btn btn-soft")]
            },
            {
              title: "NOVA™ — Human Development Methodology",
              copy: "A clear developmental pathway built around Notice, Own, Visualize, and Act.",
              links: [anchor(routes.nova, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.nova, "Learn More at WayMaker Skills™", "btn btn-soft")]
            },
            {
              title: "LQ™ — Life Intelligence Quotient Framework",
              copy: "A five-dimensional framework for how people think, feel, connect, act, and adapt in life.",
              links: [anchor(routes.lq, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.lq, "Learn More at WayMaker Skills™", "btn btn-soft")]
            }
          ], "framework-card", "grid-3")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "WayMaker FAQ",
        title: "How WayMaker Skills™ connects to Sanjo's personal brand.",
        copy: "These distinctions matter for clarity, trust, and the right next action.",
        items: [
          { q: "Is Sanjo.in the company website?", a: "No. Sanjo.in is the personal brand website of Dr. Sanjo Cine Mathew." },
          { q: "What is WayMaker Skills™ then?", a: "WayMaker Skills™ is the company or organization founded by Sanjo, focused on human development, applied intelligence, future skills, and institutional pathways." },
          { q: "Why are WAMI™, NOVA™, and LQ™ explained on Sanjo.in?", a: "Because they are closely connected to Sanjo's personal brand story and founder identity. Sanjo.in offers a rich overview while the organizational bridge points to WayMaker Skills™." },
          { q: "Where should large organizational enquiries go?", a: "Visitors can begin here, but large-scale or organizational programmes should also connect through WayMaker Skills™." }
        ]
      }),
      ctaBand({
        title: "Use Sanjo.in for personal brand context and WayMaker Skills™ for organizational scale.",
        copy: "The bridge between the two is intentional: personal credibility, founder clarity, and organizational reach all stay distinct and clear.",
        actions: [
          anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-soft"),
          anchor(routes.contact, "Contact Sanjo", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.wami, {
    bodyClass: "page-wami",
    title: "WAMI™ Children’s Life Skills | Sanjo Cine Mathew",
    description: "WAMI™ is the children’s life skills world from WayMaker Skills™, helping children grow through stories, games, activities, confidence, creativity, communication, character, emotional awareness, and reflection.",
    ogImage: "/assets/imgs/frameworks/wami-mascot.png",
    ogAlt: "WAMI™ The WayMaker Star children’s life skills mascot",
    content: [
      renderHero({
        eyebrow: "WAMI™ • Children’s Life Skills",
        title: "Meet WAMI™, the WayMaker Star for growing humans.",
        copy: "WAMI™ brings stories, games, activities, and joyful challenges together to help children build confidence, creativity, communication, character, emotional awareness, collaboration, curiosity, and practical life skills.",
        pills: ["Stories", "Games", "Activities", "Life Skills", "Confidence", "Creativity", "Kindness", "Communication"],
        actions: [anchor(routes.contact, "Discuss WAMI™ Programs", "btn btn-primary"), anchor(waymakerLinks.wami, "Learn More at WayMaker Skills™", "btn btn-secondary")],
        media: {
          html: `
            <div class="wami-stars" aria-hidden="true">
              <span class="wami-star">✦</span>
              <span class="wami-star">✦</span>
              <span class="wami-star">✦</span>
              <span class="wami-star">✦</span>
              <span class="wami-star alt">✦</span>
              <span class="wami-star">✦</span>
              <span class="wami-star alt">✦</span>
              <span class="wami-star">✦</span>
              <span class="wami-star alt">✦</span>
              <span class="wami-star">✦</span>
            </div>
            <img class="floating-mascot" src="/assets/imgs/frameworks/wami-mascot.png" alt="WAMI™ The WayMaker Star children’s life skills mascot">
            <img src="/assets/imgs/frameworks/wami-wordmark.png" alt="WAMI™ children’s life skills wordmark">
          `
        },
        panelTitle: "Inside the WAMI™ world",
        panelCopy: "A playful but structured world where children learn by doing, reflecting, expressing, and connecting.",
        panelHtml: `<div class="chip-cloud">${["Stories", "Games", "Activities", "Life Skills", "Confidence", "Creativity", "Kindness", "Communication"].map((item) => `<span class="chip">${item}</span>`).join("")}</div>`
      }, renderBreadcrumbs({ route: routes.wami, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "WayMaker Skills™", route: routes.waymaker }, { label: "WAMI™", route: routes.wami }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "What Is WAMI™?",
            title: "A joyful world where children practise real-life skills through stories and play.",
            copy: "WAMI™ helps children grow through stories, activities, games, challenges, reflection, and character-building experiences that feel bright, safe, and memorable."
          })}
          ${renderCards([
            { title: "Learn by doing", copy: "Children practise rather than just listen, so the learning feels active, embodied, and easy to remember." },
            { title: "Grow through stories", copy: "Story worlds make values, choices, emotions, and character lessons easier for children to understand." },
            { title: "Reflect with confidence", copy: "Gentle reflection moments help children notice what they learned, how they felt, and how they can respond next time." }
          ], "framework-card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "How WAMI™ Comes Alive",
            title: "Colourful activity tiles children can keep coming back to.",
            copy: "The WAMI™ world is designed to be revisited, replayed, and reflected on from different angles."
          })}
          ${renderCards([
            { title: "Stories", copy: "Narratives that make values, feelings, and choices feel real and relatable." },
            { title: "Activity books", copy: "Hands-on prompts that keep the learning tangible beyond a single session." },
            { title: "Skill challenges", copy: "Small growth tasks that reward effort, curiosity, and courage." },
            { title: "Games", copy: "Playful formats that help children learn without feeling pressured." },
            { title: "Creative tasks", copy: "Drawing, making, imagining, and expressing in ways children naturally enjoy." },
            { title: "Communication practice", copy: "Speaking, listening, sharing, and responding with more confidence." },
            { title: "Reflection activities", copy: "Safe moments to name feelings, lessons, and next steps." },
            { title: "Character building", copy: "Helping values become habits through repetition, language, and guided practice." }
          ], "card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Child Development Outcomes",
            title: "Core child development outcomes with brighter energy and stronger meaning.",
            copy: "WAMI™ supports skills children can carry into family life, school spaces, friendships, and future learning environments."
          })}
          ${renderCards([
            { title: "Confidence", copy: "A stronger sense of voice, presence, and willingness to try." },
            { title: "Creativity", copy: "Comfort with imagination, experimentation, and flexible thinking." },
            { title: "Communication", copy: "Clearer expression, listening, and relationship-building language." },
            { title: "Character", copy: "Values, responsibility, kindness, and healthy behavior foundations." },
            { title: "Curiosity", copy: "A growing appetite for questions, wonder, and discovery." },
            { title: "Collaboration", copy: "Working with others through empathy, turn-taking, and shared tasks." },
            { title: "Emotional awareness", copy: "Naming and understanding feelings with more steadiness." },
            { title: "Problem-solving", copy: "Trying options, thinking through challenges, and adapting responses." }
          ], "card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "For Parents And Schools",
            title: "Two pathways, one joyful learning world.",
            copy: "WAMI™ can meet children through the home environment, the classroom environment, or both together."
          })}
          ${renderCards([
            {
              title: "For Parents",
              copy: "WAMI™ offers child-friendly ways to reinforce confidence, communication, values, creativity, and reflection at home."
            },
            {
              title: "For Schools",
              copy: "WAMI™ can support child-focused life skills work through school pathways, classroom experiences, and broader youth development partnerships."
            }
          ], "framework-card", "grid-2")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Inside The WAMI™ World",
            title: "A journey of stories, games, creativity, and reflection.",
            copy: "The flow stays playful, but it is still intentional. Each step gives children another way to practise life skills with safety and joy."
          })}
          <div class="timeline-steps">
            ${[
              ["Story missions", "Children enter a friendly learning world through characters, situations, and value-rich stories."],
              ["Game-based learning", "Playful participation turns skill ideas into action instead of passive instruction."],
              ["Creative expression", "Children draw, respond, imagine, build, and communicate in their own way."],
              ["Reflection moments", "Guided check-ins help them notice what they learned and how it applies in life."]
            ].map(([title, copy]) => `
              <article class="timeline-step reveal">
                <h3>${title}</h3>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "WAMI™ Questions",
        title: "WAMI™ Questions",
        copy: "A quick orientation for parents, schools, and partners exploring the WAMI™ world.",
        items: [
          { q: "What is WAMI™?", a: "WAMI™ is the children’s life skills world from WayMaker Skills™, presented here on Sanjo.in as part of Sanjo’s founder story and framework overview." },
          { q: "Who is WAMI™ for?", a: "WAMI™ is designed for children and is useful for parents, schools, and child development partners who want structured life skills with a bright, engaging format." },
          { q: "Can WAMI™ be used in schools?", a: "Yes. WAMI™ can support school pathways, classroom experiences, activity-led sessions, and broader youth development partnerships." },
          { q: "What kinds of skills does WAMI™ help build?", a: "It supports confidence, creativity, communication, character, curiosity, collaboration, emotional awareness, and practical problem-solving." }
        ]
      }),
      ctaBand({
        title: "Bring WAMI™ to your learning community.",
        copy: "Whether you are a parent, school, or partner, WAMI™ can help children practise life skills in a joyful, memorable way.",
        actions: [
          anchor(routes.contact, "Start a Conversation", "btn btn-soft"),
          anchor(waymakerLinks.wami, "Explore at WayMaker Skills™", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.nova, {
    bodyClass: "page-nova",
    title: "NOVA™ Human Development Methodology | Sanjo Cine Mathew",
    description: "NOVA™ stands for Notice, Own, Visualize, and Act. Explore the WayMaker Skills™ human development methodology that turns awareness into ownership, direction, and practical action.",
    ogImage: "/assets/imgs/branding-4.jpg",
    content: [
      renderHero({
        eyebrow: "NOVA™ Methodology",
        title: "From awareness to action. From potential to practical growth.",
        copy: "NOVA™ is the WayMaker Skills™ methodology for helping people notice more clearly, own growth more intentionally, visualize direction, and act with purpose.",
        pills: ["Notice", "Own", "Visualize", "Act", "Evidence-informed"],
        actions: [anchor(routes.programs, "Explore Programs", "btn btn-primary"), anchor(waymakerLinks.nova, "Learn More at WayMaker Skills™", "btn btn-secondary")],
        media: { image: "/assets/imgs/branding-4.jpg", alt: "Structured methodology visual" },
        panelTitle: "NOVA™ in sequence",
        panelList: ["Notice", "Own", "Visualize", "Act"]
      }, renderBreadcrumbs({ route: routes.nova, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "WayMaker Skills™", route: routes.waymaker }, { label: "NOVA™ Methodology", route: routes.nova }] })),
      `
      <section class="section">
        <div class="container split-panel">
          <div class="story-card reveal">
            ${sectionHeader({
              eyebrow: "What NOVA™ Is",
              title: "A repeatable human development pathway.",
              copy: "NOVA™ is the methodology behind WayMaker Skills™ programs. It exists to close the gap between insight and behavior. Instead of stopping at understanding, it guides people into ownership, direction, and action."
            })}
            <p class="muted">That makes NOVA™ useful across different contexts. The audience may change, but the need stays consistent: people need a simple, disciplined way to move from reflection into capability.</p>
          </div>
          <div class="quote-panel reveal">
            <blockquote>NOVA™ gives growth a structure people can repeat.</blockquote>
            <p>That repeatability is what makes it useful in classrooms, teams, leadership programs, coaching spaces, and broader developmental journeys.</p>
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "The Four Stages",
            title: "Notice. Own. Visualize. Act.",
            copy: "The sequence is simple by design so that it can be used consistently across real human development contexts."
          })}
          <div class="nova-stages">
            ${[
              ["Notice", "Build awareness of self, others, and situation."],
              ["Own", "Accept responsibility and develop a growth mindset."],
              ["Visualize", "Create direction, purpose, and a path forward."],
              ["Act", "Apply learning in real life with consistent action."]
            ].map(([title, copy]) => `
              <article class="nova-stage reveal">
                <h3>${title}</h3>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "What NOVA™ Integrates",
            title: "A multidisciplinary foundation.",
            copy: "NOVA™ is useful because it is not built on one narrow lens. It draws from multiple domains that shape how people change."
          })}
          ${renderCards([
            { title: "Psychology", copy: "Awareness of emotion, behavior, thought, and pattern." },
            { title: "Human Development", copy: "A staged view of how people grow across life contexts." },
            { title: "Behavioral Insight", copy: "Attention to what actually drives repeated choices and habits." },
            { title: "Leadership Principles", copy: "Responsibility, clarity, influence, and response under pressure." },
            { title: "Future Skills", copy: "Adaptability, initiative, communication, and practical readiness." },
            { title: "Experiential Learning", copy: "Growth through reflection, participation, and application." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "NOVA™ In Practice",
            title: "How NOVA™ shows up inside a program.",
            copy: "The methodology becomes visible through a repeatable practice cycle rather than a one-time insight."
          })}
          <div class="timeline-steps">
            ${[
              ["Notice the current reality", "Increase awareness of patterns, context, strengths, and constraints."],
              ["Own the growth task", "Build responsibility, mindset, and willingness to act differently."],
              ["Visualize a better response", "Create a clearer internal picture of the desired change and direction."],
              ["Act in the real world", "Move the insight into behavior, decision-making, communication, and practice."],
              ["Repeat and deepen", "Growth strengthens when the cycle is revisited with reflection and application."]
            ].map(([title, copy]) => `
              <article class="timeline-step reveal">
                <h3>${title}</h3>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Where NOVA™ Applies",
            title: "Designed for every life stage.",
            copy: "The audience can change, but the movement from awareness to action remains useful across all of them."
          })}
          ${renderCards([
            { title: "Students", copy: "Build awareness, responsibility, direction, and follow-through." },
            { title: "Educators", copy: "Use reflective practice and purposeful teaching behaviors." },
            { title: "Parents", copy: "Respond to family growth with more steadiness and clarity." },
            { title: "Professionals", copy: "Translate reflection into workplace effectiveness and action." },
            { title: "Leaders", copy: "Grow in ownership, direction, communication, and influence." },
            { title: "Corporate Teams", copy: "Create shared language for growth, feedback, and accountability." },
            { title: "Communities", copy: "Support collective development with practical behavior change." },
            { title: "Institutions", copy: "Build human development pathways with structure instead of chance." }
          ], "card", "grid-4")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Questions About NOVA™",
        title: "Questions about NOVA™",
        copy: "A quick orientation to the methodology and why it matters.",
        items: [
          { q: "What does NOVA™ stand for?", a: "NOVA™ stands for Notice, Own, Visualize, and Act." },
          { q: "How is NOVA™ used in programs?", a: "It provides the sequence behind reflection, skill-building, coaching, leadership development, and behavior-change work." },
          { q: "Is NOVA™ only for leadership training?", a: "No. It can be used across students, parents, professionals, teams, institutions, and leadership contexts." },
          { q: "Why does methodology matter in human development?", a: "Because people need more than inspiration. A clear methodology helps insight become repeatable action." }
        ]
      }),
      ctaBand({
        title: "Build a NOVA™-based development journey.",
        copy: "From classrooms to corporate teams, NOVA™ gives growth a clear pathway instead of leaving change to chance.",
        actions: [
          anchor(routes.contact, "Start a Conversation", "btn btn-soft"),
          anchor(waymakerLinks.nova, "Explore at WayMaker Skills™", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.lq, {
    bodyClass: "page-lq",
    title: "LQ™ Life Intelligence Quotient Framework | Sanjo Cine Mathew",
    description: "Explore LQ™, the Life Intelligence Quotient framework from WayMaker Skills™, covering THINK, FEEL, CONNECT, ACT, and ADAPT.",
    ogImage: "/assets/imgs/branding-5.jpg",
    content: [
      renderHero({
        eyebrow: "LQ™ Framework",
        title: "Life Intelligence Quotient™ (LQ)",
        copy: "A practical framework for understanding how people think, feel, connect, act, and adapt in everyday life.",
        pills: ["THINK", "FEEL", "CONNECT", "ACT", "ADAPT"],
        actions: [anchor(routes.programs, "Explore Programs", "btn btn-primary"), anchor(waymakerLinks.lq, "Learn More at WayMaker Skills™", "btn btn-secondary")],
        media: { image: "/assets/imgs/branding-5.jpg", alt: "Life intelligence framework visual" },
        panelTitle: "The five dimensions",
        panelList: ["THINK", "FEEL", "CONNECT", "ACT", "ADAPT"]
      }, renderBreadcrumbs({ route: routes.lq, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "WayMaker Skills™", route: routes.waymaker }, { label: "LQ™ Framework", route: routes.lq }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Why LQ™ Exists",
            title: "Knowledge Alone Is Not Enough.",
            copy: "Many people know what to do, yet struggle to apply it consistently. Success in life, learning, relationships, and leadership depends on more than knowledge. LQ™ was developed to help individuals understand the practical human capabilities that influence everyday effectiveness."
          })}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "The Five Dimensions",
            title: "Five lenses, one capable human.",
            copy: "Each dimension strengthens a different part of real-world effectiveness, but together they form a fuller model of maturity and capability."
          })}
          ${renderCards([
            {
              title: "THINK",
              eyebrow: "Thinking Intelligence",
              list: ["Critical Thinking", "Decision Making", "Problem Solving", "Strategic Thinking"]
            },
            {
              title: "FEEL",
              eyebrow: "Emotional Intelligence",
              list: ["Self-Awareness", "Emotional Regulation", "Resilience", "Confidence"]
            },
            {
              title: "CONNECT",
              eyebrow: "Social Intelligence",
              list: ["Communication", "Collaboration", "Empathy", "Influence"]
            },
            {
              title: "ACT",
              eyebrow: "Action Intelligence",
              list: ["Leadership", "Initiative", "Accountability", "Execution"]
            },
            {
              title: "ADAPT",
              eyebrow: "Context Intelligence",
              list: ["Adaptability", "Creativity", "Innovation", "Situational Awareness"]
            }
          ], "dimension-card", "grid-5")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Capabilities",
            title: "The capabilities LQ™ supports in practice.",
            copy: "The framework helps connect applied intelligence to real outcomes across life, work, and leadership."
          })}
          ${renderCards([
            { title: "Leadership development", copy: "Build responsibility, judgment, and influence with more maturity." },
            { title: "Communication excellence", copy: "Strengthen language, listening, empathy, and clarity in action." },
            { title: "Emotional intelligence", copy: "Bring steadiness, self-awareness, and better regulation into real situations." },
            { title: "Critical thinking", copy: "Improve perspective, reasoning, and the quality of decisions." },
            { title: "Problem solving", copy: "Move from reaction to structured response under pressure." },
            { title: "Adaptability", copy: "Respond intelligently when contexts shift, conflict, or surprise." },
            { title: "Resilience", copy: "Recover, learn, and continue with more steadiness and perspective." },
            { title: "Purposeful action", copy: "Turn insight into consistent behavior and meaningful outcomes." }
          ], "card", "grid-4")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Where LQ™ Applies",
            title: "Built for different audiences and life stages.",
            copy: "LQ™ becomes useful wherever people need better decisions, clearer emotions, stronger relationships, steadier action, and more adaptability."
          })}
          ${renderCards([
            { title: "Students", copy: "Confidence, direction, and life skills beyond academics." },
            { title: "Parents", copy: "A clearer lens on the skills children need for life." },
            { title: "Teachers", copy: "Human development language that supports better classrooms." },
            { title: "Professionals", copy: "Capabilities that influence career growth and effectiveness." },
            { title: "Leaders", copy: "A broader model for mature, responsible leadership." },
            { title: "Teams", copy: "Shared growth across thinking, feeling, communication, and action." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Questions About LQ™",
        title: "Questions about LQ™",
        copy: "A quick framework orientation for individuals and institutions.",
        items: [
          { q: "What is LQ™?", a: "LQ™ is the Life Intelligence Quotient framework connected to WayMaker Skills™, designed to help people function more intelligently in everyday life and work." },
          { q: "How is LQ™ different from IQ or EQ alone?", a: "It includes thinking and feeling, but also adds connecting, acting, and adapting as essential dimensions of real-world effectiveness." },
          { q: "Where is the LQ™ framework used?", a: "It can be used across student development, parenting, teaching, leadership, professional growth, and team development contexts." },
          { q: "Why does life intelligence matter?", a: "Because success and maturity depend on more than knowledge. People need usable judgment, emotional steadiness, and adaptive action." }
        ]
      }),
      ctaBand({
        title: "Start building life intelligence.",
        copy: "LQ™ helps connect frameworks to outcomes across leadership, communication, emotional intelligence, youth development, and broader human growth.",
        actions: [
          anchor(routes.contact, "Start a Conversation", "btn btn-soft"),
          anchor(waymakerLinks.lq, "Explore at WayMaker Skills™", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/resume/", {
    title: "Resume & Credentials | Sanjo Cine Mathew",
    description: "View Sanjo Cine Mathew's professional experience, education, certifications, publications, conference presentations, honors, and affiliations.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: [
      renderHero({
        eyebrow: "Resume / Credentials",
        title: "Professional Credentials",
        copy: "Knowledge becomes valuable when it creates growth, resilience, and positive change in people's lives.",
        actions: [anchor("/contact/", "Invite Sanjo for a Program", "btn btn-primary"), anchor("/about/", "About Sanjo", "btn btn-secondary")],
        media: { image: "/assets/imgs/avatar.jpg", alt: "Portrait of Sanjo Cine Mathew" },
        panelTitle: "Highlights",
        panelList: ["Ph.D. in Counselling Psychology", "Director & Founder - WayMaker Skills™", "Asia Book of Records Awardee", "50+ certifications and training credentials"]
      }, renderBreadcrumbs({ route: "/resume/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Resume / Credentials", route: "/resume/" }] })),
      `
      <section class="section">
        <div class="container list-columns">
          <article class="story-card reveal">
            <h3>Professional Experience</h3>
            ${list([
              "Director & Founder - WayMaker Skills™",
              "Consultant Psychologist - Worked with schools",
              "Resource Teacher Trainer - CBSE schools",
              "Biology Subject Matter Expert - Growing Stars Infotech Pvt. Ltd.",
              "Counsellor & Trainer - Various organizations",
              "Soft Skills Trainer - Corporate and institutional programs",
              "Leadership Trainer for professionals",
              "Team Building, Outbound & Inbound Training Facilitator"
            ])}
          </article>
          <article class="story-card reveal">
            <h3>Education</h3>
            ${list([
              "Ph.D. in Counselling Psychology",
              "M.Sc. in Psychology",
              "M.Sc. in Biotechnology",
              "B.Sc. in Microbiology, Chemistry and Zoology",
              "B.Ed. in Natural Science",
              "CIDTT - Cambridge International Diploma for Teachers and Trainers",
              "Diploma in Applied Nutrition, Food Science and Dietetics",
              "Diploma in Neuropsychology",
              "Diploma in Food and Nutrition",
              "FCECLD - Rehabilitation Council of India"
            ])}
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container list-columns">
          <article class="story-card reveal">
            <h3>Certifications</h3>
            ${list([
              "Certified Corporate Trainer",
              "Certified Shadow Healing Facilitator",
              "Certified CBT Coach",
              "Certified NLP Practitioner",
              "Certified Well-being Coach",
              "Certified Life Coach",
              "Certified Fitness Mentor",
              "Meditation Instructor Trainer",
              "International Certification in Special Education",
              "International Certification in Educational Administration and Management"
            ])}
          </article>
          <article class="story-card reveal">
            <h3>Publications, Presentations & Honors</h3>
            ${list([
              "Psycho-Social Issues of Middle-Aged Working Women in Cochin City Based on Stress",
              "Study on Physicochemical and Phycological Characteristics of Temple Ponds in Ernakulam, Kerala",
              "Assistive Technology in Dementia Care",
              "Psychosocial Stress Issues",
              "Asia Book of Records Awardee"
            ])}
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container comparison">
          <article class="card reveal">
            <h3>Professional Affiliations</h3>
            ${list(["APA International Affiliate", "IAAP", "Counsellor Council of India", "Global Association of Behavior Management"])}
          </article>
          <article class="quote-panel reveal">
            <blockquote>Credentials matter most when they translate into real human outcomes.</blockquote>
            <p>Sanjo's academic, training, and facilitation background directly supports the quality and range of his work across audiences.</p>
            <cite>Dr. Sanjo Cine Mathew</cite>
          </article>
        </div>
      </section>
      `,
      ctaBand({
        title: "Invite Sanjo for a programme or consultation.",
        copy: "Use the credentials page as a reference point and then start a conversation about fit, audience, and outcomes.",
        actions: [
          anchor("/contact/", "Contact", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/gallery/", {
    title: "Gallery | Sanjo Cine Mathew",
    description: "Moments from workshops, school programs, counselling initiatives, corporate learning sessions, and human development programs by Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/gallery/teachers-training-programme-gregorian-public-school-kottayam-sanjo-mathew-trainer.jpg",
    content: [
      renderHero({
        eyebrow: "Impact Gallery",
        title: "A Journey of Learning, Leadership & Transformation.",
        copy: "A glimpse into learning, growth, leadership, and transformation across schools, communities, organizations, and families.",
        actions: [anchor("/impact/", "See Impact", "btn btn-primary"), anchor("/contact/", " Request a Program ", "btn btn-secondary")],
        media: { image: "/assets/imgs/gallery/students-training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg", alt: "Sanjo leading a student training programme" },
        panelTitle: "Gallery categories",
        panelMeta: ["Workshops", "School Programs", "Corporate Sessions", "Training Events", "Community Programs", "Media / Recognition"]
      }, renderBreadcrumbs({ route: "/gallery/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Gallery", route: "/gallery/" }] })),
      gallerySection(),
      ctaBand({
        title: "Every transformation begins with a conversation.",
        copy: "Let's explore how a customized workshop, training program, or learning experience can support your students, educators, parents, teams, or community.",
        actions: [
          anchor("/contact/", "Request a Program", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.blog, {
    title: "Blog & Insights | Sanjo Cine Mathew",
    description: "Insights on counselling, life skills, emotional intelligence, parenting, leadership, communication, learning, and human development.",
    ogImage: "/assets/imgs/blog1.jpg",
    content: [
      renderHero({
        className: "blog-library-hero",
        eyebrow: "Blog / Insights",
        title: "Insights on growth, life skills, leadership, parenting, and human development.",
        copy: "A content-rich blog index with practical reflections, future-ready thinking, and psychology-informed guidance shaped around Sanjo's core work.",
        actions: [anchor("/resources/", "Explore Resources", "btn btn-primary"), anchor("/contact/", "Discuss a Topic", "btn btn-secondary")],
        media: { image: "/assets/imgs/blog1.jpg", alt: "Insight and reading themed visual" },
        panelTitle: "Initial article themes",
        panelMeta: ["Life Skills", "Parenting", "Leadership", "Communication"]
      }, renderBreadcrumbs({ route: routes.blog, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Blog / Insights", route: routes.blog }] })),
      `
      <section class="section">
        <div class="container blog-hub" data-blog-hub>
          ${sectionHeader({
            eyebrow: "Explore Insights",
            title: "Search the imported old blog and newer Sanjo.in articles.",
            copy: "The blog now reads from a JSON file, so new posts can be added by adding one object to the data file."
          })}
          <div class="blog-controls blog-search-card reveal">
            <div class="blog-search-wrap">
              <label class="sr-only" for="blog-search">Search insights</label>
              <span class="blog-search-icon" aria-hidden="true">${iconSvg("message")}</span>
              <input id="blog-search" type="search" placeholder="Search insights by topic, skill, or audience..." data-blog-search>
              <button class="blog-search-clear" type="button" data-blog-search-clear hidden>Clear</button>
            </div>
            <div class="blog-filter-row">
              <span class="blog-filter-label">Categories</span>
            <div class="filter-chips" role="list" aria-label="Blog categories">
              ${["All", "Life Skills", "Parenting", "Leadership", "Communication", "Counselling", "Students", "WayMaker Skills™", "WAMI™", "NOVA™", "LQ™", "Women Empowerment"].map((category) => `<button class="filter-chip${category === "All" ? " active" : ""}" type="button" data-blog-category="${category}">${category}</button>`).join("")}
            </div>
            </div>
            <button class="clear-filters" type="button" data-blog-clear hidden>Clear filters</button>
          </div>
          <div class="blog-layout">
            <div class="stack">
              <div class="featured-blog-grid">
                ${getBlogSelections().featured.map((post) => renderBlogCard(post, { featured: true, cta: "Read Featured", result: false })).join("")}
                <aside class="story-card reveal">
                  <h3>Hi, I am Sanjo!</h3>
                  <p class="muted">I write about counselling, life skills, emotional intelligence, parenting, leadership, learning, and practical pathways for intentional living.</p>
                  <div class="button-row">
                    ${anchor(routes.contact, "Discuss a Topic", "btn btn-soft")}
                    ${anchor(routes.consultation, "Book a Consultation", "btn btn-secondary")}
                  </div>
                </aside>
              </div>
              <div class="blog-lanes">
                ${[
                  ["Editor's Pick", getBlogSelections().editorPicks],
                  ["Trending Posts", getBlogSelections().trending],
                  ["Popular Posts", getBlogSelections().popular]
                ].map(([title, posts]) => `
                  <section class="mini-section reveal">
                    <h3>${title}</h3>
                    <div class="mini-post-list">
                      ${posts.map((post) => `
                        <a class="mini-post" href="${routes.blog}${post.slug}/">
                          <img src="${post.image}" alt="${post.imageAlt}" loading="lazy" decoding="async">
                          <span class="mini-post-body"><span>${post.category}</span><strong>${post.title}</strong><small>${post.date} · ${post.readTime}</small></span>
                        </a>
                      `).join("")}
                    </div>
                  </section>
                `).join("")}
              </div>
            </div>
            <aside class="blog-sidebar reveal">
              <div class="blog-side-block">
                <h3>About Sanjo</h3>
                <p class="muted">Counselling psychologist, skill coach, learning facilitator, author, and founder of WayMaker Skills.</p>
                ${anchor(routes.about, "About Sanjo", "btn btn-secondary")}
              </div>
              <div class="blog-side-block">
                <h3>Categories</h3>
                <div class="filter-chips">
                  ${getBlogCategories().filter((category) => category !== "All").slice(0, 12).map((category) => `<button class="filter-chip" type="button" data-blog-category="${escapeAttr(category)}">${category}</button>`).join("")}
                </div>
              </div>
              <div class="blog-side-block">
                <h3>Tags</h3>
                <div class="chip-cloud">
                  ${getTopTags().slice(0, 18).map((tag) => `<button class="tag-filter" type="button" data-blog-tag="${escapeAttr(tag)}">${tag}</button>`).join("")}
                  <span class="blog-tag-extra" data-blog-extra-tags hidden>
                    ${getTopTags().slice(18, 42).map((tag) => `<button class="tag-filter" type="button" data-blog-tag="${escapeAttr(tag)}">${tag}</button>`).join("")}
                  </span>
                  <button class="blog-tag-toggle" type="button" data-blog-tag-toggle aria-expanded="false"${getTopTags().length <= 18 ? " hidden" : ""}>Show more tags</button>
                </div>
              </div>
              <div class="mini-section">
                <h3>Popular Posts</h3>
                <div class="mini-post-list">
                  ${getBlogSelections().popular.slice(0, 4).map((post) => `
                    <a class="mini-post" href="${routes.blog}${post.slug}/">
                      <img src="${post.image}" alt="${post.imageAlt}" loading="lazy" decoding="async">
                      <span class="mini-post-body"><span>${post.category}</span><strong>${post.title}</strong><small>${post.readTime}</small></span>
                    </a>
                  `).join("")}
                </div>
              </div>
              <div class="blog-side-block">
                <h3>Consultation</h3>
                <p class="muted">Turn an insight into a practical next step for your context.</p>
                <div class="button-row">${anchor(routes.consultation, "Book a Consultation", "btn btn-primary")}</div>
              </div>
            </aside>
          </div>
          <div class="blog-results-header reveal">
            <h3>All Articles</h3>
            <p class="muted blog-count-line">Showing <span data-blog-count>${blogPosts.length}</span> of <span data-blog-total>${blogPosts.length}</span> insights.</p>
          </div>
          <div class="grid-3" data-blog-grid>
            ${blogPosts.map((post) => renderBlogCard(post)).join("")}
          </div>
          <div class="blog-empty-card" data-blog-empty hidden>
            <h3>No insights matched your filters.</h3>
            <p class="muted">Try a different keyword or clear the filters.</p>
            <div class="button-row"><button class="clear-filters" type="button" data-blog-clear>Clear filters</button></div>
          </div>
        </div>
      </section>
      `,
      ctaBand({
        title: "Use the blog as a doorway into deeper work.",
        copy: "If a topic resonates, continue through a consultation, programme enquiry, or a more focused learning pathway.",
        actions: [
          anchor("/contact/", "Send a Message", "btn btn-soft"),
          anchor("/programs/", "Explore Programs", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/contact/", {
    title: "Contact Sanjo Cine Mathew",
    description: "Contact Sanjo Cine Mathew for counselling, coaching, student programs, parent guidance, corporate training, school programs, and WayMaker Skills™ collaborations.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: [
      renderHero({
        eyebrow: "Contact",
        title: "Let us build your next transformation roadmap.",
        copy: "Reach out for counselling, coaching, school programmes, parenting support, women empowerment pathways, or organizational learning conversations.",
        actions: [anchor("mailto:biosanjo@gmail.com", "Email Now", "btn btn-primary"), anchor("https://wa.me/919645343777", "WhatsApp", "btn btn-secondary")],
        media: { image: "/assets/imgs/avatar.jpg", alt: "Sanjo Cine Mathew portrait" },
        panelTitle: "Contact methods",
        panelList: ["WhatsApp: +91 96453 43777", "Email: biosanjo@gmail.com", "Email: waymakerskills@gmail.com", "WayMaker Skills™ collaboration enquiries welcome"]
      }, renderBreadcrumbs({ route: "/contact/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Contact", route: "/contact/" }] })),
      `
      <section class="section">
        <div class="container form-shell">
          <div class="form-card card reveal" id="contact-form">
            <h2 style="margin-bottom:16px;">Send a message</h2>
            <form class="form-grid" data-web3-form data-access-key="${FORM_ACCESS_KEY}" data-form-kind="contact">
              <div class="form-grid two">
                <div class="field">
                  <label for="contact-name">Name</label>
                  <input id="contact-name" name="name" type="text" required>
                </div>
                <div class="field">
                  <label for="contact-email">Email</label>
                  <input id="contact-email" name="email" type="email" required>
                </div>
              </div>
              <div class="form-grid two">
                <div class="field">
                  <label for="contact-phone">Phone</label>
                  <input id="contact-phone" name="phone" type="tel" required>
                </div>
                <div class="field">
                  <label for="contact-interest">Interest area</label>
                  <select id="contact-interest" name="interest_area" required>
                    <option value="">Select an area</option>
                    <option>Counselling</option>
                    <option>Coaching</option>
                    <option>Student Program</option>
                    <option>Parent Program</option>
                    <option>Women Empowerment</option>
                    <option>Corporate Training</option>
                    <option>School Program</option>
                    <option>WayMaker Skills™ Collaboration</option>
                    <option>WAMI™</option>
                    <option>NOVA™</option>
                    <option>LQ™</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label for="contact-message">Message</label>
                <textarea id="contact-message" name="message" required></textarea>
              </div>
              <div class="button-row">
                <button class="btn btn-primary" type="submit">Send Message</button>
                <a class="btn btn-secondary" href="/book-consultation/">Book Consultation</a>
              </div>
            </form>
          </div>
          <aside class="contact-card card reveal">
            <h2 style="margin-bottom:16px;">Direct contact</h2>
            <div class="stack">
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/919645343777" target="_blank" rel="noreferrer">+91 96453 43777</a></p>
              <p><strong>Email:</strong> <a href="mailto:biosanjo@gmail.com">biosanjo@gmail.com</a></p>
              <p><strong>Email:</strong> <a href="mailto:waymakerskills@gmail.com">waymakerskills@gmail.com</a></p>
              <p class="muted">Use this page for personal programmes, counselling, coaching, school work, and founder-led conversations. For broader organizational programmes, WayMaker Skills™ remains the company bridge.</p>
              <div class="button-row">
                ${anchor("mailto:biosanjo@gmail.com", "Email Now", "btn btn-soft")}
                ${anchor("https://wa.me/919645343777", "WhatsApp", "btn btn-secondary")}
                ${anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-secondary")}
              </div>
            </div>
          </aside>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Contact FAQ",
        title: "What happens after you reach out?",
        copy: "A short orientation to the enquiry process.",
        items: [
          { q: "Will I receive a personal response?", a: "Messages are received through the website form or direct contact channels and are reviewed for the most appropriate next step." },
          { q: "Can I contact Sanjo for organizational programmes from this page?", a: "Yes. You can begin here, and organizational conversations can also be bridged toward WayMaker Skills™ where relevant." },
          { q: "What if I am not sure which program fits?", a: "Use the message box to describe your audience and goals. The next step can then be guided clearly." },
          { q: "Can I use WhatsApp instead of the form?", a: "Yes. WhatsApp is available for a direct first connection." }
        ]
      })
    ].join("")
  }),
  page("/book-consultation/", {
    title: "Book a Consultation | Sanjo Cine Mathew",
    description: "Book a respectful and clarity-focused consultation with Dr. Sanjo Cine Mathew for counselling, coaching, student support, parenting guidance, and programme enquiries.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: [
      renderHero({
        eyebrow: "Book a Consultation",
        title: "A safe space to explore challenges, possibilities, and clarity- focused  path ahead",
        copy: "People connect with me for counselling, mentoring, personal growth, parenting support, educational guidance, leadership development, and meaningful life conversations. Whether you're facing a challenge, exploring a possibility, or seeking a fresh perspective, this consultation helps us identify the most appropriate next step.",
        actions: [anchor("/contact/", "Book Consultation", "btn btn-primary"), anchor("https://wa.me/919645343777", "WhatsApp", "btn btn-secondary")],
        media: { image: "/assets/imgs/avatar.jpg", alt: "Sanjo Cine Mathew portrait" },
        panelTitle: "What to expect",
        panelList: ["Private and respectful conversation", "Clarity-focused discussion", "Practical next steps"]
      }, renderBreadcrumbs({ route: "/book-consultation/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Book a Consultation", route: "/book-consultation/" }] })),
      `
      <section class="section">
        <div class="container form-shell">
          <div class="form-card card reveal">
            <h2 style="margin-bottom:16px;">Consultation request form</h2>
            <form class="form-grid" data-web3-form data-access-key="${FORM_ACCESS_KEY}" data-form-kind="consultation">
              <div class="form-grid two">
                <div class="field">
                  <label for="book-name">Name</label>
                  <input id="book-name" name="name" type="text" required>
                </div>
                <div class="field">
                  <label for="book-phone">Phone</label>
                  <input id="book-phone" name="phone" type="tel" required>
                </div>
              </div>
              <div class="form-grid two">
                <div class="field">
                  <label for="book-email">Email</label>
                  <input id="book-email" name="email" type="email" required>
                </div>
                <div class="field">
                  <label for="book-type">Consultation type</label>
                  <select id="book-type" name="consultation_type" required>
                    <option value="">Select a type</option>
                    <option>Personal counselling</option>
                    <option>Coaching</option>
                    <option>Student support</option>
                    <option>Parent guidance</option>
                    <option>Corporate enquiry</option>
                    <option>School program</option>
                    <option>WayMaker Skills™ enquiry</option>
                  </select>
                </div>
              </div>
              <div class="form-grid two">
                <div class="field">
                  <label for="book-date">Preferred date</label>
                  <input id="book-date" name="preferred_date" type="date">
                </div>
                <div class="field">
                  <label for="book-time">Preferred time</label>
                  <input id="book-time" name="preferred_time" type="time">
                </div>
              </div>
              <div class="field">
                <label for="book-notes">Notes</label>
                <textarea id="book-notes" name="notes"></textarea>
              </div>
              <button class="btn btn-primary" type="submit">Request Consultation</button>
            </form>
          </div>
          <aside class="contact-card card reveal">
            <h2 style="margin-bottom:16px;">Is this consultation for you?</h2>
            ${list([
              "Personal growth and life direction",
              "Student support and mentoring",
              "Parenting and family concerns",
              "School and institutional discussions",
              "Leadership and professional development",
              "Program enquiries",
            ])}
            <h2 style="margin-bottom:16px; margin-top:32px;">What you will gain</h2>
            ${list([
              "Greater clarity",
              "Practical next steps",
              "A personalized direction",
              "Confidence to move forward",
            ])}
            <h3 style="margin-bottom:16px; margin-top:32px;">Guided by Dr. Sanjo Cine Mathew</h3>

          </aside>
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Consultation FAQ",
        title: "Before We Connect.",
        copy: "A few questions people often have before requesting a consultation.",
        items: [
          { q: "Is this only for personal counselling?", a: "No. The consultation page also supports coaching, student support, parent guidance, school programs, and broader enquiries." },
          { q: "Do I need to know the exact program first?", a: "No. The consultation can help clarify whether you need counselling, coaching, a workshop, or a broader pathway." },
          { q: "Can organizations use this page too?", a: "Yes. Teams and institutions can start here and then be routed toward the appropriate program or WayMaker Skills™ bridge." },
          { q: "Will I receive practical next steps?", a: "Yes. The purpose is to move from uncertainty toward clarity and a realistic next action." }
        ]
      })
    ].join("")
  }),
  page("/faq/", {
    title: "FAQ | Sanjo Cine Mathew",
    description: "Frequently asked questions about consultations, programs, schools, corporate learning, WayMaker Skills™, WAMI™, NOVA™, and LQ™.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: [
      renderHero({
        eyebrow: "FAQ",
        title: "Frequently asked questions about programs, consultations, and frameworks.",
        copy: "A complete FAQ page covering consultations, schools, corporate learning, founder pathways, and WayMaker-connected frameworks.",
        actions: [anchor("/contact/", "Ask a Question", "btn btn-primary"), anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")],
        media: { image: "/assets/imgs/avatar.jpg", alt: "Sanjo Cine Mathew portrait" },
        panelTitle: "FAQ categories",
        panelMeta: ["Consultations", "Programs", "Schools & Students", "Corporate Learning", "WayMaker Skills™", "WAMI™, NOVA™, LQ™"]
      }, renderBreadcrumbs({ route: "/faq/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "FAQ", route: "/faq/" }] })),
      faqSection({
        eyebrow: "Consultations",
        title: "Consultation and support questions.",
        copy: "Start here if you are deciding how to begin.",
        items: [
          { q: "Who are these programs designed for?", a: "Students, parents, educators, women, professionals, leaders, schools, and organizations can all find pathways here depending on their needs." },
          { q: "What support areas are covered?", a: "Counselling, coaching, emotional resilience, life skills, leadership development, student development, parenting support, communication, and human-centered performance growth are covered." },
          { q: "Can I request one-to-one guidance?", a: "Yes. One-to-one counselling and coaching pathways are available through the consultation and contact pages." },
          { q: "How do I get started quickly?", a: "Use the contact or consultation page, describe your need, and move into the clearest next pathway." }
        ]
      }),
      faqSection({
        eyebrow: "Programs",
        title: "Program and customization questions.",
        copy: "These cover how programs are shaped and delivered.",
        items: [
          { q: "Can programs be customized?", a: "Yes. Program design can be adapted to audience, age, duration, context, and desired outcomes." },
          { q: "Do you offer school programs?", a: "Yes. Student programmes, parent sessions, teacher development, and school-oriented pathways are available." },
          { q: "Do you offer corporate training?", a: "Yes. Corporate learning and transformation pathways are available, including E.L.E.V.A.T.E. and related modules." },
          { q: "How can organizations collaborate?", a: "Organizations can begin through Sanjo.in and also connect outward to WayMaker Skills™ for broader scale and framework alignment." }
        ]
      }),
      faqSection({
        eyebrow: "WayMaker-Connected",
        title: "Questions about WayMaker Skills™, WAMI™, NOVA™, and LQ™.",
        copy: "These explain the founder bridge and the connected frameworks.",
        items: [
          { q: "What is WayMaker Skills™?", a: "WayMaker Skills™ is the organization founded by Dr. Sanjo Cine Mathew and focused on human development and applied intelligence." },
          { q: "What is WAMI™?", a: "WAMI™ is a children's life skills pathway connected to WayMaker Skills™ and featured on Sanjo.in with an internal overview and external bridge." },
          { q: "What is NOVA™?", a: "NOVA™ is a human development methodology built around Notice, Own, Visualize, and Act." },
          { q: "What is LQ™?", a: "LQ™ is the Life Intelligence Quotient framework covering THINK, FEEL, CONNECT, ACT, and ADAPT." }
        ]
      }),
      ctaBand({
        title: "Still need a direct answer?",
        copy: "Use the contact page if your question is specific to an audience, institution, or personal context.",
        actions: [
          anchor("/contact/", "Contact Sanjo", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join(""),
    faqItems: [
      { q: "Who are these programs designed for?", a: "Students, parents, educators, women, professionals, leaders, schools, and organizations can all find pathways here depending on their needs." },
      { q: "What support areas are covered?", a: "Counselling, coaching, emotional resilience, life skills, leadership development, student development, parenting support, communication, and human-centered performance growth are covered." },
      { q: "Can I request one-to-one guidance?", a: "Yes. One-to-one counselling and coaching pathways are available through the consultation and contact pages." },
      { q: "Do you offer school programs?", a: "Yes. Student programmes, parent sessions, teacher development, and school-oriented pathways are available." },
      { q: "Do you offer corporate training?", a: "Yes. Corporate learning and transformation pathways are available, including E.L.E.V.A.T.E. and related modules." },
      { q: "What is WayMaker Skills™?", a: "WayMaker Skills™ is the organization founded by Dr. Sanjo Cine Mathew and focused on human development and applied intelligence." },
      { q: "What is WAMI™?", a: "WAMI™ is a children's life skills pathway connected to WayMaker Skills™ and featured on Sanjo.in with an internal overview and external bridge." },
      { q: "What is NOVA™?", a: "NOVA™ is a human development methodology built around Notice, Own, Visualize, and Act." },
      { q: "What is LQ™?", a: "LQ™ is the Life Intelligence Quotient framework covering THINK, FEEL, CONNECT, ACT, and ADAPT." },
      { q: "How do I get started quickly?", a: "Use the contact or consultation page, describe your need, and move into the clearest next pathway." },
      { q: "Can programs be customized?", a: "Yes. Program design can be adapted to audience, age, duration, context, and desired outcomes." },
      { q: "How can organizations collaborate?", a: "Organizations can begin through Sanjo.in and also connect outward to WayMaker Skills™ for broader scale and framework alignment." }
    ]
  }),
  page("/impact/", {
    title: "Impact | Sanjo Cine Mathew",
    description: "Explore the kinds of transformation and impact created through the counselling, coaching, student development, and corporate learning work of Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/header.jpg",
    content: [
      renderHero({
        eyebrow: "Impact",
        title: "Transformation measured through confidence, capability, and practical change.",
        copy: "This page captures the kinds of outcomes Sanjo's work is designed to create across individuals, families, schools, and organizations.",
        actions: [anchor("/gallery/", "View the Gallery", "btn btn-primary"), anchor("/contact/", "Discuss an Impact Goal", "btn btn-secondary")],
        media: { image: "/assets/imgs/header.jpg", alt: "Sanjo facilitating a live session" },
        panelTitle: "Impact markers",
        panelMeta: ["Confidence", "Communication", "Resilience", "Leadership", "Future readiness", "Purposeful action"]
      }, renderBreadcrumbs({ route: "/impact/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Impact", route: "/impact/" }] })),
      `
      <section class="section">
        <div class="container grid-4">
          ${[
            ["10000+", "Lives touched through talks, workshops, programmes, and guided interventions."],
            ["700+", "Sessions delivered across school, community, counselling, and professional contexts."],
            ["20+", "Years of insight shaped through education, psychology, and facilitation."],
            ["50+", "Certifications and developmental credentials supporting multidisciplinary work."]
          ].map(([number, copy]) => `
            <article class="metric-card reveal">
              <strong>${number}</strong>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Visible Outcomes",
            title: "What improvement often looks like after the work begins.",
            copy: "Impact is not framed as hype. It is framed as better human functioning in real settings."
          })}
          ${renderCards([
            { title: "Students", copy: "Improved confidence, calmer exam readiness, healthier habits, and stronger self-expression." },
            { title: "Parents", copy: "More constructive communication, better boundaries, and greater emotional steadiness at home." },
            { title: "Educators", copy: "Stronger learner connection, better facilitation, and reflective teaching capacity." },
            { title: "Women", copy: "Increased clarity, confidence, voice, and self-led action." },
            { title: "Professionals", copy: "Greater effectiveness, communication quality, and personal accountability." },
            { title: "Teams", copy: "Better collaboration, leadership presence, emotional intelligence, and adaptive culture." }
          ], "card", "grid-3")}
        </div>
      </section>
      `,
      ctaBand({
        title: "Define the impact you want to create next.",
        copy: "Whether you are an individual, school, family, or organization, begin with the outcomes you want to see in people and culture.",
        actions: [
          anchor("/contact/", "Start a Conversation", "btn btn-soft"),
          anchor("/programs/", "Explore Programs", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page("/resources/", {
    title: "Resources | Sanjo Cine Mathew",
    description: "Browse downloadable brochures, practical resources, and curated next steps from the work of Dr. Sanjo Cine Mathew.",
    ogImage: "/assets/imgs/program-banner-header-small.png",
    content: [
      renderHero({
        eyebrow: "Resources",
        title: "Brochures, starting points, and practical resources for the next step.",
        copy: "A curated resource hub that gathers existing brochures, related pages, and future-ready learning links without leaving dead ends.",
        actions: [anchor("/blog/", "Read Insights", "btn btn-primary"), anchor("/contact/", "Request Guidance", "btn btn-secondary")],
        media: { image: "/assets/imgs/program-banner-header-small.png", alt: "Program resources visual" },
        panelTitle: "What you can do here",
        panelList: ["Download brochures", "Explore related pathways", "Prepare for consultation", "Bridge to Sanjo's insights and programs"]
      }, renderBreadcrumbs({ route: "/resources/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Resources", route: "/resources/" }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Downloads",
            title: "Existing brochures and program materials.",
            copy: "These files already exist in the repository and are now surfaced as part of a cleaner resource experience."
          })}
          ${renderCards([
            { title: "Women Empowerment Brochure", copy: "Resource overview for women-focused development work.", links: [anchor("/assets/women-empowerment-brochure-sanjo.pdf", "Download PDF", "btn btn-secondary")] },
            { title: "Personal Effectiveness Mentorship Program", copy: "A downloadable overview of the mentorship pathway.", links: [anchor("/assets/personal-effectiveness-mentorship-program-sanjo.pdf", "Download PDF", "btn btn-secondary")] },
            { title: "Overcome Exam Stress Through Smart Learning", copy: "A brochure for the student stress and smart learning programme.", links: [anchor("/assets/overcome-exam-stress-transformational-smart-learning-workshop-sanjo.pdf", "Download PDF", "btn btn-secondary")] },
            { title: "Parenting With Passion", copy: "A brochure supporting the parenting pathway.", links: [anchor("/assets/Sanjo-Parenting-With-passion-brochure.pdf", "Download PDF", "btn btn-secondary")] },
            { title: "Clarity Crest Counselling", copy: "A downloadable counselling and clarity support overview.", links: [anchor("/assets/clarity-crest-counsel-sanjo.pdf", "Download PDF", "btn btn-secondary")] }
          ], "resource-card", "grid-3")}
        </div>
      </section>
      `,
      ctaBand({
        title: "Need help choosing the right resource or programme?",
        copy: "A short message is often faster than guessing. Use the contact page if you want help selecting the most relevant next step.",
        actions: [
          anchor("/contact/", "Contact Sanjo", "btn btn-soft"),
          anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")
        ]
      })
    ].join("")
  }),
  page(routes.shop, {
    title: "The Resilience Response: The Blueprint for Intentional Living | Sanjo Cine Mathew",
    description: "Buy The Resilience Response by Dr. Sanjo Cine Mathew, a practical book on intentional living, emotional resilience, and growth-oriented mindset building.",
    ogImage: "/blog/images/post/the-resilience-response-sanjo-blog.png",
    breadcrumbs: [{ label: "Books & Publications", route: routes.shop }],
    content: [
      renderHero({
        eyebrow: "Featured Book",
        title: "The Resilience Response: The Blueprint for Intentional Living",
        copy: "A practical read on intentional living, emotional resilience, and growth-oriented mindset building.",
        actions: [
          anchor("https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0", "Buy the Book", "btn btn-primary"),
          anchor(routes.consultation, "Book a Consultation", "btn btn-secondary"),
          anchor(routes.programs, "Explore Related Programs", "btn btn-soft")
        ],
        media: { image: "/blog/images/post/the-resilience-response-sanjo-blog.png", alt: "The Resilience Response book cover by Dr. Sanjo Cine Mathew" },
        panelTitle: "by Dr. Sanjo Cine Mathew",
        panelCopy: "Pair the book with a consultation for deeper personalized transformation support.",
        panelMeta: ["Kindle", "Paperback", "Intentional Living", "Emotional Resilience"]
      }, renderBreadcrumbs({ route: routes.shop, breadcrumbs: [{ label: "Home", route: "/" }, { label: "Books & Publications", route: routes.shop }] })),
      `
      <section class="section">
        <div class="container shop-grid">
          <article class="story-card reveal">
            ${sectionHeader({
              eyebrow: "Buy the Book",
              title: "Choose your preferred marketplace.",
              copy: "The old Sanjo.in shop links are restored here in a polished book page."
            })}
            <div class="store-grid">
              ${[
                ["Amazon India", [
                  anchor("https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0", "Kindle", "btn btn-secondary"),
                  anchor("https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living/dp/9334282967/ref=tmm_pap_swatch_0", "Paperback", "btn btn-secondary")
                ]],
                ["Amazon US", [
                  anchor("https://www.amazon.com/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0", "Kindle", "btn btn-secondary"),
                  anchor("https://www.amazon.com/Resilience-Response-Blueprint-Intentional-Living/dp/B0FTTB5LNL/ref=tmm_pap_swatch_0", "Paperback", "btn btn-secondary")
                ]],
                ["Other Stores", [
                  anchor("https://store.pothi.com/book/dr-sanjo-cine-mathew-resilience-response-blueprint-intentional-living/", "Pothi.com", "btn btn-secondary"),
                  anchor("https://www.flipkart.com/resilience-response-blueprint-intentional-living/p/itmc9300863e51ed?pid=9789334282962", "Flipkart", "btn btn-secondary")
                ]]
              ].map(([title, buttons]) => `
                <div class="store-card">
                  <h3>${title}</h3>
                  <div class="button-row">${buttons.join("")}</div>
                </div>
              `).join("")}
            </div>
          </article>
          <aside class="quote-panel reveal">
            <blockquote>Rise Above. Respond Intentionally. Live Powerfully.</blockquote>
            <p>Students, professionals, educators, and growth-seekers who want practical tools for resilient, intentional living will find this book a grounded companion.</p>
            <cite>Available in Kindle and Paperback</cite>
          </aside>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Pair the Book With Guidance",
            title: "Continue your growth journey with related programs.",
            copy: "The book can stand alone, or it can become a doorway into deeper counselling, mentoring, student support, or parenting guidance."
          })}
          ${renderCards([
            { title: "Clarity Crest Counselling / C3", copy: "Personalized coaching for clarity, purpose, decision-making, and goal mastery.", links: [anchor(`${routes.counselling}#c3-program`, "Explore C3", "btn btn-secondary")] },
            { title: "Personal Effectiveness Mentorship", copy: "Life skills, leadership, personality growth, assessment-led guidance, and action planning.", links: [anchor(`${routes.programs}#personal-effectiveness-mentorship`, "Explore Mentorship", "btn btn-secondary")] },
            { title: "Overcome Exam Stress", copy: "Smart learning tools to reduce stress, improve confidence, and build emotionally steady preparation.", links: [anchor(`${routes.schools}#exam-stress`, "Explore Exam Stress", "btn btn-secondary")] },
            { title: "Parenting With Passion", copy: "Practical frameworks for emotional foundations, communication, positive discipline, and child growth.", links: [anchor(`${routes.schools}#parenting-with-passion`, "Explore Parenting", "btn btn-secondary")] }
          ], "program-card", "grid-4")}
        </div>
      </section>
      `,
      ctaBand({
        title: "Buy the book, then go deeper where guidance is needed.",
        copy: "Use the book as a practical starting point for intentional living, resilience, and personal transformation.",
        actions: [
          anchor("https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0", "Buy the Book", "btn btn-soft"),
          anchor(routes.consultation, "Book a Consultation", "btn btn-secondary"),
          anchor(routes.programs, "Explore Related Programs", "btn btn-secondary")
        ]
      })
    ].join("")
  })
];

function relatedPostsFor(post, count = 3) {
  const byRelevance = blogPosts.filter((candidate) => {
    if (candidate.slug === post.slug) return false;
    return candidate.category === post.category || candidate.tags.some((tag) => post.tags.includes(tag));
  });
  return fallbackPosts(byRelevance, blogPosts.filter((candidate) => candidate.slug !== post.slug), count);
}

function renderArticleBody(post) {
  const related = relatedPostsFor(post, 4);
  const shareUrl = fullUrl(`${routes.blog}${post.slug}/`);
  const tagLinks = post.tags.slice(0, 6).map((tag) => `<a class="blog-tag-link" href="${routes.blog}?tag=${encodeURIComponent(tag)}">${escapeAttr(tag)}</a>`).join("");

  if (post.content) {
    return `
      <section class="section">
        <div class="container article-layout">
          <article class="story-card article-content reveal">
            <div class="blog-meta-line">${metaPills([post.category, post.readTime, post.date])}</div>
            ${post.content}
            <div class="blog-card-tags">${tagLinks}</div>
          </article>
          <aside class="quote-panel article-side-card reveal">
            <blockquote>Dr. Sanjo Cine Mathew</blockquote>
            <p>I write about counselling, life skills, emotional intelligence, parenting, leadership, learning, and practical pathways for intentional living.</p>
            <div class="share-row">
              <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <button type="button" data-copy-link="${shareUrl}">Copy link</button>
            </div>
            <div class="button-row">
              ${anchor(routes.consultation, "Book a Consultation", "btn btn-soft")}
              ${anchor(routes.contact, "Discuss This Topic", "btn btn-secondary")}
            </div>
            <div class="related-posts">
              <h3>Related posts</h3>
              <div class="mini-post-list">
                ${related.map((item) => `
                  <a class="mini-post" href="${routes.blog}${item.slug}/">
                    <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" decoding="async">
                    <span class="mini-post-body"><span>${item.category}</span><strong>${item.title}</strong><small>${item.readTime}</small></span>
                  </a>
                `).join("")}
              </div>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  return `
    <section class="section">
      <div class="container article-layout">
        <div class="story-card reveal">
          <h2 class="blog-post-header">Key ideas</h2>
          ${list(post.points)}
        </div>
        <div class="story-card reveal">
          <h2 class="blog-post-header">Practical reflection</h2>
          ${list(post.practices)}
        </div>
        <div class="quote-panel reveal">
          <blockquote>${post.intro}</blockquote>
          <p>${post.excerpt}</p>
          <cite>${post.author}</cite>
          <div class="blog-card-tags">${tagLinks}</div>
        </div>
      </div>
    </section>
  `;
}

function renderArticleBottom(post) {
  const related = relatedPostsFor(post, 3);
  const index = blogPosts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = index > 0 ? blogPosts[index - 1] : null;
  const next = index >= 0 && index < blogPosts.length - 1 ? blogPosts[index + 1] : null;

  return `
    <section class="section tight">
      <div class="container article-bottom">
        ${sectionHeader({
          eyebrow: "Related Reading",
          title: "Continue with connected insights.",
          copy: "These articles are selected from similar categories, shared tags, or the latest Sanjo.in insights."
        })}
        <div class="grid-3">
          ${related.map((item) => renderBlogCard(item, { cta: "Read Next", result: false })).join("")}
        </div>
        ${(previous || next) ? `
          <nav class="post-nav" aria-label="Previous and next blog posts">
            ${previous ? `<a href="${routes.blog}${previous.slug}/"><span>Previous</span><strong>${previous.title}</strong></a>` : "<span></span>"}
            ${next ? `<a href="${routes.blog}${next.slug}/"><span>Next</span><strong>${next.title}</strong></a>` : "<span></span>"}
          </nav>
        ` : ""}
      </div>
    </section>
  `;
}

const articlePages = blogPosts.map((post) =>
  page(`${routes.blog}${post.slug}/`, {
    title: `${post.title} | Sanjo Cine Mathew`,
    description: post.excerpt,
    ogImage: post.image || "/assets/imgs/blog1.jpg",
    bodyClass: "page-blog-detail",
    article: post,
    breadcrumbs: [
      { label: "Blog / Insights", route: routes.blog },
      { label: post.title, route: `${routes.blog}${post.slug}/` }
    ],
    content: [
      renderHero({
        className: "article-hero",
        eyebrow: post.category,
        title: post.title,
        copy: post.intro,
        actions: [anchor(routes.blog, "Back to Blog", "btn btn-primary"), anchor(routes.contact, "Discuss This Topic", "btn btn-secondary")],
        media: { html: renderPostImage(post, "article-hero-image") },
        panelTitle: `${post.author}`,
        panelCopy: post.excerpt,
        panelMeta: [post.category, post.date, post.readTime]
      }, renderBreadcrumbs({ route: `${routes.blog}${post.slug}/`, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Blog / Insights", route: routes.blog }, { label: post.title, route: `${routes.blog}${post.slug}/` }] })),
      renderArticleBody(post),
      renderArticleBottom(post),
      ctaBand({
        title: "Turn reflection into a practical next step.",
        copy: "Reflection creates awareness. Action creates transformation. If this insight resonates with your personal, educational, or organizational journey, let's explore the next step together.",
        actions: [
          anchor("/book-consultation/", "Book a Consultation", "btn btn-soft"),
          anchor("/programs/", "Explore Programs", "btn btn-secondary")
        ]
      })
    ].join("")
  })
);

const legacyRedirects = [
  { from: "blog.html", to: routes.blog },
  { from: "blog/index.html", to: routes.blog },
  { from: "clarity-crest-counselling-sanjo.html", to: `${routes.counselling}#c3-program` },
  { from: "empower-to-empowerment-womens-workshop-sanjo.html", to: `${routes.women}#empower-to-empowerment` },
  { from: "overcome-exam-stress-transformational-smart-learning-workshop.html", to: `${routes.schools}#exam-stress` },
  { from: "parenting-with-passion.html", to: `${routes.schools}#parenting-with-passion` },
  { from: "personal-effectiveness-mentorship-program.html", to: `${routes.programs}#personal-effectiveness-mentorship` },
  { from: "interesting-fun-facts-about-sanjo.html", to: routes.about },
  { from: "feedback/index.html", to: routes.contact },
  { from: "about/index.html", to: routes.about },
  { from: "waymaker-skills/index.html", to: routes.waymaker },
  { from: "shop.html", to: routes.shop },
  { from: "shop-the-resilience-response/index.html", to: routes.shop },
  { from: "nova-methodology/index.html", to: routes.nova },
  { from: "lq-life-intelligence-quotient/index.html", to: routes.lq },
  ...blogPosts.map((post) => ({ from: `blog/${post.slug}/index.html`, to: `${routes.blog}${post.slug}/` }))
];

function redirectHtml(target) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${fullUrl(target)}">
  <script>location.replace(${JSON.stringify(target)});</script>
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="${target}">${target}</a></p>
</body>
</html>`;
}

function notFoundHtml() {
  return renderPage(page("/404.html", {
    title: "Page Not Found | Sanjo Cine Mathew",
    description: "The requested Sanjo Cine Mathew page could not be found. Use the main navigation to continue.",
    ogImage: "/assets/imgs/avatar.jpg",
    content: `
      <section class="hero-section">
        <div class="container">
          <div class="page-hero hero-animated">
            ${decorLayer("hero-decor")}
            <div class="page-hero-grid">
              <div class="hero-copy">
                <p class="eyebrow">404</p>
                <h1 class="hero-title">This page could not be found.</h1>
                <p class="lede">The page may have moved, or the link may be old. Continue through the main site paths below.</p>
                <div class="hero-actions">
                  ${anchor(routes.home, "Go Home", "btn btn-primary")}
                  ${anchor(routes.blog, "Read Insights", "btn btn-secondary")}
                  ${anchor(routes.contact, "Contact Sanjo", "btn btn-soft")}
                </div>
              </div>
              <aside class="hero-panel">
                <h2 class="hero-panel-title">Useful paths</h2>
                ${list(["Programs", "Blog / Insights", "Book a Consultation", "WayMaker Skills"], "hero-list")}
              </aside>
            </div>
          </div>
        </div>
      </section>
    `
  }));
}

async function writeSupportFiles() {
  if (DEPLOY_BUILD) {
    await copyIfExists(path.join(ROOT, "assets"), path.join(OUTPUT_DIR, "assets"));
    await copyIfExists(path.join(ROOT, "blog", "images"), path.join(OUTPUT_DIR, "blog", "images"));
    await copyIfExists(path.join(ROOT, "summer-camp"), path.join(OUTPUT_DIR, "summer-camp"));
  }
  await safeWrite(path.join(OUTPUT_DIR, "assets/css/site.css"), SITE_CSS.trimStart());
  await safeWrite(path.join(OUTPUT_DIR, "assets/js/site.js"), SITE_JS.trimStart());
  await safeWrite(path.join(OUTPUT_DIR, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
  await safeWrite(path.join(OUTPUT_DIR, "CNAME"), "sanjo.in\n");
  await safeWrite(path.join(OUTPUT_DIR, "404.html"), notFoundHtml());
}

async function writePages() {
  const everyPage = [...pages, ...articlePages];
  for (const item of everyPage) {
    await safeWrite(slugToOutputPath(item.route), renderPage(item));
  }

  for (const redirect of legacyRedirects) {
    await safeWrite(path.join(OUTPUT_DIR, redirect.from), redirectHtml(redirect.to));
  }
}

async function writeSitemap() {
  const urls = [...pages, ...articlePages].map((item) => {
    return `  <url>\n    <loc>${fullUrl(item.route)}</loc>\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  await safeWrite(path.join(OUTPUT_DIR, "sitemap.xml"), xml);
}

async function run() {
  await prepareOutputDir();
  await writeSupportFiles();
  await writePages();
  await writeSitemap();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
