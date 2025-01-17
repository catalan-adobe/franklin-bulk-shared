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

import fs from 'fs';
import fontpie from 'fontpie-calc';
import { Browser, Page } from 'puppeteer-core';
import path from 'path';
import { smartScroll } from './puppeteer.js';
import { Time } from '../../index.js';

const DEFAULT_TAGS_TO_APPEND = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'img', 'p', 'span', 'b', 'strong',
];

export const DEFAULT_TAGS_TO_COLLECT = [
  ...['html', 'body'],
  ...DEFAULT_TAGS_TO_APPEND,
];

export const CSS_PROPERTIES_TO_EXCLUDE = [
  // suspicious *-color properties
  'block-size',
  'border-block-end-color',
  'border-block-start-color',
  'border-bottom-color',
  'border-inline-end-color',
  'border-inline-start-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'caret-color',
  'text-decoration-color',
  'text-emphasis-color',
  'column-rule-color',
  // size properties
  'width',
  'height',
  'inline-size',
  'outline-color',
  'perspective-origin',
  'transform-origin',
  // webkit properties
  '-webkit-locale',
  '-webkit-text-fill-color',
  '-webkit-text-stroke-color',
];

export const CSS_VALUES_TO_EXCLUDE = [
  'initial',
  'auto',
  'none',
  'normal',
  '0px',
  0,
  'rgba(0, 0, 0, 0)',
];

export const CSS_VALUES_TO_INCLUDE = {
  img: {
    width: 'auto',
    height: 'auto',
  },
};

