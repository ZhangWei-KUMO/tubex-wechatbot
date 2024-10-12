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

|function|功能|progress|
|--|--|--|
|AI chat by any LLM| 任意大模型AI聊天|✅|
|WeChat chat voice recognition |微信聊天语音识别|✅|
|AI reads and understands files, supporting formats XSL, DOCS, PDF, TXT |AI阅读并理解文件，支持格式XSL、DOCS、PDF、TXT|✅|
|AI understands non-text data such as transfers, red envelopes, and geographical locations. |AI理解转账、红包、地理位置等非文本数据|✅|
|WeChat room chat management |微信群聊天管理|✅|
|Regular message push in WeChat group |微信群定时消息推送|✅|
|Third-party knowledge base access |第三方知识库接入|✅|
|Email notification to Administrator |管理员邮件通知|✅|
| Long Memeory for chat | 聊天长记忆 |✅|
| Self-running business | 自我运维 |✅|
| Crypto Coin Market Analysis | 数字货币市场分析 |✅|
| Chinese Financial Market Analysis | 中国金融市场数据获取及分析 |✅|
| USNG | 天然气CFD |✅|
| UKOIL | 布伦特原油 |✅|
| USGC | 纽约黄金价格 |✅|
| Inpainting | 老照片修复 |🏃🏻‍♀️|
| Inpainting | 机器人集群启动 |🏃🏻‍♀️|

## Workflow

<div align="center">
    <img src="public/workflow.png" alt="workflow"/>
</div>

## Dependencies Install

```bash
# e.g. Ubuntu 22
sudo apt update
sudo apt install ffmpeg
sudo apt install redis-server
npm install -g pm2
```

## 部署前环境变量配置

用户需要在微软Azure上申请 [Azure Speech Services](https://azure.microsoft.com/zh-cn/free/ai-services/) API KEY.
在 [Dify](https://dify.ai) 上申请一个AI API KEY。并填写在`.env`文件中。


## Quick Started

```bash
npm install
# Development
node index.js
# Production
pm2 start index.js -n tubex-wechatbot
# open logs and scan login QRcode
pm2 logs tubex-wechatbot
```
### Wechat Room for users

<img src="https://www.tubex.chat/service.jpg" alt="logo" width="200"/>

### 微信风控提示

本机器人在登录账号实名认证后自身不会出现微信风控的问题，但是在群聊过程中高频率出现股票投资、比特币投资等话题情况下会导致群聊、朋友圈等功能被封一个月的情况。使用者请注意管控好机器人的言行。

### 数字货币功能的部署与使用

本机器人接入的数字货币信息均来源于币安实时信息，但是由于Binance API在中国境内无法访问，在部署服务器上请选择海外服务器。
在涉及数字货币的问题上，用户应该携带关键词如：数字货币、加密货币、趋势、走势等。目前仅支持当日币安最热门的5个币种的趋势分析。
由于市场分析的难度较大，建议开发者使用GPT-4o、Gemini 1.5、Gemini flash等海外大模型。
本机器人未来会接入StochRSI技术数据，以1小时线为基础向用户推送。对于普通用户来说，我们不建议您参与数字货币的投机。

### Cooperation

lewis.q.zhang@gmail.com

https://tubex.chat


