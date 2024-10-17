/* eslint-disable no-undef */
import {GoogleGenerativeAI} from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
import fs from 'fs'

export const recgonizeImage = async (prompt) => {
    const image = {
        inlineData: {
            data: Buffer.from(fs.readFileSync("cookie.jpg")).toString("base64"),
            mimeType: "image/png",
        }};

    const result = await model.generateContent([prompt, image]);
    return result.response.text()
}

export const classfication = async (query) => {
    const prompt = ` 请根据"""${query}"""中的内容判断当前语句涉及如下哪个选项：股票；数字货币；原油；外汇；其他。返回选项名称`
    const result = await model.generateContent(prompt);
    return result.response.text()
}

