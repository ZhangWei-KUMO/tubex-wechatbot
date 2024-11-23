import moment from 'moment';
import { RSI,MACD,Stochastic} from 'technicalindicators'

const getKlines = async (symbol) => {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?interval=1h&limit=100&symbol=${symbol}USDT`, {
      method: 'GET',
    });
    let items = await res.json();
    let close = [];
    let high = [];
    let low = []
    items.forEach(kline => {
      if (kline[0] && Number(kline[1])) {
        // return {
        //   "开盘时间": moment(kline[0]).format("YYYY-MM-DD HH:mm"),
        //   "开盘价": Number(kline[1]),
        //   "收盘价": Number(kline[4]),
        //   "最高价": Number(kline[2]),
        //   "最低价": Number(kline[3]),
        //   "成交额": Number(kline[7]),
        //   "主动买入成交额": Number(kline[10]),
        // };
        close.push(Number(kline[4])) 
        high.push(Number(kline[2])) 
        low.push(Number(kline[3])) 
      }
    });
    // 将 K 线数据按照时间升序排列
    return {close,high,low};
  } catch (e) {
    console.log(e);
  }
};

// ... (其他代码保持不变)


const {close,high,low} = await getKlines('DOGE');
console.log(close);
const input6 = {
    values: close,
    period: 6,
};
const input12 = {
    values: close,
    period: 12,
};
let rsi6 = RSI.calculate(input6);
let rsi12 = RSI.calculate(input12);


let inputStoch = {
    high: high,
    low: low,
    close: close,
    period: 14,
    signalPeriod: 3
  };

let stoch = Stochastic.calculate(inputStoch)

var macdInput = {
    values: close,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9 ,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  }
let macd = MACD.calculate(macdInput)

console.log(macd);
