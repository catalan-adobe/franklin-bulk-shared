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

import fs from 'fs';
import pUtils from 'path';
import { buildPathAndFilenameWithPathFromUrl } from '../../url.js';

type FullPageScreenshotStepOptions = {
  outputFolder?: string;
};

/* eslint-disable-next-line import/prefer-default-export */
export function fullPageScreenshot({ outputFolder = `${process.cwd()}/screenshots` }: FullPageScreenshotStepOptions = {}) {
  return (action) => async (params) => {
    params.logger.info('start fullpage screenshot');

    const newParams = await action(params);
    if (newParams.result && !newParams.result.passed) {
      params.logger.warn('fullpage screenshot - previous action failed, do not continue!');
      return newParams;
    }

    const [p, filename] = buildPathAndFilenameWithPathFromUrl(params.url, 'screenshot', 'png');
    const path = pUtils.join(outputFolder, p);

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    await params.page.screenshot({
      path: pUtils.join(path, filename),
      fullPage: true,
    });

    params.logger.info('stop fullpage screenshot');

    return params;
  };
}
