const express = require('express');
const cors = require('cors');

const auth = require('./routes/auth');
const masters = require('./routes/masters');
const applicants = require('./routes/applicants');
const admissions = require('./routes/admissions');
const dashboard = require('./routes/dashboard');
const documents = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/masters', masters);
app.use('/api/applicants', applicants);
app.use('/api/admissions', admissions);
app.use('/api/dashboard', dashboard);
app.use('/api/documents', documents);

// Initialize database on startup
const setupPromise = require('./setup');

setupPromise.then(() => {
  app.listen(5000, () => console.log("Server running on 5000"));
}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
