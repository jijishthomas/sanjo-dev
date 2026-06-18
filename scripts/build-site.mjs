import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOOKS_ROUTE,
  BOOKS_PORTRAIT,
  BOOKS_RECOGNITION,
  BOOK_AUTHOR_CREDENTIALS,
  BOOK_TITLES,
  INTENTIONAL_SERIES,
  books,
  bookRoute,
  legacyBookRoute
} from "../data/books.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const outDirArgIndex = process.argv.indexOf("--out-dir");
const outDirEqualsArg = process.argv.find((arg) => arg.startsWith("--out-dir="));
const outDirArg = outDirEqualsArg
  ? outDirEqualsArg.slice("--out-dir=".length)
  : outDirArgIndex >= 0 ? process.argv[outDirArgIndex + 1] : process.env.SANJO_BUILD_DIR;
const OUTPUT_DIR = outDirArg ? path.resolve(ROOT, outDirArg) : ROOT;
const DEPLOY_BUILD = OUTPUT_DIR !== ROOT;
const BASE_URL = normalizeBaseUrl(process.env.SANJO_BASE_URL || "https://sanjo.in");
const PUBLIC_BASE_PATH = normalizePublicBasePath(process.env.SANJO_PUBLIC_BASE || "");
const CNAME = Object.hasOwn(process.env, "SANJO_CNAME")
  ? process.env.SANJO_CNAME.trim()
  : BASE_URL === "https://sanjo.in" ? "sanjo.in" : "";
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
  --site-max-width: 1440px;
  --site-gutter: clamp(16px, 3vw, 48px);
  --site-content-width: min(calc(100% - (2 * var(--site-gutter))), var(--site-max-width));
  --site-section-copy-width: 1040px;
  --site-reading-width: 960px;
  --container: var(--site-content-width);
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

.container,
.site-container {
  width: var(--site-content-width);
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
  max-width: var(--site-section-copy-width);
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

.hero-supporting {
  margin: 0;
  color: var(--ink-soft);
  max-width: 62ch;
}

.hero-supporting-meta {
  margin: -4px 0 0;
  color: var(--brand-deep);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.6;
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

.hero-media.is-logo-media {
  display: grid;
  place-items: center;
  min-height: 180px;
  padding: 24px;
}

.hero-media.is-logo-media img {
  width: auto;
  height: clamp(120px, 16vw, 150px);
  max-width: 50%;
  object-fit: contain;
}

.waymaker-logo-panel {
  display: grid;
  place-items: center;
  padding: clamp(14px, 2vw, 22px);
  border-radius: calc(var(--radius-card) - 8px);
  border: 1px solid rgba(14, 122, 114, 0.18);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 14px 34px rgba(18, 63, 66, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.waymaker-logo-panel img {
  display: block;
  width: min(100%, var(--waymaker-logo-max-width, 280px));
  height: auto;
  aspect-ratio: 1268 / 1241;
  object-fit: contain;
  object-position: center;
}

.waymaker-logo-panel.is-inline img {
  max-width: clamp(200px, 18vw, 250px);
}

@media (hover: hover) and (pointer: fine) {
  .waymaker-logo-panel:hover {
    transform: translateY(-2px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.82),
      0 18px 34px rgba(20, 38, 67, 0.11);
  }
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

.waymaker-bridge .quote-panel {
  display: grid;
  gap: 0;
  align-items: start;
}

.waymaker-bridge .quote-panel > .waymaker-logo-panel {
  margin-inline: auto;
}

.waymaker-founder-header {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin-top: 22px;
}

.waymaker-bridge .quote-panel blockquote {
  margin: 0;
  text-align: center;
  font-size: clamp(1.65rem, 2.2vw, 2.15rem);
  line-height: 1.2;
  text-wrap: balance;
}

.waymaker-divider {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 14px;
}

.waymaker-divider::before,
.waymaker-divider::after {
  content: "";
  width: 38px;
  height: 2px;
  border-radius: 999px;
}

.waymaker-divider::before {
  background: rgba(14, 122, 114, 0.72);
}

.waymaker-divider::after {
  background: rgba(191, 149, 63, 0.82);
}

.waymaker-divider span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(14, 122, 114, 0.82);
  box-shadow: 0 0 0 4px rgba(14, 122, 114, 0.08);
}

.waymaker-bridge .quote-panel > p {
  margin: 24px 0 0;
  max-width: 62ch;
  line-height: 1.7;
}

.waymaker-bridge .quote-panel .chips {
  margin-top: 26px;
  gap: 10px 12px;
}

.waymaker-bridge .quote-panel .button-row {
  margin-top: 24px;
  gap: 12px;
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

.site-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  min-width: 0;
  margin-right: auto;
}

.site-brand__logo {
  display: block;
  width: auto;
  height: clamp(38px, 3vw, 46px);
  max-width: min(100%, 180px);
  object-fit: contain;
  object-position: left center;
}

.site-brand__text {
  color: var(--text);
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
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

.blog-main,
.blog-default-content,
.blog-results-section {
  display: grid;
  gap: 24px;
  align-content: start;
}

.featured-blog-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
  gap: 22px;
  align-items: start;
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

.story-quote {
  margin: 18px 0 0;
  font-family: var(--font-display);
  font-size: 1.28rem;
  line-height: 1.4;
}

.story-card > br {
  display: none;
}

.story-card h2.muted {
  margin-top: 18px;
  font-size: 1.28rem;
  line-height: 1.4;
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
  max-width: var(--site-section-copy-width);
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
  --site-max-width: 1440px;
  --site-gutter: clamp(16px, 3vw, 48px);
  --site-content-width: min(calc(100% - (2 * var(--site-gutter))), var(--site-max-width));
  --site-section-copy-width: 1040px;
  --site-reading-width: 960px;
  --container: var(--site-content-width);
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
  max-width: var(--site-section-copy-width);
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
  width: var(--site-content-width);
  margin-inline: auto;
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

.site-brand {
  flex: 0 0 auto;
  margin-right: 0;
}

.site-brand__logo {
  height: clamp(28px, 2.3vw, 34px);
  max-width: 60px;
}

.site-brand__text {
  font-size: clamp(1.02rem, 1.2vw, 1.22rem);
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
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 8px;
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
  bottom: 0;
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
  max-width: 960px;
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
  width: var(--site-content-width);
  margin-inline: auto;
}

.header-inner {
  min-height: 76px;
}

.header-row {
  display: grid;
  grid-template-columns: minmax(230px, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.site-brand {
  min-width: 0;
  max-width: 260px;
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
  grid-template-columns: minmax(0, var(--site-reading-width)) minmax(260px, 340px);
  justify-content: space-between;
  align-items: start;
}

.article-content {
  max-width: var(--site-reading-width);
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

.books-carousel-shell {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 4vw, 38px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 30px;
  background:
    radial-gradient(circle at 78% 42%, rgba(200, 145, 43, 0.2), transparent 22%),
    radial-gradient(circle at 8% 82%, rgba(66, 185, 173, 0.2), transparent 24%),
    linear-gradient(135deg, rgba(15, 31, 57, 0.98), rgba(14, 122, 114, 0.94));
  color: #fff;
  box-shadow: 0 30px 70px rgba(20, 38, 67, 0.2);
}

.books-carousel-shell::before,
.books-carousel-shell::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.books-carousel-shell::before {
  right: -64px;
  top: -76px;
  width: 230px;
  height: 230px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.books-carousel-shell::after {
  left: -74px;
  bottom: -92px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.11), transparent 68%);
}

.books-carousel-head {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  max-width: 760px;
  margin-bottom: 20px;
}

.books-carousel-head .eyebrow,
.books-carousel-head h2,
.books-carousel-head p {
  color: #fff;
}

.books-carousel-head h2,
.book-detail-title,
.books-index-title {
  font-family: var(--font-display);
  line-height: 1.08;
}

.books-carousel-head h2 {
  font-size: clamp(2rem, 4vw, 3.4rem);
}

.books-carousel-head p {
  color: rgba(255, 255, 255, 0.84);
}

.books-carousel {
  position: relative;
  z-index: 1;
}

.book-slides {
  position: relative;
  min-height: 470px;
}

.book-slide {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(300px, 0.72fr);
  gap: clamp(22px, 4vw, 54px);
  align-items: center;
  opacity: 0;
  transform: translateX(18px);
  pointer-events: none;
  transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease);
}

.book-slide.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.book-slide-copy {
  display: grid;
  gap: 16px;
  max-width: 820px;
}

.book-slide-kicker,
.book-series-badge,
.book-card-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.book-slide h3 {
  max-width: 850px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.6vw, 4.15rem);
  line-height: 1.04;
}

.book-slide-summary {
  max-width: 720px;
  color: rgba(255, 255, 255, 0.84);
  font-size: clamp(1.02rem, 1.4vw, 1.16rem);
}

.book-slide-author {
  color: rgba(255, 255, 255, 0.78);
  font-weight: 800;
}

.book-slide-author a {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.book-slide .outcome-chips span {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.book-slide .btn-soft {
  color: #102541;
  background: #fff3da;
  min-width: 154px;
}

.book-slide-cover {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 390px;
}

.book-slide-cover::before {
  content: "";
  position: absolute;
  width: min(88%, 350px);
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 62%),
    repeating-radial-gradient(circle, rgba(255, 255, 255, 0.11) 0 1px, transparent 1px 18px);
  animation: ringFloat 8s ease-in-out infinite;
}

.book-slide-cover img,
.book-detail-cover img,
.book-card-cover img,
.related-book img {
  object-fit: contain;
}

.book-slide-cover img {
  position: relative;
  z-index: 1;
  width: min(285px, 78vw);
  max-height: 390px;
  border-radius: 16px;
  box-shadow: 0 32px 70px rgba(0, 0, 0, 0.34);
  animation: softFloat 7s ease-in-out infinite;
}

.books-carousel-controls {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-top: 22px;
}

.book-arrow {
  width: 48px;
  height: 48px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
}

.book-arrow:hover,
.book-arrow:focus-visible,
.book-selector:hover,
.book-selector:focus-visible,
.book-selector.active {
  border-color: rgba(255, 255, 255, 0.58);
  background: rgba(255, 255, 255, 0.18);
}

.book-selector-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.book-selector {
  min-height: 60px;
  padding: 9px 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.book-selector span {
  display: block;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.book-selector strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.book-carousel-count {
  color: rgba(255, 255, 255, 0.78);
  font-weight: 900;
  text-align: right;
}

.book-detail-hero {
  background:
    radial-gradient(circle at 82% 20%, rgba(200, 145, 43, 0.2), transparent 25%),
    radial-gradient(circle at 12% 78%, rgba(14, 122, 114, 0.2), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(232, 246, 248, 0.94));
}

.books-breadcrumb-row {
  padding: 12px 0 0;
}

.books-breadcrumb-row .breadcrumbs {
  margin: 0;
}

.books-breadcrumb-row .breadcrumbs ol {
  padding: 0;
}

.books-showcase-section {
  padding-top: 18px;
}

.books-showcase {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 30px;
  padding: clamp(28px, 4vw, 44px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 34px;
  background:
    radial-gradient(circle at 0% 0%, rgba(240, 199, 103, 0.18), transparent 24%),
    radial-gradient(circle at 100% 10%, rgba(16, 150, 136, 0.22), transparent 28%),
    radial-gradient(circle at 18% 100%, rgba(29, 79, 145, 0.22), transparent 26%),
    linear-gradient(135deg, #103f4f 0%, #0c5b60 48%, #16706c 100%);
  box-shadow: 0 28px 64px rgba(11, 54, 65, 0.22);
  color: #f6f4ee;
}

.books-showcase::before,
.books-showcase::after {
  content: "";
  position: absolute;
  inset: auto;
  pointer-events: none;
}

.books-showcase::before {
  top: 0;
  left: 10%;
  width: 180px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 247, 224, 0.6), transparent);
}

.books-showcase::after {
  right: -8%;
  bottom: -12%;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 199, 103, 0.16), transparent 62%);
}

.books-showcase-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(180px, 0.22fr) minmax(0, 1fr) minmax(180px, 0.22fr);
  gap: 26px;
  align-items: center;
}

.books-showcase-eyebrow {
  color: #f0d89a;
}

.books-showcase-title {
  display: grid;
  gap: 10px;
  margin: 0;
}

.books-showcase-title span {
  font-size: 0.92rem;
  font-family: var(--font-body);
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(246, 244, 238, 0.72);
}

.books-showcase-title strong {
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  line-height: 0.98;
  color: #fff8ec;
}

.books-showcase-summary {
  margin: 0;
  font-size: 1.12rem;
  color: #f3dfab;
}

.books-showcase-copy {
  max-width: 58ch;
  color: rgba(246, 244, 238, 0.82);
}

.books-author-credentials {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.books-author-credential {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 16px 0;
}

.books-author-credential:not(:first-child) {
  padding-left: 18px;
  border-left: 1px solid rgba(255, 255, 255, 0.16);
}

.books-author-credential-icon .icon-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff5db;
}

.books-author-credential-copy {
  display: grid;
  gap: 4px;
}

.books-author-credential-copy strong,
.books-author-credential-copy span {
  display: block;
}

.books-author-credential-copy strong {
  color: rgba(255, 248, 236, 0.94);
  font-size: 0.88rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.books-author-credential-copy span {
  color: rgba(246, 244, 238, 0.72);
  font-size: 0.92rem;
}

.books-author-portrait {
  margin: 0;
}

.books-author-portrait-shell {
  position: relative;
  width: min(260px, 100%);
  aspect-ratio: 4 / 5;
  margin-inline: auto;
  padding: 14px;
  border-radius: 36px;
  border: 1px solid rgba(240, 199, 103, 0.36);
  background: radial-gradient(circle at 30% 30%, rgba(240, 199, 103, 0.18), rgba(15, 72, 86, 0.92));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 40px rgba(4, 32, 40, 0.28);
}

.books-author-portrait-shell::before {
  content: "";
  position: absolute;
  top: 18px;
  right: 26px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff5db 0%, #f0c767 52%, rgba(240, 199, 103, 0.08) 100%);
  box-shadow: 0 0 22px rgba(240, 199, 103, 0.62);
}

.books-author-portrait-placeholder {
  display: grid;
  place-items: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top, rgba(240, 199, 103, 0.14), transparent 38%),
    linear-gradient(180deg, rgba(18, 82, 92, 0.96), rgba(11, 54, 65, 1));
  text-align: center;
}

.books-author-portrait-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 28px;
}

.books-author-portrait-placeholder-icon .icon-mark {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff5db;
}

.books-author-portrait-placeholder span {
  font-size: 0.76rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(246, 244, 238, 0.74);
}

.books-author-portrait-placeholder strong {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: #fff8ec;
}

.books-author-portrait-placeholder strong + span {
  color: rgba(246, 244, 238, 0.68);
  font-size: 0.92rem;
}

.books-author-copy {
  display: grid;
  gap: 18px;
}

.books-record-badge {
  display: grid;
  place-items: center;
}

.books-record-badge-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  max-width: 250px;
  padding: 20px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(5, 41, 48, 0.08));
  text-align: center;
}

.books-record-badge-copy {
  display: grid;
  gap: 4px;
}

.books-record-badge-kicker {
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(246, 244, 238, 0.66);
}

.books-record-badge-copy strong {
  font-family: var(--font-display);
  font-size: 1.2rem;
  line-height: 1.05;
  color: #f3dfab;
}

.books-record-badge-copy span:last-child {
  color: rgba(246, 244, 238, 0.86);
}

.books-record-laurel {
  position: relative;
  width: 20px;
  height: 74px;
}

.books-record-laurel::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 2px solid rgba(240, 199, 103, 0.72);
  border-left: 0;
  border-top: 0;
  border-bottom: 0;
  border-radius: 50%;
}

.books-record-laurel::after {
  content: "";
  position: absolute;
  inset: 8px 0;
  background:
    radial-gradient(circle at 50% 10%, rgba(240, 199, 103, 0.94) 0 3px, transparent 3.5px),
    radial-gradient(circle at 50% 28%, rgba(240, 199, 103, 0.88) 0 3px, transparent 3.5px),
    radial-gradient(circle at 50% 46%, rgba(240, 199, 103, 0.84) 0 3px, transparent 3.5px),
    radial-gradient(circle at 50% 64%, rgba(240, 199, 103, 0.8) 0 3px, transparent 3.5px),
    radial-gradient(circle at 50% 82%, rgba(240, 199, 103, 0.76) 0 3px, transparent 3.5px);
}

.books-record-laurel-right::before {
  border-right: 0;
  border-left: 2px solid rgba(240, 199, 103, 0.72);
}

.books-hero-books {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.books-hero-book {
  display: flex;
  min-width: 0;
}

.books-hero-book-link {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 18px 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(7, 56, 67, 0.84), rgba(8, 41, 50, 0.88));
  color: inherit;
  text-decoration: none;
  transition: transform var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}

.books-hero-book-link:hover,
.books-hero-book-link:focus-visible {
  transform: translateY(-8px);
  border-color: rgba(240, 199, 103, 0.34);
  box-shadow: 0 18px 38px rgba(6, 32, 40, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.books-hero-book-link:focus-visible {
  outline: 3px solid rgba(240, 199, 103, 0.76);
  outline-offset: 3px;
}

.books-hero-book-badge,
.books-hero-book-kicker,
.books-hero-book-action {
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.books-hero-book-badge {
  color: rgba(246, 244, 238, 0.56);
}

.books-hero-book-kicker {
  color: #f0d89a;
}

.books-hero-book-media {
  display: grid;
  place-items: center;
  min-height: clamp(240px, 30vw, 410px);
  padding: 12px 6px 6px;
}

.books-hero-book-media img {
  width: 100%;
  max-width: 240px;
  max-height: clamp(260px, 31vw, 430px);
  object-fit: contain;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.34));
}

.books-hero-book-title {
  font-family: var(--font-display);
  font-size: 1.28rem;
  line-height: 1.08;
  color: #fff8ec;
}

.books-hero-book-subtitle {
  color: rgba(246, 244, 238, 0.76);
  font-size: 0.94rem;
  line-height: 1.35;
}

.books-hero-book-action {
  margin-top: auto;
  color: rgba(246, 244, 238, 0.84);
}

.books-certificates {
  display: grid;
  gap: 28px;
}

.books-certificates-header h2 {
  margin: 8px 0 0;
  color: var(--text);
}

.books-certificates-header p:last-child {
  max-width: 68ch;
}

.books-certificates-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.books-certificate-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: var(--shadow-soft);
  transition: transform var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

.books-certificate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 36px rgba(22, 35, 63, 0.12);
}

.books-certificate-frame {
  display: grid;
  place-items: center;
  min-height: 300px;
  padding: 20px;
  border: 1px solid rgba(29, 79, 145, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(243, 248, 255, 0.9), rgba(251, 248, 241, 0.96));
}

.books-certificate-frame img {
  width: 100%;
  height: 100%;
  max-height: 360px;
  object-fit: contain;
}

.books-certificate-placeholder {
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 240px;
  color: var(--muted);
  text-align: center;
}

.books-certificate-placeholder .icon-mark {
  width: 56px;
  height: 56px;
  border-radius: 20px;
}

.books-certificate-caption {
  display: grid;
  gap: 8px;
}

.books-certificate-label,
.recognition-preview-kicker {
  color: var(--secondary);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.books-certificate-caption h3,
.recognition-preview-title {
  font-family: var(--font-display);
  font-size: 1.24rem;
  line-height: 1.1;
}

.books-certificate-caption p {
  color: var(--muted);
}

.books-certificate-action {
  justify-self: start;
  min-height: 42px;
  padding: 10px 16px;
  border: 1px solid rgba(29, 79, 145, 0.14);
  border-radius: 999px;
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
  font-weight: 800;
}

.books-showcase .btn-soft {
  color: #fff8ec;
  background: rgba(255, 243, 218, 0.14);
  border-color: rgba(240, 199, 103, 0.26);
}

.books-showcase .btn-soft:hover,
.books-showcase .btn-soft:focus-visible {
  background: rgba(255, 243, 218, 0.2);
}

.books-certificate-action:disabled {
  background: rgba(22, 35, 63, 0.06);
  color: var(--muted);
}

.recognition-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 24px;
  padding: clamp(24px, 3vw, 34px);
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(200, 145, 43, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(243, 249, 248, 0.92));
  box-shadow: var(--shadow-soft);
}

.recognition-panel-compact {
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.7fr);
}

.recognition-panel-copy,
.recognition-panel-visual {
  display: grid;
  gap: 16px;
  align-content: start;
}

.recognition-facts {
  display: grid;
  gap: 10px;
  padding-left: 1.1rem;
  color: var(--muted);
}

.recognition-preview-card,
.recognition-preview-placeholder {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-soft);
}

