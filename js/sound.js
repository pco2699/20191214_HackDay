// document.getElementById('kick').addEventListener('click', () => {
//   if(!audioContext){
//     audioContext = new AudioContext();
//   }
//   playKick(audioContext);
// });

const playKick = async (soundContext) => {
  let kick = await loadSound("sound/SU_01_Kick.wav", soundContext);
  playSound(kick, soundContext);
};

const loadSound = async (url, soundContext) => {
  let sound = {};
  sound.url = url;

  let response = await makeRequest(url);
  sound.buffer = await soundContext.decodeAudioData(response);

  return sound;
};

const playSound = (sound, soundContext) => {
  let buffer = sound.buffer;
  if(buffer){
    let source = soundContext.createBufferSource();
    source.buffer = buffer;

    let volume = soundContext.createGain();

    volume.connect(soundContext.destination);
    source.connect(volume);
    source.start(0);
  }
};

const makeRequest = async (url) => {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
};
