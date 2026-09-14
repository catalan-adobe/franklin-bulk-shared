// Stub for index.ts — breaks the ESM/native-module transitive chain in Jest tests.
// qualifyURLsForCrawl only needs Web.getLanguageFromURL from this module.
export const Web = {
  getLanguageFromURL: () => '',
  extractLinks: () => [],
  parseSitemapFromUrl: async () => ({ urls: [], sitemaps: [] }),
  parseRobotsTxt: async () => ({ raw: '', getSitemaps: () => [] }),
};
