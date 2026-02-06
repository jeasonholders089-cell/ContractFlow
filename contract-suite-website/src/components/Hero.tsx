import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export default function Hero() {

  return (
    <section
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
            src={heroBg} 
            alt="Digital Contract Background" 
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-900/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-sm font-medium mb-6 animate-in fade-in zoom-in duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          智能合同管理 2.0 全新上线
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          重塑契约<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">价值</span>
          <br />
          智领合规<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">未来</span>
        </h1>

        <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          ContractFlow集成前沿AI技术，为您提供从起草、审查到归档的全流程智能解决方案。
          让每一次签约都更安全、更高效。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            size="lg"
            className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 shadow-xl transition-all hover:scale-105"
            asChild
          >
            <a href="/app.html">立即开始免费试用</a>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all">
            预约产品演示
          </Button>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-20 pt-10 border-t border-white/10 animate-in fade-in duration-1000 delay-500">
            <p className="text-sm text-blue-200/60 mb-6 uppercase tracking-widest font-semibold">
                Trusted by 500+ Enterprises
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholder Logos */}
                {['Tencent', 'Alibaba', 'ByteDance', 'Huawei', 'Xiaomi'].map((company) => (
                    <span key={company} className="text-xl font-bold text-white">{company}</span>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
