/* global describe, it */

import { expect } from 'chai';
import { isValid, isValidHTTP } from '../src/url.js';

describe('isValid', () => {
  it('should return a URL object for valid URLs', () => {
    expect(isValid('http://example.com')).to.be.a('URL');
    expect(isValid('https://example.com')).to.be.a('URL');
  });

  it('should return null for invalid URLs', () => {
    expect(isValid('01.02.24')).to.equal(null);
    expect(isValid('example.com')).to.equal(null);
  });

  it('should return a URL object for URLs with supported protocols', () => {
    expect(isValid('http://example.com', ['http:'])).to.be.a('URL');
    expect(isValid('https://example.com', ['https:'])).to.be.a('URL');
  });

  it('should return null for URLs with unsupported protocols', () => {
    expect(isValid('http://example.com', ['https:'])).to.equal(null);
    expect(isValid('https://example.com', ['http:'])).to.equal(null);
  });
});

describe('isValidHTTP', () => {
  it('should return a URL object for valid HTTP URLs', () => {
    expect(isValidHTTP('http://example.com')).to.be.a('URL');
    expect(isValidHTTP('https://example.com')).to.be.a('URL');
  });

  it('should return null for invalid HTTP URLs', () => {
    expect(isValidHTTP('ftp://example.com')).to.equal(null);
    expect(isValidHTTP('file://example.com')).to.equal(null);
    expect(isValidHTTP('example.com')).to.equal(null);
  });
});
