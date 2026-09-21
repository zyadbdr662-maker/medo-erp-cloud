import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, User, ArrowRight, Clock, Search, Sparkles, BookOpen } from 'lucide-react';
import { blogData, BlogArticle } from '../../data/blogData';

export const BlogPage = () => {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorted by date descending (latest first, preserving ID priority for same dates)
  const sortedArticles = useMemo(() => {
    return [...blogData.articles].sort((a, b) => {
      const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.id - b.id;
    });
  }, []);

  // Filtered by category and search query
  const filteredArticles = useMemo(() => {
    return sortedArticles.filter((article: BlogArticle) => {
      const matchesCategory = 
        selectedCategory === 'الكل' || article.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q || 
        article.title.toLowerCase().includes(q) || 
        article.excerpt.toLowerCase().includes(q) || 
        article.content.toLowerCase().includes(q) || 
        (article.tags && article.tags.some(t => t.toLowerCase().includes(q)));
      
      return matchesCategory && matchesSearch;
    });
  }, [sortedArticles, selectedCategory, searchQuery]);

  // Featured article (Article 1 by default when not searching)
  const featuredArticle = useMemo(() => {
    if (searchQuery || selectedCategory !== 'الكل') return null;
    return sortedArticles.find(a => a.featured) || sortedArticles[0];
  }, [sortedArticles, searchQuery, selectedCategory]);

  // Articles for the grid
  const gridArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter(a => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'الكل': blogData.articles.length
    };
    blogData.categories.forEach(cat => {
      counts[cat] = blogData.articles.filter(a => a.category === cat).length;
    });
    return counts;
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A2540]/5 text-[#0A2540] border border-[#0A2540]/10 text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sap-secondary" />
            {lang === 'ar' ? 'مركز المعرفة والأخبار' : 'Knowledge & News Hub'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0A2540] mb-4 tracking-tight leading-tight">
            {lang === 'ar' ? 'مدونة SAP/MeDO ERP وحلول الأعمال' : 'SAP/MeDO ERP & Business Solutions Blog'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {lang === 'ar'
              ? 'أحدث المقالات والرؤى المتخصصة في أنظمة تخطيط الموارد، تقنيات الذكاء المالي المتقدم المالي، إدارة التدفقات النقدية، ونماذج التحول الرقمي.'
              : 'Latest insights and guides on ERP, financial AI, cash flow management, and digital transformation stories.'}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-12 max-w-4xl mx-auto space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن مقال، موضوع، أو كلمة مفتاحية (مثال: ذكاء اصطناعي، تدفقات، محاسبة)...' : 'Search articles by title, topic, or keyword...'}
              className="w-full pr-12 pl-4 py-3.5 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 left-4 text-xs font-semibold text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>

          {/* Categories Pills */}
          <div className="flex justify-center gap-2.5 flex-wrap">
            {['الكل', ...blogData.categories].map(cat => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0A2540] text-white shadow-md shadow-[#0A2540]/20'
                      : 'bg-white text-[#0A2540] border border-gray-200 hover:border-sap-secondary hover:bg-gray-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Hero Article */}
        {featuredArticle && (
          <div className="mb-14 bg-gradient-to-br from-[#0A2540] via-[#0F3254] to-[#16426C] text-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 z-10">
              <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                <span className="bg-sap-secondary text-[#0A2540] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'ar' ? 'مقال مميز' : 'Featured Story'}
                </span>
                <span className="bg-white/10 text-gray-200 text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                  {featuredArticle.category}
                </span>
                {featuredArticle.readTime && (
                  <span className="flex items-center gap-1 text-xs text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-sap-secondary" />
                    {featuredArticle.readTime}
                  </span>
                )}
              </div>

              <Link to={`/blog/${featuredArticle.id}`}>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white hover:text-sap-secondary transition duration-200 mb-4 leading-snug">
                  {featuredArticle.title}
                </h2>
              </Link>

              <p className="text-gray-200 text-sm sm:text-base mb-6 leading-relaxed line-clamp-3">
                {featuredArticle.excerpt}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredArticle.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {featuredArticle.author}
                  </span>
                </div>

                <Link
                  to={`/blog/${featuredArticle.id}`}
                  className="inline-flex items-center gap-2 bg-sap-secondary text-[#0A2540] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-white transition duration-200 shadow-md"
                >
                  <span>{lang === 'ar' ? 'قراءة المقال بالكامل' : 'Read Full Story'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden min-h-[300px]">
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] lg:bg-gradient-to-r lg:from-[#0A2540] to-transparent opacity-60 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Empty Search State */}
        {filteredArticles.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-gray-100 shadow-xs my-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0A2540] mb-2">
              {lang === 'ar' ? 'لم يتم العثور على مقالات' : 'No Articles Found'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {lang === 'ar'
                ? 'جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً.'
                : 'Try searching with another keyword or selecting a different category.'}
            </p>
            <button
              onClick={() => { setSelectedCategory('الكل'); setSearchQuery(''); }}
              className="text-xs font-bold text-[#0A2540] underline hover:text-sap-secondary"
            >
              {lang === 'ar' ? 'عرض جميع المقالات' : 'Show All Articles'}
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {gridArticles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridArticles.map((post: BlogArticle) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:border-[#B8860B]/40"
              >
                {/* Thumbnail Image */}
                <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#0A0A0A]/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase border border-white/10">
                    {post.category}
                  </div>
                  {post.readTime && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-[#B8860B]" />
                      {post.readTime}
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <Link to={`/blog/${post.id}`}>
                      <h2 className="text-lg font-bold text-[#0A0A0A] mb-2.5 leading-snug group-hover:text-[#B8860B] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    </div>

                    <p className="text-[#1A2B4C] text-sm mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="bg-amber-50/70 text-[#B8860B] text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-amber-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-[#B8860B] font-bold text-xs sm:text-sm group-hover:text-[#0A0A0A] transition-colors"
                    >
                      <span>{lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                      <ArrowRight className="w-4 h-4 mr-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-[11px] text-gray-400 font-mono">
                      #{post.id}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
