import { useLanguage } from './context/language_context'
import { Select } from '@chakra-ui/react'

const LanguageSelector = ({ display }) => {
  const { language, changeLanguage } = useLanguage()

  if (!language || !changeLanguage) {
    return null
  }

  const languages = [
    { code: 'en', label: '', flag: '🇬🇧' },
    { code: 'en.s', label: 'short', flag: '🇬🇧' },
    { code: 'es', label: '', flag: '🇪🇸' },
    { code: 'es.s', label: 'corto', flag: '🇪🇸' },
    { code: 'zh', label: '', flag: '🇨🇳' },
    { code: 'zh.s', label: '简要', flag: '🇨🇳' }
  ]

  return (
    <Select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      size="sm"
      variant="outline"
      width="70px"
      display={display}
    >
      {languages.map(({ code, label, flag }) => (
        <option key={code} value={code}>
          {flag} {label}
        </option>
      ))}
    </Select>
  )
}

export default LanguageSelector
