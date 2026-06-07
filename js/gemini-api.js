/* ===================================
   Gemini API Integration
   =================================== */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Gemini APIクライアント
class GeminiClient {
    constructor() {
        this.apiKey = null;
        this.model = 'gemini-pro';
    }

    // APIキーを設定
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // APIキーを取得
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = ApiKey.get();
        }
        return this.apiKey;
    }

    // APIキーの検証
    validateApiKey() {
        const key = this.getApiKey();
        if (!key) {
            showError('Gemini APIキーが設定されていません。設定画面から登録してください。');
            openModal('settingsModal');
            return false;
        }
        return true;
    }

    // コンテンツを生成
    async generateContent(prompt) {
        if (!this.validateApiKey()) {
            return null;
        }

        try {
            console.log('Sending request to Gemini API...');
            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.getApiKey()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        stopSequences: []
                    }
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const error = await response.json();
                console.error('API error response:', error);
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            console.log('Full API response:', data);
            
            // レスポンスの詳細をログ
            if (data.candidates && data.candidates.length > 0) {
                console.log('Candidate count:', data.candidates.length);
                console.log('Finish reason:', data.candidates[0].finishReason);
                console.log('Safety ratings:', data.candidates[0].safetyRatings);
            }
            
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
                console.error('No text in response. Full data:', data);
                throw new Error('No response from API');
            }

            console.log('Extracted text length:', text.length);
            return text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            showError(`API エラー: ${error.message}`);
            return null;
        }
    }

    // JSON形式のレスポンスをパース
    parseJsonResponse(text) {
        console.log('=== Gemini API Response Debug ===');
        console.log('Raw response:', text);
        console.log('Response length:', text.length);
        
        try {
            // マークダウンのコードブロックを削除
            let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            // JSONブロックを抽出（最初の{から最後の}まで）
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }
            
            console.log('Cleaned response:', cleaned);
            
            // 制御文字を削除
            cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            
            const parsed = JSON.parse(cleaned);
            console.log('Parsed successfully:', parsed);
            console.log('================================');
            return parsed;
        } catch (error) {
            console.error('JSON parse error:', error);
            console.error('Failed to parse text (first 500 chars):', text.substring(0, 500));
            console.error('Failed to parse text (last 500 chars):', text.substring(Math.max(0, text.length - 500)));
            console.log('================================');
            
            // フォールバック: テキストからJSONを抽出する別の方法を試す
            try {
                console.log('Trying alternative parsing method...');
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const extracted = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                    const parsed = JSON.parse(extracted);
                    console.log('Alternative parsing succeeded:', parsed);
                    return parsed;
                }
            } catch (altError) {
                console.error('Alternative parsing also failed:', altError);
            }
            
            return null;
        }
    }
}

// グローバルインスタンス
const geminiClient = new GeminiClient();

// 練習曲の推薦を取得
async function getRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;

    showLoading('recommendationsContent');

    const userProfile = UserProfile.get();
    if (!userProfile) {
        showError('まず診断を完了してください');
        navigateTo('diagnosis');
        return;
    }

    const currentPhase = CurrentPhase.get();
    const diagnosis = userProfile.diagnosis;

    const prompt = `あなたはピアノ教師です。以下のユーザーに最適な練習曲を3曲推薦してください。

ユーザー情報:
- ブランク期間: ${getBlankPeriodText(diagnosis.blankPeriod)}
- 以前のレベル: ${getPreviousLevelText(diagnosis.previousLevel)}
- 現在のフェーズ: Phase ${currentPhase}
- 練習時間: ${getPracticeTimeText(diagnosis.practiceTime)}
- 目標: ${getGoalText(diagnosis.goal)}

重要: 必ず以下の正確なJSON形式のみで回答してください。説明文やマークダウンは含めないでください。

{"recommendations":[{"title":"曲名","composer":"作曲家名","difficulty":5,"reason":"推薦理由を100文字以内で","tips":"練習のポイントを100文字以内で","estimatedWeeks":4}]}

上記の形式で、3曲分のデータを含むJSONのみを返してください。`;

    console.log('=== Getting Recommendations ===');
    console.log('User Profile:', userProfile);
    console.log('Current Phase:', currentPhase);
    console.log('Prompt:', prompt);
    
    const response = await geminiClient.generateContent(prompt);
    
    if (!response) {
        console.error('No response from Gemini API');
        showEmptyState('recommendationsContent', 'AIからの推薦を取得できませんでした', 'fa-exclamation-triangle');
        return;
    }

    console.log('Response received, attempting to parse...');
    const data = geminiClient.parseJsonResponse(response);
    
    if (!data) {
        console.error('Failed to parse response as JSON');
        showEmptyState('recommendationsContent', 'レスポンスの解析に失敗しました。コンソールログを確認してください。', 'fa-exclamation-triangle');
        return;
    }
    
    if (!data.recommendations) {
        console.error('Response parsed but no recommendations field found');
        console.error('Parsed data structure:', data);
        showEmptyState('recommendationsContent', 'レスポンスに推薦データが含まれていません。コンソールログを確認してください。', 'fa-exclamation-triangle');
        return;
    }

    console.log('Recommendations found:', data.recommendations);
    displayRecommendations(data.recommendations);
}

