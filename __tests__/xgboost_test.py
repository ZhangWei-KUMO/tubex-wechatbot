import pandas as pd
import numpy as np
import requests
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import root_mean_squared_error
import talib
import matplotlib.pyplot as plt

SYMBOL='SOL'
INTERVAL='8h'
LIMIT=30*4
# 设置 Binance API 地址
BINANCE_PRICE_URL = f'https://api.binance.com/api/v3/klines?interval={INTERVAL}&limit={LIMIT}&symbol={SYMBOL}USDT'
# 币安合约费率历史
FOUNDRATE_URL=f'https://fapi.binance.com/fapi/v1/fundingRate?symbol=${SYMBOL}USDT&limit={LIMIT}'
# 合约主动买卖量
CONTRACT_VOL_UL= f'https://fapi.binance.com/fapi/v1/futures/data/takerlongshortRatio?symbol={SYMBOL}USDT&period=${INTERVAL}&limit={LIMIT}'
# 获取数据
def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f'Error fetching data: {response.status_code}')
        return None

def fetch_rate_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f'Error fetching data: {response.status_code}')
        return None
    
# 计算历史波动率
def calculate_volatility(df, periods=30):  # periods 参数控制计算波动率的周期
    log_return = np.log(df['Close'] / df['Close'].shift(1))
    volatility = log_return.rolling(window=periods).std() * np.sqrt(365*2) # 年化
    return volatility

# 处理数据
def process_data(data):
    # 创建数据框
    df = pd.DataFrame(data, columns=['Open time', 'Open', 'High', 'Low', 'Close', 'Volume', 'Close time', 'Quote asset volume', 'Number of trades', 'Taker buy base asset volume', 'Taker buy quote asset volume', 'Ignore'])
    df['Open time'] = pd.to_datetime(df['Open time'], unit='ms')
    df['Close time'] = pd.to_datetime(df['Close time'], unit='ms')

    # 强制转换数据类型
    df['Open'] = df['Open'].astype(float)
    df['Close'] = df['Close'].astype(float)
    df['High'] = df['High'].astype(float)
    df['Low'] = df['Low'].astype(float)
    df['Volume'] = df['Volume'].astype(float)

    df['Open_Close_Ratio'] = df['Open'] / df['Close']
    df['High_Low_Ratio'] = df['High'] / df['Low']
    df['Volume_Change'] = df['Volume'].diff()
    df['Price_Rate_Of_Change'] = df['Close'].pct_change()
    df['SMA_20'] = df['Close'].rolling(window=14).mean()
    volatility = calculate_volatility(df,30)
    df['Volatility'] = volatility
    df = df[['Open time', 'Open', 'High', 'Low', 'Close', 'Volume', 'Open_Close_Ratio', 'High_Low_Ratio', 'Volume_Change', 'SMA_20','Volatility','Price_Rate_Of_Change']]

    df['High'] = df['High'].astype(float)
    df['Low'] = df['Low'].astype(float)
    df['Volume'] = df['Volume'].astype(float)
    df['Open_Close_Ratio'] = df['Open_Close_Ratio'].astype(float)
    df['High_Low_Ratio'] = df['High_Low_Ratio'].astype(float)
    df['Volume_Change'] = df['Volume_Change'].astype(float)
    df['SMA_20'] = df['SMA_20'].astype(float)
        
    return df

# 训练 XGBoost 模型
def train_model(data):
    # Remove 'Open time' column
    data = data.drop('Open time', axis=1)

    # 选择特征
    features = ['Open', 'High', 'Low', 'Close', 'Volume', 'Open_Close_Ratio', 'High_Low_Ratio', 'Volume_Change','SMA_20','Volatility','Price_Rate_Of_Change']

    # 划分训练集和测试集
    X = data[features]
    y = data['Close']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 训练 XGBoost 模型
    model = XGBRegressor()
    model.fit(X_train, y_train)

    # 评估模型
    y_pred = model.predict(X_test)
    rmse = root_mean_squared_error(y_test, y_pred)
    print(f'RMSE 均方根误差: {rmse}')

    return model

# 预测未来价格
def predict_price(model, data):
    future_data = pd.DataFrame(data.tail(1), columns=data.columns)
    # 移除时间戳列
    future_data = future_data.drop('Open time', axis=1)

    future_price = model.predict(future_data)
    return future_price

# 交易信号
def generate_signal(current_price, future_price):
    if future_price > current_price:
        print('买入信号')
    else:
        print('卖出信号')


