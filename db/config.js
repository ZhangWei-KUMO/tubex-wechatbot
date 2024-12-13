import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'config.db'; // Use a separate DB file for config

// Create the database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('配置文件数据库连接成功');
        // Create the config table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                difyApiKey TEXT,
                geminiApiKey TEXT,
                greeting TEXT,
                pushTime TEXT,
                groups TEXT,
                isEnable INTEGER,
                isPushEnable INTEGER 
            )
        `, (err) => {
            if (err) {
                console.error("Error creating config table:", err.message);
            } else {
                // Insert initial config if the table is empty
                db.get("SELECT COUNT(*) AS count FROM config", [], (err, row) => {
                    if (err) {
                        console.error("Error checking config table:", err.message);
                    } else if (row.count === 0) {
                        const defaultConfig = {
                            difyApiKey: '',
                            geminiApiKey: '',
                            greeting: 'Hello!',
                            pushTime: '09:00', // Example default time
                            groups: '[]', // Example default groups
                            isEnable: 1, // 1 for true, 0 for false
                            isPushEnable: 1, // 1 for true, 0 for false

                        };
                        insertConfig(defaultConfig) // Use the insertConfig function
                            .then(() => console.log("写入默认配置"))
                            .catch(err => console.error("写入数据错误:", err));
                    }
                });
            }
        });

    }
});



// Function to insert or update config (upsert)
export function saveConfig(config) {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) AS count FROM config", [], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.count === 0) {
                // Insert if no config exists
                insertConfig(config).then(resolve).catch(reject);
            } else {
                // Update if config already exists (assuming only one config row)
                updateConfig(config).then(resolve).catch(reject);
            }
        });
    });
}



// Helper function to insert config
function insertConfig(config) {
    const { difyApiKey, geminiApiKey,greeting, groups, pushTime, isEnable,isPushEnable } = config;
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO config (difyApiKey,geminiApiKey, greeting, groups,pushTime, isEnable, isPushEnable) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [difyApiKey, geminiApiKey,greeting, groups,pushTime, isEnable ? 1 : 0, isPushEnable ? 1 : 0],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
    });
}

// Helper function to update config
function updateConfig(config) {
    const { difyApiKey, geminiApiKey,greeting, groups, pushTime, isEnable,isPushEnable } = config;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE config SET difyApiKey = ?,geminiApiKey= ?, greeting = ?, groups = ?, pushTime = ?, isEnable = ? ,isPushEnable = ? WHERE id = 1`, // 更新第一列
            [difyApiKey, geminiApiKey,greeting, groups, pushTime, isEnable ? 1 : 0,isPushEnable ? 1 : 0],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}



// Get config
export function getConfig() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM config WHERE id = 1`, [], (err, row) => {  // Select the first row
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null); // No config found.
            } else {

                // Convert isEnable back to boolean
                row.isEnable = !!row.isEnable; 
                row.isPushEnable = !!row.isPushEnable; 
                resolve(row);
            }
        });
    });
}