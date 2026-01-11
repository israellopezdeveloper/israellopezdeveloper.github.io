import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

/* ---------------------------------------------------
 * ESM helpers
 * --------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function remainingPageHeight(doc) {
  return doc.page.height - doc.page.margins.bottom - doc.y;
}

/**
 * Ensure a section heading never appears at the bottom of the page.
 * It forces a page break if there's not enough space for:
 *   - the heading line
 *   - some minimal body lines after it
 */
function ensureSection(
  doc,
  { headingLines = 1, bodyLines = 2, gapAfterHeading = 6 } = {}
) {
  const headingH = headingLines * 16; // approx for 12pt bold (tweak if needed)
  const bodyH = bodyLines * 14; // approx for 10.5pt body (tweak if needed)
  const needed = headingH + gapAfterHeading + bodyH;

  if (remainingPageHeight(doc) < needed) {
    doc.addPage();
  }
}

/* ---------------------------------------------------
 * Utils
 * --------------------------------------------------- */
function drawSectionBar(doc, title) {
  const { left, right } = doc.page.margins;
  const width = doc.page.width - left - right;
  const height = 24;

  ensureSpace(doc, height + 10);

  const y = doc.y;

  doc.rect(left, y, width, height).fill('#e6e6e6');

  doc
    .fillColor('#000')
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(title, left + 8, y + 6);

  doc.y = y + height + 10;
}

function safeTextFromHtml(html) {
  if (!html) return '';
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'ul', options: { itemPrefix: '• ' } },
      { selector: 'ol', options: { itemPrefix: (i) => `${i + 1}. ` } }
    ],
    preserveNewlines: false
  })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function formatPeriod(period) {
  if (!period) return '';
  const start = period.start && period.start !== 'None' ? period.start : '';
  const end =
    period.current === true
      ? ''
      : period.end && period.end !== 'None'
        ? period.end
        : '';

  if (start && !end && period.current) return `${start} -`;
  if (start && end) return `${start} - ${end}`;
  return start;
}

function ensureSpace(doc, h = 60) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + h > bottom) doc.addPage();
}

/* ---------------------------------------------------
 * Rendering
 * --------------------------------------------------- */
async function drawIntro(doc) {
  const { left, right, top } = doc.page.margins;
  const pageWidth = doc.page.width - left - right;

  const photoSize = 90;
  const photoX = left + pageWidth - photoSize;
  const photoY = top;

  // Photo
  const photoPath = path.resolve('static/photo.webp');
  if (fs.existsSync(photoPath)) {
    const pngBuffer = await sharp(photoPath).png().toBuffer();
    doc.image(pngBuffer, photoX, photoY, {
      width: photoSize,
      height: photoSize
    });
  }

  // Name
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#000')
    .text('Israel López Maíz', left, top);

  doc.moveDown(0.4);

  // Title
  doc.font('Helvetica').fontSize(12).text('Senior Software Engineer', {
    continued: false
  });

  doc.moveDown(0.4);

  // Contact info
  doc.fontSize(10.5);

  doc.text('Email: israellopezdeveloper@gmail.com');
  doc.text('Phone: +995 591 311 854');

  doc
    .text('Portfolio: ', { continued: true })
    .fillColor('blue')
    .text('https://israellopezdeveloper.github.io', {
      link: 'https://israellopezdeveloper.github.io',
      underline: true
    });

  doc.fillColor('#000');
  doc
    .text('LinkedIn: ', { continued: true })
    .fillColor('blue')
    .text('https://www.linkedin.com/in/israellopezmaiz/', {
      link: 'https://www.linkedin.com/in/israellopezmaiz/',
      underline: true
    });

  doc.fillColor('#000');

  // Space after header
  doc.moveDown(2);
}

function drawHeader(doc, role, company, period) {
  const { left, right } = doc.page.margins;
  const width = doc.page.width - left - right;
  const height = 58;

  ensureSpace(doc, height + 10);

  const y = doc.y;
  doc.rect(left, y, width, height).fill('#eeeeee');

  doc
    .fillColor('#000')
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(role, left + 14, y + 10);

  doc
    .font('Helvetica')
    .fontSize(12)
    .text(company, left + 14, y + 32);

  doc.fontSize(11).text(period, left + 14, y + 46);

  doc.y = y + height + 14;
}

function drawParagraph(doc, text) {
  if (!text) return;
  ensureSpace(doc, 40);
  doc
    .font('Helvetica')
    .fontSize(10.5)
    .fillColor('#111')
    .text(text, { lineGap: 2, align: 'justify' });
  doc.moveDown(0.8);
}

