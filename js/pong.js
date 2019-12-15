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
			width: 40,
			height: 40,
			x: (this.canvas.width / 2) - 9,
			y: (this.canvas.height / 2) - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 18
		};
	}
};

// The paddle object (The two lines that move up and down)
var Paddle = {
	new: function (side) {
		return {
			width: 15,
			height: 110,
			x: side === 'left' ? 238 : this.canvas.width - 150,
			y: (this.canvas.height / 2) - 50,
			score: 0,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: 10,
			speedX: 10,
			speedY: 10
		};
	}
};

var Game = {
	initialize: function () {
		this.canvas = document.getElementById('pong');
		this.context = this.canvas.getContext('2d');

		this.canvas.width = 1400;
		this.canvas.height = 700;

		// this.canvas.style.width = (this.canvas.width / 2) + 'px';
		// this.canvas.style.height = (this.canvas.height / 2) + 'px';
		// this.canvas.style.width = this.canvas.width + 'px';
		// this.canvas.style.height = this.canvas.height + 'px';
		this.canvas.style.width = '1100px';
		this.canvas.style.height = '550px';


		this.player = Paddle.new.call(this, 'left'); // プレイヤーパドルの初期化
		this.paddle = Paddle.new.call(this, 'right'); // AIパドルの初期化
		this.ball = Ball.new.call(this);

		this.paddle.speed = 8;
		this.running = this.over = false;
		this.turn = this.paddle;
		this.timer = this.round = 0;
		this.color = '#19083B';
		this.beatCount = 0;
		this.bpm = 180;
		this.soundQueue = [];
		this.kick = selectSounds(kicks);
		this.fill = selectSounds(fills);

		for (let key in Sounds) {
		  this.setPlaybackRate(Sounds[key]);
    }

		Pong.menu(); // レディ
		Pong.listen(); // リッスン
	},

  setPlayerY: function (y) {
    if (this.player) {
      const curY = (this.player.y - this.canvas.height * 0.5) * (100 / (this.canvas.height * 0.5));
      let handY = y;
      if (handY > 100) handY = 100;
      if (handY < -100) handY = -100;
      const diffY = handY - curY
      console.log("Player Y Updated");
      let speed = diffY / 4
      if (diffY > 5) {
        this.player.moveY = DIRECTION.DOWN;
        this.player.speedY = speed;
      }
      else if (diffY < -5) {
        this.player.moveY = DIRECTION.UP;
        this.player.speedY = -speed;
      }
      else {
        this.player.moveY = DIRECTION.IDLE;
      }
    }
  },

  setPlayerX: function (x) {
    if (this.player) {
      const curX = (this.player.x - this.canvas.width * 0.25) * (100 / (this.canvas.width * 0.25));
      let handX = x * 0.7;
      if (handX > 100) handX = 100;
      if (handX < -100) handX = -100;
      const diffX = handX - curX
      console.log("Player X Updated");
      let speed = diffX / 4
      if (diffX < -5) {
        this.player.moveX = DIRECTION.LEFT;
        this.player.speedX = -speed;
      }
      else if (diffX > 5) {
        this.player.moveX = DIRECTION.RIGHT;
        this.player.speedX = speed;
      }
      else {
        this.player.moveX = DIRECTION.IDLE;
      }
    }
  },

  setPlayerW: function (w) {
    if (this.player) {
      console.log("Player W Updated");
      let width = w * 0.1;
      this.player.width = width > 15 ? width : 15;
    }
  },

  setPlayerH: function (h) {
    if (this.player) {
      console.log("Player H Updated");
      let height = h - 100;
      this.player.height = height > 110 ? height : 110;
    }
  },

  convertRangeX: (curPos, width) => {
    let convertedWidth = curPos * width / (this.canvas.width * 0.8);
    console.log("convertedWidth: " + convertedWidth);
    return convertedWidth;
  },

  convertRangeY: (curPos, height) => {
    let convertedHeight = curPos * height / (this.canvas.height * 0.5);
    console.log("convertedHeight: " + convertedHeight);
    return convertedHeight;
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

    // 画像読み込み
    let img = new Image();
    img.src = "image/hand.svg";
    let scale = 450;
    const setImage = () => {
      this.context.drawImage(img, 20, 130, scale, scale);  //400x300に縮小表示
    };
    img.onload = () => {
      setImage();
    };

		// // Change the canvas font size and color
		// this.context.font = '50px Courier New';
		// this.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		// this.context.fillRect(
		// 	this.canvas.width / 2 - 350,
		// 	this.canvas.height / 2 - 48,
		// 	700,
		// 	100
		// );

		// Change the canvas color;
		this.context.fillStyle = '#ffffff';

		// // Draw the 'press any key to begin' text
		// this.context.fillText('Press any key to begin',
		// 	this.canvas.width / 2,
		// 	this.canvas.height / 2 + 15
		// );
	},

  playLoopGrid: function(loopGrid) {
    let length_x = loopGrid.length;
    let length_y = loopGrid[0].length;
    let x = Math.floor(this.player.x / this.canvas.width / 2 * length_x);
    let y = Math.floor(this.player.y / this.canvas.height * length_y);
    console.log("x: " + x + "y: " + y);
    if (x < 0 || y < 0){
      return
    }
    let selectedGrid = loopGrid[x][y];

    this.soundQueue.push(selectedGrid);
  },

  playSoundGrid: function(soundGrid) {
	  let rand = Math.floor( Math.random() * 2 );
	  if (rand === 1){
	    let length = soundGrid.length;
	    let x = Math.floor(this.ball.x / this.canvas.width * length);
	    let y = Math.floor(this.ball.y / this.canvas.height * length);
	    console.log("x: " + x + "y: " + y);
	    if (x < 0 || y < 0){
	      return
      }
      let selectedGrid = soundGrid[x][y];

	    selectedGrid.play();
    }
  },

  setPlaybackRate: function(audio) {
    if (audio.bpm === -1){
      return
    }
    audio.setRate(this.bpm/audio.bpm);
  },

  playSong: function() {
	  // playkick
    if (this.checkBpm(1)) {
      this.kick.play();
    }
    if (this.checkBpm(this.fill.duration, this.fill.offset)){
      let rand = Math.floor( Math.random() * 3 );
      if (rand === 1) {
        this.fill.play();
      }
    }
    if (this.checkBpm(2)) {
      this.playSoundGrid(soundGrid);
    }
    if (this.soundQueue.length > 0 && this.checkBpm(this.soundQueue[0].duration, this.soundQueue[0].offset)) {
      this.soundQueue[0].play();
      this.soundQueue.shift();
    }

    this.beatCount++;
  },

  // beat: 何拍鳴らすか
  // offset: 何拍ずらすか(1拍単位)
  checkBpm: function(duration, offset=0) {
	  // 1拍あたりのframe数
    let fpb = Math.floor(3600 / this.bpm);
    // 指定されたdurationあたりのframe数
	  let curBeat = Math.floor(fpb * duration);
	  return (this.beatCount + offset * fpb)  % curBeat  === 0
  },

	// オブジェクトのアップデート (プレイヤー, パドル, ボールの移動, スコアの加点など)
	update: function () {
	  this.playSong();
		if (!this.over) {
			// ボールのバウンド制御
			// if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
			// if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
			if (this.ball.x <= 0) {
        this.ball.moveX = DIRECTION.RIGHT;
      }
			if (this.ball.x >= this.canvas.width - this.ball.width) {
        this.ball.moveX = DIRECTION.LEFT;
      }
			if (this.ball.y <= 0) {
        this.ball.moveY = DIRECTION.DOWN;
        this.soundQueue.push(selectSounds(drums_base));
      }
			if (this.ball.y >= this.canvas.height - this.ball.height) {
        this.ball.moveY = DIRECTION.UP;
        this.soundQueue.push(selectSounds(drums_base));
      }

			// プレイヤーを動かす（キーボード入力に反応）
			if (this.player.moveY === DIRECTION.UP) {
        this.player.y -= this.player.speedY;
      }
			else if (this.player.moveY === DIRECTION.DOWN) {
        this.player.y += this.player.speedY;
      }
			if (this.player.moveX === DIRECTION.RIGHT) {
        this.player.x += this.player.speedX;
      }
			else if (this.player.moveX === DIRECTION.LEFT) {
        this.player.x -= this.player.speedX;
      }

      // ボールの再投下
			if (Pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT; // 負けたほう側へ投下
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())]; // 上下ランダム
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200; // yはランダム
        this.turn = null;
			}

      // プレイヤーが画面外へ行かないように制御
			if (this.player.y <= 0) this.player.y = 0;
      else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
      if (this.player.x <= 0) this.player.x = 0;
      else if (this.player.x >= (this.canvas.width * 0.5 - this.player.width)) this.player.x = (this.canvas.width * 0.5 - this.player.width);

			// Move ball in intended direction based on moveY and moveX values
			if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
			else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
			if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
			else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

			// Handle paddle (AI) UP and DOWN movement
			if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed * 1.5;
				else this.paddle.y -= this.paddle.speed / 4;
			}
			if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed * 1.5;
				else this.paddle.y += this.paddle.speed / 4;
			}

			// バドル (AI) が画面外へ行かないように制御
			if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
			else if (this.paddle.y <= 0) this.paddle.y = 0;

			// プレイヤーとボールの衝突制御
			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.x = (this.player.x + this.ball.width);
					this.ball.moveX = DIRECTION.RIGHT;
          this.playLoopGrid(loopGrid);
					selectSounds(voices).play();
				}
			}

			// パドル（AI）とボールとの衝突制御
			if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
				if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
					this.ball.x = (this.paddle.x - this.ball.width);
					this.ball.moveX = DIRECTION.LEFT;


          this.soundQueue.push(selectSounds(drums_all));
				}
			}
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

				beep3.play();
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

    this.context.strokeStyle = '#00E8E2';
		this.context.lineWidth = 10;
		this.context.beginPath();
    this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.closePath();

		// Set the fill style to white (For the paddles and the ball)
		this.context.fillStyle = '#FF40D7';

		// Draw the Player
		this.context.fillRect(
			this.player.x,
			this.player.y,
			this.player.width,
			this.player.height
		);

		// Set the fill style to white (For the paddles and the ball)
		this.context.fillStyle = '#637A95';

		// Draw the Paddle
		this.context.fillRect(
			this.paddle.x,
			this.paddle.y,
			this.paddle.width,
			this.paddle.height
		);

		// Draw the Ball
		if (Pong._turnDelayIsOver.call(this)) {
      if (this.ball.moveX === DIRECTION.RIGHT) {
        this.context.fillStyle = '#FF40D7';
      }
      else if (this.ball.moveX === DIRECTION.LEFT) {
        this.context.fillStyle = '#FFFFFF';
      }
      else {
        this.context.fillStyle = "rgba(" + [0, 0, 255, 0] + ")";
      }

      // 円の中心座標: (100,100)
      // 半径: 50
      // 開始角度: 0度 (0 * Math.PI / 180)
      // 終了角度: 360度 (360 * Math.PI / 180)
      // 方向: true=反時計回りの円、false=時計回りの円
      this.context.beginPath();
      this.context.arc(
        this.ball.x,
        this.ball.y,
        this.ball.width * 0.5,
        0 * Math.PI / 180,
        360 * Math.PI / 180,
        false
      );
      this.context.fill();
      this.context.closePath();

			// this.context.fillRect(
      //   this.ball.x,
      //   this.ball.y,
      //   this.ball.width,
      //   this.ball.height
      // );

      this.context.fillStyle = '#FFFFFF';
		}

		// Draw the net (Line in the middle)
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height);
		this.context.lineTo((this.canvas.width / 2), 0);
		this.context.lineWidth = 3;
		this.context.strokeStyle = '#14C9FF';
    this.context.stroke();
    this.context.setLineDash([]);
		this.context.closePath();

		// Set the default canvas font and align it to the center
		this.context.font = '100px Courier New';
		this.context.textAlign = 'center';

		// Draw the players score (left)
		// this.context.fillText(
		// 	this.player.score.toString(),
		// 	(this.canvas.width / 2) - 300,
		// 	200
		// );

		// Draw the paddles score (right)
		// this.context.fillText(
		// 	this.paddle.score.toString(),
		// 	(this.canvas.width / 2) + 300,
		// 	200
		// );

		// Change the font size for the center score text
		this.context.font = '30px Courier New';

		// Draw the winning score (center)
		// this.context.fillText(
		// 	'Round ' + (Pong.round + 1),
		// 	(this.canvas.width / 2),
		// 	35
		// );

		// Change the font size for the center score value
		this.context.font = '40px Courier';

		// Draw the current round number
		// this.context.fillText(
		// 	rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
		// 	(this.canvas.width / 2),
		// 	100
		// );
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
			// 上矢印 or w キーでプレイヤーを上移動
			if (key.keyCode === 38 || key.keyCode === 87) {
        Pong.player.moveY = DIRECTION.UP;
      }

			// 下矢印 or s キーでプレイヤーを下移動
			if (key.keyCode === 40 || key.keyCode === 83) {
        Pong.player.moveY = DIRECTION.DOWN;
      }
		});

		// キーを押してなかったらプレイヤーの動きを停止
		document.addEventListener('keyup', function (key) {
      Pong.player.moveX = DIRECTION.IDLE;
      Pong.player.moveY = DIRECTION.IDLE;
    });
	},

	// Reset the ball location, the player turns and set a delay before the next round begins.
	_resetTurn: function(victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();

		victor.score++;
		beep2.play();
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
