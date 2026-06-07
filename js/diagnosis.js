/* ===================================
   Diagnosis Module
   =================================== */

let currentQuestion = 1;
const totalQuestions = 5;

// 診断フォームの初期化
function initDiagnosis() {
    const form = document.getElementById('diagnosisForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    // 次へボタン
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateCurrentQuestion()) {
                nextQuestion();
            }
        });
    }

    // 前へボタン
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevQuestion();
        });
    }

    // 送信ボタン
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateCurrentQuestion()) {
                submitDiagnosis();
            }
        });
    }

    // ラジオボタンの選択時に自動で次へ進む（オプション）
    const radioButtons = form.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            // 少し遅延を入れて選択を確認できるようにする
            setTimeout(() => {
                if (currentQuestion < totalQuestions) {
                    nextQuestion();
                }
            }, 300);
        });
    });
}

// 現在の質問を検証
function validateCurrentQuestion() {
    const currentCard = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    if (!currentCard) return false;

    const inputs = currentCard.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (input.type === 'radio') {
            const name = input.name;
            const checked = currentCard.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
            }
        } else if (!input.value) {
            isValid = false;
        }
    });

    if (!isValid) {
        showError('この質問に回答してください');
    }

    return isValid;
}

// 次の質問へ
function nextQuestion() {
    if (currentQuestion >= totalQuestions) return;

    // 現在の質問を非表示
    const currentCard = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    if (currentCard) {
        currentCard.classList.remove('active');
    }

    currentQuestion++;

    // 次の質問を表示
    const nextCard = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    if (nextCard) {
        nextCard.classList.add('active');
    }

    updateProgress();
    updateButtons();
}

// 前の質問へ
function prevQuestion() {
    if (currentQuestion <= 1) return;

    // 現在の質問を非表示
    const currentCard = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    if (currentCard) {
        currentCard.classList.remove('active');
    }

    currentQuestion--;

    // 前の質問を表示
    const prevCard = document.querySelector(`.question-card[data-question="${currentQuestion}"]`);
    if (prevCard) {
        prevCard.classList.add('active');
    }

    updateProgress();
    updateButtons();
}

// プログレスバーを更新
function updateProgress() {
    const progressFill = document.getElementById('diagnosisProgress');
    const progressText = document.getElementById('progressText');

    if (progressFill) {
        const percentage = (currentQuestion / totalQuestions) * 100;
        progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `質問 ${currentQuestion} / ${totalQuestions}`;
    }
}

// ボタンの表示を更新
function updateButtons() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) {
        prevBtn.style.display = currentQuestion > 1 ? 'inline-flex' : 'none';
    }

    if (currentQuestion === totalQuestions) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

// 診断を送信
function submitDiagnosis() {
    const form = document.getElementById('diagnosisForm');
    if (!form) return;

    const formData = new FormData(form);
    const diagnosis = {
        blankPeriod: formData.get('blankPeriod'),
        previousLevel: formData.get('previousLevel'),
        practiceTime: formData.get('practiceTime'),
        goal: formData.get('goal'),
        currentState: {
            fingerMovement: parseInt(formData.get('fingerMovement')),
            sheetReading: parseInt(formData.get('sheetReading')),
            musicTheory: parseInt(formData.get('musicTheory'))
        }
    };

    // 診断結果を分析
    const result = analyzeDiagnosis(diagnosis);

    // ユーザープロフィールを保存
    const userProfile = {
        diagnosis,
        result,
        startDate: new Date().toISOString(),
        userId: `user_${Date.now()}`
    };

    UserProfile.save(userProfile);
    CurrentPhase.save(result.recommendedPhase);

    // 結果を表示
    displayDiagnosisResult(result);
}