.recognition-preview-card {
  color: inherit;
  text-align: left;
  width: 100%;
}

.recognition-carousel {
  display: grid;
  gap: 14px;
}

.recognition-carousel-slides {
  position: relative;
}

.recognition-carousel-slide {
  display: none;
}

.recognition-carousel-slide.active {
  display: block;
}

.recognition-carousel-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
}

.recognition-carousel-selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  grid-column: 2;
}

.recognition-carousel-selector {
  width: 11px;
  height: 11px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(29, 79, 145, 0.18);
  transition: transform var(--dur-fast) ease, background var(--dur-fast) ease;
}

.recognition-carousel-selector.active,
.recognition-carousel-selector:hover,
.recognition-carousel-selector:focus-visible {
  background: var(--secondary);
  transform: scale(1.15);
}

.recognition-carousel-controls .book-carousel-count {
  justify-self: end;
}

.recognition-preview-frame {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(245, 240, 232, 0.72);
}

.recognition-preview-frame img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
}

.recognition-preview-placeholder {
  place-items: center;
  min-height: 100%;
  text-align: center;
}

.recognition-preview-placeholder .icon-mark {
  width: 58px;
  height: 58px;
  border-radius: 20px;
}

.recognition-preview-placeholder strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
}

.recognition-preview-placeholder span {
  color: var(--muted);
}

.books-purpose-strip {
  position: relative;
  z-index: 1;
  margin-top: 4px;
  padding: 22px 28px;
  border: 1px solid rgba(216, 163, 59, 0.2);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 244, 219, 0.96), rgba(246, 231, 190, 0.96) 44%, rgba(255, 248, 232, 0.98) 100%);
  color: #123844;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.books-purpose-strip p {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.04rem, 2vw, 1.36rem);
  line-height: 1.35;
}

.books-collection-section {
  padding-top: 58px;
}

.books-reader-section {
  padding-top: 12px;
}

.books-reader-shell {
  display: grid;
  gap: 22px;
}

.books-reader-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.books-reader-card {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 24px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 250, 244, 0.96));
  box-shadow: var(--shadow-soft);
}

.books-reader-card h3 {
  margin: 0;
  font-size: 1.42rem;
}

.books-reader-card p {
  margin: 0;
}

.books-reader-card-kicker {
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.books-reader-steps {
  display: grid;
  gap: 12px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.book-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
  height: 100%;
}

.book-card-cover {
  display: grid;
  place-items: center;
  min-height: 240px;
  border-radius: 20px;
  background:
    radial-gradient(circle at center, rgba(14, 122, 114, 0.12), transparent 58%),
    linear-gradient(135deg, #f6fbfb, #fff6e8);
}

.book-card-cover img {
  width: min(180px, 82%);
  max-height: 230px;
}

.book-card-kicker {
  border-color: rgba(29, 79, 145, 0.12);
  background: rgba(29, 79, 145, 0.08);
  color: var(--primary);
}

.book-card h3 {
  font-family: var(--font-display);
  font-size: 1.22rem;
  line-height: 1.16;
}

.book-card .button-row {
  margin-top: auto;
}

.trilogy-path,
.book-purchase-panel,
.book-side-panel {
  display: grid;
  gap: 14px;
}

.trilogy-step {
  display: grid;
  gap: 4px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.book-detail-hero .page-hero-grid {
  grid-template-columns: minmax(0, 1.12fr) minmax(300px, 0.88fr);
}

.book-detail-cover {
  display: grid;
  place-items: center;
  min-height: 360px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 46%, rgba(14, 122, 114, 0.18), transparent 58%),
    linear-gradient(135deg, #eef8fb, #fff4dc);
}

.book-detail-cover img {
  width: min(275px, 78%);
  max-height: 380px;
  border-radius: 16px;
  box-shadow: 0 28px 60px rgba(20, 38, 67, 0.2);
}

.book-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
  gap: 22px;
  align-items: start;
}

.book-prose {
  display: grid;
  gap: 16px;
  max-width: 78ch;
}

.book-prose h2,
.book-section h2,
.book-purchase-panel h2,
.book-side-panel h2 {
  font-family: var(--font-display);
  line-height: 1.12;
}

.book-section {
  display: grid;
  gap: 14px;
}

.book-section + .book-section {
  margin-top: 24px;
}

.book-purchase-panel {
  padding: 22px;
  border: 1px solid rgba(200, 145, 43, 0.22);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(200, 145, 43, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(255, 249, 236, 0.9));
  box-shadow: var(--shadow-soft);
}

.book-purchase-panel .btn-primary,
.book-purchase-panel .btn-secondary {
  width: 100%;
}

.related-books-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.related-book {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
}

.related-book img {
  width: 82px;
  max-height: 116px;
}

.related-book strong {
  display: block;
  line-height: 1.22;
}

.book-nav {
  margin-top: 26px;
}

.book-detail-hero .page-hero-grid {
  align-items: center;
  padding-block: clamp(24px, 3.4vw, 42px);
}

.book-detail-hero .hero-copy {
  gap: 14px;
}

.book-detail-hero .hero-title {
  max-width: 980px;
  font-size: clamp(2rem, 4.4vw, 4.1rem);
}

.book-detail-hero .hero-panel {
  padding: 18px;
  gap: 12px;
}

.book-detail-hero .hero-panel-title a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.book-detail-main {
  padding-top: clamp(36px, 5vw, 64px);
  padding-bottom: clamp(28px, 4vw, 46px);
}

.book-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(310px, 4fr);
  gap: clamp(18px, 3vw, 30px);
  align-items: start;
}

.book-editorial-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 16px;
}

.book-content-card,
.book-support-card {
  display: grid;
  gap: 12px;
  padding: clamp(20px, 2.4vw, 28px);
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--shadow-soft);
}

.book-content-card {
  grid-column: span 4;
}

.book-content-card-wide {
  grid-column: 1 / -1;
}

.book-content-card h2,
.book-support-card h2 {
  font-family: var(--font-display);
  line-height: 1.12;
}

.book-content-card p,
.book-content-card li,
.book-support-card p,
.book-support-card li {
  color: #42506a;
  font-size: 1rem;
  line-height: 1.72;
}

.book-content-card p {
  max-width: 72ch;
}

.book-content-card .bullet-list,
.book-support-card .bullet-list {
  display: grid;
  gap: 8px;
}

.book-support-column {
  display: grid;
  gap: 14px;
}

.book-support-card blockquote {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  line-height: 1.16;
  color: var(--text);
}

