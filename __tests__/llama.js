/* eslint-disable no-undef */
import Replicate from "replicate";
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中获取 API 密钥
process.env.REPLICATE_API_TOKEN;

// 创建 Replicate 实例
const replicate = new Replicate({});

const input = {
  prompt: "跟我说说iphone12 pro max的优点吧",
  max_tokens: 1024
};

for await (const event of replicate.stream("meta/meta-llama-3.1-405b-instruct", { input })) {
  process.stdout.write(`${event}`);
};