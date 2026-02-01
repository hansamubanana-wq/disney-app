// スクロールアニメーション監視用
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
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
    // 1. スプラッシュ画面を長めに表示（名前を読ませるため3秒に変更）
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 800); // フェードアウトの時間に合わせる
        }
    }, 3000); // ★ここを3秒に変更しました

    // 2. 完了データの復元
    loadCompletionStatus();

    // 3. 時間の更新開始
    updateTimeStatus();
    updateClock();
    setInterval(() => {
        updateTimeStatus();
        updateClock();
    }, 60000);

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

/* --- 最後の魔法：隠し花火機能 --- */
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.app-header h1');
    let clickCount = 0;
    let clickTimer = null;

    if (title) {
        title.style.cursor = 'default';
        title.style.userSelect = 'none';

        title.addEventListener('click', (e) => {
            title.style.transform = 'scale(0.95)';
            setTimeout(() => title.style.transform = 'scale(1)', 100);

            clickCount++;

            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);

            if (clickCount === 5) {
                launchFireworks();
                clickCount = 0;
            }
        });
    }
});

function launchFireworks() {
    const duration = 3000; 
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}