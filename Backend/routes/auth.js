const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

router.post('/register', async (req,res)=>{
  try {
    const {name,email,password,role} = req.body;
    const hashed = await bcrypt.hash(password,10);

    await db.query(
      "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
      [name,email,hashed,role]
    );
    res.json({message: "User Created Successfully"});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({message: "Email already exists"});
    }
    res.status(500).json({message: err.message});
  }
});

router.post('/login', async (req,res)=>{
  try {
    const {email,password} = req.body;
    const [users] = await db.query("SELECT * FROM users WHERE email=?",[email]);

    if(!users.length) return res.status(400).json({message: "User not found"});

    const match = await bcrypt.compare(password,users[0].password);
    if(!match) return res.status(400).json({message: "Wrong password"});

    const token = generateToken(users[0]);
    res.json({token,role:users[0].role});
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

module.exports = router;