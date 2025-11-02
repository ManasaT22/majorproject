
// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import nodemailer from 'nodemailer';
// import cron from 'node-cron';
// import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';

// dotenv.config();

// // ==================== APP SETUP ====================
// const app = express();
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ==================== ENVIRONMENT VALIDATION ====================
// if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
//   console.error('❌ Missing environment variables: MONGODB_URI or JWT_SECRET');
//   process.exit(1);
// }

// // ==================== DATABASE CONNECTION ====================
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err);
//     process.exit(1);
//   });


// // ==================== SCHEMAS ====================
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   emergencyContacts: [{
//     name: String,
//     phone: String,
//     email: String,
//     relationship: String
//   }],
//   medicalHistory: { type: String, default: '' },
//   createdAt: { type: Date, default: Date.now }
// });

// const vitalsSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   bp_systolic: Number,
//   bp_diastolic: Number,
//   sugar: Number,
//   weight: Number,
//   heartRate: Number,
//   sleep: Number,
//   water: Number
// });

// const medicationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name: { type: String, required: true },
//   time: { type: String, required: true },
//   frequency: { type: String, required: true },
//   active: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now }
// });

// const mealSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   meal: { type: String, required: true },
//   items: { type: String, required: true },
//   calories: { type: Number, required: true }
// });

// const activitySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   type: { type: String, required: true },
//   duration: { type: Number, required: true },
//   calories: { type: Number, required: true }
// });

// const moodSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   mood: { type: String, required: true },
//   stress: { type: Number, required: true },
//   notes: { type: String, default: '' }
// });

// const groupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   createdAt: { type: Date, default: Date.now }
// });

// const messageSchema = new mongoose.Schema({
//   groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   content: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// // ==================== MODELS ====================
// const User = mongoose.model('User', userSchema);
// const Vitals = mongoose.model('Vitals', vitalsSchema);
// const Medication = mongoose.model('Medication', medicationSchema);
// const Meal = mongoose.model('Meal', mealSchema);
// const Activity = mongoose.model('Activity', activitySchema);
// const Mood = mongoose.model('Mood', moodSchema);
// const Group = mongoose.model('Group', groupSchema);
// const Message = mongoose.model('Message', messageSchema);

// // ==================== MIDDLEWARE ====================
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Access token required' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// };

// // ==================== AUTH ROUTES ====================
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       emergencyContacts: [],
//       medicalHistory: ''
//     });

//     await user.save();

//     // Create empty health data for new user
//     const healthData = new HealthData({
//       userId: user._id,
//       vitals: [],
//       medications: [],
//       meals: [],
//       activities: [],
//       mood: []
//     });
//     await healthData.save();

//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Login failed' });
//   }
// });
// // app.post('/api/auth/register', async (req, res) => {
// //   console.log('Register request body:', req.body);
// //   try {
// //     const { name, email, password } = req.body;
// //     if (!name || !email || !password) {
// //       return res.status(400).json({ error: 'Name, email, and password are required' });
// //     }

// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ error: 'User already exists' });

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const user = new User({ name, email, password: hashedPassword });
// //     const savedUser = await user.save();
// //     console.log('User saved:', savedUser);

// //     const token = jwt.sign({ userId: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// //     res.status(201).json({ message: 'User registered successfully', token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } });
// //   } catch (error) {
// //     console.error('Registration error:', error);
// //     res.status(500).json({ error: 'Registration failed', details: error.message });
// //   }
// // });

// // app.post('/api/auth/login', async (req, res) => {
// //   console.log('Login request body:', req.body);
// //   try {
// //     const { email, password } = req.body;
// //     if (!email || !password) {
// //       return res.status(400).json({ error: 'Email and password are required' });
// //     }

// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(400).json({ error: 'Invalid credentials' });

// //     const validPassword = await bcrypt.compare(password, user.password);
// //     if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

// //     const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// //     res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ error: 'Login failed', details: error.message });
// //   }
// // });

// // ==================== VITALS ROUTES ====================
// app.get('/api/vitals', authenticateToken, async (req, res) => {
//   try {
//     const vitals = await Vitals.find({ userId: req.user.userId }).sort({ date: -1 });
//     res.json(vitals);
//   } catch (error) {
//     console.error('Error fetching vitals:', error);
//     res.status(500).json({ error: 'Failed to fetch vitals', details: error.message });
//   }
// });

// app.post('/api/vitals', authenticateToken, async (req, res) => {
//   console.log('Add vital body:', req.body, 'User:', req.user);
//   try {
//     const vitalData = { userId: req.user.userId, ...req.body };
//     console.log('Vital to save:', vitalData);
//     const vital = new Vitals(vitalData);
//     const savedVital = await vital.save();
//     console.log('Saved vital:', savedVital);
//     res.status(201).json({ message: 'Vital added successfully', vital: savedVital });
//   } catch (error) {
//     console.error('Error saving vital:', error);
//     res.status(500).json({ error: 'Failed to add vital', details: error.message });
//   }
// });

// // ==================== TEST ROUTE (no JWT) ====================
// app.post('/api/test-save', async (req, res) => {
//   console.log('Test save body:', req.body);
//   try {
//     // Use a real user ID from the database
//     const user = await User.findOne({ email: 'test@example.com' }); // Replace with a real email
//     if (!user) {
//       return res.status(400).json({ error: 'Test user not found. Please register a user first.' });
//     }
//     const test = new Vitals({
//       userId: user._id,
//       bp_systolic: 120,
//       bp_diastolic: 80,
//       sugar: 95,
//       weight: 70,
//       heartRate: 72,
//       sleep: 7,
//       water: 2
//     });
//     const saved = await test.save();
//     console.log('Test saved:', saved);
//     res.json({ message: 'Test saved successfully', saved });
//   } catch (error) {
//     console.error('Test save error:', error);
//     res.status(500).json({ error: 'Failed to save test data', details: error.message });
//   }
// });

// // ==================== SERVER START ====================
// const PORT = process.env.PORT || 3008;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
//   console.log(`📍 API: http://localhost:${PORT}/api`);
// });
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const app = express();
// const PORT = process.env.PORT || 3000;
// const JWT_SECRET = 'your-secret-key-change-in-production';

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection (replace with your MongoDB URI)
// mongoose.connect('mongodb://localhost:27017/health', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log('MongoDB Error:', err));

// // User Schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   emergencyContacts: [{
//     name: String,
//     phone: String,
//     relation: String
//   }],
//   medicalHistory: String,
//   createdAt: { type: Date, default: Date.now }
// });

// // Health Data Schema
// const healthDataSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   vitals: [{
//     date: String,
//     bp: Number,
//     sugar: Number,
//     weight: Number,
//     sleep: Number,
//     water: Number
//   }],
//   medications: [{
//     id: Number,
//     name: String,
//     time: String,
//     frequency: String,
//     active: Boolean
//   }],
//   meals: [{
//     date: String,
//     meal: String,
//     items: String,
//     calories: String
//   }],
//   activities: [{
//     date: String,
//     type: String,
//     duration: String,
//     calories: String
//   }],
//   mood: [{
//     date: String,
//     mood: String,
//     stress: String,
//     notes: String
//   }]
// });

// // Community Message Schema
// const communityMessageSchema = new mongoose.Schema({
//   groupId: { type: Number, required: true },
//   userId: String,
//   userName: String,
//   message: String,
//   timestamp: { type: Number, default: Date.now },
//   avatar: String
// });

// const User = mongoose.model('User', userSchema);
// const HealthData = mongoose.model('HealthData', healthDataSchema);
// const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

// // Auth Middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Access denied' });

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// };

// // ==================== AUTH ROUTES ====================

// // Register
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       emergencyContacts: [],
//       medicalHistory: ''
//     });

//     await user.save();

//     // Create empty health data
//     const healthData = new HealthData({
//       userId: user._id,
//       vitals: [],
//       medications: [],
//       meals: [],
//       activities: [],
//       mood: []
//     });

//     await healthData.save();

//     // Generate token
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

//     res.status(201).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ==================== USER ROUTES ====================

// // Get user profile
// app.get('/api/user/profile', authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update user profile
// app.put('/api/user/profile', authenticateToken, async (req, res) => {
//   try {
//     const { name, emergencyContacts, medicalHistory } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { name, emergencyContacts, medicalHistory },
//       { new: true }
//     ).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ==================== HEALTH DATA ROUTES ====================

// // Get health data
// app.get('/api/health', authenticateToken, async (req, res) => {
//   try {
//     let healthData = await HealthData.findOne({ userId: req.user.id });
    
//     if (!healthData) {
//       healthData = new HealthData({
//         userId: req.user.id,
//         vitals: [],
//         medications: [],
//         meals: [],
//         activities: [],
//         mood: []
//       });
//       await healthData.save();
//     }
    
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update health data (vitals, medications, meals, activities, mood)
// app.put('/api/health', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOneAndUpdate(
//       { userId: req.user.id },
//       req.body,
//       { new: true, upsert: true }
//     );
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add vital
// app.post('/api/health/vitals', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.vitals.push(req.body);
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add medication
// app.post('/api/health/medications', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.medications.push(req.body);
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Delete medication
// app.delete('/api/health/medications/:id', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.medications = healthData.medications.filter(
//       med => med.id !== parseInt(req.params.id)
//     );
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add meal
// app.post('/api/health/meals', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.meals.push(req.body);
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add activity
// app.post('/api/health/activities', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.activities.push(req.body);
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add mood
// app.post('/api/health/mood', authenticateToken, async (req, res) => {
//   try {
//     const healthData = await HealthData.findOne({ userId: req.user.id });
//     healthData.mood.push(req.body);
//     await healthData.save();
//     res.json(healthData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ==================== COMMUNITY ROUTES ====================

// // Get messages for a group
// app.get('/api/community/:groupId', authenticateToken, async (req, res) => {
//   try {
//     const messages = await CommunityMessage.find({ 
//       groupId: parseInt(req.params.groupId) 
//     }).sort({ timestamp: 1 });
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Post message to group
// app.post('/api/community/:groupId', authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const message = new CommunityMessage({
//       groupId: parseInt(req.params.groupId),
//       userId: user._id,
//       userName: user.name,
//       message: req.body.message,
//       timestamp: Date.now(),
//       avatar: req.body.avatar
//     });
//     await message.save();
//     res.json(message);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ==================== DEMO DATA SEEDING ====================

// // Seed demo data (call once)
// app.post('/api/seed-demo', async (req, res) => {
//   try {
//     // Check if demo users already exist
//     const existingUser = await User.findOne({ email: 'sarah@health.com' });
//     if (existingUser) {
//       return res.json({ message: 'Demo data already exists' });
//     }

//     // Create demo users
//     const demoUser1 = new User({
//       name: 'Sarah Johnson',
//       email: 'sarah@health.com',
//       password: await bcrypt.hash('demo123', 10),
//       emergencyContacts: [
//         { name: 'Dr. Smith', phone: '+1234567890', relation: 'Doctor' }
//       ],
//       medicalHistory: 'Type 2 Diabetes, Hypertension'
//     });

//     const demoUser2 = new User({
//       name: 'Mike Peterson',
//       email: 'mike@health.com',
//       password: await bcrypt.hash('demo123', 10),
//       emergencyContacts: [],
//       medicalHistory: 'None'
//     });

//     await demoUser1.save();
//     await demoUser2.save();

//     // Create demo health data
//     const demoData1 = new HealthData({
//       userId: demoUser1._id,
//       vitals: Array.from({ length: 7 }, (_, i) => ({
//         date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
//         bp: 120 + Math.random() * 20,
//         sugar: 90 + Math.random() * 30,
//         weight: 70 + Math.random() * 2,
//         sleep: 6 + Math.random() * 3,
//         water: 6 + Math.random() * 4
//       })),
//       medications: [
//         { id: 1, name: 'Metformin', time: '09:00', frequency: 'Daily', active: true }
//       ],
//       meals: [
//         { date: new Date().toLocaleDateString(), meal: 'Breakfast', items: 'Oatmeal, Banana', calories: '255' }
//       ],
//       activities: [
//         { date: new Date().toLocaleDateString(), type: 'Running', duration: '30', calories: '300' }
//       ],
//       mood: Array.from({ length: 7 }, (_, i) => ({
//         date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
//         mood: ['Happy', 'Neutral', 'Stressed', 'Energetic'][Math.floor(Math.random() * 4)],
//         stress: Math.floor(Math.random() * 10) + 1
//       }))
//     });

//     const demoData2 = new HealthData({
//       userId: demoUser2._id,
//       vitals: Array.from({ length: 7 }, (_, i) => ({
//         date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
//         bp: 115 + Math.random() * 15,
//         sugar: 85 + Math.random() * 20,
//         weight: 75 + Math.random() * 2,
//         sleep: 7 + Math.random() * 2,
//         water: 7 + Math.random() * 3
//       })),
//       medications: [],
//       meals: [],
//       activities: [],
//       mood: Array.from({ length: 7 }, (_, i) => ({
//         date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
//         mood: ['Happy', 'Energetic'][Math.floor(Math.random() * 2)],
//         stress: Math.floor(Math.random() * 5) + 1
//       }))
//     });

//     await demoData1.save();
//     await demoData2.save();

//     // Create initial community messages
//     const messages = [
//       new CommunityMessage({
//         groupId: 1,
//         userId: demoUser1._id,
//         userName: 'Sarah Johnson',
//         message: 'Hi everyone! Just joined this diabetes support group. Looking forward to connecting!',
//         timestamp: Date.now() - 7200000,
//         avatar: 'from-blue-500 to-purple-500'
//       }),
//       new CommunityMessage({
//         groupId: 1,
//         userId: demoUser2._id,
//         userName: 'Mike Peterson',
//         message: 'Welcome Sarah! This is a great community. How long have you been managing diabetes?',
//         timestamp: Date.now() - 3600000,
//         avatar: 'from-green-500 to-teal-500'
//       })
//     ];

//     await CommunityMessage.insertMany(messages);

//     res.json({ message: 'Demo data seeded successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Visit http://localhost:${PORT}/api/seed-demo to seed demo data (one time only)`);
// });
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

// ==================== APP SETUP ====================
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());


// ==================== ENVIRONMENT VALIDATION ====================
if (!process.env.MONGODB_URI) {
  console.error('❌ Missing environment variable: MONGODB_URI');
  process.exit(1);
}

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
// const vitalsSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   bp: Number,
//   sugar: Number,
//   weight: Number,
//   sleep: Number,
//   water: Number
// });
const vitalsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  systolic: { type: Number, default: 0 },
  diastolic: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  sleep: { type: Number, default: 0 },
  water: { type: Number, default: 0 }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes for better query performance
vitalsSchema.index({ userId: 1, date: -1 });
const medicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  frequency: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// const mealSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   meal: { type: String, required: true },
//   items: { type: String, required: true },
//   calories: { type: Number, required: true }
// });
const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meal: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
  items: { type: String, required: true },
  calories: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// const activitySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   date: { type: Date, default: Date.now },
//   type: { type: String, required: true },
//   duration: { type: Number, required: true },
//   calories: { type: Number, required: true }
// });
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  calories: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  mood: { type: String, required: true },
  stress: { type: Number, required: true },
  notes: { type: String, default: '' }
});
// // Community Message Schema
// const communityMessageSchema = new mongoose.Schema({
//   groupId: { type: String, required: true }, // keep consistent (string safer than number)
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   userName: { type: String, required: true },
//   message: { type: String, required: true },
//   avatar: { type: String, default: '' },
//   timestamp: { type: Date, default: Date.now }
// });
// const communityMessageSchema = new mongoose.Schema({
//   groupId: { type: String, required: true }, // keep consistent (string safer than number)
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   userName: { type: String, required: true },
//   message: { type: String, required: true },
//   avatar: { type: String, default: '' },
//   timestamp: { type: Date, default: Date.now }
// });
const communityMessageSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  message: { type: String, default: '' },
  avatar: { type: String, default: '' },
  image: { type: String, default: null }, // Base64 encoded image
  timestamp: { type: Date, default: Date.now }
});

