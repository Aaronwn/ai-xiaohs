import './globals.css';
import type { Metadata } from 'next';
import { AnalyticsWrapper } from './components/analytics';

export const metadata: Metadata = {
  title: '文灵AI - 创新AI驱动写作助手 | 一键生成精美卡片',
  description: '使用文灵AI，快速生成吸引人的内容卡片。支持AI文案创作、精美排版、一键导出。',
  keywords: '文灵AI,小红书文案助手,小红书排版工具,小红书卡片制作,图文排版,AI文案,小红书笔记,爆款文案,小红书ai,ai笔记',
  authors: [{ name: '文灵AI助手' }],
  openGraph: {
    title: '文灵AI - 创新AI驱动写作助手 | 一键生成精美卡片',
    description: '使用文灵AI，快速生成吸引人的内容卡片。支持AI文案创作、精美排版、一键导出。',
    url: '<link rel="canonical" href="https://www.xhscard.top" />',
    siteName: '文灵AI',
    images: [
      {
        url: 'https://www.xhscard.top/og-image.jpg', // 需要添加一张预览图
        width: 1200,
        height: 630,
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // 需要添加Google站长验证码
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="canonical" href="https://www.xhscard.top/" />
        {/* 添加手写风格字体 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Liu+Jian+Mao+Cao&family=Zhi+Mang+Xing&family=Caveat&family=Dancing+Script&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '文灵AI',
              description: '创新的AI驱动写作助手，专为小红书创作者设计，支持AI文案创作、精美排版、一键导出。',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
              },
            }),
          }}
        />
        {/* 添加umami统计 */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="0e6a290d-64cf-4b47-b932-4f7262cc63bb"></script>
      </head>
      <body>
        {children}
        <div id="analytics-container">
          <AnalyticsWrapper />
        </div>
      </body>
    </html>
  );
}
