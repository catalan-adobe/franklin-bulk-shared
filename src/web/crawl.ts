/* eslint "@typescript-eslint/no-explicit-any": "off" */

import { Robot } from 'robots-parser';
import fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { isMatch } from 'matcher';
import path from 'path';
import { Web, Url } from '../../index.js';
import { Sitemap } from './sitemap.js';
import { Logger } from '../logger.js';

/**
 * types
 */

/**
 * @typedef CrawlOptions
 * @property {number} [timeout] - The timeout for the crawl operation (in ms).
 * @property {string} [userAgent] - The user agent to use for the crawl operation.
 */
type CrawlOptions = {
  timeout?: number;
  userAgent?: string;
  originURLObj?: URL;
  inclusionPatterns?: string[];
  exclusionPatterns?: string[];
  limit?: number;
  sameDomain?: boolean;
  keepHash?: boolean;
  logger?: Logger;
};

type CrawlResult = {
  originURL: string,
  crawlOptions: CrawlOptions,
  errors: object[],
  urls: URLExtended[],
  invalidURLs: object[],
  robotstxt: Robot | null,
  sitemaps: string[],
};

type URLExtended = {
  url: string,
  origin: string,
  status: string,
  level1: string,
  level2: string,
  level3: string,
  filename: string,
  search: string,
  message?: string,
};

type URLPattern = {
  pattern: string,
  expect: boolean,
};

/**
 * Represents a task for crawling a URL.
 */
type Task = {
  url: string,
  retries: number,
};

/**
 * Default crawl options.
 * @type {CrawlOptions}
 * @constant
 * @default
 * @description Default crawl options.
 * @property {number} timeout - The default timeout for the crawl operation (in ms).
 * @default 10000
 * @property {string} userAgent - The default user agent to use for the crawl operation.
 * @default null
 */
const DefaultCrawlOptions: CrawlOptions = {
  timeout: 10000,
  userAgent: null,
  originURLObj: null,
  inclusionPatterns: [],
  exclusionPatterns: [],
  limit: -1,
  sameDomain: true,
  keepHash: true,
  logger: console,
};

/**
 * functions
 */

async function collectSitemapsToCrawl(
  originURL: string,
  options: CrawlOptions,
): Promise<any> {
  const result = {
    robotstxt: null,
    sitemaps: [],
  };

  if (path.basename(options.originURLObj.pathname).indexOf('.xml') > -1) {
    result.sitemaps.push(originURL);
  } else {
    // try robots.txt
    try {
      const r: Robot = await Web.parseRobotsTxt(`${options.originURLObj.origin}/robots.txt`, options);
      options.logger.debug(r);
      /* eslint-disable @typescript-eslint/dot-notation */
      result.robotstxt = r['raw'];
      result.sitemaps = r.getSitemaps();
      result.sitemaps.push(...r.getSitemaps());
    } catch (e) {
      options.logger.debug(`no robots.txt found for origin URL ${originURL}`);
    }

    // try default sitemap.xml
    const defaultSitemapURL = `${options.originURLObj.origin}/sitemap.xml`;
    if (!result.sitemaps.find((s) => s === defaultSitemapURL)) {
      result.sitemaps.push(defaultSitemapURL);
    }
  }

  return result;
}

