import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType
} from 'docx';
import PDFDocument from 'pdfkit';

// Ensure public/downloads directory exists
const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

console.log('Generating MeDo ERP System Reference files (Word & PDF)...');

// Document metadata
const docTitle = "المرجع الشامل والتوثيق المرجعي لمنظومة MeDo ERP السحابية (BZMT)";
const docSubTitle = "ميدو تك للحلول البرمجية والمصرفية — Enterprise Edition v4.5";
const author = "الأستاذ / بدر عايض محمد";
const email = "zyadbdr925@gmail.com";
const phone = "+967 773 586 047";
const dateStr = "24 سبتمبر 2026";

// ---------------------------------------------------------------------------
// 1. GENERATE DOCX FILE
// ---------------------------------------------------------------------------

function createStyledTableCell(text: string, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? "1E3A8A" : "F8FAFC",
      color: "auto"
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        children: [
          new TextRun({
            text,
            bold: isHeader,
            color: isHeader ? "FFFFFF" : "0F172A",
            size: isHeader ? 22 : 20,
            font: "Calibri"
          })
        ]
      })
    ]
  });
}

function createParagraph(text: string, bold = false, size = 22, color = "1E293B", spaceAfter = 120) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    spacing: { after: spaceAfter, line: 320 },
    children: [
      new TextRun({
        text,
        bold,
        size,
        color,
        font: "Calibri"
      })
    ]
  });
}

function createHeading1(text: string) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: "1E3A8A",
        font: "Calibri"
      })
    ]
  });
}

function createHeading2(text: string) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: "2563EB",
        font: "Calibri"
      })
    ]
  });
}

