'use server';

export interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    source: { name: string };
    publishedAt: string;
}

// Reuse Mock Data for resiliency
const MOCK_NEWS: Article[] = [
    {
        title: "Global Health Summit 2026: Key Takeaways",
        description: "Leaders from around the world gathered to discuss the future of pandemic prevention and AI in healthcare.",
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

export async function getHealthNews(searchQuery: string = "", pageToken: string = "") {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        console.warn("Missing NEWS_API_KEY, returning mock data.");
        return { articles: MOCK_NEWS, nextPage: null };
    }

    try {
        let url = "";

        if (apiKey.startsWith('pub_')) {
            // NewsData.io
            const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
            const pageParam = pageToken ? `&page=${pageToken}` : "";
            url = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=health&language=en${queryParam}${pageParam}`;
        } else {
            // NewsAPI.org
            const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
            const pageParam = pageToken ? `&page=${pageToken}` : "";
            url = `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${apiKey}${queryParam}`;
        }

        const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        const data = await res.json();

        if (apiKey.startsWith('pub_')) {
            if (data.status === "success" && data.results) {
                const mapped = data.results.map((item: any) => ({
                    title: item.title,
                    description: item.description,
                    url: item.link,
                    urlToImage: item.image_url,
                    source: { name: item.source_id },
                    publishedAt: item.pubDate
                }));
                return { articles: mapped, nextPage: data.nextPage || null };
            }
        } else {
            if (data.status === "ok" && data.articles) {
                return { articles: data.articles, nextPage: null };
            }
        }

        console.warn("News API returned invalid status or empty results, falling back to mock.");
        return { articles: MOCK_NEWS, nextPage: null };

    } catch (error) {
        console.error("News fetch error:", error);
        return { articles: MOCK_NEWS, nextPage: null };
    }
}
