# WechatBot (TubeX)

![Static Badge](https://img.shields.io/badge/21.0%2B-x?style=flat&logo=Node.js&logoColor=green&label=Node.js&color=green)
![Static Badge](https://img.shields.io/badge/1.20.0%2B-x?style=flat&logo=Wechat&logoColor=green&label=WechatY&color=green)
![Static Badge](https://img.shields.io/badge/1.20.1%2B-x?style=flat&logo=github&logoColor=whitee&label=wechat4u&color=orange)
![Static Badge](https://img.shields.io/badge/v3-x?style=flat&logo=github&logoColor=white&label=silk-v3-decoder&color=purple)
![Static Badge](https://img.shields.io/badge/6.1.1-x?style=flat&logo=ffmpeg&logoColor=orange&label=ffmpeg&color=orange)
![Static Badge](https://img.shields.io/badge/cognitiveservices_speech-x?style=flat&logo=microsoft&logoColor=blue&label=Azure&color=blue)
![Static Badge](https://img.shields.io/badge/Doubao-x?style=flat&logo=Dify&logoColor=white&label=Dify&color=darkgreen)

<img src="public/bot.jpg" alt="logo" width="300"/>

本项目为基于GPT-4的微信机器人，其目的在于为各类B端商户提供数字员工服务。已实现和计划实现功能如下：

1. AI聊天；✅
2. 语音识别；✅
3. 阅读并理解文件，支持格式XSL、DOCS、PDF、TXT ✅
4. 理解转账、红包、地理位置等非文本数据 ✅
5. 微信群聊天管理；✅

## Quick Started

```bash
npm install
# Production
node index.js
# Development
pm2 start index.js
```

## Configuration

### Silk格式转码
本项目上游微信接入技术支持为开源项目WechatY，其中登录网关部分为[付费](http://pad-local.com/)项目[puppet-padlocal](https://github.com/wechaty/puppet-padlocal/wiki/)，每月费用为200元。在微信语音silk格式解码上则使用的是开源项目[silk-v3-decoder](https://github.com/kn007/silk-v3-decoder)的部分代码。在silk加密上则使用的是Python包[graiax-silkcoder](https://pypi.org/project/graiax-silkcoder/)。这二者均基于ffmpeg，所以本机环境也需要安装ffmpeg。

### 语音识别及合成服务

本项目的语音识别及合成服务对接[Azure语音服务](https://azure.microsoft.com/zh-cn/free/ai-services/)。开发者需要申请API KEY。
