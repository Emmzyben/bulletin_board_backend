const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PinataSDK } = require('pinata');

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

router.get('/presigned_url', authenticateToken, async (req, res) => {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 3600, // 1 hour
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    });
    res.json({ url });
  } catch (error) {
    console.error('Error creating Pinata signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

module.exports = router;
