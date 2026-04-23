# Franklin Bulk Operations Shared Library — Documentation

> **Package:** `franklin-bulk-shared`
> **Version:** 1.31.1
> **Author:** catalan@adobe.com
> **License:** Apache-2.0
> **Runtime:** Node.js (ES Modules) — TypeScript targeting ES2022

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Module Reference](#module-reference)
   - [Puppeteer](#puppeteer-module)
   - [Web](#web-module)
   - [Time](#time-module)
   - [FS](#fs-module)
5. [Step Pipeline](#step-pipeline)
6. [CSS & Font Extraction](#css--font-extraction)
7. [Web Crawling](#web-crawling)
8. [Configuration & Build](#configuration--build)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Testing](#testing)
11. [Dependencies](#dependencies)

---

## Overview

`franklin-bulk-shared` is a **TypeScript Node.js library** designed for Adobe Franklin (AEM Edge Delivery Services) bulk operations. It provides a comprehensive toolkit for:

- **Browser automation** — Headless Chrome/Chromium via Puppeteer with anti-detection stealth, ad blocking, and GDPR consent blocking.
- **Web crawling** — Sitemap-based and HTTP-based crawling strategies with URL qualification, inclusion/exclusion patterns, and language detection.
- **CSS & font extraction** — Minimal CSS computation, font detection, and AEM boilerplate CSS generation.
- **Performance auditing** — Integrated Google Lighthouse scoring for accessibility, performance, SEO, and best practices.
- **Resource caching** — Interception and local caching of images and stylesheets during page loads.
- **Utility functions** — Filesystem path sanitization, URL validation, HTML link manipulation, async delays, and HTTP fetch with retry/timeout.

The library is organized into four top-level namespaces exported from the main entry point:

```typescript
import { Puppeteer, Web, Time, FS } from 'franklin-bulk-shared';
```

---

## Architecture

### High-Level Module Map

```
index.ts (Entry Point)
├── Puppeteer  →  src/puppeteer/puppeteer.ts
│   ├── CSS    →  src/puppeteer/css.ts
│   ├── Steps  →  src/puppeteer/steps/steps.ts
│   │   ├── step-post-load-wait.ts
│   │   ├── step-smart-scroll.ts
│   │   ├── step-collect-webconsole.ts
│   │   ├── step-fullpage-screenshot.ts
│   │   ├── step-exec-async.ts
│   │   ├── step-run-lighthouse.ts
│   │   └── step-cache-resources.ts
│   └── DOMSnapshot → src/puppeteer/dom-snapshot.ts
│
├── Web  →  src/web/web.ts (barrel)
│   ├── crawl.ts      — Crawling engine
│   ├── url.ts        — URL validation & language detection
│   ├── html.ts       — HTML link extraction & rewriting
│   ├── sitemap.ts    — XML sitemap parser (gzip support)
│   ├── robotstxt.ts  — robots.txt parser
│   └── ietf.ts       — IETF language tag data
│
├── Time  →  src/time.ts
│   └── sleep, randomSleep
│
└── FS  →  src/fs.ts
    └── sanitizeForFS, computeFSDetailsFromUrl
```

### Data Flow: Web Crawling

```
crawl(originURL, options)
    │
    ├── [Sitemaps Strategy]
    │   ├── parseRobotsTxt() → extract sitemap URLs
    │   └── parseSitemapFromUrl() → extract page URLs
    │
    └── [HTTP Strategy]
        └── fetch HTML → extractLinks() → discover URLs
    │
    ▼
qualifyURLsForCrawl()
    ├── isValidHTTP() — validate URL
    ├── getLanguageFromURL() — detect language via IETF data
    ├── Apply inclusion/exclusion patterns (matcher)
    └── Produce URLExtended objects
    │
    ▼
urlStreamFn(qualifiedURLs) — callback with results
```

### Data Flow: Puppeteer Step Pipeline

```
runStepsSequence(page, url, [step1, step2, step3])
    │
    ▼
Middleware composition (inside-out):
  step3( step2( step1( mainBrowserAction ) ) )(params)
    │
    ▼
Execution order:
  1. Navigate to URL (mainBrowserAction)
  2. step1 runs (e.g., smartScroll)
  3. step2 runs (e.g., postLoadWait)
  4. step3 runs (e.g., fullPageScreenshot)
    │
    ▼
Returns params with collected data (screenshots, lighthouse, console, etc.)
```

---

## Installation

```bash
npm install https://gitpkg.now.sh/catalan-adobe/franklin-bulk-shared
```

---

## Module Reference

### Puppeteer Module

Import: `import { Puppeteer } from 'franklin-bulk-shared';`

#### `BrowserOptions` (Type)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `headless` | `boolean` | `true` | Run browser in headless mode |
| `executablePath` | `string` | `null` | Custom Chrome executable path |
| `width` | `number` | `1280` | Viewport width |
| `height` | `number` | `1000` | Viewport height |
| `adBlocker` | `boolean` | `true` | Enable Ghostery ad blocker |
| `gdprBlocker` | `boolean` | `false` | Enable GDPR consent blocker |
| `devTools` | `boolean` | `false` | Open DevTools on launch |
| `maximized` | `boolean` | `false` | Launch maximized |
| `useLocalChrome` | `boolean` | `false` | Use locally installed Chrome |
| `userDataDir` | `string` | `null` | Chrome user data directory |
| `extraArgs` | `string[]` | `[]` | Additional Chrome launch arguments |
| `disableJS` | `boolean` | `false` | Block JavaScript execution |
| `pageTimeout` | `number` | `30000` | Page navigation timeout (ms) |

#### `initBrowser(options?: BrowserOptions): Promise<[Browser, Page]>`

Initializes a single headless browser instance with stealth mode and optional ad/GDPR blocking.

```typescript
const [browser, page] = await Puppeteer.initBrowser({
  headless: true,
  adBlocker: true,
  width: 1920,
  height: 1080,
});
```

**Features:**
- Puppeteer Extra with Stealth Plugin for anti-bot-detection
- Optional Ghostery ad blocker integration
- Optional JavaScript disabling via request interception
- Configurable viewport and Chrome arguments

#### `initBrowserCluster(options?: BrowserOptions, workers?: number): Object`

Creates a browser cluster for concurrent page processing using `puppeteer-cluster`.

```typescript
const cluster = await Puppeteer.initBrowserCluster({ headless: true }, 4);
await cluster.execute(taskData);
await cluster.close();
```

**Returns:** Object with:
- `close()` — Shuts down the cluster
- `execute(data)` — Schedules a task on the cluster

**Concurrency mode:** `Cluster.CONCURRENCY_BROWSER` (one browser per worker).

#### `scrollDown(page: Page): Promise<void>`

Scrolls a page to the bottom.

```typescript
await Puppeteer.scrollDown(page);
```

#### `scrollUp(page: Page): Promise<void>`

Scrolls a page to the top.

```typescript
await Puppeteer.scrollUp(page);
```

#### `smartScroll(page: Page, options?: { postReset: boolean }): Promise<void>`

Scrolls a page incrementally to the bottom (500px increments every 100ms) to trigger lazy-loaded content, then optionally scrolls back to the top.

```typescript
await Puppeteer.smartScroll(page, { postReset: true });
```

#### `runStepsSequence(page, url, steps, logger): Promise<Object>`

Executes a middleware-based step pipeline on a page. Navigates to the URL first, then runs each step in sequence.

```typescript
const result = await Puppeteer.runStepsSequence(
  page,
  'https://example.com',
  [
    Puppeteer.Steps.smartScroll(),
    Puppeteer.Steps.postLoadWait(2000),
    Puppeteer.Steps.fullPageScreenshot({ outputFolder: './screenshots' }),
  ],
  logger,
);
```

**Returns:** `{ passed: boolean, error?: any, ...step-specific data }`

---

### Puppeteer Sub-modules

#### `Puppeteer.Steps` — Step Pipeline Middleware

All steps follow the middleware pattern: `step(options) → (action) → async (params) → params`

| Step | Factory Signature | Description |
|------|-------------------|-------------|
| **postLoadWait** | `postLoadWait(ms: number)` | Delays execution for `ms` milliseconds after page load |
| **smartScroll** | `smartScroll({ postReset?: boolean })` | Scrolls page incrementally to trigger lazy loading |
| **fullPageScreenshot** | `fullPageScreenshot({ outputFolder?: string })` | Takes full-page PNG screenshot, saves to disk |
| **webConsoleMessages** | `webConsoleMessages({ outputFolder?: string })` | Captures browser console messages, saves as JSON |
| **execAsync** | `execAsync(fn: (page) => Promise<void>)` | Runs a custom async function on the page |
| **runLighthouseCheck** | `runLighthouseCheck()` | Runs Lighthouse audit (accessibility, performance, SEO, best practices) |
| **cacheResources** | `cacheResources({ outputFolder?: string })` | Intercepts and caches images/stylesheets to local filesystem |

**Step `params` Object:**

```typescript
{
  outputFolder: string,
  page: pptr.Page,
  done: boolean,
  postLoadDelay: number,
  url: string,
  logger: Logger,
  result: { passed: boolean, error?: any },
  // Step-specific fields:
  screenshotPath?: string,        // fullPageScreenshot
  lighthouse?: {                  // runLighthouseCheck
    version: string,
    scores: object,
    reportFull: object,
  },
}
```

**Error handling:** Every step follows a consistent pattern — errors are caught, logged, and set in `params.result`. Steps check for previous failures and short-circuit when `result.passed === false`.

#### `Puppeteer.CSS` — CSS & Font Extraction

| Function | Description |
|----------|-------------|
| `getDefaultCSSValues(browser, options?)` | Gets default browser computed styles for standard HTML elements |
| `getComputedCSSValues(page, tags?, options?)` | Gets computed CSS for specified tags on current page |
| `getCSSValuesForDefaultElements(page, tags?, options?)` | Gets CSS for all elements matching given tags |
| `getMinimalCSSForCurrentPage(page)` | Generates minimal CSS by diffing current vs default styles |
| `getMinimalCSSForAEMBoilerplateFromURL(url, page, options)` | Full AEM boilerplate CSS + font extraction |

**`getMinimalCSSForAEMBoilerplateFromURL`** is the most comprehensive function. It:
1. Intercepts font requests via CDP
2. Detects body and heading fonts by frequency analysis
3. Downloads/decodes fonts (base64 or HTTP)
4. Computes font fallbacks using `fontpie-calc`
5. Generates `@font-face` declarations
6. Computes desktop + mobile minimal CSS

**Returns:**
```typescript
{
  bodyFontFamilySet: string,
  headingFontFamilySet: string,
  fontFaces: FontFace[],
  fontFBFaces: FontFace[],
  headingFontSizes: { xs, s, m, l, xl, xxl },
}
```

---

### Web Module

Import: `import { Web } from 'franklin-bulk-shared';`

#### URL Utilities

##### `isValid(url: string, protocols?: string[]): URL | null`

Validates a URL string and optionally checks its protocol.

```typescript
const urlObj = Web.isValid('https://example.com');         // URL object
const invalid = Web.isValid('not-a-url');                  // null
const httpOnly = Web.isValid('ftp://example.com', ['http:']); // null
```

##### `isValidHTTP(url: string): URL | null`

Convenience function that validates only HTTP/HTTPS URLs.

```typescript
const urlObj = Web.isValidHTTP('https://example.com');  // URL object
const ftp = Web.isValidHTTP('ftp://example.com');       // null
```

##### `getLanguageFromURL(url: string): string | null`

Extracts IETF language/locale code from URL pathname segments.

```typescript
Web.getLanguageFromURL('https://example.com/de/page');    // 'de-de'
Web.getLanguageFromURL('https://example.com/fr-ca/page'); // 'fr-CA'
Web.getLanguageFromURL('https://example.com/page');       // null
```

Uses the built-in IETF language tag database (200+ entries) for matching.

#### HTML Utilities

##### `rewriteLinksRelative(html: string, host: string): string`

Rewrites absolute links in HTML to be relative, for links matching the specified host.

```typescript
const html = '<a href="https://example.com/page">Link</a>';
Web.rewriteLinksRelative(html, 'example.com');
// → '<a href="/page">Link</a>'
```

##### `extractLinks(html: string, host: string): string[]`

Extracts unique non-media `href` links from HTML that match the specified host or are root-relative.

```typescript
const links = Web.extractLinks('<a href="/about">About</a><a href="/blog">Blog</a>', 'example.com');
// → ['/about', '/blog']
```

**Excluded extensions:** jpg, jpeg, png, gif, svg, webp, ico, css, js, json, xml, txt, ttf, pdf

#### Sitemap Parsing

##### `parseSitemapFromUrl(url: string, options?): Promise<Sitemap>`

Fetches and parses an XML sitemap, including support for gzip-compressed files.

```typescript
const sitemap = await Web.parseSitemapFromUrl('https://example.com/sitemap.xml', {
  timeout: 15000,
  httpHeaders: { 'User-Agent': 'MyBot/1.0' },
});
// sitemap.urls     → ['https://example.com/page1', ...]
// sitemap.sitemaps → [{ url: 'https://example.com/sitemap-posts.xml', ... }]
```

**`Sitemap` type:**
```typescript
{
  url: string,
  sitemaps?: Sitemap[],   // Nested/referenced sitemaps
  lastMod?: string,       // Last modification date
  urls?: string[],        // URLs found in this sitemap
}
```

**Features:**
- Streaming XML parsing with `node-expat` (memory efficient)
- Automatic gzip decompression (detected by content-encoding, content-type, or `.gz` extension)
- Content-type validation (rejects HTML responses)

#### robots.txt Parsing

##### `parseRobotsTxt(url: string, options?): Promise<Robot>`

Fetches and parses a robots.txt file using the `robots-parser` library.

```typescript
const robots = await Web.parseRobotsTxt('https://example.com/robots.txt', {
  timeout: 10000,
});
// robots.isAllowed('https://example.com/page')  → true/false
// robots.getSitemaps()                           → ['https://example.com/sitemap.xml']
```

#### Web Crawling

##### `crawl(originURL: string, options?: CrawlOptions): Promise<CrawlResult>`

Crawls a website starting from an origin URL using either sitemap-based or HTTP-based discovery.

```typescript
const result = await Web.crawl('https://www.adobe.com', {
  strategy: 'sitemaps',          // 'sitemaps' | 'http'
  workers: 4,
  timeout: 30000,
  limit: 100,
  inclusionPatterns: ['*/blog/*'],
  exclusionPatterns: ['*/archive/*'],
  sameDomain: true,
  keepHash: false,
  logger: myLogger,
  urlStreamFn: (urls) => {
    console.log(`Found ${urls.length} URLs`);
  },
});
```

**`CrawlOptions`:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strategy` | `'sitemaps' \| 'http'` | `'sitemaps'` | Crawl strategy |
| `workers` | `number` | `1` | Concurrent queue workers |
| `timeout` | `number` | `10000` | Request timeout (ms) |
| `userAgent` | `string` | `null` | Custom User-Agent header |
| `inclusionPatterns` | `string[]` | `[]` | Glob patterns for URL inclusion |
| `exclusionPatterns` | `string[]` | `[]` | Glob patterns for URL exclusion |
| `limit` | `number` | `-1` | Max URLs to collect (-1 = unlimited) |
| `sameDomain` | `boolean` | `true` | Only collect same-domain URLs |
| `keepHash` | `boolean` | `true` | Preserve URL hash fragments |
| `logger` | `Logger` | `console` | Logger instance |
| `urlStreamFn` | `function` | — | Callback receiving batches of qualified URLs |
| `httpHeaders` | `Record<string, string>` | — | Custom HTTP headers |

**`CrawlResult`:**
```typescript
{
  originURL: string,
  crawlOptions: CrawlOptions,
  errors: object[],
  urls: { total: number, valid: number },
  robotstxt: Robot | null,
  sitemaps: string[],
  languages: string[],
}
```

**`URLExtended`** (individual URL result):
```typescript
{
  url: string,
  origin: string,
  status: 'unknown' | 'excluded' | 'valid' | 'error',
  level1: string,      // First path segment
  level2: string,      // Second path segment
  level3: string,      // Third path segment
  filename: string,    // Last path segment
  search: string,      // Query string
  lang?: string,       // Detected language (IETF tag)
  message?: string,    // Status explanation
}
```

##### `qualifyURLsForCrawl(urls, options): URLExtended[]`

Validates and qualifies a batch of URLs against patterns and domain rules.

---

### Time Module

Import: `import { Time } from 'franklin-bulk-shared';`

##### `sleep(time?: number): Promise<void>`

Async delay. Default: 1000ms.

```typescript
await Time.sleep(2000); // wait 2 seconds
```

##### `randomSleep(min?: number, max?: number): Promise<void>`

Random async delay between `min` and `max` ms. Defaults: 1000–2000ms.

```typescript
await Time.randomSleep(500, 1500); // wait 500–1500ms randomly
```

**Validation:** Rejects if `min` and `max` are both 0, or if `max < min`.

---

### FS Module

Import: `import { FS } from 'franklin-bulk-shared';`

##### `sanitizeForFS(s: string): string`

Converts a string into a filesystem-safe filename (lowercase, non-alphanumeric chars replaced with `_`).

```typescript
FS.sanitizeForFS('Hello World!');  // → 'hello_world_'
FS.sanitizeForFS('example.com');   // → 'example_com'
```

##### `computeFSDetailsFromUrl(url: string): Object`

Parses a URL and extracts filesystem-compatible path components.

```typescript
FS.computeFSDetailsFromUrl('https://example.com/api/data.json');
// → { hostname: 'example_com', path: '/api', filename: 'data', extension: '.json' }

FS.computeFSDetailsFromUrl('https://example.com/');
// → { hostname: 'example_com', path: '/', filename: 'index', extension: '' }
```

---

### Fetch (Internal)

`src/fetch.ts` — Not directly exported from the top-level entry point, but used internally.

##### `fetchWithRetryAbort(url: string, logger: Logger, options?: RequestInit): Promise<Response>`

HTTP fetch with automatic retry on timeout (AbortError) and configurable timeout duration.

- **Max retries:** 2
- **Default timeout:** 10,000ms
- **Backoff:** Exponential — `((attempt + 1)^2) * 1000` ms (1s, 4s)
- **Retry trigger:** Only on timeout/abort errors

---

### Logger (Internal)

`src/logger.ts` — Used throughout the library for consistent logging.

##### `Logger` (Interface)

```typescript
interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  silly(...args: any[]): void;
}
```

The default `logger` export maps to `console` methods (`silly` maps to `console.debug`).

---

## Step Pipeline

The step pipeline is a **middleware-based architecture** for composing browser automation workflows. Each step is a higher-order function that wraps the next action in the chain.

### Pattern

```typescript
function myStep(options) {
  return (action) => async (params) => {
    try {
      // 1. Execute previous action/step
      const newParams = await action(params);

      // 2. Check if previous step failed
      if (newParams.result && !newParams.result.passed) {
        params.logger.warn('Previous action failed, skipping.');
        return newParams;
      }

      // 3. Perform this step's work
      // ...

    } catch (e) {
      params.logger.error('Step error:', e);
      params.result = { passed: false, error: e };
    } finally {
      return params;
    }
  };
}
```

### Composition

Steps are composed inside-out. Given `[step1, step2, step3]`, the execution wraps as:

```
step3( step2( step1( mainBrowserAction ) ) )(params)
```

Execution order:
1. `mainBrowserAction` — navigate to URL
2. `step1` processes after navigation
3. `step2` processes after step1
4. `step3` processes after step2

### Example: Full Workflow

```typescript
import { Puppeteer } from 'franklin-bulk-shared';

const [browser, page] = await Puppeteer.initBrowser();

const result = await Puppeteer.runStepsSequence(
  page,
  'https://www.example.com',
  [
    Puppeteer.Steps.smartScroll({ postReset: true }),
    Puppeteer.Steps.postLoadWait(2000),
    Puppeteer.Steps.fullPageScreenshot({ outputFolder: './output/screenshots' }),
    Puppeteer.Steps.webConsoleMessages({ outputFolder: './output/console' }),
    Puppeteer.Steps.runLighthouseCheck(),
  ],
  console, // logger
);

console.log('Passed:', result.passed);
console.log('Lighthouse scores:', result.lighthouse?.scores);

await browser.close();
```

---

## CSS & Font Extraction

The `Puppeteer.CSS` module provides powerful CSS analysis capabilities specifically designed for **AEM Edge Delivery Services boilerplate generation**.

### Minimal CSS Computation

Compares the current page's computed styles against the browser's default styles and produces a minimal CSS ruleset containing only the overridden properties.

**Excluded properties** (45+): color, size, webkit-specific, animation, transition, etc.
**Excluded values**: `initial`, `auto`, `none`, `normal`, `0px`, `0`, `rgba(0,0,0,0)`

### Font Detection

1. Intercepts font requests via Chrome DevTools Protocol (CDP)
2. Listens to `CSS.fontsUpdated` events
3. Detects body and heading fonts by **frequency analysis** (most-used font families)
4. Supports both **base64-embedded** and **HTTP-fetched** fonts
5. Computes font fallbacks using the `fontpie-calc` library
6. Generates complete `@font-face` declarations

### Default Tags Analyzed

`html`, `body`, `h1`–`h6`, `a`, `button`, `img`, `p`, `span`, `b`, `strong`

---

## Web Crawling

### Strategies

| Strategy | How it works | Best for |
|----------|-------------|----------|
| **Sitemaps** (default) | Fetches `robots.txt` → extracts sitemaps → parses XML sitemap files | Sites with well-maintained sitemaps |
| **HTTP** | Fetches HTML pages → extracts links → follows discovered URLs | Sites without sitemaps or for deep crawling |

### Crawl Process (Sitemaps Strategy)

1. **Discovery**: Fetch `robots.txt` → extract `Sitemap:` directives
2. **Fallback**: If no sitemaps found, try `/sitemap.xml`
3. **Parsing**: Stream-parse each sitemap XML (supports nested sitemaps and gzip)
4. **Qualification**: Validate URLs, apply inclusion/exclusion patterns, detect language
5. **Streaming**: Emit qualified URLs via `urlStreamFn` callback
6. **Limits**: Stop when `limit` is reached or all sources exhausted

### URL Qualification Pipeline

For each discovered URL:
1. Validate with `isValidHTTP()`
2. Enforce same-domain if `sameDomain: true`
3. Apply inclusion patterns (glob matching via `matcher`)
4. Apply exclusion patterns
5. Strip hash fragments if `keepHash: false`
6. Detect language from URL path using IETF data
7. Extract path segments (level1, level2, level3, filename)
8. Assign status: `valid`, `excluded`, `error`, or `unknown`

---

## Configuration & Build

### TypeScript

| Setting | Value |
|---------|-------|
| Target | ES2022 |
| Module | ESNext |
| Output | `dist/` |
| Source maps | Enabled |
| Declarations | Enabled |
| Strict mode | Disabled |
| ESM interop | Enabled |

### ESLint

- Extends **Adobe Helix** ESLint config + TypeScript recommended rules
- Enforces Unix line endings
- Requires `.js` import extensions (ESM convention)
- Allows named exports (no default export preference)
- TypeScript `@ts-ignore` allowed with warnings

### Build Commands

```bash
npm run build       # TypeScript compilation
npm run watch       # Watch mode compilation
npm run lint        # Lint all files
npm run lint-ts     # Lint TypeScript files only
npm run test        # Run Jest tests
```

---

## CI/CD Pipeline

### Branch Workflow (`.github/workflows/branch.yml`)

**Trigger:** Push to any branch except `main`

| Step | Command |
|------|---------|
| Checkout | `actions/checkout@v4` |
| Setup Node | 20.x |
| Install | `npm install` |
| Lint | `npm run lint` |
| Test | `npm run test` |

### Release Workflow (`.github/workflows/release.yml`)

**Trigger:** Push to `main` (skips `[skip ci]` commits)

**Job 1 — Build:** Same as branch workflow (lint + test)

**Job 2 — Release** (depends on build):
1. Clean install (`npm ci`)
2. Run `semantic-release` which:
   - Analyzes commits for version bump (patch/minor/major)
   - Generates release notes
   - Updates `CHANGELOG.md`
   - Publishes to npm
   - Commits updated `package.json`, `package-lock.json`, `CHANGELOG.md`
   - Creates GitHub release

**Secrets used:** `GITHUB_TOKEN`, `NPM_TOKEN`

---

## Testing

### Framework

- **Jest** with **ts-jest** for TypeScript support
- **ES Module** mode enabled
- **V8** coverage provider
- Coverage collected in `coverage/` directory

### Test Suites

| File | Module Tested | Key Test Cases |
|------|--------------|----------------|
| `test/fs.spec.ts` | `FS` | `sanitizeForFS` string sanitization, `computeFSDetailsFromUrl` URL parsing, error handling for invalid URLs |
| `test/web/url.spec.ts` | `Web.URL` | `isValid` protocol filtering, `isValidHTTP` HTTP-only validation, `getLanguageFromURL` language extraction |
| `test/web/html.test.ts` | `Web.HTML` | `rewriteLinksRelative` absolute-to-relative conversion, `extractLinks` link extraction with media filtering |

### Running Tests

```bash
npm run test           # Run all tests
npm run test -- --coverage  # Run with coverage report
```

---

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer-core` | 23.11.1 | Headless Chrome automation |
| `puppeteer-cluster` | 0.25.0 | Multi-browser concurrency |
| `puppeteer-extra` | 3.3.6 | Plugin system for Puppeteer |
| `puppeteer-extra-plugin-stealth` | 2.11.2 | Anti-bot-detection |
| `puppeteer-intercept-and-modify-requests` | 1.3.1 | Request interception |
| `@sparticuz/chromium-min` | ^131.0.0 | Minimal Chromium binary |
| `chrome-paths` | ^1.0.1 | Find Chrome installation |
| `@ghostery/adblocker-puppeteer` | 2.14.1 | Ad and tracker blocking |
| `lighthouse` | 12.8.2 | Performance auditing |
| `fontpie-calc` | 0.2.0 | Font fallback computation |
| `fastq` | ^1.17.1 | Fast work queue |
| `fetch-retry` | ^6.0.0 | Fetch with retry logic |
| `matcher` | ^5.0.0 | Glob pattern matching |
| `node-expat` | ^2.4.1 | Streaming XML parser |
| `robots-parser` | 3.0.1 | robots.txt parser |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `ts-jest` / `jest` / `@jest/globals` | Testing |
| `eslint` + Adobe Helix config | Linting |
| `semantic-release` + plugins | Automated versioning & publishing |

---

## Dependency Management

Dependencies are managed via **Renovate** with the following rules:

- **Patch/minor updates:** Auto-merged on Saturdays after 2 PM
- **Major updates:** Require manual review, scheduled Mondays after 2 PM
- **ESLint:** Pinned to 8.57.0 (Adobe Helix doesn't support v9)
- **semantic-release:** Minimum version 23.0
