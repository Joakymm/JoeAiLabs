const express = require('express');
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id }).populate('moduleId', 'title');
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const cert = await Certificate.create({ user: req.user._id, moduleId: req.body.moduleId });
    res.status(201).json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
