import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['common', 'validation', 'errors', 'enums'],
    defaultNS: 'common',
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie'],
    },
  });

export default i18next;
