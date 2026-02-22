import { NextResponse } from 'next/server';
import { Panel, Storyboard } from '@/types/storyboard';

// A mock AI integration generating structured prompts based on EVARIS dictionaries.
export async function POST(request: Request) {
    try {
        const { panelId, storyboard }: { panelId: string, storyboard: Storyboard } = await request.json();

        const panel = storyboard.panels.find((p: Panel) => p.id === panelId);
        if (!panel) {
            return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
        }

        // Mock Character Dictionary
        const characterDictionary: Record<string, string> = {
            'Eva': '17歳、ピンクロングストレート、ブルーの瞳、黒ベスト+白Tシャツ',
            'Iris': '25歳、シルバーロングウェーブ、ゴールドの瞳、黒ドレス',
            'Ren': '28歳、黒髪くせ毛ショート、ロイヤルブルーの瞳、グレーパーカー+ヘッドホン',
            'Katsuragi': '45歳、黒髪オールバック+シルバーメッシュ、グレーの鋭い瞳、ダークネイビースーツ+黒タートル'
        };

        // Extract character profiles
        const includedCharacters = panel.characters
            .map((c: string) => `[${c}: ${characterDictionary[c] || '詳細不明'}]`)
            .join('\n');

        // Simple template rendering for MVP
        const prompt = `---
[LoveArt Webtoon Image prompt]
Format: 1枚の縦長画像に4コマを縦1列で描いてください
Style: Korean webtoon style, semi-realistic, extremely detailed shading, dramatic lighting.

[Character Dictionary]
${includedCharacters ? includedCharacters : 'None'}

[Panel Context: ${panel.section}]
Mood: ${panel.mood}

[Scene Description]
${panel.description}

[Director Notes / Output Adjustments]
${panel.loveart_prompt_notes || '特になし'}
---`;

        // In a real application, we might pass this string to an LLM like Gemini or Claude
        // to dynamically rewrite it into an exact StableDiffusion/Midjourney syntax.
        // Here we just return the assembled text for the user to copy.

        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({ prompt });

    } catch (error) {
        console.error('Prompt generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
    }
}