// Build DOCX document
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Title Header
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "📘 " + docTitle,
            bold: true,
            size: 32,
            color: "0F172A",
            font: "Calibri"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: docSubTitle,
            bold: true,
            size: 22,
            color: "2563EB",
            font: "Calibri"
          })
        ]
      }),
      createParagraph(`إلى: ${author} — المؤسس والمدير العام لنظام MeDo ERP (ميدو تك للحلول البرمجية والمصرفية)`, true, 22, "1E3A8A"),
      createParagraph(`التاريخ: ${dateStr} | البريد الإلكتروني: ${email} | رقم التواصل: ${phone} | الإصدار: v4.5 Enterprise`, false, 20, "475569", 240),

      // Divider Line
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563EB" } },
        spacing: { after: 240 },
        children: []
      }),

      // Section 1: Executive Overview
      createHeading1("1. الفهرس والنظرة العامة على المرجع الشامل"),
      createParagraph("هذا المستند هو المرجع الشامل والتوثيق المرجعي الكامل لمنظومة MeDo ERP السحابية المؤسسية. يحتوي المستند على الهيكلية التقنية الدقيقة للمشروع، وشجرة الملفات الكاملة باللغة العربية، والمكونات البرمجية، والخدمات وقواعد البيانات، ومتطلبات النظام، والحلول الأمنية والمحاسبية المعتمدة وفق معايير IFRS والامتثال الضريبي والمصرفي."),

      // Section 2: File Tree & Architecture
      createHeading1("2. شجرة الملفات الكاملة وهيكلية المشروع (Project Architecture Tree)"),
      createParagraph("جدول الحزم والملفات الرئيسية في الجذر (Root Directory):"),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createStyledTableCell("#", true, 5),
              createStyledTableCell("اسم الملف (إنجليزي)", true, 25),
              createStyledTableCell("الاسم بالعربية", true, 25),
              createStyledTableCell("الوصف والوظيفة", true, 30),
              createStyledTableCell("المسار", true, 15)
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("1"),
              createStyledTableCell("index.html"),
              createStyledTableCell("صفحة البداية الرئيسية"),
              createStyledTableCell("مدخل التطبيق وهيكل DOM والخطوط المعتمدة"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("2"),
              createStyledTableCell("package.json"),
              createStyledTableCell("ملف الحزم والاعتمادات"),
              createStyledTableCell("إدارة حزم Node والمكتبات وأوامر التشغيل والبناء"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("3"),
              createStyledTableCell("server.ts"),
              createStyledTableCell("خادم Express الرئيسي"),
              createStyledTableCell("الواجهات الخلفية، الذكاء الاصطناعي، قاعدة البيانات، والبريد"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("4"),
              createStyledTableCell("vite.config.ts"),
              createStyledTableCell("إعدادات البناء Vite"),
              createStyledTableCell("ضبط المترجم والخوادم والمكونات الإضافية"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("5"),
              createStyledTableCell("tailwind.config.js"),
              createStyledTableCell("إعدادات التصميم Tailwind"),
              createStyledTableCell("تحديد الألوان والأنماط والتخطيط تجاوبي الأبعاد"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("6"),
              createStyledTableCell("tsconfig.json"),
              createStyledTableCell("إعدادات تايب سكريبت"),
              createStyledTableCell("قواعد فحص الأنواع الصارمة والترجمة البرمجية"),
              createStyledTableCell("/")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("7"),
              createStyledTableCell("firestore.rules"),
              createStyledTableCell("قواعد أمان الفايربيس"),
              createStyledTableCell("ضبط صلاحيات الوصول والحماية لبيانات الفايربيس"),
              createStyledTableCell("/")
            ]
          })
        ]
      }),

      createHeading2("2.1 مجلد src/components (المكونات الرئيسية للواجهة)"),
      createParagraph("يحتوي مجلد الواجهات على أكثر من 100 مكون تفاعلي يغطي كافة الوحدات المحاسبية والإدارية:"),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createStyledTableCell("#", true, 5),
              createStyledTableCell("المكون (Component)", true, 30),
              createStyledTableCell("الاسم الوظيفي بالعربية", true, 30),
              createStyledTableCell("الوظيفة والمسؤولية التقنية", true, 35)
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("1"),
              createStyledTableCell("App.tsx"),
              createStyledTableCell("التطبيق الرئيسي ومزود السياق"),
              createStyledTableCell("إدارة التنقل والـ Tabs والحالة العامة للنظام والراوتر")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("2"),
              createStyledTableCell("MainLayout.tsx"),
              createStyledTableCell("الهيكل والتخطيط العام"),
              createStyledTableCell("ترتيب الشريط العلوي والقائمة الجانبية والشاشة المركزية")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("3"),
              createStyledTableCell("Header.tsx"),
              createStyledTableCell("الترويسة والشريط العلوي"),
              createStyledTableCell("مؤشرات السحابة، تغيير الفرع، البحث الذكي، وإشعارات الأمان")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("4"),
              createStyledTableCell("Sidebar.tsx"),
              createStyledTableCell("القائمة الجانبية الرئيسية"),
              createStyledTableCell("التنقل المباشر بين جميع الأقسام التشغيلية والموديلات")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("5"),
              createStyledTableCell("Dashboard.tsx"),
              createStyledTableCell("لوحة التحكم المركزية"),
              createStyledTableCell("المؤشرات المالية، المبيعات، التدفقات النقدية والرسوم البيانية")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("6"),
              createStyledTableCell("ChartOfAccountsView.tsx"),
              createStyledTableCell("دليل الحسابات الشجري"),
              createStyledTableCell("إدارة 6 مستويات من دليل الحسابات المعتمد وفق IFRS")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("7"),
              createStyledTableCell("JournalEntriesView.tsx"),
              createStyledTableCell("قيود اليومية المحاسبية"),
              createStyledTableCell("إنشاء القيود المزدوجة المتوازنة، الترحيل، وطباعة السندات")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("8"),
              createStyledTableCell("SalesAndReturnsView.tsx"),
              createStyledTableCell("شاشة المبيعات والمردودات"),
              createStyledTableCell("إصدار الفواتير الضريبية، الفاتورة الإلكترونية ZATCA، والمردودات")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("9"),
              createStyledTableCell("PurchasesAndReturnsView.tsx"),
              createStyledTableCell("المشتريات ومردوداتها"),
              createStyledTableCell("تسجيل فواتير المشتريات والاعتمادات والمردودات")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("10"),
              createStyledTableCell("InventoryView.tsx"),
              createStyledTableCell("إدارة المخزون والأصناف"),
              createStyledTableCell("جرد المخزون، الحركات المخزنية، التحويل بين المستودعات وتقييم FIFO")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("11"),
              createStyledTableCell("MohasibDataMigrationWizard.tsx"),
              createStyledTableCell("معالج ترحيل المحاسب المحترف"),
              createStyledTableCell("قراءة واستيراد ملفات .DMP و Excel والترحيل المباشر")
            ]
          }),
          new TableRow({
            children: [
              createStyledTableCell("12"),
              createStyledTableCell("ZatcaVatReturnGenerator.tsx"),
              createStyledTableCell("مولد الإقرار الزكوي والضريبي"),
              createStyledTableCell("احتساب الضريبة المضافة ZATCA والتقرير الزكوي السنوي")
            ]
          })
        ]
      }),

      // Section 3: Tech Stack & Libraries
      createHeading1("3. التقنيات والمكتبات والمكونات البرمجية المستخدمة (Tech Stack)"),
      createParagraph("تتضمن المنظومة أفضل التقنيات الحديثة لضمان السرعة الفائقة، الأمان السيادي، والاعتمادية العالية:"),
      createParagraph("• الواجهة الأمامية: React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4, Motion (Framer Motion)."),
      createParagraph("• خادم الخلفية والأنظمة: Node.js Express Server, tsx Runtime Engine."),
      createParagraph("• قواعد البيانات المزدوجة: PostgreSQL Cloud SQL مع Drizzle ORM للبيانات الهيكلية المحاسبية، و Firebase Firestore للحالات المزامنة سحابياً."),
      createParagraph("• الذكاء الاصطناعي: Google GenAI SDK (@google/genai) بنماذج Gemini 3.7 Flash و Gemini 3.6 Flash للتحليل المالي والمستشار الذكي وقراءة الفواتير والقيود الصوتية."),
      createParagraph("• الأمان وبصمات الأصابع: WebAuthn (@simplewebauthn) للبصمة الحيوية وبصمة الوجه، ونظام WAF مع مشفر الحسابات السيادية."),
      createParagraph("• التقارير والتصدير: HTML2PDF.js, PDFKit, XLSX لمستندات إكسل، و DOCX للتوثيق المرجعي."),

      // Section 4: System Requirements
      createHeading1("4. جميع متطلبات وتجهيزات تشغيل النظام (System Requirements)"),
      createParagraph("تضمن متطلبات التشغيل الأداء الأمثل للأنظمة ذات الاستخدام المؤسسي كثيف البيانات:"),
      createParagraph("1. الخادم السحابي (Cloud Server): وحدة معالجة 2 vCPU فأعلى، ذاكرة 4GB RAM، بيئة Node.js 20+، مع دعم المنفذ 3000 أو الوكيل العكسي Nginx/Cloudflare."),
      createParagraph("2. قاعدة البيانات (Database): خادم PostgreSQL 15+ أو Cloud SQL مع دعم التشفير وحفظ النسخ الاحتياطية التلقائية."),
      createParagraph("3. الشبكة والأمان: بروتوكول HTTPS المشفر، شهادة SSL/TLS، دعم WebSocket للمزامنة اللحظية."),
      createParagraph("4. متطلبات العميل والمتصفح: متصفحات Chrome, Edge, Safari الحديثة مع دعم PWA والطباعة المباشرة لجميع أحجام الأوراق (A4, Thermal Receipt)."),

      // Section 5: Modules & Business Logic
      createHeading1("5. الدليل التشغيلي للوحدات والوظائف الأساسية في MeDo ERP"),
      createParagraph("1. دليل الحسابات (Chart of Accounts): هيكل شجري مرن يطابق معايير المحاسبة الدولية IFRS، يدعم الحسابات الرئيسية والفرعية حتى 6 مستويات، وتعدد العملات (الريال اليمني صنعاء/عدن، الريال السعودي، الدولار الأمريكي)."),
      createParagraph("2. قيود اليومية (Journal Entries): قيود مزدوجة آلية ويدوية متوازنة تماماً (Total Debit = Total Credit) مع التحقق الفوري والربط بمراكز التكلفة والعملات المزدوجة."),
      createParagraph("3. المبيعات والمشتريات: نظام فواتير متطور يدعم مرحلة ZATCA Phase 2 والرمز المشفر QR، وحسابات الخصومات والضرائب، وإشعارات الدفع والمردودات."),
      createParagraph("4. ترحيل البيانات المتقدم: معالج ترحيل مخصص لاستيراد بيانات نظام المحاسب المحترف (.DMP) مع المعاينة الفورية للأصناف والعملاء والقيود قبل الاعتماد."),
      createParagraph("5. الذكاء الاصطناعي والبحث الصوتي: محرك MeDo AI لتحويل الأوامر الصوتية باللغة العربية إلى قيود محاسبية أو تقارير تحليلية مع توصيات التدقيق الخارجي."),

      // Section 6: Governance & Legal Disclaimer
      createHeading1("6. الحوكمة والأمان وإخلاء المسؤولية القانونية"),
      createParagraph("• سجلات التدقيق السيادية (Immutable Audit Trail): توثيق كامل لكافة العمليات وحركات الدخول والتعديلات برقم معتمد وبصمة IP/Device Fingerprint."),
      createParagraph("• حماية الخصوصية وعزل البيانات: تطبيق معايير DPA و GDPR في فصل بيانات المؤسسات والتشفير الكامل أثناء النقل والتخزين."),
      createParagraph("• إخلاء المسؤولية القانونية (Legal Disclaimer): تم تطوير منظومة MeDo ERP لتوافق أفضل المعايير المحاسبية والمصرفية. تبقى مسؤلية مراجعة المدخلات والاعتمادات النهائية على المحاسب والمدير المالي المعتمد للمنشأة وفق الأنظمة المحلية المتبعة."),

      // Footer Note
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        spacing: { before: 300 },
        children: [
          new TextRun({
            text: "تم إعداد هذا المرجع التوثيقي الشامل بواسطة فريق تطوير MeDo ERP (BZMT) ليكون المرجع التقني والتنفيذي المعتمد. جميع الحقوق محفوظة © 2026",
            bold: true,
            size: 18,
            color: "64748B",
            font: "Calibri"
          })
        ]
      })
    ]
  }]
});

