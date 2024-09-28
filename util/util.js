import { FileBox } from 'file-box'
import {exec} from 'child_process'
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
import XLSX from 'xlsx'
import {bot} from './init.js';
import ffmpeg from 'fluent-ffmpeg';

export const sendMessage = async (toUserId, payload)=> {
  if(payload === undefined || payload === null){
    return
  }
  if (typeof payload === 'string') {
    const toContact = await bot.Contact.load(toUserId);
    const message = (await toContact.say(payload));
    return message;
  }else{
    const toContact = await bot.Contact.load(toUserId);
    const message = (await toContact.say(payload));
    return message;
  }
};

export const sendImage = async (toUserId,ImageUrl)=>{
  // 发送图片需要注意图片不得被墙
  const fileBox = FileBox.fromUrl(
    ImageUrl    )        
  const toContact = await bot.Contact.load(toUserId);
  const res = await toContact.say(fileBox)
  return res
}
export const sendUrlLink = async (toUserId,payload)=>{
  const urlLink = new bot.UrlLink({
    title: payload.title,
    description: payload.description,
    thumbnailUrl: payload.thumbnailUrl,
    url: payload.url,
  });
  const toContact = await bot.Contact.load(toUserId);
  const res = await toContact.say(urlLink)
  return res
}

export const saveSilk = async (filename,data)=>{
  fs.writeFileSync(filename, data);
}

export const readPDF = async (filename,buffer)=>{
  try {
    let data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const readSheet = async (filename,buffer)=>{
  const workbook = XLSX.read(buffer, {type:"buffer"});
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {header:1});
  const textData = jsonData.map(row => row.join('\t')).join('\n');
  return textData
}

export const readWord = async (filename,buffer)=>{
  try {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  } catch (error) {
    // 处理可能出现的错误
    console.error(error);
    return null;
  }
}

export const readTxt = async (filename,buffer)=>{
  return buffer.toString();
}

export const convertSilkToWav = (silkBuffer)=> {
  return new Promise((resolve, reject) => {
    // 生成一个时间戳随机名
    let t = new Date().getTime()
    const tempFilePath = `${t}.silk`;
    fs.writeFileSync(tempFilePath, silkBuffer);
    fs.access(tempFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(new Error('input.silk文件'));
      } else {
        // 将silk文件移动到silk-v3-decoder目录下
        exec(`sh converter.sh ${tempFilePath} wav`, (error, stdout) => {
          console.log('stdout:', stdout); 
          if (error) {
            reject(error);
          }
          else {
            resolve(`${t}.wav`);
            // 删除临时文件
            fs.unlinkSync(tempFilePath);
          }
        });
      }
    });
  });
}

export const sendSilk = async (toUserId, filename,voiceLength)=>{
  // 取 12-25之间的随机数
  const fileBox = FileBox.fromFile(filename);
  fileBox.metadata = {
    voiceLength,
  };
  const toContact = await bot.Contact.load(toUserId);
  const res = await toContact.say(fileBox)
  return res
}

export const renameFile = (oldPath, newPath) => {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


export const getAudioDuration = (wavPath)=> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(wavPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration);
      }
    });
  });
}

