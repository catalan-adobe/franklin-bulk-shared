import fs from 'fs';
import fontpie from 'fontpie-calc';
import { Browser, Page } from 'puppeteer-core';
import path from 'path';

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

function computeFallbackFont(file, name) {
  const ff = fontpie(file, { name });
  return ff;
}

export async function getMinimalCSSForCurrentPage(page: Page) {
  const client = await page.createCDPSession();
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  client.on('CSS.fontsUpdated', (e) => {
    console.log(e);
  });

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

export async function getMinimalCSSForAEMBoilerplateFromCurrentPage(page: Page) {
  const client = await page.createCDPSession();
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  const fonts = [];
  client.on('CSS.fontsUpdated', (e) => {
    if (e.font) {
      fonts.push(e);
    }
  });

  await page.setViewport({ width: 1440, height: 1080 });
  await page.reload();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const computedStylesForDefaultElements: any = await getCSSValuesForDefaultElements(page);

  const bodyFontFamilySet = computedStylesForDefaultElements.p[0]['font-family'];
  const headingFontFamilySet = computedStylesForDefaultElements.h1[0]['font-family'];

  const mainBodyFont = bodyFontFamilySet.split(',')[0].trim().replace(/['"]+/g, '');
  const mainHeadingFont = headingFontFamilySet.split(',')[0].trim().replace(/['"]+/g, '');

  let bodyFontFBDone = false;
  let headingFontFBDone = false;

  let fontFaces = '';
  let fontFBFaces = '';
  const fontFacesArr = [];
  const fontFBFacesArr = [];

  fonts.forEach(async (f) => {
    const { font } = f;

    if (font.src.includes('data:application/x-font-woff;base64')) {
      console.log('Embedded font detected:', font.src.slice(0, 100));
      const fontData = font.src.split('data:application/x-font-woff;base64,').pop();
      const fontDataBuffer = Buffer.from(fontData, 'base64');
      // sanitize font family name
      const fontFilename = `${font.fontFamily.replace(/[^a-z0-9]/gi, '-')}-${font.fontWeight}-${font.fontStyle}`.toLowerCase();
      fs.writeFileSync(`./fonts/${fontFilename}.woff`, fontDataBuffer);

      if (font.fontFamily === mainBodyFont && !bodyFontFBDone) {
        const fb = computeFallbackFont(`./fonts/${fontFilename}.woff`, font.fontFamily.replace(/[^a-z0-9]/gi, '-'));
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
        bodyFontFBDone = true;
      }
      if (font.fontFamily === mainHeadingFont && !headingFontFBDone) {
        const fb = computeFallbackFont(`./fonts/${fontFilename}.woff`, font.fontFamily.replace(/[^a-z0-9]/gi, '-'));
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
        headingFontFBDone = true;
      }
      fontFaces += `@font-face {
  font-family: '${font.fontFamily}';      
  src: url('../fonts/${fontFilename}.woff') format('woff');
  font-weight: ${font.fontWeight};
  font-style: ${font.fontStyle};
  font-display: ${font.fontDisplay};
  unicode-range: ${font.unicodeRange};
}

`;
      fontFacesArr.push({
        ...font,
        src: `url('../fonts/${fontFilename}.woff') format('woff')`,
      });
    } else if (font.src.startsWith('http')) {
      console.log('External font detected:', font.src);
      const resp = await fetch(font.src);
      const fontDataBuffer = await resp.arrayBuffer();

      // sanitize font family name
      const u = new URL(font.src);
      const p = path.parse(u.pathname);
      const ext = p.ext.replace('.', '');
      const fontFilename = `${font.fontFamily.replace(/[^a-z0-9]/gi, '-')}-${font.fontWeight}-${font.fontStyle}.${ext}`.toLowerCase();
      if (!fs.existsSync(`./fonts/${fontFilename}`)) {
        fs.writeFileSync(`./fonts/${fontFilename}`, new Uint8Array(fontDataBuffer));
      }

      if (font.fontFamily === mainBodyFont && !bodyFontFBDone) {
        const fb = computeFallbackFont(`./fonts/${fontFilename}.woff`, font.fontFamily.replace(/[^a-z0-9]/gi, '-'));
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
        bodyFontFBDone = true;
      }
      if (font.fontFamily === mainHeadingFont && !headingFontFBDone) {
        const fb = computeFallbackFont(`./fonts/${fontFilename}.woff`, font.fontFamily.replace(/[^a-z0-9]/gi, '-'));
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
        headingFontFBDone = true;
      }
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
        src: `url('../fonts/${fontFilename}.woff') format('woff')`,
      });
    }
  });

  // compute css values for mobile view
  await page.setViewport({ width: 600, height: 1080 });
  await page.reload();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const computedStylesForDefaultElementsMobile: any = await getCSSValuesForDefaultElements(page);

  console.log(`
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
    fontFBFaces: fontFBFacesArr,
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
}
