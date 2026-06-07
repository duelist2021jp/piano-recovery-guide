/* ===================================
   Progress Management Module
   =================================== */

let practiceChart = null;

// 進捗管理の初期化
function initProgress() {
    const form = document.getElementById('practiceLogForm');
    if (form) {
        form.addEventListener('submit', handlePracticeLogSubmit);
    }

    // グラフを初期化
    initPracticeChart();

    // 練習履歴を表示
    displayPracticeHistory();
}

// 練習記録フォームの送信処理
function handlePracticeLogSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const log = {
        duration: parseInt(formData.get('duration')),
        completedItems: formData.get('completedItems'),
        notes: formData.get('notes'),
        mood: formData.get('mood')
    };

    // バリデーション
    if (!log.duration || log.duration < 1) {
        showError('練習時間を入力してください');
        return;
    }

    if (!log.mood) {
        showError('今日の気分を選択してください');
        return;
    }

    // 保存
    const success = PracticeLogs.add(log);

    if (success) {
        showSuccess('練習記録を保存しました！');
        form.reset();

        // 表示を更新
        displayPracticeHistory();
        updatePracticeChart();
        updateDashboard();

        // 達成バッジのチェック
        checkAchievements();
    } else {
        showError('保存に失敗しました');
    }
}

// 練習グラフの初期化
function initPracticeChart() {
    const canvas = document.getElementById('practiceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 過去7日間のデータを取得
    const chartData = getPracticeChartData(7);

    practiceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '練習時間（分）',
                data: chartData.data,
                backgroundColor: 'rgba(212, 175, 55, 0.6)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#b0b8c1',
                        font: {
                            family: "'Noto Sans JP', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 35, 50, 0.95)',
                    titleColor: '#d4af37',
                    bodyColor: '#ffffff',
                    borderColor: '#d4af37',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}分`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b8c1',
                        callback: function(value) {
                            return value + '分';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b0b8c1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// グラフデータを取得
function getPracticeChartData(days) {
    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        const logs = PracticeLogs.getAll().filter(log => {
            const logDate = new Date(log.date).toISOString().split('T')[0];
            return logDate === dateStr;
        });

        const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

        // ラベル（月/日）
        const month = date.getMonth() + 1;
        const day = date.getDate();
        labels.push(`${month}/${day}`);
        
        data.push(totalDuration);
    }

    return { labels, data };
}

// グラフを更新
function updatePracticeChart() {
    if (!practiceChart) return;

    const chartData = getPracticeChartData(7);
    practiceChart.data.labels = chartData.labels;
    practiceChart.data.datasets[0].data = chartData.data;
    practiceChart.update();
}

// 練習履歴を表示
function displayPracticeHistory() {
    const container = document.getElementById('practiceHistory');
    if (!container) return;

    const logs = PracticeLogs.getRecent(10);

    if (logs.length === 0) {
        showEmptyState('practiceHistory', 'まだ練習記録がありません', 'fa-clipboard');
        return;
    }

    const moodEmojis = {
        'excellent': '😊',
        'good': '🙂',
        'okay': '😐',
        'challenging': '😓'
    };

    const html = `
        <div class="history-list">
            ${logs.map(log => `
                <div class="history-item">
                    <div class="history-date">
                        ${formatDate(log.date)} ${moodEmojis[log.mood] || ''}
                    </div>
                    <div class="history-duration">
                        <i class="fas fa-clock"></i> ${formatDuration(log.duration)}
                    </div>
                    ${log.completedItems ? `
                        <div class="history-items">
                            <i class="fas fa-check-circle"></i> ${log.completedItems}
                        </div>
                    ` : ''}
                    ${log.notes ? `
                        <div class="history-notes">
                            ${log.notes}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// ダッシュボードを更新
function updateDashboard() {
    updateCurrentPhaseDisplay();
    updateTodayPracticeDisplay();
    updateProgressSummaryDisplay();
}

// 現在のフェーズ表示を更新
function updateCurrentPhaseDisplay() {
    const container = document.getElementById('currentPhaseDisplay');
    if (!container) return;

    const currentPhase = CurrentPhase.get();
    const phaseKey = `phase${currentPhase}`;
    const plan = PRACTICE_PLANS[phaseKey];

    if (!plan) return;

    const html = `
        <div class="phase-display">
            <div class="phase-number">Phase ${currentPhase}</div>
            <div class="phase-name">${plan.name.split(':')[1].trim()}</div>
            <div class="phase-description">${plan.description}</div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="navigateTo('practice-plan')">
                    詳細を見る
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// 今日の練習メニュー表示を更新
function updateTodayPracticeDisplay() {
    const container = document.getElementById('todayPracticeDisplay');
    if (!container) return;

    const menu = getTodayPracticeMenu();

    if (menu.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">練習メニューがありません</p>';
        return;
    }

    const html = `
        <ul class="practice-menu">
            ${menu.slice(0, 5).map((item, index) => `
                <li class="practice-item">
                    <input type="checkbox" id="today-${index}">
                    <label for="today-${index}">
                        <i class="fas ${item.icon}" style="color: var(--accent-color); margin-right: 0.5rem;"></i>
                        ${item.item}
                    </label>
                </li>
            `).join('')}
        </ul>
        <button class="btn btn-text" onclick="navigateTo('practice-plan')" style="margin-top: 1rem;">
            すべて見る <i class="fas fa-arrow-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

// 進捗サマリー表示を更新
function updateProgressSummaryDisplay() {
    const container = document.getElementById('progressSummaryDisplay');
    if (!container) return;

    const stats = PracticeLogs.getStats();
    const achievements = Achievements.getAll();

    const html = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div style="text-align: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">
                    ${stats.totalSessions}
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    総練習回数
                </div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">
                    ${Math.round(stats.totalTime / 60)}
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    総練習時間（時間）
                </div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">
                    ${stats.avgTime}
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    平均練習時間（分）
                </div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">
                    ${achievements.length}
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    獲得バッジ
                </div>
            </div>
        </div>
        <div style="margin-top: 1rem; text-align: center;">
            <button class="btn btn-text" onclick="navigateTo('progress')">
                詳細を見る <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// 週次レポートを生成
function generateWeeklyReport() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const logs = PracticeLogs.getByDateRange(sevenDaysAgo, new Date());
    const totalTime = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const avgTime = logs.length > 0 ? Math.round(totalTime / logs.length) : 0;

    const report = {
        period: `${formatDate(sevenDaysAgo)} 〜 ${formatDate(new Date())}`,
        totalSessions: logs.length,
        totalTime: totalTime,
        avgTime: avgTime,
        mostProductiveDay: getMostProductiveDay(logs),
        completedItems: logs.filter(log => log.completedItems).length
    };

    return report;
}

// 最も生産的だった日を取得
function getMostProductiveDay(logs) {
    if (logs.length === 0) return null;

    const dayTotals = {};
    
    logs.forEach(log => {
        const date = new Date(log.date).toISOString().split('T')[0];
        dayTotals[date] = (dayTotals[date] || 0) + log.duration;
    });

    let maxDate = null;
    let maxTime = 0;

    for (const [date, time] of Object.entries(dayTotals)) {
        if (time > maxTime) {
            maxTime = time;
            maxDate = date;
        }
    }

    return maxDate ? { date: formatDate(maxDate), time: maxTime } : null;
}

// 月次レポートを生成
function generateMonthlyReport() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logs = PracticeLogs.getByDateRange(thirtyDaysAgo, new Date());
    const totalTime = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    return {
        period: `${formatDate(thirtyDaysAgo)} 〜 ${formatDate(new Date())}`,
        totalSessions: logs.length,
        totalTime: totalTime,
        avgTime: logs.length > 0 ? Math.round(totalTime / logs.length) : 0,
        consistency: calculateConsistency(logs)
    };
}

// 練習の一貫性を計算
function calculateConsistency(logs) {
    if (logs.length === 0) return 0;

    const dates = logs.map(log => new Date(log.date).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)];
    
    // 30日間のうち何日練習したか
    const consistency = (uniqueDates.length / 30) * 100;
    return Math.round(consistency);
}

// 進捗データをエクスポート
function exportProgressData() {
    const stats = PracticeLogs.getStats();
    const weeklyReport = generateWeeklyReport();
    const monthlyReport = generateMonthlyReport();

    const data = {
        exportedAt: new Date().toISOString(),
        stats: stats,
        weeklyReport: weeklyReport,
        monthlyReport: monthlyReport,
        recentLogs: PracticeLogs.getRecent(20)
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('進捗データをエクスポートしました');
}

// Made with Bob
