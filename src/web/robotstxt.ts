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

import robotsParser from 'robots-parser';
import type { Robot } from 'robots-parser';

export async function parseRobotsTxt(
  url: string,
  options: {
    timeout?: number,
    httpHeaders?: Record<string, string>,
  } = {},
): Promise<Robot> {
  const reqOptions = {
    timeout: {
      request: options.timeout || 10000,
    },
    headers: {},
  };

  if (options.httpHeaders) {
    reqOptions.headers = options.httpHeaders;
  }

  try {
    const response = await fetch(url, reqOptions);

    if (!response.ok) {
      throw new Error(`parseRobotsTxt (${url}): ${response.status} ${response.statusText}`);
    }

    const robotsTxtRaw = await response.text();
    const robots: Robot = robotsParser(url, robotsTxtRaw);
    /* eslint-disable-next-line dot-notation */
    robots['raw'] = robotsTxtRaw;
    return robots;
  } catch (e) {
    throw new Error(`parse ${url}: ${e}`);
  }
}
