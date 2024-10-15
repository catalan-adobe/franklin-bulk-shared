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

const ietf = [
  {
    tag: 'ar-ae',
    ietf: 'ar-AE',
  },
  {
    tag: 'ae_ar',
    ietf: 'ar-ae',
  },
  {
    tag: 'ae-ar',
    ietf: 'ar-ae',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'ae_en',
    ietf: 'en',
  },
  {
    tag: 'ae-en',
    ietf: 'en',
  },
  {
    tag: 'africa',
    ietf: 'en',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'es-ar',
    ietf: 'es-AR',
  },
  {
    tag: 'ar_es',
    ietf: 'es-ar',
  },
  {
    tag: 'ar-es',
    ietf: 'es-ar',
  },
  {
    tag: 'at',
    ietf: 'de-at',
  },
  {
    tag: 'au',
    ietf: 'en-au',
  },
  {
    tag: 'en-be',
    ietf: 'en-BE',
  },
  {
    tag: 'be_en',
    ietf: 'en-be',
  },
  {
    tag: 'be-en',
    ietf: 'en-be',
  },
  {
    tag: 'fr-be',
    ietf: 'fr-BE',
  },
  {
    tag: 'be_fr',
    ietf: 'fr-be',
  },
  {
    tag: 'be-fr',
    ietf: 'fr-be',
  },
  {
    tag: 'nl-be',
    ietf: 'nl-BE',
  },
  {
    tag: 'be_nl',
    ietf: 'nl-be',
  },
  {
    tag: 'be-nl',
    ietf: 'nl-be',
  },
  {
    tag: 'bg',
    ietf: 'bg-bg',
  },
  {
    tag: 'br',
    ietf: 'pt-br',
  },
  {
    tag: 'fr-ca',
    ietf: 'fr-CA',
  },
  {
    tag: 'ca_fr',
    ietf: 'fr-ca',
  },
  {
    tag: 'ca-fr',
    ietf: 'fr-ca',
  },
  {
    tag: 'ca',
    ietf: 'en-ca',
  },
  {
    tag: 'de-ch',
    ietf: 'de-CH',
  },
  {
    tag: 'ch_de',
    ietf: 'de-ch',
  },
  {
    tag: 'ch-de',
    ietf: 'de-ch',
  },
  {
    tag: 'fr-ch',
    ietf: 'fr-CH',
  },
  {
    tag: 'ch_fr',
    ietf: 'fr-ch',
  },
  {
    tag: 'ch-fr',
    ietf: 'fr-ch',
  },
  {
    tag: 'it-ch',
    ietf: 'it-CH',
  },
  {
    tag: 'ch_it',
    ietf: 'it-ch',
  },
  {
    tag: 'ch-it',
    ietf: 'it-ch',
  },
  {
    tag: 'cl',
    ietf: 'es-cl',
  },
  {
    tag: 'cn',
    ietf: 'zh-cn',
  },
  {
    tag: 'co',
    ietf: 'es-co',
  },
  {
    tag: 'cr',
    ietf: 'es-419',
  },
  {
    tag: 'en-cy',
    ietf: 'en-CY',
  },
  {
    tag: 'cy_en',
    ietf: 'en-cy',
  },
  {
    tag: 'cy-en',
    ietf: 'en-cy',
  },
  {
    tag: 'cz',
    ietf: 'cs-cz',
  },
  {
    tag: 'de',
    ietf: 'de-de',
  },
  {
    tag: 'dk',
    ietf: 'da-dk',
  },
  {
    tag: 'ec',
    ietf: 'es-419',
  },
  {
    tag: 'ee',
    ietf: 'et-ee',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'eg_ar',
    ietf: 'ar',
  },
  {
    tag: 'eg-ar',
    ietf: 'ar',
  },
  {
    tag: 'en-gb',
    ietf: 'en-GB',
  },
  {
    tag: 'eg_en',
    ietf: 'en-gb',
  },
  {
    tag: 'eg-en',
    ietf: 'en-gb',
  },
  {
    tag: 'el',
    ietf: 'el',
  },
  {
    tag: 'es',
    ietf: 'es-es',
  },
  {
    tag: 'fi',
    ietf: 'fi-fi',
  },
  {
    tag: 'fr',
    ietf: 'fr-fr',
  },
  {
    tag: 'el',
    ietf: 'el',
  },
  {
    tag: 'gr_el',
    ietf: 'el',
  },
  {
    tag: 'gr-el',
    ietf: 'el',
  },
  {
    tag: 'en-gr',
    ietf: 'en-GR',
  },
  {
    tag: 'gr_en',
    ietf: 'en-gr',
  },
  {
    tag: 'gr-en',
    ietf: 'en-gr',
  },
  {
    tag: 'gt',
    ietf: 'es-419',
  },
  {
    tag: 'en-hk',
    ietf: 'en-HK',
  },
  {
    tag: 'hk_en',
    ietf: 'en-hk',
  },
  {
    tag: 'hk-en',
    ietf: 'en-hk',
  },
  {
    tag: 'zh-hk',
    ietf: 'zh-HK',
  },
  {
    tag: 'hk_zh',
    ietf: 'zh-hk',
  },
  {
    tag: 'hk-zh',
    ietf: 'zh-hk',
  },
  {
    tag: 'hu',
    ietf: 'hu-hu',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'id_en',
    ietf: 'en',
  },
  {
    tag: 'id-en',
    ietf: 'en',
  },
  {
    tag: 'id',
    ietf: 'id',
  },
  {
    tag: 'id_id',
    ietf: 'id',
  },
  {
    tag: 'id-id',
    ietf: 'id',
  },
  {
    tag: 'ie',
    ietf: 'en-gb',
  },
  {
    tag: 'en-il',
    ietf: 'en-IL',
  },
  {
    tag: 'il_en',
    ietf: 'en-il',
  },
  {
    tag: 'il-en',
    ietf: 'en-il',
  },
  {
    tag: 'he',
    ietf: 'he',
  },
  {
    tag: 'il_he',
    ietf: 'he',
  },
  {
    tag: 'il-he',
    ietf: 'he',
  },
  {
    tag: 'hi',
    ietf: 'hi',
  },
  {
    tag: 'in_hi',
    ietf: 'hi',
  },
  {
    tag: 'in-hi',
    ietf: 'hi',
  },
  {
    tag: 'in',
    ietf: 'en-gb',
  },
  {
    tag: 'it',
    ietf: 'it-it',
  },
  {
    tag: 'jp',
    ietf: 'ja-jp',
  },
  {
    tag: 'kr',
    ietf: 'ko-kr',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'kw_ar',
    ietf: 'ar',
  },
  {
    tag: 'kw-ar',
    ietf: 'ar',
  },
  {
    tag: 'en-gb',
    ietf: 'en-GB',
  },
  {
    tag: 'kw_en',
    ietf: 'en-gb',
  },
  {
    tag: 'kw-en',
    ietf: 'en-gb',
  },
  {
    tag: 'la',
    ietf: 'es-la',
  },
  {
    tag: 'langstore',
    ietf: 'en-us',
  },
  {
    tag: 'lt',
    ietf: 'lt-lt',
  },
  {
    tag: 'de-lu',
    ietf: 'de-LU',
  },
  {
    tag: 'lu_de',
    ietf: 'de-lu',
  },
  {
    tag: 'lu-de',
    ietf: 'de-lu',
  },
  {
    tag: 'en-lu',
    ietf: 'en-LU',
  },
  {
    tag: 'lu_en',
    ietf: 'en-lu',
  },
  {
    tag: 'lu-en',
    ietf: 'en-lu',
  },
  {
    tag: 'fr-lu',
    ietf: 'fr-LU',
  },
  {
    tag: 'lu_fr',
    ietf: 'fr-lu',
  },
  {
    tag: 'lu-fr',
    ietf: 'fr-lu',
  },
  {
    tag: 'lv',
    ietf: 'lv-lv',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'mena_ar',
    ietf: 'ar',
  },
  {
    tag: 'mena-ar',
    ietf: 'ar',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'mena_en',
    ietf: 'en',
  },
  {
    tag: 'mena-en',
    ietf: 'en',
  },
  {
    tag: 'mt',
    ietf: 'en-mt',
  },
  {
    tag: 'mx',
    ietf: 'es-mx',
  },
  {
    tag: 'en-gb',
    ietf: 'en-GB',
  },
  {
    tag: 'my_en',
    ietf: 'en-gb',
  },
  {
    tag: 'my-en',
    ietf: 'en-gb',
  },
  {
    tag: 'ms',
    ietf: 'ms',
  },
  {
    tag: 'my_ms',
    ietf: 'ms',
  },
  {
    tag: 'my-ms',
    ietf: 'ms',
  },
  {
    tag: 'ng',
    ietf: 'en-gb',
  },
  {
    tag: 'nl',
    ietf: 'nl-nl',
  },
  {
    tag: 'no',
    ietf: 'no-no',
  },
  {
    tag: 'nz',
    ietf: 'en-gb',
  },
  {
    tag: 'pe',
    ietf: 'es-pe',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'ph_en',
    ietf: 'en',
  },
  {
    tag: 'ph-en',
    ietf: 'en',
  },
  {
    tag: 'fil-ph',
    ietf: 'fil-PH',
  },
  {
    tag: 'ph_fil',
    ietf: 'fil-ph',
  },
  {
    tag: 'ph-fil',
    ietf: 'fil-ph',
  },
  {
    tag: 'pl',
    ietf: 'pl-pl',
  },
  {
    tag: 'pr',
    ietf: 'es-419',
  },
  {
    tag: 'pt',
    ietf: 'pt-pt',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'qa_ar',
    ietf: 'ar',
  },
  {
    tag: 'qa-ar',
    ietf: 'ar',
  },
  {
    tag: 'en-gb',
    ietf: 'en-GB',
  },
  {
    tag: 'qa_en',
    ietf: 'en-gb',
  },
  {
    tag: 'qa-en',
    ietf: 'en-gb',
  },
  {
    tag: 'ro',
    ietf: 'ro-ro',
  },
  {
    tag: 'ru',
    ietf: 'ru-ru',
  },
  {
    tag: 'ar',
    ietf: 'ar',
  },
  {
    tag: 'sa_ar',
    ietf: 'ar',
  },
  {
    tag: 'sa-ar',
    ietf: 'ar',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'sa_en',
    ietf: 'en',
  },
  {
    tag: 'sa-en',
    ietf: 'en',
  },
  {
    tag: 'se',
    ietf: 'sv-se',
  },
  {
    tag: 'sg',
    ietf: 'en-sg',
  },
  {
    tag: 'si',
    ietf: 'sl-si',
  },
  {
    tag: 'sk',
    ietf: 'sk-sk',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'th_en',
    ietf: 'en',
  },
  {
    tag: 'th-en',
    ietf: 'en',
  },
  {
    tag: 'th',
    ietf: 'th',
  },
  {
    tag: 'th_th',
    ietf: 'th',
  },
  {
    tag: 'th-th',
    ietf: 'th',
  },
  {
    tag: 'tr',
    ietf: 'tr-tr',
  },
  {
    tag: 'tw',
    ietf: 'zh-tw',
  },
  {
    tag: 'ua',
    ietf: 'uk-ua',
  },
  {
    tag: 'uk',
    ietf: 'en-gb',
  },
  {
    tag: 'en-gb',
    ietf: 'en-GB',
  },
  {
    tag: 'vn_en',
    ietf: 'en-gb',
  },
  {
    tag: 'vn-en',
    ietf: 'en-gb',
  },
  {
    tag: 'vi',
    ietf: 'vi',
  },
  {
    tag: 'vn_vi',
    ietf: 'vi',
  },
  {
    tag: 'vn-vi',
    ietf: 'vi',
  },
  {
    tag: 'za',
    ietf: 'en-gb',
  },
  {
    tag: 'en',
    ietf: 'en',
  },
  {
    tag: 'cis_en',
    ietf: 'en',
  },
  {
    tag: 'cis-en',
    ietf: 'en',
  },
  {
    tag: 'ru',
    ietf: 'ru',
  },
  {
    tag: 'cis_ru',
    ietf: 'ru',
  },
  {
    tag: 'cis-ru',
    ietf: 'ru',
  },
  {
    tag: 'sea',
    ietf: 'en',
  },
];

export default ietf;
