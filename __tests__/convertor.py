import pandas as pd
import requests
import time
import matplotlib.pyplot as plt
# from colorama import Fore, Style

# 币安 API 基础 URL
FUTURES_URL = "https://www.binance.com/fapi/v1/ticker/24hr"
INTERVAL = '15m'
LIMIT = 1

# 增加每次请求之间的等待时间，单位为秒
REQUEST_INTERVAL = 8  # 建议至少2秒，甚至更长，根据实际情况调整

def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # 如果请求不成功，抛出 HTTPError 异常
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None
    except ValueError as e:
        print(f"Error decoding JSON response from {url}: {e}")
        return None


if __name__ == '__main__':
    data = fetch_data(FUTURES_URL)
    if data is None:
        exit(1)  # 如果获取 24 小时数据失败，则退出

    symbols = [item['symbol'] for item in data if float(item['quoteVolume']) > 50000000]
    list_df = []  # 使用更具描述性的变量名
    for symbol in symbols:
        funding_rate_url = f'https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol={symbol}&period={INTERVAL}&limit={LIMIT}'
        funding_rate_data = fetch_data(funding_rate_url)

        if funding_rate_data is not None:  # 检查是否成功获取数据
            df = pd.DataFrame(funding_rate_data)
            long_short_ratio = df.get('longShortRatio')
            if long_short_ratio is not None:
                df['longShortRatio'] = long_short_ratio.astype(float)
                  # 删除longAccount 和 shortAccount 列
                df.drop(columns=['longAccount', 'shortAccount','timestamp'], inplace=True)
                # 将数据保存至list
                # 

                list_df.append(df)
            else:
                print(f"Warning: 'longShortRatio' column not found for symbol {symbol}")
        time.sleep(REQUEST_INTERVAL)  # 每次循环结束后等待一段时间
    # 输出list中longShortRatio最大值的Symbol，最小值的Symbol，平均值，list的长度
    
    # 创建一个空的 DataFrame 用于存储所有数据
    combined_df = pd.DataFrame()

    # 将所有 DataFrame 合并到 combined_df
    for df in list_df:
        combined_df = pd.concat([combined_df, df], ignore_index=True)
    # 计算 longShortRatio 的最大值、最小值、平均值
    max_ratio = combined_df['longShortRatio'].max()
    min_ratio = combined_df['longShortRatio'].min()
    avg_ratio = combined_df['longShortRatio'].mean()
    list_length = len(list_df) # list_df的长度，也就是获取了多少个symbol的数据


    # 找到最大值和最小值对应的 Symbol
    max_symbol = combined_df.loc[combined_df['longShortRatio'] == max_ratio, 'symbol'].iloc[0]
    min_symbol = combined_df.loc[combined_df['longShortRatio'] == min_ratio, 'symbol'].iloc[0]


    print(f"Max longShortRatio: {max_ratio} (Symbol: {max_symbol})")
    print(f"Min longShortRatio: {min_ratio} (Symbol: {min_symbol})")
    print(f"Average longShortRatio: {avg_ratio}")
    print(f"Number of symbols processed: {list_length}")
    # 输出为csv文件
    combined_df.to_csv('longShortRatio.csv', index=False)
