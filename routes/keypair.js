const express = require('express');
const dilithium = require('dilithium-crystals');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const router = express.Router();
router.get('/', async (req, res) => {
    try {
        // Generate key pair
        const keyPair = await dilithium.keyPair();

        // Simpan kunci publik ke dalam file pk.json
        fs.writeFileSync('pk.json', JSON.stringify(keyPair.publicKey));

        // Simpan kunci privat ke dalam file sk.json
        fs.writeFileSync('sk.json', JSON.stringify(keyPair.privateKey));

        // Buat file zip yang berisi kedua kunci
        const archive = archiver('zip');
        archive.append(fs.createReadStream('pk.json'), { name: 'public_key.json' });
        archive.append(fs.createReadStream('sk.json'), { name: 'private_key.json' });

        // Atur header untuk respons zip
        res.attachment('key_pair.zip');

        // Pipa file zip ke respons
        archive.pipe(res);

        // Mulai proses pengarsipan
        archive.finalize();
    } catch (error) {
        res.status(500).send('Error generating key pair');
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.body.publicKeyPath || !req.body.privateKeyPath) {
            return res.status(400).json({ error: 'Both publicKeyPath and privateKeyPath are required' });
        }

        // Mulai menghitung waktu eksekusi
        const startTime = Date.now();

        // Generate key pair
        const keyPair = await dilithium.keyPair();

        //bit length
        const publicKeySizeInBytes = Buffer.byteLength(keyPair.publicKey);
        const privateKeySizeInBytes = Buffer.byteLength(keyPair.privateKey);

        // size
        const publicKeySizeInKb = publicKeySizeInBytes / 1024;
        const publicKeySizeInMb = publicKeySizeInKb / 1024;

        const privateKeySizeInKb = privateKeySizeInBytes / 1024;
        const privateKeySizeInMb = privateKeySizeInKb / 1024;

        // Tentukan jalur penyimpanan berdasarkan parameter pada permintaan POST
        const publicKeyPath = path.join(req.body.publicKeyPath || 'pk.json');
        const privateKeyPath = path.join(req.body.privateKeyPath || 'sk.json');

        // Simpan kunci publik ke dalam file pk.json
        fs.writeFileSync(publicKeyPath, JSON.stringify(keyPair.publicKey));

        // Simpan kunci privat ke dalam file sk.json
        fs.writeFileSync(privateKeyPath, JSON.stringify(keyPair.privateKey));

        // Selesai menghitung waktu eksekusi
        const endTime = Date.now();

        // Hitung waktu eksekusi dan tambahkan ke output json
        const executionTime = (endTime - startTime) / 1000 + " s";
        const executionTimeMinutes = ((endTime - startTime) / 1000) / 60+ " m";
        res.json({
            message: 'Key pair generated and saved successfully',
            executionTime,
            executionTimeMinutes,
            publicKeySizeInBytes,
            privateKeySizeInBytes,
            publicKeySizeInKb,
            publicKeySizeInMb,
            privateKeySizeInKb,
            privateKeySizeInMb
        });
    } catch (error) {

        res.status(500).send('Error generating key pair');
    }
});

module.exports = router;