const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, allowRoles } = require('../middleware/auth');

// Allocate Seat
router.post('/allocate', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { applicant_id, program_id, quota_id, allotment_number } = req.body;

    // Validate required fields
    if (!applicant_id || !program_id || !quota_id) {
      await conn.rollback();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lock quota row for update (prevent race conditions)
    const [quota] = await conn.query(
      "SELECT * FROM quotas WHERE id = ? FOR UPDATE",
      [quota_id]
    );

    if (!quota.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Quota not found" });
    }

    // Check if quota is full
    if (quota[0].filled_seats >= quota[0].total_seats) {
      await conn.rollback();
      return res.status(400).json({ error: "Quota Full - No seats available" });
    }

    // Check if applicant already has an admission
    const [existing] = await conn.query(
      "SELECT id FROM admissions WHERE applicant_id = ?",
      [applicant_id]
    );

    if (existing.length) {
      await conn.rollback();
      return res.status(400).json({ error: "Applicant already has an admission" });
    }

    // Create admission record
    const [result] = await conn.query(
      "INSERT INTO admissions(applicant_id, program_id, quota_id, allotment_number) VALUES(?, ?, ?, ?)",
      [applicant_id, program_id, quota_id, allotment_number]
    );

    // Update quota filled_seats
    await conn.query(
      "UPDATE quotas SET filled_seats = filled_seats + 1 WHERE id = ?",
      [quota_id]
    );

    await conn.commit();
    res.json({ 
      message: "Seat Allocated Successfully",
      admission_id: result.insertId
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Confirm Admission & Generate Admission Number
router.post('/confirm/:id', verifyToken, allowRoles('OFFICER', 'ADMIN'), async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Get admission & applicant details
    const [admission] = await conn.query(
      `SELECT a.*, ap.fee_status, p.code as prog_code, am.code as mode_code, ay.year, ct.code as course_code
       FROM admissions a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN programs p ON a.program_id = p.id
       JOIN quotas q ON a.quota_id = q.id
       JOIN admission_modes am ON q.admission_mode_id = am.id
       JOIN academic_years ay ON p.academic_year_id = ay.id
       JOIN course_types ct ON p.course_type_id = ct.id
       WHERE a.id = ? FOR UPDATE`,
      [req.params.id]
    );

    if (!admission.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Admission not found" });
    }

    const adm = admission[0];

    // Check if fee is paid
    if (adm.fee_status !== 'Paid') {
      await conn.rollback();
      return res.status(400).json({ error: "Fee not paid. Cannot confirm admission" });
    }

    // Check if already confirmed
    if (adm.admission_number) {
      await conn.rollback();
      return res.status(400).json({ error: "Admission already confirmed" });
    }

    // Generate Admission Number: INST/2026/UG/CSE/KCET/0001
    const [countResult] = await conn.query(
      "SELECT COUNT(*) + 1 as seq FROM admissions WHERE confirmed = TRUE AND program_id = ?",
      [adm.program_id]
    );
    
    const sequence = String(countResult[0].seq).padStart(4, '0');
    const admissionNumber = `INST/${adm.year}/${adm.course_code}/${adm.prog_code}/${adm.mode_code}/${sequence}`;

    // Update admission with confirmation
    await conn.query(
      "UPDATE admissions SET admission_number = ?, confirmed = TRUE, confirmation_date = NOW() WHERE id = ?",
      [admissionNumber, req.params.id]
    );

    await conn.commit();
    res.json({
      message: "Admission Confirmed Successfully",
      admission_number: admissionNumber
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Get Admission Details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, ap.first_name, ap.last_name, ap.email, ap.fee_status, 
              p.name as program_name, am.name as mode_name
       FROM admissions a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN programs p ON a.program_id = p.id
       JOIN quotas q ON a.quota_id = q.id
       JOIN admission_modes am ON q.admission_mode_id = am.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Admission not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Admissions
router.get('/', verifyToken, allowRoles('OFFICER', 'ADMIN', 'MANAGEMENT'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, ap.first_name, ap.last_name, ap.email, ap.fee_status, 
              p.name as program_name, am.name as mode_name
       FROM admissions a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN programs p ON a.program_id = p.id
       JOIN quotas q ON a.quota_id = q.id
       JOIN admission_modes am ON q.admission_mode_id = am.id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Confirmed Admissions
router.get('/status/confirmed', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, ap.first_name, ap.last_name, ap.email, p.name as program_name
       FROM admissions a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN programs p ON a.program_id = p.id
       WHERE a.confirmed = TRUE
       ORDER BY a.confirmation_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Pending Confirmations
router.get('/status/pending', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, ap.first_name, ap.last_name, ap.email, ap.fee_status, p.name as program_name
       FROM admissions a
       JOIN applicants ap ON a.applicant_id = ap.id
       JOIN programs p ON a.program_id = p.id
       WHERE a.confirmed = FALSE
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;