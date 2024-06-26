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
import lighthouse, { Flags } from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/lr-desktop-config.js';
import mobileConfig from 'lighthouse/core/config/lr-mobile-config.js';

/* eslint-disable-next-line import/prefer-default-export */
export function runLighthouseCheck() {
  return (action) => async (params) => {
    try {
      // main action
      await action(params);

      params.logger.debug('running lighthouse check ...');

      const lhOptions: Flags = {
        logLevel: 'error',
        output: 'json',
        disableFullPageScreenshot: true,
        onlyCategories: ['accessibility', 'best-practices', 'performance', 'seo'],
      };

      const lhConfig = params.type === 'desktop' ? desktopConfig : mobileConfig;

      // run lighthouse
      const resp = await lighthouse(params.url, lhOptions, lhConfig, params.page);

      params.lighthouse = {
        version: resp.lhr.lighthouseVersion,
        scores: resp.lhr.categories,
        reportFull: resp,
      };

      params.logger.debug('lighthouse check executed');
    } catch (e) {
      params.logger.error('lighthouse check catch', e);
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
