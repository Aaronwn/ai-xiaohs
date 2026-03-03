'use client';

import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* 左侧品牌区域 */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/favicon.ico" alt="Logo" width={20} height={20} className="w-5 h-5" />
              <span className="text-base font-medium text-gray-800">
                文灵AI
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              基于AI技术的小红书图文创作助手，让创作更轻松，让文案更出彩。
            </p>
          </div>

          {/* 右侧导航区域 */}
          <div className="flex flex-wrap gap-12">
            {/* 快速链接 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">快速链接</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    功能介绍
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    使用说明
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    价格方案
                  </button>
                </li>
              </ul>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">联系我们</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@xhscard.top"
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    support@xhscard.top
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xhscard.top"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    www.xhscard.top
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-center text-gray-400">
            © {currentYear} 文灵AI. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
}