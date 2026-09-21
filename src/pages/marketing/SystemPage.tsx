import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SystemPage = () => {
  const { lang } = useLanguage();
  return (
    <div className="p-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-[#0A2540] mb-8">{lang === 'ar' ? 'نظام SAP/MeDO ERP' : 'SAP/MeDO ERP System'}</h1>
      <p className="text-lg text-gray-700 mb-6">
        {lang === 'ar' 
          ? 'منصة سحابية متكاملة مصممة لإدارة المؤسسات وفق معايير عالمية (IFRS/GAAP) مع ربط لحظي لكافة الأقسام.'
          : 'An integrated cloud platform designed to manage enterprises according to international standards (IFRS/GAAP) with real-time connectivity for all departments.'}
      </p>
      <h2 className="text-2xl font-bold text-[#0A2540] mb-4">{lang === 'ar' ? 'الوحدات الرئيسية' : 'Core Modules'}</h2>
      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
        <li>{lang === 'ar' ? 'المحاسبة والمالية (مستوى بنكي)' : 'Accounting & Finance (Bank-Grade)'}</li>
        <li>{lang === 'ar' ? 'إدارة المبيعات ونقاط البيع' : 'Sales & POS Management'}</li>
        <li>{lang === 'ar' ? 'إدارة المشتريات والمخزون اللحظي' : 'Purchasing & Real-time Inventory'}</li>
        <li>{lang === 'ar' ? 'إدارة الموارد البشرية' : 'Human Resources Management'}</li>
        <li>{lang === 'ar' ? 'إدارة الأصول الثابتة' : 'Fixed Assets Management'}</li>
        <li>{lang === 'ar' ? 'التحليل الذكي (Gemini AI)' : 'Smart Analytics (Gemini AI)'}</li>
      </ul>
    </div>
  );
};