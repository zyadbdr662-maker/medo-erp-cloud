import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { trackEvent } from '../../components/marketing/AnalyticsTracker';
import { Check, Star, Crown, Zap, Phone, ArrowLeft, Building2, Server, Users, BarChart3, Database } from 'lucide-react';

export const PricingPage = () => {
  const { lang } = useLanguage();

  const plans = [
    {
      id: 'essential',
      name: 'الأساسية',
      price: '150,000',
      icon: <Building2 className="w-12 h-12 text-sap-secondary" />,
      features: ['3 مستخدمين', '5 فروع', 'إدارة المبيعات والمشتريات', 'إدارة المخزون', 'التقارير الأساسية'],
      buttonText: 'اشترك الآن',
      bgColor: 'bg-[#0a2540]',
      borderColor: 'border-slate-300'
    },
    {
      id: 'advanced',
      name: 'المتقدمة',
      price: '250,000',
      icon: <Star className="w-12 h-12 text-sap-secondary" />,
      features: ['10 مستخدمين', '15 فرع', 'جميع وحدات الأساسية', 'دعم المحافظ الإلكترونية', 'الذكاء المالي المتقدم', 'دعم واتساب'],
      buttonText: 'اشترك الآن',
      bgColor: 'bg-[#0066CC]',
      borderColor: 'border-sap-secondary',
      badge: 'الأكثر طلباً'
    },
    {
      id: 'enterprise',
      name: 'المؤسسية',
      price: '400,000',
      icon: <Crown className="w-12 h-12 text-sap-secondary" />,
      features: ['مستخدمين غير محدودين', 'فروع غير محدودة', 'جميع وحدات المتقدمة', 'دعم فني 24/7', 'تدريب مخصص', 'تكامل مع أنظمة أخرى'],
      buttonText: 'اشترك الآن',
      bgColor: 'bg-[#0a2540]',
      borderColor: 'border-sap-secondary',
      badge: 'الأفضل للشركات'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-12 animate-fadeIn" dir="rtl">
        {/* Promo Banner */}
        <div className="bg-sap-secondary text-[#0A2540] text-center py-3 font-black text-sm rounded-xl shadow-lg animate-pulse">
            🎉 عرض الإطلاق: خصم 30% لأول 10 عملاء!
        </div>

        <h1 className="text-4xl font-black text-white text-center">💰 خطط الأسعار</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
                <div key={plan.id} className={`${plan.bgColor} p-8 rounded-3xl border-2 ${plan.borderColor} text-center text-white space-y-6 hover:shadow-2xl hover:shadow-sap-secondary/20 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}>
                    {plan.badge && (
                        <div className="absolute top-4 right-4 bg-sap-secondary text-[#0A2540] text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</div>
                    )}
                    <div className="flex justify-center">{plan.icon}</div>
                    <h2 className="text-2xl font-black">{plan.name}</h2>
                    <div className="text-4xl font-black">{plan.price} <span className="text-sm font-normal">ريال / سنوياً</span></div>
                    <ul className="text-right space-y-3">
                        {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="text-sap-secondary w-4 h-4" /> {f}</li>)}
                    </ul>
                    <button className="w-full bg-sap-secondary text-[#0A2540] py-3 rounded-full font-black text-lg hover:brightness-110 transition">{plan.buttonText}</button>
                </div>
            ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-[#0a2540] p-8 rounded-3xl border border-slate-700 shadow-xl overflow-x-auto">
            <h2 className="text-2xl font-black text-white mb-8 text-center">📊 جدول مقارنة تفصيلي</h2>
            <table className="w-full text-white text-right border-collapse">
                <thead><tr className="border-b border-slate-700"><th className="p-4">الميزة</th><th className="p-4">الأساسية</th><th className="p-4">المتقدمة</th><th className="p-4">المؤسسية</th></tr></thead>
                <tbody>
                    {[
                        ['المستخدمون', '3', '10', 'غير محدود'],
                        ['الفروع', '5', '15', 'غير محدود'],
                        ['المحافظ', '❌', '✅', '✅'],
                        ['الذكاء AI', '❌', '✅', '✅'],
                        ['دعم واتساب', '❌', '✅', '✅'],
                        ['دعم 24/7', '❌', '❌', '✅']
                    ].map(row => <tr key={row[0]} className="border-b border-slate-700/50"><td className="p-4">{row[0]}</td><td className="p-4">{row[1]}</td><td className="p-4">{row[2]}</td><td className="p-4">{row[3]}</td></tr>)}
                </tbody>
            </table>
        </div>
    </div>
  );
};