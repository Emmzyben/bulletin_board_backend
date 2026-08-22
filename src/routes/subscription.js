const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { Subscription } = require('../models');

router.get('/check-trial-upgrade', authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ where: { user_email: req.user.email } });
    if (!sub) {
      return res.json({ plan: 'free', trial_active: true, days_left: 14 });
    }
    
    const now = new Date();
    const trialEnd = new Date(sub.trial_end_date);
    const diffTime = trialEnd - now;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    res.json({
      plan: sub.plan,
      trial_active: now <= trialEnd,
      days_left: Math.max(0, daysLeft)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

router.post('/start-trial', authenticateToken, async (req, res) => {
  try {
    let sub = await Subscription.findOne({ where: { user_email: req.user.email } });
    if (sub) {
      return res.status(400).json({ success: false, message: 'Subscription already exists' });
    }
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    
    sub = await Subscription.create({
      user_email: req.user.email,
      plan: 'pro',
      trial_end_date: trialEnd
    });
    
    res.json({ success: true, message: 'Trial started successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

module.exports = router;
