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
    // デバッグ用: 今の時間を変えたいときはここをいじる
    // now.setHours(10, 00); 

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    const cards = document.querySelectorAll('.time-card[data-time]');
    
    // 一度すべてのクラスをリセット
    cards.forEach(card => {
        card.classList.remove('past', 'current');
    });

    let foundCurrent = false;

    cards.forEach((card, index) => {
        const timeStr = card.getAttribute('data-time');
        const [h, m] = timeStr.split(':').map(Number);
        const cardTimeVal = h * 60 + m;

        // 過去のイベント判定（30分以上経過したら過去とする）
        if (currentTimeVal > cardTimeVal + 30) {
            card.classList.add('past');
        } 
        // 現在進行形の判定（まだpastじゃなくて、最初に見つかったもの）
        else if (!foundCurrent) {
            card.classList.add('current');
            foundCurrent = true;
        }
    });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    updateTimeStatus();
    // 1分ごとに更新
    setInterval(updateTimeStatus, 60000);
});