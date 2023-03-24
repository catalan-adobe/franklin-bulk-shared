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
import lighthouse from 'lighthouse';

export function runLighthouseCheck() {
  return function(action) {
    return async (params) => {
      try {
        // console.info('lighthouse check start');
  
        // main action
        await action(params);

        // run lighthouse
        const {lhr} = await lighthouse(params.url, undefined, undefined, params.page);
 
        params.lighthouse = {
          version: lhr.lighthouseVersion,
          scores: lhr.categories,
        };
      } catch(e) {
        console.error('lighthouse check catch', e);
        params.result = {
          passed: false,
          error: e,
        };
      } finally {
        // console.info('lighthouse check finally');
        return params;
      }
    };
  };
}
