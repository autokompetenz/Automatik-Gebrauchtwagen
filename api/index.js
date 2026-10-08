const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { prisma } = require('../lib/prisma.js');
const { sendWelcomeEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendLeadEmail, sendAdminOrderNotificationEmail } = require('../lib/mailer.js');
const { calculateMonthlyPayment, generatePaymentReference } = require('../lib/helpers.js');

// Initialize Express app
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads (memory storage for Vercel compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    fieldSize: 10 * 1024 * 1024, // 10MB limit per field
    // No files or fields limit — handled in route logic
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  }
});

async function uploadCarImages(files) {
  const sorted = [...files].sort((a, b) =>
    a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
  );

  const results = await Promise.all(
    sorted.map(async (file, index) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: `automatik/cars/${Date.now()}-${index}-${safeName}`, folder: 'automatik/cars', resource_type: 'image' },
          (error, result) => { if (error) reject(error); else resolve(result.secure_url); }
        );
        stream.end(file.buffer);
      });

      return { index, url };
    })
  );

  const urls = {};
  results.forEach(({ index, url }) => {
    urls[index === 0 ? 'imageUrl' : `imageUrl${index + 1}`] = url;
  });
  return urls;
}

function parseCarFormBody(data) {
  const price = Number(data.price);
  const minSalaryRaw = data.minSalary;
  const result = {
    make: data.make,
    model: data.model,
    year: Number(data.year),
    price,
    description: data.description || null,
    fuelType: data.fuelType,
    transmission: data.transmission,
    mileage: Number(data.mileage) || 0,
    color: data.color || null,
    power: data.power ? Number(data.power) : null,
    category: data.category,
    minSalary: minSalaryRaw !== undefined && minSalaryRaw !== '' && minSalaryRaw !== null
      ? Number(minSalaryRaw) : null,
    featured: data.featured === 'true' || data.featured === true,
    promotional: data.promotional === 'true' || data.promotional === true,
    isActive: data.isActive !== 'false' && data.isActive !== false,
    monthlyPayment: Number.isFinite(price) && price > 0 ? calculateMonthlyPayment(price * 0.75) : null,
    previousOwners: data.previousOwners ? Number(data.previousOwners) : null,
    accidentFree: data.accidentFree === 'true' || data.accidentFree === true,
    serviceHistory: data.serviceHistory === 'true' || data.serviceHistory === true,
    firstRegistration: data.firstRegistration ? new Date(data.firstRegistration) : null,
    lastInspection: data.lastInspection ? new Date(data.lastInspection) : null,
    historyNotes: data.historyNotes || null,
    technicalData: (() => {
      if (!data.technicalData) return null;
      try { return typeof data.technicalData === 'string' ? JSON.parse(data.technicalData) : data.technicalData; }
      catch { return null; }
    })(),
  };
  for (let i = 1; i <= 20; i++) {
    const key = i === 1 ? 'imageUrl' : `imageUrl${i}`;
    result[key] = data[key] || null;
  }
  return result;
}

