import pandas as pd
import requests
import requests
# 3.9.2版本
import matplotlib.pyplot as plt

SYMBOL='1000BONK'
INTERVAL='4h'
LIMIT=30*4

# 币安合约主动买卖量
FOUNDRATE_URL=f'https://fapi.binance.com/futures/data/topLongShortAccountRatio?symbol={SYMBOL}USDT&period={INTERVAL}&limit={LIMIT}'
BINANCE_PRICE_URL = f'https://api.binance.com/api/v3/klines?interval={INTERVAL}&limit={LIMIT}&symbol={SYMBOL}USDT'

def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f'Error fetching data: {response.status_code}')
        return None

# 主程序
if __name__ == '__main__':
    # 获取 Binance 数据
    data = fetch_data(FOUNDRATE_URL)
    klines = fetch_data(BINANCE_PRICE_URL)
    df = pd.DataFrame(data)
    df_klines = pd.DataFrame(klines)
    df_klines.rename(columns={0: 'timestamp', 4: 'closePrice'}, inplace=True)
    df_klines['timestamp'] = pd.to_datetime(df_klines['timestamp'], unit='ms')
    df_klines['closePrice'] = df_klines['closePrice'].astype(float)
    df['longShortRatio'] = df['longShortRatio'].shift(0).astype(float)
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')

    corr = df_klines['closePrice'].corr(df['longShortRatio'])


    print("大户账户多空比与价格相关性系数：", corr)

    plt.figure(figsize=(14, 7))
    plt.subplot(2, 1, 1)
    plt.plot(df['timestamp'], df['longShortRatio'], label='LongShortRadio', color='green')
    plt.title(f'{SYMBOL} topLongShortAccountRatio')
    plt.legend()
    plt.subplot(2, 1, 2)
    plt.plot(df_klines['timestamp'], df_klines['closePrice'], label='Coin Price', color='blue')
    plt.title(f'{SYMBOL} Price')
    plt.legend()
    plt.show()