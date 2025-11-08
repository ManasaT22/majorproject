
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
  // Authentication
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
    // REMOVED unique: true - Names should NOT be unique (many people share names)
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Personal Information
  phone: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null/undefined values but enforces unique non-null values
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: String, // Changed to String for easier frontend integration (YYYY-MM-DD format)
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '' // Added default
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters'],
    default: '' // Added default
  },
  
  // Medical Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: '' // Added default
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50 cm'], // More realistic minimum
    max: [300, 'Height seems unrealistic']
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: [1000, 'Allergies description too long'],
    default: '' // Added default
  },
  medicalConditions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Medical conditions description too long'],
    default: '' // Added default
  },
  
  // Emergency Contact
  emergencyContact: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid emergency contact number']
  },
  
  // Timestamps - REMOVED manual createdAt/updatedAt since timestamps: true handles this
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes for faster queries
userSchema.index({ email: 1 });
// REMOVED name and phone indexes - only index frequently queried unique fields
// Phone sparse index is automatic when unique: true is set

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get profile without password
userSchema.methods.toProfileJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    address: this.address,
    bloodGroup: this.bloodGroup,
    height: this.height,
    allergies: this.allergies,
    medicalConditions: this.medicalConditions,
    emergencyContact: this.emergencyContact,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

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

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (including password) - SUPPORTS INDIVIDUAL FIELD UPDATES
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

    // Get current user to check if fields are actually changing
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate individual fields only if they are being updated
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (email !== undefined && email.trim() === '') {
      return res.status(400).json({ error: 'Email cannot be empty' });
    }

    // Check for duplicate email if user is changing their email
    if (email !== undefined && email !== currentUser.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Check for duplicate phone if user is changing their phone
    if (phone !== undefined && phone !== currentUser.phone && phone !== '') {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    // Check for duplicate name if user is changing their name
    if (name !== undefined && name !== currentUser.name) {
      const existingName = await User.findOne({ name, _id: { $ne: req.user.id } });
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

    // If password is provided, validate and hash it
    if (password !== undefined && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account (and all associated data)
app.delete('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    // Delete all user's associated data
    await Promise.all([
      Vitals.deleteMany({ userId: req.user.id }),
      Medication.deleteMany({ userId: req.user.id}),
      Meal.deleteMany({ userId: req.user.id }),
      Activity.deleteMany({ userId: req.user.id }),
      Mood.deleteMany({ userId: req.user.id })
    ]);
    
    // Delete user account
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Account and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account',details: error.message });
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