//const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);
// ==================== EMERGENCY CONTACT SCHEMA ====================
const emergencyContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});
const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  vitals: {
    bp: Number,
    sugar: Number,
    weight: Number
  },
  contactsNotified: Number
});

// ==================== MEDICAL HISTORY SCHEMA ====================
// const medicalHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   bp: { type: Number, default: 0 },       // Blood Pressure
//   sugar: { type: Number, default: 0 },    // Blood Sugar
//   weight: { type: Number, default: 0 },   // Weight in kg
//   updatedAt: { type: Date, default: Date.now }
// });
//const User = mongoose.model('User', userSchema);
//const HealthData = mongoose.model('HealthData', healthDataSchema);

// ==================== MODELS ====================
const User = mongoose.model('User', userSchema);
export default User;

const Vitals = mongoose.model('Vitals', vitalsSchema);
const Medication = mongoose.model('Medication', medicationSchema);
const Meal = mongoose.model('Meal', mealSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Mood = mongoose.model('Mood', moodSchema);
const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);
const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);
//const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};


// ==================== AUTH ROUTES ====================
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       emergencyContacts: [],
//       medicalHistory: ''
//     });

//     await user.save();

//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         emergencyContacts: user.emergencyContacts,
//         medicalHistory: user.medicalHistory
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Login failed' });
//   }
// });
// ==================== AUTH ROUTES ====================

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
// ============== USER PROFILE ROUTES ==============

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (including password)
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      height,
      allergies,
      medicalConditions,
      emergencyContact
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Get current user to check if fields are actually changing
    const currentUser = await User.findById(req.userId);
    
    // Check for duplicate email if user is changing their email
    if (email && email !== currentUser.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Check for duplicate phone if user is changing their phone
    if (phone && phone !== currentUser.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    // Check for duplicate name if user is changing their name
    if (name && name !== currentUser.name) {
      const existingName = await User.findOne({ name });
      if (existingName) {
        return res.status(400).json({ error: 'Name already in use' });
      }
    }

    // Prepare update object - only include fields that are provided
    const updateData = { updatedAt: Date.now() };
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (height !== undefined) updateData.height = height;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

    // If password is provided, hash it and include in update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account (and all associated data)
app.delete('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    // Delete all user's associated data
    await Promise.all([
      Vital.deleteMany({ userId: req.userId }),
      Medication.deleteMany({ userId: req.userId }),
      Meal.deleteMany({ userId: req.userId }),
      Activity.deleteMany({ userId: req.userId }),
      Mood.deleteMany({ userId: req.userId })
    ]);
    
    // Delete user account
    const deletedUser = await User.findByIdAndDelete(req.userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Account and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ==================== VITALS ROUTES ====================
// app.delete('/api/vitals/:id', authenticateToken, async (req, res) => {
//   try {
//     const vital = await Vitals.findOneAndDelete({ 
//       _id: req.params.id, 
//       userId: req.user.id 
//     });
    
//     if (!vital) {
//       return res.status(404).json({ error: 'Vital not found or unauthorized' });
//     }
    
//     res.json({ message: 'Vital deleted successfully', vital });
//   } catch (error) {
//     console.error('Error deleting vital:', error);
//     res.status(500).json({ error: 'Failed to delete vital' });
//   }
// });
// app.get('/api/vitals', authenticateToken, async (req, res) => {
//   try {
//     const vitals = await Vitals.find({ userId: req.user.id }).sort({ date: -1 });
//     res.json(vitals);
//   } catch (error) {
//     console.error('Error fetching vitals:', error);
//     res.status(500).json({ error: 'Failed to fetch vitals' });
//   }
// });

// app.post('/api/vitals', authenticateToken, async (req, res) => {
//   try {
//     const vital = new Vitals({
//       userId: req.user.id,
//       ...req.body
//     });
//     await vital.save();
//     res.status(201).json(vital);
//   } catch (error) {
//     console.error('Error saving vital:', error);
//     res.status(500).json({ error: 'Failed to add vital' });
//   }
// });
// // PUT update vital (optional - for future use)
// app.put('/api/vitals/:id', authenticateToken, async (req, res) => {
//   try {
//     const vital = await Vitals.findOne({ 
//       _id: req.params.id, 
//       userId: req.user.id 
//     });
    
//     if (!vital) {
//       return res.status(404).json({ error: 'Vital not found or unauthorized' });
//     }
    
//     // Update fields
//     Object.keys(req.body).forEach(key => {
//       vital[key] = req.body[key];
//     });
    
//     await vital.save();
//     res.json(vital);
//   } catch (error) {
//     console.error('Error updating vital:', error);
//     res.status(500).json({ error: 'Failed to update vital' });
//   }
// });
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vitals.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(vitals);
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

// GET single vital by ID
app.get('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const vital = await Vitals.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!vital) {
      return res.status(404).json({ error: 'Vital not found or unauthorized' });
    }
    
    res.json(vital);
  } catch (error) {
    console.error('Error fetching vital:', error);
    res.status(500).json({ error: 'Failed to fetch vital' });
  }
});

// POST create new vital
app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { systolic, diastolic, sugar, weight, sleep, water, date } = req.body;
    
    // Validation
    if (systolic && (systolic < 0 || systolic > 300)) {
      return res.status(400).json({ error: 'Invalid systolic blood pressure value' });
    }
    if (diastolic && (diastolic < 0 || diastolic > 200)) {
      return res.status(400).json({ error: 'Invalid diastolic blood pressure value' });
    }
    if (sugar && (sugar < 0 || sugar > 1000)) {
      return res.status(400).json({ error: 'Invalid blood sugar value' });
    }
    if (weight && (weight < 0 || weight > 500)) {
      return res.status(400).json({ error: 'Invalid weight value' });
    }
    if (sleep && (sleep < 0 || sleep > 24)) {
      return res.status(400).json({ error: 'Invalid sleep hours value' });
    }
    if (water && (water < 0 || water > 50)) {
      return res.status(400).json({ error: 'Invalid water intake value' });
    }
    
    const vital = new Vitals({
      userId: req.user.id,
      systolic: parseFloat(systolic) || 0,
      diastolic: parseFloat(diastolic) || 0,
      sugar: parseFloat(sugar) || 0,
      weight: parseFloat(weight) || 0,
      sleep: parseFloat(sleep) || 0,
      water: parseFloat(water) || 0,
      date: date || new Date()
    });
    
    await vital.save();
    res.status(201).json(vital);
  } catch (error) {
    console.error('Error saving vital:', error);
    res.status(500).json({ error: 'Failed to add vital' });
  }
});

