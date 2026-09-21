# MeDo ERP SaaS & Enterprise Platform (v4.5.2026)

نظام محاسبي وإداري متكامل (ERP) مصمم خصيصاً للشركات والمؤسسات التجارية، مدعوم ببنية تحتية سحابية متقدمة لإدارة المنشآت والاشتراكات والتراخيص (Multi-Tenant Cloud ERP).

---

## 🎯 المشروع والبيئة الرسمية المعتمدة (Production Master)

* **اسم المشروع المعتمد (Vercel)**: `MeDo ERP Cloud (medo-erp-cloud)`
* **الرابط الرسمي المعتمد (Live Production)**: [https://medo-erp-cloud.vercel.app](https://medo-erp-cloud.vercel.app)
* **النطاق السيادي المخصص (Custom Domain)**: [https://medo-erp.us.ci](https://medo-erp.us.ci)
* **مستودع الأكواد (GitHub)**: `https://github.com/zyadbdr662-maker/Mdanmedo-erp-sap-s-4hana-6103.ai.studio`
* **حالة النشر التلقائي**: ✅ مفعّل تلقائياً (AI Studio ➔ GitHub `main` ➔ Vercel Auto-Deploy)

---

## 🔗 نماذج الروابط الموحدة للمنشآت والأدوار

### 1. الرابط الرئيسي لأي منشأة:
```
https://medo-erp-cloud.vercel.app/?tenant=[tenant-id]
```
*مثال: `https://medo-erp-cloud.vercel.app/?tenant=company-1`*

### 2. الروابط الفرعية للأدوار الخمسة المعتمدة:

* **مدير الفرع (MANAGER)**:
  `https://medo-erp-cloud.vercel.app/?tenant=[id]&role=MANAGER&token=AUTH_MGR_[id]&path=/employee/manager`

* **المحاسب المالي (ACCOUNTANT)**:
  `https://medo-erp-cloud.vercel.app/?tenant=[id]&role=ACCOUNTANT&token=AUTH_ACC_[id]&path=/employee/accountant`

* **أمين الصندوق والكاشير (CASHIER)**:
  `https://medo-erp-cloud.vercel.app/?tenant=[id]&role=CASHIER&token=AUTH_SALES_[id]&path=/employee/sales`

* **مسؤول المشتريات والمخازن (PURCHASER)**:
  `https://medo-erp-cloud.vercel.app/?tenant=[id]&role=PURCHASER&token=AUTH_PUR_[id]&path=/employee/purchase`

* **المراجع والمدقق الداخلي (AUDITOR)**:
  `https://medo-erp-cloud.vercel.app/?tenant=[id]&role=AUDITOR&token=AUTH_AUD_[id]&path=/employee/auditor`

---

## 🏗️ هيكلية النظام (System Architecture)

يعتمد نظام **MeDo ERP** على هيكلية برمجية حديثة ومتكاملة مقسمة إلى الوحدات التالية:
1. **الوحدات المحاسبية والمالية**: دليل الحسابات، قيود اليومية، دفتر الأستاذ، ميزان المراجعة، وقائمة الدخل.
2. **إدارة المخزون والمستودعات**: مراقبة الأصناف، الحركات المخزنية، والتنبيهات.
3. **المبيعات ونقاط البيع POS**: فواتير البيع والشراء، المرتجعات، وتوليد الباركود والفواتير الإلكترونية ZATCA.
4. **الموارد البشرية والشؤون الإدارية**: إدارة الموظفين، الحضور والانصراف، ورواتب الكادر.
5. **المنصة السحابية وإدارة التراخيص (SaaS Platform)**: خاصة بإدارة الـ 200 منشأة، إصدار التراخيص، ومراقبة الجلسات.

---

## 🛡️ سياسة التحكم بالصلاحيات (RBAC)

* **المستخدم والعملاء (`USER` / `CLIENT`)**:
  * واجهة مخصصة بالكامل للمنشأة المحددة مع عزل تام للبيانات المالية والمحاسبية.
* **الأدوار الوظيفية الخمسة (`MANAGER`, `ACCOUNTANT`, `CASHIER`, `PURCHASER`, `AUDITOR`)**:
  * صلاحيات دقيقة محددة ومقيدة بالمسارات والعمليات المصرح بها لكل دور.
* **الإدارة السيادية العليا (`SUPER_ADMIN`)**:
  * تحكم كامل في إدارة التراخيص، ومراقبة الـ 200 منشأة، وتهيئة النظام والتحديثات.

---

## 🏢 الحقوق والملكية
* **تطوير وبرمجة**: ميدو تك (MeDo Tech)
* **إشراف وإدارة**: مجموعة بن زياد التجارية المحدودة (ممثلة بالأستاذ/ بدر عايض محمد).
* **الإصدار**: v4.5.2026 - BUILD-SAP-6103-REL-2026