async function crawlWorker({
  // payload
  url,
  retries,
}) {
  /* eslint-disable no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    const result = {
      url,
      status: 'unknown',
      retries,
      error: null,
      sitemaps: [],
      urls: [],
    };

    try {
      // options.logger.debug(`crawling sitemap ${sitemap}`);
      const s: Sitemap = await Web.parseSitemapFromUrl(url, {
        timeout: this.timeout,
      });

      if (s.urls && s.urls.length > 0) {
        result.urls = s.urls;
      }
      if (s.sitemaps && s.sitemaps.length > 0) {
        result.sitemaps.push(...s.sitemaps.map((o) => o.url));
      }
      result.status = 'done';

      resolve(result);
    } catch (e) {
      // result.status = 'error';
      // result.error = e;
      e.url = url;
      reject(e);
    }
  });
}

function qualifyURLsForCrawl(urls, {
  baseURL,
  origin,
  urlPatterns,
  sameDomain = true,
  keepHash = false,
}): URLExtended[] {
  return urls
    .concat(urls.reduce(
      // for urls with query or hash, concatenate the origin + pathname url to the list
      // of urls to qualify and crawl
      (acc, val) => {
        try {
          const u = new URL(val);
          if (u.search !== '' || u.hash !== '') {
            acc.push(`${u.origin}${u.pathname}`);
          }
        } catch (e) {
          // nothing
        }
        return acc;
      },
      [],
    )).map((url) => {
      const urlExt: URLExtended = {
        url,
        origin,
        status: 'unknown',
        level1: '',
        level2: '',
        level3: '',
        filename: '',
        search: '',
        message: '',
      };

      const u = Url.isValidHTTP(url);
      let ext = '';

      if (!keepHash && u) {
        urlExt.url = `${u.origin}${u.pathname}${u.search}`;
        ext = path.parse(`${u.origin}${u.pathname}` || '').ext;
      }

      if (!u) {
        urlExt.status = 'excluded';
        urlExt.message = 'invalid url';
      } else if (sameDomain && !urlExt.url.startsWith(baseURL)) {
        urlExt.status = 'excluded';
        urlExt.message = `not same origin as base URL ${baseURL}`;
      } else if ((ext !== '' && !ext.includes('htm'))) {
        urlExt.status = 'excluded';
        urlExt.message = 'not an html page';
      } else {
        const excludedFromURLPatterns = urlPatterns.find(
          (pat) => !(isMatch(`${u.pathname}${u.search}`, pat.pattern) === pat.expect),
        );
        if (excludedFromURLPatterns) {
          const message = excludedFromURLPatterns.expect
            ? `does not match any including filter ${urlPatterns.filter((f) => f.expect).map((f) => f.pattern).join(', ')}`
            : `matches excluding filter ${excludedFromURLPatterns.pattern}`;
          urlExt.status = 'excluded';
          urlExt.message = message;
        } else {
          const { pathname, search } = u;
          const levels = pathname.split('/');
          const filename = levels.pop();
          while (levels.length < 4) {
            levels.push('');
          }
          [urlExt.level1, urlExt.level2, urlExt.level3] = levels.slice(1);
          urlExt.filename = filename;
          urlExt.search = search;
          urlExt.status = 'valid';
        }
      }

      return urlExt;
    });
}

/**
 * exports
 */

/**
 * Crawl a website and return a list of URLs.
 * @param originURL string
 * @param options CrawlOptions
 * @returns string[]
 */
export async function crawl(
  originURL: string,
  options: CrawlOptions = DefaultCrawlOptions,
): Promise<CrawlResult> {
  const crawlOptions = { ...DefaultCrawlOptions, ...options };
  const foundURLs: URLExtended[] = [];
  const crawlResult: CrawlResult = {
    originURL,
    crawlOptions,
    errors: [],
    urls: foundURLs,
    invalidURLs: [],
    robotstxt: null,
    sitemaps: [],
  };

  try {
    const url = Url.isValidHTTP(originURL);

    if (!url) {
      throw new Error(`Invalid origin URL (${originURL})`);
    }

    crawlOptions.originURLObj = url;

    const sources = await collectSitemapsToCrawl(originURL, crawlOptions);
    crawlOptions.logger.debug(`found ${sources.sitemaps.length} sitemap(s) to crawl`);
    crawlResult.robotstxt = sources.robotstxt;
    crawlResult.sitemaps = sources.sitemaps;

    // init url patterns
    const urlPatterns: URLPattern[] = crawlOptions.inclusionPatterns.map((pattern) => ({
      pattern,
      expect: true,
    })).concat(crawlOptions.exclusionPatterns.map((pattern) => ({
      pattern,
      expect: false,
    })));

    // init queue
    const queue: queueAsPromised<Task> = fastq.promise(
      {
        crawlOptions,
      },
      crawlWorker,
      5,
    );
    // force pause - no autostart
    await queue.pause();

    const monitorInt = setInterval(() => {
      crawlOptions.logger.debug('>>> queue length:', queue.length());
    }, 5000);

    /**
     * main
     */

    const queueErrorHandler = async (error) => {
      crawlOptions.logger.error(error);
      crawlOptions.logger.error('queue error', error);
      crawlResult.errors.push({
        url: error.url,
        message: error.message,
        stack: error.stack,
      });
    };

    const queueResultHandler = async (result) => {
      // await queue.pause();
      // options.logger.debug(arguments);
      if (result) {
        crawlOptions.logger.debug(result.url);
        crawlOptions.logger.debug('urls', result.urls.length);
        // options.logger.debug(result.urls);
        crawlOptions.logger.debug('sitemaps', result.sitemaps.length);

        const newURLs = result.urls.map((o) => o.url);

        const qualifiedURLs = qualifyURLsForCrawl(newURLs, {
          baseURL: crawlOptions.originURLObj.origin,
          origin: result.url,
          urlPatterns,
          sameDomain: crawlOptions.sameDomain,
          keepHash: crawlOptions.keepHash,
        });

        foundURLs.push(...qualifiedURLs);

        // valid urls only
        const validURLs = foundURLs.filter((o) => o.status === 'valid');
        if (crawlOptions.limit > 0 && validURLs.length >= crawlOptions.limit) {
          await queue.kill();
        } else {
          crawlOptions.logger.debug('foundURLs', foundURLs.length);
          crawlOptions.logger.debug(foundURLs.slice(-10));
          crawlOptions.logger.debug(foundURLs.filter((o) => o.status === 'duplicate').slice(-10));

          for (let i = 0; i < result.sitemaps.length; i += 1) {
            const s = result.sitemaps[i];
            queue.push({ url: s, retries: 0 })
              .then(queueResultHandler)
              .catch(queueErrorHandler);
            crawlResult.sitemaps.push(s);
          }
        }
      }
      // await queue.resume();
    };

    try {
      // add items to queue
      for (let i = 0; i < sources.sitemaps.length; i += 1) {
        const sitemap = sources.sitemaps[i];
        queue.push({ url: sitemap, retries: 0 })
          .then(queueResultHandler)
          .catch(queueErrorHandler);
      }

      crawlOptions.logger.debug('queue - all items added, start processing');
      await queue.resume();
      crawlOptions.logger.debug('queue - wait for drained');
      await queue.drained();
      crawlOptions.logger.debug('queue - done, stop queue');
      await queue.kill();

      clearInterval(monitorInt);
    } catch (e) {
      throw new Error(e);
    }
    crawlOptions.logger.debug('handler - analyse done');

    crawlResult.urls = foundURLs;
  } catch (e) {
    crawlResult.errors.push(e);
  }

  if (crawlOptions.limit > 0) {
    crawlResult.urls = foundURLs.filter((o) => o.status === 'valid').slice(0, crawlOptions.limit);
  }

  return crawlResult;
}
