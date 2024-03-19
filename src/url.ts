import path from 'path';

export function buildPathAndFilenameWithPathFromUrl(url, suffix = '', extension = 'html') {
  const u = new URL(url);
  const p = path.parse(u.pathname); // path

  if (u.pathname.lastIndexOf('/') === u.pathname.length - 1) {
    p.name = 'index';
    p.dir = path.join(p.dir, p.base);
  }

  if (suffix) {
    p.name += `.${suffix}`;
  }

  const matches = /.*\.?htm.*$/.exec(p.base);

  if (!matches) {
    p.ext = '.html';
  }

  if (extension !== 'html') {
    p.ext = `.${extension}`;
  }

  return [p.dir, p.name + p.ext];
}

export function buildFilenameWithPathFromUrl(url, suffix = '', extension = 'html') {
  const res = buildPathAndFilenameWithPathFromUrl(url, suffix, extension);
  return path.join(...res);
}

export function sanitizeURL(url) {
  try {
    const u = new URL(url);
    let s = u.origin + u.pathname;
    s = s.replaceAll(/[/.,:]/g, '_');
    return s;
  } catch (e) {
    throw new Error(`: ${e}`);
  }
}

export function getPlainHtmlUrl(url) {
  if (url.endsWith('/')) {
    return `${url}index.plain.html`;
  }

  const u = new URL(url);

  const p = path.parse(u.pathname);
  p.base = '';
  p.ext = '.plain.html';

  u.pathname = path.format(p);

  return u.toString();
}

export function extractDetailsFromUrl(url) {
  const u = new URL(url);
  const p = path.parse(u.pathname); // path

  if (u.pathname.lastIndexOf('/') === u.pathname.length - 1) {
    p.name = 'index';
    p.dir = path.join(p.dir, p.base);
  }

  return {
    host: u.host.replaceAll(/[:.]/g, '_'),
    path: p.dir,
    filename: p.name,
    extension: p.ext,
  };
}

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
  } catch (err) {
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
