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
import { computeFSDetailsFromUrl } from '../../fs.js';

type FullPageScreenshotStepOptions = {
  outputFolder?: string;
};

/* eslint-disable-next-line import/prefer-default-export */
export function fullPageScreenshot({ outputFolder = `${process.cwd()}/screenshots` }: FullPageScreenshotStepOptions = {}) {
  return (action) => async (params) => {
    try {
      const newParams = await action(params);
      if (newParams.result && !newParams.result.passed) {
        params.logger.warn('fullpage screenshot - previous action failed, do not continue!');
        return newParams;
      }

      params.logger.debug('taking fullpage screenshot...');

      const urlFSDetails = computeFSDetailsFromUrl(params.url);
      const path = pUtils.join(outputFolder, urlFSDetails.path);
      const filename = `${urlFSDetails.filename}.screenshot.png`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }

      await params.page.screenshot({
        path: pUtils.join(path, filename),
        fullPage: true,
      });

      params.logger.debug(`took fullpage screenshot for ${params.url}`);

      params.screenshotPath = pUtils.join(path, filename);
    } catch (e) {
      params.logger.error(`full page screenshotsmart scroll catch: ${e.stack}`);
      params.result = {
        passed: false,
        error: e,
      };
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return params;
    }
  };
}
