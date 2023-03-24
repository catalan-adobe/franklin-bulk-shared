Franklin Bulk Operations Shared Library
===



## Install

```
npm install https://gitpkg.now.sh/catalan-adobe/franklin-bulk-shared
```



## Usage

Sample script that takes a screenshot of the bottom of a page:

```js
// take-screenshot.js

import * as franklin from 'franklin-bulk-shared';
  
// init headless browser
const [browser, page] = await franklin.Puppeteer.initBrowser();

// load test page
await page.goto('https://www.hlx.live');

// scroll down
await franklin.Puppeteer.scrollDown(page);

// wait 1s.
await franklin.Time.sleep(1000);

// take a screenshot
await page.screenshot({
  fullPage: false,
  path: 'screenshot.png'
});

// close browser
await browser.close();
```


## Domains

* Puppeteer (_`initBrowserAgent`_, _`scrollDown`_, _`scrollUp`_)
* Time (_`sleep`_, _`randomSleep`_)
