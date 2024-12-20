import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'tts.db';

// Create the database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS ttsConfig (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                azurekey TEXT,
                azureregion TEXT
            )
        `, (err) => {
            if (err) {
                console.error("Error creating ttsConfig table:", err.message);
            } else {
                // Insert initial email config if the table is empty
                db.get("SELECT COUNT(*) AS count FROM ttsConfig", [], (err, row) => {
                    if (err) {
                        console.error("Error checking ttsConfig table:", err.message);
                    } else if (row.count === 0) {
                        const defaultEmailConfig = {
                            azurekey: '',
                            azureregion: '',
                        };
                        insertTtsConfig(defaultEmailConfig)
                        
                    }
                });
            }
        });

    }
});


export function saveTTSConfig(config) {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) AS count FROM ttsConfig", [], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.count === 0) {
                insertTtsConfig(config).then(resolve).catch(reject);
            } else {
                updateTtsConfig(config).then(resolve).catch(reject);
            }
        });
    });
}

// Helper function to insert email config
function insertTtsConfig(  config) {
    const { azurekey, azureregion } =   config;
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO ttsConfig (azurekey, azureregion) VALUES (?, ?)`,
            [azurekey, azureregion],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
    });
}


// Helper function to update email config
function updateTtsConfig(  config) {
    const { azurekey, azureregion } =   config;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE ttsConfig SET azurekey = ?, azureregion = ? WHERE id = 1`,
            [azurekey, azureregion],
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
export function getTTSConfig() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM ttsConfig WHERE id = 1`, [], (err, row) => {
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