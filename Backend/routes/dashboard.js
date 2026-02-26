// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, allowRoles } = require('../middleware/auth');

// Main Dashboard Overview
router.get('/', verifyToken, allowRoles('MANAGEMENT', 'ADMIN', 'OFFICER'), async (req, res) => {
  try {
    // Total Intake across all programs
    const [intake] = await db.query("SELECT SUM(intake) as total FROM programs");
    
    // Total filled seats across quotas
    const [filled] = await db.query("SELECT SUM(filled_seats) as total FROM quotas");
    
    // Pending documents
    const [pendingDocs] = await db.query(
      "SELECT COUNT(*) as total FROM applicants WHERE document_status != 'Verified'"
    );
    
    // Fee pending
    const [feePending] = await db.query(
      "SELECT COUNT(*) as total FROM applicants WHERE fee_status = 'Pending'"
    );

    // Confirmed admissions
    const [confirmed] = await db.query(
      "SELECT COUNT(*) as total FROM admissions WHERE confirmed = TRUE"
    );

    const totalIntake = intake[0]?.total || 0;
    const totalFilled = filled[0]?.total || 0;
    const remaining = totalIntake - totalFilled;

    res.json({
      totalIntake,
      filledSeats: totalFilled,
      remaining: remaining > 0 ? remaining : 0,
      pendingDocs: pendingDocs[0]?.total || 0,
      feePending: feePending[0]?.total || 0,
      confirmedAdmissions: confirmed[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Program-wise Dashboard Summary
router.get('/programs', verifyToken, allowRoles('MANAGEMENT', 'ADMIN', 'OFFICER'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name as program_name,
        ct.name as course_type,
        et.name as entry_type,
        p.intake,
        COALESCE(SUM(q.filled_seats), 0) as filled_seats,
        (p.intake - COALESCE(SUM(q.filled_seats), 0)) as remaining_seats
      FROM programs p
      LEFT JOIN quotas q ON p.id = q.program_id
      LEFT JOIN course_types ct ON p.course_type_id = ct.id
      LEFT JOIN entry_types et ON p.entry_type_id = et.id
      GROUP BY p.id, p.name
      ORDER BY p.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quota-wise Status
router.get('/quotas/:program_id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        q.id,
        q.quota_name,
        am.name as mode_name,
        q.total_seats,
        q.filled_seats,
        (q.total_seats - q.filled_seats) as available_seats
      FROM quotas q
      JOIN admission_modes am ON q.admission_mode_id = am.id
      WHERE q.program_id = ?
      ORDER BY am.name
    `, [req.params.program_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applicants with Pending Documents
router.get('/pending-docs', verifyToken, allowRoles('ADMIN', 'OFFICER'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.application_number,
        a.first_name,
        a.last_name,
        a.email,
        p.name as program_name,
        a.document_status,
        a.created_at
      FROM applicants a
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE a.document_status != 'Verified'
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Applicants with Pending Fees
router.get('/pending-fees', verifyToken, allowRoles('ADMIN', 'OFFICER'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.application_number,
        a.first_name,
        a.last_name,
        a.email,
        p.name as program_name,
        a.fee_status,
        a.created_at
      FROM applicants a
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE a.fee_status = 'Pending'
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admission Status Summary
router.get('/admission-status', verifyToken, async (req, res) => {
  try {
    const [confirmed] = await db.query(
      "SELECT COUNT(*) as total FROM admissions WHERE confirmed = TRUE"
    );

    const [pending] = await db.query(
      "SELECT COUNT(*) as total FROM admissions WHERE confirmed = FALSE"
    );

    const [fees] = await db.query(
      "SELECT COUNT(DISTINCT a.id) as total FROM admissions a JOIN applicants ap ON a.applicant_id = ap.id WHERE ap.fee_status = 'Pending' AND a.confirmed = FALSE"
    );

    res.json({
      confirmed: confirmed[0]?.total || 0,
      pending: pending[0]?.total || 0,
      pendingFees: fees[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;