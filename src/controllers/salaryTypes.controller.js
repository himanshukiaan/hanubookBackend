const SalaryType = require('../models/SalaryType');

exports.create = async (req, res, next) => {
  try {
    const { name, multiplier } = req.body;
    const st = await SalaryType.create({ name, multiplier });
    res.json(st);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await SalaryType.find({});
    res.json(items);
  } catch (err) { next(err); }
};
