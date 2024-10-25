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

/* eslint "@typescript-eslint/no-explicit-any": "off" */

import EventEmitter from 'events';
import { Robot } from 'robots-parser';
import fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { isMatch } from 'matcher';
import { Web } from '../../index.js';
import { isValidHTTP } from './url.js';
import { Sitemap } from './sitemap.js';
import logger, { Logger } from '../logger.js';

/**
 * types
 */

enum CrawlStrategy {
  Sitemaps = 'sitemaps',
  HTTP = 'http',
}

export type URLExtended = {
  url: string,
  origin: string,
  status: string,
  level1: string,
  level2: string,
  level3: string,
  filename: string,
  search: string,
  lang?: string,
  message?: string,
};

type URLPattern = {
  pattern: string,
  expect: boolean,
};

/**
 * @typedef CrawlOptions
 * @property {number} [timeout] - The timeout for the crawl operation (in ms).
 * @property {string} [userAgent] - The user agent to use for the crawl operation.
 */
type CrawlOptions = {
  strategy?: CrawlStrategy;
  workers?: number;
  timeout?: number;
  userAgent?: string;
  originURLObj?: URL;
  inclusionPatterns?: string[];
  exclusionPatterns?: string[];
  limit?: number;
  sameDomain?: boolean;
  keepHash?: boolean;
  logger?: Logger;
  urlStreamFn: any; // object; // UrlStreamFn;
  httpHeaders?: Record<string, string>;
};

type CrawlResult = {
  originURL: string,
  crawlOptions: CrawlOptions,
  errors: object[],
  urls: { total: number, valid: number },
  robotstxt: Robot | null,
  sitemaps: string[],
  languages: string[],
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
  strategy: CrawlStrategy.Sitemaps,
  workers: 1,
  timeout: 10000,
  userAgent: null,
  originURLObj: null,
  inclusionPatterns: [],
  exclusionPatterns: [],
  limit: -1,
  sameDomain: true,
  keepHash: true,
  httpHeaders: null,
  logger,
  urlStreamFn: () => Promise.resolve(),
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

  // if (path.basename(options.originURLObj.pathname).indexOf('.xml') > -1) {
  if (options.originURLObj.pathname !== '/') {
    result.sitemaps.push(originURL);
  } else {
    // try robots.txt
    try {
      const r: Robot = await Web.parseRobotsTxt(`${options.originURLObj.origin}/robots.txt`, options);
      /* eslint-disable-next-line dot-notation */
      result.robotstxt = r['raw'];
      result.sitemaps.push(...new Set(r.getSitemaps()));
    } catch {
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

export function qualifyURLsForCrawl(urls, {
  baseURL,
  origin,
  urlPatterns = [],
  sameDomain = true,
  keepHash = false,
}): URLExtended[] {
  return urls
    // .concat(urls.reduce(
    //   // for urls with query or hash, concatenate the origin + pathname url to the list
    //   // of urls to qualify and crawl
    //   (acc, val) => {
    //     try {
    //       const u = new URL(val);
    //       if (u.search !== '' || u.hash !== '') {
    //         acc.push(`${u.origin}${u.pathname}`);
    //       }
    //     } catch {
    //       // nothing
    //     }
    //     return acc;
    //   },
    //   [],
    // ))
    .map((url) => {
      const urlExt: URLExtended = {
        url,
        origin,
        status: 'unknown',
        level1: '',
        level2: '',
        level3: '',
        filename: '',
        search: '',
        lang: '',
        message: '',
      };

      try {
        const u = isValidHTTP(url);

        if (!keepHash && u) {
          urlExt.url = `${u.origin}${u.pathname}${u.search}`;
        }

        if (!u) {
          urlExt.status = 'excluded';
          urlExt.message = 'invalid url';
        } else if (sameDomain && urlExt.url && !urlExt.url.startsWith(baseURL)) {
          urlExt.status = 'excluded';
          urlExt.message = `not same origin as base URL ${baseURL}`;
        } else {
          const excludedFromURLPatterns = urlPatterns.find(
            (pat) => !(isMatch(`${u.pathname}${u.search}${u.hash}`, pat.pattern) === pat.expect),
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
            urlExt.lang = Web.getLanguageFromURL(urlExt.url) || '';
            urlExt.status = 'valid';
          }
        }
      } catch (e) {
        console.error(e);
        urlExt.status = 'error';
        urlExt.message = e.message;
      }

      return urlExt;
    });
}

async function sitemapCrawlWorker({
  // payload
  url,
  retries,
}) {
  // context: this <=> { crawlOptions }
  const result = {
    url,
    status: 'unknown',
    retries,
    error: null,
    sitemaps: [],
    urls: [],
  };

  try {
    const s: Sitemap = await Web.parseSitemapFromUrl(url, {
      signal: AbortSignal.timeout(this.crawlOptions.timeout),
      timeout: this.crawlOptions.timeout,
      httpHeaders: this.crawlOptions.httpHeaders,
      logger: this.crawlOptions.logger,
    });

    if (s.urls && s.urls.length > 0) {
      result.urls = s.urls;
    }
    if (s.sitemaps && s.sitemaps.length > 0) {
      result.sitemaps = s.sitemaps;
    }
    result.status = 'done';

    return result;
  } catch (e) {
    e.url = url;
    result.error = e;
    return result;
  }
}

async function httpCrawlWorker({
  // payload
  url,
  retries,
}) {
  // context: this <=> { crawlOptions }
  const result = {
    url,
    status: 'unknown',
    retries,
    error: null,
    sitemaps: [],
    urls: [],
  };

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.crawlOptions.timeout),
      headers: this.crawlOptions.httpHeaders,
    });

    if (!response.ok) {
      throw new Error(`collect urls from ${url}: ${response.status} ${response.statusText}`);
    }

    if (response.headers.get('content-type').indexOf('text/html') === -1) {
      throw new Error(`collect urls from ${url}: content type is not text/html`);
    }

    const html = await response.text();

    const u = new URL(url);

    result.urls = Web.extractLinks(html, u.origin).map((o) => {
      const uu = new URL(o, u.origin);
      return { url: uu.toString(), origin: u.origin };
    });
    result.status = 'done';

    return result;
  } catch (e) {
    e.url = url;
    result.error = e;
    return result;
  }
}