function drawTechnologies(doc, techs) {
  if (!techs?.length) return;

  // Avoid heading at bottom: heading + at least 2 rows
  ensureSection(doc, { headingLines: 1, bodyLines: 2 });

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#333')
    .text('Technologies used:');
  doc.moveDown(0.4);

  const { left, right } = doc.page.margins;
  const usableWidth = doc.page.width - left - right;

  const colCount = 3;
  const colGap = 18;
  const colWidth = (usableWidth - colGap * (colCount - 1)) / colCount;

  // Distribute round-robin
  const cols = Array.from({ length: colCount }, () => []);
  techs.forEach((t, i) => cols[i % colCount].push(t));

  const lineH = 14;
  const maxRows = Math.max(...cols.map((c) => c.length));
  const blockH = maxRows * lineH + 6;

  // If the list block doesn't fit, move to a fresh page BEFORE capturing startY
  if (remainingPageHeight(doc) < blockH) {
    doc.addPage();

    // Reprint section heading on the new page (optional but looks better)
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#333')
      .text('Technologies used:');
    doc.moveDown(0.4);
  }

  // IMPORTANT: capture startY AFTER any page break
  const startY = doc.y;

  doc.font('Helvetica').fontSize(10.5).fillColor('#111');

  for (let col = 0; col < colCount; col++) {
    const x = left + col * (colWidth + colGap);
    const items = cols[col];

    for (let row = 0; row < items.length; row++) {
      doc.text(`- ${items[row]}`, x, startY + row * lineH, {
        width: colWidth,
        lineBreak: false
      });
    }
  }

  doc.y = startY + blockH;
}

function renderWork(doc, work) {
  const role = work.role || work.title || 'Senior Software Developer';
  const company = work.name || '';
  const period = formatPeriod(work.period_time);
  ensureSection(doc, { headingLines: 1, bodyLines: 3 });
  drawHeader(doc, role, company, period);

  drawParagraph(doc, safeTextFromHtml(work.full_description));
  work.projects?.forEach((p, i) => {
    ensureSection(doc, { headingLines: 1, bodyLines: 3 });
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(`Project ${i + 1}: ${p.name}`);
    doc.moveDown(0.4);
    drawParagraph(doc, safeTextFromHtml(p.description));
  });

  // Merge technologies from all projects
  const techs = [
    ...new Set(work.projects?.flatMap((p) => p.technologies || []))
  ];

  drawTechnologies(doc, techs);

  // Divider
  doc
    .strokeColor('#ddd')
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();

  doc.moveDown(1.2);
}

function drawEduHeaderBox(doc, { line1, line2, line3 }) {
  const { left, right } = doc.page.margins;
  const width = doc.page.width - left - right;

  // 3 lines in box + at least one body line after
  ensureSection(doc, { headingLines: 3, bodyLines: 1 });

  const y = doc.y;
  const padX = 10;
  const padY = 8;
  const boxH = 50;

  doc.rect(left, y, width, boxH).fill('#f2f2f2');

  doc.fillColor('#000');

  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(line1 || '', left + padX, y + padY, { width: width - 2 * padX });

  doc
    .font('Helvetica')
    .fontSize(10.5)
    .text(line2 || '', left + padX, y + padY + 14, { width: width - 2 * padX });

  doc
    .font('Helvetica')
    .fontSize(10.5)
    .text(line3 || '', left + padX, y + padY + 28, { width: width - 2 * padX });

  doc.y = y + boxH + 10;
}

function extractBulletsAndTextFromHtml(html) {
  if (!html) return { paragraphs: [], bullets: [] };

  // bullets: extract <li>...</li>
  const bullets = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(html)) !== null) {
    const li = m[1];
    const txt = safeTextFromHtml(li);
    if (txt) bullets.push(txt);
  }

  // paragraphs: remove <ul>..</ul> and then split remaining <p>..</p>
  const noLists = html.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, ' ');
  const paragraphs = safeTextFromHtml(noLists)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return { paragraphs, bullets };
}

function drawBullets(doc, bullets) {
  if (!bullets?.length) return;

  doc.font('Helvetica').fontSize(10.5).fillColor('#111');

  for (const b of bullets) {
    ensureSpace(doc, 18);
    doc.text(`•  ${b}`, { lineGap: 2 });
    doc.moveDown(0.25);
  }

  doc.moveDown(0.6);
}

function renderEducation(doc, educations) {
  if (!educations) return;

  // -------- Training / University --------
  if (educations.university?.length) {
    drawSectionBar(doc, 'Training');

    for (const u of educations.university) {
      const period = formatPeriod(u.period_time);
      const universityName =
        u.university_name === 'UAH'
          ? 'University of Alcalá de Henares'
          : u.university_name || '';

      drawEduHeaderBox(doc, {
        line1: universityName,
        line2: u.title || '',
        line3: period
      });

      const { paragraphs, bullets } = extractBulletsAndTextFromHtml(u.summary);

      // first paragraph (if present) as small text line like in screenshot
      for (const p of paragraphs) {
        drawParagraph(doc, p);
      }

      drawBullets(doc, bullets);
    }
  }

  // -------- Complementary training --------
  if (educations.complementary?.length) {
    drawSectionBar(doc, 'Complementary training');

    for (const c of educations.complementary) {
      const period = formatPeriod(c.period_time);
      const institution = c.institution || '';

      drawEduHeaderBox(doc, {
        line1: institution,
        line2: c.title || '',
        line3: period
      });

      const { paragraphs, bullets } = extractBulletsAndTextFromHtml(c.summary);

      for (const p of paragraphs) {
        drawParagraph(doc, p);
      }

      drawBullets(doc, bullets);
    }
  }
}

