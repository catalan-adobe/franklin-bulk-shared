// @ts-nocheck
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
// @ts-nocheck
import desktopConfig from 'lighthouse/core/config/lr-desktop-config.js';
// @ts-nocheck
import mobileConfig from 'lighthouse/core/config/lr-mobile-config.js';

/* eslint-disable-next-line import/prefer-default-export */
export function runLighthouseCheck() {
  return (action) => async (params) => {
    try {
      // main action
      await action(params);

      const lhOptions: Flags = {
        logLevel: 'error',
        output: 'json',
        disableFullPageScreenshot: true,
        detailed: true,
        chromeFlags: [
          '--disable-gpu', // disable gpu acceleration
          '--headless', // run chrome in headless mode
          '--no-sandbox', // disable chrome sandbox mode
          '--no-zygote', // disable the zygote process (https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux/zygote.md)
          '--no-first-run', // disable first run beacon (e.g. first run wizard)
          '--disable-storage-reset', //  disable resetting the local storage at the end
          '--disable-features=TranslateUI,BlinkGenPropertyTrees', // disable some unnecessary chrome features
          '--max-wait-for-load=120000', // LH waits up to 20s for the page to load
        ],
        onlyCategories: ['accessibility', 'best-practices', 'performance', 'seo'],
      };

      const lhConfig = params.type === 'desktop' ? desktopConfig : mobileConfig;

      // run lighthouse
      const resp = await lighthouse(params.url, lhOptions, lhConfig, params.page);

      params.lighthouse = {
        version: lhr.lighthouseVersion,
        scores: lhr.categories,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      params.logger.error('lighthouse check catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    }

    return params;
  };
}
