const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, allowRoles } = require('../middleware/auth');

// Middleware to verify officer/admin role
const verifyOfficer = (req, res, next) => {
  if (!req.user || !['OFFICER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Get all pending documents
router.get('/pending', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        d.id,
        d.applicant_id,
        d.document_type,
        d.file_path,
        d.upload_date,
        d.verification_status,
        CONCAT(a.first_name, ' ', a.last_name) as applicant_name,
        a.application_number,
        a.email,
        a.phone_number
      FROM documents d
      JOIN applicants a ON d.applicant_id = a.id
      WHERE d.verification_status = 'PENDING'
      ORDER BY d.upload_date DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching pending documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

// Get all verified documents
router.get('/verified', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        d.id,
        d.applicant_id,
        d.document_type,
        d.file_path,
        d.upload_date,
        d.verification_date,
        d.verification_status,
        CONCAT(a.first_name, ' ', a.last_name) as applicant_name,
        a.application_number,
        a.email,
        a.phone_number
      FROM documents d
      JOIN applicants a ON d.applicant_id = a.id
      WHERE d.verification_status = 'VERIFIED'
      ORDER BY d.verification_date DESC
    `);
    res.json(results);
  } catch (err) {
    console.error('Error fetching verified documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

// Verify a document
router.post('/:id/verify', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const verification_date = new Date();

    const [result] = await db.query(`
      UPDATE documents 
      SET verification_status = 'VERIFIED', 
          verification_date = ?,
          verified_by = ?
      WHERE id = ?
    `, [verification_date, req.user.id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document verified successfully' });
  } catch (err) {
    console.error('Error verifying document:', err);
    res.status(500).json({ message: 'Error verifying document', error: err.message });
  }
});

// Reject a document
router.post('/:id/reject', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const [result] = await db.query(`
      UPDATE documents 
      SET verification_status = 'REJECTED', 
          rejection_reason = ?,
          rejection_date = ?,
          rejected_by = ?
      WHERE id = ?
    `, [reason, new Date(), req.user.id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document rejected successfully' });
  } catch (err) {
    console.error('Error rejecting document:', err);
    res.status(500).json({ message: 'Error rejecting document', error: err.message });
  }
});

// Get documents for a specific applicant
router.get('/applicant/:applicantId', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const { applicantId } = req.params;

    const [results] = await db.query(`
      SELECT 
        id,
        applicant_id,
        document_type,
        file_path,
        upload_date,
        verification_status,
        verification_date,
        rejection_reason
      FROM documents 
      WHERE applicant_id = ?
      ORDER BY upload_date DESC
    `, [applicantId]);

    res.json(results);
  } catch (err) {
    console.error('Error fetching applicant documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

// Upload a new document
router.post('/upload/:applicantId', verifyToken, verifyOfficer, async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { document_type, file_path } = req.body;

    if (!document_type || !file_path) {
      return res.status(400).json({ message: 'Document type and file path are required' });
    }

    // Verify applicant exists
    const [applicant] = await db.query('SELECT id FROM applicants WHERE id = ?', [applicantId]);
    if (applicant.length === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    const [result] = await db.query(`
      INSERT INTO documents (applicant_id, document_type, file_path, verification_status, upload_date)
      VALUES (?, ?, ?, 'PENDING', NOW())
    `, [applicantId, document_type, file_path]);

    res.json({ 
      message: 'Document uploaded successfully',
      document_id: result.insertId 
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ message: 'Error uploading document', error: err.message });
  }
});

module.exports = router;