// PUT update vital
app.put('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const vital = await Vitals.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!vital) {
      return res.status(404).json({ error: 'Vital not found or unauthorized' });
    }
    
    const { systolic, diastolic, sugar, weight, sleep, water, date } = req.body;
    
    // Validation
    if (systolic !== undefined) {
      if (systolic < 0 || systolic > 300) {
        return res.status(400).json({ error: 'Invalid systolic blood pressure value' });
      }
      vital.systolic = parseFloat(systolic);
    }
    
    if (diastolic !== undefined) {
      if (diastolic < 0 || diastolic > 200) {
        return res.status(400).json({ error: 'Invalid diastolic blood pressure value' });
      }
      vital.diastolic = parseFloat(diastolic);
    }
    
    if (sugar !== undefined) {
      if (sugar < 0 || sugar > 1000) {
        return res.status(400).json({ error: 'Invalid blood sugar value' });
      }
      vital.sugar = parseFloat(sugar);
    }
    
    if (weight !== undefined) {
      if (weight < 0 || weight > 500) {
        return res.status(400).json({ error: 'Invalid weight value' });
      }
      vital.weight = parseFloat(weight);
    }
    
    if (sleep !== undefined) {
      if (sleep < 0 || sleep > 24) {
        return res.status(400).json({ error: 'Invalid sleep hours value' });
      }
      vital.sleep = parseFloat(sleep);
    }
    
    if (water !== undefined) {
      if (water < 0 || water > 50) {
        return res.status(400).json({ error: 'Invalid water intake value' });
      }
      vital.water = parseFloat(water);
    }
    
    if (date) {
      vital.date = new Date(date);
    }
    
    await vital.save();
    res.json(vital);
  } catch (error) {
    console.error('Error updating vital:', error);
    res.status(500).json({ error: 'Failed to update vital' });
  }
});

