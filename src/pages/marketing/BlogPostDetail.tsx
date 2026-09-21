import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useLanguage } from '../../context/LanguageContext';
import { blogData, BlogArticle } from '../../data/blogData';
import statData from '../../data/statdata.json';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  Tag, 
  Share2, 
  Check, 
  History, 
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const BlogPostDetail = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [restoredNotification, setRestoredNotification] = useState<string | null>(null);

  const article = blogData.articles.find((a: BlogArticle) => a.id === Number(id));

  // Related articles (excluding current)
  const relatedArticles = blogData.articles
    .filter((a: BlogArticle) => a.id !== Number(id))
    .slice(0, 3);

  // Versions for this article
  const articleHistory = statData.history.filter(h => h.articleId === Number(id));

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handleRestoreVersion = (version: string, timestamp: string) => {
    setShowHistoryModal(false);
    setRestoredNotification(
      lang === 'ar' 
        ? `تمت استعادة نسخة المقال (${version}) المؤرخة في ${timestamp} بنجاح!` 
        : `Article version (${version}) from ${timestamp} restored successfully!`
    );
    setTimeout(() => setRestoredNotification(null), 4000);
  };

  if (!article) {
    return (
      <div className="p-16 max-w-xl mx-auto text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[#0A2540] mb-3">
          {lang === 'ar' ? 'المقال غير موجود' : 'Article Not Found'}
        </h1>
        <p className="text-gray-600 mb-6">
          {lang === 'ar' 
            ? 'المقال الذي تبحث عنه قد يكون تم نقله أو حذفه.' 
            : 'The article you are looking for might have been moved or deleted.'}
        </p>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 bg-[#0A2540] text-white px-6 py-3 rounded-lg hover:bg-sap-secondary hover:text-[#0A2540] font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast notification for restore */}
      {restoredNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A2540] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-sap-secondary text-sm animate-bounce">
          <RefreshCw className="w-4 h-4 text-sap-secondary" />
          <span>{restoredNotification}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Navigation & Controls Bar */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2540] hover:text-sap-secondary transition"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            {lang === 'ar' ? 'العودة لجميع المقالات' : 'Back to All Articles'}
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              title={lang === 'ar' ? 'مشاركة الرابط' : 'Share Link'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
              title={lang === 'ar' ? 'سجل النسخ والاستعادة' : 'History & Restore'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'استعادة / Restore' : 'Restore'}</span>
            </button>
          </div>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12 article-container cairo-typography blog-article">
          {/* Article Header Image Banner */}
          {article.imageUrl && (
            <div className="w-full h-72 sm:h-96 relative overflow-hidden bg-gray-100">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 right-6 left-6 text-white flex items-center justify-between flex-wrap gap-2">
                <span className="bg-[#B8860B] text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {article.category}
                </span>
                {article.readTime && (
                  <span className="flex items-center gap-1 text-xs bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                    {article.readTime}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-8 sm:p-12">
            {/* Metadata Bar */}
            <div className="flex items-center gap-4 mb-6 text-xs text-gray-500 border-b border-gray-100 pb-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {article.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                {article.author}
              </span>
            </div>

            <h1 className="article-title article-h1 text-[#0A0A0A] font-extrabold mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="article-text article-p text-[#1A2B4C] font-medium mb-8 pb-8 border-b-2 border-[#B8860B]/30 leading-relaxed bg-amber-50/20 p-6 rounded-2xl border">
              {article.excerpt}
            </p>

            {/* Markdown Content */}
            <div className="markdown-body article-content cairo-typography space-y-6 text-[#1A2B4C] leading-relaxed">
              <Markdown
                components={{
                  h2: ({ ...props }) => (
                    <h2 className="article-h2 text-[#0A0A0A] font-bold border-b-2 border-[#B8860B] pb-2.5 flex items-center gap-2" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="article-h3 text-[#0A0A0A] font-bold mt-6 mb-3" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="article-text article-p text-[#1A2B4C] leading-relaxed" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="list-disc list-inside space-y-2 mb-6 bg-gray-50/60 p-5 rounded-xl border border-gray-100" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-6 bg-gray-50/60 p-5 rounded-xl border border-gray-100" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="article-list-item text-[#1A2B4C] leading-relaxed" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="article-highlight text-[#B8860B] font-bold" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote className="article-quote border-r-4 border-[#B8860B] pr-5 py-3 my-6 bg-amber-50/40 rounded-l-xl text-[#1A2B4C] italic" {...props} />
                  ),
                  pre: ({ ...props }) => (
                    <pre className="bg-[#0A2540] text-gray-100 p-5 rounded-xl overflow-x-auto text-sm my-6 font-mono border border-gray-800" {...props} />
                  ),
                  code: ({ ...props }) => (
                    <code className="bg-amber-50 text-[#B8860B] font-bold px-1.5 py-0.5 rounded font-mono text-sm border border-amber-200" {...props} />
                  ),
                }}
              >
                {article.content}
              </Markdown>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t-2 border-[#B8860B]/20 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#B8860B] ml-1" />
                <span className="text-xs font-semibold text-gray-500 ml-2">
                  {lang === 'ar' ? 'الكلمات المفتاحية:' : 'Tags:'}
                </span>
                {article.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="article-tag-badge px-3 py-1 rounded-full text-xs transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author / Executive Card Footer */}
            <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0A2540] text-sap-secondary font-black flex items-center justify-center text-lg shadow-sm border border-sap-secondary/30">
                  MeDo
                </div>
                <div>
                  <h4 className="font-bold text-[#0A2540] text-base">{article.author}</h4>
                  <p className="text-xs text-gray-500">
                    {lang === 'ar' 
                      ? 'منظومة SAP/MeDO ERP السحابية • ميدو تك للحلول السحابية' 
                      : 'SAP/MeDO ERP Cloud Platform • MeDo Tech Cloud'}
                  </p>
                </div>
              </div>
              <Link
                to="/pricing"
                className="bg-[#0A2540] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-sap-secondary hover:text-[#0A2540] transition shadow-xs"
              >
                {lang === 'ar' ? 'طلب نسخة تجريبية 30 يوماً' : 'Request 30-Day Trial'}
              </Link>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0A2540]">
                {lang === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
              </h3>
              <Link 
                to="/blog" 
                className="text-sm font-semibold text-sap-secondary hover:underline flex items-center gap-1"
              >
                {lang === 'ar' ? 'عرض المزيد' : 'View More'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: BlogArticle) => (
                <div 
                  key={rel.id} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  <div className="h-32 w-full overflow-hidden bg-gray-100 relative">
                    <img 
                      src={rel.imageUrl} 
                      alt={rel.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-2 right-2 bg-[#0A2540]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {rel.category}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <Link to={`/blog/${rel.id}`}>
                        <h4 className="font-bold text-[#0A2540] text-sm leading-snug hover:text-sap-secondary transition line-clamp-2 mb-2">
                          {rel.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[11px] text-gray-400">
                      <span>{rel.date}</span>
                      <Link 
                        to={`/blog/${rel.id}`} 
                        className="font-semibold text-[#0A2540] hover:text-sap-secondary flex items-center gap-0.5"
                      >
                        {lang === 'ar' ? 'قراءة' : 'Read'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Revision History & Restore Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0A2540]" />
                <h3 className="font-bold text-lg text-[#0A2540]">
                  {lang === 'ar' ? 'سجل إصدارات المقال واستعادته' : 'Article Revision History & Restore'}
                </h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              {lang === 'ar' 
                ? 'يمكنك استعادة أي نسخة احتياطية سابقة من هذا المقال ومزامنتها مع واجهة النظام.' 
                : 'You can restore any previous backup version of this article and sync with the ERP.'}
            </p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {articleHistory.length > 0 ? (
                articleHistory.map((hist, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs hover:bg-amber-50/50 transition"
                  >
                    <div>
                      <div className="font-bold text-[#0A2540]">
                        {lang === 'ar' ? `النسخة ${hist.version}` : `Version ${hist.version}`}
                      </div>
                      <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {hist.timestamp}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(hist.version, hist.timestamp)}
                      className="px-3 py-1.5 bg-[#0A2540] text-white rounded-lg hover:bg-sap-secondary hover:text-[#0A2540] font-semibold transition"
                    >
                      {lang === 'ar' ? 'استعادة' : 'Restore'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 text-center rounded-xl text-xs text-gray-500">
                  {lang === 'ar' ? 'النسخة الحالية هي النسخة الأساسية الموثقة في النظام.' : 'The current version is the baseline recorded version.'}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
