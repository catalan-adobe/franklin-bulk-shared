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
import { gzipSync } from 'zlib';
import { Readable } from 'stream';
import {
  describe, expect, test, jest, beforeEach,
} from '@jest/globals';
import { parseSitemapFromUrl } from '../../src/web/sitemap.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHeaders(map: Record<string, string>) {
  return { get: (k: string) => map[k] ?? null };
}

// node:stream/web ReadableStream is type-incompatible with the global one;
// cast via unknown so the mock Response types line up.
function toWebStream(readable: Readable): ReadableStream {
  return Readable.toWeb(readable) as unknown as ReadableStream;
}

function bodyFromString(xml: string): ReadableStream {
  return toWebStream(Readable.from([Buffer.from(xml)]));
}

function bodyFromBuffer(buf: Buffer): ReadableStream {
  return toWebStream(Readable.from([buf]));
}

/** Split a string into N roughly equal byte-level chunks to simulate streaming.
 * Converts to a Buffer first so multi-byte UTF-8 characters can be split
 * at arbitrary byte boundaries, not just at code-point boundaries.
 */
function bodyFromChunks(xml: string, chunkSize = 20): ReadableStream {
  const bytes = Buffer.from(xml);
  const chunks: Buffer[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.subarray(i, i + chunkSize));
  }
  return toWebStream(Readable.from(chunks));
}

