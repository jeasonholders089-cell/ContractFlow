import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            全流程智能化驱动
          </h2>
          <p className="text-muted-foreground text-lg">
            打通合同管理的每一个环节，让数据流动创造价值
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div 
                key={feature.id}
                className="group relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 overflow-hidden"
            >
              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-blue-50/50 group-hover:bg-blue-100/50 transition-colors">
                  <img 
                    src={feature.icon} 
                    alt={feature.title} 
                    className="w-16 h-16 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
