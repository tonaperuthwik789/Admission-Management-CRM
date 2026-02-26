const jwt = require('jsonwebtoken');
const SECRET = "admission_secret";

exports.verifyToken = (req,res,next)=>{
  const token = req.headers.authorization;
  if(!token) return res.status(401).send("No Token");

  jwt.verify(token, SECRET,(err,decoded)=>{
    if(err) return res.status(403).send("Invalid Token");
    req.user = decoded;
    next();
  });
};

exports.allowRoles = (...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role))
      return res.status(403).send("Access Denied");
    next();
  };
};

exports.generateToken = (user)=>{
  return jwt.sign({id:user.id,role:user.role},SECRET,{expiresIn:'8h'});
};