const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

// Dapatkan path absolut ke file config.json
const configPath = path.join(__dirname, 'config.json');

// Baca file konfigurasi
let config;
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')).database;
} catch (error) {
    console.error('Error reading config file:', error.message);
    process.exit(1);
}

// Buat koneksi ke database MySQL
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    insecureAuth: true
});

// Fungsi untuk melakukan koneksi ke database
const connectDB = () => {
    return new Promise((resolve, reject) => {
        try {
            connection.connect(error => {
                if (error) {
                    console.error('Error connecting to database:', error.message);
                    reject(error);
                } else {
                    console.log('Database connected successfully');
                    resolve();
                }
            });
        } catch (error) {
            console.error('Error connecting to database:', error.message);
            reject(error);
        }
    });
};

// Fungsi untuk menutup koneksi database
const closeDB = () => {
    connection.end(error => {
        if (error) {
            console.error('Error closing database connection:', error.message);
        } else {
            console.log('Database connection closed successfully');
        }
    });
};

module.exports = {
    connection,
    connectDB,
    closeDB
};