// DELETE vital
app.delete('/api/vitals/:id', authenticateToken, async (req, res) => {
  try {
    const vital = await Vitals.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!vital) {
      return res.status(404).json({ error: 'Vital not found or unauthorized' });
    }
    
    res.json({ message: 'Vital deleted successfully', vital });
  } catch (error) {
    console.error('Error deleting vital:', error);
    res.status(500).json({ error: 'Failed to delete vital' });
  }
});

// GET vitals within date range
app.get('/api/vitals/range/:startDate/:endDate', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const vitals = await Vitals.find({ 
      userId: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    
    res.json(vitals);
  } catch (error) {
    console.error('Error fetching vitals range:', error);
    res.status(500).json({ error: 'Failed to fetch vitals range' });
  }
});

// GET latest vital
app.get('/api/vitals/latest', authenticateToken, async (req, res) => {
  try {
    const vital = await Vitals.findOne({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(1);
    
    if (!vital) {
      return res.status(404).json({ error: 'No vitals found' });
    }
    
    res.json(vital);
  } catch (error) {
    console.error('Error fetching latest vital:', error);
    res.status(500).json({ error: 'Failed to fetch latest vital' });
  }
});

// GET vitals statistics
app.get('/api/vitals/stats', authenticateToken, async (req, res) => {
  try {
    const vitals = await Vitals.find({ userId: req.user.id }).sort({ date: -1 });
    
    if (vitals.length === 0) {
      return res.json({
        count: 0,
        averages: null,
        trends: null
      });
    }
    
    // Calculate averages
    const averages = {
      systolic: vitals.reduce((sum, v) => sum + v.systolic, 0) / vitals.length,
      diastolic: vitals.reduce((sum, v) => sum + v.diastolic, 0) / vitals.length,
      sugar: vitals.reduce((sum, v) => sum + v.sugar, 0) / vitals.length,
      weight: vitals.reduce((sum, v) => sum + v.weight, 0) / vitals.length,
      sleep: vitals.reduce((sum, v) => sum + v.sleep, 0) / vitals.length,
      water: vitals.reduce((sum, v) => sum + v.water, 0) / vitals.length
    };
    
    // Calculate trends (last 7 days vs previous 7 days)
    const last7 = vitals.slice(0, 7);
    const prev7 = vitals.slice(7, 14);
    
    let trends = null;
    if (prev7.length > 0) {
      const last7Avg = {
        systolic: last7.reduce((sum, v) => sum + v.systolic, 0) / last7.length,
        diastolic: last7.reduce((sum, v) => sum + v.diastolic, 0) / last7.length,
        sugar: last7.reduce((sum, v) => sum + v.sugar, 0) / last7.length,
        weight: last7.reduce((sum, v) => sum + v.weight, 0) / last7.length
      };
      
      const prev7Avg = {
        systolic: prev7.reduce((sum, v) => sum + v.systolic, 0) / prev7.length,
        diastolic: prev7.reduce((sum, v) => sum + v.diastolic, 0) / prev7.length,
        sugar: prev7.reduce((sum, v) => sum + v.sugar, 0) / prev7.length,
        weight: prev7.reduce((sum, v) => sum + v.weight, 0) / prev7.length
      };
      
      trends = {
        systolic: ((last7Avg.systolic - prev7Avg.systolic) / prev7Avg.systolic * 100).toFixed(1),
        diastolic: ((last7Avg.diastolic - prev7Avg.diastolic) / prev7Avg.diastolic * 100).toFixed(1),
        sugar: ((last7Avg.sugar - prev7Avg.sugar) / prev7Avg.sugar * 100).toFixed(1),
        weight: ((last7Avg.weight - prev7Avg.weight) / prev7Avg.weight * 100).toFixed(1)
      };
    }
    
    res.json({
      count: vitals.length,
      averages,
      trends
    });
  } catch (error) {
    console.error('Error calculating vitals stats:', error);
    res.status(500).json({ error: 'Failed to calculate vitals statistics' });
  }
});

// ==================== MEDICATION ROUTES ====================
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medication = new Medication({
      userId: req.user.id,
      ...req.body
    });
    await medication.save();
    res.status(201).json(medication);
  } catch (error) {
    console.error('Error saving medication:', error);
    res.status(500).json({ error: 'Failed to add medication' });
  }
});

