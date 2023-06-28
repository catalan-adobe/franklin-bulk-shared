import chromium from 'chromium';
import pptr from 'puppeteer';
import _puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fullLists, PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import fetch from 'cross-fetch';
import { sleep } from '../../time.js';

const puppeteer = _puppeteer.default;

export type FullPageScreenshotScenarionOptions = {
  url: string;
  page?: pptr.Page;
  width?: number;
  postLoadWait?: number;
  adblocker?: boolean;
  selectorAllToRemove?: string;
  headless?: boolean;
};
const defaultFullPageScreenshotScenarionOptions = {
  page: null,
  width: 1280,
  postLoadWait: 1000,
  adblocker: true,
  selectorAllToRemove: null,
  headless: true,
};

export async function takeFullPageScreenshot(options: FullPageScreenshotScenarionOptions) {
  const opts = {
    ...defaultFullPageScreenshotScenarionOptions,
    ...options,
  };

  console.log('options', opts);

  let browser;
  let screenshotBuffer;

  try {
    // // Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
    puppeteer.use(StealthPlugin());

    if (!opts.page) {
      browser = await puppeteer.launch({
        executablePath: chromium.path,
        headless: opts.headless,
        args: [
          '--remote-allow-origins=*',
          '--no-sandbox',
          '--no-default-browser-check',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
      });
    }

    const page = opts.page || await browser.newPage();

    await page.setViewport({ width: opts.width, height: 1000 });

    const blocker = await PuppeteerBlocker.fromLists(fetch, [
      ...fullLists,
      'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
    ]);

    await blocker.enableBlockingInPage(page);

    if (!opts.adblocker) {
      await blocker.disableBlockingInPage(page);
    }

    console.log('Testing adblocker plugin..');
    await page.goto(opts.url);

    // scroll to bottom
    await page.evaluate(() => {
      window.scrollTo({ left: 0, top: window.document.body.scrollHeight, behavior: 'smooth' });
    });
    await sleep(2000);

    // scroll bsck up
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(250);

    if (opts.selectorAllToRemove) {
      await page.evaluate((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      }, opts.selectorAllToRemove);
    }

    // Evaluate JavaScript
    // eslint-disable-next-line max-len
    const pageHeight = await page.evaluate(() => window.document.body.offsetHeight || window.document.body.scrollHeight);

    await page.setViewport({
      width: opts.width,
      height: pageHeight,
      deviceScaleFactor: 1,
    });

    await sleep(opts.postLoadWait);

    screenshotBuffer = await page.screenshot({ fullPage: true });

    return screenshotBuffer;
  } catch (e) {
    console.error(e);
    return null;
  } finally {
    if (browser) {
      console.log('Closing browser..');
      await browser.close();
    }
  }
}
