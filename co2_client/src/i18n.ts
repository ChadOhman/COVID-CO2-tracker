import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as Sentry from "@sentry/react";
import { knownLanguages } from './App';


i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,

    // allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

i18n.on('failedLoading', (lng, ns, msg) => {
  if (!knownLanguages.includes(lng)) {
    debugger;
    console.warn("Loading a language failed!");
    Sentry.captureMessage(`i18n failedLoading: (lng, ns, msg) ${lng}, ${ns}, ${msg}`)
  }
  else {
    console.log(`Loading a language (${lng}) failed, but I know about this, and it's fine.`)
  }
})
// i18n.on('languageChanged', (lng) => {
//   debugger;
// })

export default i18n;

