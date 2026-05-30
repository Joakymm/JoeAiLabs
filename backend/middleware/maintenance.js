const SystemSetting = require('../models/SystemSetting');

exports.maintenanceCheck = async (req, res, next) => {
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin') || req.path === '/api/health') {
    return next();
  }
  try {
    const setting = await SystemSetting.findOne({ key: 'maintenanceMode' });
    if (setting && setting.value === true) {
      const msgSetting = await SystemSetting.findOne({ key: 'announcement' });
      const message = (msgSetting && typeof msgSetting.value === 'object' && msgSetting.value.text)
        ? msgSetting.value.text
        : 'Site is under maintenance. Please check back later.';
      return res.status(503).json({ maintenance: true, message });
    }
    next();
  } catch {
    next();
  }
};