.author-card-inner {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.author-card-inner img {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  object-fit: cover;
}

.author-card-inner .btn {
  margin-top: 10px;
}

.book-related-section {
  padding-top: clamp(28px, 4vw, 46px);
  padding-bottom: clamp(22px, 3vw, 34px);
}

.related-books-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.related-book {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding: 18px;
}

.related-book-cover {
  display: grid;
  place-items: center;
  min-height: 176px;
  border-radius: 18px;
  background:
    radial-gradient(circle at center, rgba(14, 122, 114, 0.12), transparent 58%),
    linear-gradient(135deg, #f6fbfb, #fff6e8);
}

.related-book-cover img {
  width: 100px;
  max-height: 154px;
  object-fit: contain;
}

.related-book-body {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.related-book h3 {
  font-family: var(--font-display);
  line-height: 1.16;
  font-size: 1.1rem;
}

.related-book p {
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.55;
}

.related-book:hover,
.related-book:focus-within,
.book-nav-card:hover,
.book-nav-card:focus-visible {
  border-color: rgba(29, 79, 145, 0.22);
  transform: translateY(-2px);
}

.book-nav-section {
  padding-top: 10px;
  padding-bottom: clamp(38px, 5vw, 64px);
}

.book-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 0;
}

.book-nav-card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(22, 35, 63, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-soft);
  transition: transform var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.book-nav-card img {
  width: 58px;
  max-height: 86px;
  object-fit: contain;
}

.book-nav-card small {
  display: block;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.book-nav-card strong {
  display: block;
  line-height: 1.2;
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

.blog-search-wrap:focus-within {
  border-color: rgba(29, 79, 145, 0.28);
  box-shadow: 0 0 0 4px rgba(29, 79, 145, 0.12);
}

.blog-search-icon {
  width: 40px;
  flex: 0 0 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
  margin-left: 6px;
}

.blog-search-icon svg {
  width: 20px;
  height: 20px;
}

.blog-search-wrap input {
  min-width: 0;
  width: 100%;
  flex: 1;
  border: 0;
  box-shadow: none;
  background: transparent;
  align-self: stretch;
  padding: 0 8px 0 2px;
  font-size: 0.96rem;
  line-height: 1;
}

.blog-search-wrap input:focus {
  outline: none;
}

.blog-search-clear {
  margin-right: 8px;
  border: 0;
  border-radius: 999px;
  padding: 7px 10px;
  background: rgba(20, 38, 67, 0.08);
  color: var(--primary);
  cursor: pointer;
  line-height: 1;
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

.blog-hub.is-filtering .blog-layout {
  grid-template-columns: minmax(0, 1fr);
}

.blog-hub.is-filtering .blog-default-content,
.blog-hub.is-filtering .blog-sidebar {
  display: none;
}

.blog-hub.is-filtering .blog-results-header {
  margin-top: 0;
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

.blog-card-title-link {
  color: inherit;
  text-decoration: none;
}

.blog-card-title-link:hover,
.blog-card-title-link:focus-visible {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 3px;
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
  margin-top: 0;
  padding: 26px;
  border: 1px solid rgba(200, 145, 43, 0.2);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 249, 236, 0.92), rgba(238, 248, 247, 0.86));
  box-shadow: var(--shadow-soft);
}

[data-blog-grid][hidden],
.blog-empty-card[hidden] {
  display: none;
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
  .books-breadcrumb-row {
    padding-top: 10px;
  }

  .books-showcase-top {
    grid-template-columns: minmax(160px, 0.24fr) minmax(0, 1fr);
    align-items: start;
  }

  .books-record-badge {
    grid-column: 1 / -1;
  }

  .books-record-badge-shell {
    max-width: 320px;
  }

  .books-hero-books,
  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .books-certificates-grid,
  .books-reader-grid {
    grid-template-columns: 1fr;
  }

  .page-hero-grid,
  .split-panel,
  .story-layout,
  .form-shell,
  .article-layout {
    grid-template-columns: 1fr;
  }

  .blog-layout,
  .featured-blog-grid,
  .blog-lanes {
    grid-template-columns: 1fr;
  }

  .blog-sidebar,
  .article-side-card {
    position: static;
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

  .books-breadcrumb-row {
    padding-top: 8px;
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
  .books-showcase,
  .waymaker-bridge,
  .blog-search-card {
    border-radius: 24px;
  }

  .blog-search-card {
    gap: 14px;
    padding: 16px;
  }

  .books-showcase {
    gap: 22px;
    padding: 24px 22px;
  }

  .books-showcase-top {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .books-author-copy {
    justify-items: center;
  }

  .books-showcase-copy {
    max-width: 100%;
  }

  .books-author-portrait-shell {
    width: min(200px, 58vw);
  }

  .books-record-badge-shell {
    max-width: 100%;
  }

  .books-author-credentials,
  .recognition-panel,
  .recognition-panel-compact {
    grid-template-columns: 1fr;
  }

  .books-author-credential {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 14px 0;
  }

  .books-author-credential:not(:first-child) {
    padding-left: 0;
    border-left: 0;
  }

  .books-hero-books {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .books-purpose-strip {
    padding: 20px 22px;
  }

  .books-collection-section {
    padding-top: 48px;
  }

  .books-carousel-shell {
    padding: 22px;
    border-radius: 24px;
  }

  .book-slides {
    min-height: 760px;
  }

  .book-slide {
    grid-template-columns: 1fr;
    align-content: start;
    gap: 18px;
  }

  .book-slide-copy {
    order: 1;
  }

  .book-slide-cover {
    order: 2;
    min-height: 300px;
  }

  .book-slide-cover img {
    width: min(225px, 74vw);
    max-height: 310px;
  }

  .books-carousel-controls {
    grid-template-columns: 48px minmax(0, 1fr) 48px;
  }

  .book-selector-list {
    grid-column: 1 / -1;
    grid-row: 2;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .book-carousel-count {
    grid-column: 2;
    grid-row: 1;
    text-align: center;
  }

  .books-grid,
  .related-books-grid,
  .book-detail-layout {
    grid-template-columns: 1fr;
  }

  .book-editorial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .book-content-card,
  .book-content-card-wide {
    grid-column: auto;
  }

  .book-content-card-wide {
    grid-column: 1 / -1;
  }

  .book-support-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .book-detail-hero .page-hero-grid {
    grid-template-columns: 1fr;
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

  .waymaker-logo-panel.is-inline img {
    max-width: clamp(180px, 24vw, 225px);
  }

  .hero-stats {
    grid-template-columns: 1fr 1fr;
  }

  .blog-results-header {
    display: grid;
    align-items: start;
  }

  .story-quote {
    font-size: 1.12rem;
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

  .waymaker-bridge .quote-panel > p,
  .waymaker-bridge .quote-panel .chips,
  .waymaker-bridge .quote-panel .button-row {
    margin-top: 22px;
  }

  .waymaker-logo-panel.is-inline {
    width: min(100%, 210px);
  }

  .waymaker-logo-panel.is-inline img {
    max-width: 210px;
  }

  .waymaker-founder-header {
    margin-top: 20px;
    gap: 10px;
  }

  .waymaker-bridge .quote-panel .button-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .site-header .container,
  .footer .container {
    width: var(--site-content-width);
  }

  .header-inner {
    position: relative;
    min-height: 72px;
  }

  .header-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }

  .site-brand {
    flex-basis: auto;
    max-width: min(62vw, 220px);
    min-width: 0;
    padding-right: 0;
  }

  .site-brand__logo {
    height: clamp(26px, 7vw, 32px);
    max-width: 54px;
  }

  .site-brand__text {
    font-size: clamp(0.98rem, 4vw, 1.1rem);
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

  .site-brand {
    max-width: min(68vw, 210px);
  }

  .site-brand__logo {
    height: clamp(24px, 7vw, 30px);
    max-width: 50px;
  }

  .site-brand__text {
    font-size: clamp(0.94rem, 4.5vw, 1.04rem);
  }

  .page-hero::after {
    display: none;
  }

  .books-carousel-shell {
    padding: 18px;
  }

  .books-showcase {
    padding: 18px;
  }

  .books-showcase-title strong {
    font-size: clamp(2rem, 11vw, 3rem);
  }

  .books-author-credentials {
    border-bottom: 0;
  }

  .books-author-credential {
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }

  .books-certificates-grid {
    grid-template-columns: 1fr;
  }

  .recognition-preview-card,
  .books-certificate-action {
    width: 100%;
  }

  .books-hero-books {
    grid-auto-flow: column;
    grid-auto-columns: minmax(170px, 74vw);
    grid-template-columns: none;
    overflow-x: auto;
    padding-bottom: 6px;
    scroll-snap-type: x proximity;
  }

  .books-hero-book {
    scroll-snap-align: start;
  }

  .books-hero-book-link {
    min-height: 100%;
  }

  .books-hero-book-media {
    min-height: 250px;
  }

  .books-purpose-strip {
    padding: 18px 18px 20px;
  }

  .books-collection-section {
    padding-top: 42px;
  }

  .book-slides {
    min-height: 830px;
  }

  .book-slide h3 {
    font-size: clamp(1.7rem, 10vw, 2.35rem);
  }

  .book-selector-list {
    grid-template-columns: 1fr;
  }

  .book-selector strong {
    white-space: normal;
  }

  .related-book {
    grid-template-columns: 68px minmax(0, 1fr);
  }

  .related-book img {
    width: 68px;
    max-height: 100px;
  }

  .book-editorial-grid,
  .book-support-column,
  .related-books-grid,
  .book-nav {
    grid-template-columns: 1fr;
  }

  .book-content-card,
  .book-content-card-wide {
    grid-column: 1 / -1;
  }

  .related-book {
    grid-template-columns: 92px minmax(0, 1fr);
    padding: 14px;
  }

  .related-book-cover {
    min-height: 142px;
  }

  .related-book-cover img {
    width: 78px;
    max-height: 124px;
  }

  .author-card-inner,
  .book-nav-card {
    grid-template-columns: 1fr;
  }

  .books-record-badge-shell {
    grid-template-columns: 1fr;
  }

  .books-record-laurel {
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
    const dialog = lightbox.querySelector(".gallery-lightbox-inner");
    let lastTrigger = null;

    function focusableElements() {
      return Array.from(lightbox.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
        .filter(function (node) {
          return !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true";
        });
    }

    function close() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    }

    document.querySelectorAll("[data-lightbox-src]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (!image) return;
        lastTrigger = button;
        image.src = button.getAttribute("data-lightbox-src");
        image.alt = button.getAttribute("data-lightbox-alt") || "";
        if (dialog) {
          dialog.setAttribute("aria-label", button.getAttribute("data-lightbox-label") || "Image preview");
        }
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
        if (closeButton) {
          closeButton.focus();
        }
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
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "Tab") {
        const nodes = focusableElements();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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
    const dataNode = hub.querySelector("[data-blog-posts]");
    const grid = hub.querySelector("[data-blog-grid]");
    const clearButtons = Array.from(hub.querySelectorAll("[data-blog-clear]"));
    const searchClearButton = hub.querySelector("[data-blog-search-clear]");
    const tagToggleButton = hub.querySelector("[data-blog-tag-toggle]");
    const extraTags = hub.querySelector("[data-blog-extra-tags]");
    const count = hub.querySelector("[data-blog-count]");
    const total = hub.querySelector("[data-blog-total]");
    const empty = hub.querySelector("[data-blog-empty]");
    const posts = dataNode ? JSON.parse(dataNode.textContent || "[]") : [];
    const params = new URLSearchParams(window.location.search);
    let activeCategory = "All";
    let activeTag = "";

    if (params.get("category")) activeCategory = params.get("category");
    if (params.get("tag")) activeTag = params.get("tag");
    if (search && params.get("search")) search.value = params.get("search");

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
      return escapeHtml(value);
    }

    function fallbackLabel(title) {
      return String(title || "Insight")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) { return part.charAt(0); })
        .join("")
        .toUpperCase() || "IN";
    }

    function renderPostImage(post) {
      if (!post.image) {
        return '<div class="blog-card-media fallback-thumb" role="img" aria-label="' + escapeAttr(post.imageAlt) + '"><span>' + escapeHtml(fallbackLabel(post.title)) + "</span></div>";
      }
      return '<img class="blog-card-media" src="' + escapeAttr(post.image) + '" alt="' + escapeAttr(post.imageAlt) + '" loading="lazy" decoding="async" data-fallback-thumb data-fallback-label="' + escapeAttr(fallbackLabel(post.title)) + '">';
    }

    function renderTagButtons(post) {
      return (post.tags || []).slice(0, 3).map(function (tag) {
        return '<button class="tag-filter" type="button" data-blog-tag="' + escapeAttr(tag) + '">' + escapeHtml(tag) + "</button>";
      }).join("");
    }

    function renderCard(post) {
      const meta = ['<span class="meta-pill">' + escapeHtml(post.category) + "</span>", '<span class="meta-pill">' + escapeHtml(post.readTime) + "</span>", '<span class="meta-pill">' + escapeHtml(post.date) + "</span>"].join("");
      const tags = (post.tags || []).length ? '<div class="blog-card-tags">' + renderTagButtons(post) + "</div>" : "";
      return [
        '<article class="blog-card" data-blog-card data-blog-result data-category="', escapeAttr(post.category), '" data-tags="', escapeAttr((post.tags || []).join("|")), '" data-search="', escapeAttr(post.searchText || ""), '">',
        renderPostImage(post),
        '<div class="meta-row">', meta, "</div>",
        '<h3><a class="blog-card-title-link" href="', escapeAttr(post.url), '">', escapeHtml(post.title), "</a></h3>",
        "<p>", escapeHtml(post.excerpt), "</p>",
        tags,
        '<div class="button-row"><a class="btn btn-secondary" href="', escapeAttr(post.url), '">Read More</a></div>',
        "</article>"
      ].join("");
    }

    function bindGridImageFallbacks() {
      if (!grid) return;
      grid.querySelectorAll("img[data-fallback-thumb]").forEach(function (image) {
        if (image.dataset.fallbackBound === "true") return;
        image.dataset.fallbackBound = "true";
        image.addEventListener("error", function () {
          if (!image.getAttribute("src")) return;
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

    function getCategoryButtons() {
      return Array.from(hub.querySelectorAll("[data-blog-category]"));
    }

    function getTagButtons() {
      return Array.from(hub.querySelectorAll("[data-blog-tag]"));
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
      getCategoryButtons().forEach(function (button) {
        const isActive = normalize(button.getAttribute("data-blog-category")) === normalize(activeCategory);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      getTagButtons().forEach(function (button) {
        const isActive = normalize(button.getAttribute("data-blog-tag")) === normalize(activeTag);
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function getFilteredPosts() {
      const rawQuery = search ? search.value : "";
      const normalizedQuery = normalize(rawQuery);
      return posts.filter(function (post) {
        const categoryMatches = normalize(activeCategory) === "all" || normalize(post.categoryKey || post.category) === normalize(activeCategory);
        const tagMatches = !activeTag || (post.tagKeys || []).includes(normalize(activeTag));
        const searchMatches = !normalizedQuery || normalize(post.searchText || "").includes(normalizedQuery);
        return categoryMatches && tagMatches && searchMatches;
      });
    }

    function applyFilters() {
      const query = search ? search.value.trim() : "";
      const filteredPosts = getFilteredPosts();
      const isFiltering = normalize(query).length > 0 || normalize(activeCategory) !== "all" || normalize(activeTag).length > 0;
      if (grid) {
        grid.innerHTML = filteredPosts.map(renderCard).join("");
        grid.hidden = filteredPosts.length === 0;
      }
      bindGridImageFallbacks();
      if (count) count.textContent = String(filteredPosts.length);
      if (total) total.textContent = String(posts.length);
      if (empty) empty.hidden = filteredPosts.length !== 0;
      hub.classList.toggle("is-filtering", isFiltering);
      clearButtons.forEach(function (button) {
        button.hidden = !isFiltering;
      });
      if (searchClearButton) {
        const searchActive = normalize(query).length > 0;
        searchClearButton.hidden = !searchActive;
        searchClearButton.disabled = !searchActive;
      }
      syncActiveButtons();
      setUrl(query);
    }

    hub.addEventListener("click", function (event) {
      const categoryButton = event.target.closest("[data-blog-category]");
      if (categoryButton) {
        activeCategory = categoryButton.getAttribute("data-blog-category") || "All";
        applyFilters();
        return;
      }

      const tagButton = event.target.closest("[data-blog-tag]");
      if (tagButton) {
        const tag = tagButton.getAttribute("data-blog-tag") || "";
        activeTag = normalize(activeTag) === normalize(tag) ? "" : tag;
        applyFilters();
        return;
      }

      const clearSearch = event.target.closest("[data-blog-search-clear]");
      if (clearSearch) {
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
        return;
      }

      const clearFilters = event.target.closest("[data-blog-clear]");
      if (clearFilters) {
        activeCategory = "All";
        activeTag = "";
        if (search) search.value = "";
        applyFilters();
        if (search) search.focus();
      }
    });

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (tagToggleButton && extraTags) {
      tagToggleButton.addEventListener("click", function () {
        extraTags.toggleAttribute("hidden");
        const isHidden = extraTags.hasAttribute("hidden");
        tagToggleButton.textContent = isHidden ? "Show more tags" : "Show fewer tags";
        tagToggleButton.setAttribute("aria-expanded", String(!isHidden));
      });
    }

    bindGridImageFallbacks();
    applyFilters();
  }

  function bindImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      if (image.closest("[data-lightbox]")) return;
      image.addEventListener("error", function () {
        if (!image.getAttribute("src")) return;
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

  function bindBooksCarousel() {
    document.querySelectorAll("[data-books-carousel]").forEach(function (carousel) {
      const slidesTrack = carousel.querySelector(".book-slides");
      const slides = Array.from(carousel.querySelectorAll("[data-book-slide]"));
      const selectors = Array.from(carousel.querySelectorAll("[data-book-select]"));
      const previous = carousel.querySelector("[data-book-prev]");
      const next = carousel.querySelector("[data-book-next]");
      const current = carousel.querySelector("[data-book-current]");
      const total = carousel.querySelector("[data-book-total]");
      if (!slides.length) return;

      let activeIndex = 0;
      let timer = 0;
      let pointerInside = false;
      let focusInside = false;
      let touchStartX = 0;
      let touchStartY = 0;

      function syncHeight() {
        if (!slidesTrack) return;
        const activeSlide = slides[activeIndex];
        if (!activeSlide) return;
        window.requestAnimationFrame(function () {
          slidesTrack.style.height = activeSlide.offsetHeight + "px";
        });
      }

      function render(manual) {
        slides.forEach(function (slide, index) {
          const active = index === activeIndex;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", String(!active));
          slide.querySelectorAll("a, button").forEach(function (node) {
            if (active) {
              node.removeAttribute("tabindex");
            } else {
              node.setAttribute("tabindex", "-1");
            }
          });
        });

        selectors.forEach(function (button, index) {
          const active = index === activeIndex;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
          button.setAttribute("tabindex", active ? "0" : "-1");
        });

        if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
        if (total) total.textContent = String(slides.length).padStart(2, "0");
        syncHeight();
        if (manual) restart();
      }

      function goTo(index, manual) {
        activeIndex = (index + slides.length) % slides.length;
        render(Boolean(manual));
      }

      function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = 0;
      }

      function start() {
        stop();
        if (prefersReducedMotion || pointerInside || focusInside || slides.length < 2) return;
        timer = window.setInterval(function () {
          goTo(activeIndex + 1, false);
        }, 7000);
      }

      function restart() {
        stop();
        window.setTimeout(start, 350);
      }

      if (previous) previous.addEventListener("click", function () { goTo(activeIndex - 1, true); });
      if (next) next.addEventListener("click", function () { goTo(activeIndex + 1, true); });

      selectors.forEach(function (button, index) {
        button.addEventListener("click", function () { goTo(index, true); });
        button.addEventListener("keydown", function (event) {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectors[(index + 1) % selectors.length].focus();
            goTo(index + 1, true);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectors[(index - 1 + selectors.length) % selectors.length].focus();
            goTo(index - 1, true);
          }
          if (event.key === "Home") {
            event.preventDefault();
            selectors[0].focus();
            goTo(0, true);
          }
          if (event.key === "End") {
            event.preventDefault();
            selectors[selectors.length - 1].focus();
            goTo(selectors.length - 1, true);
          }
        });
      });

      carousel.addEventListener("keydown", function (event) {
        if (event.target && event.target.hasAttribute && event.target.hasAttribute("data-book-select")) return;
        if (event.key === "ArrowRight") {
          goTo(activeIndex + 1, true);
        }
        if (event.key === "ArrowLeft") {
          goTo(activeIndex - 1, true);
        }
      });

      carousel.addEventListener("pointerenter", function () {
        pointerInside = true;
        stop();
      });
      carousel.addEventListener("pointerleave", function () {
        pointerInside = false;
        start();
      });
      carousel.addEventListener("focusin", function () {
        focusInside = true;
        stop();
      });
      carousel.addEventListener("focusout", function () {
        window.setTimeout(function () {
          focusInside = carousel.contains(document.activeElement);
          if (!focusInside) start();
        }, 0);
      });
      carousel.addEventListener("touchstart", function (event) {
        if (!event.touches || !event.touches.length) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }, { passive: true });
      carousel.addEventListener("touchend", function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        goTo(dx < 0 ? activeIndex + 1 : activeIndex - 1, true);
      }, { passive: true });

      window.addEventListener("resize", syncHeight);
      window.addEventListener("load", syncHeight, { once: true });

      render(false);
      start();
    });
  }

  function bindRecognitionCarousel() {
    document.querySelectorAll("[data-recognition-carousel]").forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll("[data-recognition-slide]"));
      const previous = carousel.querySelector("[data-recognition-prev]");
      const next = carousel.querySelector("[data-recognition-next]");
      const current = carousel.querySelector("[data-recognition-current]");
      const total = carousel.querySelector("[data-recognition-total]");
      const selectors = Array.from(carousel.querySelectorAll("[data-recognition-select]"));
      if (!slides.length) return;

      let activeIndex = 0;
      let timer = 0;
      let pointerInside = false;
      let focusInside = false;

      function render() {
        slides.forEach(function (slide, index) {
          const active = index === activeIndex;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", String(!active));
          slide.querySelectorAll("a, button").forEach(function (node) {
            if (active) {
              node.removeAttribute("tabindex");
            } else {
              node.setAttribute("tabindex", "-1");
            }
          });
        });

        selectors.forEach(function (button, index) {
          const active = index === activeIndex;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
          button.setAttribute("tabindex", active ? "0" : "-1");
        });

        if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
        if (total) total.textContent = String(slides.length).padStart(2, "0");
      }

      function goTo(index, manual) {
        activeIndex = (index + slides.length) % slides.length;
        render();
        if (manual) restart();
      }

      function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = 0;
      }

      function start() {
        stop();
        if (prefersReducedMotion || pointerInside || focusInside || slides.length < 2) return;
        timer = window.setInterval(function () {
          goTo(activeIndex + 1, false);
        }, 5000);
      }

      function restart() {
        stop();
        window.setTimeout(start, 250);
      }

      if (previous) previous.addEventListener("click", function () { goTo(activeIndex - 1, true); });
      if (next) next.addEventListener("click", function () { goTo(activeIndex + 1, true); });

      selectors.forEach(function (button, index) {
        button.addEventListener("click", function () { goTo(index, true); });
        button.addEventListener("keydown", function (event) {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectors[(index + 1) % selectors.length].focus();
            goTo(index + 1, true);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectors[(index - 1 + selectors.length) % selectors.length].focus();
            goTo(index - 1, true);
          }
        });
      });

      carousel.addEventListener("keydown", function (event) {
        if (event.target && event.target.hasAttribute && event.target.hasAttribute("data-recognition-select")) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(activeIndex + 1, true);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(activeIndex - 1, true);
        }
      });

      carousel.addEventListener("pointerenter", function () {
        pointerInside = true;
        stop();
      });
      carousel.addEventListener("pointerleave", function () {
        pointerInside = false;
        start();
      });
      carousel.addEventListener("focusin", function () {
        focusInside = true;
        stop();
      });
      carousel.addEventListener("focusout", function () {
        window.setTimeout(function () {
          focusInside = carousel.contains(document.activeElement);
          if (!focusInside) start();
        }, 0);
      });

      render();
      start();
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
  bindBooksCarousel();
  bindRecognitionCarousel();
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
  books: BOOKS_ROUTE,
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
  [routes.shop]: bookRoute(books[1]),
  [routes.shopAlias]: bookRoute(books[1]),
  [routes.shopBookAlias]: bookRoute(books[1])
};

books.forEach((book) => {
  canonicalRouteMap[legacyBookRoute(book)] = bookRoute(book);
  canonicalRouteMap[legacyBookRoute(book).replace(/\/$/, "")] = bookRoute(book);
});

const primaryNav = [
  { label: "Home", route: routes.home },
  { label: "About", route: routes.about },
  { label: "Expertise", route: routes.expertise },
  { label: "Programs", route: routes.programs },
  { label: "WayMaker Skills™", route: routes.waymaker },
  { label: "Blog", route: routes.blog },
  { label: "Books", route: routes.books },
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
  { label: "Books", route: routes.books },
  { label: "Contact", route: routes.contact },
  { label: "Book a Consultation", route: routes.consultation },
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
  },
  {
    file: "diversity-equity-inclusion-building-inclusive-teams.jpeg",
    category: "Corporate Training",
    title: "Corporate Training event",
    caption: "Diversity, equity, and inclusion through team connection, empathy, and practical action."
  },
  {
    file: "executive-leadership-presence-storytelling-influence-beyond-authority.jpeg",
    category: "Corporate Training",
    title: "Corporate training event",
    caption: "Executive leadership development through presence, storytelling, and influence beyond authority."
  },
  {
    file: "team-alignement-workshop-collaboartive-lab-experience.png",
    category: "Corporate Training",
    title: "Corporate training event",
    caption: "Team alignment and culture-building through a collaborative lab experience focused on communication, connection, and clarity."
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
    id: "educator-excellence",
    title: "Educator Excellence Pathway",
    description: "A professional growth pathway for teaching excellence, student engagement, classroom leadership, and reflective educator development.",
    bestFor: "Educators, teachers, school leaders, academic teams",
    outcomes: "Teaching excellence, student engagement, classroom leadership, professional growth",
    detailHref: "/programs/educator-excellence-pathway/"
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
    id: "future-ready-leadership-academy",
    title: "Future-Ready Leadership Program",
    description: "A transformational leadership development journey focused on self-leadership, influence, communication, decision-making, and purposeful impact.",
    bestFor: "Emerging leaders, educators, managers, entrepreneurs, team leads",
    outcomes: "Leadership, Influence, Communication, Strategic Thinking",
    detailHref: "/programs/future-ready-leadership-program/"
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
    image: "/assets/imgs/blog.png",
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
routeToLabel[routes.books] = "Books";
books.forEach((book) => {
  routeToLabel[bookRoute(book)] = book.title;
  routeToLabel[legacyBookRoute(book)] = book.shortTitle;
});
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
      { label: "Books & Publications", href: routes.books },
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

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function normalizePublicBasePath(basePath) {
  const clean = String(basePath || "").trim();
  if (!clean || clean === "/") return "";
  return `/${clean.replace(/^\/+|\/+$/g, "")}`;
}

function fullUrl(route) {
  return route.startsWith("http") ? route : `${BASE_URL}${canonicalRoute(route)}`;
}

function stripPublicBasePath(pathname) {
  if (!PUBLIC_BASE_PATH || pathname === PUBLIC_BASE_PATH) return pathname === PUBLIC_BASE_PATH ? "/" : pathname;
  return pathname.startsWith(`${PUBLIC_BASE_PATH}/`)
    ? pathname.slice(PUBLIC_BASE_PATH.length)
    : pathname;
}

function canonicalRoute(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }

  const [pathname, hash = ""] = href.split("#");
  const baseStrippedPathname = stripPublicBasePath(pathname);
  const normalized = canonicalRouteMap[baseStrippedPathname] || baseStrippedPathname;
  return hash ? `${normalized}#${hash}` : normalized;
}

function publicHref(href) {
  if (href && href.startsWith("#")) return href;
  const canonical = canonicalRoute(href);
  if (!canonical || !canonical.startsWith("/")) return canonical;
  return `${PUBLIC_BASE_PATH}${canonical}`;
}

function routeHref(href) {
  return publicHref(href);
}

function canonicalizeMarkup(html) {
  return html
    .replace(/href="([^"]+)"/g, (_match, href) => `href="${publicHref(href)}"`)
    .replace(/src="([^"]+)"/g, (_match, src) => `src="${publicHref(src)}"`);
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

function escapeXml(value) {
  return escapeAttr(value).replace(/'/g, "&apos;");
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
  return escapeAttr(blogSearchText(post));
}

function blogTagsAttr(post) {
  return escapeAttr(post.tags.map((tag) => tag.toLowerCase()).join("|"));
}

function normalizeBlogValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function blogSearchText(post) {
  return normalizeBlogValue([
    post.title,
    post.excerpt,
    post.intro,
    post.category,
    post.tags.join(" "),
    post.author,
    stripHtml(post.content)
  ].join(" "));
}

function blogUrl(post) {
  return `${routes.blog}${post.slug}/`;
}

function blogClientPayload(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    categoryKey: normalizeBlogValue(post.category),
    tags: post.tags,
    tagKeys: post.tags.map((tag) => normalizeBlogValue(tag)),
    readTime: post.readTime,
    date: post.date,
    image: post.image,
    imageAlt: post.imageAlt,
    url: blogUrl(post),
    searchText: blogSearchText(post)
  };
}

function safeJsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
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
  const detailUrl = blogUrl(post);
  return `
    <article class="blog-card${featured ? " blog-card-featured" : ""}${reveal ? " reveal" : ""}" data-blog-card${result ? " data-blog-result" : ""} data-category="${escapeAttr(post.category)}" data-tags="${blogTagsAttr(post)}" data-search="${blogFilterText(post)}">
      ${renderPostImage(post)}
      ${metaPills(featured ? ["Featured Article", post.category, post.readTime, post.date] : [post.category, post.readTime, post.date])}
      <h3><a class="blog-card-title-link" href="${detailUrl}">${post.title}</a></h3>
      <p>${post.excerpt}</p>
      ${post.tags.length ? `<div class="blog-card-tags">${renderTagButtons(post, 3)}</div>` : ""}
      <div class="button-row">
        <a class="btn ${featured ? "btn-primary" : "btn-secondary"}" href="${detailUrl}">${cta}</a>
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

function renderWaymakerLogoPanel({ className = "", loading = "lazy", maxWidth = "" } = {}) {
  const classes = ["waymaker-logo-panel", className].filter(Boolean).join(" ");
  const style = maxWidth ? ` style="--waymaker-logo-max-width:${maxWidth}"` : "";
  return `
    <div class="${classes}"${style}>
      <img src="/assets/imgs/waymaker-logo.jpeg" alt="WayMaker Skills™ — Redefining Paths. Empowering Growth." loading="${loading}" decoding="async" width="1268" height="1241">
    </div>
  `;
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
      const active = [routes.resume, routes.gallery, routes.contact].includes(normalizeRoute(page.route)) ? "active" : "";
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
    <a class="${isSectionActive(page, routes.books) ? "active" : ""}" href="${routes.books}"${ariaCurrent(page, routes.books)}>Books</a>
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
  if (route === routes.books) {
    return normalizeRoute(page.route).startsWith(routes.books);
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
          <a class="site-brand" href="${routes.home}" aria-label="Sanjo Cine Mathew - Home">
            <img class="site-brand__logo" src="/assets/imgs/sanjo-logo.png" alt="" width="454" height="682" decoding="async" aria-hidden="true">
            <span class="site-brand__text">Sanjo Cine Mathew</span>
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
              <h2>For Schools, Organizations, and Institutional programs, explore WayMaker Skills™.</h2>
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
  const mediaClass = hero.media?.image === "/assets/imgs/sanjo-logo.png" ? " hero-media is-logo-media" : " hero-media";
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
              ${hero.supportingCopy ? `<p class="hero-supporting">${hero.supportingCopy}</p>` : ""}
              ${hero.supportingMeta ? `<p class="hero-supporting-meta">${hero.supportingMeta}</p>` : ""}
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
                <div class="${mediaClass.trim()}">
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
    "educator-excellence": { icon: "people", badge: "Educator / growth" },
    "corporate-excellence": { icon: "leadership", badge: "Leadership / teams" },
    "future-ready-leadership-academy": { icon: "leadership", badge: "Leadership / impact" },
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
  const personId = `${BASE_URL}${routes.about}#dr-sanjo-cine-mathew`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: "Dr. Sanjo Cine Mathew",
    alternateName: "Sanjo Cine Mathew",
    url: fullUrl(routes.about),
    image: `${BASE_URL}/assets/imgs/sanjo-logo.png`,
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
      "@id": `${BASE_URL}${routes.about}#dr-sanjo-cine-mathew`
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
      "@id": `${BASE_URL}${routes.about}#dr-sanjo-cine-mathew`
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
    image: `${BASE_URL}${post.image || "/assets/imgs/blog.png"}`,
    url: fullUrl(`${routes.blog}${post.slug}/`),
    datePublished: post.date,
    keywords: post.tags,
    author: {
      "@id": `${BASE_URL}${routes.about}#dr-sanjo-cine-mathew`
    },
    publisher: {
      "@id": `${BASE_URL}/#website`
    }
  };
}

function bookSchema(book) {
  const bookUrl = fullUrl(bookRoute(book));
  const authorId = `${BASE_URL}${routes.about}#dr-sanjo-cine-mathew`;
  const schema = {
    "@type": "Book",
    "@id": `${bookUrl}#book`,
    name: book.title,
    headline: book.title,
    url: bookUrl,
    mainEntityOfPage: {
      "@id": `${bookUrl}#webpage`
    },
    description: book.structuredDataDescription || book.seoDescription,
    image: `${BASE_URL}${book.coverImage}`,
    author: {
      "@id": authorId
    },
    about: [book.primaryTopic, ...book.secondaryTopics],
    genre: book.category,
    inLanguage: "en-IN"
  };
  if (book.format === "Kindle Edition") {
    schema.bookFormat = "https://schema.org/EBook";
  }
  if (book.seriesName) {
    schema.isPartOf = {
      "@type": "CreativeWorkSeries",
      "@id": `${BASE_URL}${routes.books}#intentional-life-blueprint-series`,
      name: book.seriesName,
      url: fullUrl(routes.books)
    };
    schema.position = book.seriesPosition;
  }
  return schema;
}

function webpageSchema(page) {
  const pageUrl = fullUrl(page.route);
  const schema = {
    "@type": page.collectionPage ? "CollectionPage" : "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    isPartOf: {
      "@id": `${BASE_URL}/#website`
    },
    inLanguage: "en-IN"
  };
  if (page.book) {
    schema.mainEntity = {
      "@id": `${pageUrl}#book`
    };
    schema.about = {
      "@id": `${pageUrl}#book`
    };
  }
  if (page.route === routes.books) {
    schema.mainEntity = {
      "@id": `${pageUrl}#book-list`
    };
    schema.about = ["Books by Dr. Sanjo Cine Mathew", "Intentional living", "Psychology", "Transformational fiction"];
  }
  return schema;
}

function booksItemListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${fullUrl(routes.books)}#book-list`,
    name: "Books by Dr. Sanjo Cine Mathew",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: fullUrl(bookRoute(book)),
      item: {
        "@id": `${fullUrl(bookRoute(book))}#book`,
        name: book.title
      }
    }))
  };
}

function renderSchemas(page) {
  const graph = [websiteSchema(), personSchema()];
  graph.push(webpageSchema(page));
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
  if (page.book) {
    graph.push(bookSchema(page.book));
  }
  if (page.route === routes.books) {
    graph.push(booksItemListSchema());
    books.forEach((book) => graph.push(bookSchema(book)));
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function renderPage(page) {
  const title = page.socialTitle || page.title;
  const documentTitle = page.title;
  const description = page.socialDescription || page.description;
  const canonical = fullUrl(page.route);
  const bodyClass = page.bodyClass ? ` class="${page.bodyClass}"` : "";
  const ogImage = page.ogImage ? `${BASE_URL}${page.ogImage}` : `${BASE_URL}/assets/imgs/sanjo-logo.png`;
  const ogType = page.ogType || (page.article ? "article" : "website");
  const twitterCard = page.twitterCard || (page.book ? "summary" : "summary_large_image");
  const content = canonicalizeMarkup(page.content);

  return canonicalizeMarkup(`<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${documentTitle}</title>
  <meta name="description" content="${page.description}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="Jijish Thomas">
  <meta name="theme-color" content="#1d4f91">
  <link rel="canonical" href="${canonical}">
  <meta property="og:locale" content="en_IN">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Sanjo Cine Mathew">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="${page.ogAlt || "Sanjo Cine Mathew"}">
  <meta name="twitter:card" content="${twitterCard}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="${page.ogAlt || "Sanjo Cine Mathew"}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${publicHref("/assets/css/site.css")}">
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
  ${renderSharedLightbox()}
  <script src="${publicHref("/assets/js/site.js")}"></script>
</body>
</html>`);
}

function page(route, data) {
  return {
    route,
    breadcrumbs: route === "/" ? null : [{ label: "Home", route: "/" }, ...(data.breadcrumbs || [{ label: routeToLabel[route] || data.title.replace(/ \|.*/, ""), route }])],
    ...data
  };
}

function getBook(slug) {
  return books.find((book) => book.slug === slug);
}

function bookSeriesLabel(book) {
  return book.seriesPosition ? `Book ${book.seriesPosition} of 3` : book.category;
}

function publicAssetExists(assetPath) {
  if (!assetPath) return false;
  if (/^https?:\/\//i.test(assetPath)) return true;
  return existsSync(path.join(ROOT, assetPath.replace(/^\//, "")));
}

function getBooksPortrait() {
  return publicAssetExists(BOOKS_PORTRAIT.image) ? BOOKS_PORTRAIT : null;
}

function getBooksCertificates() {
  return BOOKS_RECOGNITION.certificates.map((item) => ({
    ...item,
    isAvailable: publicAssetExists(item.image)
  }));
}

function renderBookCover(book, className = "book-card-cover", loading = "lazy") {
  return `
    <div class="${className}">
      <img src="${book.coverImage}" alt="${escapeAttr(book.coverAlt)}" loading="${loading}" decoding="async" width="420" height="640">
    </div>
  `;
}

function renderBooksCarousel() {
  return `
    <section class="section section-ornate" aria-labelledby="books-carousel-title">
      <div class="container">
        <div class="books-carousel-shell reveal" data-books-carousel>
          <div class="books-carousel-head">
            <p class="eyebrow">Books by Dr. Sanjo Cine Mathew</p>
            <h2 id="books-carousel-title">Stories and blueprints for intentional living.</h2>
            <p>Explore transformational fiction and the Intentional Life Blueprint series in the order designed for the reader's journey.</p>
          </div>
          <div class="books-carousel" tabindex="0" aria-roledescription="carousel" aria-label="Books by Dr. Sanjo Cine Mathew">
            <div class="book-slides">
              ${books.map((book, index) => `
                <article class="book-slide${index === 0 ? " active" : ""}" data-book-slide aria-label="${index + 1} of ${books.length}: ${escapeAttr(book.title)}"${index === 0 ? "" : ' aria-hidden="true"'}>
                  <div class="book-slide-copy">
                    <span class="book-slide-kicker">${book.eyebrow}</span>
                    <h3>${book.title}</h3>
                    <p class="book-slide-summary">${book.homepageSummary}</p>
                    <p class="book-slide-author">by <a href="${book.authorPath}">${book.authorName}</a></p>
                    <div class="outcome-chips">
                      ${book.themes.slice(0, 3).map((theme) => `<span>${theme}</span>`).join("")}
                    </div>
                    <div class="button-row">
                      ${anchor(bookRoute(book), "Explore Book", "btn btn-soft")}
                      ${anchor(routes.books, "View All Books", "btn btn-secondary")}
                    </div>
                  </div>
                  <div class="book-slide-cover">
                    ${book.seriesPosition ? `<span class="book-series-badge">${bookSeriesLabel(book)}</span>` : ""}
                    <img src="${book.coverImage}" alt="${escapeAttr(book.coverAlt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" width="420" height="640">
                  </div>
                </article>
              `).join("")}
            </div>
            <div class="books-carousel-controls" aria-label="Book carousel controls">
              <button class="book-arrow" type="button" data-book-prev aria-label="Show previous book">←</button>
              <div class="book-carousel-count" aria-hidden="true"><span data-book-current>01</span> / <span data-book-total>04</span></div>
              <button class="book-arrow" type="button" data-book-next aria-label="Show next book">→</button>
              <div class="book-selector-list" role="tablist" aria-label="Choose a book">
                ${books.map((book, index) => `
                  <button class="book-selector${index === 0 ? " active" : ""}" type="button" role="tab" data-book-select aria-selected="${index === 0 ? "true" : "false"}" aria-label="Show ${escapeAttr(book.title)}" tabindex="${index === 0 ? "0" : "-1"}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <strong>${book.shortTitle}</strong>
                  </button>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBookCard(book) {
  return `
    <article class="card book-card reveal">
      ${renderBookCover(book)}
      <span class="book-card-kicker">${bookSeriesLabel(book)}</span>
      <h3>${book.title}</h3>
      <p>${book.homepageSummary}</p>
      <div class="button-row">${anchor(bookRoute(book), "Explore Book", "btn btn-secondary")}</div>
    </article>
  `;
}

function renderBooksHeroBook(book, index) {
  const heroLabel = book.seriesPosition ? `Intentional Life Blueprint &middot; Book ${book.seriesPosition}` : book.category;
  const subtitle = book.subtitle ? `<span class="books-hero-book-subtitle">${book.subtitle}</span>` : "";
  return `
    <article class="books-hero-book reveal">
      <a class="books-hero-book-link" href="${bookRoute(book)}" aria-label="Explore ${escapeAttr(book.title)}">
        <span class="books-hero-book-badge">${String(index + 1).padStart(2, "0")}</span>
        <span class="books-hero-book-kicker">${heroLabel}</span>
        <span class="books-hero-book-media">
          <img src="${book.coverImage}" alt="${escapeAttr(book.coverAlt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" width="420" height="640">
        </span>
        <span class="books-hero-book-title">${book.shortTitle}</span>
        ${subtitle}
        <span class="books-hero-book-action">Explore Book</span>
      </a>
    </article>
  `;
}

function renderAuthorCredentials() {
  return `
    <ul class="books-author-credentials" aria-label="Author credentials">
      ${BOOK_AUTHOR_CREDENTIALS.map((item) => `
        <li class="books-author-credential">
          <span class="books-author-credential-icon">${iconSvg(item.icon)}</span>
          <span class="books-author-credential-copy">
            <strong>${item.label}</strong>
            <span>${item.supportingLabel}</span>
          </span>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderBooksPortrait() {
  const portrait = getBooksPortrait();
  if (portrait) {
    return `
      <div class="books-author-portrait-shell">
        <img src="${portrait.image}" alt="${escapeAttr(portrait.alt)}" loading="eager" decoding="async" width="540" height="640">
      </div>
    `;
  }

  return `
    <div class="books-author-portrait-shell">
      <div class="books-author-portrait-placeholder">
        <span class="books-author-portrait-placeholder-icon" aria-hidden="true">${iconSvg("people")}</span>
        <strong>Official portrait</strong>
        <span>Photo coming soon</span>
      </div>
    </div>
  `;
}

function renderCertificateCard(item) {
  const imageMarkup = item.isAvailable
    ? `<img src="${item.image}" alt="${escapeAttr(item.alt)}" loading="lazy" decoding="async" width="1200" height="850">`
    : `<div class="books-certificate-placeholder" aria-hidden="true">${iconSvg("leadership")}<span>Certificate image placeholder</span></div>`;
  const actionAttrs = item.isAvailable
    ? ` type="button" data-lightbox-src="${item.image}" data-lightbox-alt="${escapeAttr(item.alt)}" data-lightbox-label="${escapeAttr(`${item.title} preview`)}"`
    : ` type="button" disabled aria-disabled="true"`;
  const actionLabel = item.isAvailable ? "View certificate" : "Image pending";
  const cardDescription = item.isAvailable
    ? item.title
    : `${item.title} placeholder until the certificate image is supplied`;

  return `
    <article class="books-certificate-card">
      <div class="books-certificate-frame">
        ${imageMarkup}
      </div>
      <div class="books-certificate-caption">
        <span class="books-certificate-label">${item.label}</span>
        <h3>${item.title}</h3>
        <p>${cardDescription}</p>
        <button class="books-certificate-action" ${actionAttrs}>${actionLabel}</button>
      </div>
    </article>
  `;
}

function renderBooksCertificates(certificates) {
  return `
    <section class="section books-recognition-section" id="record-achievements" aria-labelledby="record-achievements-title">
      <div class="container">
        <div class="books-certificates reveal">
          <div class="books-certificates-header">
            <p class="eyebrow">${BOOKS_RECOGNITION.eyebrow}</p>
            <h2 id="record-achievements-title">${BOOKS_RECOGNITION.heading}</h2>
            <p>${BOOKS_RECOGNITION.description}</p>
          </div>
          <div class="books-certificates-grid">
            ${certificates.map(renderCertificateCard).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderRecognitionSection({
  eyebrow,
  heading,
  description,
  facts,
  ctaLabel,
  ctaHref,
  className = "",
  compact = false,
  previewCertificate = null,
  carousel = false
}) {
  const certificate = previewCertificate && previewCertificate.isAvailable ? previewCertificate : null;
  const certificates = getBooksCertificates().filter((item) => item.isAvailable);
  return `
    <section class="section ${className}">
      <div class="container">
        <div class="recognition-panel${compact ? " recognition-panel-compact" : ""} reveal">
          <div class="recognition-panel-copy">
            <p class="eyebrow">${eyebrow}</p>
            <h2>${heading}</h2>
            <p>${description}</p>
            <ul class="recognition-facts" aria-label="Recognition highlights">
              ${facts.map((fact) => `<li>${fact}</li>`).join("")}
            </ul>
            <div class="button-row">${anchor(ctaHref, ctaLabel, "btn btn-primary")}</div>
          </div>
          <div class="recognition-panel-visual">
            ${carousel && certificates.length ? `
              <div class="recognition-carousel" data-recognition-carousel tabindex="0" aria-roledescription="carousel" aria-label="Recognition certificates">
                <div class="recognition-carousel-slides">
                  ${certificates.map((item, index) => `
                    <article class="recognition-carousel-slide${index === 0 ? " active" : ""}" data-recognition-slide aria-hidden="${index === 0 ? "false" : "true"}">
                      <button class="recognition-preview-card" type="button" data-lightbox-src="${item.image}" data-lightbox-alt="${escapeAttr(item.alt)}" data-lightbox-label="${escapeAttr(`${item.title} preview`)}">
                        <span class="recognition-preview-kicker">${item.label}</span>
                        <div class="recognition-preview-frame">
                          <img src="${item.image}" alt="${escapeAttr(item.alt)}" loading="lazy" decoding="async" width="1200" height="850">
                        </div>
                        <span class="recognition-preview-title">${item.title}</span>
                      </button>
                    </article>
                  `).join("")}
                </div>
                <div class="recognition-carousel-controls" aria-label="Recognition certificate controls">
                  <button class="book-arrow" type="button" data-recognition-prev aria-label="Show previous certificate">←</button>
                  <div class="recognition-carousel-selectors" role="tablist" aria-label="Choose a certificate">
                    ${certificates.map((item, index) => `
                      <button class="recognition-carousel-selector${index === 0 ? " active" : ""}" type="button" role="tab" data-recognition-select aria-selected="${index === 0 ? "true" : "false"}" aria-label="Show ${escapeAttr(item.label)}" tabindex="${index === 0 ? "0" : "-1"}"></button>
                    `).join("")}
                  </div>
                  <div class="book-carousel-count" aria-hidden="true"><span data-recognition-current>01</span> / <span data-recognition-total>${String(certificates.length).padStart(2, "0")}</span></div>
                  <button class="book-arrow" type="button" data-recognition-next aria-label="Show next certificate">→</button>
                </div>
              </div>
            ` : certificate ? `
              <button class="recognition-preview-card" type="button" data-lightbox-src="${certificate.image}" data-lightbox-alt="${escapeAttr(certificate.alt)}" data-lightbox-label="${escapeAttr(`${certificate.title} preview`)}">
                <span class="recognition-preview-kicker">${certificate.label}</span>
                <div class="recognition-preview-frame">
                  <img src="${certificate.image}" alt="${escapeAttr(certificate.alt)}" loading="lazy" decoding="async" width="1200" height="850">
                </div>
                <span class="recognition-preview-title">${certificate.title}</span>
              </button>
            ` : `
              <div class="recognition-preview-placeholder" aria-hidden="true">
                ${iconSvg("leadership")}
                <strong>${BOOK_TITLES.length} published books</strong>
                <span>Recognition and certificate preview</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSharedLightbox() {
  return `
    <div class="gallery-lightbox" data-lightbox aria-hidden="true">
      <div class="gallery-lightbox-inner" role="dialog" aria-modal="true" aria-label="Image preview">
        <button class="gallery-close" type="button" aria-label="Close image preview" data-lightbox-close>&times;</button>
        <img src="" alt="">
      </div>
    </div>
  `;
}

function renderBooksReaderPathway(trilogy) {
  return `
    <section class="section tight books-reader-section">
      <div class="container">
        <div class="books-reader-shell">
          ${sectionHeader({
            eyebrow: "Reader pathway",
            title: "Choose your reading pathway.",
            copy: "Begin with transformational fiction or move through the trilogy built around intentional living, intentional thinking, and intentional being."
          })}
          <div class="books-reader-grid">
            <article class="books-reader-card reveal">
              <span class="books-reader-card-kicker">Transformational Fiction</span>
              <h3>${books[0].title}</h3>
              <p>Begin with The WayMaker Woman, a story of identity, courage, responsibility, and intentional choice.</p>
              <div class="button-row">${anchor(bookRoute(books[0]), "Start with The WayMaker Woman", "btn btn-primary")}</div>
            </article>
            <article class="books-reader-card reveal">
              <span class="books-reader-card-kicker">${INTENTIONAL_SERIES}</span>
              <h3>Move through the blueprint trilogy.</h3>
              <p>Continue through intentional living, intentional thinking, and intentional being across the three-book series.</p>
              <div class="books-reader-steps">
                ${trilogy.map((book) => `
                  <a class="trilogy-step" href="${bookRoute(book)}">
                    <strong>${book.shortTitle}</strong>
                    <span>${book.subtitle.replace("The Blueprint for ", "")}</span>
                  </a>
                `).join("")}
              </div>
              <div class="button-row">${anchor(bookRoute(trilogy[0]), "Explore the Blueprint Series", "btn btn-secondary")}</div>
            </article>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBooksIndexContent() {
  const trilogy = books.filter((book) => book.seriesName);
  const certificates = getBooksCertificates();
  const aboutAction = anchor(routes.about, "Learn About Dr. Sanjo Cine Mathew", "btn btn-secondary");
  const collectionAction = `<a class="btn btn-primary" href="#book-collection">Explore All Books</a>`;
  const recordsAction = `<a class="btn btn-soft" href="#record-achievements">View Recognition</a>`;
  return [
    `
    <section class="books-breadcrumb-row">
      <div class="container">
        ${renderBreadcrumbs({ route: routes.books, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Books", route: routes.books }] })}
      </div>
    </section>
    `,
    `
    <section class="section books-showcase-section" aria-labelledby="books-hero-title">
      <div class="container">
        <div class="books-showcase reveal">
          <div class="books-showcase-top">
            <figure class="books-author-portrait">
              ${renderBooksPortrait()}
            </figure>
            <div class="books-author-copy">
              <p class="eyebrow books-showcase-eyebrow">Author &bull; Mentor &bull; Intentional Living Advocate</p>
              <h1 id="books-hero-title" class="books-showcase-title">
                <span>Books by</span>
                <strong>Dr. Sanjo Cine Mathew</strong>
              </h1>
              <p class="books-showcase-summary">Four books. One purpose - to inspire intentional living.</p>
              <p class="books-showcase-copy">Transformational fiction and psychology-informed books exploring resilience, clarity, conscious thinking, and inner harmony.</p>
              ${renderAuthorCredentials()}
              <div class="hero-actions">
                ${collectionAction}
                ${aboutAction}
                ${recordsAction}
              </div>
            </div>
            <aside class="books-record-badge" aria-label="Verified recognition for Dr. Sanjo Cine Mathew">
              <div class="books-record-badge-shell">
                <span class="books-record-laurel books-record-laurel-left" aria-hidden="true"></span>
                <div class="books-record-badge-copy">
                  <span class="books-record-badge-kicker">Verified recognition</span>
                  <strong>Asia Book of Records</strong>
                  <span>Awardee</span>
                </div>
                <span class="books-record-laurel books-record-laurel-right" aria-hidden="true"></span>
              </div>
            </aside>
          </div>
          <div class="books-hero-books" aria-label="Featured books by Dr. Sanjo Cine Mathew">
            ${books.map(renderBooksHeroBook).join("")}
          </div>
          <div class="books-purpose-strip reveal">
            <p>Four books. A journey through resilience, clarity, harmony, and intentional living.</p>
          </div>
        </div>
      </div>
    </section>
    `,
    renderBooksCertificates(certificates),
    `
    <section class="section books-collection-section" id="book-collection">
      <div class="container">
        ${sectionHeader({
          eyebrow: "All Books",
          title: "Explore the complete book collection.",
          copy: "Presented in the intended reading order, beginning with The WayMaker Woman and continuing through the blueprint trilogy."
        })}
        <div class="books-grid">
          ${books.map(renderBookCard).join("")}
        </div>
      </div>
    </section>
    `,
    renderBooksReaderPathway(trilogy)
  ].join("");
}

function renderBookListSection(title, items) {
  if (!items || !items.length) return "";
  return `
    <section class="book-section">
      <h2>${title}</h2>
      ${list(items)}
    </section>
  `;
}

﻿function renderPurchasePanel(book) {
  if (!book.purchaseLinks.length) return "";
  const purchaseLink = (link) => {
    const className = link.label.includes("Amazon") ? "btn btn-primary" : "btn btn-secondary";
    return `<a class="${className}" href="${link.url}" target="_blank" rel="noopener noreferrer sponsored" aria-label="${escapeAttr(`${link.label} - opens in a new tab`)}">${link.label} <span aria-hidden="true">↗</span></a>`;
  };
  return `
    <aside class="book-purchase-panel" aria-labelledby="purchase-${book.slug}">
      <h2 id="purchase-${book.slug}">Get Your Copy</h2>
      <p class="muted">Choose a verified marketplace to explore the available edition.</p>
      <div class="button-row">${book.purchaseLinks.map(purchaseLink).join("")}</div>
    </aside>
  `;
}

function renderAuthorCard(book) {
  return `
    <article class="book-support-card author-card">
      <h2>About the Author</h2>
      <div class="author-card-inner">
        <img src="/assets/imgs/sanjo-logo.png" alt="Dr. Sanjo Cine Mathew" loading="lazy" decoding="async" width="120" height="120">
        <div>
          <h3>${book.authorName}</h3>
          <p>Dr. Sanjo Cine Mathew writes and teaches at the intersection of counselling psychology, life skills, human development, and intentional transformation.</p>
          ${anchor(book.authorPath, "Learn more about Dr. Sanjo Cine Mathew", "btn btn-secondary")}
        </div>
      </div>
    </article>
  `;
}

function renderSupportColumn(book) {
  const seriesCard = book.seriesName ? `
    <article class="book-support-card">
      <span class="book-card-kicker">${bookSeriesLabel(book)}</span>
      <h2>${book.seriesName}</h2>
      <p class="muted">A three-book movement through resilience, clarity, and harmony.</p>
    </article>
  ` : `
    <article class="book-support-card">
      <span class="book-card-kicker">${book.category}</span>
      <h2>${book.primaryTopic}</h2>
      <p class="muted">A reflective story about identity, responsibility, courage, and intentional choice.</p>
    </article>
  `;

  return `
    <aside class="book-support-column">
      ${renderPurchasePanel(book)}
      <article class="book-support-card quote-card">
        <h2>${book.tagline ? "Guiding Line" : "Reflection"}</h2>
        <blockquote>${book.tagline || book.reflectionPrompts[0] || book.shortTitle}</blockquote>
      </article>
      ${seriesCard}
      <article class="book-support-card">
        <h2>Core Topics</h2>
        <div class="outcome-chips">${[book.primaryTopic, ...book.secondaryTopics.slice(0, 5)].map((item) => `<span>${item}</span>`).join("")}</div>
      </article>
      ${renderAuthorCard(book)}
    </aside>
  `;
}

function renderRelatedBooks(book) {
  const related = book.relatedBookSlugs.map(getBook).filter(Boolean);
  return `
    <section class="section book-related-section">
      <div class="container">
        ${sectionHeader({
          eyebrow: "Related Books",
          title: "Continue exploring.",
          copy: "Related books are shown in the intended collection order without repeating the current book."
        })}
        <div class="related-books-grid">
          ${related.map((item) => `
            <article class="related-book reveal">
              <a class="related-book-cover" href="${bookRoute(item)}" aria-label="Explore ${escapeAttr(item.title)}">
                <img src="${item.coverImage}" alt="${escapeAttr(item.coverAlt)}" loading="lazy" decoding="async" width="160" height="240">
              </a>
              <div class="related-book-body">
                <span class="book-card-kicker">${bookSeriesLabel(item)}</span>
                <h3><a href="${bookRoute(item)}">${item.title}</a></h3>
                <p>${item.homepageSummary}</p>
                ${anchor(bookRoute(item), `Explore ${item.shortTitle}`, "btn btn-secondary")}
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderBookNav(book) {
  const index = books.findIndex((item) => item.slug === book.slug);
  const previous = index > 0 ? books[index - 1] : null;
  const next = index >= 0 && index < books.length - 1 ? books[index + 1] : null;
  return `
    <nav class="book-nav" aria-label="Previous and next books">
      ${previous ? `
        <a class="book-nav-card" href="${bookRoute(previous)}">
          <img src="${previous.coverImage}" alt="" loading="lazy" decoding="async" width="64" height="96">
          <span><small>Previous Book</small><strong>${previous.title}</strong></span>
          <b aria-hidden="true">←</b>
        </a>
      ` : ""}
      ${next ? `
        <a class="book-nav-card" href="${bookRoute(next)}">
          <img src="${next.coverImage}" alt="" loading="lazy" decoding="async" width="64" height="96">
          <span><small>Next Book</small><strong>${next.title}</strong></span>
          <b aria-hidden="true">→</b>
        </a>
      ` : ""}
    </nav>
  `;
}

function renderBookDetailContent(book) {
  return [
    renderHero({
      className: "book-detail-hero",
      eyebrow: book.eyebrow,
      title: book.title,
      copy: book.homepageSummary,
      actions: [anchor(routes.books, "View all books by Dr. Sanjo Cine Mathew", "btn btn-secondary")],
      media: { html: renderBookCover(book, "book-detail-cover", "eager") },
      panelTitle: `by <a href="${book.authorPath}">${book.authorName}</a>`,
      panelCopy: book.tagline || book.category,
      panelMeta: [bookSeriesLabel(book), ...(book.format ? [book.format] : [])]
    }, renderBreadcrumbs({ route: bookRoute(book), breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Books", route: routes.books }, { label: book.shortTitle, route: bookRoute(book) }] })),
    `
    <section class="section book-detail-main">
      <div class="container book-detail-layout">
        <div class="book-editorial-grid reveal">
          <article class="book-content-card book-content-card-wide">
            <h2>About the Book</h2>
            ${book.fullDescription.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          </article>
          <article class="book-content-card">
            <h2>What You Will Discover</h2>
            ${list(book.readerBenefits)}
          </article>
          <article class="book-content-card">
            <h2>Who This Book Is For</h2>
            ${list(book.audience)}
          </article>
          <article class="book-content-card">
            <h2>Themes Explored</h2>
            <div class="outcome-chips">${book.themes.map((item) => `<span>${item}</span>`).join("")}</div>
          </article>
          <article class="book-content-card">
            <h2>Key Takeaways</h2>
            ${list(book.keyTakeaways)}
          </article>
          <article class="book-content-card">
            <h2>Reflection Questions</h2>
            ${list(book.reflectionPrompts)}
          </article>
          ${book.transformationPath.length ? `
            <article class="book-content-card">
              <h2>${book.seriesName ? "Your Path of Transformation" : "Transformation Path"}</h2>
              <div class="outcome-chips">${book.transformationPath.map((item) => `<span>${item}</span>`).join("")}</div>
            </article>
          ` : ""}
          ${book.seriesName ? `
            <article class="book-content-card book-content-card-wide">
              <h2>The Intentional Life Blueprint Series</h2>
              <p>${book.title} is ${bookSeriesLabel(book)} in ${book.seriesName}, a movement through resilience, clarity, and harmony.</p>
              <div class="trilogy-path">
                ${books.filter((item) => item.seriesName).map((item) => `<a class="trilogy-step" href="${bookRoute(item)}"><strong>${item.shortTitle}</strong><span>${bookSeriesLabel(item)}</span></a>`).join("")}
              </div>
            </article>
          ` : ""}
        </div>
        ${renderSupportColumn(book)}
      </div>
    </section>
    `,
    renderRelatedBooks(book),
    `
    <section class="section book-nav-section">
      <div class="container">
        ${renderBookNav(book)}
      </div>
    </section>
    `
  ].join("");
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
    route: "/programs/educator-excellence-pathway/",
    sourceId: "educator-excellence",
    title: "Educator Excellence Pathway",
    eyebrow: "Educator Development",
    description: "A professional growth pathway for teaching excellence, student engagement, classroom leadership, and reflective educator development.",
    image: "/assets/imgs/gallery/teachers-training-programme-nizamia-public-school-trivandrum-sanjo-mathew-trainer.jpg",
    audience: ["Educators", "Teachers", "School leaders", "Academic teams"],
    highlights: ["Teaching excellence", "Student engagement", "Classroom leadership", "Communication and presence", "Reflective professional growth", "Human-centered learning culture"],
    outcomes: ["Stronger classroom confidence", "Improved student connection", "Clearer instructional presence", "Better educator communication", "Professional growth with purpose"],
    brochure: null
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
  },
  {
    route: "/programs/future-ready-leadership-program/",
    sourceId: "future-ready-leadership-academy",
    title: "Future-Ready Leadership Program",
    eyebrow: "Leadership Development",
    description: "A transformational leadership development journey focused on leadership presence, communication, influence, emotional intelligence, and purposeful impact.",
    image: "/assets/imgs/program-banner-header.png",
    audience: ["Emerging leaders", "Educators", "Managers", "Entrepreneurs", "Team leads"],
    highlights: ["Leadership presence", "Communication excellence", "Influence and stakeholder trust", "Emotional intelligence", "Purposeful decision-making", "Self-leadership and accountability"],
    outcomes: ["Stronger leadership presence", "Clearer communication", "Responsible influence", "Emotional maturity", "Purposeful impact"],
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
    ogImage: "/assets/imgs/sanjo-logo.png",
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
          image: "/assets/imgs/sanjo-logo.png",
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
              eyebrow: "Human Development Strategist ",
              title: "The Strategist for Transformative Growth.",
              copy: "Sanjo helps individuals, families, educators, leaders, and institutions navigate growth with clarity, competence, and purpose."
            })}
            <p class="muted">Her work integrates counselling psychology, education, communication, leadership, parenting, and skill development to translate insight into meaningful action and lasting impact.</p>
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
            eyebrow: "PROFESSIONAL EXPERTISE",
            title: "Expertise that blends Psychology, Education, Leadership, and Human development.",
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
            title: "Signature Interventions for Measurable Outcomes.",
            copy: "Personal programmes across counselling, student development, leadership, parenting, empowerment, and corporate transformation."
          })}
          ${programCards(signaturePrograms.slice(0, 8))}
        </div>
      </section>
      `,
      `
      <section class="section section-ornate">
        <div class="container waymaker-bridge reveal">
          ${decorLayer("bridge-decor")}
          <div class="split-panel">
          <div class="quote-panel reveal">
            ${renderWaymakerLogoPanel({ className: "is-inline", loading: "lazy", maxWidth: "250px" })}
            <header class="waymaker-founder-header">
              <blockquote>Founder of WayMaker Skills™</blockquote>
              <div class="waymaker-divider" aria-hidden="true"><span></span></div>
            </header>
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
                copy: "Practical models that help individuals and institutions navigate learning, leadership, and future readiness.",
                links: [
                  anchor(routes.nova, "Read Overview", "btn btn-secondary"),
                  anchor(waymakerLinks.nova, "Learn More at WayMaker Skills™", "btn btn-soft")
                ]
              },
              {
                title: "LQ™ — Life Intelligence Quotient Framework",
                copy: "A signature human development framework that offers a deeper lens for understanding personal capability, growth, and life effectiveness.",
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
            eyebrow: "Find your growth pathway",
            title: "Quick pathway selector.",
            copy: "Everyone's journey is unique. Choose the pathway that best reflects you are and where you want to grow."
          })}
          ${renderCards([
            { icon: "book", title: "I am a Student", copy: "Exam confidence, future readiness, self-expression, and learning habits.", links: [anchor("/schools-students-parents/", "See Student Pathway", "btn btn-secondary")] },
            { icon: "family", title: "I am a Parent", copy: "Emotional guidance, communication, boundaries, and developmental support at home.", links: [anchor("/schools-students-parents/#parenting-with-passion", "See Parent Pathway", "btn btn-secondary")] },
            { icon: "people", title: "I represent a School", copy: "Whole-ecosystem support across students, parents, and educators.", links: [anchor("/schools-students-parents/", "See School Pathway", "btn btn-secondary")] },
            { icon: "people", title: "I am an Educator", copy: "Teaching excellence, student engagement, classroom leadership, and professional growth.", links: [anchor("/programs/educator-excellence-pathway/", "See Educator Pathway", "btn btn-secondary")] },
            { icon: "bridge", title: "I represent an Organization", copy: "Leadership, collaboration, culture, and human-centered performance.", links: [anchor("/corporate-learning/", "See Organization Pathway", "btn btn-secondary")] },
            { icon: "leadership", title: "I Want to Lead", copy: "Leadership presence, communication, influence, emotional intelligence, and purposeful impact.", links: [anchor("/programs/future-ready-leadership-program/", "See Leadership Pathway", "btn btn-secondary")] },
            { icon: "calm", title: "I want Counselling", copy: "Clarity, emotional steadiness, decision support, and one-to-one growth.", links: [anchor("/counselling-coaching/", "See Counselling Pathway", "btn btn-secondary")] },
            { icon: "growth", title: "I want Women Empowerment", copy: "Identity, confidence, voice, well-being, and action planning.", links: [anchor("/women-empowerment/", "See Women Pathway", "btn btn-secondary")] }
          ], "path-card", "grid-4")}
        </div>
      </section>
      `,
      renderBooksCarousel(),
      renderRecognitionSection({
        className: "home-recognition-section",
        eyebrow: "Authorship & Recognition",
        heading: "Published Books with Recognised Literary Achievement.",
        description: "Explore the published collection of four books and the certificate-backed recognition connected to Dr. Sanjo Cine Mathew's authorship journey.",
        facts: [
          "Four published books",
          "Transformational fiction and intentional-living titles",
          "Asia Book of Records Awardee"
        ],
        ctaLabel: "Explore Books & Recognition",
        ctaHref: routes.books,
        carousel: true,
        previewCertificate: getBooksCertificates()[0]
      }),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Latest Insights",
            title: "Fresh reflections from the blog.",
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
            title: "What Transformation looks like in Practice.",
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
    ogImage: "/assets/imgs/sanjo-logo.png",
    content: [
      renderHero({
        eyebrow: "About Sanjo",
        title: "About Sanjo Cine Mathew",
        supportingCopy: "Helping individuals, educators, leaders, and organizations unlock their potential through psychology, learning, resilience, and intentional growth.",
        supportingMeta: "10,000+ Students Mentored/ 5,000+ Teachers & Parents Trained/ 20+ Years in Education & Human Development",
        copy: "Counselling Psychologist, Educator, Author, Skill Coach, Learning Facilitator, and Founder of WayMaker Skills™.",
        actions: [
          anchor("/programs/", "Explore Programs", "btn btn-primary"),
          anchor(routes.books, "View all books by Dr. Sanjo Cine Mathew", "btn btn-secondary"),
          anchor("/contact/", "Work With Sanjo", "btn btn-secondary")
        ],
        media: { image: "/assets/imgs/sanjo-logo.png", alt: "Dr. Sanjo Cine Mathew portrait" },
        panelTitle: "The Strategist for Transformative Growth",
        panelCopy: "Dr. Sanjo Cine Mathew is a Counselling Psychologist, Educator, Author, and Founder of WayMaker Skills™. Through mentoring, training, and transformational learning experiences, she helps individuals and organizations unlock their potential and thrive in a changing world."
      }, renderBreadcrumbs({ route: routes.about, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "About Sanjo", route: routes.about }] })),
      splitStory({
        eyebrow: "Story",
        title: "A Connected Path from Insight to Impact.",
        copy: "Sanjo's work has grown from a deep interest in human behavior into a multi-dimensional practice serving learners, families, professionals, leaders, and institutions.",
        paragraphs: [
          "Over the years, she has worked across counselling psychology, student development, parenting guidance, educator support, wellness, communication, and leadership transformation. That breadth matters because people do not grow in isolated compartments.",
          "Her practice is not built on abstract theory alone. It draws from live facilitation, individual support, school environments, institutional learning, and corporate transformation contexts where emotional intelligence and practical capability must work together.",
          "This blend of psychological insight, educational thinking, and real-world facilitation has shaped Sanjo into a trusted guide for people who want change that is both meaningful and usable."
        ],
        image: "/assets/imgs/header.png",
        imageAlt: "Sanjo Cine Mathew at a live training session",
        quoteTitle: "Transforming Potential into Purpose",
        quoteCopy: "Growth happens when mindset, emotional strength, practical skills, and purposeful action come together in a way people can sustain.  The path to transformation begins with a single intentional step.",
        quoteBy: "Dr. Sanjo Cine Mathew"
      }),
      renderRecognitionSection({
        className: "about-recognition-section",
        eyebrow: "Authorship & Recognition",
        heading: "Four Published Books. One Recognised Literary Journey.",
        description: "Sanjo's writing extends his work in psychology, resilience, intentional living, and personal transformation. His collection includes a transformational fiction title and the Intentional Life Blueprint series, with recognition from the Asia Book of Records.",
        facts: [
          "Four published books",
          "Transformational fiction and intentional-living titles",
          "Asia Book of Records Awardee"
        ],
        ctaLabel: "Explore Books & Recognition",
        ctaHref: routes.books,
        carousel: true,
        previewCertificate: getBooksCertificates()[0]
      }),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Journey Timeline",
            title: "A connected path from insight to institution-building.",
          })}
          <div class="timeline-steps">
            ${[
              ["The Explorer", "A lifelong fascination with people, learning, science, and possibility."],
              ["The Learner", "Pursuing psychology, education, and interdisciplinary studies to understand how growth happens."],
              ["The Practitioner", "Working directly with students, families, educators, and professionals across diverse settings."],
              ["The WayMaker", "Creating programs, books, and learning experiences that help people discover, develop, and direct their potential."],
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
            title: "Roles Rooted in One Mission.",
            copy: "Across Psychology, Education, Coaching, and Leadership development, each role serves a single purpose: Helping people and organizations Grow with Intention."
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
      <div class="container">
        ${sectionHeader({
          title: "One Vision. Two Platforms.",
        })}
        <div class="container comparison">
          <article class="card reveal">
            <h3>www.sanjo.in</h3>
            <p>This is where I share my journey, philosophy, expertise, and personal work</p>
          </article>
          <article class="card reveal">
            <h3>WayMaker Skills™</h3>
            <p>This is the learning and development ecosystem through which that vision is transformed into programs, workshops, resources, and growth experiences for individuals and organizations.</p>
            <div class="button-row" style="margin-top:14px;">
              ${anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-soft")}
            </div>
          </article>
        </div>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container split-panel">
          <div class="story-card reveal">
            ${sectionHeader({
              eyebrow: "Mission",
              title: "Helping people discover Strengths, build Clarity, and Create meaningful Change.",
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
              <h2>From Potential to Purpose.</h2>
              <p class="muted">Meaningful growth happens when Awareness creates Clarity, Clarity develops Skill, Skill reveals Purpose, and Purpose inspires Intentional Action.</p>
              <div class="chips">
                ${["Awareness", "Clarity", "Skill", "Purpose", "Action"].map((item) => `<span class="chip">${item}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </section>
      `,
      ctaBand({
        title: "Explore Sanjo's Programmes, Expertise, and Consultation pathways.",
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
    ogImage: "/assets/imgs/Expertise.png",
    service: {
      name: "Human development, counselling, and learning facilitation expertise",
      description: "Integrated expertise across counselling psychology, leadership, life skills, parenting, student development, and corporate learning."
    },
    content: [
      renderHero({
        eyebrow: "Expertise",
        title: "Expertise across Psychology, Education, Leadership, and Life skills.",
        copy: "Helping individuals, families, educators, leaders, and organizations grow through psychology-based, practical, and purpose-driven development.",
        actions: [anchor("/programs/", "Explore Programs", "btn btn-primary"), anchor("/contact/", "Discuss Your Context", "btn btn-secondary")],
        media: { image: "/assets/imgs/Expertise.png", alt: "Sanjo Cine Mathew teaching and facilitating" },
        panelTitle: "The Foundations of My Approach",
        panelList: ["Psychology-Informed", "Human-Centered", "Experience-Led Learning", "Practical Application", "Purpose-Driven Growth"]
      }, renderBreadcrumbs({ route: "/expertise/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Expertise", route: "/expertise/" }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Expertise Grid",
            title: "Areas of Expertise",
            copy: "Each domain represents a unique route toward growth, capability, and meaningful impact."
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
              title: "Different Paths. Shared Principles.",
              copy: "While every audience faces unique challenges, the principles that drive meaningful growth remain remarkably consistent: awareness, clarity, capability, purpose, and action."
            })}
            ${list([
              "Begin with understanding, not assumptions.",
              "Transform insight into practical action.",
              "Learn through experience and reflection.",
              "Focus on meaningful, measurable growth."
            ])}
          </div>
          ${renderCards([
            { title: "Students", copy: "Confidence, focus, life skills, and future readiness." },
            { title: "Parents", copy: "Communication, guidance, and developmental support." },
            { title: "Teachers", copy: "Capacity building, learner engagement, and classroom effectiveness." },
            { title: "Women", copy: "Confidence, identity, resilience, and empowerment." },
            { title: "Professionals", copy: "Communication, adaptability, leadership, and effectiveness." },
            { title: "Leaders & Teams", copy: "Culture, collaboration, emotional intelligence, and performance." }
          ], "audience-card", "grid-2")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "Questions",
        title: "Finding the right starting point.",
        copy: "Common questions from individuals, families, schools, and organizations exploring growth, learning, leadership, and development pathways.",
        items: [
          { q: "Can one program combine multiple expertise areas?", a: "Yes. Real-world challenges rarely fit into a single category. Many programs integrate psychology, communication, emotional intelligence, leadership, learning, and human development principles." },
          { q: "Are these expertise areas limited to workshops?", a: "No. Depending on the need, support may be delivered through workshops, coaching, mentoring, assessments, consultations, training programs, or long-term development initiatives." },
          { q: "How do I know which area is right for me?", a: "The best starting point is your current goal or challenge. The focus may be personal growth, learning, leadership, well-being, communication, or team development. From there, an appropriate pathway can be identified." },
          { q: "Do you work with individuals as well as organizations?", a: "Yes. Services are designed for students, parents, educators, professionals, leaders, teams, institutions, and organizations." },
          { q: "Are programs customized?", a: "Whenever possible, programs are adapted to the audience, context, objectives, and desired outcomes to ensure meaningful and relevant learning experiences." },
          { q: "Can expertise areas be integrated into a larger development journey?", a: "Absolutely. Many clients begin with one area and later integrate leadership, communication, emotional intelligence, well-being, or learning strategies as part of a broader growth journey." },
        ]
      }),
      ctaBand({
        title: "Every Journey Starts with a Conversation.",
        copy: "The right pathway depends on your goals, challenges, audience, and aspirations. Together, we can identify the most meaningful next step.",
        actions: [
          anchor("/programs/", "Explore Programs", "btn btn-soft"),
          anchor("/contact/", "Book a Consultation", "btn btn-secondary")
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
        title: "Growth Pathways for Every Stage of Life.",
        copy: "Sanjo's programs draw from psychology, education, coaching, human development, and practical life experience. Each pathway is designed to create meaningful growth in a specific context while remaining adaptable to individual and organizational need.",
        actions: [anchor("/contact/", "Enquire Now", "btn btn-primary"), anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")],
        media: { image: "/assets/imgs/program-banner-header.png", alt: "Sanjo Cine Mathew program banner" },
        panelTitle: "Designed For",
        panelMeta: ["Students", "Parents", "Educators", "Professionals", "Leaders", "Organizations"]
      }, renderBreadcrumbs({ route: routes.programs, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Programs", route: routes.programs }] })),
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "Program Index",
            title: "Transformative Programs for Every Stage of Growth.",
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
            title: "One Vision. Multiple Pathways for Growth.",
            copy: "Every individual, team, and community has unique needs. Programs are designed as personalized mentoring, interactive workshops, focused interventions, or long-term growth journeys."
          })}
          ${renderCards([
            { title: "One-to-One Support", copy: "Personalized guidance and mentoring." },
            { title: "Group Programs", copy: "Shared learning experiences and workshops." },
            { title: "Strategic Interventions", copy: "Targeted solutions for specific needs." },
            { title: "Development Journeys", copy: "Longer-term growth and transformation pathways." }
          ], "process-card", "grid-4")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "FAQ",
        title: "Questions about program fit and customization.",
        copy: "Find answers to common questions about selecting, adapting, and implementing programs.",
        items: [
          { q: "Can programs be customized?", a: "Yes. Programs can be adapted to the audience, age group, goals, duration, developmental needs, and organizational context." },
          { q: "I'm not sure whether I need counselling, coaching, mentoring, training, or a workshop. What should I choose?", a: "A brief conversation can help identify the most suitable pathway. Recommendations are based on your goals, audience, context, and desired outcomes." },
          { q: "Are these programs available for schools, organizations, and institutions?", a: "Yes. Many programs can be delivered for educational institutions, organizations, community groups, and professional audiences, with appropriate customization." },
          { q: "Can programs be delivered online or in person?", a: "Depending on the program and audience, sessions may be delivered online, onsite, or through a blended format." },
        ]
      }),
      ctaBand({
        title: "Different audiences. Different needs. Shared growth.",
        copy: "Discover pathways tailored to students, parents, professionals, organizations, and communities.",
        actions: [
          anchor("/corporate-learning/", "Corporate Learning", "btn btn-soft"),
          anchor("/counselling-coaching/", "Counselling & Coaching", "btn btn-secondary"),
          anchor("/schools-students-parents/", " Education & Youth Development", "btn btn-secondary"),
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
        title: "Developing People, Possibilities, and Future-Ready Capabilities.",
        copy: "WayMaker Skills™ is a human development organization dedicated to helping individuals, educators, professionals, and communities grow through learning, leadership, life skills, and applied intelligence. Founded by Dr. Sanjo Cine Mathew, serves as the ecosystem through which transformative frameworks, programs, and initiatives are developed and delivered.",
        actions: [anchor(waymakerLinks.company, "Visit WayMaker Skills™", "btn btn-primary"), anchor(routes.programs, "Explore Related Programs", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-cine-mathew.png", alt: "WayMaker Skills visual identity" },
        panelTitle: "Core Pillars",
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
            eyebrow: "THE CONNECTION",
            title: "How Sanjo.in and WayMaker Skills™ Work Together.",
            copy: "Sanjo.in is the personal brand and thought leadership platform of Dr. Sanjo Cine Mathew. WayMaker Skills™ is the organization through which frameworks, programs, and larger initiatives are developed and delivered."
          })}
          ${renderCards([
            {
              title: "Meet the Founder",
              copy: "Learn about Sanjo's journey, philosophy, expertise, and the ideas that shape her work."
            },
            {
              title: "Explore the Frameworks",
              copy: "Discover the thinking behind WAMI™, NOVA™, LQ™, and other growth-centered frameworks."
            },
            {
              title: "Engage with WayMaker Skills™",
              copy: "Explore programs, partnerships, institutional initiatives, and organizational collaborations."
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
            title: "Frameworks for Intentional Growth and Human Development.",
            copy: "Discover the signature frameworks that guide learning, self-awareness, leadership, and personal transformation across the WayMaker ecosystem."
          })}
          ${renderCards([
            {
              title: "WAMI™ — Children's Life Skills",
              copy: "A creative life skills framework that nurtures confidence, communication, creativity, character, and self-awareness through stories, play, and reflection.",
              links: [anchor(routes.wami, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.wami, "Learn More at WayMaker Skills™", "btn btn-soft")]
            },
            {
              title: "NOVA™ — Human Development Methodology",
              copy: "A structured pathway for turning awareness into action, helping people grow with greater purpose, ownership, and direction.",
              links: [anchor(routes.nova, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.nova, "Learn More at WayMaker Skills™", "btn btn-soft")]
            },
            {
              title: "LQ™ — Life Intelligence Quotient Framework",
              copy: "A holistic framework for developing self-awareness, emotional intelligence, relationships, purposeful action, and adaptability.",
              links: [anchor(routes.lq, "Read Overview", "btn btn-secondary"), anchor(waymakerLinks.lq, "Learn More at WayMaker Skills™", "btn btn-soft")]
            }
          ], "framework-card", "grid-3")}
        </div>
      </section>
      `,
      faqSection({
        eyebrow: "WayMaker FAQ",
        title: "How WayMaker Skills™ connects to Sanjo's personal brand.",
        items: [
          { q: "What is the relationship between Sanjo.in and WayMaker Skills™?", a: "Sanjo.in is the personal platform of Dr. Sanjo Cine Mathew, while WayMaker Skills™ is the organization through which many learning, training, and development initiatives are delivered. Together, they reflect a shared mission of empowering intentional growth and human development." },
          { q: "Is Sanjo.in the company website?", a: "No. Sanjo.in is the personal website of Dr. Sanjo Cine Mathew, showcasing her work, ideas, publications, frameworks, and professional journey." },
          { q: "What is WayMaker Skills™?", a: "WayMaker Skills™ is the learning and development organization founded by Dr. Sanjo Cine Mathew, focused on human development, life skills, leadership, well-being, and future-ready learning pathways." },
          { q: "Why are WAMI™, NOVA™, and LQ™ featured on Sanjo.in?", a: "WAMI™, NOVA™, and LQ™ are signature frameworks created by Sanjo. They are featured here because they represent the ideas, methodologies, and learning philosophies that shape her work and the broader WayMaker ecosystem." },
          { q: "Where should organizational enquiries go?", a: "You may start the conversation through Sanjo.in. For large-scale partnerships, institutional programmes, or organizational collaborations, enquiries may be directed to WayMaker Skills™." }
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
        title: "Meet WAMI™, the WayMaker Star for Growing Humans.",
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
            title: "A Joyful World where Life skills come Alive.",
            copy: "WAMI™ helps children grow through stories, activities, games, challenges, reflection, and character-building experiences that feel bright, safe, and memorable."
          })}
          ${renderCards([
            { title: "Learn by doing", copy: "Children learn best when they actively explore, create, and participate." },
            { title: "Grow through stories", copy: "Stories help children understand values, emotions, choices, and character." },
            { title: "Reflect with confidence", copy: "Simple reflection moments help children notice, understand, and apply what they learn." }
          ], "framework-card", "grid-3")}
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container">
          ${sectionHeader({
            eyebrow: "How WAMI™ Comes Alive",
            title: "Where Every Activity becomes a Life skill Adventure.",
            copy: "The WAMI™ world is filled with stories, games, challenges, reflection moments, and creative experiences designed to help children grow."
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
            title: "The Life skills that matter Beyond the Classroom.",
            copy: "WAMI™ helps children build confidence, communication, creativity, emotional awareness, and other essential human skills."
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
            title: "Growing together through Home and School.",
            copy: "Children thrive when the important adults in their lives reinforce the same values, skills, and habits. This creates a beautiful bridge between parents and educators."
          })}
          ${renderCards([
            {
              title: "For Parents - Support life skills at home",
              copy: "WAMI™ provides simple, engaging ways for families to nurture confidence, communication, creativity, values, and reflection in everyday life."
            },
            {
              title: "For Schools - Bring life skills into the learning journey",
              copy: "WAMI™ supports schools through student programs, classroom experiences, life-skill initiatives, and youth development partnerships."
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
            title: "A World of Stories, Play, and Personal Growth.",
            copy: "The WAMI™ journey helps children explore ideas, express themselves, build relationships, and grow with confidence."
          })}
          <div class="timeline-steps">
            ${[
              ["Game-Based Learning", "-"],
              ["Creative Expression", "-"],
              ["Reflection Moments", "-"],
              // ["Reflection moments", "Guided check-ins help them notice what they learned and how it applies in life."]
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
        title: "Questions About WAMI™",
        copy: "A quick guide for parents, educators, and partners exploring the WAMI™ world.",
        items: [
          { q: "Who is WAMI™ for?", a: "WAMI™ is designed for children and can be experienced through families, schools, learning groups, and community programs." },
          { q: "Can WAMI™ be used in schools?", a: "Yes. WAMI™ can support life-skills learning through classroom experiences, enrichment programs, student development initiatives, and partnerships." },
          { q: "What skills does WAMI™ help children develop?", a: "WAMI™ focuses on confidence, communication, creativity, character, emotional awareness, collaboration, curiosity, and practical life skills." },
          { q: "Is WAMI™ a curriculum or a learning experience?", a: "WAMI™ is a playful life-skills learning world that combines stories, activities, games, creativity, and reflection to support child development." }
        ]
      }),
      ctaBand({
        title: "Every Child deserves a World that helps them Grow.",
        copy: "Bring WAMI™ into homes, classrooms, and communities where stories, play, creativity, and reflection become pathways to life skills.",
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
    ogImage: "/assets/imgs/sanjo-logo.png",
    content: [
      renderHero({
        eyebrow: "Resume / Credentials",
        title: "Professional Credentials",
        copy: "Professional background and Academic credentials.",
        actions: [anchor("/contact/", "Invite Sanjo for a Program", "btn btn-primary"), anchor("/about/", "About Sanjo", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-logo.png", alt: "Portrait of Sanjo Cine Mathew" },
        panelTitle: "Highlights",
        panelList: ["20+ Years Experience", "10,000+ Students Mentored", "5,000+ Teachers & Parents Trained"]
      }, renderBreadcrumbs({ route: "/resume/", breadcrumbs: [{ label: "Home", route: "/" }, { label: "Resume / Credentials", route: "/resume/" }] })),
      `
      <section class="section">
        <div class="container list-columns">
          <article class="story-card reveal">
            <h2>Professional Experience</h2>
            ${list([
              "Director & Founder &mdash; Way Maker Skill Solutions",
              "Consultant Psychologist &mdash; Worked with various schools",
              "Resource Teacher Trainer &mdash; CBSE Schools",
              "Biology Subject Matter Expert &mdash; Growing Stars Infotech Pvt. Ltd.",
              "Counsellor & Trainer &mdash; Various organisations",
              "Soft Skills Trainer &mdash; Corporate and Institutional Training Programs",
              "Leadership Trainer for Professionals &mdash; Delivered training in Aviation, Healthcare, Manufacturing, Consulting, and other professional sectors",
              "Team Building, Outbound & Inbound Training Facilitator &mdash; Psychology-based experiential learning and professional development programs"
            ])}
          </article>
          <article class="story-card reveal">
            <h2>Education</h2>
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
        <div class="container">
          <article class="story-card reveal">
            <h2>Certifications</h2>
            ${list([
              "Certified Corporate Trainer",
              "Certified Shadow Healing Facilitator",
              "Certified CBT Coach",
              "Certified NLP Practitioner",
              "Certified Well-being Coach",
              "Certified Life Coach",
              "Certified Fitness Mentor",
              "Meditation Instructor Trainer",
              "International Certification in Special Education (SETT)",
              "International Certification in Educational Administration and Management"
            ], "bullet-list resume-bullet-columns")}
          </article>
        </div>
      </section>
      `,
      `
      <section class="section">
        <div class="container comparison">
          <article class="story-card reveal">
            <h2>Publications</h2>
            ${list([
              "Psycho-Social Issues of Middle-Aged Working Women in Cochin City Based on Stress (2018).",
              "Study on Physicochemical and Phycological Characteristics of Temple Ponds in Ernakulam, Kerala (2008)."
            ])}
          </article>
          <article class="story-card reveal">
            <h2>Conference Presentations</h2>
            ${list([
              "Presented a paper on Assistive Technology in Dementia Care at a UGC National Seminar.",
              "Presented a paper on Psychosocial Stress Issues at a National Seminar, Thrissur."
            ])}
          </article>
        </div>
      </section>
      `,
         `
      <section class="section">
        <div class="container">
          <article class="story-card reveal">
            <h2>Professional Affiliations</h2>
            ${list([
              "International Affiliate, American Psychological Association (APA).",
              "Member, International Association of Applied Psychology (IAAP).",
              "Member, Counsellor Council of India (CCI).",
              "Member, Global Association of Behavior Management (GABM)."
            ])}
          </article>
        </div>
      </section>
      `,
      renderRecognitionSection({
        className: "resume-recognition-section",
        eyebrow: "Honors & Recognitions",
        heading: "Two-Time Asia Book of Records Awardee",
        description: "Honoured as a Two-Time Asia Book of Records Awardee for contributing to landmark publishing initiatives that achieved the maximum number of books published in a single day and the maximum number of eBooks published on World Book Day. These achievements reflect a commitment to inspiring learning, empowering authorship, and making knowledge accessible to a wider audience.",
        facts: [],
        ctaLabel: "View Books, Certificates & Recognition",
        ctaHref: routes.books,
        compact: true,
        carousel: true,
        previewCertificate: getBooksCertificates()[0]
      }),
   
      ctaBand({
        title: "Partner with Sanjo for learning, leadership, and well-being initiatives.",
        copy: "From leadership development and communication training to resilience, wellness, and inclusion programmes, every engagement is tailored to your audience and desired outcomes.",
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
    ogImage: "/assets/imgs/blog.png",
    content: [
      renderHero({
        className: "blog-library-hero",
        eyebrow: "Blog / Insights",
        title: "Insights on Growth, Leadership, and Human Development.",
        copy: "Explore practical reflections, psychology-informed insights, and future-ready ideas designed to support meaningful growth in life, learning, and leadership. ",
        actions: [anchor("/resources/", "Explore Resources", "btn btn-primary"), anchor("/contact/", "Discuss a Topic", "btn btn-secondary")],
        media: { image: "/assets/imgs/blog.png", alt: "Insight and reading themed visual" },
        panelTitle: "Featured Themes",
        panelMeta: ["Life Skills", "Parenting", "Leadership", "Communication"]
      }, renderBreadcrumbs({ route: routes.blog, breadcrumbs: [{ label: "Home", route: routes.home }, { label: "Blog / Insights", route: routes.blog }] })),
      `
      <section class="section">
        <div class="container blog-hub" data-blog-hub>
          ${sectionHeader({
            eyebrow: "Explore Insights",
            title: "Explore Thoughtful Insights for Meaningful Growth.",
            copy: "Discover articles, reflections, and practical guidance shaped by psychology, education, leadership, and human development."
          })}
          <div class="blog-controls blog-search-card reveal">
            <div class="blog-search-wrap">
              <label class="sr-only" for="blog-search">Search insights</label>
              <span class="blog-search-icon" aria-hidden="true">${iconSvg("message")}</span>
              <input id="blog-search" type="search" placeholder="Search insights by topic, skill, or audience..." data-blog-search aria-controls="blog-results-grid">
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
          <script type="application/json" data-blog-posts>${safeJsonForHtml(blogPosts.map(blogClientPayload))}</script>
          <div class="blog-layout">
            <div class="blog-main">
              <div class="blog-default-content">
              <div class="featured-blog-grid">
                ${getBlogSelections().featured.map((post) => renderBlogCard(post, { featured: true, cta: "Read Featured", result: false })).join("")}
                <aside class="story-card reveal">
                  <h3>Meet Sanjo</h3>
                  <p class="muted">Counselling psychologist, educator, author, and founder of WayMaker Skills. Sharing practical insights on growth, learning, leadership, parenting, and intentional living.</p>
                  <div class="button-row">
                    ${anchor(routes.contact, "Discuss a Topic", "btn btn-soft")}
                    ${anchor(routes.about, "About Sanjo", "btn btn-secondary")}
                  </div>
                  <br/>
                  <br/>
                  <h2 class="muted">Growth is not about becoming someone else. It is about becoming more of who you are capable of being. <br/> — Sanjo</h2>
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
              <section class="blog-results-section">
                <div class="blog-results-header reveal">
                  <h3>All Articles</h3>
                  <p class="muted blog-count-line">Showing <span data-blog-count>${blogPosts.length}</span> of <span data-blog-total>${blogPosts.length}</span> insights.</p>
                </div>
                <div class="grid-3" id="blog-results-grid" data-blog-grid>
                  ${blogPosts.map((post) => renderBlogCard(post)).join("")}
                </div>
                <div class="blog-empty-card" data-blog-empty hidden role="status" aria-live="polite">
                  <h3>No insights matched your filters.</h3>
                  <p class="muted">Try a different keyword or clear the filters.</p>
                  <div class="button-row"><button class="clear-filters" type="button" data-blog-clear>Clear filters</button></div>
                </div>
              </section>
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
                <p class="muted">Let's explore the next step in your growth journey.</p>
                <div class="button-row">${anchor(routes.consultation, "Book a Consultation", "btn btn-primary")}</div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      `,
      ctaBand({
        title: "Growth Begins with Insight.",
        copy: "Meaningful change starts with a new perspective. Continue your journey through guided conversations, transformative programs, and purposeful learning experiences.",
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
    ogImage: "/assets/imgs/sanjo-logo.png",
    content: [
      renderHero({
        eyebrow: "Contact",
        title: "Let us build your next Transformation roadmap.",
        copy: "Whether you're seeking personal growth, planning a learning initiative, or creating meaningful change within a community or organization, every transformation begins with a conversation.",
        actions: [anchor("mailto:biosanjo@gmail.com", "Email Now", "btn btn-primary"), anchor("https://wa.me/919645343777", "WhatsApp", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-logo.png", alt: "Sanjo Cine Mathew portrait" },
        panelTitle: "Areas of Support",
        panelList: ["Counselling & Coaching", "Personal Growth & Well-being", "School & Parent Programmes", "Leadership & Communication Development", "Women Empowerment Initiatives", "Workshops, Training & Keynote Sessions"]
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
    ogImage: "/assets/imgs/sanjo-logo.png",
    content: [
      renderHero({
        eyebrow: "Book a Consultation",
        title: "A safe space to explore challenges, possibilities, and clarity- focused  path ahead",
        copy: "People connect with me for counselling, mentoring, personal growth, parenting support, educational guidance, leadership development, and meaningful life conversations. Whether you're facing a challenge, exploring a possibility, or seeking a fresh perspective, this consultation helps us identify the most appropriate next step.",
        actions: [anchor("/contact/", "Book Consultation", "btn btn-primary"), anchor("https://wa.me/919645343777", "WhatsApp", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-logo.png", alt: "Sanjo Cine Mathew portrait" },
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
    ogImage: "/assets/imgs/sanjo-logo.png",
    content: [
      renderHero({
        eyebrow: "FAQ",
        title: "Frequently asked questions about programs, consultations, and frameworks.",
        copy: "A complete FAQ page covering consultations, schools, corporate learning, founder pathways, and WayMaker-connected frameworks.",
        actions: [anchor("/contact/", "Ask a Question", "btn btn-primary"), anchor("/book-consultation/", "Book a Consultation", "btn btn-secondary")],
        media: { image: "/assets/imgs/sanjo-logo.png", alt: "Sanjo Cine Mathew portrait" },
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
    ogImage: "/assets/imgs/header.png",
    content: [
      renderHero({
        eyebrow: "Impact",
        title: "Transformation measured through confidence, capability, and practical change.",
        copy: "This page captures the kinds of outcomes Sanjo's work is designed to create across individuals, families, schools, and organizations.",
        actions: [anchor("/gallery/", "View the Gallery", "btn btn-primary"), anchor("/contact/", "Discuss an Impact Goal", "btn btn-secondary")],
        media: { image: "/assets/imgs/header.png", alt: "Sanjo facilitating a live session" },
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
  page(routes.books, {
    title: "Books by Dr. Sanjo Cine Mathew | Intentional Living & Psychology",
    description: "Explore books by Dr. Sanjo Cine Mathew on intentional living, emotional resilience, mental clarity, intentional thinking, inner harmony, and transformational personal growth.",
    socialTitle: "Books by Dr. Sanjo Cine Mathew",
    socialDescription: "Explore transformational fiction and psychology-informed books on intentional living, emotional resilience, mental clarity, and inner harmony.",
    ogImage: books[0].coverImage,
    ogAlt: books[0].coverAlt,
    collectionPage: true,
    breadcrumbs: [{ label: "Books", route: routes.books }],
    content: renderBooksIndexContent()
  }),
  ...books.map((book) => page(bookRoute(book), {
    title: book.seoTitle,
    description: book.seoDescription,
    ogImage: book.coverImage,
    ogAlt: book.coverAlt,
    socialTitle: book.socialTitle,
    socialDescription: book.socialDescription,
    ogType: "book",
    book,
    breadcrumbs: [{ label: "Books", route: routes.books }, { label: book.shortTitle, route: bookRoute(book) }],
    content: renderBookDetailContent(book)
  }))
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
    ogImage: post.image || "/assets/imgs/blog.png",
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
  { from: "shop.html", to: bookRoute(books[1]) },
  { from: "shop/index.html", to: bookRoute(books[1]) },
  { from: "shop-the-resilience-response/index.html", to: bookRoute(books[1]) },
  ...books.map((book) => ({ from: `${legacyBookRoute(book).replace(/^\/|\/$/g, "")}/index.html`, to: bookRoute(book) })),
  { from: "nova-methodology/index.html", to: routes.nova },
  { from: "lq-life-intelligence-quotient/index.html", to: routes.lq },
  ...blogPosts.map((post) => ({ from: `blog/${post.slug}/index.html`, to: `${routes.blog}${post.slug}/` }))
];

function redirectHtml(target) {
  const publicTarget = publicHref(target);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${publicTarget}">
  <link rel="canonical" href="${fullUrl(target)}">
  <script>location.replace(${JSON.stringify(publicTarget)});</script>
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="${publicTarget}">${publicTarget}</a></p>
</body>
</html>`;
}

function notFoundHtml() {
  return renderPage(page("/404.html", {
    title: "Page Not Found | Sanjo Cine Mathew",
    description: "The requested Sanjo Cine Mathew page could not be found. Use the main navigation to continue.",
    ogImage: "/assets/imgs/sanjo-logo.png",
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
  if (CNAME) {
    await safeWrite(path.join(OUTPUT_DIR, "CNAME"), `${CNAME}\n`);
  }
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
    const book = item.book;
    const imageXml = book ? `\n    <image:image>\n      <image:loc>${BASE_URL}${book.coverImage}</image:loc>\n      <image:title>${escapeXml(book.title)}</image:title>\n      <image:caption>${escapeXml(book.coverAlt)}</image:caption>\n    </image:image>` : "";
    return `  <url>\n    <loc>${fullUrl(item.route)}</loc>${imageXml}\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
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
