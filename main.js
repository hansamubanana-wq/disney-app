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

// 時間管理機能
function updateTimeStatus() {
    const now = new Date();
    // デバッグ用: 時間を変えたい場合はここをいじる
    // now.setHours(10, 00); 

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    const cards = document.querySelectorAll('.time-card[data-time]');
    
    // 完了済みのものは時間管理のスタイル（past/current）を適用しないように制御するため
    // ここでは単純にpast/currentのリセットだけ行う
    cards.forEach(card => {
        card.classList.remove('past', 'current');
    });

    let foundCurrent = false;

    cards.forEach((card, index) => {
        // すでに完了(completed)しているものは、時間判定をスキップしてOK
        // （完了スタイルを優先するため）
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

// 完了状態の切り替えと保存
function toggleComplete(card, id) {
    // 完了クラスを付け外し（トグル）
    card.classList.toggle('completed');

    // 完了リストを保存
    saveCompletionStatus();

    // 時間スタイルを再計算（完了したものをcurrentから外すため）
    updateTimeStatus();
}

// LocalStorageに保存する
function saveCompletionStatus() {
    const completedIndices = [];
    const cards = document.querySelectorAll('.time-card');
    
    cards.forEach((card, index) => {
        if (card.classList.contains('completed')) {
            completedIndices.push(index);
        }
    });

    // 配列を文字列にして保存
    localStorage.setItem('disneyAppCompleted', JSON.stringify(completedIndices));
}

// LocalStorageから読み込む
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

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // 1. 保存されたデータを復元
    loadCompletionStatus();

    // 2. 時間の表示を更新
    updateTimeStatus();
    setInterval(updateTimeStatus, 60000);

    // 3. クリックイベントを全カードに付与
    const cards = document.querySelectorAll('.time-card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            toggleComplete(card, index);
        });
    });
});