import {
  CHECK_51_API,
  CHECK_51_APPID,
  CHECK_51_SECRET_KEY,
} from '@/app/constants/env';
import { stringToUnicode } from '@/app/utils/format';

export const runtime = 'edge';

export async function POST(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (!CHECK_51_APPID || !CHECK_51_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: 'Check params is not configured' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Invalid text' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const formData = new FormData();
    formData.set('appid', CHECK_51_APPID);
    formData.set('secretKey', CHECK_51_SECRET_KEY);
    formData.set('content', stringToUnicode(text));
    formData.set('platformId', '10'); // 渠道：小红书

    const response = await fetch(CHECK_51_API, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Check text error:', response.status, errorText);
      throw new Error(`Check text error: ${response.status} - ${errorText}`);
    }

    const resJson = await response.text();

    return new Response(resJson, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Edge] Generation error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown type',
    });
    return new Response(
      JSON.stringify({
        error: '检测失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