// 診断結果を分析
function analyzeDiagnosis(diagnosis) {
    let score = 0;
    let recommendedPhase = 1;
    let estimatedRecoveryWeeks = 12;

    // ブランク期間による影響
    const blankPeriodScores = {
        'less-than-1': 4,
        '1-3': 3,
        '3-5': 2,
        'more-than-5': 1
    };
    score += blankPeriodScores[diagnosis.blankPeriod] || 1;

    // 以前のレベルによる影響
    const levelScores = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3,
        'professional': 4
    };
    score += levelScores[diagnosis.previousLevel] || 1;

    // 現在の状態による影響
    const stateAvg = (
        diagnosis.currentState.fingerMovement +
        diagnosis.currentState.sheetReading +
        diagnosis.currentState.musicTheory
    ) / 3;
    score += Math.round(stateAvg);

    // 練習時間による調整
    const practiceTimeMultiplier = {
        '1-2-hours': 1.5,
        '3-5-hours': 1.0,
        '5-plus-hours': 0.7
    };
    const multiplier = practiceTimeMultiplier[diagnosis.practiceTime] || 1.0;

    // 推奨フェーズを決定
    if (score >= 10) {
        recommendedPhase = 2;
        estimatedRecoveryWeeks = 8;
    } else if (score >= 7) {
        recommendedPhase = 1;
        estimatedRecoveryWeeks = 12;
    } else {
        recommendedPhase = 1;
        estimatedRecoveryWeeks = 16;
    }

    estimatedRecoveryWeeks = Math.round(estimatedRecoveryWeeks * multiplier);

    // 目標に応じたメッセージ
    const goalMessages = {
        'hobby': '楽しみながら無理なく続けることを重視しましょう',
        'specific-song': '目標の曲に向けて段階的に技術を積み上げていきましょう',
        'recover-level': '以前のレベルを取り戻すため、着実に練習を重ねましょう',
        'exceed-level': '以前を超えるレベルを目指して、新しい挑戦を続けましょう'
    };

    return {
        score,
        recommendedPhase,
        estimatedRecoveryWeeks,
        goalMessage: goalMessages[diagnosis.goal] || '',
        strengths: getStrengths(diagnosis),
        focusAreas: getFocusAreas(diagnosis)
    };
}

// 強みを特定
function getStrengths(diagnosis) {
    const strengths = [];
    
    if (diagnosis.currentState.sheetReading >= 4) {
        strengths.push('楽譜の読み方をよく覚えています');
    }
    if (diagnosis.currentState.musicTheory >= 4) {
        strengths.push('音楽理論の知識が保たれています');
    }
    if (diagnosis.currentState.fingerMovement >= 4) {
        strengths.push('指の柔軟性が維持されています');
    }
    if (diagnosis.blankPeriod === 'less-than-1') {
        strengths.push('ブランク期間が短いため、早期の回復が期待できます');
    }

    return strengths.length > 0 ? strengths : ['新しいスタートを切る準備ができています'];
}

// 重点的に取り組むべき領域を特定
function getFocusAreas(diagnosis) {
    const areas = [];

    if (diagnosis.currentState.fingerMovement <= 2) {
        areas.push('指の柔軟性と独立性の回復');
    }
    if (diagnosis.currentState.sheetReading <= 2) {
        areas.push('楽譜の読み方の復習');
    }
    if (diagnosis.currentState.musicTheory <= 2) {
        areas.push('音楽理論の基礎の確認');
    }
    if (diagnosis.blankPeriod === 'more-than-5') {
        areas.push('基礎からの丁寧な再構築');
    }

    return areas.length > 0 ? areas : ['バランスの取れた総合的な練習'];
}

