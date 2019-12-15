const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const video = document.getElementById("myvideo");
const updateNote = document.getElementById("text");
const messageNote = document.getElementById("message");
const handtrackNote = document.getElementsByClassName("handtrack")[0];

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
let gainNode = null;

const modelParams = {
  flipHorizontal: true,   // flip e.g for video
  maxNumBoxes: 1,        // maximum number of boxes to detect
  iouThreshold: 0.5,      // ioU threshold for non-max suppression
  scoreThreshold: 0.85,    // confidence threshold for predictions.
};

messageNote.addEventListener('click', () => {
  handtrackNote.style.display = "block";
});

window.addEventListener('DOMContentLoaded', () => {
  (async () => {
    audioContext = new AudioContext();
    // Load the model.
    model = await handTrack.load(modelParams);
    messageNote.innerText = 'Loading Complete!';
    setTimeout(()=> {
      messageNote.style.display = "none";
      startVideo();
    }, 1000);
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
    xNote.innerText = midWidth;
    yNote.innerText = midHeight;
    widthNote.innerText = predictions[0].bbox[2];
    heightNote.innerText = predictions[0].bbox[3];

    let midHeight =  predictions[0].bbox[1] + (predictions[0].bbox[2] / 3);
    let midWidth =  predictions[0].bbox[0] + (predictions[0].bbox[1] / 3);
    // await startSound(midWidth, midHeight);

    // ゲーム開始
    if (Pong.running === false) {
      if (midHeight <= 140) {
        Pong.running = true;
        window.requestAnimationFrame(Pong.loop);
      }
    }
    console.log(Pong);

    // Pong.setPlayerX(Pong.convertRangeX(midWidth, video.width));
    // Pong.setPlayerY(Pong.convertRangeY(midHeight, video.height));
    Pong.setPlayerX(midWidth - video.width * 0.5);
    Pong.setPlayerY(midHeight - video.height * 0.5);
    Pong.setPlayerW(predictions[0].bbox[2]);
    Pong.setPlayerH(predictions[0].bbox[3]);

    // let midval = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2);
    // let pos = document.body.clientWidth * (midval / video.width);
    // console.log("Pos: " + pos);
    // posNote.innerText = pos;
    // updatePaddleControl(gamex);
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
  const gain = 1 - ((handXPosition / video.width) * maxGain) + minGain;
  console.log(gain);
  return gain;
};

logo.onclick = () => {
  Pong = Object.assign({}, Game);
  Pong.initialize();
};
