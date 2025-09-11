require('dotenv').config();
const connectDB = require('./config/db');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const SalaryType = require('./models/SalaryType');

const seed = async () => {
  await connectDB();
  const plans = [
    { name: 'Free', price: 0, maxWorkers: 1 },
    { name: 'Basic', price: 199, maxWorkers: 10 },
    { name: 'Pro', price: 499, maxWorkers: 50 }
  ];
  for (const p of plans) {
    await SubscriptionPlan.updateOne({ name: p.name }, p, { upsert: true });
  }
  const types = [
    { name: 'Full Day', multiplier: 1 },
    { name: 'Half Day', multiplier: 0.5 },
    { name: 'Absent', multiplier: 0 },
    { name: 'Overtime', multiplier: 1.5 }
  ];
  for (const t of types) {
    await SalaryType.updateOne({ name: t.name }, t, { upsert: true });
  }
  console.log('Seeded plans and salary types');
  process.exit(0);
};

seed();
