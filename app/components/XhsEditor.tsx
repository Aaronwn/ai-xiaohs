'use client';

import { useState, useRef, useEffect } from 'react';
import { EditorState, Section, TemplateType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import AIContentEditor from './AIContentEditor';
import MarkdownCard from './MarkdownCard';
import { useAnalytics } from '../hooks/useAnalytics';
import HotPostEditor from './HotPostEditor';
import { showToast } from '@/app/utils/toast';
import ErrorBoundary from './ErrorBoundary';
import CheckText from './CheckText';

import ImageTextEditor from './ImageTextEditor';

const defaultSection: Section = {
  id: uuidv4(),
  title: '',
  content: '',
  imageUrl: '',
};

export type CardType = 'column' | 'text' | 'ai';

const FONT_OPTIONS = {
  中文简约: [
    {
      label: '思源黑体',
      value: '"Source Han Sans SC", "Noto Sans SC", sans-serif',
    },
    {
      label: '思源宋体',
      value: '"Source Han Serif SC", "Noto Serif SC", serif',
    },
    { label: '阿里巴巴普惠体', value: '"Alibaba PuHuiTi", sans-serif' },
    { label: '霞鹜楷', value: '"LXGW WenKai", serif' },
    { label: '楷体', value: 'KaiTi, STKaiti, serif' },
  ],
  手写风格: [
    { label: '手写体', value: '"Ma Shan Zheng", cursive' },
    { label: '潇洒体', value: '"Liu Jian Mao Cao", cursive' },
    { label: '有爱体', value: '"Zhi Mang Xing", cursive' },
    { label: 'Caveat', value: '"Caveat", cursive' },
    { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  ],
};

// 添加新的样式常量
const GRADIENT_TEXT = `
  bg-clip-text text-transparent
  bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500
`;

const XhsEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    template: 'ai',
    title: '',
    font: '思源黑体',
    fontSize: '16px',
    backgroundColor: {
      // from: '#a6c1ee',
      // to: '#fbc2eb',
      from: '#fbc2eb',
      to: '#a6c1ee',
    },
    sections: [{ ...defaultSection }],
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const contentEditRef = useRef<HTMLDivElement>(null);
  const checkTextRef = useRef({ check: (val: string) => {} });

  const { trackEvent } = useAnalytics();

  // 在组件加载时记录页面访问
  useEffect(() => {
    trackEvent('page_view', {
      page: 'editor',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleTemplateChange = (template: TemplateType) => {
    setEditorState(prev => ({
      ...prev,
      template,
      sections: [{ ...defaultSection }],
    }));

    // 记录模板切换事件
    trackEvent('change_template', {
      template_type: template,
      timestamp: new Date().toISOString(),
    });
  };

  const handleAddSection = () => {
    setEditorState(prev => ({
      ...prev,
      sections: [...prev.sections, { ...defaultSection, id: uuidv4() }],
    }));

    setTimeout(() => {
      if (contentEditRef.current) {
        const newSectionElement = contentEditRef.current.lastElementChild;
        if (newSectionElement) {
          newSectionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }, 100);
  };

  const handleRemoveSection = (id: string) => {
    setEditorState(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id),
    }));
  };

  // 添加检测设备类型的辅助函数
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // 修改下载函数
  const handleDownload = async (format: 'png' | 'jpg' | 'jpeg') => {
    if (!cardRef.current) return;

    try {
      const previewElement = cardRef.current;
      const { width } = previewElement.getBoundingClientRect();

      // 1. 创建临时容器
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      // 2. 克隆卡片元素
      const original = document.querySelector('[data-card]');
      if (!original) return;

      const clone = original.cloneNode(true) as HTMLElement;

      // 移除所有不需要导出的元素
      const excludeElements = clone.querySelectorAll('[data-exclude-export]');
      excludeElements.forEach(el => el.remove());

      // 3. 创建临时容器
      tempContainer.appendChild(clone);

      // 4. 设置基础样式
      clone.style.width = `${width}px`;
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.transform = 'none';
      clone.style.position = 'static';
      clone.style.background = `linear-gradient(135deg, ${editorState.backgroundColor.from}, ${editorState.backgroundColor.to})`;

      // 5. 处理内容样式
      const contentCards = clone.querySelectorAll('.bg-white\\/60');
      contentCards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          card.style.backdropFilter = 'blur(8px)';
          card.style.borderRadius = '0.5rem';
          card.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }
      });

      // 6. 处理文本样式
      const textElements = clone.querySelectorAll('h1, h2, h3, p, li');
      textElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.fontFamily = getFontStyle(editorState.font).fontFamily;
          element.style.fontSize = editorState.fontSize;
          element.style.lineHeight = '1.6';
        }
      });

      // 特别处理有序列表
      const orderedLists = clone.querySelectorAll('ol');
      orderedLists.forEach(list => {
        if (list instanceof HTMLElement) {
          list.style.listStyle = 'decimal';
          list.style.paddingLeft = '0';
          list.style.margin = '0';

          // 处理列表项
          const items = list.querySelectorAll('li');
          items.forEach((item, index) => {
            if (item instanceof HTMLElement) {
              // 设置列表项样式
              item.style.display = 'block';
              item.style.position = 'relative';
              item.style.paddingLeft = '2em';
              item.style.marginBottom = '0.75em';

              // 创建序号元素
              const number = document.createElement('span');
              number.textContent = `${index + 1}.`;
              number.style.position = 'absolute';
              number.style.left = '0';
              number.style.top = '0';
              number.style.fontFamily = getFontStyle(
                editorState.font
              ).fontFamily;
              number.style.fontSize = editorState.fontSize;
              number.style.lineHeight = '1.6';
              number.style.minWidth = '1.5em';

              // 插入序号到列表项开头
              item.insertBefore(number, item.firstChild);
            }
          });
        }
      });

      // 特别处理无序列表
      const unorderedLists = clone.querySelectorAll('ul');
      unorderedLists.forEach(list => {
        if (list instanceof HTMLElement) {
          list.style.listStyle = 'none';
          list.style.paddingLeft = '0';
          list.style.margin = '0';

          // 处理列表项
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            if (item instanceof HTMLElement) {
              // 设置列表项样式
              item.style.display = 'block';
              item.style.position = 'relative';
              item.style.paddingLeft = '2em';
              item.style.marginBottom = '0.75em';

              // 创建圆点元素
              const bullet = document.createElement('span');
              bullet.textContent = '•';
              bullet.style.position = 'absolute';
              bullet.style.left = '0.5em';
              bullet.style.top = '0';
              bullet.style.fontFamily = getFontStyle(
                editorState.font
              ).fontFamily;
              bullet.style.fontSize = editorState.fontSize;
              bullet.style.lineHeight = '1.6';

              // 插入圆点到列表项开头
              item.insertBefore(bullet, item.firstChild);
            }
          });
        }
      });

      // 6. 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 200));

      // 7. 设置导出尺寸
      const contentHeight = clone.scrollHeight;
      const minHeight = (width * 4) / 3;
      const exportHeight = Math.max(contentHeight, minHeight);
      clone.style.height = `${exportHeight}px`;

      // 8. 生成图片
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor:
          format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
        logging: false,
        width,
        height: exportHeight,
        windowWidth: width,
        windowHeight: exportHeight,
        useCORS: true,
        allowTaint: true,
        onclone: clonedDoc => {
          const clonedElement = clonedDoc.querySelector('[data-card]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.width = `${width}px`;
            clonedElement.style.height = `${exportHeight}px`;
            clonedElement.style.overflow = 'visible';
          }
        },
      });

      // 获取图片的 base64 数据
      const imageData = canvas.toDataURL(`image/${format}`, 1.0);

      if (isMobile()) {
        try {
          // 尝试使用 Web Share API
          const blob = await (await fetch(imageData)).blob();
          const file = new File([blob], `小红书卡片_${Date.now()}.${format}`, {
            type: `image/${format}`,
          });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: '保存小红书卡片',
            });
          } else {
            // 回退方案：创建临时 a 标签并触发点击
            const a = document.createElement('a');
            a.href = imageData;
            a.download = `小红书卡片_${Date.now()}.${format}`;

            // 添加样式使其覆盖整个屏幕
            a.style.position = 'fixed';
            a.style.top = '0';
            a.style.left = '0';
            a.style.width = '100%';
            a.style.height = '100%';
            a.style.zIndex = '9999';
            a.style.backgroundColor = 'rgba(0,0,0,0.8)';
            a.style.display = 'flex';
            a.style.alignItems = 'center';
            a.style.justifyContent = 'center';
            a.style.flexDirection = 'column';

            // 创建图片预览
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '90%';
            img.style.maxHeight = '70vh';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '12px';
            a.appendChild(img);

            // 添加提示文本
            const text = document.createElement('p');
            text.textContent = '长按图片保存到相册';
            text.style.color = 'white';
            text.style.marginTop = '20px';
            text.style.fontSize = '16px';
            a.appendChild(text);

            // 添加关闭按钮
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '关闭';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '20px';
            closeBtn.style.right = '20px';
            closeBtn.style.padding = '8px 16px';
            closeBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.color = 'white';
            closeBtn.style.fontSize = '14px';
            closeBtn.onclick = e => {
              e.preventDefault();
              document.body.removeChild(a);
            };
            a.appendChild(closeBtn);

            document.body.appendChild(a);
          }
        } catch (error) {
          console.error('Mobile save failed:', error);
          showToast('保存失败，请重试', 'error');
        }
      } else {
        // 桌面端直接下载
        const link = document.createElement('a');
        link.download = `小红书卡片_${Date.now()}.${format}`;
        link.href = imageData;
        link.click();
        showToast('下载成功');
      }
      // 删除临时容器
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('下载失败:', error);
      showToast('下载失败，请重试', 'error');
    }
  };

  // 辅助函数：获取字体样式
  const getFontStyle = (font: string) => {
    return {
      fontFamily: font, // 直接使用字体值，因为现在我们存储的就是完整的 font-family 字符串
    };
  };

  // 在样式改变时记录
  const handleStyleChange = (
    type: 'font' | 'fontSize' | 'backgroundColor',
    value: string | { from: string; to: string }
  ) => {
    setEditorState(prev => ({ ...prev, [type]: value }));

    trackEvent('change_style', {
      style_type: type,
      style_value:
        typeof value === 'string' ? value : `${value.from}-${value.to}`,
      timestamp: new Date().toISOString(),
    });
  };

  // 在 XhsEditor 组件中添加新的处理函数
  const handleTitleChange = (value: string) => {
    setEditorState(prev => ({ ...prev, title: value }));
  };

  // 在 XhsEditor 组件中添加处理函数
  const handleCardContentChange = (content: string) => {
    const newSections = [
      {
        ...defaultSection,
        id: editorState.sections[0]?.id || uuidv4(),
        content: content,
      },
    ];
    setEditorState(prev => ({ ...prev, sections: newSections }));
  };

  const handleCardTitleChange = (title: string) => {
    setEditorState(prev => ({ ...prev, title }));
  };

  // 添加一个辅助函数来转换 Markdown 为纯文本
  const convertMarkdownToPlainText = (markdown: string): string => {
    let text = markdown;

    // 处理标题
    text = text.replace(/^#\s+(.*)$/m, '$1\n');
    text = text.replace(/^##\s+(.*)$/gm, '$1\n');
    text = text.replace(/^###\s+(.*)$/gm, '$1\n');

    // 处理列表
    text = text.replace(/^\d+\.\s+(.*)$/gm, '$1'); // 有序列表
    text = text.replace(/^[-*]\s+(.*)$/gm, '$1'); // 无序列表

    // 处理强调语法
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // 粗体
    text = text.replace(/__(.*?)__/g, '$1'); // 粗体替代语法
    text = text.replace(/\*(.*?)\*/g, '$1'); // 斜体
    text = text.replace(/_(.*?)_/g, '$1'); // 斜体替代语法

    // 处理链接和图片
    text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // 图片
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // 链接

    // 处理代码块和行内代码
    text = text.replace(/```[\s\S]*?```/g, ''); // 代码块
    text = text.replace(/`([^`]+)`/g, '$1'); // 行内代码

    // 处理引用
    text = text.replace(/^>\s*(.*?)$/gm, '$1');

    // 处理水平线
    text = text.replace(/^[-*_]{3,}$/gm, '\n');

    // 处理多余的空行
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  };

  // 确保正确传递 onContentGenerated
  const handleContentGenerated = (content: string, done: boolean) => {
    // 更新状态
    const newSections = [
      {
        ...defaultSection,
        id: editorState.sections[0]?.id || uuidv4(),
        content: content,
      },
    ];
    // console.log('Updating sections with:', newSections);
    setEditorState(prev => {
      const newState = { ...prev, sections: newSections };
      // console.log('New editor state:', newState);
      return newState;
    });

    if (done) {
      checkTextRef.current?.check(content);
    }
  };

  // 图文编辑专用的下载函数
  const handleImageDownload = async (format: 'png' | 'jpg' | 'jpeg') => {
    if (!cardRef.current) {
      showToast('预览区域未准备好，请重试', 'error');
      return;
    }

    try {
      const previewElement = cardRef.current;
      const { width } = previewElement.getBoundingClientRect();

      // 创建临时容器
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      try {
        // 克隆预览元素
        const clone = previewElement.cloneNode(true) as HTMLElement;
        tempContainer.appendChild(clone);

        // 设置导出尺寸和样式
        clone.style.width = `${width}px`;
        clone.style.height = '512px';
        clone.style.background = `linear-gradient(135deg, ${editorState.backgroundColor.from}, ${editorState.backgroundColor.to})`;

        // 等待样式应用
        await new Promise(resolve => setTimeout(resolve, 100));

        // 生成图片
        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor:
            format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
          logging: true, // 开启日志以便调试
          width,
          height: 512,
          useCORS: true,
          allowTaint: true,
        });

        if (!canvas) {
          throw new Error('Failed to generate canvas');
        }

        // 获取图片数据
        const imageData = canvas.toDataURL(`image/${format}`, 1.0);

        if (isMobile()) {
          try {
            // 尝试使用 Web Share API
            const blob = await (await fetch(imageData)).blob();
            if (!blob) {
              throw new Error('Failed to create blob from image data');
            }

            const file = new File(
              [blob],
              `小红书图片_${Date.now()}.${format}`,
              { type: `image/${format}` }
            );

            if (navigator.share && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: '保存图片',
              });
              showToast('分享成功');
            } else {
              // 回退方案
              const a = document.createElement('a');
              a.href = imageData;
              a.download = `小红书图片_${Date.now()}.${format}`;

              // 设置样式和添加元素
              Object.assign(a.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '9999',
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              });

              const img = document.createElement('img');
              Object.assign(img.style, {
                maxWidth: '90%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '12px',
              });
              img.src = imageData;
              a.appendChild(img);

              const text = document.createElement('p');
              Object.assign(text.style, {
                color: 'white',
                marginTop: '20px',
                fontSize: '16px',
              });
              text.textContent = '长按图片保存到相册';
              a.appendChild(text);

              const closeBtn = document.createElement('button');
              Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
              });
              closeBtn.textContent = '关闭';
              closeBtn.onclick = e => {
                e.preventDefault();
                document.body.removeChild(a);
              };
              a.appendChild(closeBtn);

              document.body.appendChild(a);
            }
          } catch (error) {
            console.error('Mobile save failed:', error);
            showToast('保存失败，请重试', 'error');
          }
        } else {
          // 桌面端下载
          const link = document.createElement('a');
          link.download = `小红书图片_${Date.now()}.${format}`;
          link.href = imageData;
          link.click();
          showToast('下载成功');
        }
      } finally {
        // 确保清理临时容器
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      }
    } catch (error) {
      console.error('图片生成失败:', error);
      showToast('图片生成失败，请重试', 'error');
    }
  };

  return (
    <ErrorBoundary>
      <div className='min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* 标题区域 - 优化居中效果 */}
          <header className='mb-12 mt-8 text-center'>
            {/* 主标题 - 优化布局和间距 */}
            <h1 className='flex flex-col items-center justify-center mb-4'>
              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3'>
                <span className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
                  小红书图文生成器
                </span>
                <span
                  className={`text-xl sm:text-2xl font-bold ${GRADIENT_TEXT}`}
                >
                  让创作自由起飞
                </span>
              </div>
            </h1>

            {/* 副标题 - 优化布局和间距 */}
            <div className='flex items-center justify-center'>
              <div className='flex items-center flex-wrap justify-center gap-3'>
                <div className='flex items-center'>
                  <span className='font-medium text-gray-900'>AI智能创作</span>
                  <svg
                    className='w-4 h-4 text-rose-500 ml-1.5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                  </svg>
                </div>
                <div className='flex items-center'>
                  <span className='font-medium text-gray-900'>一键排版</span>
                  <svg
                    className='w-4 h-4 text-rose-500 ml-1.5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                  </svg>
                </div>
                <div className='flex items-center'>
                  <span className='font-medium text-gray-900'>即时导出</span>
                  <svg
                    className='w-4 h-4 text-rose-500 ml-1.5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                  </svg>
                </div>
              </div>
            </div>
          </header>

          {/* 主编辑区域 - 优化移动端布局 */}
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6'>
            {/* 左侧编辑区 */}
            <div className='lg:col-span-3 space-y-4'>
              {/* 模板选择 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100'>
                <div className='p-3'>
                  <div className='inline-flex p-0.5 bg-gray-100/80 rounded-lg'>
                    <button
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        editorState.template === 'ai'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => handleTemplateChange('ai')}
                    >
                      灵感创作
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        editorState.template === 'hot_post'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => handleTemplateChange('hot_post')}
                    >
                      爆款仿写
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        editorState.template === 'image_text'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => handleTemplateChange('image_text')}
                    >
                      文字配图
                    </button>
                  </div>
                </div>
              </div>

              {/* 样式设置区 - 优化移动端布局 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-3'>
                <div className='flex flex-col sm:grid sm:grid-cols-12 gap-3'>
                  {/* 字体和字号选择器在移动端并排显示 */}
                  {['ai', 'hot_post'].includes(editorState.template) && (
                    <div className='flex gap-2 sm:contents'>
                      {/* 字体选择 - 移动端占据更多空间 */}
                      <div className='flex-1 sm:col-span-4'>
                        <select
                          value={editorState.font}
                          onChange={e =>
                            handleStyleChange('font', e.target.value)
                          }
                          className='w-full px-2.5 py-2 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                        >
                          {Object.entries(FONT_OPTIONS).map(
                            ([category, fonts]) => (
                              <optgroup key={category} label={category}>
                                {fonts.map(font => (
                                  <option key={font.label} value={font.value}>
                                    {font.label}
                                  </option>
                                ))}
                              </optgroup>
                            )
                          )}
                        </select>
                      </div>

                      {/* 字号选择 - 移动端保持合适比例 */}
                      <div className='w-24 sm:col-span-2'>
                        <select
                          value={editorState.fontSize}
                          onChange={e =>
                            handleStyleChange('fontSize', e.target.value)
                          }
                          className='w-full px-2.5 py-2 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                        >
                          <option value='14px'>14px</option>
                          <option value='15px'>15px</option>
                          <option value='16px'>16px</option>
                          <option value='18px'>18px</option>
                          <option value='20px'>20px</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 背景色选择 - 移动端优化 */}
                  <div className='sm:col-span-6 mt-2 sm:mt-0'>
                    {/* 添加背景色标签 */}
                    <div className='text-xs text-gray-500 mb-2 sm:hidden'>
                      背景色
                    </div>
                    {/* 改用网格布局展示颜色选项 */}
                    <div className='grid grid-cols-6 sm:flex sm:items-center gap-2 sm:gap-1'>
                      {[
                        {
                          from: '#fbc2eb',
                          to: '#a6c1ee',
                          name: '浪漫粉',
                        },
                        {
                          from: '#84fab0',
                          to: '#8fd3f4',
                          name: '清新绿',
                        },
                        {
                          from: '#a1c4fd',
                          to: '#c2e9fb',
                          name: '天空蓝',
                        },
                        {
                          from: '#ffecd2',
                          to: '#fcb69f',
                          name: '暖阳橙',
                        },
                        {
                          from: '#ff9a9e',
                          to: '#fecfef',
                          name: '樱花粉',
                        },
                        {
                          from: '#96fbc4',
                          to: '#f9f586',
                          name: '森林绿',
                        },

                        {
                          from: '#FFD1FF',
                          to: '#FAD0C4',
                          name: '蜜桃粉', // 柔和的粉色渐变
                        },
                        {
                          from: '#A8EDEA',
                          to: '#FED6E3',
                          name: '薄荷粉', // 清新的薄荷绿到粉色
                        },
                        {
                          from: '#B2EBF2',
                          to: '#80DEEA',
                          name: '浅碧蓝', // 清透的浅蓝色
                        },
                        {
                          from: '#DCEDC8',
                          to: '#F1F8E9',
                          name: '抹茶拿铁', // 淡淡的抹茶绿
                        },
                      ].map(({ from, to, name }) => (
                        <button
                          key={`${from}-${to}`}
                          className={`group relative w-8 h-8 sm:w-6 sm:h-6 rounded-full transition-all duration-200 ${
                            editorState.backgroundColor.from === from &&
                            editorState.backgroundColor.to === to
                              ? 'ring-2 ring-offset-1 ring-blue-500/30 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${from}, ${to})`,
                          }}
                          onClick={() =>
                            handleStyleChange('backgroundColor', { from, to })
                          }
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 内容编辑区 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-4'>
                {['ai', 'hot_post'].includes(editorState.template) && (
                  <input
                    type='text'
                    value={editorState.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder='输入标题'
                    className='w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
                           text-lg mb-4'
                  />
                )}

                {editorState.template === 'ai' && (
                  <AIContentEditor
                    title={editorState.title}
                    onContentGenerated={handleContentGenerated}
                  />
                )}
                {editorState.template === 'hot_post' && (
                  <HotPostEditor
                    onContentGenerated={content => {
                      const newSections = [
                        {
                          ...defaultSection,
                          id: editorState.sections[0]?.id || uuidv4(),
                          content: content,
                        },
                      ];
                      setEditorState(prev => ({
                        ...prev,
                        sections: newSections,
                      }));
                    }}
                  />
                )}
                {editorState.template === 'image_text' && (
                  <ImageTextEditor
                    onImageGenerated={imageUrl => {
                      setEditorState(prev => ({
                        ...prev,
                        sections: [
                          {
                            ...prev.sections[0],
                            id: prev.sections[0]?.id || uuidv4(),
                            imageUrl,
                          },
                        ],
                      }));
                    }}
                  />
                )}
              </div>
            </div>

            {/* 右侧预览区 - 优化高度 */}
            <div className='lg:col-span-2'>
              {/* 调整最外层容器高度，移除固定最小高度 */}
              <div className='top-6'>
                {/* 预览卡片容器 - 调整高度和布局 */}
                <div
                  className='bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80 p-4
                               flex flex-col'
                >
                  {/* 预览标题 */}
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-medium text-gray-600'>
                      预览效果
                    </span>
                    <div className='flex gap-1'>
                      <div className='w-2.5 h-2.5 rounded-full bg-rose-400' />
                      <div className='w-2.5 h-2.5 rounded-full bg-yellow-400' />
                      <div className='w-2.5 h-2.5 rounded-full bg-green-400' />
                    </div>
                  </div>

                  {/* 卡片内容 - 整高度和布局 */}
                  <div className='flex justify-center items-start'>
                    <div
                      className='w-full max-w-[360px] sm:w-[360px] relative rounded-lg overflow-hidden
                                  bg-gradient-to-b from-gray-50/50 to-white/50'
                    >
                      {editorState.template === 'image_text' ? (
                        // 文字配图预览
                        <div
                          ref={cardRef}
                          data-card
                          className='relative w-full h-[512px] rounded-lg overflow-hidden'
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${editorState.backgroundColor.from}, ${editorState.backgroundColor.to})`,
                          }}
                        >
                          {/* 图片容器 */}
                          {editorState.sections[0]?.imageUrl ? (
                            <div className='h-full p-4'>
                              <div className='h-full w-full relative rounded-lg overflow-hidden'>
                                <img
                                  src={editorState.sections[0].imageUrl}
                                  alt='Preview content'
                                  className='w-full h-full object-cover'
                                  loading='lazy'
                                />
                              </div>
                            </div>
                          ) : (
                            // 无图片时的提示 - 统一样式
                            <div className='h-full flex flex-col items-center justify-center p-4 text-center'>
                              <div className='w-16 h-16 mb-4 text-gray-300'>
                                <svg
                                  className='w-full h-full'
                                  fill='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z' />
                                </svg>
                              </div>
                              <p className='text-gray-500 text-sm'>
                                请输入关键词生成图片
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // 原有的 MarkdownCard 预览
                        <MarkdownCard
                          ref={cardRef}
                          title={editorState.title}
                          content={editorState.sections[0]?.content || ''}
                          font={getFontStyle(editorState.font).fontFamily}
                          fontSize={editorState.fontSize}
                          backgroundColor={editorState.backgroundColor}
                          onContentChange={handleCardContentChange}
                          onTitleChange={handleCardTitleChange}
                        />
                      )}
                    </div>
                  </div>

                  {/* 操作按钮组 */}
                  <div className='pt-4 px-2 sm:px-4 flex gap-2 sm:gap-3'>
                    {/* 复制文本按钮 - 仅在非文字配图模式显示 */}
                    {editorState.template !== 'image_text' && (
                      <button
                        onClick={async () => {
                          const content =
                            editorState.sections[0]?.content || '';
                          if (!content.trim()) {
                            showToast('暂无内容可复制', 'error');
                            return;
                          }

                          try {
                            const plainText =
                              convertMarkdownToPlainText(content);
                            await navigator.clipboard.writeText(plainText);
                            showToast('已复制到剪贴板');
                          } catch (err) {
                            console.error('Failed to copy:', err);
                            showToast('复制失败，请重试', 'error');
                          }
                        }}
                        className='flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100
                                 rounded-lg transition-all duration-200
                                 text-sm font-medium text-gray-700
                                 flex items-center justify-center gap-2'
                      >
                        <svg
                          className='w-4 h-4 text-gray-600'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <rect
                            x='9'
                            y='9'
                            width='13'
                            height='13'
                            rx='2'
                            ry='2'
                          ></rect>
                          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                        </svg>
                        <span>复制文本</span>
                      </button>
                    )}

                    {/* 下载按钮 - 区分不同模板的下载逻辑 */}
                    <button
                      onClick={() => {
                        if (editorState.template === 'image_text') {
                          // 文字配图模式
                          if (!editorState.sections[0]?.imageUrl) {
                            showToast('暂无图片可下载', 'error');
                            return;
                          }
                          handleImageDownload('png');
                        } else {
                          // 其他模式
                          const content =
                            editorState.sections[0]?.content || '';
                          if (!content.trim()) {
                            showToast('暂无内容可下载', 'error');
                            return;
                          }
                          handleDownload('png');
                        }
                      }}
                      className='flex-1 px-4 py-2.5
                               bg-gradient-to-r from-blue-500 to-purple-500
                               hover:from-blue-600 hover:to-purple-600
                               text-white rounded-lg transition-all duration-200
                               text-sm font-medium
                               flex items-center justify-center gap-2'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                        />
                      </svg>
                      <span>下载图片</span>
                    </button>
                  </div>

                  <CheckText ref={checkTextRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default XhsEditor;
