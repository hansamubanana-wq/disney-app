// スクロールアニメーション監視用
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // 10%見えたらアニメーション開始
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 一度表示されたら監視をやめる（パフォーマンス向上）
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function switchTab(tabName) {
    const contents = document.querySelectorAll('.content-area');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');

    const activeBtn = Array.from(buttons).find(btn => btn.onclick.toString().includes(tabName));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// リアルタイム時計更新
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('realtime-clock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}`;
    }
}

// 時間管理機能
function updateTimeStatus() {
    const now = new Date();
    // now.setHours(10, 00); // デバッグ用

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    const cards = document.querySelectorAll('.time-card[data-time]');
    
    cards.forEach(card => {
        card.classList.remove('past', 'current');
    });

    let foundCurrent = false;

    cards.forEach((card) => {
        if(card.classList.contains('completed')) return;

        const timeStr = card.getAttribute('data-time');
        const [h, m] = timeStr.split(':').map(Number);
        const cardTimeVal = h * 60 + m;

        if (currentTimeVal > cardTimeVal + 30) {
            card.classList.add('past');
        } 
        else if (!foundCurrent) {
            card.classList.add('current');
            foundCurrent = true;
        }
    });
}

function toggleComplete(card, id) {
    card.classList.toggle('completed');
    saveCompletionStatus();
    updateTimeStatus();
    
    // 完了時に一瞬振動させる（スマホでのフィードバック）
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function saveCompletionStatus() {
    const completedIndices = [];
    const cards = document.querySelectorAll('.time-card');
    cards.forEach((card, index) => {
        if (card.classList.contains('completed')) {
            completedIndices.push(index);
        }
    });
    localStorage.setItem('disneyAppCompleted', JSON.stringify(completedIndices));
}

function loadCompletionStatus() {
    const saved = localStorage.getItem('disneyAppCompleted');
    if (saved) {
        const completedIndices = JSON.parse(saved);
        const cards = document.querySelectorAll('.time-card');
        completedIndices.forEach(index => {
            if (cards[index]) {
                cards[index].classList.add('completed');
            }
        });
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    // 1. スプラッシュ画面を2秒後に消す
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.classList.add('hidden');
            // アニメーション完了後に要素を完全に消す（誤操作防止）
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }
    }, 1500); // 1.5秒表示

    // 2. 完了データの復元
    loadCompletionStatus();

    // 3. 時間の更新開始
    updateTimeStatus();
    updateClock();
    setInterval(() => {
        updateTimeStatus();
        updateClock();
    }, 60000); // 1分更新（時間は秒まで表示しないのでこれでOK）

    // 4. クリックイベント
    const cards = document.querySelectorAll('.time-card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            toggleComplete(card, index);
        });
    });

    // 5. スクロール監視の開始
    const scrollTriggers = document.querySelectorAll('.scroll-trigger');
    scrollTriggers.forEach(el => observer.observe(el));
});