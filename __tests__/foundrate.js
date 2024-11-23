import moment from 'moment';


const getFoundingRate = async (symbol) => {
  try {
    const res = await fetch(`https://api.binance.com/fapi/v1/premiumIndex?symbol=${symbol}USDT`, {
      method: 'GET',
    });
    let items = await res.json();
    console.log(items);
  } catch (e) {
    console.log(e);
  }
};

// ... (其他代码保持不变)


const res = await getFoundingRate('DOGE');
console.log(res);
