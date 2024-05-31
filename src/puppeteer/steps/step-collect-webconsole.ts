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

type CollectWebconsoleStepOptions = {
  outputFolder?: string;
};
/* eslint-disable-next-line import/prefer-default-export */
export function webConsoleMessages({ outputFolder = `${process.cwd()}/webconsole` }: CollectWebconsoleStepOptions = {}) {
  return (action) => async (params) => {
    const messages = [];

    params.page.on('console', (message) => {
      messages.push({
        args: message.args(),
        location: message.location(),
        stackTrace: message.stackTrace(),
        text: message.text(),
        type: message.type(),
      });
    });

    await action(params);

    const urlFSDetails = computeFSDetailsFromUrl(params.url);
    const path = pUtils.join(outputFolder, urlFSDetails.path);
    const filename = `${urlFSDetails.filename}.webconsole.json`;

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    const data = JSON.stringify(messages, null, 2);
    fs.writeFileSync(pUtils.join(path, filename), data);

    return params;
  };
}
