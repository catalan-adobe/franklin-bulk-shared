import robotsParser from 'robots-parser';
import type { Robot } from 'robots-parser';

export async function parseRobotsTxt(
  url: string,
  options: {
    timeout?: number,
    userAgent?: string,
  } = {},
): Promise<Robot> {
  const reqOptions = {
    timeout: {
      request: options.timeout || 10000,
    },
    headers: {},
  };

  if (options.userAgent) {
    reqOptions.headers = {
      'User-Agent': options.userAgent,
    };
  }

  try {
    const response = await fetch(url, reqOptions);

    if (!response.ok) {
      throw new Error(`parseRobotsTxt (${url}): ${response.status} ${response.statusText}`);
    }

    const robotsTxtRaw = await response.text();
    // @ts-expect-error - unknown not callable error
    const robots: Robot = robotsParser(url, robotsTxtRaw);
    /* eslint-disable @typescript-eslint/dot-notation */
    robots['raw'] = robotsTxtRaw;
    return robots;
  } catch (e) {
    throw new Error(`parse ${url}: ${e}`);
  }
}
