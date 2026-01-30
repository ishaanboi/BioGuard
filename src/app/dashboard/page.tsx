import { FileText, Activity, ShieldCheck } from "lucide-react";
import { HealthNews } from "@/components/dashboard/health-news";

export default function DashboardPage() {
    const stats = [
        { label: "Total Documents", value: "12", icon: FileText, color: "text-blue-400" },
        { label: "Health Score", value: "98%", icon: Activity, color: "text-green-400" },
        { label: "Security Status", value: "Protected", icon: ShieldCheck, color: "text-emerald-400" },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <blockquote className="text-xl md:text-2xl font-light italic text-blue-100/80 max-w-3xl leading-relaxed">
                    &ldquo;The doctor of the future will give no medicine, but will interest his patient in the care of the human frame, in diet and in the cause and prevention of disease.&rdquo;
                </blockquote>
                <div className="h-0.5 w-12 bg-blue-500/30 rounded-full" />
                <cite className="text-xs font-bold tracking-widest text-white/40 uppercase not-italic">
                    Thomas Edison
                </cite>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-lg hover:bg-white/10 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                            <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/20">Stat</span>
                        </div>
                        <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-blue-200/60 font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>

            <HealthNews />

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Health Scan Completed</h4>
                                <p className="text-xs text-blue-200/50">Details regarding the activity performed.</p>
                            </div>
                            <div className="ml-auto text-xs text-white/30 font-mono">
                                2h ago
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
