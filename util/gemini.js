/* eslint-disable no-undef */
import {GoogleGenerativeAI} from '@google/generative-ai';
import 'dotenv/config'
import {getAgentConfig} from '../db/agent.js'
import { getConfig } from '../db/config.js';
let agent = await getAgentConfig();
let config = await getConfig();
const genAI = new GoogleGenerativeAI(config.geminiApiKey || configprocess.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model:agent.model || "gemini-1.5-flash" });

export const recgonizeImage = async (buffer,question) => {
    const image = {
        inlineData: {
            // data: Buffer.from(fs.readFileSync("cookie.jpg")).toString("base64"),
            data: buffer.toString("base64"),
            mimeType: "image/png",
        }};

    const result = await model.generateContent([question+"。请用中文回答", image]);
    return result.response.text()
}

export const classfication = async (query) => {
    const prompt = `请根据"""${query}"""中的内容判断当前语句涉及如下哪个选项：股票；数字货币；原油；外汇；其他。返回选项名称`
    const result = await model.generateContent(prompt);
    return result.response.text()
}

export const symbolCheck = async (query) => {
    const prompt = `Acounding to"""${query}""",if it contains Crypto TOKEN NAME,please  return STOCK NAME or return 0`
    const result = await model.generateContent(prompt);
    return result.response.text()
}

export const stockCheck = async (query) => {
    const prompt = `Acounding to"""${query}""",if it contains STOCK NAME or INDEX NAME,please return NAME or return 0`
    const result = await model.generateContent(prompt);
    return result.response.text()
}

export const chat = async (query) => {
    console.log("提示词",config)
    console.log("文本",query)
    const result = await model.generateContent(query);
    return result.response.text()
}