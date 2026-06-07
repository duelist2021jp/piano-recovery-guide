/* ===================================
   Practice Plan Module
   =================================== */

// 練習プランデータ
const PRACTICE_PLANS = {
    phase1: {
        name: 'Phase 1: 基礎の再構築',
        duration: '2-4週間',
        description: '指の柔軟性と基本的なテクニックを取り戻します',
        sections: [
            {
                title: '指のストレッチと柔軟性',
                icon: 'fa-hand-paper',
                items: [
                    '手首と指のストレッチ（5分）',
                    '指の独立性練習（各指10回）',
                    'グリップボールでの握力強化',
                    '指の開閉運動'
                ]
            },
            {
                title: '基本的なスケール練習',
                icon: 'fa-music',
                items: [
                    'Cメジャースケール（両手、ゆっくり）',
                    'Gメジャースケール',
                    'Fメジャースケール',
                    'アルペジオの基礎（C, G, F）'
                ]
            },
            {
                title: 'リズム感の回復',
                icon: 'fa-drum',
                items: [
                    'メトロノームを使った4分音符練習',
                    '8分音符のリズムパターン',
                    '簡単なリズム読み',
                    '両手でのリズム打ち'
                ]
            },
            {
                title: '簡単な練習曲',
                icon: 'fa-file-music',
                items: [
                    'バイエル 60-80番程度',
                    'ブルグミュラー「素直な心」',
                    '童謡の簡単なアレンジ',
                    '好きな曲の簡単バージョン'
                ]
            }
        ]
    },
    phase2: {
        name: 'Phase 2: テクニックの復活',
        duration: '4-8週間',
        description: 'より高度なテクニックと表現力を取り戻します',
        sections: [
            {
                title: 'スケールとアルペジオ',
                icon: 'fa-layer-group',
                items: [
                    '全調のメジャースケール（2オクターブ）',
                    'マイナースケール（自然・和声・旋律）',
                    '全調のアルペジオ',
                    'スケールのリズムバリエーション'
                ]
            },
            {
                title: 'ハノン練習曲',
                icon: 'fa-dumbbell',
                items: [
                    'ハノン No.1-10（指の独立性）',
                    'ハノン No.11-20（指の強化）',
                    'ハノン No.21-31（スケール）',
                    'ハノン No.39-43（トリル）'
                ]
            },
            {
                title: '簡単なエチュード',
                icon: 'fa-book-open',
                items: [
                    'ツェルニー100番練習曲',
                    'ブルグミュラー25の練習曲',
                    'ル・クーペ ピアノのABC',
                    'バッハ プレリュード（簡単なもの）'
                ]
            },
            {
                title: '両手の協調性',
                icon: 'fa-hands',
                items: [
                    '異なるリズムの両手練習',
                    'ポリフォニックな曲',
                    '左手のメロディー練習',
                    '両手のバランス調整'
                ]
            }
        ]
    },
    phase3: {
        name: 'Phase 3: レパートリーの拡大',
        duration: '8-12週間',
        description: '幅広いレパートリーと表現力を身につけます',
        sections: [
            {
                title: '好きな曲への挑戦',
                icon: 'fa-heart',
                items: [
                    'クラシックの名曲（中級レベル）',
                    'ポピュラー音楽のアレンジ',
                    '映画音楽やアニメソング',
                    'ジャズスタンダード（簡単なもの）'
                ]
            },
            {
                title: '表現力の向上',
                icon: 'fa-palette',
                items: [
                    'ダイナミクスの練習',
                    'アーティキュレーションの使い分け',
                    'フレージングの意識',
                    'テンポルバートの練習'
                ]
            },
            {
                title: '複雑なリズムパターン',
                icon: 'fa-project-diagram',
                items: [
                    'シンコペーション',
                    '3連符と16分音符の組み合わせ',
                    'ポリリズム',
                    '変拍子の曲'
                ]
            },
            {
                title: 'ペダリング技術',
                icon: 'fa-shoe-prints',
                items: [
                    'ダンパーペダルの基本',
                    'ハーフペダルの使い方',
                    'ソフトペダルの活用',
                    'ペダルを使った曲の練習'
                ]
            }
        ]
    },
    phase4: {
        name: 'Phase 4: 上級への道',
        duration: '継続的',
        description: 'より高度な技術と音楽性を追求します',
        sections: [
            {
                title: '難易度の高い曲',
                icon: 'fa-mountain',
                items: [
                    'ショパン エチュード',
                    'リスト 超絶技巧練習曲',
                    'ラフマニノフ 前奏曲',
                    'ドビュッシー 前奏曲集'
                ]
            },
            {
                title: '演奏解釈の深化',
                icon: 'fa-brain',
                items: [
                    '作曲家の意図の理解',
                    '時代背景の研究',
                    '異なる演奏解釈の比較',
                    '自分なりの解釈の構築'
                ]
            },
            {
                title: 'パフォーマンス練習',
                icon: 'fa-users',
                items: [
                    '暗譜の技術',
                    'ステージでの演奏練習',
                    '緊張のコントロール',
                    '録音・録画での自己分析'
                ]
            },
            {
                title: '新しいジャンルへの挑戦',
                icon: 'fa-compass',
                items: [
                    '現代音楽',
                    '即興演奏',
                    '作曲・編曲',
                    'アンサンブル演奏'
                ]
            }
        ]
    }
};

