require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const workerRoutes = require('./routes/worker.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const salaryTypeRoutes = require('./routes/salaryType.routes');
const reportRoutes = require('./routes/report.routes');

const scheduleJob = require('./jobs/monthlySummary.job');

const app = express();
connectDB();
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true, // agar cookies ya auth headers bhejna hai to
  })
);
// app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary-types', salaryTypeRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.send('Labour Management Backend is running'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

scheduleJob();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
