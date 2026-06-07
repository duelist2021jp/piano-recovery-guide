/* ===================================
   Main Application
   =================================== */

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Piano Recovery Guide - Initializing...');

    // 初期化処理
    initNavigation();
    initDiagnosis();
    initProgress();
    checkUserProfile();
    initEventListeners();

    console.log('Piano Recovery Guide - Ready!');
});

// ナビゲーションの初期化
function initNavigation() {
    // ナビゲーションリンクのクリックイベント
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const sectionId = href.replace('#', '');
            navigateTo(sectionId);
        });
    });

    // モバイルメニューのトグル
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// ユーザープロフィールのチェック
function checkUserProfile() {
    const profile = UserProfile.get();
    const startBtn = document.getElementById('startDiagnosisBtn');
    const continueBtn = document.getElementById('continueBtn');

    if (profile) {
        // プロフィールが存在する場合
        if (startBtn) startBtn.style.display = 'none';
        if (continueBtn) {
            continueBtn.style.display = 'inline-flex';
            continueBtn.addEventListener('click', () => {
                navigateTo('dashboard');
            });
        }

        // ダッシュボードを更新
        updateDashboard();
        displayPracticePlan();
    } else {
        // プロフィールが存在しない場合
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                navigateTo('diagnosis');
            });
        }
        if (continueBtn) continueBtn.style.display = 'none';
    }
}

// イベントリスナーの初期化
function initEventListeners() {
    // 推薦取得ボタン
    const getRecommendationsBtn = document.getElementById('getRecommendationsBtn');
    if (getRecommendationsBtn) {
        getRecommendationsBtn.addEventListener('click', () => {
            getRecommendations();
        });
    }

    // モーダルの外側をクリックしたら閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });

    // スクロール時のナビゲーションバーの影
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            // 下にスクロール
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // 上にスクロール
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

// ページの可視性が変わったときの処理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // ページが再び表示されたときにダッシュボードを更新
        const profile = UserProfile.get();
        if (profile) {
            updateDashboard();
        }
    }
});

// ウィンドウのリサイズ時の処理
window.addEventListener('resize', debounce(() => {
    // グラフのリサイズ
    if (practiceChart) {
        practiceChart.resize();
    }
}, 250));

// アプリケーション情報を表示
function showAppInfo() {
    const info = `
Piano Recovery Guide v1.0

長期ブランクのあるピアニストが、段階的かつ効果的に
ピアノ演奏を再開できるようサポートするWebアプリケーションです。

主な機能:
- レベル診断
- 段階的な練習プラン
- AI推薦システム（Gemini API）
- 動画チュートリアル
- 進捗管理

開発: 2026
技術: HTML5, CSS3, JavaScript, Gemini API, Chart.js
    `;

    alert(info);
}

// デバッグ用: ストレージの内容を表示
function debugStorage() {
    console.log('=== Storage Debug ===');
    console.log('User Profile:', UserProfile.get());
    console.log('Practice Logs:', PracticeLogs.getAll());
    console.log('Current Phase:', CurrentPhase.get());
    console.log('Completed Items:', CompletedItems.getAll());
    console.log('Achievements:', Achievements.getAll());
    console.log('API Key exists:', ApiKey.exists());
    console.log('Storage Usage:', storage.getUsage());
    console.log('===================');
}

// デバッグ用: サンプルデータを生成
function generateSampleData() {
    if (!confirm('サンプルデータを生成しますか？既存のデータは上書きされます。')) {
        return;
    }

    // サンプルプロフィール
    const sampleProfile = {
        diagnosis: {
            blankPeriod: '3-5',
            previousLevel: 'intermediate',
            practiceTime: '3-5-hours',
            goal: 'recover-level',
            currentState: {
                fingerMovement: 3,
                sheetReading: 4,
                musicTheory: 4
            }
        },
        result: {
            score: 8,
            recommendedPhase: 2,
            estimatedRecoveryWeeks: 10,
            goalMessage: '以前のレベルを取り戻すため、着実に練習を重ねましょう',
            strengths: ['楽譜の読み方をよく覚えています', '音楽理論の知識が保たれています'],
            focusAreas: ['指の柔軟性と独立性の回復']
        },
        startDate: new Date().toISOString(),
        userId: `user_${Date.now()}`
    };

    UserProfile.save(sampleProfile);
    CurrentPhase.save(2);

    // サンプル練習ログ
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        PracticeLogs.add({
            date: date.toISOString(),
            duration: randomInt(30, 90),
            completedItems: 'スケール練習、ハノン No.1',
            notes: 'だんだん指が動くようになってきた',
            mood: ['excellent', 'good', 'okay'][randomInt(0, 2)]
        });
    }

    // サンプル達成バッジ
    Achievements.add({
        id: 'first_practice',
        name: '最初の一歩',
        description: '初めての練習を記録しました',
        icon: 'fa-star'
    });

    showSuccess('サンプルデータを生成しました！');
    
    // ページをリロード
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// グローバル関数として公開（HTMLから呼び出せるように）
window.navigateTo = navigateTo;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveApiKey = saveApiKey;
window.getRecommendations = getRecommendations;
window.switchPhaseTab = switchPhaseTab;
window.togglePracticeItem = togglePracticeItem;
window.advanceToNextPhase = advanceToNextPhase;
window.showAppInfo = showAppInfo;
window.debugStorage = debugStorage;
window.generateSampleData = generateSampleData;
window.exportData = exportData;
window.resetAllData = resetAllData;
window.exportPracticePlan = exportPracticePlan;
window.exportProgressData = exportProgressData;

// コンソールにヘルプメッセージを表示
console.log('%c🎹 Piano Recovery Guide', 'font-size: 20px; font-weight: bold; color: #d4af37;');
console.log('%cデバッグコマンド:', 'font-size: 14px; font-weight: bold;');
console.log('debugStorage() - ストレージの内容を表示');
console.log('generateSampleData() - サンプルデータを生成');
console.log('exportData() - データをエクスポート');
console.log('resetAllData() - すべてのデータをリセット');

// Made with Bob
