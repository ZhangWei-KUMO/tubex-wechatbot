import pandas as pd
import requests
import requests
# 3.9.2版本
import matplotlib.pyplot as plt
from scipy.stats import pearsonr  # 使用 pearsonr 计算相关性
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib.dates as mdates  # 导入 mdates 模块

SYMBOL='1000PEPE'
INTERVAL='1h'
LIMIT=30*12
BASIS_URL=f'https://fapi.binance.com/futures/data/basis?pair={SYMBOL}USDT&period={INTERVAL}&limit={LIMIT}&contractType=PERPETUAL'
BINANCE_PRICE_URL = f'https://fapi.binance.com/fapi/v1/klines?interval={INTERVAL}&limit={LIMIT}&symbol={SYMBOL}USDT'
# 设置偏移量 (10 小时)
offset = 10
# 调整显示图片的比例系数

def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f'Error fetching data: {response.json()}')
        return None

# 主程序
if __name__ == '__main__':
    # 获取 Binance 数据
    data = fetch_data(BASIS_URL)
    klines = fetch_data(BINANCE_PRICE_URL)
    # 检查数据是否为空
    if data is None or klines is None:
        print('No data fetched, exiting...')
        exit(1)
    df = pd.DataFrame(data)
    df_klines = pd.DataFrame(klines)
    df_klines.rename(columns={0: 'timestamp', 4: 'closePrice'}, inplace=True)
    df_klines['timestamp'] = pd.to_datetime(df_klines['timestamp'], unit='ms')
    df_klines['closePrice'] = df_klines['closePrice'].astype(float)
    df['basis'] = df['basis'].astype(float)
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    # 当前价格与大户持仓量多空比的相关性

    # 将 df_klines 的时间戳向前移动 8 小时
    df_klines['shifted_timestamp'] = df_klines['timestamp'] + pd.Timedelta(hours=offset)

    # 合并两个 DataFrame，以便计算相关性
    merged_df = pd.merge_asof(df_klines, df, left_on='shifted_timestamp', right_on='timestamp', direction='nearest')

    correlations = []

    for offset in range(0, 25):  # 0小时到24小时偏移
        df_klines['shifted_timestamp'] = df_klines['timestamp'] + pd.Timedelta(hours=offset)
        merged_df = pd.merge_asof(df_klines, df, left_on='shifted_timestamp', right_on='timestamp', direction='nearest')
        
        # 处理可能出现的空数据
        if merged_df['closePrice'].dropna().empty or merged_df['basis'].dropna().empty:
            corr = None  # 或其他你希望的默认值，例如 0
            print(f"No valid data for offset {offset}, skipping correlation calculation.")
        else:
            corr, _ = pearsonr(merged_df['closePrice'].dropna(), merged_df['basis'].dropna())

        correlations.append((offset, corr))

    for offset, corr in correlations:
        print(f"Correlation coefficient between price and basis ({offset} hours ago): {corr}")
    
    max_corr = -1
    max_offset = 0

    for offset, corr in correlations:
        if corr is not None and abs(corr) > max_corr:  # 处理 corr 为 None 的情况
            max_corr = abs(corr)
            max_offset = offset
    
    print(f"\nMaximum absolute correlation: {max_corr} at offset {max_offset} hours.")
    plt.figure(figsize=(20, 7))

    max_basis = df['basis'].max()
    min_basis = df['basis'].min()
    max_basis_time = df.loc[df['basis'] == max_basis, 'timestamp'].iloc[0]
    min_basis_time = df.loc[df['basis'] == min_basis, 'timestamp'].iloc[0]

    # 两个子图分别画出价格和基差
    ax1 = plt.subplot(2, 1, 1)  # 获取第一个子图的 axes 对象
    plt.plot(df_klines['timestamp'], df_klines['closePrice'], label='Price')
    plt.legend()
    ax1.xaxis.set_major_locator(mdates.HourLocator(interval=1)) # 设置 x 轴主刻度为每小时
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%d %H:%M'))  # 设置时间格式
    plt.xticks(rotation=45, ha='right') # 旋转x轴标签


    ax2 = plt.subplot(2, 1, 2)  # 获取第二个子图的 axes 对象
    plt.plot(df['timestamp'], df['basis'], label='Basis')
    ax2.xaxis.set_major_locator(mdates.HourLocator(interval=1))  # 设置 x 轴主刻度为每小时
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%d %H:%M'))  # 设置时间格式
    plt.xticks(rotation=45, ha='right') #旋转x轴标签


    # 标注最大值和最小值
    plt.scatter(max_basis_time, max_basis, color='red', marker='o', s=100, label=f'Max Basis: {max_basis:.4f}')
    plt.scatter(min_basis_time, min_basis, color='green', marker='o', s=100, label=f'Min Basis: {min_basis:.4f}')
    #添加最大值和最小值的标签
    plt.annotate(f'{max_basis:.4f}',(mdates.date2num(max_basis_time),max_basis),xytext=(10,10),textcoords='offset points',color='red')
    plt.annotate(f'{min_basis:.4f}',(mdates.date2num(min_basis_time),min_basis),xytext=(10,10),textcoords='offset points',color='green')




    # 在两个子图上画出红线
    ax1.axvline(x=max_basis_time, color='red', linestyle='--', label='Max Basis Time')
    ax1.axvline(x=min_basis_time, color='green', linestyle='--', label='Min Basis Time')
    ax2.axvline(x=max_basis_time, color='red', linestyle='--')
    ax2.axvline(x=min_basis_time, color='green', linestyle='--')
    # 用橙色线画出13日20点的时间
    ax1.axvline(x=pd.Timestamp('2024-11-13 19:00:00'), color='orange', linestyle='--', label='Second Max Basis Time')
    ax2.axvline(x=pd.Timestamp('2024-11-13 19:00:00'), color='orange', linestyle='--', label='Second Max Basis Time')

    plt.tight_layout() # 调整子图布局，避免重叠
    plt.legend()
    plt.show()

