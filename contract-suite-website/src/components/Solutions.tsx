import { SOLUTIONS } from "@/lib/constants";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Solutions() {
  return (
    <section id="solutions" className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    专为您的业务场景打造
                </h2>
                <p className="text-muted-foreground text-lg">
                    无论您是法务、销售还是采购，ContractFlow都能无缝融入您的工作流
                </p>
            </div>
            <Button variant="outline" className="group">
                查看更多解决方案 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>

        <div className="space-y-24">
          {SOLUTIONS.map((solution, index) => (
            <div 
                key={index} 
                className={`flex flex-col md:flex-row gap-12 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2 relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-10 group-hover:rotate-6 transition-transform duration-500" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                    <img 
                        src={solution.image} 
                        alt={solution.title} 
                        className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <div className="text-sm font-medium bg-blue-600 px-3 py-1 rounded-full inline-block mb-2">
                            Scenario {index + 1}
                        </div>
                    </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-foreground">
                    {solution.title}
                </h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {solution.description}
                </p>
                <ul className="space-y-4">
                    {solution.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-foreground/80 font-medium">
                                {benefit}
                            </span>
                        </li>
                    ))}
                </ul>
                <Button className="mt-4">
                    了解详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
