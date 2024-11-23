import pandas as pd
import requests
import time
from datetime import datetime

# 币安 API 基础 URL
BASIS_URL = "https://fapi.binance.com/futures/data/basis"
SYMBOL = "DOGE"  # 替换为你想要监听的币种
INTERVAL = "1m"  # 1 分钟间隔
LIMIT = 1  # 获取最新数据
THRESHOLD = 2 # 基差波动阈值，例如 200%

# 用于存储上一次基差的值
last_basis = None

def fetch_basis_data(symbol, interval, limit):
    url = f"{BASIS_URL}?pair={symbol}USDT&period={interval}&limit={limit}&contractType=PERPETUAL"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data:  # 检查数据是否为空列表
            return float(data[0]['basis'])  # 返回最新的 basis 值
        else:
            print("Empty data received from API.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing data: {e}")
        return None

def main():
    global last_basis #使用全局变量

    while True:
        current_basis = fetch_basis_data(SYMBOL, INTERVAL, LIMIT)

        if current_basis is not None:
            if last_basis is not None:
                basis_change = abs((current_basis - last_basis) / last_basis) # 计算基差变化百分比
                if basis_change >= THRESHOLD:
                    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    print(f"{current_time} - Basis changed significantly: {basis_change:.2%}, Current Basis: {current_basis:.8f}")
                else:
                    print(f"No significant change in basis, Current Basis: {current_basis:.8f}")
            last_basis = current_basis # 更新 last_basis

        time.sleep(60)  # 每分钟检查一次


if __name__ == "__main__":
    main()

