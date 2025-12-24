import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, User } from 'lucide-react';
import classNames from 'classnames';

const ArticleCard = ({ article }) => {
    const isEnhanced = article.title.includes('(AI Enhanced)');

    return (
        <Link
            to={`/article/${article.id}`}
            className={classNames(
                "group relative block overflow-hidden rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1",
                { "border-blue-500/50 shadow-blue-900/10": isEnhanced }
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                {article.image_url ? (
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-600">
                        No Image
                    </div>
                )}

                {isEnhanced && (
                    <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-blue-400/30">
                        <Sparkles size={12} className="text-yellow-300" />
                        AI Enhanced
                    </div>
                )}
            </div>

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User size={12} />
                        <span className="truncate max-w-[100px]">{article.author}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                    {article.title.replace(' (AI Enhanced)', '')}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-3">
                    {article.content.substring(0, 120)}...
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Read more →</span>
                </div>
            </div>
        </Link>
    );
};

export default ArticleCard;
