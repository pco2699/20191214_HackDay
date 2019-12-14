const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const video = document.getElementById("myvideo");
const updateNote = document.getElementById("text");

const xNote = document.getElementsByClassName("x")[0];
const yNote = document.getElementsByClassName("y")[0];
const widthNote = document.getElementsByClassName("width")[0];
const heightNote = document.getElementsByClassName("height")[0];

let audioContext = null;
let oscillator = null;
let model = null;
let isVideo = false;
let soundStart = false;
let videoInterval = 1;

const modelParams = {
  flipHorizontal: true,   // flip e.g for video
  maxNumBoxes: 1,        // maximum number of boxes to detect
  iouThreshold: 0.5,      // ioU threshold for non-max suppression
  scoreThreshold: 0.9,    // confidence threshold for predictions.
};

(async () => {
  // Load the model.
  model = await handTrack.load(modelParams);
})();

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

const startSound = (y) => {
  if (!soundStart && audioContext) {
    oscillator = audioContext.createOscillator();
    oscillator.frequency.setTargetAtTime(calculateFrequency(y), audioContext.currentTime, 0.01);
    oscillator.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    soundStart = true;
  } else if (audioContext) {
    oscillator.frequency.setTargetAtTime(calculateFrequency(y), audioContext.currentTime, 0.01);
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
  console.log("Predictions: ", predictions);
  model.renderPredictions(predictions, canvas, context, video);
  if (predictions[0]) {
    xNote.innerText = predictions[0].bbox[0];
    yNote.innerText = predictions[0].bbox[1];
    widthNote.innerText = predictions[0].bbox[2];
    heightNote.innerText = predictions[0].bbox[3];
    let midHeight =  predictions[0].bbox[1] + (predictions[0].bbox[2] / 3);
    startSound(midHeight);
    Pong.setPlayerY(Pong.convertRange(midHeight, video.height));

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
  const minFrequency = 20, maxFrequency = 2000;
  return video.height - Math.floor((handYPosition / video.height) * maxFrequency + minFrequency);
};

const calculateGain = (handXPosition) => {
  const minGain = 0, maxGain = 1;
  return 1 - ((handXPosition / video.height) * maxGain) + minGain;
};
