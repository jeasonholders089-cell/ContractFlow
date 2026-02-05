import { useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Solutions from "@/components/Solutions";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface HomeProps {
  targetSection?: string;
}

export default function Home({ targetSection }: HomeProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (targetSection) {
      setTimeout(() => {
        document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [targetSection]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Solutions />
        <Pricing />
        
        {/* Call to Action Section */}
        <section className="py-24 bg-blue-600 text-white text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    准备好升级您的合同管理方式了吗？
                </h2>
                <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">
                    加入超过 10,000 家企业的选择，立即开启智能化合规管理之旅。
                </p>
                <div className="flex justify-center gap-4">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="h-14 px-8 text-lg rounded-full text-blue-600 hover:text-blue-700 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        onClick={() => setLocation('/contract-review')}
                    >
                        免费注册试用
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-white shadow-lg border border-border text-foreground hover:text-primary hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
