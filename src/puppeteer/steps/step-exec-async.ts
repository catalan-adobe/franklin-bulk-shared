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

/* eslint-disable-next-line import/prefer-default-export */
export function execAsync(fn) {
  return (action) => async (params) => {
    try {
      // main action
      await action(params);

      params.logger.debug('executing custom script ...');

      await fn(params.page);

      params.logger.debug('custom script executed');
    } catch (e) {
      params.logger.error('execute script catch', e);
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