# 回测函数
def backtest(df, model):
    initial_capital = 1000  # 初始资金
    capital = initial_capital
    positions = 0
    results = []

    df = df.dropna()  # 去除 NaN 值，避免模型预测错误

    for i in range(len(df) - 1):  # 循环遍历数据，注意最后一个数据点不用预测
        current_price = df['Close'].iloc[i]
        future_data = pd.DataFrame(df.iloc[[i]], columns=df.columns).drop('Open time', axis=1) # 使用当前数据预测下一期
        predicted_price = model.predict(future_data)[0]

        # 交易逻辑
        if predicted_price > current_price and positions == 0:  # 买入信号
            positions = capital / current_price
            capital = 0
        elif predicted_price < current_price and positions > 0:  # 卖出信号
            capital = positions * current_price
            positions = 0

        portfolio_value = capital + positions * current_price if positions > 0 else capital # 计算投资组合价值
        results.append({'Date': df['Open time'].iloc[i+1],  # 记录下一期的时间
                       'Close': df['Close'].iloc[i+1],  # 记录下一期的实际收盘价
                       'Predicted': predicted_price,
                       'Portfolio Value': portfolio_value})


    results_df = pd.DataFrame(results)
    results_df['Returns'] = results_df['Portfolio Value'].pct_change()
    results_df['Cumulative Return'] = (1 + results_df['Returns']).cumprod() - 1

    # 计算胜率
    results_df['Trade'] = 0  # Initialize Trade column
    results_df['Win'] = 0   # Initialize Win column #Good practice to initialize before the loop


    for i in range(1, len(results_df)): # Start from 1 to avoid index out-of-bounds
        if results_df['Predicted'].iloc[i] > results_df['Close'].iloc[i - 1]:
            results_df.loc[i, 'Trade'] = 1  # Buy
        else:
            results_df.loc[i, 'Trade'] = -1 # Sell


        if (results_df.loc[i, 'Trade'] == 1 and results_df.loc[i, 'Close'] > results_df.loc[i-1, 'Close']) or \
            (results_df.loc[i, 'Trade'] == -1 and results_df.loc[i, 'Close'] < results_df.loc[i-1, 'Close']):
            results_df.loc[i, 'Win'] = 1  # Corrected line using .loc



    win_trades = results_df['Win'].sum()
    total_trades = results_df['Trade'].abs().sum()
    win_rate = (win_trades / total_trades) if total_trades > 0 else 0  #防止出现除数为零的情况
    final_return = (results_df['Portfolio Value'].iloc[-1] / initial_capital - 1) * 100
    print(f"Final Return（最终回报）: {final_return:.2f}%")
    print(f"Win Rate（胜率）: {win_rate:.2f}")

    # 可视化
    # plt.figure(figsize=(14, 7))

    # plt.subplot(2, 1, 1)
    # plt.plot(results_df['Date'], results_df['Close'], label='Actual Price')
    # plt.plot(results_df['Date'], results_df['Predicted'], label='Predicted Price')
    # plt.title(f'{SYMBOL} Price and Prediction')
    # plt.xlabel('Date')
    # plt.ylabel('Price')
    # plt.legend()

    # plt.subplot(2, 1, 2)
    # plt.plot(results_df['Date'], results_df['Cumulative Return'], label='Cumulative Return')
    # plt.title(f'{SYMBOL} Cumulative Return')
    # plt.xlabel('Date')
    # plt.ylabel('Cumulative Return')
    # plt.legend()

    # plt.tight_layout()  # 调整子图布局
    plt.show()

    return results_df
# 主程序
if __name__ == '__main__':
    # 获取 Binance 数据
    data = fetch_data(BINANCE_PRICE_URL)
    data2 = fetch_rate_data(FOUNDRATE_URL)
    if data and data2:
        # 处理数据
        df = process_data(data)
        df2 = process_data(data2)
        print(df[['Open time', 'Close', 'Volatility']].tail(1))  # 打印最近几期的波动率
        # # 训练 XGBoost 模型
        model = train_model(df)
        # # 预测未来价格
        future_price = predict_price(model, df)
        current_price = df['Close'].iloc[-1]
        print(f'{SYMBOL}当前价格：{current_price}')

        print(f'{SYMBOL}预测未来{INTERVAL}价格: {future_price}')
        # # 生成交易信号
        generate_signal(current_price, future_price)

         # 回测模型
        results = backtest(df, model)

    
# python版本：3.10.11 安装方法：https://github.com/TA-Lib/ta-lib-python