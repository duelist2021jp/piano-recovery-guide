/* ===================================
   LocalStorage Management
   =================================== */

const STORAGE_KEYS = {
    USER_PROFILE: 'piano_recovery_user_profile',
    PRACTICE_LOGS: 'piano_recovery_practice_logs',
    API_KEY: 'piano_recovery_api_key',
    CURRENT_PHASE: 'piano_recovery_current_phase',
    COMPLETED_ITEMS: 'piano_recovery_completed_items',
    PREFERENCES: 'piano_recovery_preferences',
    ACHIEVEMENTS: 'piano_recovery_achievements'
};

// ストレージマネージャークラス
class StorageManager {
    constructor() {
        this.storage = window.localStorage;
    }

    // データを保存
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            this.storage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    // データを取得
    get(key, defaultValue = null) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    // データを削除
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    // すべてのデータをクリア
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // ストレージの使用状況を確認
    getUsage() {
        let total = 0;
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                total += this.storage[key].length + key.length;
            }
        }
        return {
            used: total,
            usedKB: (total / 1024).toFixed(2),
            usedMB: (total / 1024 / 1024).toFixed(2)
        };
    }
}

// グローバルインスタンス
const storage = new StorageManager();

// ユーザープロフィール管理
const UserProfile = {
    save(profile) {
        return storage.set(STORAGE_KEYS.USER_PROFILE, {
            ...profile,
            updatedAt: new Date().toISOString()
        });
    },

    get() {
        return storage.get(STORAGE_KEYS.USER_PROFILE);
    },

    update(updates) {
        const current = this.get() || {};
        return this.save({ ...current, ...updates });
    },

    exists() {
        return this.get() !== null;
    },

    delete() {
        return storage.remove(STORAGE_KEYS.USER_PROFILE);
    }
};

// 練習ログ管理
const PracticeLogs = {
    getAll() {
        return storage.get(STORAGE_KEYS.PRACTICE_LOGS, []);
    },

    add(log) {
        const logs = this.getAll();
        const newLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...log
        };
        logs.unshift(newLog); // 新しいログを先頭に追加
        return storage.set(STORAGE_KEYS.PRACTICE_LOGS, logs);
    },

    update(id, updates) {
        const logs = this.getAll();
        const index = logs.findIndex(log => log.id === id);
        if (index !== -1) {
            logs[index] = { ...logs[index], ...updates };
            return storage.set(STORAGE_KEYS.PRACTICE_LOGS, logs);
        }
        return false;
    },

    delete(id) {
        const logs = this.getAll();
        const filtered = logs.filter(log => log.id !== id);
        return storage.set(STORAGE_KEYS.PRACTICE_LOGS, filtered);
    },

    getByDateRange(startDate, endDate) {
        const logs = this.getAll();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return logs.filter(log => {
            const logDate = new Date(log.date).getTime();
            return logDate >= start && logDate <= end;
        });
    },

    getRecent(count = 10) {
        const logs = this.getAll();
        return logs.slice(0, count);
    },

    getTotalPracticeTime() {
        const logs = this.getAll();
        return logs.reduce((total, log) => total + (log.duration || 0), 0);
    },

    getStats() {
        const logs = this.getAll();
        const totalTime = this.getTotalPracticeTime();
        const totalSessions = logs.length;
        const avgTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

        // 過去7日間の練習時間
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogs = this.getByDateRange(sevenDaysAgo, new Date());
        const weeklyTime = recentLogs.reduce((total, log) => total + (log.duration || 0), 0);

        return {
            totalTime,
            totalSessions,
            avgTime,
            weeklyTime,
            recentLogs: recentLogs.length
        };
    }
};

// APIキー管理
const ApiKey = {
    save(apiKey) {
        // 簡易的な暗号化（実際の本番環境ではより強固な暗号化が必要）
        const encoded = btoa(apiKey);
        return storage.set(STORAGE_KEYS.API_KEY, encoded);
    },

    get() {
        const encoded = storage.get(STORAGE_KEYS.API_KEY);
        if (!encoded) return null;
        try {
            return atob(encoded);
        } catch (error) {
            console.error('API key decode error:', error);
            return null;
        }
    },

    exists() {
        return this.get() !== null;
    },

    delete() {
        return storage.remove(STORAGE_KEYS.API_KEY);
    }
};