// Write Word file
Packer.toBuffer(doc).then((buffer) => {
  const docxPath = path.join(downloadsDir, 'MeDo_ERP_System_Reference.docx');
  fs.writeFileSync(docxPath, buffer);
  console.log(`✓ Word document created successfully at: ${docxPath}`);
}).catch(err => {
  console.error("Error creating DOCX file:", err);
});

// ---------------------------------------------------------------------------
// 2. GENERATE PDF FILE
// ---------------------------------------------------------------------------

const pdfPath = path.join(downloadsDir, 'MeDo_ERP_System_Reference.pdf');
const pdfDoc = new PDFDocument({ margin: 40, size: 'A4' });
const pdfStream = fs.createWriteStream(pdfPath);

pdfDoc.pipe(pdfStream);

// PDF Header
pdfDoc.fillColor('#0F172A')
      .fontSize(18)
      .text(docTitle, { align: 'center' });

pdfDoc.moveDown(0.3);
pdfDoc.fillColor('#2563EB')
      .fontSize(12)
      .text(docSubTitle, { align: 'center' });

pdfDoc.moveDown(0.5);
pdfDoc.fillColor('#475569')
      .fontSize(10)
      .text(`To: ${author} | Date: ${dateStr} | Email: ${email}`, { align: 'center' })
      .text(`Phone: ${phone} | Version: v4.5 Enterprise Edition`, { align: 'center' });

