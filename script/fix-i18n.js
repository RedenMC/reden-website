// read from ./i18n/zh-CN.json, remove all empty values, and write to ./i18n/zh-CN.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptPath = fileURLToPath(import.meta.url);

function fixI18n(lang) {
  const i18nPath = path.resolve(scriptPath, `../../i18n/${lang}.json`);
  const i18n = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));

  function removeEmptyValues(obj) {
    if (typeof obj !== 'object') {
      return obj;
    }
    const sorted = {};
    Object.keys(obj)
      .toSorted()
      .forEach((key) => {
        const value = removeEmptyValues(obj[key]);
        if (typeof value === 'object') {
          if (value && Object.keys(value).length === 0) {
            return;
          }
        } else if (value === '') {
          return;
        }
        sorted[key] = value;
      });
    return sorted;
  }

  // leave a blank line at the end
  fs.writeFileSync(
    i18nPath,
    JSON.stringify(removeEmptyValues(i18n), null, 2) + '\n',
  );
}

fixI18n('zh_CN');
fixI18n('zh_TW');
fixI18n('ru_RU');
fixI18n('en');
