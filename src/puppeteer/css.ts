import { Browser, Page } from 'puppeteer-core';

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

export async function getMinimalCSSForCurrentPage(page: Page) {
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
