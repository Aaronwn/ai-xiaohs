import { useState } from 'react';

interface ImageTextEditorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function ImageTextEditor({ onImageGenerated }: ImageTextEditorProps) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateImage = async () => {
    if (!keyword.trim()) {
      setError('请输入关键词');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate/image-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      onImageGenerated(data.url);
    } catch (err) {
      setError('生成图片失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入关键词生成图片"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <button
        onClick={handleGenerateImage}
        disabled={isLoading}
        className={`w-full px-4 py-2 text-white bg-[#D97757] rounded-lg
                   font-medium transition-all hover:bg-[#C4623F]
                   disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? '生成中...' : '生成图片'}
      </button>
    </div>
  );
}
