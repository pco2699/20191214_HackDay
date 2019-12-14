/////////////////////////////// skyway /////////////////////////////////////
const localId = document.getElementById('js-local-id');
const remoteId = document.getElementById('js-remote-id');
const isConnected = document.getElementById('js-is-connected');
const connectTrigger = document.getElementById('js-connect-trigger');

// peerの初期化
const peer = (window.peer = new Peer({key:"9cd593aa-0f67-4b67-a7be-901f72da7a67"}));

// ホスト or ゲスト
let host = false;

// dataConnection
let dataConnection;

// 接続中のフラグ
let connected = false;

// 接続した場合のハンドラ
connectTrigger.addEventListener('click', () => {
  if (!peer.open) {
    return;
  }

  // 相手と接続
  dataConnection = peer.connect(remoteId.value);

  // 初期のメッセージ
  dataConnection.once('open', async () => {
    isConnected.textContent = "connected. you are host."
    // 接続中フラグを立てる
    connected = true;
    // ホストフラグを立てる
    host = true;
  });

  // データ受信時の処理
  dataConnection.on('data', data => {
    Pong.paddle.y = data;
    if (data.name == "update") {
      Pong.paddle.y = data.paddleY;
      if (!host) {
        console.log(data.ballX);
        Pong.ball.x = 1400 - data.ballX;
        Pong.ball.y = data.ballY;
      }
    }
    if (data == "start") {
      if (Pong.running === false) {
        if (connected) {
          Pong.running = true;
          window.requestAnimationFrame(Pong.loop);
        }
      }
    }
    if (data.name == "ball") {
      Pong.ball.moveX = data.moveX;
      Pong.ball.moveY = data.moveY;
      Pong.ball.y = data.y;
      Pong.turn = null;
    }
  });
});

// 自分のIDを画面に表示する
peer.once('open', id => (localId.textContent = id));

// 接続された場合のハンドラ
peer.on('connection', dc => {
  dataConnection = dc;
  dataConnection.once('open', async () => {
    isConnected.textContent = "connected. you are guest."
    // 接続中フラグを立てる
    connected = true;
  });

  // データ受信時の処理
  dataConnection.on('data', data => {
    Pong.paddle.y = data;
    if (data.name == "update") {
      Pong.paddle.y = data.paddleY;
      if (!host) {
        Pong.ball.x = 1400 - data.ballX;
        Pong.ball.y = data.ballY;
      }
    }
    if (data == "start") {
      if (Pong.running === false) {
        if (connected) {
          Pong.running = true;
          window.requestAnimationFrame(Pong.loop);
        }
      }
    }
    if (data.name == "ball") {
      Pong.ball.moveX = data.moveX;
      Pong.ball.moveY = data.moveY;
      Pong.ball.y = data.y;
      Pong.turn = null;
    }
  });
});

// エラーの場合
peer.on('error', console.error);

/////////////////////////////// skyway /////////////////////////////////////

// Global Variables
var DIRECTION = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};

var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
var Ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: (this.canvas.width / 2) - 9,
			y: (this.canvas.height / 2) - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 9
		};
	}
};

// The paddle object (The two lines that move up and down)
var Paddle = {
	new: function (side) {
		return {
			width: 18,
			height: 70,
			x: side === 'left' ? 150 : this.canvas.width - 150,
			y: (this.canvas.height / 2) - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 10
		};
	}
};

