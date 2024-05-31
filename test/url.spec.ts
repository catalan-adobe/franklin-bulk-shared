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
import { describe, expect, test } from '@jest/globals';
import { isValid, isValidHTTP } from '../src/url';

describe('isValid', () => {
  test('should return a URL object for valid URLs', () => {
    expect(isValid('http://example.com')).toBeInstanceOf(URL);
    expect(isValid('https://example.com')).toBeInstanceOf(URL);
  });

  test('should return null for invalid URLs', () => {
    expect(isValid('01.02.24')).toBe(null);
    expect(isValid('example.com')).toBe(null);
  });

  test('should return a URL object for URLs with supported protocols', () => {
    expect(isValid('http://example.com', ['http:'])).toBeInstanceOf(URL);
    expect(isValid('https://example.com', ['https:'])).toBeInstanceOf(URL);
  });

  test('should return null for URLs with unsupported protocols', () => {
    expect(isValid('http://example.com', ['https:'])).toBe(null);
    expect(isValid('https://example.com', ['http:'])).toBe(null);
  });
});

describe('isValidHTTP', () => {
  test('should return a URL object for valid URLs', () => {
    expect(isValidHTTP('http://example.com')).toBeInstanceOf(URL);
    expect(isValidHTTP('https://example.com')).toBeInstanceOf(URL);
  });

  test('should return null for invalid URLs', () => {
    expect(isValidHTTP('01.02.24')).toBe(null);
    expect(isValidHTTP('example.com')).toBe(null);
    expect(isValidHTTP('ftp://example.com')).toBe(null);
  });

  test('should return a URL object for URLs with supported protocols', () => {
    expect(isValidHTTP('http://example.com')).toBeInstanceOf(URL);
    expect(isValidHTTP('https://example.com')).toBeInstanceOf(URL);
  });
});
