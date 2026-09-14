/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Mock heavy native/ESM deps before any import
jest.mock('robots-parser', () => ({ default: jest.fn() }));
jest.mock('../../src/web/sitemap.js', () => ({ Sitemap: class {} }));
jest.mock('../../index.js', () => ({
  Web: { getLanguageFromURL: () => '', extractLinks: () => [] },
}));

import { describe, expect, jest, test } from '@jest/globals';
import { qualifyURLsForCrawl } from '../../src/web/crawl';

const BASE = 'https://example.com';

describe('qualifyURLsForCrawl — Bug 1: inclusion patterns ORed, not ANDed', () => {
  const urlPatterns = [
    { pattern: '/en/international/**', expect: true },
    { pattern: '/en/international.html', expect: true },
  ];

  test('URL matching first inclusion pattern is valid', () => {
    const results = qualifyURLsForCrawl(
      [`${BASE}/en/international/home.html`],
      { baseURL: BASE, origin: BASE, urlPatterns, sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('valid');
  });

  test('URL matching second inclusion pattern is valid', () => {
    const results = qualifyURLsForCrawl(
      [`${BASE}/en/international.html`],
      { baseURL: BASE, origin: BASE, urlPatterns, sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('valid');
  });

  test('URL matching neither inclusion pattern is excluded', () => {
    const results = qualifyURLsForCrawl(
      [`${BASE}/en/other.html`],
      { baseURL: BASE, origin: BASE, urlPatterns, sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('excluded');
  });

  test('exclusion pattern still excludes URLs even when an inclusion matches', () => {
    const mixed = [
      { pattern: '/en/international/**', expect: true },
      { pattern: '/en/international/blocked.html', expect: false },
    ];
    const results = qualifyURLsForCrawl(
      [`${BASE}/en/international/blocked.html`],
      { baseURL: BASE, origin: BASE, urlPatterns: mixed, sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('excluded');
  });
});

describe('qualifyURLsForCrawl — Bug 2: object inputs treated as invalid URLs', () => {
  test('plain URL strings are qualified correctly', () => {
    const results = qualifyURLsForCrawl(
      [`${BASE}/en/page.html`],
      { baseURL: BASE, origin: BASE, urlPatterns: [], sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('valid');
    expect(results[0].url).toBe(`${BASE}/en/page.html`);
  });

  test('object inputs (the pre-fix bug) must not produce valid status', () => {
    const obj = { url: `${BASE}/en/page.html`, origin: BASE } as unknown as string;
    const results = qualifyURLsForCrawl(
      [obj],
      { baseURL: BASE, origin: BASE, urlPatterns: [], sameDomain: true, keepHash: false },
    );
    expect(results[0].status).not.toBe('valid');
  });
});

describe('qualifyURLsForCrawl — Bug 3: no patterns means all same-domain URLs valid', () => {
  test('no urlPatterns: same-domain URL is valid', () => {
    const results = qualifyURLsForCrawl(
      [`${BASE}/page.html`],
      { baseURL: BASE, origin: BASE, urlPatterns: [], sameDomain: true, keepHash: false },
    );
    expect(results[0].status).toBe('valid');
  });
});
