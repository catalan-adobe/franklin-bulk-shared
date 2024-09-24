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
import { describe, expect, test } from '@jest/globals';
import { extractLinks, rewriteLinksRelative } from '../../src/web/html';

describe('rewriteLinksRelative', () => {
  test('should rewrite relative links to be relative to the specified host', () => {
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="https://my-host.com/styles/main.css">
        </head>
        <body>
          <img src="https://my-host.com/images/logo.png" alt="Logo">
          <a href="https://my-host.com/about">About</a>
          <a href="https://my-host.com">Home</a>
        </body>
      </html>
    `;
    const host = 'https://my-host.com';
    const expected = `
      <html>
        <head>
          <link rel="stylesheet" href="/styles/main.css">
        </head>
        <body>
          <img src="/images/logo.png" alt="Logo">
          <a href="/about">About</a>
          <a href="/">Home</a>
        </body>
      </html>
    `;
    expect(rewriteLinksRelative(html, host)).toBe(expected);
  });

  test('should not rewrite links that are already relative to the specified host', () => {
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="/styles/main.css">
        </head>
        <body>
          <img src="/images/logo.png" alt="Logo">
          <a href="/about">About</a>
          <a href="/">Home</a>
        </body>
      </html>
    `;
    const host = 'https://my-host.com';
    expect(rewriteLinksRelative(html, host)).toBe(html);
  });

  test('should handle links with query parameters', () => {
    const html = `
      <html>
        <body>
          <img src="https://my-host.com/images/logo.png?size=small" alt="Logo">
          <a href="https://my-host.com/about?lang=en">About</a>
        </body>
      </html>
    `;
    const host = 'https://my-host.com';
    const expected = `
      <html>
        <body>
          <img src="/images/logo.png?size=small" alt="Logo">
          <a href="/about?lang=en">About</a>
        </body>
      </html>
    `;
    expect(rewriteLinksRelative(html, host)).toBe(expected);
  });
});

describe('extractLinks', () => {
  test('should extract all relative links and the ones specifc to the given host (href only + only potential html)', () => {
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="https://my-host.com/styles/main.css">
        </head>
        <body>
          <img src="https://my-host.com/images/logo.png" alt="Logo">
          <a href="/about">About</a>
          <a href="https://my-host.com">Home</a>
        </body>
      </html>
    `;
    const host = 'https://my-host.com';
    const expected = [
      '/about',
      'https://my-host.com',
    ];
    const a = extractLinks(html, host);
    expect(a).toStrictEqual(expected);
  });

  test('should not extract unrelated links', () => {
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="https://www.example.com/styles/main.css">
        </head>
        <body>
          <img src="mailto: user@host.com" alt="Logo">
          <a href="//weird-link">About</a>
        </body>
      </html>
    `;
    const host = 'https://my-host.com';
    const expected = [];
    expect(extractLinks(html, host)).toStrictEqual(expected);
  });
});