// CORS configuration
const corsOptions = {
  origin: [
    'https://automatikgebrauchtwagen.com',
    'https://www.automatikgebrauchtwagen.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Helper functions
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMD-${year}${month}${day}-${random}`;
}

function calculateOrderTotals(subtotal, paymentType) {
  const discountAmount = paymentType === 'full' ? subtotal * 0.05 : 0;
  const discountedTotal = subtotal - discountAmount;
  
  if (paymentType === 'deposit') {
    const depositAmount = discountedTotal * 0.25;
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount, 
      monthlyAmount: null, 
      monthlyDuration: null 
    };
  } else if (paymentType === 'monthly') {
    // Acompte 25% à régler immédiatement, le solde (75%) est financé sur 60 mois à 6%/an
    const monthlyDuration = 60;
    const depositAmount = discountedTotal * 0.25;
    const financedAmount = discountedTotal - depositAmount;
    const r = 0.06 / 12;
    const monthlyAmount = Math.round((financedAmount * r * Math.pow(1 + r, monthlyDuration)) / (Math.pow(1 + r, monthlyDuration) - 1));
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount, 
      monthlyAmount, 
      monthlyDuration 
    };
  } else {
    return { 
      totalPrice: discountedTotal, 
      discountAmount, 
      depositAmount: null, 
      monthlyAmount: null, 
      monthlyDuration: null 
    };
  }
}

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, address:true, monthlySalary:true 
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
}

// Routes

// API Root
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Automatik Gebrauchtwagen API', 
    version: '2.0.0', 
    time: new Date().toISOString() 
  });
});

// Lead Routes (public forms: sell & contact)
app.post('/api/leads', async (req, res) => {
  try {
    const { type, ...data } = req.body || {};
    const leadType = type === 'sell' ? 'sell' : 'contact';
    const name = String(data.name || '').trim();
    const contact = String(data.phone || data.email || '').trim();

    if (!name || !contact) {
      return res.status(400).json({ error: 'Nom et coordonnées requis' });
    }

    const message = String(data.message || data.notes || '').trim();
    if (message.length > 10000) {
      return res.status(400).json({ error: 'Message trop long' });
    }

    await sendLeadEmail({ type: leadType, data: { ...data, type: undefined } });

    res.status(201).json({ success: true, message: 'Demande enregistrée' });
  } catch (e) {
    console.error('Lead error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Connexion réussie', 
      token, 
      user: {
        id: user.id, username: user.username, email: user.email,
        firstName: user.firstName, lastName: user.lastName, role: user.role,
        phone: user.phone, address: user.address, monthlySalary: user.monthlySalary,
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!process.env.ADMIN_CODE || !code || code !== process.env.ADMIN_CODE) {
      return res.status(401).json({ error: 'Code invalide' });
    }
    // Premier compte admin (créé par le seed)
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) return res.status(404).json({ error: 'Aucun compte admin configuré' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id, username: user.username, email: user.email,
        firstName: user.firstName, lastName: user.lastName, role: user.role,
        phone: user.phone, address: user.address, monthlySalary: user.monthlySalary,
      }
    });
  } catch (e) {
    console.error('Admin login error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, monthlySalary } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Mot de passe trop court (min. 8 caractères)' });
    }

    const existing = await prisma.user.findFirst({ 
      where: { OR: [{ email }, { username }] } 
    });
    if (existing) {
      return res.status(409).json({ 
        error: existing.email === email ? 'Email déjà utilisé' : 'Nom d\'utilisateur déjà pris' 
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        username, email, password: hashed, firstName, lastName,
        phone: phone || null, monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null 
      },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, monthlySalary:true 
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ email: user.email, firstName: user.firstName, lastName: user.lastName })
      .catch(err => console.error('Welcome email error:', err));

    res.status(201).json({ message: 'Compte créé avec succès', token, user });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Cars Routes - ORDER MATTERS: specific routes before parameterized routes
app.get('/api/cars', async (req, res) => {
  try {
    console.log('=== GET /api/cars ===');
    console.log('Query params:', req.query);
    
    const { category, brand, search, featured, promotional, campingCar, limit, page = 1,
            minPrice, maxPrice, minYear, maxYear, maxMileage, fuelType, transmission, sort } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page ? (parseInt(page) - 1) * (take || 12) : 0;
    const where = { isActive: true };

    if (category) where.category = category;
    if (brand) where.make = { contains: brand, mode: 'insensitive' };
    if (campingCar === 'true') where.model = { contains: 'camping car', mode: 'insensitive' };
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (maxMileage) where.mileage = { lte: parseInt(maxMileage) };
    if (minYear || maxYear) where.year = { ...(minYear ? { gte: parseInt(minYear) } : {}), ...(maxYear ? { lte: parseInt(maxYear) } : {}) };
    if (minPrice || maxPrice) where.price = { ...(minPrice ? { gte: parseFloat(minPrice) } : {}), ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}) };
    if (search) where.OR = [
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
    if (featured !== undefined) where.featured = featured === 'true';
    if (promotional !== undefined) where.promotional = promotional === 'true';

    const orderBy = sort === 'price_asc' ? { price: 'asc' }
                  : sort === 'price_desc' ? { price: 'desc' }
                  : sort === 'newest' ? { createdAt: 'desc' }
                  : { createdAt: 'desc' };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, take, skip, orderBy }),
      prisma.car.count({ where })
    ]);
    
    console.log('Found cars:', cars.length, 'Total:', total);
    res.json({ cars, total });
  } catch (error) {
    console.error('=== GET /api/cars ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      cars: [],
      total: 0
    });
  }
});

// Brands route MUST come before :id route
app.get('/api/cars/brands', async (req, res) => {
  try {
    console.log('=== GET /api/cars/brands ===');
    const raw = await prisma.car.findMany({
      where: { isActive: true },
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' }
    });
    const brands = raw.map(r => r.make).filter(Boolean);
    console.log('Returning brands:', brands);
    res.json({ brands });
  } catch (error) {
    console.error('=== GET /api/cars/brands ERROR ===', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', brands: [] });
  }
});

// Categories route MUST come before :id route
app.get('/api/cars/categories', async (req, res) => {
  try {
    console.log('=== GET /api/cars/categories ===');
    
    // Use hardcoded categories from Prisma enum for reliability
    const categories = [
      { category: 'SUV', _count: { category: 0 } },
      { category: 'Berline', _count: { category: 0 } },
      { category: 'Citadine', _count: { category: 0 } },
      { category: 'Coupe', _count: { category: 0 } },
      { category: 'Break', _count: { category: 0 } },
      { category: 'Monospace', _count: { category: 0 } },
      { category: 'Utilitaire', _count: { category: 0 } },
      { category: 'FourX4', _count: { category: 0 } }
    ];
    
    console.log('Returning categories:', categories);
    res.json({ categories });
  } catch (error) {
    console.error('=== GET /api/cars/categories ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur',
      categories: []
    });
  }
});

app.get('/api/admin/cars', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cars = await prisma.car.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ cars, total: cars.length });
  } catch (error) {
    console.error('Admin cars list error:', error);
    res.status(500).json({ error: 'Erreur serveur', cars: [], total: 0 });
  }
});

// This MUST come after specific routes like /categories
app.get('/api/cars/:id', async (req, res) => {
  try {
    console.log('=== GET /api/cars/:id ===');
    console.log('Car route param:', req.params.id);
    
    const { id } = req.params;
    const carId = Number(id);
    
    // Validate ID
    if (isNaN(carId) || carId <= 0) {
      console.log('Invalid car ID:', id);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Looking for car ID:', carId);
    
    const car = await prisma.car.findUnique({ 
      where: { id: carId },
      include: {
        _count: {
          select: {
            cartItems: true
          }
        }
      }
    });
    
    console.log('Found car:', car ? 'YES' : 'NO');
    
    if (!car) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    
    res.json({ car });
  } catch (error) {
    console.error('=== GET /api/cars/:id ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur serveur' 
    });
  }
});

// Car Routes
app.post('/api/cars', authenticateToken, requireAdmin, upload.any(), async (req, res) => {
  // Filter only image files from req.files
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    console.log('=== POST /api/cars Debug ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Files uploaded:', req.files?.length || 0);
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'price', 'fuelType', 'transmission', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Champs obligatoires manquants: ${missingFields.join(', ')}`
      });
    }
    
    // Handle FormData for file uploads
    const carData = parseCarFormBody(req.body);

    if (req.files && req.files.length > 0) {
      try {
        const imageUrls = await uploadCarImages(req.files);
        Object.assign(carData, imageUrls);
      } catch (uploadErr) {
        console.error('Supabase upload error:', uploadErr);
        return res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
      }
    }

    console.log('Final carData:', carData);
    const car = await prisma.car.create({ data: carData });
    console.log('Car created:', car);
    res.status(201).json({ car });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du véhicule' });
  }
});

