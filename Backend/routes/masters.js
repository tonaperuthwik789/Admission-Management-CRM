const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, allowRoles } = require('../middleware/auth');

// ============ INSTITUTION ============
router.post('/institution', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { name, code, address, city, state } = req.body;
    await db.query(
      "INSERT INTO institutions(name, code, address, city, state) VALUES(?, ?, ?, ?, ?)",
      [name, code, address, city, state]
    );
    res.json({ message: "Institution Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/institutions', verifyToken, allowRoles('ADMIN', 'OFFICER'), async (req, res) => {
  const [rows] = await db.query("SELECT * FROM institutions");
  res.json(rows);
});

// ============ CAMPUS ============
router.post('/campus', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { institution_id, name, code, address, city } = req.body;
    await db.query(
      "INSERT INTO campuses(institution_id, name, code, address, city) VALUES(?, ?, ?, ?, ?)",
      [institution_id, name, code, address, city]
    );
    res.json({ message: "Campus Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/campuses/:institution_id', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM campuses WHERE institution_id = ?", [req.params.institution_id]);
  res.json(rows);
});

// ============ DEPARTMENT ============
router.post('/department', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { campus_id, name, code } = req.body;
    await db.query(
      "INSERT INTO departments(campus_id, name, code) VALUES(?, ?, ?)",
      [campus_id, name, code]
    );
    res.json({ message: "Department Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/departments/:campus_id', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM departments WHERE campus_id = ?", [req.params.campus_id]);
  res.json(rows);
});

// ============ ACADEMIC YEAR ============
router.post('/academic-year', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { year, start_date, end_date } = req.body;
    await db.query(
      "INSERT INTO academic_years(year, start_date, end_date) VALUES(?, ?, ?)",
      [year, start_date, end_date]
    );
    res.json({ message: "Academic Year Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/academic-years', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM academic_years ORDER BY year DESC");
  res.json(rows);
});

// ============ COURSE TYPE ============
router.get('/course-types', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM course_types");
  res.json(rows);
});

// ============ ENTRY TYPE ============
router.get('/entry-types', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM entry_types");
  res.json(rows);
});

// ============ ADMISSION MODE ============
router.get('/admission-modes', verifyToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM admission_modes");
  res.json(rows);
});

// ============ PROGRAM ============
router.post('/program', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { department_id, academic_year_id, course_type_id, entry_type_id, name, code, intake, duration, branch_name } = req.body;
    
    if (!intake || intake <= 0) {
      return res.status(400).json({ error: "Invalid intake value" });
    }

    await db.query(
      "INSERT INTO programs(department_id, academic_year_id, course_type_id, entry_type_id, name, code, intake, duration, branch_name) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [department_id, academic_year_id, course_type_id, entry_type_id, name, code, intake, duration, branch_name]
    );
    res.json({ message: "Program Created Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/programs', verifyToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, d.name as dept_name, ay.year, ct.name as course_type, et.name as entry_type
    FROM programs p
    JOIN departments d ON p.department_id = d.id
    JOIN academic_years ay ON p.academic_year_id = ay.id
    JOIN course_types ct ON p.course_type_id = ct.id
    JOIN entry_types et ON p.entry_type_id = et.id
  `);
  res.json(rows);
});

router.get('/program/:id', verifyToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, d.name as dept_name, ay.year, ct.name as course_type, et.name as entry_type
    FROM programs p
    JOIN departments d ON p.department_id = d.id
    JOIN academic_years ay ON p.academic_year_id = ay.id
    JOIN course_types ct ON p.course_type_id = ct.id
    JOIN entry_types et ON p.entry_type_id = et.id
    WHERE p.id = ?
  `, [req.params.id]);
  res.json(rows[0] || {});
});

// ============ QUOTA ============
router.post('/quota', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const { program_id, admission_mode_id, quota_name, total_seats } = req.body;

    const seatsNum = parseInt(total_seats, 10);
    if (!seatsNum || seatsNum <= 0) {
      return res.status(400).json({ error: "Invalid seat count" });
    }

    const [program] = await db.query("SELECT intake FROM programs WHERE id = ?", [program_id]);
    if (!program.length) {
      return res.status(400).json({ error: "Program not found" });
    }

    const [sum] = await db.query(
      "SELECT COALESCE(SUM(total_seats), 0) as total FROM quotas WHERE program_id = ?",
      [program_id]
    );

    const existing = parseInt(sum[0]?.total || 0, 10);
    const intake = parseInt(program[0].intake, 10);
    const available = intake - existing;

    if (seatsNum > available) {
      return res.status(400).json({ 
        error: `Invalid quota. Available seats: ${available}, but requested: ${seatsNum}` 
      });
    }

    await db.query(
      "INSERT INTO quotas(program_id, admission_mode_id, quota_name, total_seats) VALUES(?, ?, ?, ?)",
      [program_id, admission_mode_id, quota_name, seatsNum]
    );

    res.json({ message: "Quota Added Successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/quotas/:program_id', verifyToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT q.*, am.name as mode_name
    FROM quotas q
    JOIN admission_modes am ON q.admission_mode_id = am.id
    WHERE q.program_id = ?
  `, [req.params.program_id]);
  res.json(rows);
});

router.get('/quota/:id', verifyToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT q.*, am.name as mode_name
    FROM quotas q
    JOIN admission_modes am ON q.admission_mode_id = am.id
    WHERE q.id = ?
  `, [req.params.id]);
  res.json(rows[0] || {});
});

module.exports = router;