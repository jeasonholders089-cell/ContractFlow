import { NAV_LINKS } from "@/lib/constants";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src={logo} alt="ContractFlow" className="w-9 h-9 object-contain" />
              <span className="text-xl font-bold tracking-tight">ContractFlow</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              致力为企业提供最安全、最智能的合同全生命周期管理服务，让商业信任更简单。
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer" />
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-6">产品</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">智能撰写</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">智能审查</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">合同归档</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">电子签章</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">资源</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">帮助文档</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">开发者 API</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">博客</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">客户案例</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">联系我们</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>400-888-8888</li>
              <li>support@contract-cloud.com</li>
              <li>北京市朝阳区科技园 A 座 8 层</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 Contract Cloud Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">服务条款</a>
            <a href="#" className="hover:text-white transition-colors">安全白皮书</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
