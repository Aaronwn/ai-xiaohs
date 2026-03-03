import XhsEditor from './components/XhsEditor';
import { IconBulb, IconShield, IconTool, IconMessage } from './components/Icons';
import Header from './components/Header';
import UserExamples from './components/UserExamples';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#FAF9F7]">
        <Header />

        {/* 编辑器区域 */}
        <div className="relative">
          <XhsEditor />
        </div>

        {/* 用户案例 */}
        <div className="relative py-16 bg-white/60" id="user-examples">
          <h2 className="text-3xl font-bold text-center mb-4">用户案例展示</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            来看看其他用户是如何使用文灵AI制作图文卡片的
          </p>
          <UserExamples />
        </div>

        {/* 功能特点 - 减小上方间距 */}
        <div className="relative px-4 py-16" id="features">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">强大的创作功能</h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              基于先进的 AI 技术，为您提供智能、高效的创作体验
            </p>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <FeatureCard icon={<IconBulb />} title="智能创作" description="基于 AI 模型，快速生成吸引人的文案" />
              <FeatureCard icon={<IconTool />} title="排版优化" description="自动优化文案格式，让内容更有吸引力" />
              <FeatureCard icon={<IconMessage />} title="多场景适用" description="支持多种内容类型，满足不同创作需求" />
              <FeatureCard icon={<IconShield />} title="隐私保护" description="确保您的创作内容安全可靠" />
            </div>
          </div>
        </div>

        {/* 使用说明 - 重新设计 */}
        <div className="relative py-16 bg-white/60" id="guide">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">使用说明</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">两种模式，满足不同创作需求</p>

            {/* 灵感创作模式说明 */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-8 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D97757]"></span>
                灵感创作模式
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <GuideCard
                  number="01"
                  title="输入主题"
                  description="在输入框中填写你想创作的主题，比如'10分钟快手早餐'"
                />
                <GuideCard number="02" title="AI一键创作" description="点击'AI一键创作'按钮，智能生成原创文案内容" />
                <GuideCard number="03" title="编辑完善" description="可以直接修改生成的内容，调整文案细节和排版" />
              </div>
            </div>

            {/* 爆款仿写模式说明 */}
            <div>
              <h3 className="text-xl font-semibold text-center mb-8 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D97757]"></span>
                爆款仿写模式
              </h3>
              <div className="grid md:grid-cols-4 gap-8">
                <GuideCard number="01" title="粘贴参考" description="粘贴优秀的爆款笔记内容" />
                <GuideCard number="02" title="提取关键词" description="输入核心关键词和亮点" />
                <GuideCard number="03" title="智能改写" description="AI 分析并生成原创内容" />
                <GuideCard number="04" title="个性化调整" description="调整文案风格和细节" />
              </div>
            </div>
          </div>
        </div>

        {/* 常见问题 - 减小上方间距 */}
        {/* <div className="relative px-4 py-16" id="faq">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">常见问题</h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">解答您的疑惑，让创作更顺畅</p>

            <div className="max-w-3xl mx-auto space-y-6">
              <FaqItem
                question="如何获得更好的生成效果？"
                answer="提供详细的关键词和具体的场景描述，可以帮助 AI 更好地理解您的需求，生成更符合预期的内容。"
              />
              <FaqItem
                question="生成的内容是否可以商用？"
                answer="生成的内容您可以自由使用，建议在使用前稍作修改，使内容更符合个人风格。"
              />
              <FaqItem
                question="遇到生成失败怎么办？"
                answer="可以尝试重新生成，或者调整关键词后再次尝试。如果问题持续，请联系我们的支持团队。"
              />
            </div>
          </div>
        </div> */}

        {/* 添加价格模块 */}
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}

// 更新 FeatureCard 组件样式
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm
                    hover:shadow-md hover:bg-white/80 transition-all duration-300
                    border border-gray-100">
      <div
        className="w-12 h-12 mx-auto mb-5 text-[#D97757]
                      transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2.5 text-center">{title}</h3>
      <p className="text-gray-600 text-center text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// 新的使用说明卡片组件
function GuideCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div
      className="group p-6 bg-white/60 backdrop-blur-sm rounded-xl
                    hover:shadow-md transition-all duration-300
                    border border-gray-100/50">
      <div className="flex items-center gap-4 mb-4">
        <span
          className="text-2xl font-bold text-[#D97757]">
          {number}
        </span>
        <div className="h-px flex-1 bg-[#E8DDD5]"></div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// FAQ 问题组件
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm
                    hover:shadow-md hover:bg-white/80 transition-all duration-300
                    border border-gray-100">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">{question}</h3>
      <p className="text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}