app.put('/api/cars/:id', authenticateToken, requireAdmin, upload.any(), async (req, res) => {
  // Filter only image files from req.files
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    console.log('=== PUT /api/cars/:id ===');
    console.log('Car route param:', req.params.id);
    
    const { id } = req.params;
    const carId = Number(id);
    
    // Validate ID
    if (isNaN(carId) || carId <= 0) {
      console.log('Invalid car ID:', id);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Updating car ID:', carId);
    console.log('Updating car:', id, 'with data:', Object.keys(req.body));
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Files uploaded:', req.files?.length || 0);
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'price', 'fuelType', 'transmission', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Champs obligatoires manquants: ${missingFields.join(', ')}`
      });
    }
    
    const carData = parseCarFormBody(req.body);

    if (req.files && req.files.length > 0) {
      try {
        Object.assign(carData, await uploadCarImages(req.files));
      } catch (uploadErr) {
        console.error('Supabase upload error:', uploadErr);
        return res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
      }
    }

    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
      existingImages.forEach((url, idx) => {
        const fieldName = idx === 0 ? 'imageUrl' : `imageUrl${idx + 1}`;
        if (!carData[fieldName]) carData[fieldName] = url;
      });
    }

    console.log('Final carData:', carData);
    const car = await prisma.car.update({ where: { id: carId }, data: carData });
    console.log('Car updated:', car);
    res.json({ car });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
  }
});

// Toggle car active status
app.patch('/api/cars/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    if (isNaN(carId)) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.car.findUnique({ where: { id: carId } });
    if (!existing) return res.status(404).json({ error: 'Voiture non trouvée' });
    const car = await prisma.car.update({
      where: { id: carId },
      data: { isActive: !existing.isActive },
    });
    res.json({ car });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete car
app.delete('/api/cars/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    if (isNaN(carId) || carId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const existing = await prisma.car.findUnique({ where: { id: carId } });
    if (!existing) return res.status(404).json({ error: 'Voiture non trouvée' });

    // Supprimer toutes les dépendances puis la voiture dans une transaction
    await prisma.$transaction([
      prisma.cart.deleteMany({ where: { carId } }),
      prisma.orderItem.deleteMany({ where: { carId } }),
      prisma.car.delete({ where: { id: carId } }),
    ]);

    res.json({ success: true, message: 'Véhicule supprimé' });
  } catch (e) {
    console.error('Delete car error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression du véhicule' });
  }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' },
    });
    const cartItems = items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      carId: item.carId,
      paymentType: item.paymentType,
      car: item.car,
    }));
    const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);
    res.json({ cartItems, total, count: cartItems.length });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// IMPORTANT: /count MUST come before /:carId to avoid Express matching "count" as a carId
app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.cart.count({
      where: { userId: req.user.id },
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    console.log('=== POST /api/cart ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { carId, quantity = 1, paymentType = 'full' } = req.body;
    
    console.log('Parsed data:', { carId, quantity, paymentType });
    
    const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
    console.log('Found car:', car);
    
    if (!car || !car.isActive) {
      console.log('Car not found or inactive');
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }

    const existingItem = await prisma.cart.findFirst({
      where: { userId: req.user.id, carId: parseInt(carId) },
    });
    
    console.log('Existing item:', existingItem);

    if (existingItem) {
      console.log('Updating existing cart item');
      const newQuantity = existingItem.quantity + quantity;
      const updated = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, paymentType },
        include: { car: true },
      });
      console.log('Updated cart item:', updated);
      
      // Return full cart state like PUT endpoint
      const updatedCart = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
        orderBy: { createdAt: 'desc' }
      });

      const cartItems = updatedCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        carId: item.carId,
        paymentType: item.paymentType,
        car: item.car
      }));

      const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

      console.log('Full cart response after update:', { cartItems, total, count: cartItems.length });
      res.json({ cartItems, total, count: cartItems.length });
    } else {
      console.log('Creating new cart item');
      const created = await prisma.cart.create({
        data: { 
          userId: req.user.id, 
          carId: parseInt(carId), 
          quantity, 
          paymentType 
        },
        include: { car: true },
      });
      console.log('Created cart item:', created);
      
      // Return full cart state for consistency
      const updatedCart = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
        orderBy: { createdAt: 'desc' }
      });

      const cartItems = updatedCart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        carId: item.carId,
        paymentType: item.paymentType,
        car: item.car
      }));

      const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

      console.log('Full cart response after create:', { cartItems, total, count: cartItems.length });
      res.status(201).json({ cartItems, total, count: cartItems.length });
    }
  } catch (e) {
    console.error('=== POST /api/cart ERROR ===');
    console.error('Error details:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ 
      error: e.message || 'Erreur serveur',
      stack: process.env.NODE_ENV !== 'production' ? e.stack : undefined
    });
  }
});

app.put('/api/cart/:carId', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    const { quantity, paymentType } = req.body;

    const cartItem = await prisma.cart.findFirst({
      where: { userId: req.user.id, carId: parseInt(carId) },
      include: { car: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    }

    const updated = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity, paymentType },
      include: { car: true },
    });

    // Fetch updated cart to return complete cart state
    const updatedCart = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { car: true },
      orderBy: { createdAt: 'desc' }
    });

    const cartItems = updatedCart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      carId: item.carId,
      paymentType: item.paymentType,
      car: item.car
    }));

    const total = cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

    console.log('=== Cart PUT Debug ===');
    console.log('Updated cart item:', updated);
    console.log('Full cart response:', { cartItems, total, count: cartItems.length });

    res.json({ cartItems, total, count: cartItems.length });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/cart/:carId', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE /api/cart/:carId ===');
    console.log('Car route param:', req.params.carId);
    
    const { carId } = req.params;
    const carIdNum = Number(carId);
    
    // Validate ID
    if (isNaN(carIdNum) || carIdNum <= 0) {
      console.log('Invalid car ID:', carId);
      return res.status(400).json({ 
        error: 'Invalid car ID - must be a positive number' 
      });
    }
    
    console.log('Removing from cart car ID:', carIdNum);
    await prisma.cart.deleteMany({
      where: { userId: req.user.id, carId: carIdNum },
    });
    const cartCount = await prisma.cart.count({ where: { userId: req.user.id } });
    res.json({ success: true, cartCount });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Orders Routes
app.post('/api/orders', (req, res, next) => {
  // Auth optionnelle : un client peut commander sans compte (email + items dans le body)
  if (req.headers.authorization) return authenticateToken(req, res, next);
  next();
}, upload.single('paymentProof'), async (req, res) => {
  try {
    const { paymentType, shippingAddress, notes, email, firstName, lastName, phone, items } = req.body;
    if (!['full','deposit','monthly'].includes(paymentType)) {
      return res.status(400).json({ error: 'Type de paiement invalide' });
    }
    if (!shippingAddress?.trim()) {
      return res.status(400).json({ error: 'Adresse de livraison requise' });
    }

    // Utilisateur : connecté (req.user via token valide) ou invité (email)
    let user = req.user;
    if (!user && req.headers.authorization) {
      // Token invalide/expiré — on ne bloque pas le checkout invité, on continue sans auth
      console.warn('Token ignoré (invalide) pour commande invitée');
    }
    if (!user) {
      if (!email?.trim()) return res.status(400).json({ error: 'Email requis' });
      const normalized = email.trim().toLowerCase();
      user = await prisma.user.findUnique({ where: { email: normalized } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            username: normalized.split('@')[0] + '_' + Date.now(),
            email: normalized,
            password: await bcrypt.hash(Math.random().toString(36).slice(2), 10),
            firstName: firstName?.trim() || 'Client',
            lastName: lastName?.trim() || '',
            phone: phone?.trim() || null,
            role: 'CLIENT',
          },
        });
      }
      req.user = user;
    }

    // Items : panier serveur (connecté) ou items envoyés (invité)
    let cartItems;
    if (req.body.items) {
      let parsed;
      try { parsed = JSON.parse(items); } catch { return res.status(400).json({ error: 'Items invalides' }); }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.status(400).json({ error: 'Panier vide' });
      }
      const cars = await prisma.car.findMany({ where: { id: { in: parsed.map(i => Number(i.carId)) }, isActive: true } });
      cartItems = parsed.map(i => {
        const car = cars.find(c => c.id === Number(i.carId));
        return car ? { carId: car.id, quantity: Number(i.quantity) || 1, car } : null;
      }).filter(Boolean);
      if (cartItems.length === 0) return res.status(400).json({ error: 'Véhicules introuvables' });
    } else {
      cartItems = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: { car: true },
      });
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Panier vide' });
      }
    }

    // Upload payment proof (Bank transfer receipt) to Cloudinary
    let paymentProofUrl = null;
    if (req.file) {
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      paymentProofUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: `${Date.now()}-${safeName}`, folder: 'automatik/proofs', resource_type: 'auto' },
          (error, result) => { if (error) reject(error); else resolve(result.secure_url); }
        );
        stream.end(req.file.buffer);
      });
    }

    const subtotal = cartItems.reduce((s, i) => s + i.car.price * i.quantity, 0);
    const totals = calculateOrderTotals(subtotal, paymentType);

    // Generate unique order number
    let orderNumber, exists = true;
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = !!(await prisma.order.findUnique({ where: { orderNumber } }));
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: { 
          orderNumber, 
          userId: req.user.id, 
          paymentType, 
          shippingAddress, 
          notes: notes || null, 
          paymentReference: generatePaymentReference(req.user, cartItems[0]?.car, orderNumber),
          paymentProofUrl,
          ...totals 
        },
      });
      
      await tx.orderItem.createMany({
        data: cartItems.map(i => ({ 
          orderId: newOrder.id, 
          carId: i.carId, 
          quantity: i.quantity, 
          unitPrice: i.car.price 
        })),
      });

      await tx.orderTracking.create({
        data: { orderId: newOrder.id, status: 'pending', comment: 'Commande reçue' },
      });

      // Payment schedule (échéancier) based on payment method
      const now = new Date();
      const schedule = [];
      if (paymentType === 'monthly') {
        schedule.push({ orderId: newOrder.id, type: 'deposit', amount: totals.depositAmount, dueDate: now });
        const duration = Number(totals.monthlyDuration) || 0;
        for (let i = 1; i <= duration; i++) {
          const d = new Date(now);
          d.setMonth(d.getMonth() + i);
          schedule.push({ orderId: newOrder.id, type: 'monthly', amount: totals.monthlyAmount, dueDate: d });
        }
      } else if (paymentType === 'deposit') {
        schedule.push({ orderId: newOrder.id, type: 'deposit', amount: totals.depositAmount, dueDate: now });
        const balance = subtotal - totals.depositAmount;
        schedule.push({ orderId: newOrder.id, type: 'balance', amount: balance, dueDate: null });
      } else {
        schedule.push({ orderId: newOrder.id, type: 'full', amount: totals.totalPrice, dueDate: now });
      }
      if (schedule.length) {
        await tx.payment.createMany({ data: schedule });
      }
      
      await tx.cart.deleteMany({ where: { userId: req.user.id } });
      return newOrder;
    });

    try {
      const bank = await getBankInfo();
      await sendOrderConfirmationEmail({
        email: req.user.email,
        firstName: req.user.firstName,
        order: { ...order, createdAt: order.createdAt || new Date() },
        items: cartItems.map(i => ({ car: i.car, unitPrice: i.car.price, quantity: i.quantity })),
        // L'adresse de paiement est communiquée uniquement après validation (email 'confirmed')
      });
    } catch (err) {
      console.error('Order confirmation email error:', err);
    }

    try {
      await sendAdminOrderNotificationEmail({
        customer: { firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, phone: req.user.phone },
        order: { ...order, createdAt: order.createdAt || new Date() },
        items: cartItems.map(i => ({ car: i.car, unitPrice: i.car.price, quantity: i.quantity })),
        paymentProof: req.file ? {
          buffer: req.file.buffer,
          name: req.file.originalname,
          mimetype: req.file.mimetype,
        } : null,
      });
    } catch (err) {
      console.error('Admin order notification email error:', err);
    }

    res.status(201).json({ success: true, orderNumber: order.orderNumber, order });
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    // User orders
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { car: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    // Admin orders
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const where = status ? { status } : {};
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where, 
          include: { 
            user: { select: { firstName:true, lastName:true, email:true } }, 
            items: { include: { car: true } } 
          },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page)-1)*parseInt(limit), 
          take: parseInt(limit),
        }),
        prisma.order.count({ where }),
      ]);
      const statusCounts = await prisma.order.groupBy({ 
        by:['status'], 
        _count: { status: true } 
      });
      res.json({ orders, total, statusCounts });
    } catch (e) { 
      res.status(500).json({ error: 'Erreur serveur' }); 
    }
  }
});

// IMPORTANT: /my MUST come before /:id to avoid Express matching "my" as an ID
app.get('/api/orders/my', authenticateToken, async (req, res) => {
  try {
    console.log('=== GET /api/orders/my ===');
    console.log('User ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié', orders: [] });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { 
        items: { include: { car: true } },
        tracking: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const transformedOrders = orders.map(order => ({
      ...order,
      items: order.items || [],
      tracking: order.tracking || [],
      payments: order.payments || []
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    console.error('GET /api/orders/my ERROR:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', orders: [] });
  }
});

// Commandes par email (client sans compte)
app.get('/api/orders/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email?.trim()) return res.status(400).json({ error: 'Email requis', orders: [] });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.json([]);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { car: true } },
        tracking: { orderBy: { createdAt: 'desc' } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('GET /api/orders/by-email ERROR:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', orders: [] });
  }
});

// Supports both numeric ID and orderNumber string (e.g. CMD-20260507-1234)
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);
    const isNumeric = !isNaN(orderId) && orderId > 0;

    const where = isNumeric ? { id: orderId } : { orderNumber: id };
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const order = await prisma.order.findFirst({
      where,
      include: { 
        user: { select: { firstName:true, lastName:true, email:true } }, 
        items: { include: { car: true } },
        tracking: { 
          include: { admin: { select: { firstName:true, lastName:true } } },
          orderBy: { createdAt: 'desc' }
        },
        payments: { orderBy: { dueDate: 'asc' } }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ order });
  } catch (e) {
    console.error('GET /api/orders/:id ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: { select: { email: true, firstName: true } },
        items: { include: { car: true } },
        tracking: { 
          include: { admin: { select: { firstName:true, lastName:true } } },
          orderBy: { createdAt: 'desc' }
        },
        payments: { orderBy: { dueDate: 'asc' } }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ order });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update order status
app.patch('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, bankInfo } = req.body;
    const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Adresse de paiement spécifique à cette commande (définissable par l'admin à la validation)
    const setPaymentData = bankInfo && (bankInfo.iban !== undefined || bankInfo.bic !== undefined || bankInfo.beneficiary !== undefined || bankInfo.transferType !== undefined)
      ? {
          paymentIban: bankInfo.iban ?? currentOrder?.paymentIban ?? null,
          paymentBic: bankInfo.bic ?? currentOrder?.paymentBic ?? null,
          paymentBeneficiary: bankInfo.beneficiary ?? currentOrder?.paymentBeneficiary ?? null,
          paymentTransferType: bankInfo.transferType ?? currentOrder?.paymentTransferType ?? null,
        }
      : undefined;
    
    // Get current order to check if status changed
    const currentOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { email: true, firstName: true } } }
    });
    
    const statusChanged = currentOrder.status !== status;
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status, ...(setPaymentData || {}) },
    });
    
    await prisma.orderTracking.create({
      data: { orderId: order.id, status, comment: comment || null, updatedBy: req.user.id },
    });
    
    // Send email if status changed or if there's a comment
    let emailSent = false;
    if (statusChanged || comment) {
      const globalBank = await getBankInfo();
      const orderBank = (order.paymentIban || order.paymentBic || order.paymentBeneficiary)
        ? { iban: order.paymentIban, bic: order.paymentBic, beneficiary: order.paymentBeneficiary, transferType: order.paymentTransferType }
        : globalBank;
      try {
        await sendOrderStatusUpdateEmail({
          email: currentOrder.user.email,
          firstName: currentOrder.user.firstName,
          orderNumber: order.orderNumber,
          status,
          comment,
          statusChanged,
          bank: status === 'confirmed' ? orderBank : undefined,
        });
      } catch (err) { console.error('Order status update email error:', err); }
      emailSent = true;
    }
    
    res.json({ success: true, order, emailSent });
  } catch (e) {
    console.error('PATCH /api/orders/:id ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: add a payment record to an order (acompte, mensualité, solde, total)
app.post('/api/orders/:id/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, dueDate, reference, note } = req.body;
    const validTypes = ['full', 'deposit', 'monthly', 'balance'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Type de paiement invalide' });
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        type,
        amount: parsedAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        reference: reference || null,
        note: note || null,
      },
    });
    res.status(201).json({ success: true, payment });
  } catch (e) {
    console.error('POST /api/orders/:id/payments ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update a payment status (validate as paid, mark late, cancel...)
app.patch('/api/admin/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'late', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut de paiement invalide' });
    }
    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : status === 'pending' ? null : undefined,
      },
    });
    res.json({ success: true, payment });
  } catch (e) {
    console.error('PATCH /api/admin/payments/:id ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: delete order (cascades items & tracking via schema)
app.delete('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    await prisma.order.delete({ where: { id: orderId } });
    res.json({ success: true, id: orderId });
  } catch (e) {
    console.error('DELETE /api/orders/:id ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// User Routes
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, monthlySalary } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        firstName, 
        lastName, 
        phone: phone || null, 
        address: address || null, 
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null 
      },
      select: { 
        id:true, username:true, email:true, firstName:true, lastName:true, 
        role:true, phone:true, address:true, monthlySalary:true 
      },
    });
    res.json({ message: 'Profil mis à jour', user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Nouveau mot de passe trop court (min. 8 caractères)' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalClients = await prisma.user.count();
    const totalCars = await prisma.car.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    
    const revenueResult = await prisma.order.aggregate({ 
      _sum: { totalPrice: true } 
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;
    
    const pendingOrders = await prisma.order.count({ 
      where: { status: 'pending' } 
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { firstName:true, lastName:true } },
        items: { include: { car: { select: { make:true, model:true } } } }
      },
    });

    res.json({
      stats: {
        totalClients,
        totalCars,
        totalOrders,
        totalRevenue,
        pendingOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      stats: {
        totalClients: 0,
        totalCars: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
      },
      recentOrders: [],
      error: 'Erreur récupération statistiques'
    });
  }
});

app.get('/api/admin/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    
    const where = { role: 'CLIENT' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total, spentAgg] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:true, username:true, email:true, firstName:true, lastName:true,
          phone:true, address:true, monthlySalary:true, createdAt:true,
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: 'desc' },
        take, skip,
      }),
      prisma.user.count({ where }),
      prisma.order.groupBy({ by:['userId'], _sum: { totalPrice: true } }),
    ]);

    const spentMap = new Map(spentAgg.map(o => [o.userId, o._sum.totalPrice || 0]));
    const result = clients.map(c => ({
      ...c,
      orderCount: c._count.orders,
      totalSpent: spentMap.get(c.id) || 0,
      _count: undefined,
    }));

    res.json({ clients: result, total, page: parseInt(page), limit: take });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: delete a client (removes their orders, cart & tracking in a transaction)
app.delete('/api/admin/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (target.role === 'ADMIN') {
      return res.status(400).json({ error: 'Impossible de supprimer un administrateur' });
    }

    await prisma.$transaction(async (tx) => {
      const orderIds = (await tx.order.findMany({
        where: { userId },
        select: { id: true },
      })).map(o => o.id);

      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.orderTracking.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
      }
      await tx.cart.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ success: true, id: userId });
  } catch (e) {
    console.error('DELETE /api/admin/clients/:id ERROR:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Bank settings helper
async function getBankInfo() {
  const bank = await prisma.bankInfo.findFirst();
  return bank || { iban: '', bic: '', beneficiary: 'AUTOMATIK GEBRAUCHTWAGEN', transferType: 'SEPA' };
}

// Public bank details (shown on order confirmation for wire transfer)
app.get('/api/bank', async (req, res) => {
  try {
    res.json({ bank: await getBankInfo() });
  } catch (e) {
    console.error('GET /api/bank error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: read bank settings
app.get('/api/admin/bank', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({ bank: await getBankInfo() });
  } catch (e) {
    console.error('GET /api/admin/bank error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update bank settings (single row, upsert)
app.put('/api/admin/bank', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { iban, bic, beneficiary, transferType } = req.body || {};
    if (iban === undefined && bic === undefined && beneficiary === undefined && transferType === undefined) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    const existing = await prisma.bankInfo.findFirst();
    const bank = existing
      ? await prisma.bankInfo.update({
          where: { id: existing.id },
          data: {
            iban: iban ?? existing.iban,
            bic: bic ?? existing.bic,
            beneficiary: beneficiary ?? existing.beneficiary,
            transferType: transferType ?? existing.transferType,
          },
        })
      : await prisma.bankInfo.create({
          data: {
            iban: iban || '',
            bic: bic || '',
            beneficiary: beneficiary || 'AUTOMATIK GEBRAUCHTWAGEN',
            transferType: transferType || 'SEPA',
          },
        });
    res.json({ success: true, bank });
  } catch (e) {
    console.error('PUT /api/admin/bank error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulation Route
app.get('/api/simulation', async (req, res) => {
  try {
    const salary = parseFloat(req.query.salary);
    if (!salary || salary <= 0) {
      return res.status(400).json({ error: 'Salaire invalide' });
    }
    const maxMonthly = salary * 0.3;
    // Find cars affordable via monthly payment (60 months, 6%/year, 25% deposit financed over 75%)
    const r = 0.06 / 12;  
    const months = 60;
    // Max affordable price from monthly budget: price = maxMonthly * (((1+r)^n - 1) / (r*(1+r)^n)) / 0.75
    // (seuls 75% du prix sont financés, les 25% sont réglés en acompte)
    const factor = (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
    const maxAffordablePrice = (maxMonthly * factor) / 0.75;

    const cars = await prisma.car.findMany({
      where: { isActive: true, price: { lte: maxAffordablePrice } },
      orderBy: { price: 'desc' },
    });

    res.json({ count: cars.length, salary, maxMonthly, cars });
  } catch (e) {
    console.error('Simulation error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Export the Express app for Vercel
module.exports = app;