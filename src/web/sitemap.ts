/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* TODO - eslint is complaining even though the import works at runtime */
import { createGunzip } from 'zlib';
import { pipeline, Readable } from 'stream';
// import { ReadableStream as WebReadableStream } from 'stream/web';
import { promisify } from 'util';
import expat from 'node-expat';
import { Logger } from '../logger.js';

export type Sitemap = {
  url: string;
  sitemaps?: Sitemap[];
  lastMod?: string;
  urls?: string[];
};

const streamPipeline = promisify(pipeline);

// // Helper function to convert Web Stream to Node.js Readable Stream
// function webToNodeStream(webStream) {
//   const reader = webStream.getReader();
//   return new Readable({
//     async read() {
//       const { done, value } = await reader.read();
//       if (done) {
//         this.push(null); // End the stream
//       } else {
//         this.push(Buffer.from(value)); // Push the chunk into the Node.js stream
//       }
//     },
//   });
// }

async function parseStreamXMLSitemap(url, fetchOptions, timeout) {
  const sitemaps = [];
  const urls = [];
  let currentElement = null;
  let currentLoc = '';

  const result = {
    url,
    sitemaps: [],
    urls: [],
    error: null,
  };

  let response = null;

  try {
    // Fetch the sitemap.xml.gz using native fetch API
    try {
      response = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(timeout),
      });
    } catch (e) {
      throw new Error(`Failed to fetch the sitemap. ${e.message}`);
    }

    if (!response?.ok) {
      throw new Error(`Failed to fetch the sitemap. Status: ${response.status}`);
    }

    // Check the Content-Encoding and Content-Type to determine if the content is compressed
    const contentEncoding = response.headers.get('content-encoding');
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('html')) {
      throw new Error(`Failed to fetch the sitemap. Content-Type: ${contentType}`);
    }

    const isGzipped = contentEncoding
      ? (contentEncoding === 'gzip' && contentType && (contentType.includes('gzip') || contentType.includes('application/octet-stream')))
      : (
        (contentType && contentType.includes('gzip'))
        || url.endsWith('.gz')
      );

    // Convert the web response body to a Node.js readable stream
    let bodyStream = Readable.fromWeb(response.body);

    // If the content is gzipped, add the gunzip decompression stream
    if (isGzipped) {
      const gunzip = createGunzip();
      bodyStream = bodyStream.pipe(gunzip); // Pipe the body stream to gunzip
    }

    // Create an expat parser
    const parser = new expat.Parser('utf-8');

    // Listen for XML 'startElement' and 'endElement' events
    parser.on('startElement', (name) => {
      currentElement = name;

      // Reset the currentLoc when a new element starts
      if (name === 'sitemap' || name === 'url') {
        currentLoc = '';
      }
    });

    parser.on('endElement', (name) => {
      // Capture the <loc> URL within <sitemap> and <url>
      if (name === 'sitemap' && currentLoc !== '') {
        sitemaps.push(currentLoc);
      } else if (name === 'url' && currentLoc !== '') {
        urls.push(currentLoc);
      }

      // Reset the currentElement after it ends
      currentElement = null;
    });

    // Capture the <loc> tag content inside <sitemap> or <url>
    parser.on('text', (text) => {
      if (currentElement === 'loc') {
        currentLoc += text; // Save the current location (URL)
      }
    });

    parser.on('error', (error) => {
      console.error('Error during parsing:', error);
      result.error = error;
    });

    // Stream pipeline
    await streamPipeline(
      bodyStream, // The (possibly decompressed) response stream
      /* eslint-disable-next-line require-yield */
      async function* f(source) {
        for await (const chunk of source) {
          parser.parse(chunk); // Parse chunk by chunk
        }
      },
    );

    result.sitemaps = sitemaps;
    result.urls = urls;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch or parse the sitemap. ${error.cause || error.message}`);
  }
}

export async function parseSitemapFromUrl(
  url: string,
  options: {
    timeout?: number,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    signal?: any,
    httpHeaders?: Record<string, string>,
    logger?: Logger,
  } = {},
): Promise<Sitemap> {
  const timeout = options.timeout || 10000;
  try {
    const reqOptions: RequestInit = {
      headers: {},
    };
    if (options.httpHeaders) {
      reqOptions.headers = options.httpHeaders;
    }

    const sitemapObject = await parseStreamXMLSitemap(url, reqOptions, timeout);

    return { url, sitemaps: sitemapObject.sitemaps, urls: sitemapObject.urls };
  } catch (e) {
    throw new Error(`parseSitemapFromUrl (${url}): ${e.cause || e.message}`);
  }
}
