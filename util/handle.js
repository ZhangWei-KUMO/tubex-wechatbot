import {chat} from '../db/chats.js'
import {sendMessage,saveInLongMemory,convertSilkToWav,readPDF,readWord,readSheet,readTxt} from './util.js'
import {difyChat} from './init.js';
import {splitTextIntoArray} from './reply-filter.js'
import {recognizeSpeech} from './azure.js'
import xml2js from 'xml2js';
import fs from 'fs';
import process from 'process';
import schedule from 'node-schedule';
import {getNews} from './group.js'

export const singleChat = async (talkerId,listenerId,text) => {
    if(talkerId!==listenerId && talkerId!=='weixin' && text!==''){
        if (text.includes('pictype=location')) {
          const lines = text.split(':');
          const locationText = `我的地址是：${lines[0]}`;
          saveInLongMemory(locationText,talkerId)          
        }else{
          chat(talkerId, text);
          let answer = await difyChat(talkerId,text) 
          if(answer){ 
            answer = answer.replace(/\*/g, '');                
            answer = answer.trim()
            if(answer.includes("\n")){
              let array =  await splitTextIntoArray(answer)
              const interval = setInterval(async () => {
                if (array.length) {
                  await sendMessage(talkerId, array.shift())
                } else {
                  clearInterval(interval);
                }
              }, 3000);
            }else{
              await sendMessage(talkerId, answer);
            }   
          }
        }
        return
      }
}

export const groupChat = async (message,talkerId) => {
    let roomMsg = message.room()
    let {payload} = roomMsg;
    // 群名称
    let {topic} = payload;
    // 获取当前群聊名称
    let mentionText = await message.mentionText();
    if (await message.mentionSelf()) {
      if (roomMsg) {
        let answer = await difyChat(roomMsg.id,mentionText)
        answer = answer.replace(/\*/g, '');         
        if(answer.includes("\n")){
          let array =  await splitTextIntoArray(answer)
          const interval = setInterval(async () => {
            if (array.length) {
              await sendMessage(roomMsg.id, array.shift())
            } else {
              clearInterval(interval);
            }
          }, 3000);
        }else{
          await sendMessage(roomMsg.id, answer);
        }   
        return;
      }
    }else{
      let {payload} = message;
      let {text} = payload;
      if(text.includes("加入群聊")){
        if (roomMsg) {
          await sendMessage(roomMsg.id, process.env.GROUP_GREET);
          return;
        }
      }else{
        // 正常聊天
        switch (message.type()) {
          // 被人拍了拍
          case 0:
            await sendMessage(roomMsg.id, "找我搞么事？");
            break;
        case 2:
          try{
            const audioFileBox = await message.toFileBox();
            const silkBuffer = await audioFileBox.toBuffer();
            let wav = await convertSilkToWav(silkBuffer)
            fs.access(wav, fs.constants.F_OK, async (err) => {
              if(err){
                await sendMessage(talkerId, '👌🏻')
                return
              }
              try{
                let q = await recognizeSpeech(wav)
                fs.unlinkSync(wav)
                // 获取群名称
                let answer = await difyChat(roomMsg.id,q)
                answer = answer.replace(/\*/g, '');         
                if(answer.includes("\n")){
                  let array =  await splitTextIntoArray(answer)
                  const interval = setInterval(async () => {
                    if (array.length) {
                      await sendMessage(roomMsg.id, array.shift())
                    } else {
                      clearInterval(interval);
                    }
                  }, 3000);
                }else{
                  await sendMessage(roomMsg.id, answer);
                }   
              }catch(e){
                await sendMessage(roomMsg.id, e)
                return
              }
            })
          }catch(e){  
            console.error(e)
          }
          break;
        case 7:
          chat(topic, message.payload.text);
          break;
        default:
          return
        }
      }
    }
    return;
}

