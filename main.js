function switchTab(tabName) {
    // すべてのコンテンツを非表示にする
    const contents = document.querySelectorAll('.content-area');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // すべてのタブボタンの選択状態を解除する
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 選択されたコンテンツを表示する
    document.getElementById(tabName).classList.add('active');

    // 押されたボタンを選択状態にする
    // event.currentTarget はクリックされた要素自身を指します
    const activeBtn = Array.from(buttons).find(btn => btn.onclick.toString().includes(tabName));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}