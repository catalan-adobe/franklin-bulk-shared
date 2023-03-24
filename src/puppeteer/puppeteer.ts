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
import puppeteer from 'puppeteer-core';

/*
 * Types
 */

export type BrowserOptions = {
  headless?: boolean;
  width?: number;
  height?: number;
}

/*
 * Functions
 */

export async function initBrowser(options?: BrowserOptions): Promise<[puppeteer.Browser, puppeteer.Page]> {
  // defaults
  const headless = options?.headless !== false;
  const width = options?.width || 1200;
  const height = options?.height ? options.height + 79 : 1079;

  const browserLaunchOptions = {
    headless,
    executablePath: chromium.path,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--no-default-browser-check',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  };
  browserLaunchOptions.args.push(`--window-size=${width},${height}`);

  // init browser
  const browser = await puppeteer.launch(browserLaunchOptions);
  const page = await browser.newPage();

  // clean up user agent
  if (headless) {
    let ua = await browser.userAgent();
    ua = ua.replace(/headless/gi, '');

    await page.setUserAgent(ua);
  }

  return [browser, page];
}


/**
 * Scrolls down the current page
 * @param {puppeteer.Page} page - An existing Puppeteer page object
 */
export async function scrollDown(page: puppeteer.Page): Promise<void> {
  return page.evaluate(() => {
    window.scrollTo({ left: 0, top: window.document.body.scrollHeight, behavior: 'smooth' });
  });
}

/**
 * Scrolls up the current page
 * @param {puppeteer.Page} page - An existing Puppeteer page object
 */
export async function scrollUp(page: puppeteer.Page): Promise<void> {
  return page.evaluate(() => {
    window.scrollTo({ left: 0, top: 0 });
  });
}

/**
 * Scrolls up the current page
 * @param {puppeteer.Page} page - An existing Puppeteer page object
 */
export async function runStepsSequence(page: puppeteer.Page, url, steps): Promise<void> {
  function wrapBrowserAction(action, ...middlewares) {
    /* eslint-disable-next-line no-shadow */
    return middlewares/*.reverse()*/.reduce((action, middleware) => middleware(action), action);
  }
  
  async function mainBrowserAction(params) {
    try {
      // console.info('mainBrowserAction - navigate to page');
      const resp = await params.page.goto(params.url);
      // fail early in case page is unreachable for some reason
      if (resp.status() >= 400) {
        throw new Error(`harvest::NON_BLOCKING_ERROR navigation failure for ${params.url}, got ${resp.status()}`);
      } else if (resp.headers()['content-length'] === '0') {
        throw new Error(`harvest::NON_BLOCKING_ERROR empty page for url ${params.url}`);      
      }
      return params;
    } catch(e) {
      console.error('mainBrowserAction - navigate to page catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    } finally {
      // params.logger.info('mainBrowserAction - navigate to page finally');
      return params;
    }
  };

  const browserScriptParameters = {
    outputFolder: process.cwd(),
    page,
    done: false,
    postLoadDelay: 5000,
    url,
    logger: console,
    result: {
      passed: true,
      error: null
    }
  };

  try {    
    const browserScript = wrapBrowserAction(mainBrowserAction, ...steps);
    const res = await browserScript(browserScriptParameters);
    // console.log('Browser Script Result:');
    // console.log(res);

    if (!res.result.passed) {
      throw new Error(`browser script failed: ${res.result.error}`);
    }

    return res;
  } catch(e) {
    console.error('main error:', e);
    if (e.message.indexOf('net::ERR_NAME_NOT_RESOLVED') > -1) {
      console.error(`url ${url} not reachable!`);
    } else if (e.message.indexOf('harvest::NON_BLOCKING_ERROR') > -1) {
      console.error(`non blocking error (do not retry) for ${url}: ${e}`);
    } else {
      throw e;
    }

    return null;
  } finally {
    // ensure browser gets closed
    // console.info('done browser sequence');
  }

}

export * as Steps from './steps/steps.js';
