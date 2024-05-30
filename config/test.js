const { connectDB, closeDB } = require('./db');

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
    try {
        // Menghubungkan ke database
        await connectDB();
        console.log('Test connection successful');
    } catch (error) {
        console.error('Test connection failed:', error.message);
    } finally {
        // Menutup koneksi database
        closeDB();
    }
};

// Panggil fungsi untuk menguji koneksi database
testConnection();
