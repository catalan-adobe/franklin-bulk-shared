import { got } from 'got';
import { JSDOM } from 'jsdom';
import { getPlainHtmlUrl } from './url.js';

export async function getBlocksStats(url: string) {
  const reqOptions = {
    timeout: {
      request: 60000, // default 1 minute timeout
    },
  };

  const ptUrl = getPlainHtmlUrl(url);

  const resp = await got(ptUrl, reqOptions);

  if (resp.redirectUrls.length > 0) {
    throw new Error(`redirection caught for url ${ptUrl}, do not collect blocks statistics`);
  } else if (!resp.ok) {
    throw new Error(`error fetching url ${ptUrl} (${resp.statusCode}, ${resp.statusMessage}), do not collect blocks statistics`);
  } else {
    const { document } = (new JSDOM(resp.body)).window;

    const divsWithClass = document.querySelectorAll('div[class]');

    const blocks = {};
    for (let i = 0; i < divsWithClass.length; i += 1) {
      const div = divsWithClass[i];
      const classes = [div.className];
      // TODO: check if collecting stats for each class found is needed
      // if (div.className.indexOf(' ') > -1) {
      //   classes.push(...div.className.split(' '));
      // }
      classes.forEach((c) => {
        if (!blocks[c]) {
          blocks[c] = 0;
        }
        blocks[c] += 1;
      });
    }

    return blocks;
  }
}
