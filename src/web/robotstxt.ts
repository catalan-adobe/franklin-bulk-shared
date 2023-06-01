import got from 'got';
import robotsParser from 'robots-parser';
import type { Robot } from 'robots-parser';

export async function parseRobotsTxt(
  url: string,
  options: { timeout?: number } = {},
): Promise<Robot> {
  const reqOptions = {
    timeout: {
      request: options.timeout || 10000,
    },
  };

  try {
    const response = await got(url, reqOptions);
    // @ts-expect-error - unknown not callable error
    const robots: Robot = robotsParser(url, response.body);
    return robots;
  } catch (e) {
    throw new Error(`parse ${url}: ${e}`);
  }
}
