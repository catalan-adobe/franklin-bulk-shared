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
import { buildPathAndFilenameWithPathFromUrl } from '../../url.js';

type CacheResroucesStepOptions = {
  outputFolder?: string;
};

class Deferred {
  logger;

  promise;

  reject;

  resolve;

  constructor(logger) {
    this.logger = logger;
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    }).catch((error) => {
      this.logger.error('deferred error:', error.message);
    });
  }
}

/* eslint-disable-next-line import/prefer-default-export */
export function cacheResources({ outputFolder = `${process.cwd()}/cache` }: CacheResroucesStepOptions = {}) {
  return (action) => async (params) => {
    const cacheFolder = outputFolder; // `${params.outputFolder}`;
    const urlsToCache = [
      /* {
        reqId: "<browser's request id>",
        url: "<https://www.adobe.com/url.html>"",
        done: <promise resolved when url response is caught and processed>
      } */
    ];

    /* eslint-disable no-underscore-dangle */
    async function pageRequestHandler(request) {
      try {
        const url = request.url(); // decodeURIComponent(request.url());
        const u = new URL(url);
        if (urlsToCache.find((el) => el.reqId === request._requestId)) {
          // params.logger.info('url already in caching flow ...');
          return;
        }
        // params.logger.info(`request ${request.resourceType()} ${url}`);
        if (['image', 'stylesheet'].includes(request.resourceType()) && pUtils.extname(u.pathname) !== '' && !u.pathname.endsWith('/') && !url.startsWith('data:image/svg+xml')) {
          const req = {
            reqId: request._requestId,
            url,
            isDone: new Deferred(params.logger),
          };
          urlsToCache.push(req);
        }
      } catch (e) {
        params.logger.error(`page request handler ${request.url()} ${e}`);
        // throw new Error(`error in pageRequestHandler: ${e}`);
      }
    }

    async function pageRequestFailedHandler(request) {
      params.logger.info(`request failed ${request.resourceType()} ${request.url()}`);
      const urlToCache = urlsToCache.find((el) => el.reqId === request._requestId);
      if (urlToCache) {
        params.logger.info(`request failed ${request.url()}: ${request._failureText}`);
        urlToCache.isDone.resolve(`failed: ${request._failureText}`);
      }
    }

    async function pageResponseHandler(response) {
      try {
        const url = response.url(); // decodeURIComponent(response.url());
        const req = await response.request();
        const urlToCache = urlsToCache.find((el) => el.reqId === req._requestId);
        if (urlToCache) {
          const status = response.status();
          if (status >= 300 && status <= 399) {
            // params.logger.info(`redirect from ${url} to ${response.headers().location}`);
            urlToCache.isDone.resolve('redirection');
          } else {
            // params.logger.info(`let's cache url ${url}`);
            try {
              const u = new URL(url);
              const path = u.pathname.substr(0, u.pathname.lastIndexOf('/'));

              const fld = `${cacheFolder}${path}`;
              if (!fs.existsSync(fld)) {
                fs.mkdirSync(fld, { recursive: true });
              }
              const buffer = await response.buffer();

              fs.writeFileSync(`${pUtils.join(cacheFolder, u.pathname)}`, buffer, 'base64');

              urlToCache.isDone.resolve('done');
            } catch (e) {
              params.logger.error('cache-resources error trying to cache image', e);
              urlToCache.isDone.reject('cache-resources error trying to cache image', e);
            }
          }
        // } else {
        //   params.logger.info(`skip caching url ${url}`);
        }
      } catch (e) {
        params.logger.error(`page response handler ${response.url()} ${e}`);
        throw new Error(`error in pageResponseHandler: ${e}`);
      }
    }
    /* eslint-enable no-underscore-dangle */

    try {
      params.logger.info('start cache web resources');

      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(`${cacheFolder}`, { recursive: true });
      }

      params.page.on('request', pageRequestHandler);
      params.page.on('requestfailed', pageRequestFailedHandler);
      params.page.on('response', pageResponseHandler);

      /*
        main browser action
      */

      const newParams = await action(params);
      if (newParams.result && !newParams.result.passed) {
        params.logger.warn('cache web resources - previous action failed, do not continue!');
        return newParams;
      }

      /*
      post browser action
      */

      const urlsToCacheTimeout = setTimeout(() => {
        params.logger.info('all requests promises timeout!');
        urlsToCache.forEach((el) => {
          el.isDone.reject('timeout');
          // params.logger.info(`${el.url} ${el.reqId}`);
        });
      }, 30000);

      try {
        params.logger.info('wait on all requests do be done');
        const allPromises = urlsToCache.map((el) => el.isDone.promise);
        await Promise.all(allPromises);
        params.logger.info('all requests done');

        clearTimeout(urlsToCacheTimeout);

        params.page.off('request', pageRequestHandler);
        params.page.off('requestfailed', pageRequestFailedHandler);
        params.page.off('response', pageResponseHandler);
      } catch (e) {
        throw new Error(`error waiting for all requests to be done via promises: ${e}`);
      }

      let content = await params.page.content();

      // rewrite urls for cached resources
      urlsToCache.forEach((el) => {
        try {
          const u = new URL(el.url);
          const cachedUrl = u.pathname + u.hash;
          content = content.replaceAll(`"${el.url}"`, `"${cachedUrl}"`);
          // params.logger.info(`rewriting url ${el.url} to cached version ${cachedUrl}`);
        } catch (e) {
          throw new Error(`rewrite DOM URL to cache version: ${e}`);
        }
      });

      const [p, filename] = buildPathAndFilenameWithPathFromUrl(params.url);
      const path = pUtils.join(cacheFolder, p);

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      fs.writeFileSync(pUtils.join(path, filename), content);
      params.dom = content;

      // dump page headers
      if (params.headers) {
        fs.writeFileSync(`${filename}.headers.json`, JSON.stringify(params.headers, null, 2));
      }

      params.logger.info('stop cache web resources');
    } catch (e) {
      params.logger.error('cache web resources catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    }

    params.logger.info('cache web resources finally');
    return params;
  };
}
