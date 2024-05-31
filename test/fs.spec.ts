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
import { sanitizeForFS, computeFSDetailsFromUrl } from '../src/fs';

describe('sanitizeForFS', () => {
  test.each([
    ['Hello World', 'hello_world'],
    ['Lorem Ipsum 123', 'lorem_ipsum_123'],
    ['!@#$%^&*()', '__________'],
    ['This is a test', 'this_is_a_test'],
    ['12345', '12345'],
  ])('should sanitize string for file system %s', (input, expected) => {
    expect(sanitizeForFS(input)).toBe(expected);
  });
});

describe('computeFSDetailsFromUrl', () => {
  test('throw an error for invalid urls', () => {
    expect(() => { computeFSDetailsFromUrl('dummy'); }).toThrow(/^extract details from url/);
  });

  test.each([
    ['https://example.com/path/to/file.html', {
      hostname: 'example_com',
      path: '/path/to',
      filename: 'file',
      extension: '.html',
    }],
    ['https://www.google.com/search?q=github+copilot', {
      hostname: 'www_google_com',
      path: '/',
      filename: 'search',
      extension: '',
    }],
    ['https://docs.microsoft.com/en-us/', {
      hostname: 'docs_microsoft_com',
      path: '/en-us',
      filename: 'index',
      extension: '',
    }],
    ['https://www.amazon.co.uk/dp/B08H8STK61', {
      hostname: 'www_amazon_co_uk',
      path: '/dp',
      filename: 'b08h8stk61',
      extension: '',
    }],
  ])('should compute FS details from URL %s', (input, expected) => {
    expect(computeFSDetailsFromUrl(input)).toEqual(expected);
  });
});
