const localId = document.getElementById('js-local-id');
const remoteId = document.getElementById('js-remote-id');
const connectTrigger = document.getElementById('js-connect-trigger');
const messages = document.getElementById('js-messages');
const localText = document.getElementById('js-local-text');
const sendTrigger = document.getElementById('js-send-trigger');

// peerの初期化
const peer = new Peer({key:"9cd593aa-0f67-4b67-a7be-901f72da7a67"});

// 接続した場合のハンドラ
connectTrigger.addEventListener('click', () => {
  if (!peer.open) {
    return;
  }

  // 相手と接続
  const dataConnection = peer.connect(remoteId.value);

  // 初期のメッセージ
  dataConnection.once('open', async () => {
    messages.textContent += `=== DataConnection has been opened ===\n`;
    // 送信イベントを追加
    sendTrigger.addEventListener('click', onClickSend);
  });

  // データ受信時の処理
  dataConnection.on('data', data => {
    messages.textContent += `Remote: ${data}\n`;
  });

  // データ送信のイベント
  function onClickSend() {
    const data = localText.value;
    // 送信
    dataConnection.send(data);
    messages.textContent += `You: ${data}\n`;
    localText.value = '';
  }
});

// 自分のIDを画面に表示する
peer.once('open', id => (localId.textContent = id));

// 接続された場合のハンドラ
peer.on('connection', dataConnection => {
  dataConnection.once('open', async () => {
    messages.textContent += `=== DataConnection has been opened ===\n`;
    // 送信イベントを追加
    sendTrigger.addEventListener('click', onClickSend);
  });

  // データ受信時の処理
  dataConnection.on('data', data => {
    messages.textContent += `Remote: ${data}\n`;
  });

  // データ送信のイベント
  function onClickSend() {
    const data = localText.value;
    // 送信
    dataConnection.send(data);
    messages.textContent += `You: ${data}\n`;
    localText.value = '';
  }
});

// エラーの場合
peer.on('error', console.error);