function mockFetch(body: ReadableStream, headers: Record<string, string> = {}) {
  return jest.fn<typeof fetch>().mockResolvedValue({
    ok: true,
    status: 200,
    headers: makeHeaders(headers),
    body,
  } as unknown as Response);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseSitemapFromUrl', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  // --- URL sitemap ----------------------------------------------------------

  test('parses a plain URL sitemap', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/page-1</loc></url>
  <url><loc>https://example.com/page-2</loc></url>
</urlset>`;
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml');

    expect(result.urls).toEqual(['https://example.com/page-1', 'https://example.com/page-2']);
    expect(result.sitemaps).toEqual([]);
  });

  // --- Sitemap index --------------------------------------------------------

  test('parses a sitemap index', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemap-en.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemap-fr.xml</loc></sitemap>
</sitemapindex>`;
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    const result = await parseSitemapFromUrl('https://example.com/sitemap-index.xml');

    expect(result.sitemaps).toEqual([
      'https://example.com/sitemap-en.xml',
      'https://example.com/sitemap-fr.xml',
    ]);
    expect(result.urls).toEqual([]);
  });

  // --- Multi-chunk streaming ------------------------------------------------

  test('accumulates <loc> text split across stream chunks', async () => {
    // The long URL will be split across multiple 20-byte chunks,
    // exercising the currentLoc += text accumulation in ontext.
    const longUrl = 'https://example.com/a/very/long/path/that/spans/multiple/chunks';
    const xml = `<urlset><url><loc>${longUrl}</loc></url></urlset>`;
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      mockFetch(bodyFromChunks(xml, 20)),
    );

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml');

    expect(result.urls).toEqual([longUrl]);
  });

  // --- Gzip by Content-Encoding --------------------------------------------

  test('decompresses gzipped content (Content-Encoding: gzip)', async () => {
    const xml = '<urlset><url><loc>https://example.com/gz-page</loc></url></urlset>';
    const compressed = gzipSync(Buffer.from(xml));
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(
      bodyFromBuffer(compressed),
      { 'content-encoding': 'gzip', 'content-type': 'application/gzip' },
    ));

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml.gz');

    expect(result.urls).toEqual(['https://example.com/gz-page']);
  });

  // --- Gzip by URL suffix --------------------------------------------------

  test('decompresses gzipped content detected by .gz URL suffix', async () => {
    const xml = '<urlset><url><loc>https://example.com/suffix-page</loc></url></urlset>';
    const compressed = gzipSync(Buffer.from(xml));
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(
      bodyFromBuffer(compressed),
      { 'content-type': 'application/octet-stream' },
    ));

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml.gz');

    expect(result.urls).toEqual(['https://example.com/suffix-page']);
  });

  // --- Error: non-ok response ----------------------------------------------

  test('throws on non-ok HTTP response', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      headers: makeHeaders({}),
      body: null,
    } as unknown as Response);

    await expect(parseSitemapFromUrl('https://example.com/missing.xml'))
      .rejects.toThrow('404');
  });

  // --- Error: HTML content-type --------------------------------------------

  test('throws when response is HTML instead of XML', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: makeHeaders({ 'content-type': 'text/html; charset=utf-8' }),
      body: bodyFromString('<html></html>'),
    } as unknown as Response);

    await expect(parseSitemapFromUrl('https://example.com/sitemap.xml'))
      .rejects.toThrow('text/html');
  });

  // --- Error: network failure ----------------------------------------------

  test('throws on fetch network error', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network timeout'));

    await expect(parseSitemapFromUrl('https://example.com/sitemap.xml'))
      .rejects.toThrow('network timeout');
  });

  // --- Return shape --------------------------------------------------------

  test('result always includes the requested url', async () => {
    const xml = '<urlset></urlset>';
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml');

    expect(result.url).toBe('https://example.com/sitemap.xml');
    expect(result.urls).toEqual([]);
    expect(result.sitemaps).toEqual([]);
  });

  // --- CDATA locations ---------------------------------------------------

  test('parses <loc> wrapped in CDATA', async () => {
    const xml = '<urlset><url><loc><![CDATA[https://example.com/?a=1&b=2]]></loc></url></urlset>';
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml');

    expect(result.urls).toEqual(['https://example.com/?a=1&b=2']);
  });

  // --- Multi-byte UTF-8 split across chunks --------------------------------

  test('correctly decodes non-ASCII URLs split across stream chunks', async () => {
    const url = 'https://example.com/café/résumé';
    const xml = `<urlset><url><loc>${url}</loc></url></urlset>`;
    // Use a 1-byte chunk size to guarantee every multi-byte character is split
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      mockFetch(bodyFromChunks(xml, 1)),
    );

    const result = await parseSitemapFromUrl('https://example.com/sitemap.xml');

    expect(result.urls).toEqual([url]);
  });

  // --- Invalid UTF-8 -------------------------------------------------------

  test('throws on invalid UTF-8 bytes in the response body', async () => {
    // 0xFF is never valid in UTF-8; fatal decoder must reject it.
    const invalid = Buffer.concat([
      Buffer.from('<urlset><url><loc>https://example.com/'),
      Buffer.from([0xFF]),
      Buffer.from('</loc></url></urlset>'),
    ]);
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      mockFetch(bodyFromBuffer(invalid)),
    );

    await expect(parseSitemapFromUrl('https://example.com/sitemap.xml'))
      .rejects.toThrow();
  });

  // --- Truncated XML -------------------------------------------------------

  test('throws on truncated XML (loc tag not closed)', async () => {
    const xml = '<urlset><url><loc>https://example.com/x';
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    await expect(parseSitemapFromUrl('https://example.com/sitemap.xml'))
      .rejects.toThrow();
  });

  // --- SAX parse error ---------------------------------------------------

  test('throws on malformed XML', async () => {
    // Mismatched closing tag — sax strict mode fires onerror then re-raises
    const xml = '<urlset><url><loc>https://example.com/good</loc></url></bad>';
    jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch(bodyFromString(xml)));

    await expect(parseSitemapFromUrl('https://example.com/sitemap.xml'))
      .rejects.toThrow('parseSitemapFromUrl');
  });

  // --- httpHeaders forwarded -----------------------------------------------

  test('forwards custom httpHeaders to fetch', async () => {
    const xml = '<urlset></urlset>';
    const fetchMock = mockFetch(bodyFromString(xml));
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);

    await parseSitemapFromUrl('https://example.com/sitemap.xml', {
      httpHeaders: { Authorization: 'Bearer token123' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/sitemap.xml',
      expect.objectContaining({ headers: { Authorization: 'Bearer token123' } }),
    );
  });
});
