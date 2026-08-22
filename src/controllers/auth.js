const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const parseCommunities = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

const serializeUser = (user) => {
  const userData = user.toJSON ? user.toJSON() : { ...user };
  delete userData.password;
  userData.joined_communities = parseCommunities(userData.joined_communities);
  return userData;
};

const signup = async (req, res) => {
  try {
    const { email, password, role, bio, location, primary_ecosystem, avatar_url, full_name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByPk(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      full_name: full_name || email.split('@')[0],
      role: role || 'user',
      bio,
      location,
      primary_ecosystem,
      avatar_url,
    });

    const token = jwt.sign({ email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: serializeUser(newUser), token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByPk(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: serializeUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.email, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(serializeUser(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, login, getMe };
