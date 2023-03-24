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

import pUtils from 'path';
import * as fs from 'fs';
import http from 'http';
import { Buffer } from 'node:buffer';
import { AddressInfo } from 'net';

import finalhandler from 'finalhandler';
import serveStatic from 'serve-static';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';
import {
  DOMUtils,
  FileUtils,
  Blocks,
  html2docx,
  Loader,
} from '@adobe/helix-importer';
import { buildPathAndFilenameWithPathFromUrl } from '../../url.js';

async function downloadIfNotCachedYet(url, cacheFolder, params) {
  const imgPath = pUtils.join(cacheFolder, url.pathname);
  params.logger.log('downloadIfNotCachedYet', imgPath);

  if (!fs.existsSync(pUtils.dirname(imgPath))) {
    fs.mkdirSync(pUtils.dirname(imgPath), { recursive: true });
  }

  if (!fs.statSync(imgPath, { throwIfNoEntry: false })) {
    params.logger.log('downloadIfNotCachedYet', 'image not cached yet! download it!');

    params.logger.log('fetch');
    const response = await fetch(url.href);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFileSync(imgPath, buffer);
  }
}

// Franklin import

/*
 * Mimic helix-importer-ui global object WebImporter to be able
 * to re-use existing import scripts without modification
 */
global.WebImporter = {
  Blocks,
  DOMUtils,
  FileUtils,
  Loader,
};

let mainParams = {
  outputFolder: '',
};

// const docxStylesXML = fs.readFileSync(pUtils.resolve(pUtils.dirname(''), >>>
// <<< './resources/helix-importer/docstyles.xml'), 'utf-8');

const options = {
  // disable helix-importer function because of getComputedStyle performance issue
  // known jsDOM issue: https://github.com/jsdom/jsdom/issues/3234, https://github.com/jsdom/jsdom/pull/3482
  setBackgroundImagesFromCSS: false,
  // docxStylesXML,
  image2png: async ({ source /* , data, type */ }) => {
    const src = decodeURIComponent(source);

    const u = new URL(src);
    const imagePath = pUtils.join(mainParams.outputFolder, u.pathname);

    const img = sharp(imagePath);
    const metadata = await img.metadata();

    const { width } = metadata;
    const { height } = metadata;

    const bufData = await img
      .toFormat('png')
      .toBuffer();

    // console.log('converted', type, 'to png', src, width, height/* , info.size */);

    return {
      data: bufData,
      width,
      height,
      type: 'image/png',
    };
  },
};

const makeProxySrcs = async (main, host, port, params) => {
  const imgs = main.querySelectorAll('img');
  params.logger.log(`Images <img/> length: ${imgs.length}`);
  for (let i = 0; i < imgs.length; i += 1) {
    params.logger.log(`image index: ${i}`);
    const img = imgs[i];
    img.src = decodeURIComponent(img.src);
    params.logger.log('old img.src', img.src);
    if (img.src.startsWith('//')) {
      // golfdigest.com -  add missing protocol
      img.src = `https:${img.src}`;
    }
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);

      params.logger.log(`BEFORE downloadIfNotCachedYet ${u}`);
      /* eslint no-await-in-loop: "off" */
      await downloadIfNotCachedYet(u, mainParams.outputFolder, params);
      params.logger.log(`AFTER downloadIfNotCachedYet${u}`);

      u.searchParams.append('host', u.origin);
      const src = `http://localhost:${port}`;
      img.src = pUtils.join(src, u.pathname) + u.search;
      params.logger.log('new img.src', img.src);
    } catch (error) {
      params.logger.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
  }
};

type FranklinImportStepOptions = {
  importerSrcFolder: string;
  outputFolder?: string;
  saveMD?: boolean;
};

/* eslint-disable-next-line import/prefer-default-export */
export function franklinImportPage({
  importerSrcFolder,
  outputFolder = `${process.cwd()}/import`,
  saveMD = false,
}: FranklinImportStepOptions) {
  return (action) => async (params) => {
    try {
      /*
          before main browser step
        */

      mainParams = params;
      mainParams.outputFolder = outputFolder;

      params.logger.info('start franklin import page');

      const u = new URL(params.url);
      const [path, filename] = buildPathAndFilenameWithPathFromUrl(params.url, '', 'docx');
      const docxLocalFolder = pUtils.join(outputFolder, 'docx', path);
      if (!fs.existsSync(docxLocalFolder)) {
        fs.mkdirSync(docxLocalFolder, { recursive: true });
      }

      /*
          main browser step
        */

      const newParams = await action(params);
      if (newParams.result && !newParams.result.passed) {
        params.logger.warn('franklin import page - previous action failed, do not continue!');
        return newParams;
      }

      /*
          after main browser step
        */

      // start webserver to serve cached resources
      const serve = serveStatic(outputFolder);

      // Create server
      const server = http.createServer((req, res) => {
        serve(req, res, finalhandler(req, res));
      });
        // Listen
      server.listen(0);

      const { port } = server.address() as AddressInfo;

      params.logger.info(`cache proxy server listening on port ${port}`);

      params.logger.info('get page content');

      /*
         * franklin import
         */

      // get fully rendered dom
      const content = await params.page.content();

      params.logger.info('new JSDOM');

      const dom = new JSDOM(content);

      params.logger.log('typeof content');
      params.logger.log(typeof content);
      params.logger.log(typeof dom);

      await makeProxySrcs(dom.window.document, u.origin, port, params);

      params.logger.info('Transforming DOM');

      params.logger.log(dom.window.document);

      params.logger.info('Transformed DOM');

      params.logger.info('html2docx');

      const importer = await import(importerSrcFolder);
      params.logger.info(importer.default);

      const docs = await html2docx(params.url, dom.window.document, importer.default, options);

      params.logger.info('Stop proxy server');

      server.close();

      fs.writeFileSync(pUtils.join(docxLocalFolder, filename), docs.docx);

      if (saveMD) {
        const [p, f] = buildPathAndFilenameWithPathFromUrl(params.url, '', 'md');
        const mdLocalFolder = pUtils.join(outputFolder, 'md', p);
        if (!fs.existsSync(mdLocalFolder)) {
          fs.mkdirSync(mdLocalFolder, { recursive: true });
        }
        fs.writeFileSync(pUtils.join(mdLocalFolder, f), docs.md);
      }

      // params.logger.info(docs.md);

      params.logger.info('stop franklin import page');
    } catch (e) {
      params.logger.error('franklin import catch', e);
      params.result = {
        passed: false,
        error: e,
      };
    }

    params.logger.info('franklin import page finally');
    return params;
  };
}
