import sqlite3 from 'sqlite3';

// 数据库文件名
const dbFile = 'email.db';

// Create the database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('邮箱配置数据库连接成功');
        // Create the email config table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS emailConfig (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                smtpHost TEXT,
                smtpPort TEXT,
                sender TEXT,
                password TEXT,
                receiver TEXT,
                title TEXT,
                content TEXT
            )
        `, (err) => {
            if (err) {
                console.error("Error creating emailConfig table:", err.message);
            } else {
                // Insert initial email config if the table is empty
                db.get("SELECT COUNT(*) AS count FROM emailConfig", [], (err, row) => {
                    if (err) {
                        console.error("Error checking emailConfig table:", err.message);
                    } else if (row.count === 0) {
                        const defaultEmailConfig = {
                            smtpHost: 'smtp.qq.com',
                            smtpPort: '465',
                            sender: '',
                            password: '',
                            receiver: '',
                            title: '微信机器人掉线通知',
                            content: '请及时检查您的机器人掉线状况'
                        };
                        insertEmailConfig(defaultEmailConfig)
                            .then(() => console.log("邮箱写入默认配置"))
                            .catch(err => console.error("邮箱写入数据错误:", err));
                    }
                });
            }
        });

    }
});


// Function to insert or update email config (upsert)
export function saveEmailConfig(emailConfig) {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) AS count FROM emailConfig", [], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.count === 0) {
                // Insert if no email config exists
                insertEmailConfig(emailConfig).then(resolve).catch(reject);
            } else {
                // Update if email config already exists (assuming only one config row)
                updateEmailConfig(emailConfig).then(resolve).catch(reject);
            }
        });
    });
}

// Helper function to insert email config
function insertEmailConfig(emailConfig) {
    const { smtpHost, smtpPort, sender, password, receiver, title, content } = emailConfig;
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO emailConfig (smtpHost, smtpPort, sender, password, receiver, title, content) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [smtpHost, smtpPort, sender, password, receiver, title, content],
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
function updateEmailConfig(emailConfig) {
    const { smtpHost, smtpPort, sender, password, receiver, title, content } = emailConfig;
    return new Promise((resolve, reject) => {
        db.run(`UPDATE emailConfig SET smtpHost = ?, smtpPort = ?, sender = ?, password = ?, receiver = ?, title = ?, content = ? WHERE id = 1`,
            [smtpHost, smtpPort, sender, password, receiver, title, content],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
    });
}



// Get email config
export function getEmailConfig() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM emailConfig WHERE id = 1`, [], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null); // No config found.
            } else {
                resolve(row);
            }
        });
    });
}