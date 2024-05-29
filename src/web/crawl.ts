/* eslint "@typescript-eslint/no-explicit-any": "off" */

import path from 'path';
import EventEmitter from 'events';
import { Robot } from 'robots-parser';
import fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { isMatch } from 'matcher';
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

async function crawlWorker({
  // payload
  url,
  retries,
}) {
  // context: this <=> { crawlOptions }
  // console.log('crawlWorker', this, url, retries);
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
      timeout: this.crawlOptions.timeout,
    });

    if (s.urls && s.urls.length > 0) {
      result.urls = s.urls;
    }
    if (s.sitemaps && s.sitemaps.length > 0) {
      result.sitemaps.push(...s.sitemaps.map((o) => o.url));
    }
    result.status = 'done';

    return result;
  } catch (e) {
    e.url = url;
    result.error = e;
    return result;
  }
}

/**
 * exports
 */

/**
 * Crawls a website starting from the specified origin URL.
 * @param originURL The origin URL to start crawling from.
 * @param options The crawl options (optional).
 * @returns A promise that resolves to the crawl result.
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
  const eventEmitter = new EventEmitter();

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
    queue.drained = null;

    /**
     * main
     */

    // queue main error handler
    queue.error((e, task) => {
      if (e) {
        crawlOptions.logger.error(`crawl queue main error: ${e.message} (task: ${task.url})`);
      }
    });

    // handler for queue worker results
    const queueResultHandler = async (result) => {
      // do not process if queue is drained
      if (queue.drained !== null) {
        return;
      }

      if (result.error) {
        crawlOptions.logger.error(`resource crawl error: ${result.error.message}`);
        crawlResult.errors.push({
          url: result.url,
          message: result.error.message,
          stack: result.error.stack,
        });
      } else {
        const newURLs = result.urls.map((o) => o.url);

        const qualifiedURLs = qualifyURLsForCrawl(newURLs, {
          baseURL: crawlOptions.originURLObj.origin,
          origin: result.url,
          urlPatterns,
          sameDomain: crawlOptions.sameDomain,
          keepHash: crawlOptions.keepHash,
        });

        foundURLs.push(...qualifiedURLs);
        for (let i = 0; i < result.sitemaps.length; i += 1) {
          const s = result.sitemaps[i];
          queue.push({ url: s, retries: 0 })
            .then(queueResultHandler);
          crawlResult.sitemaps.push(s);
        }
        crawlOptions.logger.debug(`done crawling ${result.url} (found ${result.sitemaps.length} sitemaps and ${qualifiedURLs.length} urls)`);
      }

      // valid urls only
      const validURLs = foundURLs.filter((o) => o.status === 'valid');

      if (
        (crawlOptions.limit > 0 && validURLs.length >= crawlOptions.limit)
        || (queue.idle() && (result.error || result.sitemaps.length === 0))
      ) {
        queue.killAndDrain();
        queue.drained = () => undefined;
        let reason = 'all resources crawled';
        if (!queue.idle()) {
          reason = `max urls limit reached (${crawlOptions.limit}), process aborted`;
        }
        eventEmitter.emit('done', reason);
      }
    };

    try {
      queue.pause();
      // add items to queue
      for (let i = 0; i < sources.sitemaps.length; i += 1) {
        const sitemap = sources.sitemaps[i];
        queue.push({ url: sitemap, retries: 0 })
          .then(queueResultHandler);
      }

      crawlOptions.logger.debug('queue - all items added, start processing');
      queue.resume();

      crawlOptions.logger.debug('queue - wait for drained');

      const result = await new Promise((resolve) => {
        eventEmitter.once('done', (reason) => {
          resolve(`crawling done: ${reason}`);
        });
      });

      crawlOptions.logger.debug(result);
    } catch (e) {
      throw new Error(e);
    }

    crawlResult.urls = foundURLs;
  } catch (e) {
    crawlResult.errors.push(e);
  }

  if (crawlOptions.limit > 0) {
    crawlResult.urls = foundURLs.filter((o) => o.status === 'valid').slice(0, crawlOptions.limit);
  }

  crawlOptions.logger.debug(`found ${crawlResult.urls.length} valid urls`);

  return crawlResult;
}