// 推薦曲を表示
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;

    const html = `
        <div class="recommendations-grid">
            ${recommendations.map(rec => `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <h3 class="recommendation-title">${rec.title}</h3>
                        <p class="recommendation-composer">${rec.composer}</p>
                        <span class="difficulty-badge difficulty-${rec.difficulty}">
                            難易度: ${rec.difficulty}/10
                        </span>
                    </div>
                    <p class="recommendation-reason">${rec.reason}</p>
                    <div class="recommendation-tips">
                        <h5><i class="fas fa-lightbulb"></i> 練習のポイント</h5>
                        <p>${rec.tips}</p>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.9rem;">
                        <i class="fas fa-clock"></i> 予想習得期間: 約${rec.estimatedWeeks}週間
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// 練習アドバイスを取得
async function getPracticeAdvice(challenge) {
    if (!geminiClient.validateApiKey()) {
        return null;
    }

    const prompt = `
あなたはピアノ教師です。以下の課題に対する具体的な練習方法を3つ提案してください。

課題: ${challenge}

以下のJSON形式で回答してください:
{
  "advice": [
    {
      "name": "練習方法の名前",
      "method": "実施方法の詳細",
      "duration": "1日の推奨時間（分）",
      "effect": "期待される効果"
    }
  ]
}

日本語で回答してください。
`;

    const response = await geminiClient.generateContent(prompt);
    
    if (!response) return null;

    return geminiClient.parseJsonResponse(response);
}

// モチベーションメッセージを取得
async function getMotivationalMessage() {
    if (!geminiClient.validateApiKey()) {
        return '今日も練習を頑張りましょう！';
    }

    const stats = PracticeLogs.getStats();
    const currentPhase = CurrentPhase.get();

    const prompt = `
あなたはピアノ教師です。以下の情報を基に、ユーザーを励ますメッセージを1つ作成してください（50文字以内）。

- 現在のフェーズ: Phase ${currentPhase}
- 総練習時間: ${stats.totalTime}分
- 総練習回数: ${stats.totalSessions}回
- 今週の練習時間: ${stats.weeklyTime}分

前向きで励みになるメッセージをお願いします。
`;

    const response = await geminiClient.generateContent(prompt);
    return response || '今日も練習を頑張りましょう！';
}

// 曲の分析を取得
async function analyzeSong(songTitle, composer) {
    if (!geminiClient.validateApiKey()) {
        return null;
    }

    const prompt = `
「${songTitle}」（${composer}作曲）について、以下の情報を提供してください:

1. 曲の特徴と難易度
2. 主な技術的課題
3. 練習のポイント
4. 演奏のコツ

簡潔に、各項目100文字程度で日本語で回答してください。
`;

    const response = await geminiClient.generateContent(prompt);
    return response;
}

// APIキーを保存
function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    if (!input) return;

    const apiKey = input.value.trim();

    if (!apiKey) {
        showError('APIキーを入力してください');
        return;
    }

    // 基本的な検証
    if (!validateApiKey(apiKey)) {
        showError('APIキーの形式が正しくありません。20文字以上の英数字、ハイフン、アンダースコアで構成されている必要があります。');
        console.log('APIキー検証失敗:', {
            length: apiKey.length,
            hasValidChars: /^[A-Za-z0-9_-]+$/.test(apiKey)
        });
        return;
    }

    // APIキーを保存
    ApiKey.save(apiKey);
    geminiClient.setApiKey(apiKey);
    
    showSuccess('APIキーを保存しました！AI推薦機能が利用可能になります。');
    closeModal('settingsModal');
    
    // 入力フィールドをクリア
    input.value = '';
    
    console.log('APIキーが正常に保存されました');
}

// テキスト変換ヘルパー関数
function getBlankPeriodText(value) {
    const map = {
        'less-than-1': '1年未満',
        '1-3': '1〜3年',
        '3-5': '3〜5年',
        'more-than-5': '5年以上'
    };
    return map[value] || value;
}

function getPreviousLevelText(value) {
    const map = {
        'beginner': '初級',
        'intermediate': '中級',
        'advanced': '上級',
        'professional': 'プロフェッショナル'
    };
    return map[value] || value;
}

function getPracticeTimeText(value) {
    const map = {
        '1-2-hours': '週1〜2時間',
        '3-5-hours': '週3〜5時間',
        '5-plus-hours': '週5時間以上'
    };
    return map[value] || value;
}

function getGoalText(value) {
    const map = {
        'hobby': '趣味として楽しむ',
        'specific-song': '特定の曲を弾けるようになる',
        'recover-level': '以前のレベルに戻る',
        'exceed-level': '以前を超えるレベルを目指す'
    };
    return map[value] || value;
}

// 初期化時にAPIキーを読み込む
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = ApiKey.get();
    if (apiKey) {
        geminiClient.setApiKey(apiKey);
    }
});

// Made with Bob
