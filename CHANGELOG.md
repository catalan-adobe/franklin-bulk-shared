# [1.29.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.28.1...v1.29.0) (2024-10-16)


### Bug Fixes

* **build:** fix test execution ([c8a9598](https://github.com/catalan-adobe/franklin-bulk-shared/commit/c8a9598fedc4d36b9191a5fba56675674788a3b1))
* **crawl:** support edge case where sitemap contains only 1 sitemap url ([e057103](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e057103595a4375ccb4ba4ce596ccf87c7c293de))
* fix ietf url test ([4f1eede](https://github.com/catalan-adobe/franklin-bulk-shared/commit/4f1eede6e9b518b5a15048604d56d0ad7985fa9e))


### Features

* **crawl:** detect languages from url paths, using ietf references ([fa5f856](https://github.com/catalan-adobe/franklin-bulk-shared/commit/fa5f85672ecf68fb5ed97dc3b76c25e462685b0b))

# [1.29.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.28.1...v1.29.0) (2024-10-15)


### Bug Fixes

* **crawl:** support edge case where sitemap contains only 1 sitemap url ([e057103](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e057103595a4375ccb4ba4ce596ccf87c7c293de))
* fix ietf url test ([4f1eede](https://github.com/catalan-adobe/franklin-bulk-shared/commit/4f1eede6e9b518b5a15048604d56d0ad7985fa9e))


### Features

* **crawl:** detect languages from url paths, using ietf references ([fa5f856](https://github.com/catalan-adobe/franklin-bulk-shared/commit/fa5f85672ecf68fb5ed97dc3b76c25e462685b0b))

## [1.28.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.28.0...v1.28.1) (2024-09-30)


### Bug Fixes

* keep fontname ([5c6a976](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5c6a976bf794169aee9458de54c7cbb5e184462e))

# [1.28.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.27.1...v1.28.0) (2024-09-30)


### Features

* Extract all fallback fonts with the correct weight and file ending ([78defa9](https://github.com/catalan-adobe/franklin-bulk-shared/commit/78defa96dc737efb0b789cc3f6da20fa229c149e))

## [1.27.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.27.0...v1.27.1) (2024-09-24)


### Bug Fixes

* handle fonts folder does not exist in aem boilerplate css command ([7ed8d4a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/7ed8d4a0c663ae294aa89f6215e7e04482662db8))

# [1.27.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.26.1...v1.27.0) (2024-09-24)


### Features

* add css method to extract fonts information for a given page ([#119](https://github.com/catalan-adobe/franklin-bulk-shared/issues/119)) ([74b732d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/74b732da49a50471c3c25b95f1473f5b26f38552))

## [1.26.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.26.0...v1.26.1) (2024-06-24)


### Bug Fixes

* **crawl:** fix limit handling ([51aec37](https://github.com/catalan-adobe/franklin-bulk-shared/commit/51aec376e8c6c301f80f90e8ea0cde37676ac408))

# [1.26.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.25.1...v1.26.0) (2024-06-24)


### Features

* **html:** add function to extract all href links from html string (for http crawling) ([2124304](https://github.com/catalan-adobe/franklin-bulk-shared/commit/2124304b908cdae0e4ce604e84dd74b9a2760b02))
* **logger:** add "silly" log level ([4fed7c0](https://github.com/catalan-adobe/franklin-bulk-shared/commit/4fed7c0cd1865eb03ec8d5665656c5633711e8b8))
* **web:** add http strategy for crawl function ([5c1e6ad](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5c1e6ad42970235fb4e615cc7fd9c2e26a5fcf4d))

## [1.25.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.25.0...v1.25.1) (2024-06-20)


### Bug Fixes

* **web:** add missing export of web namespace ([76ed591](https://github.com/catalan-adobe/franklin-bulk-shared/commit/76ed59156941f3a897746f477797eff3e6be1f59))

# [1.25.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.24.2...v1.25.0) (2024-06-20)


### Features

* **web:** add function to make absolute urls relative in a given html string ([3c53013](https://github.com/catalan-adobe/franklin-bulk-shared/commit/3c530137c2c42528dce50a9d749ce76cdf5351da))

## [1.24.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.24.1...v1.24.2) (2024-06-20)


### Bug Fixes

* **puppeteer:** fix js disabling in puppeteer instances ([8758942](https://github.com/catalan-adobe/franklin-bulk-shared/commit/8758942b29bb7bc41d5e88ec894b9eff9891b5a7))

## [1.24.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.24.0...v1.24.1) (2024-06-19)


### Bug Fixes

* **puppeteer:** fix puppeteer cluster execute function signature ([90c8b78](https://github.com/catalan-adobe/franklin-bulk-shared/commit/90c8b7886d3953179cfa7655a538b06c0c9136bb))

# [1.24.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.23.0...v1.24.0) (2024-06-19)


### Features

* **puppeteer:** add page timeout parameter ([76237de](https://github.com/catalan-adobe/franklin-bulk-shared/commit/76237dedc523ececb309fc2ddb15cc5a1512bd5e))
* **puppeteer:** add puppeteer cluster function ([ca1e13a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ca1e13a31ff7bc8482b086d0f2d3da1fe5c50070))
* **puppeteer:** improve ad/gdpr blocker ([f9c3f94](https://github.com/catalan-adobe/franklin-bulk-shared/commit/f9c3f946423157caef165edec9cc0d58205fa23d))

# [1.23.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.22.0...v1.23.0) (2024-06-06)


### Features

* **puppeteer:** add function to extract minimal css for a given page ([#97](https://github.com/catalan-adobe/franklin-bulk-shared/issues/97)) ([463a8e6](https://github.com/catalan-adobe/franklin-bulk-shared/commit/463a8e66fa72a66ea0eeb0e9b096dc482952c59d))

# [1.22.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.21.0...v1.22.0) (2024-06-04)


### Features

* optimize headless chromium by re-using startup flags set from @sparticuz/chromium-min ([83713c6](https://github.com/catalan-adobe/franklin-bulk-shared/commit/83713c63fa39cf4f12ecc206972e22f23902ba05))

# [1.21.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.20.0...v1.21.0) (2024-06-04)


### Bug Fixes

* do not add discovered sitemaps urls twice ([6f6a929](https://github.com/catalan-adobe/franklin-bulk-shared/commit/6f6a929b999eb16741847105d4533491d28f594b))


### Features

* add support to pass headers to crawl function for http requests ([5422971](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5422971f1172f3e517960475076e2900aac5dc37))

# [1.20.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.19.4...v1.20.0) (2024-05-31)


### Features

* implement a function to stream new urls found during crawling ([caab59f](https://github.com/catalan-adobe/franklin-bulk-shared/commit/caab59f01fc39d8e1813398fbbe8aa23e8e1d798))
* implement filesystem namespace functions ([f165dd7](https://github.com/catalan-adobe/franklin-bulk-shared/commit/f165dd781a079b5246273317497896c24fac7532))

## [1.19.4](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.19.3...v1.19.4) (2024-05-31)


### Bug Fixes

* renovate json5 configuration ([4e90a46](https://github.com/catalan-adobe/franklin-bulk-shared/commit/4e90a4691a4425641d0cdb1c92d3953ff6b8ca04))

## [1.19.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.19.2...v1.19.3) (2024-05-30)


### Bug Fixes

* **deps:** update dependency lighthouse to v12 ([#88](https://github.com/catalan-adobe/franklin-bulk-shared/issues/88)) ([53ef749](https://github.com/catalan-adobe/franklin-bulk-shared/commit/53ef749b136a01e2e1159309864d0821c019cd72))

## [1.19.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.19.1...v1.19.2) (2024-05-30)


### Bug Fixes

* exclude eslint from renovate for now ([f6082c7](https://github.com/catalan-adobe/franklin-bulk-shared/commit/f6082c7ae0ed76c0ba2bc2a8cacae28a1cfc5b99))

## [1.19.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.19.0...v1.19.1) (2024-05-30)


### Bug Fixes

* new page handling when starting a browser instance ([70629ee](https://github.com/catalan-adobe/franklin-bulk-shared/commit/70629ee8764a8ff4706883922c949ebf6c1f6cfa))

# [1.19.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.18.2...v1.19.0) (2024-05-25)


### Bug Fixes

* queue async processing and limit handling ([5791a4d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5791a4da50290e3c026501a35fb3d30464ae137b))


### Features

* add support for fetch signal in function parseSitemapFromUrl ([7656ef7](https://github.com/catalan-adobe/franklin-bulk-shared/commit/7656ef7804daf768febcd5a1a3b4e300ca7e609e))

## [1.18.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.18.1...v1.18.2) (2024-05-21)


### Bug Fixes

* kill crawl queue when limit reached ([e0ce5b7](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e0ce5b718a25b3b4bd925f1b360a445866108fac))

## [1.18.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.18.0...v1.18.1) (2024-05-21)


### Bug Fixes

* add support for crawl sitemap origin urls ([b37fc5d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/b37fc5d2d83c4ad660aaf96cb2175ec5ed17455f))
* handle fetch errors for robots.txt and sitemaps ([8f6806d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/8f6806d93e233b03f6c9ea1492cf2dc496959321))

# [1.18.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.5...v1.18.0) (2024-05-21)


### Features

* add crawl function to web namespace ([e5f3e45](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e5f3e456eef0b29c851acebd27845a877627cab3))

## [1.17.5](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.4...v1.17.5) (2024-05-11)


### Bug Fixes

* **deps:** update external fixes ([e8fd0fb](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e8fd0fbfc64dcab2f0c49a8dfc09cdf87870f609))

## [1.17.4](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.3...v1.17.4) (2024-04-27)


### Bug Fixes

* **deps:** update external fixes ([61c2f02](https://github.com/catalan-adobe/franklin-bulk-shared/commit/61c2f0253df635ace036d8d1e1b961fc0759ef04))

## [1.17.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.2...v1.17.3) (2024-04-13)


### Bug Fixes

* **deps:** update external fixes ([e890a81](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e890a8149278a1a658645e9b78a63e860f802156))

## [1.17.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.1...v1.17.2) (2024-04-10)


### Bug Fixes

* eslint dependency conflict ([5bf2044](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5bf2044cf2d0c9a739c037adc0cba75615221c08))

## [1.17.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.17.0...v1.17.1) (2024-03-30)


### Bug Fixes

* **deps:** update external fixes ([7d362f0](https://github.com/catalan-adobe/franklin-bulk-shared/commit/7d362f0353d1f0b4695f0b94f67b7243072ece6f))

# [1.17.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.16.3...v1.17.0) (2024-03-19)


### Features

* implement functions to check if url is valid ([0155282](https://github.com/catalan-adobe/franklin-bulk-shared/commit/01552822babcf66147e4ad7f29b33d82fc235fcf))
* implement test stack with coverage ([301121c](https://github.com/catalan-adobe/franklin-bulk-shared/commit/301121c3ac88826b5295a2f6767d458befb65288))

## [1.16.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.16.2...v1.16.3) (2024-03-15)


### Bug Fixes

* fix parser/lint issues at project level ([0f248e2](https://github.com/catalan-adobe/franklin-bulk-shared/commit/0f248e2f9b7a143e18100269837aa8f96c56f9a3))

## [1.16.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.16.1...v1.16.2) (2024-03-13)


### Bug Fixes

* dependencies + pptr new headless values ([#72](https://github.com/catalan-adobe/franklin-bulk-shared/issues/72)) ([6f03d90](https://github.com/catalan-adobe/franklin-bulk-shared/commit/6f03d901972ea7c35f7f43bdad03643a080978bc))

## [1.16.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.16.0...v1.16.1) (2024-01-31)


### Bug Fixes

* **deps:** update external major ([#63](https://github.com/catalan-adobe/franklin-bulk-shared/issues/63)) ([63364b3](https://github.com/catalan-adobe/franklin-bulk-shared/commit/63364b3e30ed9622092d3a9f21b9592ad0dd062a))

# [1.16.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.15.2...v1.16.0) (2024-01-31)


### Features

* improve javascript disablement in puppeteer ([26dcab2](https://github.com/catalan-adobe/franklin-bulk-shared/commit/26dcab2b835024df3506c3667fcfb3208ce585a3))

## [1.15.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.15.1...v1.15.2) (2024-01-13)


### Bug Fixes

* **deps:** update external fixes ([a027fec](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a027fec26a0687fc84214c176ac8943429be4cc1))

## [1.15.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.15.0...v1.15.1) (2023-12-22)


### Bug Fixes

* **deps:** update dependency p-queue to v8 ([#57](https://github.com/catalan-adobe/franklin-bulk-shared/issues/57)) ([3a494bc](https://github.com/catalan-adobe/franklin-bulk-shared/commit/3a494bc1aad8256b3d07befc336f832d5bccc0c3))

# [1.15.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.14.0...v1.15.0) (2023-12-22)


### Bug Fixes

* fix javascript disablement feature ([3d450ba](https://github.com/catalan-adobe/franklin-bulk-shared/commit/3d450ba39534bb4e8cfc0aef91dc0e4826c4499a))
* robots.txt/sitemap fetching and parsing ([a8514ac](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a8514ac50b17511cc1d295d5ddd1f90d73fc3e05))
* use networkidle2 strategy for puppeteer page load ([ac952c8](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ac952c800ce49688b518dcf15fb843b5be6465a6))


### Features

* add full report in response of lighthouse browser step ([555a90a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/555a90ab491bb349f6d327f29951b570cb329888))
* add screenshot path in the browser sequence response ([b97e2db](https://github.com/catalan-adobe/franklin-bulk-shared/commit/b97e2dbd85e10ddf0170cc6d715d7d1cf17891a9))
* use existing project configuration for lighthouse execution ([43669e8](https://github.com/catalan-adobe/franklin-bulk-shared/commit/43669e8112c03982d4244466674270df76fa4102))
* use new chrome headless ([704736d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/704736d3815bf94baf7673325c82cc95a4afb610))

# [1.14.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.7...v1.14.0) (2023-12-11)


### Features

* add option to disable javascript when starting a browser instance ([96830e1](https://github.com/catalan-adobe/franklin-bulk-shared/commit/96830e1b48be5f713858ca991858f9f6c9e6cf7c))

## [1.13.7](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.6...v1.13.7) (2023-12-04)


### Bug Fixes

* **deps:** update external major ([#54](https://github.com/catalan-adobe/franklin-bulk-shared/issues/54)) ([976a6ec](https://github.com/catalan-adobe/franklin-bulk-shared/commit/976a6ec83f4c3bd16d11290110523e2914cd7630))

## [1.13.6](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.5...v1.13.6) (2023-12-01)


### Bug Fixes

* puppeteer steps logger functions ([a1e2ffb](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a1e2ffbfc5e3536b91ee03f2c08b4ed622790858))

## [1.13.5](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.4...v1.13.5) (2023-11-04)


### Bug Fixes

* **deps:** update external fixes ([a96944b](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a96944bf581c9845b3874723f2b53c11ab6ebd6d))

## [1.13.4](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.3...v1.13.4) (2023-10-28)


### Bug Fixes

* **deps:** update external fixes ([ecbba97](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ecbba97ecb351df7c59e127641898512f77da30c))

## [1.13.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.2...v1.13.3) (2023-10-14)


### Bug Fixes

* **deps:** update external fixes ([67f8d8a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/67f8d8ab354dba60364d296ca6dc378c49f4c83d))

## [1.13.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.1...v1.13.2) (2023-09-19)


### Bug Fixes

* **deps:** update external fixes ([9ceec42](https://github.com/catalan-adobe/franklin-bulk-shared/commit/9ceec42ece46bb480e4c0bd98231fc0b49d2326d))

## [1.13.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.13.0...v1.13.1) (2023-08-28)


### Bug Fixes

* puppeteer types usage in browser init function ([178528d](https://github.com/catalan-adobe/franklin-bulk-shared/commit/178528d3313d23222c71ac08e3287bda83582815))

# [1.13.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.12.0...v1.13.0) (2023-08-25)


### Features

* add extra startup argument for browser init function ([d36a743](https://github.com/catalan-adobe/franklin-bulk-shared/commit/d36a743cc7aeeda8819fd53442ce374e5b26071d))
* add smart scroll function to puppeteer domain ([bd32fc2](https://github.com/catalan-adobe/franklin-bulk-shared/commit/bd32fc2317436125d0d4573ee77f64098586132a))

# [1.12.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.11.0...v1.12.0) (2023-08-21)


### Features

* expose puppeteer userDataDir property in generic init browser function ([4aaeaa5](https://github.com/catalan-adobe/franklin-bulk-shared/commit/4aaeaa5b63a10eaa0264f10c0b6c87d94b18296e))

# [1.11.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.10.1...v1.11.0) (2023-07-27)


### Features

* add option to use local chrome when starting puppeteer browser ([88d65ff](https://github.com/catalan-adobe/franklin-bulk-shared/commit/88d65ff5b13cd3a4d5882c64e0c1bdf388d2936b))

## [1.10.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.10.0...v1.10.1) (2023-07-27)


### Bug Fixes

* list of blockers used at browser startup ([d0711f7](https://github.com/catalan-adobe/franklin-bulk-shared/commit/d0711f74669bc8e49b938ab38776cf00aeff5cdd))

# [1.10.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.9.0...v1.10.0) (2023-07-24)


### Bug Fixes

* puppeteer extra stealthplugin not working ootb ([e7c4b30](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e7c4b30d421c0e1b3deb9137f42b11e21a87816f))


### Features

* add options for browser startup (devtools, maximized) ([48eeb72](https://github.com/catalan-adobe/franklin-bulk-shared/commit/48eeb721fab1f2a789c3060cf6313f4f20482850))

# [1.9.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.8.0...v1.9.0) (2023-07-02)


### Bug Fixes

* improve smart scroll puppeteer step ([0a40e51](https://github.com/catalan-adobe/franklin-bulk-shared/commit/0a40e5166957652eaf5d2295152c282ba18f10c4))
* use network idle strategy in puppeteer sequence run main action ([74505b8](https://github.com/catalan-adobe/franklin-bulk-shared/commit/74505b8445fdc3f7aa1ff5e1ea0c59a0fb646df8))


### Features

* use puppeteer extra stack ([e229982](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e229982a922cf69cb1d60a03023cb00a8e28132f))

# [1.8.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.7.0...v1.8.0) (2023-06-28)


### Bug Fixes

* use index instead of "___" as url filename for root path ([cb87f6c](https://github.com/catalan-adobe/franklin-bulk-shared/commit/cb87f6c9bf7514033ad73427520eccb5a8003ec9))
* use puppeteer networkidle0 strategy when loading the page in fullpage screenshot scenario function ([7666fd6](https://github.com/catalan-adobe/franklin-bulk-shared/commit/7666fd6b1f1e9d8c2d1fd268dd1a3dda74b80bb2))


### Features

* add new function to extract details of an url ([ec9ccfe](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ec9ccfedda3c2f60d97f94aeb04a8e6ed3c826d6))

# [1.7.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.6.0...v1.7.0) (2023-06-28)


### Features

* pass existing pptr page to fullpage screenshot scenario function ([c1e6a3a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/c1e6a3a8112c1ee9bf810b3522f90b1086363b30))

# [1.6.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.5.0...v1.6.0) (2023-06-27)


### Features

* add puppeteer full scenario to take a full page screenshot ([e9c8fbd](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e9c8fbd6e0b83c369bbfa1d9c3ab36e92d1cadbf))

# [1.5.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.4.2...v1.5.0) (2023-06-19)


### Features

* add function to collect basic blocks stats for a franklin url ([9f1e713](https://github.com/catalan-adobe/franklin-bulk-shared/commit/9f1e7135c6f1dc42f9a6e4b622aa12da2adb2529))

## [1.4.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.4.1...v1.4.2) (2023-06-12)


### Bug Fixes

* path and filename returned for root path urls ([3c383a2](https://github.com/catalan-adobe/franklin-bulk-shared/commit/3c383a20ae1a6dcc3bf39fb8884f0bda583a08ec))

## [1.4.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.4.0...v1.4.1) (2023-06-03)


### Bug Fixes

* **deps:** update external fixes ([016e56a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/016e56a589fbf4df2a4d6d76e78b4bf002a58a76))

# [1.4.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.6...v1.4.0) (2023-06-01)


### Features

* add web functions to download and parse robots.txt and sitemaps ([#21](https://github.com/catalan-adobe/franklin-bulk-shared/issues/21)) ([0cc62fa](https://github.com/catalan-adobe/franklin-bulk-shared/commit/0cc62faf51d13ec6172ae92e85924d0a1d12316d))

## [1.3.6](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.5...v1.3.6) (2023-05-27)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v20.4.0 ([6bf501b](https://github.com/catalan-adobe/franklin-bulk-shared/commit/6bf501b88dd118eb22519bc8a944fbd240978a51))

## [1.3.5](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.4...v1.3.5) (2023-05-23)


### Bug Fixes

* **deps:** update dependency @adobe/helix-importer to v2.9.7 ([#17](https://github.com/catalan-adobe/franklin-bulk-shared/issues/17)) ([ad25eaa](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ad25eaaa0fd8c6dd90c70c1b55db77d838c70c0b))

## [1.3.4](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.3...v1.3.4) (2023-05-23)


### Bug Fixes

* **deps:** update dependency jsdom to v22 ([#16](https://github.com/catalan-adobe/franklin-bulk-shared/issues/16)) ([e28a9fd](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e28a9fd68cbe1ddff411c5f1095224d32ad9aae1))

## [1.3.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.2...v1.3.3) (2023-05-20)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v20.2.1 ([6681d32](https://github.com/catalan-adobe/franklin-bulk-shared/commit/6681d3239a17128c914d3a66261b83707a6abb4b))

## [1.3.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.1...v1.3.2) (2023-05-13)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v20.2.0 ([a4fbafb](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a4fbafbd92989a5f2c768268c52c10f4f4b15af2))

## [1.3.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.3.0...v1.3.1) (2023-05-08)


### Bug Fixes

* **deps:** update dependency @adobe/helix-importer to v2.9.4 ([#9](https://github.com/catalan-adobe/franklin-bulk-shared/issues/9)) ([1448bd5](https://github.com/catalan-adobe/franklin-bulk-shared/commit/1448bd5a05e45706e1cace7c130543f062d20ee5))

# [1.3.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.2.2...v1.3.0) (2023-05-08)


### Features

* puppeteer step cache resources ([#15](https://github.com/catalan-adobe/franklin-bulk-shared/issues/15)) ([5d50103](https://github.com/catalan-adobe/franklin-bulk-shared/commit/5d50103c4ab9691094b4fdc8c0b2c8c2dbc41aa2))

## [1.2.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.2.1...v1.2.2) (2023-05-08)


### Bug Fixes

* puppeteer step cache resources ([#14](https://github.com/catalan-adobe/franklin-bulk-shared/issues/14)) ([5481701](https://github.com/catalan-adobe/franklin-bulk-shared/commit/54817016bc6606818fde5c53ca76e8193600ef7f))

## [1.2.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.2.0...v1.2.1) (2023-05-06)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v20.1.1 ([1b7357a](https://github.com/catalan-adobe/franklin-bulk-shared/commit/1b7357a03331d8ccac1a0ebd69db904db5433511))

# [1.2.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.1.1...v1.2.0) (2023-05-04)


### Features

* add option to force remote debugging port on puppeteer ([d562a75](https://github.com/catalan-adobe/franklin-bulk-shared/commit/d562a754046b9f1999ff6b943067b18e4c637bf5))

## [1.1.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.1.0...v1.1.1) (2023-05-04)


### Bug Fixes

* implement chrome new headless feature ([dd56c3b](https://github.com/catalan-adobe/franklin-bulk-shared/commit/dd56c3b7dfd9836023b9778ee7d35c6ffeabae73))

# [1.1.0](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.9...v1.1.0) (2023-05-04)


### Features

* add puppeteer step to cache webpage resources locally ([df6f920](https://github.com/catalan-adobe/franklin-bulk-shared/commit/df6f920fac5f4f561589eb94d775952ee6015186))

## [1.0.9](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.8...v1.0.9) (2023-04-29)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v19.11.1 ([e255b51](https://github.com/catalan-adobe/franklin-bulk-shared/commit/e255b516b9c80a0ea1d26ccf374447d696780ee6))

## [1.0.8](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.7...v1.0.8) (2023-04-22)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v19.10.1 ([26a7a50](https://github.com/catalan-adobe/franklin-bulk-shared/commit/26a7a50f4ef70319f0e291a834272a6cc6d02698))

## [1.0.7](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.6...v1.0.7) (2023-04-15)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v19.9.0 ([f938960](https://github.com/catalan-adobe/franklin-bulk-shared/commit/f938960c2f43bb3e5b8544eaa3c8d65d55076f67))

## [1.0.6](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.5...v1.0.6) (2023-04-14)


### Bug Fixes

* **deps:** update dependency @adobe/helix-importer to v2.8.11 ([b6a7973](https://github.com/catalan-adobe/franklin-bulk-shared/commit/b6a797332373f20f1f2c1f4f52e03909e54c54ab))

## [1.0.5](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.4...v1.0.5) (2023-04-08)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v19.8.5 ([6f59fc8](https://github.com/catalan-adobe/franklin-bulk-shared/commit/6f59fc83697f60f2d203829a76e8dd9ff5af789c))

## [1.0.4](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.3...v1.0.4) (2023-04-03)


### Bug Fixes

* **deps:** update dependency @adobe/helix-importer to v2.8.9 ([883a6f5](https://github.com/catalan-adobe/franklin-bulk-shared/commit/883a6f508f98c5147af0d731ba33223d936f7d98))
* use specific port for each new puppeteer browser ([ac5af35](https://github.com/catalan-adobe/franklin-bulk-shared/commit/ac5af35f7808918fdc4ca85c5978c7126733b562))

## [1.0.3](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.2...v1.0.3) (2023-04-01)


### Bug Fixes

* **deps:** update dependency puppeteer-core to v19.8.1 ([04db93e](https://github.com/catalan-adobe/franklin-bulk-shared/commit/04db93ee53cc842a00c70ec2407adb08dcc678f5))

## [1.0.2](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.1...v1.0.2) (2023-03-31)


### Bug Fixes

* resolve chrome startup content loading issues ([a255bc6](https://github.com/catalan-adobe/franklin-bulk-shared/commit/a255bc6f2a960dd1b4f7e9b255d13472046bcf8a))

## [1.0.1](https://github.com/catalan-adobe/franklin-bulk-shared/compare/v1.0.0...v1.0.1) (2023-03-25)


### Bug Fixes

* **deps:** update external fixes ([bef4ae1](https://github.com/catalan-adobe/franklin-bulk-shared/commit/bef4ae1a3f1d3990796b87bcd768c08818507d3e))

# 1.0.0 (2023-03-24)


### Bug Fixes

* franklin-bulk-shared requires a first release ([cc694a8](https://github.com/catalan-adobe/franklin-bulk-shared/commit/cc694a894a7495909a4601fe8b64a277e865882a))
