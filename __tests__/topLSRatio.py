import pandas as pd
import requests
import requests
# 3.9.2版本
import matplotlib.pyplot as plt

SYMBOL='ALPHA'
INTERVAL='6h'
LIMIT=30*4

# 币安大户持仓比例
FOUNDRATE_URL=f'https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol={SYMBOL}USDT&period={INTERVAL}&limit={LIMIT}'

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
    df = pd.DataFrame(data)
    print(data)
    # df['fundingTime'] = pd.to_datetime(df['fundingTime'], unit='ms')
    # df['fundingRate'] = df['fundingRate'].astype(float)
    # df['markPrice'] = df['markPrice'].astype(float)
    # # 价格与上一个交易日的合约费率的相关性
    # df['fundingRate_shift'] = df['fundingRate'].shift(1)
    # corr = df['markPrice'].corr(df['fundingRate_shift'])
    # print(f'价格与上一个交易日的合约费率的相关性: {corr}')
    # print(df.isnull().sum())
    # plt.figure(figsize=(14, 7))
    # plt.subplot(2, 1, 1)
    # print(df['fundingRate'].dtype)        
    # plt.plot(df['fundingTime'], df['fundingRate'], label='Funding Rate', color='blue')
    # plt.title(f'{SYMBOL} Funding Rate')
    # plt.legend()
    # plt.subplot(2, 1, 2)
    # plt.plot(df['fundingTime'], df['markPrice'], label='Mark Price', color='red')
    # plt.title(f'{SYMBOL} Top Long Short Position Ratio')
    # plt.legend()

    # plt.show()
