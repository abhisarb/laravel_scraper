import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Calendar, User, ExternalLink, Sparkles } from 'lucide-react';

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await api.get(`/articles/${id}`);
                setArticle(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Article...</div>;
    if (!article) return <div className="p-10 text-center text-red-500">Article not found</div>;

    const isEnhanced = article.title.includes('(AI Enhanced)');

    let references = [];
    if (Array.isArray(article.references)) {
        references = article.references;
    } else if (typeof article.references === 'string') {
        try {
            references = JSON.parse(article.references);
        } catch (e) {
            references = [];
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Articles
            </Link>

            <article className="bg-slate-900/50 rounded-2xl p-8 md:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
                {isEnhanced && (
                    <div className="absolute top-0 right-0 bg-blue-600/20 backdrop-blur text-blue-300 text-xs font-bold px-4 py-2 rounded-bl-2xl border-l border-b border-blue-500/30 flex items-center gap-2">
                        <Sparkles size={14} /> AI Enhanced Version
                    </div>
                )}

                <header className="mb-10 border-b border-slate-800 pb-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        </div>
                        {article.source_url && (
                            <div className="flex items-center gap-2">
                                <ExternalLink size={16} className="text-blue-500" />
                                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    Original Source
                                </a>
                            </div>
                        )}
                    </div>
                </header>

                {article.image_url && (
                    <div className="mb-10 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                        <img src={article.image_url} alt={article.title} className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none text-slate-300 whitespace-pre-wrap">
                    {article.content}
                </div>

                {references.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">References</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            {references.map((ref, idx) => (
                                <li key={idx}>
                                    <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                        {ref}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </article>
        </div>
    );
};

export default ArticleDetail;