// 現在のフェーズ管理
const CurrentPhase = {
    save(phase) {
        return storage.set(STORAGE_KEYS.CURRENT_PHASE, {
            phase,
            updatedAt: new Date().toISOString()
        });
    },

    get() {
        const data = storage.get(STORAGE_KEYS.CURRENT_PHASE);
        return data ? data.phase : 1;
    },

    increment() {
        const current = this.get();
        return this.save(Math.min(current + 1, 4));
    },

    decrement() {
        const current = this.get();
        return this.save(Math.max(current - 1, 1));
    }
};

// 完了した練習項目管理
const CompletedItems = {
    getAll() {
        return storage.get(STORAGE_KEYS.COMPLETED_ITEMS, []);
    },

    add(itemId) {
        const items = this.getAll();
        if (!items.includes(itemId)) {
            items.push(itemId);
            return storage.set(STORAGE_KEYS.COMPLETED_ITEMS, items);
        }
        return false;
    },

    remove(itemId) {
        const items = this.getAll();
        const filtered = items.filter(id => id !== itemId);
        return storage.set(STORAGE_KEYS.COMPLETED_ITEMS, filtered);
    },

    toggle(itemId) {
        const items = this.getAll();
        if (items.includes(itemId)) {
            return this.remove(itemId);
        } else {
            return this.add(itemId);
        }
    },

    isCompleted(itemId) {
        return this.getAll().includes(itemId);
    },

    clear() {
        return storage.set(STORAGE_KEYS.COMPLETED_ITEMS, []);
    }
};

// ユーザー設定管理
const Preferences = {
    getAll() {
        return storage.get(STORAGE_KEYS.PREFERENCES, {
            theme: 'dark',
            notifications: true,
            language: 'ja'
        });
    },

    get(key) {
        const prefs = this.getAll();
        return prefs[key];
    },

    set(key, value) {
        const prefs = this.getAll();
        prefs[key] = value;
        return storage.set(STORAGE_KEYS.PREFERENCES, prefs);
    },

    update(updates) {
        const prefs = this.getAll();
        return storage.set(STORAGE_KEYS.PREFERENCES, { ...prefs, ...updates });
    }
};

// 達成バッジ管理
const Achievements = {
    getAll() {
        return storage.get(STORAGE_KEYS.ACHIEVEMENTS, []);
    },

    add(achievement) {
        const achievements = this.getAll();
        const newAchievement = {
            id: achievement.id || Date.now(),
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            earnedAt: new Date().toISOString()
        };
        
        // 重複チェック
        if (!achievements.find(a => a.id === newAchievement.id)) {
            achievements.push(newAchievement);
            return storage.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
        }
        return false;
    },

    has(achievementId) {
        const achievements = this.getAll();
        return achievements.some(a => a.id === achievementId);
    },

    getCount() {
        return this.getAll().length;
    }
};

// データのエクスポート
function exportData() {
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userProfile: UserProfile.get(),
        practiceLogs: PracticeLogs.getAll(),
        currentPhase: CurrentPhase.get(),
        completedItems: CompletedItems.getAll(),
        preferences: Preferences.getAll(),
        achievements: Achievements.getAll()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-recovery-backup-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// データのインポート
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (data.userProfile) UserProfile.save(data.userProfile);
        if (data.practiceLogs) storage.set(STORAGE_KEYS.PRACTICE_LOGS, data.practiceLogs);
        if (data.currentPhase) CurrentPhase.save(data.currentPhase);
        if (data.completedItems) storage.set(STORAGE_KEYS.COMPLETED_ITEMS, data.completedItems);
        if (data.preferences) storage.set(STORAGE_KEYS.PREFERENCES, data.preferences);
        if (data.achievements) storage.set(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
        
        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}

// すべてのデータをリセット
function resetAllData() {
    if (confirm('すべてのデータを削除してもよろしいですか？この操作は取り消せません。')) {
        storage.clear();
        showSuccess('すべてのデータがリセットされました');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        storage,
        StorageManager,
        UserProfile,
        PracticeLogs,
        ApiKey,
        CurrentPhase,
        CompletedItems,
        Preferences,
        Achievements,
        exportData,
        importData,
        resetAllData
    };
}

// Made with Bob
