const cv = require('../data/CV.es.json')
const fs = require('fs')
const { exec } = require('child_process')

const generateMarkdown = (data) => {
  function eliminarEtiquetasHTML(texto) {
    // Expresión regular para encontrar todas las etiquetas HTML
    const regex = /<\/?[^>]+(>|$)/g
    return texto.replace(regex, '').replace(/#/g, '\\#')
  }

  let markdown = `  \\documentclass[a4paper,10pt]{article}\n\
  \\usepackage[utf8]{inputenc}\n\
  \\usepackage{graphicx}\n\
  \\usepackage{fontspec}\n\
  \\setmainfont{JetBrainsMono Nerd Font}\n\
  \\usepackage{parskip}\n\
  \\usepackage{xcolor}\n\
  \\usepackage{tcolorbox}\n\
  \\usepackage{geometry}\n\
  \\usepackage{enumitem}\n\
  \\usepackage{hyperref}\n\
  \\usepackage{tikz}\n\
  \\usepackage{multirow}\n\
  \\usepackage{array}\n\
  \\geometry{top=2cm, bottom=2cm, left=2.5cm, right=2.5cm}\n\
  \\hypersetup{\n\
    colorlinks=true,\n\
    linkcolor=blue,\n\
    filecolor=magenta,\n\
    urlcolor=blue,\n\
    pdftitle={CV},\n\
    pdfpagemode=FullScreen,\n\
  }\n\
  \\newcommand{\\cvsection}[1]{\n\
    \\vspace{2mm}\n\
    \\begin{tcolorbox}[colback=gray!30, colframe=gray!30, boxrule=0pt, arc=0mm, outer arc=0mm, width=\\textwidth, boxsep=0pt, left=2mm, right=2mm]\n\
      \\raggedright\\textbf{\\LARGE{#1}}\n\
    \\end{tcolorbox}\n\
    \\vspace{2mm}\n\
  }\n\
  \\newcommand{\\cvsubsection}[3]{\n\
    \\begin{tcolorbox}[colback=gray!20, colframe=gray!20, boxrule=0pt, arc=0mm, outer arc=0mm, width=\\dimexpr\\textwidth-2mm\\relax, boxsep=0pt, left=2mm, right=2mm, top=2mm, bottom=2mm]\n\
      \\begin{tabular*}{\\dimexpr\\textwidth-6mm\\relax}{p{0.7\\textwidth} @{\\extracolsep{\\fill}} p{0.3\\textwidth}}\n\
        \\raggedright\n\
        \\textbf{#1} \\textit{#2} & \\raggedleft \\small{#3}\n\
      \\end{tabular*}\n\
    \\end{tcolorbox}\n\
    \\vspace{2mm}\n\
  }\n\
  \\newcommand{\\cvsubsubsection}[1]{\n\
  \\begin{tcolorbox}[colback=gray!10, colframe=gray!10, boxrule=0pt, arc=0mm, outer arc=0mm, width=\\textwidth, boxsep=0pt, left=4mm, right=4mm, top=1mm, bottom=1mm]\n\
    \\textbf{#1}\n\
  \\end{tcolorbox}\n\
  \\vspace{1mm}\n\
  }\n\
  \\newcommand{\\cvsubsubsubsection}[1]{\n\
    \\begin{tcolorbox}[colback=gray!5, colframe=gray!5, boxrule=0pt, arc=0mm, outer arc=0mm, width=\\textwidth, boxsep=0pt, left=6mm, right=6mm, top=1mm, bottom=1mm]\n\
      \\textbf{#1}\n\
    \\end{tcolorbox}\n\
    \\vspace{1mm}\n\
  }\n\
  \\newcommand{\\roundedimage}[1]{\n\
    \\begin{tikzpicture}\n\
      \\clip[rounded corners=5mm] (0,0) rectangle (2.5,2.5);\n\
      \\node[anchor=south west,inner sep=0] at (0,0) {\\includegraphics[width=2.5cm,height=2.5cm]{#1}};\n\
    \\end{tikzpicture}\n\
  }\n\
  \\begin{document}\n\
    \\begin{tabular*}{\\textwidth}{l @{\\extracolsep{\\fill}} r}\n\
      \\textbf{\\Huge ${data.intro.name}} & \\multirow{5}{*}{\\roundedimage{./public/images/${data.intro.profile_image}}}\\\\\n\
      \\textbf{${data.intro.title}} & \\\\ \n`

  data.intro.links.forEach((link) => {
    markdown += `      ${link.icon} ${link.text} & \\\\ \n`
  })
  markdown += `\\end{tabular*}\n\
    \\cvsection{Summary}\n`
  data.intro.summary.forEach(line => {
    markdown += `  ${eliminarEtiquetasHTML(line)}\n\n`
  })
  markdown += `\\cvsection{Experiencia}\n`
  data.works.forEach(job => {
    markdown += `\\cvsubsection{${job.title}}{${job.name}}{${job.period_time}}\n`
    job.contribution.forEach(line => {
      markdown += `${eliminarEtiquetasHTML(line)}\n\n`
    })
    job.projects.forEach(project => {
      markdown += `\\cvsubsubsection{${project.name}}\n`
      project.description.forEach(line => {
        markdown += `${eliminarEtiquetasHTML(line)}\n\n`
      })
      markdown += `\\cvsubsubsubsection{Tecnologías}\n`
      markdown += `${project.technologies.join(', ').replace(/\#/g, '\\#')}\n\n`
    })
  })
  markdown += `\\cvsection{Educación}\n`
  data.educations.university.forEach(edu => {
    markdown += `\\cvsubsection{${edu.title}}{${edu.university_name}}{${edu.period_time}}\n`
    edu.summary.forEach(line => {
      markdown += `${eliminarEtiquetasHTML(line)}\n\n`
    })
  })
  data.educations.complementary.forEach(edu => {
    markdown += `\\cvsubsection{${edu.title}}{${edu.institution}}{${edu.period_time}}\n`
    edu.summary.forEach(line => {
      markdown += `${eliminarEtiquetasHTML(line)}\n\n`
    })
  })
  markdown += `\\cvsection{Idiomas}\n`
  markdown += `\\renewcommand{\\arraystretch}{1.5}\n`
  markdown += `\\begin{tabular}{ l c c r }\n\
    \\textbf{Language} & \\textbf{Spoken} & \\textbf{Writen} & \\textbf{Read} \\\\\n`
  markdown += `\\hline\n`
  data.educations.languages.forEach(edu => {
    markdown += `\\textbf{${edu.language}} & ${edu.spoken} & ${edu.writen} & ${edu.read}\\\\\n`
  })
  markdown += `\\end{tabular}\n`
  markdown += `\\cvsubsection{Acreditaciones}{}{}\n`
  data.educations.languages.forEach(edu => {
    if (edu.acreditations.length > 0) {
      markdown += `\\cvsubsubsection{${edu.language}}\n`
    }
    edu.acreditations.forEach(acr => {
      markdown += `\\cvsubsubsubsection{${acr.title} ${acr.institution} [${acr.period_time}]}\n`
    })
  })
  markdown += `\\end{document}`

  //data.works.forEach((work) => {
  //  markdown += `\n## ${ work.name } [${ work.period_time }]\n`
  //  work.contribution.forEach((cont) => {
  //    markdown += `\n${ eliminarEtiquetasHTML(cont) } \n`
  //  })
  //  markdown += `\n### Projects\n`
  //  work.projects.forEach((project) => {
  //    markdown += `\n#### ${ project.name } \n`
  //    project.description.forEach((desc) => {
  //      markdown += `\n${ eliminarEtiquetasHTML(desc) } \n`
  //    })
  //    markdown += `\n ** Technologies:** ${ project.technologies.join(', ') } \n`
  //  })
  //})
  //
  //markdown += `\n## Education\n`
  //data.educations.university.forEach((edu) => {
  //  markdown += `\n### ${ edu.title } (${ edu.university_name }) -> ${ edu.period_time } \n`
  //  edu.summary.forEach((sum) => {
  //    markdown += `\n${ sum } \n`
  //  })
  //})
  //data.educations.complementary.forEach((edu) => {
  //  markdown += `\n### ${ edu.title } (${ edu.institution }) -> ${ edu.period_time } \n`
  //  edu.summary.forEach((sum) => {
  //    markdown += `\n${ sum } \n`
  //  })
  //})
  //
  //markdown += `\n## Languages\n`
  //markdown += '| Language | Spoken | Writen | Read |\n'
  //markdown += '-------- | ------ | ------ | ---- |\n'
  //data.educations.languages.forEach((lang) => {
  //  markdown += `| ${ lang.language }| ${ lang.spoken }| ${ lang.writen }| ${ lang.read }|\n`
  //})

  markdown = markdown.replace(/^ {2}/gm, '')
  return markdown
}

const markdown = generateMarkdown(cv)
fs.writeFileSync('cv.tex', markdown)

exec('xelatex cv.tex -o cv.pdf', (error, stdout, stderr) => {
  //console.log(stdout)
  if (error) {
    console.error(error.message)
    //fs.unlink('cv.tex', () => { })
    return
  }
  if (stderr) {
    console.error(stderr)
    //fs.unlink('cv.tex', () => { })
    return
  }
  console.log("Generated")
})

