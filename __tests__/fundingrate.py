import pandas as pd
import requests
import requests
# 3.9.2版本
import matplotlib.pyplot as plt

SYMBOL='ALPHA'
INTERVAL='8h'
LIMIT=30*3

# 币安合约费率历史
FOUNDRATE_URL=f'https://fapi.binance.com/fapi/v1/fundingRate?symbol={SYMBOL}USDT'

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
    df['fundingTime'] = pd.to_datetime(df['fundingTime'], unit='ms')
    df['fundingRate'] = df['fundingRate'].astype(float)
    df['markPrice'] = df['markPrice'].astype(float)
    # 价格与上一个交易日的合约费率的相关性
    df['fundingRate_shift'] = df['fundingRate'].shift(1)
    corr = df['markPrice'].corr(df['fundingRate_shift'])
    print(f'价格与上一个交易日的合约费率的相关性: {corr}')
    # 检查数据中是否包含空数据
    print(df.isnull().sum())
    # # 画图
    plt.figure(figsize=(14, 7))
    plt.subplot(2, 1, 1)
    print(df['fundingRate'].dtype)        # Check the data type of the column
    plt.plot(df['fundingTime'], df['fundingRate'], label='Funding Rate', color='blue')
    plt.title(f'{SYMBOL} Funding Rate')
    plt.legend()
    # 在同一幅图中画出价格
    plt.subplot(2, 1, 2)
    plt.plot(df['fundingTime'], df['markPrice'], label='Mark Price', color='red')
    plt.title(f'{SYMBOL} Mark Price')
    plt.legend()

    plt.show()
