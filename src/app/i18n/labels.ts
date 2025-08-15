// src/app/i18n/labels.ts
export type Locale = 'en' | 'es' | 'zh'; // ⬅️ añade "zh"

export type LabelKey =
  | 'jobsAndProjects'
  | 'education'
  | 'short'
  | 'myBio'
  | 'myHobbies'
  | 'experience'
  | 'usedTechnologies'
  | 'activateAll'
  | 'clear'
  | 'years'
  | 'year'
  | 'months'
  | 'month'
  | 'personalProjects'
  | 'contributions'
  | 'technologies'
  | 'links'
  | 'jobImages'
  | 'images'
  | 'university'
  | 'complementary'
  | 'languages'
  | 'levels'
  | 'spoken'
  | 'writen'
  | 'read'
  | 'institution'
  | 'title'
  | 'date'
  | 'notFound'
  | 'loading'
  | 'toggleColorMode'
  | 'accreditations';

const es: Record<LabelKey, string> = {
  jobsAndProjects: 'Trabajos y Proyectos',
  education: 'Educación',
  short: 'Breve',
  myBio: 'Mi bio',
  myHobbies: 'Mis hobbies',
  experience: 'Experiencia',
  usedTechnologies: 'Tecnologías usadas',
  activateAll: 'Activar todo',
  clear: 'Limpiar',
  years: 'años',
  year: 'año',
  months: 'meses',
  month: 'mes',
  personalProjects: 'Proyectos personales',
  contributions: 'Contribuciones',
  technologies: 'Tecnologías',
  links: 'Enlaces',
  jobImages: 'Imágenes del trabajo',
  images: 'Imágenes',
  university: 'Universidad',
  complementary: 'Formación complementaria',
  languages: 'Idiomas',
  levels: 'Niveles',
  spoken: 'Hablado',
  writen: 'Escrito',
  read: 'Leido',
  institution: 'Institución',
  title: 'Titulo',
  date: 'Fecha',
  notFound: 'No se ha encontrado',
  loading: 'Cargando ...',
  toggleColorMode: 'Cambiar modo de color',
  accreditations: 'Acreditaciones',
};

const en: Record<LabelKey, string> = {
  jobsAndProjects: 'Jobs & Projects',
  education: 'Education',
  short: 'Short',
  myBio: 'My bio',
  myHobbies: 'My hobbies',
  experience: 'Experience',
  usedTechnologies: 'Used technologies',
  activateAll: 'Activate all',
  clear: 'Clear',
  years: 'years',
  year: 'year',
  months: 'months',
  month: 'month',
  personalProjects: 'Personal Projects',
  contributions: 'Contributions',
  technologies: 'Technologies',
  links: 'Links',
  jobImages: 'Job Images',
  images: 'Images',
  university: 'University',
  complementary: 'Complementary',
  languages: 'Languages',
  levels: 'Levels',
  spoken: 'Spoken',
  writen: 'Writen',
  read: 'Read',
  institution: 'Institution',
  title: 'Title',
  date: 'Date',
  notFound: 'Not found',
  loading: 'Loading ...',
  toggleColorMode: 'Toggle color mode',
  accreditations: 'Accreditations',
};

// ⬇️ NUEVO: chino simplificado
const zh: Record<LabelKey, string> = {
  jobsAndProjects: '工作与项目',
  education: '教育',
  short: '简要',
  myBio: '我的简介',
  myHobbies: '我的爱好',
  experience: '工作经验',
  usedTechnologies: '使用的技术',
  activateAll: '全选',
  clear: '清空',
  years: '年',
  year: '年',
  months: '个月',
  month: '个月',
  personalProjects: '个人项目',
  contributions: '贡献',
  technologies: '技术',
  links: '链接',
  jobImages: '工作配图',
  images: '图片',
  university: '大学',
  complementary: '补充培训',
  languages: '语言',
  levels: '级别',
  spoken: '口语',
  writen: '书写',
  read: '阅读',
  institution: '机构',
  title: '标题',
  date: '日期',
  notFound: '未找到',
  loading: '加载中……',
  toggleColorMode: '切换颜色模式',
  accreditations: '认证',
};

export const LABELS: Record<Locale, Record<LabelKey, string>> = { es, en, zh };
