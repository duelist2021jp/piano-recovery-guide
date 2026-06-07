/* ===================================
   Utility Functions
   =================================== */

// ナビゲーション関連
function navigateTo(sectionId) {
    // すべてのセクションを非表示
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // 指定されたセクションを表示
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // ナビゲーションリンクのアクティブ状態を更新
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    // モバイルメニューを閉じる
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// モーダル関連
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 日付フォーマット
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 日付を相対的な表現に変換
function getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diffTime = now - target;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
    return `${Math.floor(diffDays / 365)}年前`;
}

// 時間を分から時間と分に変換
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
}

// 配列をシャッフル
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ローディング表示
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">読み込み中...</p>
            </div>
        `;
    }
}

// 空の状態表示
function showEmptyState(containerId, message, icon = 'fa-inbox') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// エラー表示
function showError(message) {
    // 簡易的なトースト通知
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(231, 76, 60, 0.95);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 成功メッセージ表示
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(39, 174, 96, 0.95);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// アニメーション用のCSSを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// フォームデータを取得
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        // ラジオボタンやチェックボックスの処理
        if (form.elements[key].type === 'radio' || form.elements[key].type === 'checkbox') {
            if (form.elements[key].checked) {
                data[key] = value;
            }
        } else {
            data[key] = value;
        }
    }

    return data;
}

// 数値を範囲内に制限
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ランダムな整数を生成
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// オブジェクトのディープコピー
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 配列から重複を削除
function unique(array) {
    return [...new Set(array)];
}

// オブジェクトが空かチェック
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// 文字列を切り詰める
function truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

// スムーズスクロール
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// APIキーの検証
function validateApiKey(apiKey) {
    // Gemini APIキーの基本的な検証
    // APIキーは通常30文字以上で、英数字とハイフン、アンダースコアを含む
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    
    // 空白を削除
    const trimmedKey = apiKey.trim();
    
    // 最小長チェック（Gemini APIキーは通常30文字以上）
    if (trimmedKey.length < 20) {
        return false;
    }
    
    // 基本的な文字チェック（英数字、ハイフン、アンダースコアのみ）
    const validPattern = /^[A-Za-z0-9_-]+$/;
    return validPattern.test(trimmedKey);
}

// データリセットの確認
function confirmResetAllData() {
    const confirmed = confirm(
        '本当にすべてのデータをリセットしますか？\n\n' +
        '以下のデータが削除されます：\n' +
        '• 診断結果\n' +
        '• 練習記録\n' +
        '• 進捗データ\n' +
        '• APIキー\n' +
        '• すべての設定\n\n' +
        'この操作は取り消せません。'
    );
    
    if (confirmed) {
        // 再確認
        const doubleConfirm = confirm(
            '最終確認：本当にすべてのデータを削除してもよろしいですか？'
        );
        
        if (doubleConfirm) {
            resetAllData();
        }
    }
}

// すべてのデータをリセット
function resetAllData() {
    try {
        // LocalStorageをクリア
        localStorage.clear();
        
        // 成功メッセージを表示
        showSuccess('すべてのデータをリセットしました');
        
        // モーダルを閉じる
        closeModal('settingsModal');
        
        // 1秒後にページをリロード
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('データのリセットに失敗しました:', error);
        showError('データのリセットに失敗しました');
    }
}

// エクスポート（モジュールとして使用する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateTo,
        openModal,
        closeModal,
        formatDate,
        getRelativeTime,
        formatDuration,
        shuffleArray,
        debounce,
        showLoading,
        showEmptyState,
        showError,
        showSuccess,
        getFormData,
        clamp,
        randomInt,
        deepCopy,
        unique,
        isEmpty,
        truncate,
        smoothScrollTo,
        validateApiKey,
        confirmResetAllData,
        resetAllData
    };
}

// Made with Bob
