import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/app/constants/env';

export const runtime = 'edge';

export async function POST(req: Request) {
  if (!DEEPSEEK_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'API key is not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { originalText, title, keywords, style, additionalInfo } =
      await req.json();

    if (!originalText || !title || !keywords) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 保持原有的消息结构
    const messages = [
      {
        role: 'system',
        content: `你是一位擅长模仿和创新的小红书内容创作专家。你的任务是基于用户提供的爆款笔记，结合用户指定的主题和风格，创作一篇全新的笔记。总字数严格控制在200字以内。

创作原则：
- 保留爆款笔记的核心吸引力要素和写作技巧
- 完全围绕新主题展开，避免复制原内容
- 融入用户提供的关键词和风格特点和补充信息
- 确保内容原创性和真实感

创作规范：
1. 标题（16字内）：
   - 必须体现用户的主题和关键词
   - 1-2个emoji，放在开头或结尾
   - 运用以下标题技巧：
     * 设悬念："偶然发现..."
     * 强调价值："一招解决..."
     * 分享体验："学会这招..."
     * 情感共鸣："再也不怕..."

2. 正文结构：
   - 开篇（40字内）：快速点题，建立共鸣
   - 核心内容（120字内）：
     * 2-3个重点，每段用温和emoji(🔍💡✨📌💫🌟💎🎯⭐️🔆)开头
     * 每个重点必须体现用户的关键词
     * 按用户指定的风格展开
   - 结尾（20字内）：总结或互动引导

表达要求：
- 模仿爆款笔记的节奏和语气
- 融入用户指定的写作风格
- 突出用户提供的关键词
- 保持表达自然真诚
- 内容务必简洁精炼
- 确保可读性和实用性`,
      },
      {
        role: 'user',
        content: `参考素材：
爆款笔记：${originalText}

创作要求：
主题：${title}
关键词：${keywords}
写作风格：${style}
${additionalInfo ? `补充信息：${additionalInfo}` : ''}

注意事项：
1. 直接输出内容，不要包含任何标记文字
2. 突出核心关键词
3. 内容精炼有价值
5. 总字数限200字内`,
      },
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.75,
        max_tokens: 3000,
        stream: true,
        presence_penalty: 0.4,
        frequency_penalty: 0.4,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    const transformStream = new TransformStream({
      start(controller) {
        (this as any).buffer = '';
        (this as any).processLine = (line: string) => {
          if (line.trim() === '') return;
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') {
              controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    content,
                    done: false,
                    isPartial: true,
                  })}\n\n`
                );
              }
            } catch (e) {
              console.error('Parse error:', e, 'Line:', line);
            }
          }
        };
      },

      transform(chunk, controller) {
        try {
          // console.log('[Edge] Processing chunk:', new Date().toISOString(), 'Size:', chunk.length);
          const text = new TextDecoder().decode(chunk);
          // console.log('Raw chunk:', text);

          (this as any).buffer += text;
          const lines = (this as any).buffer.split('\n');
          (this as any).buffer = lines.pop() || '';

          for (const line of lines) {
            (this as any).processLine(line);
          }
        } catch (error) {
          console.error(
            '[Edge] Transform error:',
            error,
            new Date().toISOString()
          );
        }
      },

      flush(controller) {
        if ((this as any).buffer) {
          (this as any).processLine((this as any).buffer);
        }
      },
    });

    const stream = response.body
      ?.pipeThrough(transformStream)
      ?.pipeThrough(new TextEncoderStream());

    if (!stream) {
      throw new Error('Failed to create stream');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({
        error: '生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
