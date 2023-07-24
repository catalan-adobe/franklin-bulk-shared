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
import pptr from 'puppeteer';
import fp from 'find-free-port';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fullLists, PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';

const puppeteer = _puppeteer.default;

/*
 * Types
 */

export type BrowserOptions = {
  headless?: string;
  port?: number;
  width?: number;
  height?: number;
  adBlocker?: boolean;
  gdprAutoConsent?: boolean;
  devTools?: boolean;
  maximized?: boolean;
};

const defaultBrowserOptions = {
  headless: true,
  port: null,
  width: 1280,
  height: 1000,
  adBlocker: true,
  gdprAutoConsent: true,
  devTools: false,
  maximized: false,
};

/*
 * Functions
 */

puppeteer.use(StealthPlugin());

export async function initBrowser(options?: BrowserOptions) {
  const opts = {
    ...defaultBrowserOptions,
    ...options,
  };

  if (!opts.port) {
    opts.port = await fp(9222);
  }

  const browserLaunchOptions = {
    devtools: opts.devTools,
    headless: opts.headless, // === true ? 'new' : false,
    executablePath: chromium.path,
    defaultViewport: null,
    args: [
      '--remote-allow-origins=*',
      `--remote-debugging-port=${opts.port}`, // force port to avoid issues loading some pages
      '--no-sandbox',
      '--no-default-browser-check',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  };
  if (opts.maximized) {
    browserLaunchOptions.args.push(`--start-maximized`);
  } else {
    browserLaunchOptions.args.push(`--window-size=${opts.width},${opts.height}`);
  }

  // init browser
  // @ts-ignore
  const browser = await puppeteer.launch(browserLaunchOptions);
  const pages = await browser.pages();
  if (pages[0]) {
    await pages[0].close();
  }
  // const page = pages[0] || await browser.newPage();
  const page = await browser.newPage();

  // blockers
  const blockerList = [];
  if (options?.adBlocker) {
    blockerList.push(...fullLists);
  }
  if (options?.gdprAutoConsent) {
    blockerList.push('https://secure.fanboy.co.nz/fanboy-cookiemonster.txt');
  }

  if (blockerList.length > 0) {
    const blocker = await PuppeteerBlocker.fromLists(fetch, [
      ...fullLists,
      'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
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
      const resp = await params.page.goto(params.url, { waitUntil: 'networkidle0' });
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

export * as Steps from './steps/steps.js';
export * as Scenarios from './scenarios/scenarios.js';
