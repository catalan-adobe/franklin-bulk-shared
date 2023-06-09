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
