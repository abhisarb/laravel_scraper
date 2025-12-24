import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Loader2 } from 'lucide-react';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await api.get('/articles');
                setArticles(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch articles');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center text-blue-500">
            <Loader2 className="animate-spin" size={48} />
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center text-red-500">
            {error}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                    BeyondChats Blog
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Explore the latest insights on AI chatbots, automation, and business growth.
                    Featuring AI-enhanced content for superior readability.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default ArticleList;
