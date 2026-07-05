const SystemSetting = require('../models/SystemSetting');

async function maintenanceCheck(req, res, next) {
  if (req.path.startsWith('/api/settings') || req.path.startsWith('/api/auth')) return next();
  try {
    const setting = await SystemSetting.findOne({ key: { $in: ['maintenance', 'maintenanceMode'] } });
    if (setting && setting.value === true) {
      return res.status(503).json({ success: false, message: 'Site is under maintenance.' });
    }
  } catch (e) {}
  next();
}

module.exports = { maintenanceCheck };
