'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import Image from 'next/image';

const tiers = [
  {
    name: '体验版',
    id: 'basic',
    price: '¥9.9',
    period: '/月',
    description: '适合个人轻度使用',
    features: ['每月50次AI文案生成', '基础排版功能', '3种精选字体', '5种背景颜色', '标准导出功能'],
    buttonText: '开始体验',
    buttonStyle: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  },
  {
    name: '专业版',
    id: 'pro',
    price: '¥19.9',
    period: '/月',
    description: '适合内容创作者与品牌号',
    features: ['每月200次AI文案生成', '专业排版功能', '全部精选字体', '全部背景颜色', '爆款文案仿写', '优先技术支持'],
    buttonText: '升级专业版',
    buttonStyle: 'bg-[#D97757] text-white hover:bg-[#C4623F]',
    mostPopular: true,
  },
];

export default function PricingSection() {
  const [showPayModal, setShowPayModal] = useState(false);

  return (
    <div id="pricing" className="relative px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-center mb-4">简单灵活的定价</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">选择最适合您的方案，开启AI创作之旅</p>
        </div>
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                tier.mostPopular ? 'bg-gray-50 shadow-md relative' : 'bg-white'
              }`}>
              {tier.mostPopular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#D97757] px-4 py-1 text-sm font-medium text-white">
                  推荐方案
                </span>
              )}
              <h3 className="text-lg font-semibold leading-8 text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">{tier.period}</span>
              </p>
              <button
                onClick={() => setShowPayModal(true)}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold leading-6 shadow-sm transition-all duration-200 ${tier.buttonStyle}`}>
                {tier.buttonText}
              </button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map(feature => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-[#D97757]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 支付二维码弹窗 */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* 标题 */}
            <h3 className="text-xl font-semibold text-center mb-4">微信扫码支付</h3>

            {/* 赞赏码图片 */}
            <div className="relative w-64 h-64 mx-auto">
              <Image src="/wechatpay.jpg" alt="微信赞赏码" fill className="object-contain rounded-lg" />
            </div>

            {/* 提示文字 */}
            <p className="text-gray-600 text-center mt-4 text-sm">用户量激增，费用超预期，期待您的支持与赞赏！</p>
          </div>
        </div>
      )}
    </div>
  );
}
