import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import zhLocale from './zh'

Vue.use(VueI18n)

const messages = {
  zh: {
    ...zhLocale,
    ...elementZhLocale
  }
}
export function getLanguage() {
  return 'zh'
}
const i18n = new VueI18n({
  // set locale
  // options: en | zh | es
  locale: getLanguage(),
  // set locale messages
  messages,
  silentTranslationWarn: true
})

export default i18n