// 練習プランを表示
function displayPracticePlan() {
    const container = document.getElementById('practicePlanContent');
    if (!container) return;

    const currentPhase = CurrentPhase.get();
    
    // タブを作成
    const tabsHTML = `
        <div class="phase-tabs">
            ${Object.keys(PRACTICE_PLANS).map((key, index) => {
                const phase = index + 1;
                const isActive = phase === currentPhase ? 'active' : '';
                const isLocked = phase > currentPhase + 1;
                return `
                    <button class="phase-tab ${isActive}" 
                            data-phase="${phase}"
                            ${isLocked ? 'disabled' : ''}
                            onclick="switchPhaseTab(${phase})">
                        ${isLocked ? '<i class="fas fa-lock"></i>' : ''} 
                        Phase ${phase}
                    </button>
                `;
            }).join('')}
        </div>
    `;

    // コンテンツを作成
    const contentHTML = Object.keys(PRACTICE_PLANS).map((key, index) => {
        const phase = index + 1;
        const plan = PRACTICE_PLANS[key];
        const isActive = phase === currentPhase ? 'active' : '';

        return `
            <div class="phase-content ${isActive}" data-phase="${phase}">
                <div class="card" style="margin-bottom: 2rem;">
                    <h3 style="color: var(--secondary-color); margin-bottom: 1rem;">
                        ${plan.name}
                    </h3>
                    <p style="color: var(--text-muted); margin-bottom: 0.5rem;">
                        <i class="fas fa-clock"></i> 期間: ${plan.duration}
                    </p>
                    <p style="color: var(--text-muted);">
                        ${plan.description}
                    </p>
                </div>

                ${plan.sections.map(section => `
                    <div class="practice-section">
                        <h4>
                            <i class="fas ${section.icon}"></i>
                            ${section.title}
                        </h4>
                        <ul class="practice-list">
                            ${section.items.map((item, itemIndex) => {
                                const itemId = `phase${phase}_${section.title}_${itemIndex}`;
                                const isCompleted = CompletedItems.isCompleted(itemId);
                                return `
                                    <li>
                                        <label style="display: flex; align-items: start; gap: 0.75rem; cursor: pointer;">
                                            <input type="checkbox" 
                                                   ${isCompleted ? 'checked' : ''}
                                                   onchange="togglePracticeItem('${itemId}')"
                                                   style="margin-top: 0.25rem;">
                                            <span style="${isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${item}</span>
                                        </label>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                `).join('')}

                ${phase < 4 ? `
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="advanceToNextPhase()">
                            <i class="fas fa-arrow-right"></i>
                            次のフェーズへ進む
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = tabsHTML + contentHTML;
}

// フェーズタブを切り替え
function switchPhaseTab(phase) {
    // すべてのタブとコンテンツを非アクティブに
    document.querySelectorAll('.phase-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.phase-content').forEach(content => {
        content.classList.remove('active');
    });

    // 選択されたタブとコンテンツをアクティブに
    const selectedTab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
    const selectedContent = document.querySelector(`.phase-content[data-phase="${phase}"]`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

// 練習項目のチェック状態を切り替え
function togglePracticeItem(itemId) {
    CompletedItems.toggle(itemId);
    
    // 達成バッジのチェック
    checkAchievements();
}

// 次のフェーズへ進む
function advanceToNextPhase() {
    const currentPhase = CurrentPhase.get();
    
    if (currentPhase >= 4) {
        showSuccess('すでに最終フェーズです！');
        return;
    }

    if (confirm(`Phase ${currentPhase + 1}に進みますか？`)) {
        CurrentPhase.increment();
        showSuccess(`Phase ${currentPhase + 1}に進みました！`);
        
        // 達成バッジを追加
        Achievements.add({
            id: `phase_${currentPhase}_completed`,
            name: `Phase ${currentPhase} 完了`,
            description: `Phase ${currentPhase}のすべての練習を完了しました`,
            icon: 'fa-trophy'
        });

        // 表示を更新
        displayPracticePlan();
        updateDashboard();
    }
}

// 今日の練習メニューを取得
function getTodayPracticeMenu() {
    const currentPhase = CurrentPhase.get();
    const phaseKey = `phase${currentPhase}`;
    const plan = PRACTICE_PLANS[phaseKey];

    if (!plan) return [];

    // 各セクションから1-2項目をランダムに選択
    const menu = [];
    plan.sections.forEach(section => {
        const randomItems = shuffleArray(section.items).slice(0, 2);
        randomItems.forEach(item => {
            menu.push({
                section: section.title,
                item: item,
                icon: section.icon
            });
        });
    });

    return menu;
}

// 達成バッジのチェック
function checkAchievements() {
    const completedCount = CompletedItems.getAll().length;
    const stats = PracticeLogs.getStats();

    // 練習項目完了数による達成
    if (completedCount >= 10 && !Achievements.has('items_10')) {
        Achievements.add({
            id: 'items_10',
            name: '練習の達人',
            description: '10個の練習項目を完了しました',
            icon: 'fa-star'
        });
        showSuccess('🎉 達成バッジを獲得: 練習の達人');
    }

    if (completedCount >= 50 && !Achievements.has('items_50')) {
        Achievements.add({
            id: 'items_50',
            name: '練習マスター',
            description: '50個の練習項目を完了しました',
            icon: 'fa-crown'
        });
        showSuccess('🎉 達成バッジを獲得: 練習マスター');
    }

    // 練習時間による達成
    if (stats.totalTime >= 600 && !Achievements.has('time_10h')) {
        Achievements.add({
            id: 'time_10h',
            name: '10時間の練習',
            description: '累計10時間の練習を達成しました',
            icon: 'fa-clock'
        });
        showSuccess('🎉 達成バッジを獲得: 10時間の練習');
    }

    // 連続練習日数による達成
    const recentLogs = PracticeLogs.getRecent(7);
    if (recentLogs.length >= 7 && !Achievements.has('streak_7')) {
        Achievements.add({
            id: 'streak_7',
            name: '7日連続練習',
            description: '7日間連続で練習しました',
            icon: 'fa-fire'
        });
        showSuccess('🎉 達成バッジを獲得: 7日連続練習');
    }
}

// 練習プランのエクスポート
function exportPracticePlan() {
    const currentPhase = CurrentPhase.get();
    const phaseKey = `phase${currentPhase}`;
    const plan = PRACTICE_PLANS[phaseKey];
    const completedItems = CompletedItems.getAll();

    const exportData = {
        phase: currentPhase,
        planName: plan.name,
        sections: plan.sections.map(section => ({
            title: section.title,
            items: section.items.map((item, index) => ({
                item,
                completed: completedItems.includes(`phase${currentPhase}_${section.title}_${index}`)
            }))
        })),
        exportedAt: new Date().toISOString()
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-plan-phase${currentPhase}-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('練習プランをエクスポートしました');
}

// Made with Bob