export async function getDefaultCSSValues(
  browser: Browser,
  options = { logger: console },
) {
  let page = null;

  try {
    page = await browser.newPage();
    await page.setContent('<html><body></body></html>');
    const defaultStyles = await page.evaluate((tagsToAppend, tagsToCollect) => {
      /* eslint-disable */
      // code executed in the browser context
      tagsToAppend.forEach((tag) => {
        const element = document.createElement(tag);
        element.textContent = `${tag} - Lorem ipsum`;
        document.body.appendChild(element);
      });
      const defaultStyles = {};
      tagsToCollect.forEach((tag) => {
        const el = document.querySelector(tag);
        const styles = window.getComputedStyle(el);
        defaultStyles[tag] = {};
        for (let i = 0; i < styles.length; i += 1) {
          const name = styles[i];
          const value = styles.getPropertyValue(name);
          defaultStyles[tag][name] = value;
        }
      });
      return defaultStyles;
      /* eslint-enable */
    }, DEFAULT_TAGS_TO_APPEND, DEFAULT_TAGS_TO_COLLECT);
    return defaultStyles;
  } catch (error) {
    options.logger.error(error);
    return null;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

export async function getComputedCSSValues(
  page: Page,
  tags: string[] = DEFAULT_TAGS_TO_COLLECT,
  options = { logger: console },
) {
  try {
    const computedStyles = await page.evaluate((tagsToCollect) => {
      /* eslint-disable */
      // code executed in the browser context
      const computedStyles = {};
      tagsToCollect.forEach((tag) => {
        const el = document.querySelector(tag);
        if (el) {
          const styles = window.getComputedStyle(el);
          computedStyles[tag] = {};
          for (let i = 0; i < styles.length; i += 1) {
            const name = styles[i];
            const value = styles.getPropertyValue(name);
            computedStyles[tag][name] = value;
          }
        } else {
          computedStyles[tag] = null;
        }
      });
      return computedStyles;
      /* eslint-enable */
    }, tags);

    return computedStyles;
  } catch (error) {
    options.logger.error(error);
    return null;
  }
}

export async function getCSSValuesForDefaultElements(
  page: Page,
  tags: string[] = DEFAULT_TAGS_TO_APPEND,
  options = { logger: console },
) {
  try {
    const computedStyles = await page.evaluate((tagsToCollect) => {
      /* eslint-disable */
      // code executed in the browser context
      const computedStyles = {};
      tagsToCollect.forEach((tag) => {
        let els = [...document.querySelectorAll(tag)];
        if (els.length === 0) {
          const el = document.createElement(tag);
          el.textContent = `${tag} - Lorem ipsum`;
          document.body.appendChild(el);
          els = [el];
        }

        computedStyles[tag] = [];

        els.forEach((el) => { 
          const cs = {}
          const styles = window.getComputedStyle(el);
          for (let i = 0; i < styles.length; i += 1) {
            const name = styles[i];
            const value = styles.getPropertyValue(name);
            cs[name] = value;
          }
          computedStyles[tag].push(cs);
        });
      });
      return computedStyles;
      /* eslint-enable */
    }, tags);

    return computedStyles;
  } catch (error) {
    options.logger.error(error);
    return null;
  }
}

function computeFallbackFont(file, name, weight = 400, style = 'normal') {
  const ff = fontpie(file, { name, weight, style });
  return ff;
}

export async function getMinimalCSSForCurrentPage(page: Page) {
  const client = await page.createCDPSession();
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  await page.setViewport({ width: 600, height: 1080 });
  await page.reload();

  const defaultStyles = await getDefaultCSSValues(page.browser());
  const computedStyles = await getComputedCSSValues(page);
  const css = {};

  Object.keys(computedStyles).forEach((tag) => {
    const computed = computedStyles[tag];
    const defaults = defaultStyles[tag];

    if (computed && defaults) {
      css[tag] = {};
      Object.keys(defaults).forEach((prop) => {
        if (
          computed[prop] !== defaults[prop]
          && !CSS_PROPERTIES_TO_EXCLUDE.includes(prop)
          && !CSS_VALUES_TO_EXCLUDE.includes(computed[prop])
        ) {
          css[tag][prop] = computed[prop];
        }
      });
      if (CSS_VALUES_TO_INCLUDE[tag]) {
        Object.keys(CSS_VALUES_TO_INCLUDE[tag]).forEach((prop2) => {
          css[tag][prop2] = CSS_VALUES_TO_INCLUDE[tag][prop2];
        });
      }
    }
  });

  const cssRules = [];
  Object.entries(css).forEach(([selector, styles]) => {
    let cssString = `${selector} {\n`;
    Object.entries(styles).forEach(([property, value]) => {
      cssString += `  ${property}: ${value};\n`;
    });
    cssString += '}';
    cssRules.push(cssString);
  });

  return {
    values: css,
    string: cssRules.join('\n\n'),
  };
}

export async function getMinimalCSSForAEMBoilerplateFromURL(url: string, page: Page, { logger, fontsFolder = './fonts' }) {
  try {
    // throw new Error('Not implemented');
    logger.info('setting up browser page for desktop resolution ...');
    // add listener for font updates
    await page.setRequestInterception(true);
    const client = await page.createCDPSession();
    await client.send('DOM.enable');
    await client.send('CSS.enable');

    // collect fonts
    const fonts = [];
    client.on('CSS.fontsUpdated', (e) => {
      if (e.font) {
        if (!fonts.find((f) => f.font.fontFamily === e.font.fontFamily
          && f.font.src === e.font.src
          && f.font.fontWeight === e.font.fontWeight
          && f.font.fontStyle === e.font.fontStyle
          && f.font.unicodeRange === e.font.unicodeRange)
        ) {
          logger.silly('new font detected:');
          Object.keys(e.font).forEach((key) => {
            logger.silly(`* ${key}: ${e.font[key].length > 150 ? `${e.font[key].slice(0, 50)}...${e.font[key].slice(e.font[key].length - 50, e.font[key].length)}` : e.font[key]}`);
          });
          fonts.push(e);
        }
      }
    });

    // delay font requests
    const fontsRequests = [];
    page.on('request', async (interceptedRequest) => {
      if (interceptedRequest.isInterceptResolutionHandled()) return;
      if (interceptedRequest.resourceType() === 'font') {
        if (!fontsRequests.find((f) => f.url === interceptedRequest.url())) {
          fontsRequests.push({
            url: interceptedRequest.url(),
            done: false,
          });
          await Time.sleep(5000);
          if (interceptedRequest.isInterceptResolutionHandled()) return;
        }
      }
      interceptedRequest.continue();
    });

    page.on('requestfailed', (request) => {
      if (request.resourceType() === 'font') {
        const idx = fontsRequests.findIndex((f) => f.url === request.url());
        if (idx >= 0) {
          fontsRequests[idx].done = true;
        }
      }
    });

    page.on('requestfinished', (request) => {
      if (request.resourceType() === 'font') {
        const idx = fontsRequests.findIndex((f) => f.url === request.url());
        if (idx >= 0) {
          fontsRequests[idx].done = true;
        }
      }
    });

    page.on('requestservedfromcache', (request) => {
      if (request.resourceType() === 'font') {
        const idx = fontsRequests.findIndex((f) => f.url === request.url());
        if (idx >= 0) {
          fontsRequests[idx].done = true;
        }
      }
    });

    // setup page state
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await Time.sleep(2000);
    await smartScroll(page, { postReset: true });
    await Time.sleep(1000);

    // wait for all requests to be done in fontsRequests
    let allDone = false;
    while (!allDone) {
      allDone = !fontsRequests.find((f) => !f.done);
      /* eslint-disable-next-line no-await-in-loop */
      await Time.sleep(500);
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const computedStylesForDefaultElements: any = await getCSSValuesForDefaultElements(page);

    // compute font family usage for body font ('p')
    const bodyFFSets = computedStylesForDefaultElements.p.reduce((acc, val) => {
      if (acc[val['font-family']]) {
        acc[val['font-family']] += 1;
      } else {
        acc[val['font-family']] = 1;
      }
      return acc;
    }, {});
    // get entry with max occurences
    const bodyMax = Object.keys(bodyFFSets).reduce(
      (a, b) => (bodyFFSets[a] > bodyFFSets[b] ? a : b),
    );
    logger.silly(`computed body font-family: ${bodyMax}`);

    // compute font family usage for heading font ('h1', 'h2', 'h3')
    const headingFFSets = {};
    ['h1', 'h2', 'h3'].forEach((tag) => {
      computedStylesForDefaultElements[tag].reduce((acc, val) => {
        if (acc[val['font-family']]) {
          acc[val['font-family']] += 1;
        } else {
          acc[val['font-family']] = 1;
        }
        return acc;
      }, headingFFSets);
    });
    // get entry with max occurences
    const headingMax = Object.keys(headingFFSets).reduce(
      (a, b) => (headingFFSets[a] > headingFFSets[b] ? a : b),
    );
    logger.silly(`computed heading font-family: ${headingMax}`);

    await Time.sleep(1000);

    const bodyFontFamilySet = bodyMax;
    const headingFontFamilySet = headingMax;

    let fontFaces = '';
    let fontFBFaces = '';
    const fontFacesArr = [];
    const fontFBFacesArr = [];

    await Promise.all(fonts.map(async (f) => {
      const { font } = f;

      if (font.src.includes('data:application/x-font-woff;base64')) {
        // console.log('Embedded font detected:', font.src.slice(0, 100));
        const fontData = font.src.split('data:application/x-font-woff;base64,').pop();
        const fontDataBuffer = Buffer.from(fontData, 'base64');
        // sanitize font family name
        const fontFilename = `${font.fontFamily.replace(/[^a-z0-9]/gi, '-')}-${font.fontWeight}-${font.fontStyle}.woff`.toLowerCase();
        fs.writeFileSync(`${fontsFolder}/${fontFilename}`, fontDataBuffer);

        const fb = computeFallbackFont(`${fontsFolder}/${fontFilename}`, font.fontFamily, font.fontWeight, font.fontStyle);
        fontFBFacesArr.push(fb);
        fontFBFaces += `@font-face {
    font-family: '${fb.fontFamily} Fallback';
    font-style: ${fb.fontStyle};
    font-weight: ${fb.fontWeight};
    src: local('${fb.fallbackFont}');
    ascent-override: ${fb.ascentOverride};
    descent-override: ${fb.descentOverride};
    line-gap-override: ${fb.lineGapOverride};
    size-adjust: ${fb.sizeAdjust};
  }
  `;
        fontFaces += `@font-face {
    font-family: '${font.fontFamily}';      
    src: url('../fonts/${fontFilename}') format('woff');
    font-weight: ${font.fontWeight};
    font-style: ${font.fontStyle};
    font-display: ${font.fontDisplay};
    unicode-range: ${font.unicodeRange};
  }
  
  `;
        fontFacesArr.push({
          ...font,
          src: `url('../fonts/${fontFilename}') format('woff')`,
          location: `${fontsFolder}/${fontFilename}`,
        });
      } else if (font.src.startsWith('http')) {
        try {
          const resp = await fetch(font.src);
          const fontDataBuffer = await resp.arrayBuffer();

          // sanitize font family name
          const u = new URL(font.src);
          const p = path.parse(u.pathname);
          const ext = p.ext?.replace('.', '') || 'woff';
          const fontFilename = `${font.fontFamily.replace(/[^a-z0-9]/gi, '-')}-${font.fontWeight}-${font.fontStyle}.${ext}`.toLowerCase();
          if (!fs.existsSync(`${fontsFolder}/${fontFilename}`)) {
            fs.writeFileSync(`${fontsFolder}/${fontFilename}`, new Uint8Array(fontDataBuffer));
          }

          const fb = computeFallbackFont(`${fontsFolder}/${fontFilename}`, font.fontFamily, font.fontWeight, font.fontStyle);
          fontFBFacesArr.push(fb);
          fontFBFaces += `@font-face {
      font-family: '${fb.fontFamily} Fallback';
      font-style: ${fb.fontStyle};
      font-weight: ${fb.fontWeight};
      src: local('${fb.fallbackFont}');
      ascent-override: ${fb.ascentOverride};
      descent-override: ${fb.descentOverride};
      line-gap-override: ${fb.lineGapOverride};
      size-adjust: ${fb.sizeAdjust};
    }
    `;

          fontFaces += `@font-face {
      font-family: '${font.fontFamily}';      
      src: url('../fonts/${fontFilename}') format('${ext}');');
      font-weight: ${font.fontWeight};
      font-style: ${font.fontStyle};
      font-display: ${font.fontDisplay};
      unicode-range: ${font.unicodeRange};
    }
    
    `;
          fontFacesArr.push({
            ...font,
            src: `url('../fonts/${fontFilename}') format('${ext}')`,
            location: `${fontsFolder}/${fontFilename}`,
          });
        } catch (error) {
          logger.error(error);
          throw error;
        }
      }
    }));

    logger.info('setting up browser page for mobile resolution ...');

    // compute css values for mobile view
    const mobilePage = await page.browser().newPage();
    await mobilePage.setViewport({ width: 600, height: 1080 });
    await mobilePage.goto(url, { waitUntil: 'networkidle2' });

    logger.info('computing CSS values...');

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const computedStylesForDefaultElementsMobile: any = await getCSSValuesForDefaultElements(page);

    logger.silly(`
  /*
    Main fonts sets:
    Adapt variables in styles/styles.css:
  */
  
  --body-font-family: ${bodyFontFamilySet};
  --heading-font-family: ${headingFontFamilySet};
  
  /*
    Fonts Definitions
    Adapt styles/fonts.css:
    (Do not to forget to add the generated font files (under ./fonts folder) into the Github repository)
  */
  
  ${fontFaces}
  
  /*
    Fonts Fallbacks
    Adapt styles/fonts.css:
    (Do not to forget to add the fallback font to the --body-font-family and --heading-font-family variables)
  */
  
  ${fontFBFaces}
  
  /*
    Heading Sizes
    Adapt variables in styles/styles.css:
  */
  
  /* desktop */
  --heading-font-size-xxl: ${computedStylesForDefaultElements.h1[0]['font-size']};
  --heading-font-size-xl: ${computedStylesForDefaultElements.h3[0]['font-size']};
  --heading-font-size-l: ${computedStylesForDefaultElements.h3[0]['font-size']};
  --heading-font-size-m: ${computedStylesForDefaultElements.h4[0]['font-size']};
  --heading-font-size-s: ${computedStylesForDefaultElements.h5[0]['font-size']};
  --heading-font-size-xs: ${computedStylesForDefaultElements.h6[0]['font-size']};
  
  /* mobile */
  --heading-font-size-xxl: ${computedStylesForDefaultElementsMobile.h1[0]['font-size']};
  --heading-font-size-xl: ${computedStylesForDefaultElementsMobile.h2[0]['font-size']};
  --heading-font-size-l: ${computedStylesForDefaultElementsMobile.h3[0]['font-size']};
  --heading-font-size-m: ${computedStylesForDefaultElementsMobile.h4[0]['font-size']};
  --heading-font-size-s: ${computedStylesForDefaultElementsMobile.h5[0]['font-size']};
  --heading-font-size-xs: ${computedStylesForDefaultElementsMobile.h6[0]['font-size']};
  
  `);

    return {
      bodyFontFamilySet,
      headingFontFamilySet,
      fontFaces: fontFacesArr,
      fontFBFaces: fontFBFacesArr.filter((value1, i) => fontFBFacesArr.findIndex(
        (value2) => JSON.stringify(value2) === JSON.stringify(value1),
      ) === i),
      headingFontSizes: {
        xs: {
          desktop: computedStylesForDefaultElements.h6[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h6[0]['font-size'],
        },
        s: {
          desktop: computedStylesForDefaultElements.h5[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h5[0]['font-size'],
        },
        m: {
          desktop: computedStylesForDefaultElements.h4[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h4[0]['font-size'],
        },
        l: {
          desktop: computedStylesForDefaultElements.h3[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h3[0]['font-size'],
        },
        xl: {
          desktop: computedStylesForDefaultElements.h2[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h2[0]['font-size'],
        },
        xxl: {
          desktop: computedStylesForDefaultElements.h1[0]['font-size'],
          mobile: computedStylesForDefaultElementsMobile.h1[0]['font-size'],
        },
      },
    };
  } catch (error) {
    logger.error(error);
    return null;
  }
}
