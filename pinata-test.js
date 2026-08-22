const { PinataSDK } = require('pinata');
const pinata = new PinataSDK({ pinataJwt: "test" });
console.log('signatures.public', Object.keys(pinata.signatures.public));
console.log('upload.public', Object.keys(pinata.upload.public));