const STRATEGY_WORKER_MAPPING = {
  [CrawlStrategy.Sitemaps]: sitemapCrawlWorker,
  [CrawlStrategy.HTTP]: httpCrawlWorker,
};

function getCrawlWorker(strategy: CrawlStrategy): any {
  return STRATEGY_WORKER_MAPPING[strategy];
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
    urls: { total: 0, valid: 0 },
    robotstxt: null,
    sitemaps: [],
    languages: [],
  };
  const eventEmitter = new EventEmitter();

  crawlOptions.logger.silly(`init crawl from ${originURL} with options:`);
  JSON.stringify(crawlOptions, null, 2).split('\n').forEach((line) => {
    crawlOptions.logger.silly(line);
  });

  try {
    const url = isValidHTTP(originURL);

    if (!url) {
      throw new Error(`Invalid origin URL (${originURL})`);
    }

    crawlOptions.originURLObj = url;

    const sources = [];
    if (crawlOptions.strategy === CrawlStrategy.Sitemaps) {
      crawlOptions.logger.debug('crawl strategy: sitemaps');
      const result = await collectSitemapsToCrawl(originURL, crawlOptions);
      sources.push(...result.sitemaps);
      crawlOptions.logger.debug(`found ${sources.length} sitemap(s) to crawl`);
      crawlResult.robotstxt = result.robotstxt;
      crawlResult.sitemaps = result.sitemaps;
    } else if (crawlOptions.strategy === CrawlStrategy.HTTP) {
      sources.push(originURL);
      crawlOptions.logger.debug(`HTTP crawling starting from ${originURL}`);
      crawlResult.robotstxt = null;
      crawlResult.sitemaps = null;
    }

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
      getCrawlWorker(crawlOptions.strategy),
      crawlOptions.workers,
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

    // maintain a set of all unique urls found
    const allUrls = new Set();

    // handler for queue worker results
    const queueResultHandler = async (result) => {
      // do not process if queue is drained
      if (queue.drained !== null) {
        crawlOptions.logger.silly('queue drained');
        return;
      }

      let newResToCrawl = false;

      if (result.error) {
        crawlOptions.logger.error(`resource crawl error: ${result.error.message}`);
        crawlResult.errors.push({
          url: result.url,
          message: result.error.message,
          stack: result.error.stack,
        });
      } else {
        if (crawlOptions.strategy === CrawlStrategy.Sitemaps) {
          for (let i = 0; i < result.sitemaps.length; i += 1) {
            const s = result.sitemaps[i];
            // check if sitemap is already in the list of sitemaps
            if (!crawlResult.sitemaps.includes(s)) {
              newResToCrawl = true;
              queue.push({ url: s, retries: 0 })
                .then(queueResultHandler);
              crawlResult.sitemaps.push(s);
            }
          }
          crawlOptions.logger.debug(`done crawling ${result.url} (found ${result.sitemaps.length} sitemaps and ${result.urls.length} urls)`);
        } else if (crawlOptions.strategy === CrawlStrategy.HTTP) {
          const newURLsToCrawl = result.urls.filter(
            (o) => o.status === 'valid' && !foundURLs.some((f) => f.url === o.url),
          );
          for (let i = 0; i < newURLsToCrawl.length; i += 1) {
            const u = newURLsToCrawl[i];
            queue.push({ url: u.url, retries: 0 })
              .then(queueResultHandler);
          }
          crawlOptions.logger.debug(`done crawling ${result.url} (found ${newURLsToCrawl.length} valid urls to crawl)`);
        }

        if (result.urls && result.urls.length > 0) {
          let newURLs = result.urls.filter((u) => !allUrls.has(u));
          if (
            crawlOptions.limit > 0
            && (newURLs.length + crawlResult.urls.valid) >= crawlOptions.limit
          ) {
            newURLs = newURLs.slice(0, crawlOptions.limit - crawlResult.urls.valid);
          }

          newURLs.forEach((u) => allUrls.add(u));

          const qualifiedURLs = qualifyURLsForCrawl(newURLs, {
            baseURL: crawlOptions.originURLObj.origin,
            origin: result.url,
            urlPatterns,
            sameDomain: crawlOptions.sameDomain,
            keepHash: crawlOptions.keepHash,
          });

          crawlResult.urls.total += qualifiedURLs.length;
          crawlResult.urls.valid += qualifiedURLs.filter((o) => o.status === 'valid').length;

          await crawlOptions.urlStreamFn(qualifiedURLs);
        }
      }

      if (
        (crawlOptions.limit > 0 && crawlResult.urls.valid >= crawlOptions.limit)
        || (queue.idle() && (result.error || !newResToCrawl))
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
      for (let i = 0; i < sources.length; i += 1) {
        queue.push({ url: sources[i], retries: 0 })
          .then(queueResultHandler);
      }

      const monitorInterval = setInterval(() => {
        crawlOptions.logger.debug(`crawling queue - ${queue.length()} items left - ${crawlResult.urls.valid} valid urls found`);
      }, 5000);

      crawlOptions.logger.debug('queue - all items added, start processing');
      queue.resume();

      crawlOptions.logger.debug('queue - wait for drained');

      const result = await new Promise((resolve) => {
        eventEmitter.once('done', (reason) => {
          resolve(`crawling done: ${reason}`);
        });
      });

      clearInterval(monitorInterval);

      crawlOptions.logger.debug(result);
    } catch (e) {
      throw new Error(e);
    }
  } catch (e) {
    crawlResult.errors.push(e);
  }

  crawlOptions.logger.debug(`found ${crawlResult.urls.total} urls`);

  return crawlResult;
}
