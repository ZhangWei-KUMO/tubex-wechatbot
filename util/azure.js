
import {
  SpeechConfig, ResultReason, AudioConfig, SpeechSynthesizer, SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';

const AZURE_SUBSCRIPTION_KEY = "2398a3d4e3214edcbc45ed1a82dc74ba"
const AZURE_SERVICE_REGION = "japanwest"
const speechConfig = SpeechConfig.fromSubscription(AZURE_SUBSCRIPTION_KEY, AZURE_SERVICE_REGION);
  
export function synthesizeSpeech(text,voiceName) {
  var audioFile = "voice.wav";
  const audioConfig = AudioConfig.fromAudioFileOutput(audioFile);
  speechConfig.speechSynthesisVoiceName = voiceName; 
  var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(text, (result) =>{
      if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        resolve('voice.wav')
      } else {
        console.error("Speech synthesis canceled, " + result.errorDetails +
              "\nDid you set the speech resource key and region values?");
      }
      synthesizer.close();
      synthesizer = null;
    },
    function (err) {
      reject("err - " + err);
      synthesizer.close();
      synthesizer = null;
    });
    console.log("Now synthesizing to: " + audioFile);
  })
}

// 输入是wav文件，输出是语音识别的文字
export function recognizeSpeech(wav) {
  let audioConfig = AudioConfig.fromWavFileInput(fs.readFileSync(wav));
  return new Promise((resolve, reject) => {
    speechConfig.speechRecognitionLanguage = 'zh-CN';
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync(async (result) => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        let { text } = result;
        resolve(text);
      } else {
        reject('生成的WAV文件无法解析'+`ERROR: ${result.privErrorDetails}`);
      }
    });
  });
}
  