function renderLanguages(doc, languages) {
  if (!languages?.length) return;

  drawSectionBar(doc, 'Languages');

  const { left, right } = doc.page.margins;
  const tableWidth = doc.page.width - left - right;

  // Table sizing
  const col1 = 120; // Language
  const colW = (tableWidth - col1) / 3; // Spoken/Written/Read
  const rowH = 22;

  // We need: header row + at least 2 language rows
  ensureSection(doc, { headingLines: 0, bodyLines: 4 });

  const x0 = left;
  let y = doc.y;

  // Helpers
  const drawCell = (text, x, y, w, h, opts = {}) => {
    doc
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(text ?? '', x, y + 6, {
        width: w,
        align: 'center'
      });
  };

  const strokeGrid = (x, y, w, h) => {
    doc.rect(x, y, w, h).stroke();
  };

  // Header row
  doc.lineWidth(1).strokeColor('#000');

  // Empty top-left cell
  strokeGrid(x0, y, col1, rowH);

  // Spoken / Written / Read
  strokeGrid(x0 + col1, y, colW, rowH);
  strokeGrid(x0 + col1 + colW, y, colW, rowH);
  strokeGrid(x0 + col1 + 2 * colW, y, colW, rowH);

  drawCell('Spoken', x0 + col1, y, colW, rowH, { bold: true });
  drawCell('Written', x0 + col1 + colW, y, colW, rowH, { bold: true });
  drawCell('Read', x0 + col1 + 2 * colW, y, colW, rowH, { bold: true });

  y += rowH;

  // Rows
  for (const lang of languages) {
    // Avoid splitting a row across pages
    if (remainingPageHeight(doc) < rowH + 10) {
      doc.addPage();
      // Redraw section bar + header row on new page for continuity
      drawSectionBar(doc, 'Languages');
      y = doc.y;

      // Re-draw header row
      doc.lineWidth(1).strokeColor('#000');
      strokeGrid(x0, y, col1, rowH);
      strokeGrid(x0 + col1, y, colW, rowH);
      strokeGrid(x0 + col1 + colW, y, colW, rowH);
      strokeGrid(x0 + col1 + 2 * colW, y, colW, rowH);
      drawCell('Spoken', x0 + col1, y, colW, rowH, { bold: true });
      drawCell('Written', x0 + col1 + colW, y, colW, rowH, { bold: true });
      drawCell('Read', x0 + col1 + 2 * colW, y, colW, rowH, { bold: true });
      y += rowH;
    }

    const languageName = lang.language || '';
    const spoken = lang.spoken || '';
    const written = lang.writen || ''; // ojo: en tu JSON es "writen"
    const read = lang.read || '';

    // Draw row borders
    strokeGrid(x0, y, col1, rowH);
    strokeGrid(x0 + col1, y, colW, rowH);
    strokeGrid(x0 + col1 + colW, y, colW, rowH);
    strokeGrid(x0 + col1 + 2 * colW, y, colW, rowH);

    // Draw text
    drawCell(languageName, x0, y, col1, rowH, { bold: true });
    drawCell(spoken, x0 + col1, y, colW, rowH);
    drawCell(written, x0 + col1 + colW, y, colW, rowH);
    drawCell(read, x0 + col1 + 2 * colW, y, colW, rowH);

    y += rowH;
  }

  doc.y = y + 14; // space after table
}

/* ---------------------------------------------------
 * Main
 * --------------------------------------------------- */
async function main() {
  const input = process.argv[2];
  const output = process.argv[3] || 'CV.pdf';

  if (!input) {
    console.error('Usage: node cv-pdf.js <input.json> <output.pdf>');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(input, 'utf-8'));
  const works = data.works || [];

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, left: 48, right: 48, bottom: 50 }
  });

  doc.pipe(fs.createWriteStream(output));

  await drawIntro(doc);

  drawSectionBar(doc, 'Summary');

  drawParagraph(
    doc,
    `Senior Software Engineer with over 15 years of experience designing and building high-performance backend systems, distributed architectures, and production-grade infrastructure. Strong background in low-level systems, concurrency, and performance-critical code, combined with extensive experience in cloud-native platforms, Kubernetes, and GPU-accelerated workloads.

I have worked on large-scale distributed systems for AI model deployment, monitoring, and orchestration across cloud, on-prem, and edge environments. I value clean architecture, correctness, and measurable impact, and I am particularly interested in projects where performance, reliability, and scalability are first-class concerns.`
  );

  works.forEach((w) => renderWork(doc, w));

  renderEducation(doc, data.educations);
  renderLanguages(doc, data.educations?.languages);

  doc.end();
  console.log(`✅ PDF generated: ${path.resolve(output)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
