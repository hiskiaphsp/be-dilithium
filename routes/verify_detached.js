const express = require('express');
const dilithium = require('dilithium-crystals');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Menentukan direktori tempat file akan disimpan

router.post('/', upload.fields([{ name: 'signatureFile', maxCount: 1 }, { name: 'publicKeyFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), async (req, res) => {
    try {
        const startTime = Date.now();

        const { signatureFile, publicKeyFile, pdfFile } = req.files;

        // Path untuk menyimpan file PDF di direktori public
        const pdfFileName = pdfFile[0].originalname;
        const publicPdfPath = path.join(__dirname, '../public', pdfFileName);

        // Path untuk menyimpan file signature di direktori public
        const signatureFileName = signatureFile[0].originalname;
        const publicSignaturePath = path.join(__dirname, '../public', signatureFileName);

        // Path untuk menyimpan file public key di direktori public
        const publicKeyFileName = publicKeyFile[0].originalname;
        const publicPublicKeyPath = path.join(__dirname, '../public', publicKeyFileName);

        // Memindahkan file PDF ke direktori public
        fs.renameSync(pdfFile[0].path, publicPdfPath);

        // Memindahkan file signature ke direktori public
        fs.renameSync(signatureFile[0].path, publicSignaturePath);

        // Memindahkan file public key ke direktori public
        fs.renameSync(publicKeyFile[0].path, publicPublicKeyPath);

        // Read PDF file and extract text content
        const pdfBuffer = fs.readFileSync(publicPdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');

        const messageUint8Array = new TextEncoder().encode(pdfBase64);
        // console.log(messageUint8Array);

        // Read public key and signature from files
        const signatureJSON = fs.readFileSync(publicSignaturePath, 'utf-8');
        const signatureObj = JSON.parse(signatureJSON);
        const publicKeyJSON = fs.readFileSync(publicPublicKeyPath, 'utf-8');
        const publicKeyObj = JSON.parse(publicKeyJSON);

        // Mengambil nilai-nilai dari objek "signature", "message", dan "publicKey"
        const signatureArray = Object.values(signatureObj).map(Number);
        const publicKeyArray = Object.values(publicKeyObj).map(Number);

        // Konversi signature dan publicKey menjadi Uint8Array
        const signatureUint8Array = new Uint8Array(signatureArray);
        const publicKeyUint8Array = new Uint8Array(publicKeyArray);

        // Melakukan operasi verifikasi dengan kunci publik
        const verified = await dilithium.verifyDetached(signatureUint8Array, messageUint8Array, publicKeyUint8Array);

        // Selesai menghitung waktu eksekusi
        const endTime = Date.now();

        // Hitung waktu eksekusi dalam milidetik
        const executionTime = (endTime - startTime) + " ms";

        // Mengambil ukuran file
        const pdfFileSize = fs.statSync(publicPdfPath).size + " bytes";
        const signatureFileSize = fs.statSync(publicSignaturePath).size + " bytes";
        const publicKeyFileSize = fs.statSync(publicPublicKeyPath).size + " bytes";

        // Kirim hasil verifikasi, waktu eksekusi, dan ukuran file sebagai respons
        res.json({
            verified,
            executionTime,
            fileSizes: {
                pdfFileSize,
                signatureFileSize,
                publicKeyFileSize
            }
        });

    } catch (error) {
        res.status(500).send('Error verifying signature');
    }
});

module.exports = router;
