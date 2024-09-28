/* eslint-disable no-undef */
import {bot,difyChat} from './util/init.js';
import {sendMessage,convertSilkToWav,readSheet,readTxt,
  readWord, readPDF} from './util/util.js'
import {recognizeSpeech} from './util/azure.js'
import fs from 'fs';
import {sendBlessing} from './util/group.js'
import { config } from 'dotenv';
// import { WebSocketServer } from 'ws';
import {splitTextIntoArray} from './util/reply-filter.js'
import qrcode from 'qrcode-terminal';
import {transporter,mailOptions} from './util/mailer.js';
import schedule from 'node-schedule';
import {getNews} from './util/group.js'
config();
/**
 * 参考文档https://github.com/wechaty/puppet-padlocal/wiki/API-%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3-(TypeScript-JavaScript)
 */
// const wss = new WebSocketServer({ port: 9090 });
console.log("微信机器人启动，版本号：",bot.version());

// wss.on('connection', function connection(ws) {
//   console.log('Frontend connected to WebSocket server');
//   ws.on('close', () => {
//     console.log('Frontend disconnected from WebSocket server');
//   });
// });

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
        // const announcement = await roomMsg.announce();
        // 设置
        // await room.announce("新的群公告");
        if(text.includes("加入群聊")){
          if (roomMsg) {
            await sendMessage(roomMsg.id, process.env.GROUP_GREET);
            return;
          }
        }else{
          // 正常聊天
          switch (message.type()) {
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
    case 7:
      if(talkerId!==listenerId && talkerId!=='weixin' && text!==''){
        // 如果文本不包含URL，则进行对话回复
        if(talkerId==="wxid_e0u9h9uhl18e22"){
          return
        }
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
        return
      }
      break;
      // 图片消息
    case 6:
      break;
      // 链接卡片消息
    case 14:
      break;
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
        }else if(mediaType.includes('sheet')){
          let text = await readSheet(filename,attachData)
        }else if(mediaType.includes('document')){
          let text = await readWord(filename,attachData)
        }else if(mediaType.includes('txt')){
          let text = await readTxt(filename,attachData)
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
    sendBlessing(bot);
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
    const rule = new schedule.RecurrenceRule();
    rule.hour = process.env.SCHEDULE_HOUR
    rule.minute =  process.env.SCHEDULE_MINUES
    // 中国上海时间
    rule.tz = 'Asia/Shanghai';
    schedule.scheduleJob(rule, async()=>{
      let {data} = await getNews();
      if(data){
        console.log("ding")
        let answer = await difyChat(id,`这是今天的经济新闻：${data}。请用简洁的语言告诉微信群中的群友们今天的投资机会和理由。`)
        // 过滤文字中的*
        answer = answer.replace(/\*/g, '');                
        await sendMessage(id, answer);
      }
    });
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

