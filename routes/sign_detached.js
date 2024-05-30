const express = require('express');
const dilithium = require('dilithium-crystals');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Menentukan direktori tempat file akan disimpan

router.post('/', upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'privateKeyFile', maxCount: 1 }]), async (req, res) => {
    try {
        const startTime = Date.now();

        const { pdfFile, privateKeyFile } = req.files;

        // Menggunakan path.basename() untuk mendapatkan nama file dari path yang diberikan
        const pdfFileName = pdfFile[0].originalname;
        const privateKeyFileName = privateKeyFile[0].originalname;

        // Path untuk menyimpan file PDF di direktori public
        const publicPdfPath = path.join(__dirname, '../public', pdfFileName);
        // Path untuk menyimpan file signature di direktori public
        const publicSignaturePath = path.join(__dirname, '../public', 'signature.json');

        // Memindahkan file PDF ke direktori public
        fs.renameSync(pdfFile[0].path, publicPdfPath);

        // Read PDF file and base64 encode its content
        const pdfBuffer = fs.readFileSync(publicPdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');

        // Convert base64 encoded content to Uint8Array
        const messageUint8Array = new TextEncoder().encode(pdfBase64);
        // console.log(messageUint8Array);

        // Memindahkan private key ke direktori public
        const privateKeyFilePath = privateKeyFile[0].path;
        const fullPrivateKeyPath = path.join(__dirname, '../public', privateKeyFileName);
        fs.renameSync(privateKeyFilePath, fullPrivateKeyPath);

        // Read private key from JSON file
        const privateKeyJSON = fs.readFileSync(fullPrivateKeyPath, 'utf-8');
        const privateKeyObj = JSON.parse(privateKeyJSON);
        const privateKeyArray = Object.values(privateKeyObj).map(Number);
        const privateKeyUint8Array = new Uint8Array(privateKeyArray);

        // Perform signing operation with the private key
        const signed = await dilithium.signDetached(messageUint8Array, privateKeyUint8Array);
        fs.writeFileSync(publicSignaturePath, JSON.stringify(signed));


        // signature size in bytes
        const signatureSizeInBytes = Buffer.byteLength(signed);

        // Finish calculating execution time
        const endTime = Date.now();

        // Calculate execution time and add to output JSON
        const executionTime = (endTime - startTime) / 1000 + " s";
        const executionTimeMinutes = ((endTime - startTime) / 1000) / 60 + " m";

        // Determine file name for download
        const signatureFileName = 'signature.json';

        // Send the signature file as response
        res.download(publicSignaturePath, signatureFileName, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading signature file');
            } else {
                // Remove the signature file after successful download
                fs.unlinkSync(publicSignaturePath);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error signing message');
    }
});

module.exports = router;
