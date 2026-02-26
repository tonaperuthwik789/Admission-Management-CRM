// backend/routes/applicants.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, allowRoles } = require('../middleware/auth');

// Create Applicant (Officer)
router.post('/', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      category,
      date_of_birth,
      gender,
      qualifying_exam,
      qualifying_marks,
      entry_type_id,
      admission_mode_id,
      program_id
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !program_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate phone number - must be exactly 10 digits
    if (phone_number && !/^\d{10}$/.test(phone_number)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // Generate application number
    const timestamp = Date.now();
    const application_number = `APP/${timestamp}`;

    await db.query(
      `INSERT INTO applicants(
        application_number, first_name, last_name, email, phone_number, 
        category, date_of_birth, gender, qualifying_exam, qualifying_marks,
        entry_type_id, admission_mode_id, program_id
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        application_number, first_name, last_name, email, phone_number,
        category, date_of_birth, gender, qualifying_exam, qualifying_marks,
        entry_type_id, admission_mode_id, program_id
      ]
    );

    res.json({ message: "Applicant Created Successfully", application_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Applicants
router.get('/', verifyToken, allowRoles('OFFICER', 'ADMIN', 'MANAGEMENT'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, p.name as program_name, am.name as admission_mode, et.name as entry_type
      FROM applicants a
      LEFT JOIN programs p ON a.program_id = p.id
      LEFT JOIN admission_modes am ON a.admission_mode_id = am.id
      LEFT JOIN entry_types et ON a.entry_type_id = et.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Applicant by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, p.name as program_name, am.name as admission_mode, et.name as entry_type
      FROM applicants a
      LEFT JOIN programs p ON a.program_id = p.id
      LEFT JOIN admission_modes am ON a.admission_mode_id = am.id
      LEFT JOIN entry_types et ON a.entry_type_id = et.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Document Status
router.put('/:id/document', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const { document_status } = req.body;

    if (!['Pending', 'Submitted', 'Verified'].includes(document_status)) {
      return res.status(400).json({ error: "Invalid document status" });
    }

    await db.query(
      "UPDATE applicants SET document_status = ? WHERE id = ?",
      [document_status, req.params.id]
    );

    res.json({ message: "Document Status Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Fee Status
router.put('/:id/fee', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const { fee_status } = req.body;

    if (!['Pending', 'Paid'].includes(fee_status)) {
      return res.status(400).json({ error: "Invalid fee status" });
    }

    await db.query(
      "UPDATE applicants SET fee_status = ? WHERE id = ?",
      [fee_status, req.params.id]
    );

    res.json({ message: "Fee Status Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get applicants by program
router.get('/program/:program_id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.* FROM applicants a WHERE a.program_id = ?`,
      [req.params.program_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending documents applicants
router.get('/documents/pending', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM applicants WHERE document_status != 'Verified' ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending fee applicants
router.get('/fee/pending', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM applicants WHERE fee_status = 'Pending' ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;