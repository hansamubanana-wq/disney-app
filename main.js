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

/* --- フィルターロジック --- */
let currentFilter = 'all';

function filterSchedule(type) {
    currentFilter = type;
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if(btn.textContent.toLowerCase().includes(type) || (type === 'attraction' && btn.textContent === 'Ride')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const cards = document.querySelectorAll('.timeline .time-card');
    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        if (type === 'all' || cardType === type) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    updateTimeStatus();
}

// 時間管理機能（＆ナビバー更新）
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
    let nextEventTitle = "Finish!";
    let nextEventTime = "";

    cards.forEach((card) => {
        if(card.classList.contains('completed') || card.classList.contains('hidden')) return;

        const timeStr = card.getAttribute('data-time');
        const [h, m] = timeStr.split(':').map(Number);
        const cardTimeVal = h * 60 + m;
        const eventName = card.querySelector('.event').textContent;

        if (currentTimeVal > cardTimeVal + 30) {
            card.classList.add('past');
        } 
        else if (!foundCurrent) {
            card.classList.add('current');
            foundCurrent = true;
            nextEventTitle = eventName;
            nextEventTime = timeStr;
        }
    });

    const navBar = document.getElementById('sticky-nav');
    const navTitle = document.getElementById('nav-title');
    const navTime = document.getElementById('nav-time');

    if (foundCurrent) {
        navBar.classList.add('visible');
        navTitle.textContent = nextEventTitle;
        navTime.textContent = nextEventTime;
    } else {
        navBar.classList.add('visible');
        navTitle.textContent = "All Schedules Completed";
        navTime.textContent = "Good Night";
    }
}

// 完了切り替え＆演出
function toggleComplete(card, id, event) {
    card.classList.toggle('completed');
    saveCompletionStatus();
    updateTimeStatus();
    
    // 振動
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    // ★★★ ここを追加：完了時にその場所から紙吹雪！ ★★★
    if (card.classList.contains('completed')) {
        // クリック位置を取得（スマホのタッチ対応）
        let x = 0.5;
        let y = 0.5;
        
        if (event) {
            // 画面に対する相対座標(0.0〜1.0)に変換
            x = event.clientX / window.innerWidth;
            y = event.clientY / window.innerHeight;
        }

        // 紙吹雪発射
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: x, y: y },
            colors: ['#FFD700', '#FFFFFF', '#87CEFA'], // 金・白・青
            disableForReducedMotion: true,
            zIndex: 9999,
            scalar: 0.8 // 少し小さめ
        });
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

/* --- キラキラ演出（背景タップ時） --- */
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    
    const size = Math.random() * 6 + 4; 
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    const colors = ['#FFD700', '#FFFFFF', '#87CEFA', '#FFB6C1', '#E6E6FA'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.backgroundColor = randomColor;
    sparkle.style.boxShadow = `0 0 10px ${randomColor}`;

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}


// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    // 1. スプラッシュ画面
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 1000);
        }
    }, 3000);

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
        card.addEventListener('click', (event) => {
            toggleComplete(card, index, event); // eventを渡すように変更
        });
    });

    // 5. スクロール監視
    const scrollTriggers = document.querySelectorAll('.scroll-trigger');
    scrollTriggers.forEach(el => observer.observe(el));

    // キラキライベント（カード以外の場所をクリックした時用）
    document.addEventListener('click', (e) => {
        // カードをクリックした時はtoggleCompleteが発火するので、ここでは何もしない判定を入れるとより良いが、
        // 重なっても綺麗なのでそのままキラキラも出す
        createSparkle(e.pageX, e.pageY);
    });
});

/* --- 隠し花火 --- */
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