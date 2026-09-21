import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const ContactPage = () => {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Cairo',sans-serif]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 text-[#B8860B] px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'ميدو تك للحلول البرمجية المتطورة' : 'MeDo Tech Enterprise Solutions'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
            {lang === 'ar' ? 'اتصل بنا للاستفسارات والدعم الفني' : 'Contact Us & Technical Support'}
          </h1>
          <p className="text-base sm:text-lg text-[#1A2B4C] max-w-2xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'نحن هنا لمساعدتكم في أي استفسار حول نظام SAP/MeDO ERP وتوفير الدعم الفني والاستشارات المحاسبية المتخصصة.'
              : 'We are here to assist you with any inquiries about SAP/MeDO ERP and provide specialized technical support.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left/Contact Info Card (lg: 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <h2 className="text-xl font-extrabold text-[#0A0A0A] mb-6 flex items-center gap-2 border-b-2 border-[#B8860B] pb-3">
                <Phone className="w-5 h-5 text-[#B8860B]" />
                <span>{lang === 'ar' ? '📞 للاستفسارات والدعم الفني:' : 'Inquiries & Technical Support:'}</span>
              </h2>

              <ul className="space-y-5 text-[#1A2B4C]">
                {/* Phone */}
                <li className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-[#B8860B] mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      {lang === 'ar' ? 'الجوال (اتصال مباشر):' : 'Phone (Direct Call):'}
                    </div>
                    <a 
                      href="tel:+0967773586047" 
                      dir="ltr"
                      className="text-base font-extrabold text-[#0A0A0A] hover:text-[#B8860B] transition inline-block"
                    >
                      +0967773586047
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar' ? '(رمز اليمن +967)' : '(Yemen Dial Code +967)'}
                    </p>
                  </div>
                </li>

                {/* WhatsApp */}
                <li className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      {lang === 'ar' ? 'واتساب (للتواصل المباشر):' : 'WhatsApp (Direct Chat):'}
                    </div>
                    <a 
                      href="https://wa.me/967773586047?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D9%8A%D8%AF%D9%88%20%D8%AA%D9%83%20MeDo%20ERP%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%86%D8%B8%D8%A7%D9%85" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="text-base font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition"
                    >
                      <span>+0967773586047</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://wa.me/967773586047?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D9%8A%D8%AF%D9%88%20%D8%AA%D9%83%20MeDo%20ERP%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%86%D8%B8%D8%A7%D9%85"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'محادثة واتساب فورية' : 'Instant WhatsApp Chat'}</span>
                    </a>
                  </div>
                </li>

                {/* Email */}
                <li className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}
                    </div>
                    <a 
                      href="mailto:bdr.zyad@yandex.com" 
                      className="text-base font-bold text-[#0A0A0A] hover:text-[#B8860B] transition"
                    >
                      bdr.zyad@yandex.com
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar' ? 'الرد خلال 24 ساعة كحد أقصى' : 'Response within 24 hours'}
                    </p>
                  </div>
                </li>

                {/* Address */}
                <li className="flex items-start gap-3.5 pt-2 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-[#B8860B] mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      {lang === 'ar' ? '📍 العنوان الفعلي:' : 'Physical Address:'}
                    </div>
                    <p className="text-base font-bold text-[#0A0A0A]">
                      {lang === 'ar' ? 'خمر - الكدوي - عمارة القلمي دور أرضي' : 'Khamir - Al-Kudawi - Al-Qalmi Building, Ground Floor'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar' ? 'الجمهورية اليمنية' : 'Republic of Yemen'}
                    </p>
                  </div>
                </li>

                {/* Working Hours */}
                <li className="flex items-start gap-3.5 pt-2 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-0.5">
                      {lang === 'ar' ? '🕐 ساعات العمل الرسمية:' : 'Working Hours:'}
                    </div>
                    <div className="text-sm font-bold text-[#0A0A0A]">
                      {lang === 'ar' ? 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً' : 'Sunday - Thursday: 8:00 AM - 5:00 PM'}
                    </div>
                    <div className="text-xs font-semibold text-rose-600 mt-1">
                      {lang === 'ar' ? 'الجمعة والسبت: مغلق' : 'Friday & Saturday: Closed'}
                    </div>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-5 border-t border-gray-100 bg-amber-50/40 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-[#1A2B4C] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0" />
                  <span>
                    {lang === 'ar' 
                      ? '📱 يمكنك أيضاً التواصل عبر نموذج الاتصال، وسنرد عليك خلال 24 ساعة.'
                      : 'You can also reach out via the contact form and we will reply within 24 hours.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right/Contact Form (lg: 7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-extrabold text-[#0A0A0A] mb-2">
                {lang === 'ar' ? 'أرسل لنا رسالة أو استفساراً' : 'Send Us a Message'}
              </h2>
              <p className="text-sm text-[#1A2B4C] mb-6">
                {lang === 'ar' 
                  ? 'املأ النموذج التالي، وسيتواصل معك مستشار من فريق الدعم الفني والمبيعات فوراً.'
                  : 'Fill in the form below and our technical support & sales team will get back to you.'}
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-2xl text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-emerald-800 mb-2">
                    {lang === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received Successfully!'}
                  </h3>
                  <p className="text-[#1A2B4C] max-w-md mx-auto mb-6">
                    {lang === 'ar'
                      ? 'شكراً لتواصلك مع ميدو تك. سيقوم فريقنا بمراجعة استفسارك والرد عليك خلال 24 ساعة.'
                      : 'Thank you for contacting MeDo Tech. Our team will review your inquiry and reply within 24 hours.'}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="bg-[#0A0A0A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1A2B4C] transition"
                  >
                    {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                        {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={lang === 'ar' ? 'مثال: بدر عايض محمد' : 'e.g. Badr Ayed Mohammed'}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none text-sm font-medium transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                        {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@domain.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none text-sm font-medium transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                        {lang === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+967 773 586 047"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none text-sm font-medium transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                        {lang === 'ar' ? 'موضوع الاستفسار' : 'Subject'}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none text-sm font-medium transition"
                      >
                        <option value="">{lang === 'ar' ? '-- اختر موضوعاً --' : '-- Select a Subject --'}</option>
                        <option value="trial">{lang === 'ar' ? 'طلب تجربة مجانية (30 يوماً)' : 'Request 30-day Free Trial'}</option>
                        <option value="demo">{lang === 'ar' ? 'طلب عرض توضيحي (Demo)' : 'Request a Demo'}</option>
                        <option value="pricing">{lang === 'ar' ? 'استفسار عن الأسعار والباقات' : 'Pricing & Plans'}</option>
                        <option value="support">{lang === 'ar' ? 'دعم فني وتدريب' : 'Technical Support & Training'}</option>
                        <option value="partnership">{lang === 'ar' ? 'شراكة أعمال وموزعين' : 'Partnership & Resellers'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                      {lang === 'ar' ? 'نص الرسالة *' : 'Message *'}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={lang === 'ar' ? 'اكتب تفاصيل طلبك أو استفسارك هنا...' : 'Write the details of your inquiry here...'}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none text-sm font-medium transition resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#996515] text-white font-black text-sm px-8 py-3.5 rounded-xl shadow-md transition transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps Location Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#0A0A0A] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B8860B]" />
                <span>{lang === 'ar' ? 'خريطة الموقع الجغرافي (خمر - عمران / اليمن)' : 'Geographical Location Map (Khamir, Yemen)'}</span>
              </h3>
              <p className="text-sm text-[#1A2B4C] mt-1">
                {lang === 'ar' ? 'العنوان: خمر - الكدوي - عمارة القلمي دور أرضي' : 'Address: Khamir - Al-Kudawi - Al-Qalmi Building, Ground Floor'}
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Khamir,+Amran,+Yemen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] font-bold text-xs px-4 py-2 rounded-xl transition self-start sm:self-auto"
            >
              <span>{lang === 'ar' ? 'فتح في خرائط Google' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B8860B]" />
            </a>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 relative">
            <iframe
              title="Khamir Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Khamir,Amran,Yemen&t=&z=14&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
