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

/* eslint import/no-unresolved: "off" */
/* eslint "@typescript-eslint/no-explicit-any": "off" */
/* TODO - eslint is complaining even though the import works at runtime */

import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import zlib from 'zlib';

export type Sitemap = {
  url: string;
  sitemaps?: Sitemap[];
  lastMod?: string;
  urls?: string[];
};

// parse a text string into an XML DOM object
function parseXMLSitemap(sitemapContent) {
  const options = {
    ignoreAttributes: false,
  };

  const parser = new XMLParser(options);
  const jsonObj = parser.parse(sitemapContent);

  return jsonObj;
}

export async function parseSitemapFromUrl(
  url: string,
  options: { timeout?: number, signal?: any, httpHeaders?: Record<string, string> } = {},
): Promise<Sitemap> {
  try {
    let sitemapRaw;

    const reqOptions: any = {
      timeout: {
        request: options.timeout || 10000,
      },
      // responseType: 'text',
      headers: {},
    };
    if (options.httpHeaders) {
      reqOptions.headers = options.httpHeaders;
    }
    if (options.signal) {
      reqOptions.signal = options.signal;
    }

    if (path.extname(url) === '.gz') {
      // unzip if needed
      let response;

      try {
        reqOptions.responseType = 'buffer';
        response = await fetch(url, reqOptions);

        if (!response.ok) {
          throw new Error(`parseSitemapFromUrl (${url}): ${response.status} ${response.statusText}`);
        }

        sitemapRaw = zlib.gunzipSync((await response.text())).toString();
      } catch {
        sitemapRaw = response.body;
      }
    } else {
      const response = await fetch(url, reqOptions);

      if (!response.ok) {
        throw new Error(`parseSitemapFromUrl (${url}): ${response.status} ${response.statusText}`);
      }

      sitemapRaw = await response.text();
    }

    const sitemapObject = parseXMLSitemap(sitemapRaw);

    let sitemaps = [];
    if (sitemapObject.sitemapindex?.sitemap) {
      if (Array.isArray(sitemapObject.sitemapindex.sitemap)) {
        sitemaps = sitemapObject.sitemapindex.sitemap;
      } else {
        sitemaps = [sitemapObject.sitemapindex.sitemap];
      }
      sitemaps = sitemaps.map((element) => ({
        url: element.loc,
        lastMod: element.lastmod,
      }));
    }

    let urls = [];
    if (sitemapObject.urlset?.url) {
      if (Array.isArray(sitemapObject.urlset.url)) {
        urls = sitemapObject.urlset.url;
      } else {
        urls = [sitemapObject.urlset.url];
      }
    }
    urls = urls.map((element) => ({
      url: element.loc,
      lastMod: element.lastmod,
    }));

    return { url, sitemaps, urls };
  } catch (e) {
    throw new Error(`parseSitemapFromUrl (${url}): ${e.cause || e.message}`);
  }
}