export const handleFile = async (message,talkerId) => {
    try{
        const attachFileBox = await message.toFileBox();
        let mediaType = attachFileBox._mediaType
        let filename = attachFileBox._name;
        const attachData = await attachFileBox.toBuffer();
        if(mediaType.includes('pdf')){
          let text = await readPDF(filename,attachData);
          saveInLongMemory(`对方发来一份PDF文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('sheet')){
          let text = await readSheet(filename,attachData)
          saveInLongMemory(`对方发来一份EXCEL文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('document')){
          let text = await readWord(filename,attachData)
          saveInLongMemory(`对方发来一份WORD文件，内容如下：${text}`,talkerId)
        }else if(mediaType.includes('txt')){
          let text = await readTxt(filename,attachData)
          saveInLongMemory(`对方发来一份TXT文件，内容如下：${text}`,talkerId)
        }else{
          await sendMessage(talkerId, "好的，我先看下");
        }
      }catch(e){
        console.error(e)
      }
}

export const handleAudio = async (message,talkerId) => {
    try{
        const audioFileBox = await message.toFileBox();
        const silkBuffer = await audioFileBox.toBuffer();
        let wav = await convertSilkToWav(silkBuffer)
        fs.access(wav, fs.constants.F_OK, async (err) => {
          if(err){
            await sendMessage(talkerId, '👌🏻')
            return
          }
          try{
            let q = await recognizeSpeech(wav)
            fs.unlinkSync(wav)
            let answer = await difyChat(talkerId,q)
            await sendMessage(talkerId,answer)
          }catch(e){
            await sendMessage(talkerId, e)
            return
          }
        })
      }catch(e){  
        console.error(e)
      }
}

export const handleMiniProgram = async (message,talkerId) => {
    try{
        const miniProgram = await message.toMiniProgram();
        console.log(miniProgram)
        await sendMessage(talkerId, "真不错，待会不忙的时候会看下");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

export const handleVideo = async (message,talkerId) => {
    try{
        // const videoFileBox = await message.toFileBox();
        // let video = await videoFileBox.toFile();
        await sendMessage(talkerId, "好的，我先看下");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

export const handleGIF = async (message,talkerId) => {
    try{
        await sendMessage(talkerId, "666");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}

// 处理转账信息
export const handleTransfer = async (xmlstr,talkerId) => {
    xml2js.parseString(xmlstr, async (err, result) => {
        if (err) {
          await sendMessage(talkerId, '收到');
        } else {
          const title = result.msg.appmsg[0].des[0];
          const regex = /\d+(\.\d+)?/;
          const num = title.match(regex);
          await sendMessage(talkerId, '收到');
          saveInLongMemory(`好友转账给你${num[0]}元`,talkerId)
        }
    });
}

// 处理微信文章分享
export const handleArticle = async (xmlstr,talkerId) => {
    xml2js.parseString(xmlstr, async (err, result) => {
        if (err) {
        console.error(err);
      } else {
        const title = result.msg.appmsg[0].title[0];
        saveInLongMemory( `分享给你一篇微信文章：《${title}》`,talkerId)
      }
    });
}

// 处理主动推送信息
export const handlePush = async (rooms) => {
    let id = ""
    rooms.filter(room=>{
      if(process.env.MANAGE_ROOMS.includes(room.payload.topic)){
        id = room.id
      }
    });

    if(process.env.IS_PUSH_MESSAGE){
      const rule = new schedule.RecurrenceRule();
      rule.hour = process.env.SCHEDULE_HOUR
      rule.minute =  process.env.SCHEDULE_MINUES
      rule.tz = 'Asia/Shanghai';
      schedule.scheduleJob(rule, async()=>{
        let {data} = await getNews();
        if(data){
          let answer = await difyChat(id,`请根据当前的经济数据，对当前市场进行分析`)
          answer = answer.replace(/\*/g, '');                
          await sendMessage(id, answer);
        }
      });
    }
}

export const handleImage = async (message,talkerId) => {
    try{
        // const imageFileBox = await message.toFileBox();
        // let image = await imageFileBox.toFile();
        await sendMessage(talkerId, "好的，我先看下");
    }catch(e){
        await sendMessage(talkerId, e)
        return
    }
}