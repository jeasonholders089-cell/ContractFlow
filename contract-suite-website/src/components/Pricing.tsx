import { PRICING_PLANS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* CSS Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
        }}
      />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            灵活的方案，透明的价格
          </h2>
          <p className="text-muted-foreground text-lg">
            选择最适合您团队规模的方案，随时升级，无隐形费用
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-3xl p-8 bg-white border shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-2",
                plan.popular 
                    ? "border-blue-500 shadow-blue-200 shadow-xl scale-105 z-10" 
                    : "border-border hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                  最受欢迎
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? "default" : "outline"}
                className={cn(
                    "w-full rounded-xl py-6 text-base font-semibold",
                    plan.popular ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-200" : ""
                )}
              >
                {plan.price === "定制" ? "联系销售" : "立即购买"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
