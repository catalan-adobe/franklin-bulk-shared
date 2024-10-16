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

import { ietf } from './ietf.js';

/**
 * Checks if a given URL is valid.
 *
 * @param url - The URL to validate.
 * @param protocols - An optional array of allowed protocols. If provided, the URL's protocol must
 *                    be included in this array to be considered valid.
 * @returns The valid URL object if the URL is valid and matches the allowed protocols, or `null`
 *          otherwise.
 */
export function isValid(url: string, protocols:Array<string> | null = null): URL | null {
  try {
    const u = new URL(url);
    if (protocols && !protocols.includes(u.protocol)) {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

/**
 * Checks if a given URL is a valid HTTP or HTTPS URL.
 *
 * @param url - The URL to check.
 * @returns The valid URL object if the URL is valid and matches the http protocols, or `null`
 *          otherwise.
 */
export function isValidHTTP(url: string): URL | null {
  return isValid(url, ['http:', 'https:']);
}

/**
 * Extract language from URL.
 * @param url - The URL to extract language from.
 * @returns The language extracted from the URL or null if unknown or not set.
 */
export function getLanguageFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const found = ietf.find((i) => urlObj.pathname.split('/').slice(1, 3).find((p) => p === i.tag || p === i.ietf));
    return found ? found.ietf : null;
  } catch {
    return null;
  }
}
