/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import chromium from 'chromium';
import _puppeteer from 'puppeteer-extra';
import pptr, { PuppeteerLaunchOptions } from 'puppeteer';
import fp from 'find-free-port';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fullLists, PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import chromePaths from 'chrome-paths';
import { sleep } from '../time.js';

const puppeteer = _puppeteer.default;

/*
 * Types
 */

export type BrowserOptions = {
  headless?: 'new' | boolean;
  port?: number;
  width?: number;
  height?: number;
  adBlocker?: boolean;
  gdprBlocker?: boolean;
  devTools?: boolean;
  maximized?: boolean;
  useLocalChrome?: boolean;
  userDataDir?: string;
  extraArgs?: string[];
  disableJS?: boolean;
};

const defaultBrowserOptions = {
  headless: true,
  port: null,
  width: 1280,
  height: 1000,
  adBlocker: true,
  gdprBlocker: true,
  devTools: false,
  maximized: false,
  useLocalChrome: false,
  extraArgs: [],
  disableJS: false,
};

const defaultBrowserArgs = [
  '--remote-allow-origins=*',
  '--no-sandbox',
  '--no-default-browser-check',
];

/*
 * Functions
 */

puppeteer.use(StealthPlugin());

export async function initBrowser(options?: BrowserOptions) {
  const opts: BrowserOptions = {
    ...defaultBrowserOptions,
    ...options,
  };

  if (!opts.port) {
    opts.port = await fp(9222);
  }

  let chromePath = chromium.path;
  if (opts.useLocalChrome) {
    if (chromePaths.chrome) {
      chromePath = chromePaths.chrome;
    } else {
      // eslint-disable-next-line no-console
      console.error('chrome not found on this machine, fallback to chromium');
    }
  }

  const browserArgs = [
    ...defaultBrowserArgs,
    ...[`--remote-debugging-port=${opts.port}`],
    ...opts.extraArgs,
  ];

  const browserLaunchOptions: PuppeteerLaunchOptions = {
    devtools: opts.devTools,
    headless: opts.headless === true ? 'new' : false,
    executablePath: chromePath,
    defaultViewport: null,
    args: browserArgs,
    ignoreDefaultArgs: ['--enable-automation'],
  };
  if (opts.maximized) {
    browserLaunchOptions.args.push('--start-maximized');
  } else {
    browserLaunchOptions.args.push(`--window-size=${opts.width},${opts.height}`);
  }
  if (opts.userDataDir) {
    browserLaunchOptions.userDataDir = opts.userDataDir;
  }

  // init browser
  // @ts-ignore
  const browser = await puppeteer.launch(browserLaunchOptions);
  const pages = await browser.pages();
  if (pages[0]) {
    await pages[0].close();
  }

  // force disable javascript on all new pages
  if (opts.disableJS) {
    browser.on('targetcreated', async (target) => {
      const page = await target.page();
      if (page) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          if (request.resourceType() === 'script') {
            request.abort();
          } else {
            request.continue();
          }
        });
      }
    });
  }

  // const page = pages[0] || await browser.newPage();
  const page = await browser.newPage();

  // blockers
  const blockerList = [];
  if (options?.adBlocker) {
    blockerList.push(...fullLists);
  }
  if (options?.gdprBlocker) {
    blockerList.push('https://secure.fanboy.co.nz/fanboy-cookiemonster.txt');
  }

  if (blockerList.length > 0) {
    const blocker = await PuppeteerBlocker.fromLists(fetch, [
      ...blockerList,
    ]);

    await blocker.enableBlockingInPage(page);
  }

  return [browser, page];
}

/**
 * Scrolls down the current page
 * @param {pptr.Page} page - An existing Puppeteer page object
 */
export async function scrollDown(page: pptr.Page): Promise<void> {
  return page.evaluate(() => {
    window.scrollTo({ left: 0, top: window.document.body.scrollHeight, behavior: 'smooth' });
  });
}

/**
 * Scrolls up the current page
 * @param {pptr.Page} page - An existing Puppeteer page object
 */
export async function scrollUp(page: pptr.Page): Promise<void> {
  return page.evaluate(() => {
    window.scrollTo({ left: 0, top: 0 });
  });
}

/**
 * Scrolls up the current page
 * @param {pptr.Page} page - An existing Puppeteer page object
 */
export async function runStepsSequence(
  page: pptr.Page,
  url,
  steps,
  logger = null,
): Promise<void> {
  function wrapBrowserAction(action, ...middlewares) {
    /* eslint-disable-next-line @typescript-eslint/no-shadow */
    return middlewares/* .reverse() */.reduce((action, middleware) => middleware(action), action);
  }

  async function mainBrowserAction(params) {
    try {
      // console.info('mainBrowserAction - navigate to page');
      const resp = await params.page.goto(params.url, { waitUntil: 'networkidle2' });
      // fail early in case page is unreachable for some reason
      if (resp.status() >= 400) {
        throw new Error(`harvest::NON_BLOCKING_ERROR navigation failure for ${params.url}, got ${resp.status()}`);
      } else if (resp.headers()['content-length'] === '0') {
        throw new Error(`harvest::NON_BLOCKING_ERROR empty page for url ${params.url}`);
      }
      return params;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('mainBrowserAction - navigate to page catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    }

    return params;
  }

  const browserScriptParameters = {
    outputFolder: process.cwd(),
    page,
    done: false,
    postLoadDelay: 5000,
    url,
    logger: logger || console,
    result: {
      passed: true,
      error: null,
    },
  };

  try {
    const browserScript = wrapBrowserAction(mainBrowserAction, ...steps);
    const res = await browserScript(browserScriptParameters);

    if (!res.result.passed) {
      throw new Error(`browser script failed: ${res.result.error}`);
    }

    return res;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('main error:', e);
    if (e.message.indexOf('net::ERR_NAME_NOT_RESOLVED') > -1) {
      // eslint-disable-next-line no-console
      console.error(`url ${url} not reachable!`);
    } else if (e.message.indexOf('harvest::NON_BLOCKING_ERROR') > -1) {
      // eslint-disable-next-line no-console
      console.error(`non blocking error (do not retry) for ${url}: ${e}`);
    }
    throw e;
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const { scrollHeight } = window.document.scrollingElement;
        totalHeight += distance;
        window.document.scrollingElement.scrollTo({ top: totalHeight, left: 0, behavior: 'instant' });
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });
}

export async function smartScroll(page, options = { postReset: true }) {
  try {
    // scroll to bottom
    await autoScroll(page);

    // pace
    await sleep(250);

    // scroll back up
    if (options.postReset) {
      await page.evaluate(() => {
        window.document.scrollingElement.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      });
      await sleep(250);
    }
  } catch (e) {
    throw new Error(`smart scroll failed: ${e}`);
  }
}

export * as Steps from './steps/steps.js';
export * as Scenarios from './scenarios/scenarios.js';
