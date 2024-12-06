import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { showToast, ToastType } from '@/app/utils/toast';

interface AIContentEditorProps {
  title: string;
  onContentGenerated: (content: string, done: boolean) => void;
}

export default function AIContentEditor({
  title,
  onContentGenerated,
}: AIContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  const generateContent = async () => {
    const startTime = Date.now();
    // console.log('[Client] Generation started:', new Date().toISOString());

    // 输入验证
    if (!title.trim()) {
      showToast('请先输入标题，AI将帮你扩写成爆款笔记', 'info');
      // 让输入框获得焦点
      const titleInput = document.querySelector(
        'input[type="text"][placeholder="输入标题"]'
      ) as HTMLInputElement;
      titleInput?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);
    let accumulatedContent = '';

    // console.log('Starting content generation...');

    try {
      const response = await fetch('/api/generate/ai-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: title,
            },
          ],
        }),
      });

      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();

      // 监控流式响应
      let chunkCount = 0;
      let lastChunkTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // const totalTime = Date.now() - startTime;
          // console.log('[Client] Stream complete:', {
          //   totalTime: `${totalTime}ms`,
          //   chunkCount,
          //   timestamp: new Date().toISOString()
          // });
          break;
        }

        chunkCount++;
        const currentTime = Date.now();
        const timeSinceLastChunk = currentTime - lastChunkTime;

        // 监控块之间的延迟
        if (timeSinceLastChunk > 5000) {
          // 5秒阈值
          console.warn('[Client] Long delay between chunks:', {
            delay: `${timeSinceLastChunk}ms`,
            chunkNumber: chunkCount,
            timestamp: new Date().toISOString(),
          });
        }

        lastChunkTime = currentTime;
        // console.log('[Client] Chunk received:', {
        //   chunkNumber: chunkCount,
        //   chunkSize: value.length,
        //   timeSinceStart: `${currentTime - startTime}ms`,
        //   timestamp: new Date().toISOString()
        // });

        const chunk = decoder.decode(value);
        // console.log('Raw chunk received:', chunk);

        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              // console.log('Parsed data:', data);

              if (data.content && typeof data.content === 'string') {
                accumulatedContent += data.content;
                // console.log('Accumulated content:', accumulatedContent);
                onContentGenerated(accumulatedContent, data.done);
              }

              if (data.done) {
                // console.log('Stream marked as done');
                onContentGenerated(accumulatedContent, true);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Line:', line);
            }
          }
        }
      }

      if (!accumulatedContent.trim()) {
        throw new Error('No content was generated');
      }

      trackEvent('generate_content', {
        status: 'success',
        title,
        contentLength: accumulatedContent.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Client] Generation error:', error);
      showToast(
        error instanceof Error ? error.message : '生成失败，请重试',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* AI内容生成区 */}
      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4'>
        <div className='flex flex-col space-y-3'>
          {/* 功能说明 */}
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 mt-1'>
              <div className='w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center'>
                <svg
                  className='w-5 h-5 text-blue-600'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
                  />
                </svg>
              </div>
            </div>
            <div className='flex-1 text-sm text-gray-600 leading-relaxed'>
              <p>AI将根据你的标题创作一篇吸引眼球、互动性强的小红书笔记。</p>
              <p className='mt-1 text-gray-500'>
                建议输入具体的主题，比如「10分钟快手早餐」「遛娃遇到的神器」等。
              </p>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={generateContent}
            className='w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                      hover:from-blue-600 hover:to-purple-600 text-white rounded-xl
                      transition-all duration-200 flex items-center justify-center
                      gap-2 shadow-sm hover:shadow-md disabled:opacity-50
                      disabled:cursor-not-allowed font-medium'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <span>内容生成中...</span>
              </>
            ) : (
              <>
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
                <span>AI一键创作</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