var Game = {
	initialize: function () {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');

		this.canvas.width = 1400;
		this.canvas.height = 1000;

		this.canvas.style.width = (this.canvas.width / 2) + 'px';
		this.canvas.style.height = (this.canvas.height / 2) + 'px';

		this.player = Paddle.new.call(this, 'left'); // プレイヤーパドルの初期化
		this.paddle = Paddle.new.call(this, 'right'); // AIパドルの初期化
		this.ball = Ball.new.call(this);

		this.paddle.speed = 8;
		this.running = this.over = false;
		this.turn = this.paddle;
		this.timer = this.round = 0;
		this.color = '#2c3e50';

		Pong.menu(); // レディ
		Pong.listen(); // リッスン
	},

  // ゲーム終了時
	endGameMenu: function (text) {
		// Change the canvas font size and color
		Pong.context.font = '50px Courier New';
		Pong.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		Pong.context.fillRect(
			Pong.canvas.width / 2 - 350,
			Pong.canvas.height / 2 - 48,
			700,
			100
		);

		// Change the canvas color;
		Pong.context.fillStyle = '#ffffff';

		// Draw the end game menu text ('Game Over' and 'Winner')
		Pong.context.fillText(text,
			Pong.canvas.width / 2,
			Pong.canvas.height / 2 + 15
		);

		setTimeout(function () {
			Pong = Object.assign({}, Game);
			Pong.initialize();
		}, 3000);
	},

  // スタート時
	menu: function () {
		// Draw all the Pong objects in their current state
		Pong.draw();

		// Change the canvas font size and color
		this.context.font = '50px Courier New';
		this.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);

		// Change the canvas color;
		this.context.fillStyle = '#ffffff';

		// Draw the 'press any key to begin' text
		this.context.fillText('Press any key to begin',
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

	// オブジェクトのアップデート (プレイヤー, パドル, ボールの移動, スコアの加点など)
	update: function () {
		if (!this.over) {
			// ボールのバウンド制御
			if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
			if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

			// プレイヤーを動かす（キーボード入力に反応）
			if (this.player.move === DIRECTION.UP) {
        this.player.y -= this.player.speed;
      }
			else if (this.player.move === DIRECTION.DOWN) {
        this.player.y += this.player.speed;
      }

      // ボールの再投下
			if (Pong._turnDelayIsOver.call(this) && this.turn && host) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT; // 負けたほう側へ投下
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())]; // 上下ランダム
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200; // yはランダム
        this.turn = null;
			}

      // プレイヤーが画面外へ行かないように制御
			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

      // ボールの位置のアップデート
      if (host) {
        if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
        else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
        if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
        else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
      }

      // パドル (AI) の移動の制御
			// if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
			// 	if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
			// 	else this.paddle.y -= this.paddle.speed / 4;
			// }
			// if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
			// 	if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
			// 	else this.paddle.y += this.paddle.speed / 4;
			// }

			// バドル (AI) が画面外へ行かないように制御
			if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
			else if (this.paddle.y <= 0) this.paddle.y = 0;

			// プレイヤーとボールの衝突制御
			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.x = (this.player.x + this.ball.width);
					this.ball.moveX = DIRECTION.RIGHT;
				}
			}

			// パドル（AI）とボールとの衝突制御
			if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
				if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
					this.ball.x = (this.paddle.x - this.ball.width);
					this.ball.moveX = DIRECTION.LEFT;
				}
      }
      
      const sendData = {
        name: "update",
        paddleY: this.player.y,
        ballX: this.ball.x,
        ballY: this.ball.y
      }
      dataConnection.send(sendData);
		}

		// Handle the end of round transition
    // プレイヤーが勝った場合
		if (this.player.score === rounds[this.round]) {
			// Check to see if there are any more rounds/levels left and display the victory screen if
			// there are not.
			if (!rounds[this.round + 1]) {
				this.over = true;
				setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
			} else {
				// If there is another round, reset all the values and increment the round number.
				this.color = this._generateRoundColor();
				this.player.score = this.paddle.score = 0;
				this.player.speed += 0.5;
				this.paddle.speed += 1;
				this.ball.speed += 1;
				this.round += 1;
			}
		}
    // パドル（AI）が勝った場合
		else if (this.paddle.score === rounds[this.round]) {
			this.over = true;
			setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
		}
	},

	// 描画
	draw: function () {
		// Clear the Canvas
		this.context.clearRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Set the fill style to black
		this.context.fillStyle = this.color;

		// Draw the background
		this.context.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Set the fill style to white (For the paddles and the ball)
		this.context.fillStyle = '#ffffff';

		// Draw the Player
		this.context.fillRect(
			this.player.x,
			this.player.y,
			this.player.width,
			this.player.height
		);

		// Draw the Paddle
		this.context.fillRect(
			this.paddle.x,
			this.paddle.y,
			this.paddle.width,
			this.paddle.height
		);

		// Draw the Ball
		if (Pong._turnDelayIsOver.call(this)) {
			this.context.fillRect(
				this.ball.x,
				this.ball.y,
				this.ball.width,
				this.ball.height
			);
		}

		// Draw the net (Line in the middle)
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
		this.context.lineTo((this.canvas.width / 2), 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = '#ffffff';
		this.context.stroke();

		// Set the default canvas font and align it to the center
		this.context.font = '100px Courier New';
		this.context.textAlign = 'center';

		// Draw the players score (left)
		this.context.fillText(
			this.player.score.toString(),
			(this.canvas.width / 2) - 300,
			200
		);

		// Draw the paddles score (right)
		this.context.fillText(
			this.paddle.score.toString(),
			(this.canvas.width / 2) + 300,
			200
		);

		// Change the font size for the center score text
		this.context.font = '30px Courier New';

		// Draw the winning score (center)
		this.context.fillText(
			'Round ' + (Pong.round + 1),
			(this.canvas.width / 2),
			35
		);

		// Change the font size for the center score value
		this.context.font = '40px Courier';

		// Draw the current round number
		this.context.fillText(
			rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
			(this.canvas.width / 2),
			100
		);
  },

  // アップデートのループ
	loop: function () {
		Pong.update();
    Pong.draw();

		// If the game is not over, draw the next frame.
		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},

  // リッスン
	listen: function () {
		document.addEventListener('keydown', function (key) {
      // ゲーム開始
			if (Pong.running === false) {
        if (connected) {
          dataConnection.send("start");
          Pong.running = true;
          window.requestAnimationFrame(Pong.loop);
        }
			}

			// 上矢印 or w キーでプレイヤーを上移動
			if (key.keyCode === 38 || key.keyCode === 87) {
        Pong.player.move = DIRECTION.UP;
      }

			// 下矢印 or s キーでプレイヤーを下移動
			if (key.keyCode === 40 || key.keyCode === 83) {
        Pong.player.move = DIRECTION.DOWN;
      }
		});

		// キーを押してなかったらプレイヤーの動きを停止
		document.addEventListener('keyup', function (key) {
      Pong.player.move = DIRECTION.IDLE;
    });
	},

	// Reset the ball location, the player turns and set a delay before the next round begins.
	_resetTurn: function(victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();

		victor.score++;
	},

	// Wait for a delay to have passed after each turn.
	_turnDelayIsOver: function() {
		return ((new Date()).getTime() - this.timer >= 1000);
	},

	// Select a random color as the background of each level/round.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	}
};

var Pong = Object.assign({}, Game);
Pong.initialize();