pdfDoc.moveDown(1);
pdfDoc.strokeColor('#2563EB').lineWidth(2).moveTo(40, pdfDoc.y).lineTo(555, pdfDoc.y).stroke();
pdfDoc.moveDown(1);

// Section Helper for PDF
function addPdfSection(title: string, contentLines: string[]) {
  pdfDoc.fillColor('#1E3A8A').fontSize(14).text(title, { align: 'left' });
  pdfDoc.moveDown(0.4);
  pdfDoc.fillColor('#1E293B').fontSize(9);
  for (const line of contentLines) {
    pdfDoc.text(line, { align: 'left', lineGap: 3 });
  }
  pdfDoc.moveDown(1);
}

addPdfSection('1. Document Overview & Executive Summary', [
  'This comprehensive documentation reference covers the complete architecture, file tree, components,',
  'services, database models, system requirements, and security frameworks for MeDo ERP v4.5 Enterprise.',
  'It serves as an official technical manual for developers, systems managers, and corporate auditors.'
]);

addPdfSection('2. System Architecture & File Tree Overview', [
  '• Root Configuration: index.html, package.json, server.ts, vite.config.ts, tsconfig.json, firestore.rules',
  '• src/components: Over 100 modular enterprise views including App.tsx, Dashboard.tsx, ChartOfAccountsView.tsx,',
  '  JournalEntriesView.tsx, SalesAndReturnsView.tsx, PurchasesAndReturnsView.tsx, InventoryView.tsx, MohasibDataMigrationWizard.tsx',
  '• src/services & utils: Gemini AI Advisor engine, voice-search parser, email dispatchers, ZATCA Phase 2 QR helpers',
  '• src/db & docs: PostgreSQL Drizzle schemas, multi-currency ledger engines, legal compliance and audit manuals'
]);

