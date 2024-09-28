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

This is an open-source WeChat robot project based on WechatY, Dify API services, and Microsoft Azure ASR voice services. After users fill in the Dify API information and Microsoft ASR KEY in the configuration file, they can quickly deploy their own AI robot.

这是一款基于WechatY、Dify API服务、微软Azure ASR语音服务微信机器人开源项目。用户在配置文件中填入Dify API信息、微软ASR KEY之后，
用户可以快速部署自己的AI机器人。

|No.|function|progress|
|--|--|--|
|1|Any large model AI chat 任意大模型AI聊天|✅|
|2|WeChat chat voice recognition 微信聊天语音识别|✅|
|3|AI reads and understands files, supporting formats XSL, DOCS, PDF, TXT AI阅读并理解文件，支持格式XSL、DOCS、PDF、TXT|🏃🏻‍♀️|
|4|AI understands non-text data such as transfers, red envelopes, and geographical locations. AI理解转账、红包、地理位置等非文本数据|🏃🏻‍♀️|
|5|WeChat group chat management 微信群聊天管理|✅|
|6|Regular message push in WeChat group 微信群定时消息推送|✅|
|7|Third-party knowledge base access 第三方知识库接入|✅|
|8|email notification to Administrator 管理员邮件通知|✅|


## Quick Started

```bash
npm install
# Production
node index.js
# Development
pm2 start index.js
```

### Configuration API

The speech recognition and synthesis services of this project are connected to [Azure Speech Services](https://azure.microsoft.com/zh-cn/free/ai-services/). Developers need to apply for an API KEY.
The large model of this project is connected to [Dify](https://dify.ai). Developers need to apply for an API KEY.

本项目的语音识别及合成服务对接[Azure语音服务](https://azure.microsoft.com/zh-cn/free/ai-services/)。开发者需要申请API KEY。
本项目的大模型对接[Dify](https://dify.ai)。开发者需要申请API KEY。

### Wechat Room for users

<img src="https://www.tubex.chat/service.jpg" alt="logo" width="200"/>

### 定制化商务合作

lewis.q.zhang@gmail.com
https://tubex.chat