// 診断結果を表示
function displayDiagnosisResult(result) {
    const form = document.getElementById('diagnosisForm');
    const resultDiv = document.getElementById('diagnosisResult');
    const resultContent = document.getElementById('resultContent');

    if (!resultDiv || !resultContent) return;

    // フォームを非表示
    if (form) {
        form.style.display = 'none';
    }

    // 結果のHTML生成
    const phaseNames = {
        1: 'Phase 1: 基礎の再構築',
        2: 'Phase 2: テクニックの復活',
        3: 'Phase 3: レパートリーの拡大',
        4: 'Phase 4: 上級への道'
    };

    resultContent.innerHTML = `
        <div class="result-item">
            <h4><i class="fas fa-map-marker-alt"></i> 推奨開始レベル</h4>
            <p>${phaseNames[result.recommendedPhase]}</p>
        </div>
        <div class="result-item">
            <h4><i class="fas fa-calendar-check"></i> 予想リカバリー期間</h4>
            <p>約${result.estimatedRecoveryWeeks}週間</p>
            <small style="color: var(--text-muted);">※個人差があります。焦らず自分のペースで進めましょう。</small>
        </div>
        <div class="result-item">
            <h4><i class="fas fa-bullseye"></i> あなたの目標</h4>
            <p>${result.goalMessage}</p>
        </div>
        <div class="result-item">
            <h4><i class="fas fa-star"></i> あなたの強み</h4>
            <ul style="list-style: none; padding-left: 0;">
                ${result.strengths.map(s => `<li style="padding: 0.5rem 0; color: var(--text-muted);"><i class="fas fa-check" style="color: var(--success-color); margin-right: 0.5rem;"></i>${s}</li>`).join('')}
            </ul>
        </div>
        <div class="result-item">
            <h4><i class="fas fa-target"></i> 重点的に取り組む領域</h4>
            <ul style="list-style: none; padding-left: 0;">
                ${result.focusAreas.map(a => `<li style="padding: 0.5rem 0; color: var(--text-muted);"><i class="fas fa-arrow-right" style="color: var(--accent-color); margin-right: 0.5rem;"></i>${a}</li>`).join('')}
            </ul>
        </div>
    `;

    // 結果を表示
    resultDiv.style.display = 'block';

    // 「練習を始める」ボタンのイベント
    const startBtn = document.getElementById('startJourneyBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            showSuccess('診断が完了しました！ダッシュボードへ移動します');
            
            // ホーム画面のボタン表示を更新
            updateHomeButtons();
            
            setTimeout(() => {
                navigateTo('dashboard');
            }, 1000);
        });
    }
}

// ホーム画面のボタン表示を更新
function updateHomeButtons() {
    const startBtn = document.getElementById('startDiagnosisBtn');
    const continueBtn = document.getElementById('continueBtn');
    const profile = UserProfile.get();
    
    if (profile) {
        // プロフィールが存在する場合
        if (startBtn) startBtn.style.display = 'none';
        if (continueBtn) {
            continueBtn.style.display = 'inline-flex';
            
            // 既存のイベントリスナーを削除して新しいものを追加
            const newContinueBtn = continueBtn.cloneNode(true);
            continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
            
            newContinueBtn.addEventListener('click', () => {
                navigateTo('dashboard');
                // ダッシュボードと練習プランを更新
                updateDashboard();
                displayPracticePlan();
            });
        }
    } else {
        // プロフィールが存在しない場合
        if (startBtn) {
            startBtn.style.display = 'inline-flex';
            
            // 既存のイベントリスナーを削除して新しいものを追加
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);
            
            newStartBtn.addEventListener('click', () => {
                navigateTo('diagnosis');
            });
        }
        if (continueBtn) continueBtn.style.display = 'none';
    }
}

// 診断をリセット
function resetDiagnosis() {
    currentQuestion = 1;
    const form = document.getElementById('diagnosisForm');
    if (form) {
        form.reset();
    }

    // すべての質問カードを非表示
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });

    // 最初の質問を表示
    const firstCard = document.querySelector('.question-card[data-question="1"]');
    if (firstCard) {
        firstCard.classList.add('active');
    }

    updateProgress();
    updateButtons();

    // 結果を非表示
    const resultDiv = document.getElementById('diagnosisResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }

    // フォームを表示
    if (form) {
        form.style.display = 'block';
    }
}

// Made with Bob
