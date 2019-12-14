const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const video = document.getElementById("myvideo");
const updateNote = document.getElementById("text");

const logo = document.getElementById("js-dansepong-logo");

const xNote = document.getElementsByClassName("x")[0];
const yNote = document.getElementsByClassName("y")[0];
const widthNote = document.getElementsByClassName("width")[0];
const heightNote = document.getElementsByClassName("height")[0];
const convertWNote = document.getElementsByClassName("convert-w")[0];
const convertHNote = document.getElementsByClassName("convert-h")[0];

let audioContext = null;
let oscillator = null;
let model = null;
let isVideo = false;
let soundStart = false;
let videoInterval = 100;

const modelParams = {
  flipHorizontal: true,   // flip e.g for video
  maxNumBoxes: 1,        // maximum number of boxes to detect
  iouThreshold: 0.5,      // ioU threshold for non-max suppression
  scoreThreshold: 0.85,    // confidence threshold for predictions.
};

window.addEventListener('DOMContentLoaded', () => {
  (async () => {
    // Load the model.
    model = await handTrack.load(modelParams);
    startVideo();
  })();
});


const startVideo = async () => {
  const status = await handTrack.startVideo(video);
  console.log("video started", status);
  if (status) {
    updateNote.innerText = "Video started. Now tracking";
    isVideo = true;
    await runDetection();
  } else {
    updateNote.innerText = "Please enable video";
  }
};

const readySound = async () => {
  audioContext = new AudioContext();
};

const startSound = async (y) => {
  if (!soundStart && audioContext) {
    oscillator = audioContext.createOscillator();
    oscillator.frequency.setTargetAtTime(calculateFrequency(y), audioContext.currentTime, 0.01);
    oscillator.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    soundStart = true;
  } else if (audioContext) {
    oscillator.frequency.setTargetAtTime(calculateFrequency(y), audioContext.currentTime, 0.01);
  } else {
    await readySound();
  }
};

const stopSound = () => {
  if (audioContext) {
    oscillator.stop(audioContext.currentTime);
    oscillator.disconnect();
    soundStart = false;
  }
};

const stopVideo = () => {
  updateNote.innerText = "Stopping video";
  handTrack.stopVideo(video);
  isVideo = false;
  updateNote.innerText = "Video stopped";
};

const runDetection = async () => {
  const predictions = await model.detect(video);
  // console.log("Predictions: ", predictions);
  model.renderPredictions(predictions, canvas, context, video);
  if (predictions[0]) {
    xNote.innerText = predictions[0].bbox[0];
    yNote.innerText = predictions[0].bbox[1];
    widthNote.innerText = predictions[0].bbox[2];
    heightNote.innerText = predictions[0].bbox[3];

    let midHeight =  predictions[0].bbox[1] + (predictions[0].bbox[2] / 3);
    let midWidth =  predictions[0].bbox[0] + (predictions[0].bbox[1] / 3);
    await startSound(midHeight);

    // ゲーム開始
    console.log(midHeight);
    if (Pong.running === false) {
      if (midHeight <= 100) {
        Pong.running = true;
        window.requestAnimationFrame(Pong.loop);
      }
    }

    Pong.setPlayerY(Pong.convertRangeY(midHeight, video.height));
    Pong.setPlayerX(Pong.convertRangeX(midWidth, video.width));
    Pong.setPlayerW(predictions[0].bbox[2]);
    Pong.setPlayerH(predictions[0].bbox[3]);

    // let midval = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2);
    // let pos = document.body.clientWidth * (midval / video.width);
    // console.log("Pos: " + pos);
    // posNote.innerText = pos;
    // updatePaddleControl(gamex);
  } else if (predictions.length === 0) {
    stopSound();
  }
  if (isVideo) {
    setTimeout(() => {
      runDetection(video)
    }, videoInterval);
  }
};

const calculateFrequency = (handYPosition) => {
  const freqArray = [195.998, 233.082, 261.626, 293.665, 349.228, 391.995, 466.164, 523.251, 587.330, 698.456];
  return freqArray[Math.floor((handYPosition / video.height) * freqArray.length)];
};

const calculateGain = (handXPosition) => {
  const minGain = 0, maxGain = 1;
  return 1 - ((handXPosition / video.height) * maxGain) + minGain;
};

logo.onclick = () => {
  Pong = Object.assign({}, Game);
  Pong.initialize();
};
