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
import { sleep } from '../../time.js';

type SmartScrollStepOptions = {
  postReset?: boolean;
};

/* eslint-disable-next-line import/prefer-default-export */
export function smartScroll({ postReset = true }: SmartScrollStepOptions = {}) {
  return (action) => async (params) => {
    try {
      params.logger.info('start smart scroll');

      const newParams = await action(params);
      if (newParams.result && !newParams.result.passed) {
        params.logger.warn('smart scroll - previous action failed, do not continue!');
        return newParams;
      }

      /*
       * scroll
       */

      for (let i = 0; i < 10; i += 1) {
        /* eslint no-await-in-loop: "off" */
        await params.page.evaluate(() => {
          window.scrollTo({ left: 0, top: window.document.body.scrollHeight, behavior: 'smooth' });
        });
        await sleep(500);
      }

      if (postReset) {
        await params.page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await sleep(1000);
      }

      params.logger.info('stop smart scroll');
    } catch (e) {
      params.logger.error('smart scroll catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    } finally {
      params.logger.info('smart scroll finally');
    }
    return params;
  };
}
