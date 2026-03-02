import { FileText, Activity, ShieldCheck } from "lucide-react";
import { HealthNews } from "@/components/dashboard/health-news";

export default function DashboardPage() {
    const stats = [
        { label: "Total Documents", value: "12", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Health Score", value: "98%", icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
        { label: "Security Status", value: "Protected", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto">
            {/* Quote Section */}
            <div className="animate-slide-up delay-100 flex flex-col items-center justify-center py-6 md:py-10 text-center space-y-6">
                <blockquote className="text-xl md:text-3xl font-light italic text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 max-w-4xl leading-relaxed tracking-tight">
                    &ldquo;The doctor of the future will give no medicine, but will interest his patient in the care of the human frame, in diet and in the cause and prevention of disease.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-blue-500/30" />
                    <cite className="text-xs font-bold tracking-[0.2em] text-blue-200/50 uppercase not-italic">
                        Thomas Edison
                    </cite>
                    <div className="h-[1px] w-8 bg-blue-500/30" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="animate-slide-up delay-300 grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] group relative overflow-hidden">
                        {/* Subtle inner glow on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg} filter blur-3xl`} />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/10 px-2 py-1 rounded-full">Stat</span>
                            </div>
                            <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter shadow-black drop-shadow-md">{stat.value}</div>
                            <div className="text-sm text-blue-200/60 font-medium tracking-wide">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Health News (with its own internal animations, but container animated here) */}
            <div className="animate-slide-up delay-500">
                <HealthNews />
            </div>

            {/* Recent Activity */}
            <div className="animate-slide-up delay-700 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Recent Activity</h2>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors">Health Scan Completed</h4>
                                <p className="text-sm text-blue-200/50 truncate mt-0.5">Automated biometric analysis finished.</p>
                            </div>
                            <div className="text-xs text-white/40 font-medium bg-black/20 px-3 py-1.5 rounded-full shrink-0">
                                2h ago
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
