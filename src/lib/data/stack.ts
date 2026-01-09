import cv from '$lib/data/data_CV.json';
import projects from '$lib/data/data_projects.json';

export type TechXP = {
  name: string;
  experience: number;
};

export type StackGroup = {
  label: string;
  items: (string | TechXP)[];
};

let techs: Set<TechXP> = new Set<TechXP>();

interface PeriodTime {
  current: boolean;
  start: string;
  end: string | 'None';
}

function calculateElapsedMonths(period: PeriodTime): number {
  const parseDate = (dateStr: string): Date => {
    const s = dateStr.trim();

    const direct = new Date(s);
    if (!isNaN(direct.getTime())) return direct;

    const m = /^([A-Za-z]+)\s+(\d{4})$/.exec(s);
    if (m) {
      const monthName = m[1].toLowerCase();
      const year = Number(m[2]);

      const monthMap: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,

        // extra por si acaso vienen abreviaturas
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        sept: 8,
        oct: 9,
        nov: 10,
        dec: 11
      };

      const monthIndex = monthMap[monthName];
      if (monthIndex !== undefined && !Number.isNaN(year)) {
        // Día 1 del mes, hora 12:00 para evitar rarezas de DST en algunos husos
        return new Date(year, monthIndex, 1, 12, 0, 0, 0);
      }
    }

    throw new Error(`Fecha inválida: ${dateStr}`);
  };

  const startDate = parseDate(period.start);

  const endDate =
    period.current || period.end === 'None'
      ? new Date()
      : parseDate(period.end);

  const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthsDiff = endDate.getMonth() - startDate.getMonth();

  let totalMonths = yearsDiff * 12 + monthsDiff;

  return Math.max(0, totalMonths);
}

let techsMap = new Map<string, TechXP>();

cv.works.forEach((w) => {
  const monthsInThisWork = calculateElapsedMonths(w.period_time);

  w.projects.forEach((p) => {
    p.technologies.forEach((t) => {
      if (techsMap.has(t)) {
        // Si ya existe, sumamos la experiencia
        const existing = techsMap.get(t)!;
        existing.experience += monthsInThisWork;
      } else {
        // Si no existe, lo creamos
        techsMap.set(t, {
          name: t,
          experience: monthsInThisWork
        });
      }
    });
  });
});

const finalTechs: TechXP[] = Array.from(techsMap.values());

const mapTechType = new Map<string, string[]>();
mapTechType.set('AI & Machine Learning', [
  'PyTorch',
  'TensorFlow',
  'Hugging Face Transformers',
  'LangChain',
  'RAG',
  'Vector DB',
  'Embeddings',
  'Qdrant',
  'OpenCV',
  'ONNX Runtime',
  'TensorRT',
  'CUDA',
  'GPU Computing',
  'OpenCL',
  'Mathlab',
  'Octave'
]);

mapTechType.set('Backend & Languages', [
  'Rust',
  'Go',
  'Python',
  'FastAPI',
  'C',
  'C++',
  'Java',
  'Spring Boot',
  'Node.js',
  'Express',
  'C#',
  '.NET',
  'PHP',
  'Go',
  'Boost',
  'Groovy',
  'Ruby',
  'FastAPI',
  'gRPC',
  'Microservices',
  'Spring IoC',
  'Spring MVC',
  'Spring Batch',
  'Spring Data',
  'Hibernate',
  'JPA',
  'Eclipselink'
]);

mapTechType.set('Cloud & Infrastructure', [
  'AWS',
  'GCP',
  'Azure',
  'Windows Server',
  'Terraform',
  'Ansible',
  'Kubernetes',
  'Helm',
  'Docker',
  'MinIO',
  'NginX',
  'Wildfly/JBoss',
  'Apache Tomcat',
  'Websphere',
  'WebLogic 12',
  'IIS',
  'BalenaIO',
  'IBM System z'
]);

mapTechType.set('DevOps & CI/CD', [
  'GitHub Actions',
  'Gitlab CI/CD',
  'GIT',
  'Jenkins',
  'Git',
  'SVN',
  'Maven',
  'Make',
  'Bamboo',
  'SonarQube',
  'Bash',
  'Linux',
  'Xen',
  'KVM',
  'QEmu'
]);

mapTechType.set('Data & Databases', [
  'PostgreSQL',
  'PostGIS',
  'MongoDB',
  'Hadoop',
  'Redis',
  'Cassandra',
  'Oracle DB',
  'Microsoft SQL Server',
  'MySQL',
  'Elastic Search',
  'Kafka',
  'RabbitMQ',
  'Celery',
  'Avro Schemas',
  'IoTHub',
  'GIS'
]);

mapTechType.set('Observability & Security', [
  'Prometheus',
  'Grafana',
  'Elastic Stack',
  'Logstash',
  'Kibana',
  'Node Exporter',
  'cAdvisor',
  'Snyk',
  'Owasp',
  'FedRAMP',
  'FIPS',
  'NIST',
  'Spring Security',
  'CAS',
  'Valgrind'
]);

mapTechType.set('Web & Frontend', [
  'TypeScript',
  'Typescript',
  'GWT (Google Web Toolkit)',
  'JavaScript',
  'AngularJS',
  'OpenLayers',
  'Ionic',
  'jQuery',
  'Bootstrap',
  'HTML',
  'Jasmine',
  'Jojo',
  'Swagger',
  'SCORM',
  'Primefaces',
  'JSF',
  'Joomla'
]);

mapTechType.set('Mobile & Embedded', [
  'Android',
  'Android Studio',
  'Spring IOT',
  'Android NDK',
  'Objective-C',
  'XCode',
  'Ionic',
  'Phonegap',
  'Dagger',
  'Arduino',
  'PIC',
  'RaspberryPI',
  'Modbus',
  'SNMP',
  'Qt'
]);

mapTechType.set('Web3 & Decentralized', [
  'Bittensor',
  'Polkadot.js',
  'Substrate API',
  'Web3'
]);

mapTechType.set('Testing & Management', [
  'TDD',
  'BDD',
  'JUnit',
  'Google Test',
  'Selenium',
  'Jira',
  'Unit Test',
  'Confluence',
  'Redmine',
  'Enterprise Architect',
  'IntelliJ IDEA',
  'Eclipse',
  'Spring Documentation',
  'cLion'
]);

const categories = Array.from(mapTechType.keys());

const tempStack: StackGroup[] = categories.map((label) => ({
  label: label,
  items: finalTechs.filter((t) => mapTechType.get(label)?.includes(t.name))
}));

const categorizedTechNames = new Set(Array.from(mapTechType.values()).flat());

const others: StackGroup = {
  label: 'Others',
  items: finalTechs.filter((t) => !categorizedTechNames.has(t.name))
};

export const stack: StackGroup[] = [...tempStack].filter(
  (group) => group.items.length > 0
);
