import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ٹوکن کو ڈی کوڈ کریں
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    console.log('Decoded token:', decoded); // ڈیبگ لائن

    // `decoded.id` کی بنیاد پر یوزر تلاش کریں
    const user = await User.findById(decoded.id); // یہاں `id` استعمال کریں
    console.log('User fetched from DB:', user); // ڈیبگ لائن

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // یوزر کو ریکویسٹ میں شامل کریں
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
