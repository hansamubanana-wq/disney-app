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

// 時間管理機能（＆ナビバー更新）
function updateTimeStatus() {
    const now = new Date();
    // デバッグ時はここを解除
    // now.setHours(10, 00); 
    
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
        // 完了済みはスキップして次を探す
        if(card.classList.contains('completed')) return;

        const timeStr = card.getAttribute('data-time');
        const [h, m] = timeStr.split(':').map(Number);
        const cardTimeVal = h * 60 + m;
        const eventName = card.querySelector('.event').textContent;

        if (currentTimeVal > cardTimeVal + 30) {
            // 30分以上過ぎたイベント
            card.classList.add('past');
        } 
        else if (!foundCurrent) {
            // これが「今」または「次」のイベント！
            card.classList.add('current');
            foundCurrent = true;
            
            // ナビバーに表示する内容をセット
            nextEventTitle = eventName;
            nextEventTime = timeStr;
        }
    });

    // ナビバーの更新
    const navBar = document.getElementById('sticky-nav');
    const navTitle = document.getElementById('nav-title');
    const navTime = document.getElementById('nav-time');

    if (foundCurrent) {
        navBar.classList.add('visible');
        navTitle.textContent = nextEventTitle;
        navTime.textContent = nextEventTime;
    } else {
        // 全部終わったら隠すか、「Finish」を表示
        navBar.classList.add('visible');
        navTitle.textContent = "All Schedules Completed";
        navTime.textContent = "Good Night";
    }
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

/* --- キラキラ演出 --- */
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
        card.addEventListener('click', () => {
            toggleComplete(card, index);
        });
    });

    // 5. スクロール監視
    const scrollTriggers = document.querySelectorAll('.scroll-trigger');
    scrollTriggers.forEach(el => observer.observe(el));

    // キラキライベント
    document.addEventListener('click', (e) => {
        createSparkle(e.pageX, e.pageY);
        setTimeout(() => createSparkle(e.pageX + (Math.random()*30-15), e.pageY + (Math.random()*30-15)), 100);
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