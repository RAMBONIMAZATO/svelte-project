const express = require('express');
const app = express();

// configurer un répertoire public pour héberger du contenu statique
app.use(express.static(`${__dirname}/public`));

const ipaddress = '127.0.0.1';
const port      = 5656;

app.listen(port, ipaddress);
console.log(`LocalHost Running at port: ${port}`);
