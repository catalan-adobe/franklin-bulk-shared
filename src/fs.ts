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
import path from 'path';

export function sanitizeForFS(s: string): string {
  return Buffer.from(s).toString('utf8')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-_]/g, '_');
}

export function computeFSDetailsFromUrl(url: string): {
  hostname: string,
  path: string,
  filename: string,
  extension: string
} {
  try {
    const u = new URL(url);

    if (u.pathname.endsWith('/')) {
      u.pathname += 'index';
    }
    const p = path.parse(u.pathname);

    return {
      hostname: sanitizeForFS(u.hostname),
      path: p.dir.split('/').map(sanitizeForFS).join('/'),
      filename: sanitizeForFS(p.name),
      extension: p.ext,
    };
  } catch (e) {
    throw new Error(`extract details from url: ${e}`);
  }
}
