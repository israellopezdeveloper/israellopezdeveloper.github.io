import { useLanguage } from './context/language_context'
import { Select } from '@chakra-ui/react'

const LanguageSelector = ({ display }) => {
  const { language, changeLanguage } = useLanguage()

  if (!language || !changeLanguage) {
    return null
  }

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'en.s', label: 'English short', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ]

  return (
    <Select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      size="sm"
      variant="outline"
      width="120px"
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
