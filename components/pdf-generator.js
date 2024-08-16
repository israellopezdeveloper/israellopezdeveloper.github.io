const cv_es = require('../data/CV.es.json')
const cv_en = require('../data/CV.en.json')
const cv_zh = require('../data/CV.zh.json')
const gui_es = require('../data/gui.es.json')
const gui_en = require('../data/gui.en.json')
const gui_zh = require('../data/gui.zh.json')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

function generate_pdf(json_cv, json_gui, name) {
  const generateMarkdown = (data) => {
    function eliminarEtiquetasHTML(texto) {
      // Expresión regular para encontrar todas las etiquetas HTML
      const regex = /<\/?[^>]+(>|$)/g
      return texto.replace(regex, '').replace(/#/g, '\\#').replace(/&/g, '\\&')
    }
    let markdown = `  \\documentclass[a4paper,10pt]{article}\n\
  \\usepackage[utf8]{inputenc}\n\
  \\usepackage{xeCJK}\n\
  \\usepackage{graphicx}\n\
  \\usepackage{fontspec}\n\
  \\usepackage{parskip}\n\
  \\usepackage{xcolor}\n\
  \\usepackage{tcolorbox}\n\
  \\usepackage{geometry}\n\
  \\usepackage{enumitem}\n\
  \\usepackage{hyperref}\n\
  \\usepackage{tikz}\n\
  \\usepackage{multirow}\n\
  \\usepackage{array}\n\
  \\setmonofont{JetBrainsMono Nerd Font}\n\
  \\pagestyle{empty}\n\
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
      \\clip[rounded corners=3mm] (0,0) rectangle (3,3);\n\
      \\node[anchor=south west,inner sep=0] at (0,0) {\\includegraphics[width=3cm,height=3cm]{#1}};\n\
    \\end{tikzpicture}\n\
  }\n\
  \\begin{document}\n\
    \\begin{tabular*}{\\textwidth}{l @{\\extracolsep{\\fill}} r}\n\
      \\textbf{\\Huge ${data.intro.name}} & \\multirow{6}{*}{\\roundedimage{./public/images/${data.intro.profile_image}}}\\\\\n\
      \\textbf{${data.intro.title}} & \\\\ \n`

    data.intro.links.forEach((link) => {
      markdown += `      \\texttt{${link.icon}} ${link.text} & \\\\ \n`
    })
    markdown += `    \\end{tabular*}\n\
    \\cvsection{${json_gui.pdf.summary}}\n`
    data.intro.summary.forEach(line => {
      markdown += `  ${eliminarEtiquetasHTML(line)}\n\n`
    })
    markdown += `    \\cvsection{${json_gui.pdf.exp}}\n`
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
        markdown += `\\cvsubsubsubsection{${json_gui.pdf.techs}}\n`
        markdown += `${project.technologies.join(', ').replace(/\#/g, '\\#')}\n\n`
      })
    })
    markdown += `\\cvsection{${json_gui.pdf.edu}}\n`
    data.educations.university.forEach(edu => {
      markdown += `      \\cvsubsection{${edu.title}}{${edu.university_name}}{${edu.period_time}}\n`
      edu.summary.forEach(line => {
        markdown += `${eliminarEtiquetasHTML(line)}\n\n`
      })
    })
    data.educations.complementary.forEach(edu => {
      markdown += `      \\cvsubsection{${edu.title}}{${edu.institution}}{${edu.period_time}}\n`
      edu.summary.forEach(line => {
        markdown += `${eliminarEtiquetasHTML(line)}\n\n`
      })
    })
    markdown += `    \\cvsection{${json_gui.pdf.langs}}\n`
    markdown += `\\renewcommand{\\arraystretch}{1.5}\n`
    markdown += `\\begin{tabular}{ l c c r }\n\
    \\textbf{${json_gui.pdf.lang}} & \\textbf{${json_gui.pdf.spoken}} & \\textbf{${json_gui.pdf.writen}} & \\textbf{${json_gui.pdf.read}} \\\\\n`
    markdown += `\\hline\n`
    data.educations.languages.forEach(edu => {
      markdown += `\\textbf{${edu.language}} & ${edu.spoken} & ${edu.writen} & ${edu.read}\\\\\n`
    })
    markdown += `\\end{tabular}\n`
    markdown += `\\cvsubsection{${json_gui.pdf.acreditations}}{}{}\n`
    data.educations.languages.forEach(edu => {
      if (edu.acreditations.length > 0) {
        markdown += `\\cvsubsubsection{${edu.language}}\n`
      }
      edu.acreditations.forEach(acr => {
        markdown += `\\cvsubsubsubsection{${acr.title} ${acr.institution} [${acr.period_time}]}\n`
      })
    })
    markdown += `\\end{document}`
    markdown = markdown.replace(/^ {2}/gm, '')
    return markdown
  }

  const markdown = generateMarkdown(json_cv)
  fs.writeFileSync(`${name}.tex`, markdown)

  exec(`xelatex -interaction nonstopmode ${name}.tex -o ${name}.pdf`, (error, stdout, stderr) => {
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
    [`${name}.aux`, `${name}.log`, `${name}.out`, `texput.log`, `${name}.tex`].forEach(file => {
      fs.unlink(file, () => { })
    })
    const oldPath = path.join(process.cwd(), `${name}.pdf`)
    const newPath = path.join(process.cwd(), 'public', `${name}.pdf`)
    try {
      fs.renameSync(oldPath, newPath)
    } catch (err) {
      console.error('Error al mover el archivo:', err)
    }
    console.log(`Generated ${name}`)
  })
}

generate_pdf(cv_es, gui_es, "CV-es")

generate_pdf(cv_en, gui_en, "CV-en")

generate_pdf(cv_zh, gui_zh, "CV-zh")
