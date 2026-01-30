"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    source: { name: string };
    publishedAt: string;
}

const MOCK_NEWS: Article[] = [
    {
        title: "WHO Declares New Global Health Strategy for 2026",
        description: "The World Health Organization outlines a comprehensive plan to tackle emerging infectious diseases and improve global healthcare equity.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
        source: { name: "Global Health" },
        publishedAt: new Date().toISOString()
    },
    {
        title: "Breakthrough in AI-Driven Cancer Detection",
        description: "Researchers have developed a new AI model capable of detecting early-stage tumors with 99% accuracy, revolutionizing diagnostics.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1579684385136-137af18db8e9?auto=format&fit=crop&q=80&w=2070",
        source: { name: "Tech Med Daily" },
        publishedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        title: "The Benefits of Vitamin D: Recent Studies",
        description: "A meta-analysis confirms the vital role of Vitamin D in immune system function and mental health stability.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=2030",
        source: { name: "Wellness Weekly" },
        publishedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        title: "New Vaccine Technology Shows Promise",
        description: "mRNA technology continues to evolve, showing potential for personalized cancer vaccines.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1632053002928-19e4871d3744?auto=format&fit=crop&q=80&w=2070",
        source: { name: "MedTech News" },
        publishedAt: new Date(Date.now() - 250000000).toISOString()
    }
];

export function HealthNews() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [useMock, setUseMock] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
                if (!apiKey) {
                    setUseMock(true);
                    setArticles(MOCK_NEWS);
                    setLoading(false);
                    return;
                }

                if (apiKey.startsWith('pub_')) {
                    // NewsData.io API Logic
                    const res = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&category=health&language=en`);
                    const data = await res.json();
                    if (data.status === "success" && data.results) {
                        setArticles(data.results.map((item: any) => ({
                            title: item.title,
                            description: item.description,
                            url: item.link,
                            urlToImage: item.image_url,
                            source: { name: item.source_id },
                            publishedAt: item.pubDate
                        })));
                        setLoading(false);
                        return;
                    }
                }

                // Fallback / NewsAPI.org Logic
                if (!apiKey.startsWith('pub_')) {
                    const res = await fetch(`https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}`);
                    const data = await res.json();
                    if (data.status === "ok" && data.articles.length > 0) {
                        setArticles(data.articles);
                        setLoading(false);
                        return;
                    }
                }

                // Fallback to mock if API fails or no data
                setUseMock(true);
                setArticles(MOCK_NEWS);
            } catch (error) {
                console.error("Failed to fetch news:", error);
                setUseMock(true);
                setArticles(MOCK_NEWS);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Duplicate articles for seamless loop
    const carouselItems = [...articles, ...articles];

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-lg overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-blue-400" />
                        Health Insights
                    </h2>
                    <p className="text-blue-200/50 text-sm mt-1">Live updates from the medical world.</p>
                </div>
                {useMock && <span className="text-xs text-white/20 uppercase tracking-widest font-mono border border-white/10 px-2 py-1 rounded">Simulated</span>}
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden mask-linear-gradient">
                <motion.div
                    className="flex gap-6 w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: articles.length * 5 // Dynamic duration based on count
                    }}
                    whileHover={{ animationPlayState: "paused" }} // Note: Framer motion doesn't support CSS pause like this easily, logic below
                >
                    {carouselItems.map((article, i) => (
                        <div key={i} className="w-[300px] md:w-[350px] flex-shrink-0 group flex flex-col justify-between bg-black/20 border border-white/5 rounded-xl overflow-hidden hover:bg-black/30 transition-colors h-full">
                            <div className="relative h-40 w-full overflow-hidden">
                                <img
                                    src={article.urlToImage || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070'}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs text-white font-medium">
                                    {article.source.name}
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-white font-semibold mb-2 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                    {article.title}
                                </h3>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <span className="text-xs text-white/30">
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </span>
                                    <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-white" asChild>
                                        <a href={article.url} target="_blank" rel="noreferrer">
                                            Read <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient Masks for fade effect */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
}
