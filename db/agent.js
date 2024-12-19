import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'agent.db';

// Create the database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS agentConfig (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT,
                prompt TEXT,
                tasks TEXT,
                news INTEGER,
                cryptoCurrency INTEGER
            )
        `, (err) => {
            if (err) {
                console.error("创建 agentConfig table错误:", err.message);
            } else {
                // Insert initial email config if the table is empty
                db.get("SELECT COUNT(*) AS count FROM agentConfig", [], (err, row) => {
                    if (err) {
                        console.error("Error checking agentConfig table:", err.message);
                    } else if (row.count === 0) {
                        const defaultEmailConfig = {
                            model: 'gemini-1.5-flash',
                            prompt: '你是一个机器人',
                            tasks: '其他',
                            news: 0,
                            cryptoCurrency: 0,
                        };
                        insertConfig(defaultEmailConfig)
                           
                    }
                });
            }
        });

    }
});


export function saveAgentConfig(config) {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) AS count FROM agentConfig", [], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.count === 0) {
                insertConfig(config).then(resolve).catch(reject);
            } else {
                updateConfig(config).then(resolve).catch(reject);
            }
        });
    });
}

function insertConfig( config) {
    const { model, prompt,tasks,news,cryptoCurrency } =   config;
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO agentConfig (model, prompt,tasks,news,cryptoCurrency) VALUES (?,?,?,?,?)`,
            [model, prompt,tasks,news,cryptoCurrency],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
    });
}


function updateConfig(config) {
    const { model, prompt, tasks, news, cryptoCurrency } = config;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE agentConfig SET model = ?, prompt = ?, tasks = ?, news = ?, cryptoCurrency = ? WHERE id = 1`,
            [model, prompt, tasks, news, cryptoCurrency],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}



// 获取TTS配置
export function getAgentConfig() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM agentConfig WHERE id = 1`, [], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null); 
            } else {
                resolve(row);
            }
        });
    });
}