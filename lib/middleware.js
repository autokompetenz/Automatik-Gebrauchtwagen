const jwt = require('jsonwebtoken');
const prisma = require('./prisma');

// Handle CORS preflight for all handlers
function cors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://automatikgebrauchtwagen.com',
    'https://www.automatikgebrauchtwagen.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const originOk = allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('automatikgebrauchtwagen.com');
  
  res.setHeader('Access-Control-Allow-Origin', originOk ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // preflight handled
  }
  return false;
}

// Verify JWT and attach user to req
async function auth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant' });
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true, phone:true, address:true, monthlySalary:true },
    });
    if (!user) { res.status(401).json({ error: 'Utilisateur introuvable' }); return false; }
    req.user = user;
    return true;
  } catch (e) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
    return false;
  }
}

// Require ADMIN role
function adminOnly(req, res) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Accès administrateur requis' });
    return false;
  }
  return true;
}

module.exports = { cors, auth, adminOnly };
