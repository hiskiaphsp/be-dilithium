const express = require('express');
const keypairRoutes = require('./routes/keypair');
const signDetachedRoutes = require('./routes/sign_detached');
const verifyDetachedRoutes = require('./routes/verify_detached');

const app = express();
const port = 3000;

app.use(express.json({ limit: '1000mb' }));

app.use('/keypair', keypairRoutes);
app.use('/sign-detached', signDetachedRoutes);
app.use('/verify-detached', verifyDetachedRoutes);

app.listen(port, () => {
    console.log(`Dilithium Crystals app listening at http://localhost:${port}`);
});