app.delete('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

// ==================== MEAL ROUTES ====================
// app.get('/api/meals', authenticateToken, async (req, res) => {
//   try {
//     const meals = await Meal.find({ userId: req.user.id }).sort({ date: -1 });
//     res.json(meals);
//   } catch (error) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals' });
//   }
// });

// app.post('/api/meals', authenticateToken, async (req, res) => {
//   try {
//     const meal = new Meal({
//       userId: req.user.id,
//       ...req.body
//     });
//     await meal.save();
//     res.status(201).json(meal);
//   } catch (error) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to add meal' });
//   }
// });

// // ==================== ACTIVITY ROUTES ====================
// app.get('/api/activities', authenticateToken, async (req, res) => {
//   try {
//     const activities = await Activity.find({ userId: req.user.id }).sort({ date: -1 });
//     res.json(activities);
//   } catch (error) {
//     console.error('Error fetching activities:', error);
//     res.status(500).json({ error: 'Failed to fetch activities' });
//   }
// });

// app.post('/api/activities', authenticateToken, async (req, res) => {
//   try {
//     const activity = new Activity({
//       userId: req.user.id,
//       ...req.body
//     });
//     await activity.save();
//     res.status(201).json(activity);
//   } catch (error) {
//     console.error('Error saving activity:', error);
//     res.status(500).json({ error: 'Failed to add activity' });
//   }
// });
app.post('/api/meals', authenticateToken, async (req, res) => {
  try {
    const { date, meal, items, calories } = req.body;
    
    const newMeal = new Meal({
      userId: req.user.id,
      date,
      meal,
      items,
      calories
    });
    
    await newMeal.save();
    res.status(201).json({ 
      message: 'Meal logged successfully', 
      meal: newMeal 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Meals for User
app.get('/api/meals', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user.id };
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const meals = await Meal.find(query).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Meal by ID
app.get('/api/meals/:id', authenticateToken, async (req, res) => {
  try {
    const meal = await Meal.findOne({ 
      _id: req.params.id, 
      userId: req.user.id
    });
    
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Meal
app.put('/api/meals/:id', authenticateToken, async (req, res) => {
  try {
    const { date, meal, items, calories } = req.body;
    
    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { date, meal, items, calories },
      { new: true }
    );
    
    if (!updatedMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json({ 
      message: 'Meal updated successfully', 
      meal: updatedMeal 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Meal
app.delete('/api/meals/:id', authenticateToken, async (req, res) => {
  try {
    const deletedMeal = await Meal.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id
    });
    
    if (!deletedMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json({ 
      message: 'Meal deleted successfully', 
      meal: deletedMeal 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== ACTIVITY ROUTES ==============

// Create Activity
app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { date, type, duration, calories } = req.body;
    
    const newActivity = new Activity({
      userId: req.user.id,
      date,
      type,
      duration,
      calories
    });
    
    await newActivity.save();
    res.status(201).json({ 
      message: 'Activity logged successfully', 
      activity: newActivity 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Activities for User
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user.id };
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const activities = await Activity.find(query).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Activity by ID
app.get('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOne({ 
      _id: req.params.id, 
      userId: req.user.id
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Activity
app.put('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { date, type, duration, calories } = req.body;
    
    const updatedActivity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { date, type, duration, calories },
      { new: true }
    );
    
    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ 
      message: 'Activity updated successfully', 
      activity: updatedActivity 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Activity
app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const deletedActivity = await Activity.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!deletedActivity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ 
      message: 'Activity deleted successfully', 
      activity: deletedActivity 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ==================== MOOD ROUTES ====================
app.get('/api/mood', authenticateToken, async (req, res) => {
  try {
    const mood = await Mood.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(mood);
  } catch (error) {
    console.error('Error fetching mood:', error);
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

app.post('/api/mood', authenticateToken, async (req, res) => {
  try {
    const mood = new Mood({
      userId: req.user.id,
      ...req.body
    });
    await mood.save();
    res.status(201).json(mood);
  } catch (error) {
    console.error('Error saving mood:', error);
    res.status(500).json({ error: 'Failed to add mood' });
  }
});

// // ==================== COMMUNITY ROUTES ====================

// Get messages for a group
// ==================== COMMUNITY ROUTES ====================

// Get all messages for a specific group
// app.get('/api/community/:groupId', authenticateToken, async (req, res) => {
//   try {
//     const messages = await CommunityMessage.find({ groupId: req.params.groupId })
//       .sort({ timestamp: 1 });
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching community messages:', error);
//     res.status(500).json({ error: 'Failed to fetch community messages' });
//   }
// });

// Post a new message in a specific group
// app.post('/api/community/:groupId', authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const message = new CommunityMessage({
//       groupId: req.params.groupId,
//       userId: user._id,
//       userName: user.name,
//       message: req.body.message,
//       avatar: req.body.avatar || ''
//     });

//     await message.save();
//     res.status(201).json(message);
//   } catch (error) {
//     console.error('Error saving community message:', error);
//     res.status(500).json({ error: 'Failed to save community message' });
//   }
// });
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
app.get('/api/community/:groupId', authenticateToken, async (req, res) => {
  try {
    const messages = await CommunityMessage.find({ 
      groupId: req.params.groupId 
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching community messages:', error);
    res.status(500).json({ error: 'Failed to fetch community messages' });
  }
});

// Post a new message in a specific group
app.post(
  '/api/community/:groupId',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      const { message } = req.body;
      const imageFile = req.file;

      // Validate that at least message or image is provided
      if (!message && !imageFile) {
        return res.status(400).json({ error: 'Message or image is required' });
      }

      // Get user information from token
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare image data
      let imageData = null;
      if (imageFile) {
        // Convert buffer to base64
        imageData = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
      }

      // Create new message
      const newMessage = new CommunityMessage({
        groupId: req.params.groupId,
        userId: req.user.id,
        userName: user.name,
        message: message || '',
        image: imageData
      });

      await newMessage.save();
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  }
);

// Delete a message (optional - for message management)
app.delete('/api/community/:groupId/:messageId', authenticateToken, async (req, res) => {
  try {
    const message = await CommunityMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only allow user to delete their own messages
    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await CommunityMessage.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});
// Log SOS alerts for history/analytics
app.post('/api/sos/alert', authenticateToken, async (req, res) => {
  try {
    const sosAlert = new SOSAlert({
      userId: req.user.id,
      timestamp: new Date(),
      location: req.body.location,
      vitals: req.body.vitals,
      contactsNotified: req.body.contactsNotified
    });
    await sosAlert.save();
    res.status(201).json(sosAlert);
  } catch (error) {
    console.error('Error logging SOS alert:', error);
    res.status(500).json({ error: 'Failed to log SOS alert' });
  }
});

// Get SOS history
app.get('/api/sos/history', authenticateToken, async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching SOS history:', error);
    res.status(500).json({ error: 'Failed to fetch SOS history' });
  }
});



// ==================== EMERGENCY CONTACT ROUTES ====================
// These routes are already in your backend - they should work fine

// GET all emergency contacts
app.get('/api/emergencycontacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});

// POST new emergency contact
app.post('/api/emergencycontacts', authenticateToken, async (req, res) => {
  try {
    const contact = new EmergencyContact({
      userId: req.user.id,
      ...req.body
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({ error: 'Failed to add emergency contact' });
  }
});

// DELETE emergency contact
app.delete('/api/emergencycontacts/:id', authenticateToken, async (req, res) => {
  try {
    await EmergencyContact.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Emergency contact deleted' });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ error: 'Failed to delete emergency contact' });
  }
});

// ==================== MEDICAL HISTORY ROUTES ====================



// ==================== SERVER START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});