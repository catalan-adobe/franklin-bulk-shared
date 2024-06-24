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

/**
 * Rewrites the links in the HTML to be relative to the specified host.
 * (borrowed from https://github.com/adobe/helix-cli/blob/main/src/server/utils.js)
 * @param html - The HTML content to rewrite.
 * @param host - The host to make the links relative to.
 * @returns The HTML content with rewritten relative links.
 */
export function rewriteLinksRelative(html: string, host: string): string {
  const hostPattern = host.replaceAll('.', '\\.');
  const re = new RegExp(`(src|href)\\s*=\\s*(["'])${hostPattern}(/.*?)?(['"])`, 'gm');
  return html.replaceAll(re, (match, arg, q1, value, q2) => (`${arg}=${q1}${value || '/'}${q2}`));
}

export function extractLinks(html: string, host: string): string[] {
  const hostPattern = host.replaceAll('.', '\\.');
  const re = new RegExp(`(?:href)\\s*=\\s*["']((?=${hostPattern}|/[a-zA-Z0-9]+).*?)['"]`, 'gm');
  const links = [];
  let match;
  /* eslint-disable no-cond-assign */
  while ((match = re.exec(html)) !== null) {
    const m = match[1];
    if (!['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'css', 'js', 'json', 'xml', 'txt', 'ttf', 'pdf'].some((ext) => m.endsWith(ext))) {
      links.push(m);
    }
  }
  return [...new Set(links)];
}
