/* eslint-disable no-undef */
import {bot,difyChat} from './util/init.js';
import fs from 'fs';
import xml2js from 'xml2js';
import {sendMessage,convertSilkToWav,readSheet,readTxt,
  readWord, readPDF,saveInLongMemory} from './util/util.js'
import {recognizeSpeech} from './util/azure.js'
import { config } from 'dotenv';
import {splitTextIntoArray} from './util/reply-filter.js'
import qrcode from 'qrcode-terminal';
import {transporter,mailOptions} from './util/mailer.js';
import schedule from 'node-schedule';
import {getNews} from './util/group.js'
config();
console.log("微信机器人启动，版本号：",bot.version());

function qrcodeToTerminal(url) {
  qrcode.generate(url, { small: true });
}

export async function prepareBot() {
  bot.on("message", async (message) => {  
    const contact = message.talker();
    // 自己的信息的直接无视
    if (contact.self()) {
      return;
    } 
    // 属于群聊的聊天信息
    if (message.room()) {
      let roomMsg = message.room()
      // 获取当前群聊名称
      let mentionText = await message.mentionText();
      if (await message.mentionSelf()) {
        if (roomMsg) {
          let answer = await difyChat(roomMsg.id,mentionText)
          await sendMessage(roomMsg.id, answer);
          return;
        }
      }else{
        // 监听是否有人加入群聊
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
            case 0:
              await sendMessage(roomMsg.id, "老板大气")
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
                  await sendMessage(roomMsg.id,answer)
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
            console.log(message)
            break;
          default:
            return
          }
        }
      }
      return;
    }
    let {payload} = message;
    let {talkerId,listenerId,text} = payload;

    switch (message.type()) {
      case 0:
        await sendMessage(talkerId, "感谢老板抬爱，祝老板在缅A发财")
        break;
    case 7:
      if(talkerId!==listenerId && talkerId!=='weixin' && text!==''){
        if (text.includes('pictype=location')) {
          const lines = text.split(':');
          const locationText = `我的地址是：${lines[0]}`;
          saveInLongMemory(locationText,talkerId)          
        }else{
          let answer = await difyChat(talkerId,text)          
          if(answer){ 
            answer = answer.replace(/\*/g, '');                
            answer = answer.trim()
            if(answer.includes("\n")){
              let array =  await splitTextIntoArray(answer)
              const interval = setInterval(async () => {
                if (array.length) {
                  console.log(talkerId,"多句：")
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
      break;
      // 图片消息
    case 6:
      break;
    case 11:
      { const xmlstr = payload.text;
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
      break; }
    case 14:
      { let xmlstr2 = payload.text;
      xml2js.parseString(xmlstr2, async (err, result) => {
    if (err) {
      console.error(err);
    } else {
      const title = result.msg.appmsg[0].title[0];
      saveInLongMemory( `分享给你一篇微信文章：《${title}》`,talkerId)
    }
  });
      break; }
      // 小程序卡片消息
    case 9:
      try{
        const miniProgram = await message.toMiniProgram();
        console.log(miniProgram)
        await sendMessage(talkerId, "真不错，待会不忙的时候会看下");
      }catch(e){
        await sendMessage(talkerId, e)
        return
      }
      break;
      // 语音消息
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
      break;
      // 视频消息
    case 15:
      break;
      // 动图表情消
    case 5:
      break;
      // 文件消息
    case 1:
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
      break;
    default:
      break;
    }
  });

  bot.on("friendship", async (friendship) => {
    try {
      const contact = friendship.contact();
      switch (friendship.type()) {  
      case bot.Friendship.Type.Receive:
        await friendship.accept()  
        await contact.say(process.env.WELCOME_TEXT)
        break  
      }
    } catch (e) {
      console.error(e)
    }
  });

  bot.on('scan', (qrcode) => {
    qrcodeToTerminal(qrcode)
  })

  bot.on("login", (user) => {
    let {payload} = user;
    let {name} = payload;
    console.log("机器人登录成功，账号名：", name);
  })

  bot.on("logout", async () => {
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return console.error(error);
      }
    });
  })

  bot.on("error", (e) => {
    console.error(e);
  })
  // 启动的时间会比较久
  bot.on("ready",async ()=>{
    let rooms = await bot.Room.findAll()
    // 过滤rooms中payload.topic是否有匹配
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
      // 中国上海时间
      rule.tz = 'Asia/Shanghai';
      schedule.scheduleJob(rule, async()=>{
        let {data} = await getNews();
        if(data){
          let answer = await difyChat(id,`这是今天的经济新闻：${data}。请用简洁的语言告诉微信群中的群友们今天的投资机会和理由。`)
          // 过滤文字中的*
          answer = answer.replace(/\*/g, '');                
          await sendMessage(id, answer);
        }
      });
    }
    const contact = await bot.Friendship.search({handle: 'tubexchat'});
    console.log(contact)
    // await bot.Friendship.add(contact, "朋友，你好");
  })

  await bot.start();
  await bot.ready();
  return bot;
}

async function startBot() {
  await prepareBot();
}

startBot().catch(console.error);

process.on('exit', async(code) => {
  console.log(`WechatY程序中断: ${code}`);
});

process.on('SIGINT', async () => {
  console.log(`WechatY程序中断:SIGINT`);
  await bot.logout();
  process.exit();
});

process.on('uncaughtException', async (err) => {
  console.error('抛出异常退出:', err);
});

