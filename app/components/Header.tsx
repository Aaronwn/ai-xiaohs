'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShowBackground = window.scrollY > 0;
      setIsScrolled(shouldShowBackground);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 50;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-sm bg-[#FAF9F7]/90 border-b border-gray-100'
          : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧 Logo 区域 */}
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Logo" width={24} height={24} className="w-6 h-6" />
            <span className="text-lg font-medium text-gray-800">
              文灵AI
            </span>
          </div>

          {/* 右侧导航区域 */}
          <nav className="flex items-center gap-3 sm:gap-8">
            {/* 用户案例 */}
            <button
              onClick={() => scrollToSection('user-examples')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              案例
            </button>
            {/* 功能 */}
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              功能
            </button>
            <button
              onClick={() => scrollToSection('guide')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              说明
            </button>
            {/* <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              问答
            </button> */}

            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              价格
            </button>

            {/* 新增联系我们入口 */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowQRCode(true)}
                onMouseLeave={() => setShowQRCode(false)}
                className="px-3 sm:px-4 py-1.5 rounded-full bg-[#D97757]
                         text-white text-xs sm:text-sm font-medium transition-all duration-300
                         hover:bg-[#C4623F] hover:shadow-lg hover:scale-105 active:scale-95">
                联系我
              </button>

              {/* 悬浮二维码 */}
              {showQRCode && (
                <div className="absolute right-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-100">
                  <div className="relative w-32 h-32">
                    <Image src="/wechat.jpg" alt="微信二维码" fill className="object-cover rounded-lg" />
                  </div>
                  <p className="mt-2 text-xs text-center text-gray-500">扫码添加微信</p>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
