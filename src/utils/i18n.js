const locales = require('../locales');

// Supported languages — add more here as needed
const SUPPORTED = ['en', 'ar'];

// Default language — Arabic
const DEFAULT_LANG = 'ar';


const t = (lang, key, vars = {}) => {
  // Fall back to default if language not supported
  const resolvedLang = SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;

  // Get the string — fall back to English if key missing in Arabic
  const str = locales[resolvedLang]?.[key] ?? locales['en']?.[key] ?? key;

  // Replace {{variable}} placeholders with actual values
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    vars[name] !== undefined ? vars[name] : `{{${name}}}`
  );
};
const detectLang = (req) => {
  // 1. Explicit header: X-Language: ar
  const headerLang = req.headers['x-language'];
  if (headerLang && SUPPORTED.includes(headerLang)) return headerLang;

  // 2. Query param: ?lang=en
  const queryLang = req.query?.lang;
  if (queryLang && SUPPORTED.includes(queryLang)) return queryLang;

  // 3. Browser Accept-Language header (take just the first language tag)
  const acceptLang = req.headers['accept-language'];
  if (acceptLang) {
    const primary = acceptLang.split(',')[0].split('-')[0].trim();
    if (SUPPORTED.includes(primary)) return primary;
  }

  // 4. Default: Arabic
  return DEFAULT_LANG;
};

module.exports = { t, detectLang, DEFAULT_LANG, SUPPORTED };
