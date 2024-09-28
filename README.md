# WechatBot (TubeX)

![Static Badge](https://img.shields.io/badge/21.0%2B-x?style=flat&logo=Node.js&logoColor=green&label=Node.js&color=green)
![Static Badge](https://img.shields.io/badge/1.20.0%2B-x?style=flat&logo=Wechat&logoColor=green&label=WechatY&color=green)
![Static Badge](https://img.shields.io/badge/1.14%2B-x?style=flat&logo=github&logoColor=whitee&label=wechat4u&color=orange)
![Static Badge](https://img.shields.io/badge/v3-x?style=flat&logo=github&logoColor=white&label=silk-v3-decoder&color=purple)
![Static Badge](https://img.shields.io/badge/6.1.1-x?style=flat&logo=ffmpeg&logoColor=orange&label=ffmpeg&color=orange)
![Static Badge](https://img.shields.io/badge/cognitiveservices_speech-x?style=flat&logo=microsoft&logoColor=blue&label=Azure&color=blue)
![Static Badge](https://img.shields.io/badge/Doubao-x?style=flat&logo=Dify&logoColor=white&label=Dify&color=darkgreen)

<div align="center">
<img src="public/bot.jpg" alt="logo" width="300"/>
</div>

这是一款基于WechatY、Dify API服务、微软Azure ASR语音服务微信机器人开源项目。用户在配置文件中填入Dify API信息、微软ASR KEY之后，
用户可以快速部署自己的AI机器人。

|--|功能|进度|
|--|--|--|
||任意大模型AI聊天|✅|
||微信聊天语音识别|✅|
||AI阅读并理解文件，支持格式XSL、DOCS、PDF、TXT|🏃🏻‍♀️|
||AI理解转账、红包、地理位置等非文本数据|🏃🏻‍♀️|
||微信群聊天管理|✅|
||微信群定时消息推送|✅|
||第三方知识库接入|✅|
||管理员邮件通知|✅|


## Quick Started

```bash
npm install
# Production
node index.js
# Development
pm2 start index.js
```

### 接口

本项目的语音识别及合成服务对接[Azure语音服务](https://azure.microsoft.com/zh-cn/free/ai-services/)。开发者需要申请API KEY。
本项目的大模型对接[Dify](https://dify.ai)。开发者需要申请API KEY。

### 进群小助手

<img src="https://www.tubex.chat/service.jpg" alt="logo" width="300"/>

### 定制化商务合作

lewis.q.zhang@gmail.com