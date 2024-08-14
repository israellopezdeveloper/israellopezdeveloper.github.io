const cv = require('../data/CV.es.json')
const fs = require('fs');

const generateMarkdown = (data) => {
  function eliminarEtiquetasHTML(texto) {
    // Expresión regular para encontrar todas las etiquetas HTML
    const regex = /<\/?[^>]+(>|$)/g;
    return texto.replace(regex, '');
  }

  let markdown = `# ${data.intro.name}\n`;
  markdown += `![Profile Image](public/images/${data.intro.profile_image})\n`;
  markdown += `## ${data.intro.title}\n`;
  markdown += `\n## Links\n`;
  data.intro.links.forEach((link) => {
    markdown += `${link.icon} ${link.url} ${link.text}\n`;
  });

  data.works.forEach((work) => {
    markdown += `\n## ${work.name} [${work.period_time}]\n`;
    work.contribution.forEach((cont) => {
      markdown += `${eliminarEtiquetasHTML(cont)}\n`;
    });
    markdown += `\n### Projects\n`;
    work.projects.forEach((project) => {
      markdown += `#### ${project.name}\n`;
      project.description.forEach((desc) => {
        markdown += `${eliminarEtiquetasHTML(desc)}\n`;
      });
      markdown += `**Technologies:** ${project.technologies.join(', ')}\n`;
    });
  });

  markdown += `\n## Education\n`;
  data.educations.university.forEach((edu) => {
    markdown += `### ${edu.title} (${edu.university_name}) -> ${edu.period_time}\n`;
    edu.summary.forEach((sum) => {
      markdown += `${sum}\n`;
    });
  });
  data.educations.complementary.forEach((edu) => {
    markdown += `### ${edu.title} (${edu.institution}) -> ${edu.period_time}\n`;
    edu.summary.forEach((sum) => {
      markdown += `${sum}\n`;
    });
  });

  markdown += `\n## Languages\n`;
  markdown += '| Language | Spoken | Writen | Read |\n'
  markdown += '-------- | ------ | ------ | ---- |\n'
  data.educations.languages.forEach((lang) => {
    markdown += `|${lang.language}|${lang.spoken}|${lang.writen}|${lang.read}|\n`;
  });

  return markdown;
};

const markdown = generateMarkdown(cv);

fs.writeFileSync('cv.md', markdown);
console.log('CV markdown file created.');