addPdfSection('3. Technical Stack & Dependencies', [
  '• Frontend Stack: React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4, Motion (Framer Motion)',
  '• Backend & Storage: Express v4 Server, tsx Runtime Engine, PostgreSQL Cloud SQL + Drizzle ORM, Firebase Firestore',
  '• AI Integration: @google/genai SDK powered by Gemini 3.7 Flash & 3.6 Flash models',
  '• Security & Biometrics: WebAuthn Passkeys, Sovereign WAF Shield, Audit Trail Tracker',
  '• Document Engines: HTML2PDF.js, PDFKit, XLSX Excel Export, DOCX Builder'
]);

addPdfSection('4. System & Server Requirements', [
  '• Server Environment: 2+ vCPU, 4GB+ RAM, Node.js 20+, Port 3000 with SSL/TLS reverse proxy',
  '• Database: PostgreSQL 15+ instance with multi-tenant state isolation and automated backups',
  '• Multi-Currency Engine: Native support for YER (Sanaa: 530 / Aden: 1920), SAR (3.75), and USD'
]);

addPdfSection('5. Governance, Audit & Legal Compliance', [
  '• Immutable Audit Trail: Every transaction logged with cryptographically unique audit IDs and IP signatures.',
  '• IFRS & ZATCA Compliance: Fully compliant with IFRS accounting standards and ZATCA Phase 2 tax requirements.',
  '• Legal Disclaimer: MeDo ERP is engineered for enterprise financial management; final audit signoffs remain under client CFO authority.'
]);

pdfDoc.moveDown(2);
pdfDoc.fillColor('#64748B').fontSize(8).text('© 2026 MeDo ERP (BZMT) — Official System Technical Reference Manual', { align: 'center' });

pdfDoc.end();

pdfStream.on('finish', () => {
  console.log(`✓ PDF document created successfully at: ${pdfPath}`);
});
