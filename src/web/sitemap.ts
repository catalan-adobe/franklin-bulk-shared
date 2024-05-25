/* eslint import/no-unresolved: "off" */
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
  options: { timeout?: number } = {},
): Promise<Sitemap> {
  try {
    let sitemapRaw;

    const reqOptions = {
      timeout: {
        request: options.timeout || 10000,
      },
      responseType: 'text',
    };

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
      } catch (e) {
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

    const sitemaps = sitemapObject.sitemapindex?.sitemap?.map((element) => ({
      url: element.loc,
      lastMod: element.lastmod,
    }));

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
    throw new Error(`parseSitemapFromUrl (${url}): ${e}`);
  }
}
