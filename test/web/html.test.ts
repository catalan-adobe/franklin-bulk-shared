import { describe, expect, test } from '@jest/globals';
import { rewriteLinksRelative } from '../../src/web/html';

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
