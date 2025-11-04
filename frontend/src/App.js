
import React, { useState, useEffect, useRef,useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Heart, Droplet, Moon,Send, Smile, Paperclip,ImagePlus,TrendingUp, Download,TrendingDown, Edit2, Mail,Calendar,Clock, Mic, Pill,Edit, Save, X ,RefreshCw,Apple, Dumbbell,FileText, Loader, AlertCircle, Users, Camera,Plus,Bell, LogOut, User, Home, Settings, Lock,Shield,Trash2,Image as ImageIcon,Image, MessageSquare, Phone,MapPin} from 'lucide-react';
import Tesseract from 'tesseract.js';
// ==================== API CONFIGURATION ====================
const API_URL = 'https://majorproject-1-hswv.onrender.com/api';

const api = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  clearToken: () => localStorage.removeItem('token'),
  
  request: async (endpoint, options = {}) => {
    const token = api.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  auth: {
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  },
  
  vitals: {
    getAll: () => api.request('/vitals'),
    create: (data) => api.request('/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/vitals/${id}`, {
    method: 'DELETE',
  }),
  update: (id, data) => api.request(`/vitals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
     getStats: () => api.request('/vitals/stats'),
    getLatest: () => api.request('/vitals/latest'),
  }),
  },
  
  medications: {
    getAll: () => api.request('/medications'),
    create: (data) => api.request('/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/medications/${id}`, {
      method: 'DELETE',
    }),
  },
  // Fix the delete methods - remove template literal
meals: {
  getAll: () => api.request('/meals'),
  create: (data) => api.request('/meals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => api.request(`/meals/${id}`, {  // Fixed: regular template literal
    method: 'DELETE',
  }),
},
activities: {
  getAll: () => api.request('/activities'),
  create: (data) => api.request('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => api.request(`/activities/${id}`, {  // Fixed: regular template literal
    method: 'DELETE',
  }),
},

  mood: {
    getAll: () => api.request('/mood'),
    create: (data) => api.request('/mood', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
emergencyContacts: {
    getAll: () => api.request('/emergencycontacts'),
    create: (data) => api.request('/emergencycontacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id) => api.request(`/emergencycontacts/${id}`, {
      method: 'DELETE',
    }),
  },
   users: {
    // Get current user profile
    getProfile: () => api.request('/users/profile'),
    
    // Update current user profile
    updateProfile: (data) => api.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    // Delete current user account (and all associated data)
    deleteAccount: () => api.request('/users/profile', {
      method: 'DELETE',
    }),
  },

//   medicalHistory: {
//     get: () => api.request('/medicalhistories'),
//     update: (data) => api.request('/medicalhistories', {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     }),
//   },
};
const medicineDatabase = [
    // Pain Relief & Fever
    {
      name: "Paracetamol",
      category: "Pain Relief & Fever",
      uses: "Fever, headache, body pain, toothache, menstrual pain",
      dosage: "Adults: 500mg-1000mg every 4-6 hours (max 4g/day). Children: 10-15mg/kg every 4-6 hours",
      sideEffects: "Rare: Nausea, allergic reactions, skin rash. Overdose can cause liver damage",
      precautions: "Do not exceed 4g per day. Avoid with liver disease. Reduce dose in elderly patients."
    },
    {
      name: "Ibuprofen",
      category: "Pain Relief & Fever",
      uses: "Pain, inflammation, fever, arthritis, menstrual cramps, dental pain",
      dosage: "Adults: 200mg-400mg every 4-6 hours (max 1200mg/day OTC). Children: 5-10mg/kg every 6-8 hours",
      sideEffects: "Stomach upset, nausea, dizziness, heartburn, increased bleeding risk",
      precautions: "Take with food. Avoid with stomach ulcers, heart disease, kidney problems. Not for >10 days."
    },
    {
      name: "Aspirin",
      category: "Pain Relief & Fever",
      uses: "Pain, fever, inflammation, heart attack prevention, stroke prevention",
      dosage: "Pain/Fever: 300-900mg every 4-6 hours. Cardioprotective: 75-150mg once daily",
      sideEffects: "Stomach irritation, bleeding, heartburn, allergic reactions",
      precautions: "Take with food. Avoid in children <16 (Reye's syndrome risk). Not with bleeding disorders."
    },
    {
      name: "Diclofenac",
      category: "Pain Relief & Fever",
      uses: "Arthritis, acute pain, inflammation, sports injuries, back pain",
      dosage: "50mg 2-3 times daily or 75mg twice daily (max 150mg/day)",
      sideEffects: "Stomach pain, nausea, diarrhea, dizziness, increased blood pressure",
      precautions: "Take with food. Risk of cardiovascular events. Avoid with heart/kidney disease."
    },
    {
      name: "Tramadol",
      category: "Pain Relief",
      uses: "Moderate to severe pain, post-operative pain, chronic pain",
      dosage: "50-100mg every 4-6 hours as needed (max 400mg/day)",
      sideEffects: "Nausea, dizziness, constipation, drowsiness, dependence risk",
      precautions: "Prescription only. Risk of addiction. Avoid with alcohol. May impair driving."
    },

    // Antibiotics
    {
      name: "Amoxicillin",
      category: "Antibiotic",
      uses: "Respiratory infections, ear infections, UTIs, skin infections, dental infections",
      dosage: "Adults: 250-500mg three times daily. Children: 20-40mg/kg/day in divided doses",
      sideEffects: "Diarrhea, nausea, rash, allergic reactions, yeast infections",
      precautions: "Complete full course. Check for penicillin allergy. Take with/without food."
    },
    {
      name: "Azithromycin",
      category: "Antibiotic",
      uses: "Respiratory infections, STDs, skin infections, ear infections",
      dosage: "500mg on day 1, then 250mg daily for 4 days (Z-pack)",
      sideEffects: "Diarrhea, nausea, stomach pain, vomiting",
      precautions: "Complete full course. Can prolong QT interval. Avoid with liver disease."
    },
    {
      name: "Ciprofloxacin",
      category: "Antibiotic",
      uses: "UTIs, respiratory infections, skin infections, bone infections, GI infections",
      dosage: "250-750mg twice daily depending on infection",
      sideEffects: "Nausea, diarrhea, dizziness, tendon rupture risk (rare)",
      precautions: "Avoid in children/pregnant women. Risk of tendon damage. Take 2 hours before/after antacids."
    },
    {
      name: "Doxycycline",
      category: "Antibiotic",
      uses: "Acne, respiratory infections, Lyme disease, malaria prevention, STDs",
      dosage: "100mg once or twice daily",
      sideEffects: "Photosensitivity, nausea, diarrhea, esophageal irritation",
      precautions: "Avoid sun exposure. Take with full glass of water. Not for children <8 or pregnant women."
    },
    {
      name: "Cephalexin",
      category: "Antibiotic",
      uses: "Skin infections, respiratory infections, UTIs, bone infections",
      dosage: "250-500mg every 6 hours",
      sideEffects: "Diarrhea, nausea, stomach upset, allergic reactions",
      precautions: "Complete full course. Use cautiously with penicillin allergy (cross-reactivity)."
    },

    // Allergy & Antihistamines
    {
      name: "Cetirizine",
      category: "Antihistamine",
      uses: "Allergies, hay fever, itching, hives, allergic rhinitis",
      dosage: "Adults/Children >6: 10mg once daily. Children 2-6: 5mg once daily",
      sideEffects: "Drowsiness, dry mouth, fatigue, headache",
      precautions: "May cause sleepiness. Avoid driving if drowsy. Reduce dose in kidney disease."
    },
    {
      name: "Loratadine",
      category: "Antihistamine",
      uses: "Seasonal allergies, hay fever, hives, allergic skin reactions",
      dosage: "Adults/Children >6: 10mg once daily. Children 2-6: 5mg once daily",
      sideEffects: "Headache, drowsiness (less than cetirizine), dry mouth",
      precautions: "Non-drowsy for most people. Safe for daily use during allergy season."
    },
    {
      name: "Fexofenadine",
      category: "Antihistamine",
      uses: "Seasonal allergies, chronic hives, allergic rhinitis",
      dosage: "60mg twice daily or 180mg once daily",
      sideEffects: "Headache, nausea, minimal drowsiness",
      precautions: "Non-sedating. Avoid taking with fruit juices (reduces absorption)."
    },
    {
      name: "Diphenhydramine",
      category: "Antihistamine",
      uses: "Allergies, insomnia, motion sickness, cold symptoms",
      dosage: "25-50mg every 4-6 hours (max 300mg/day)",
      sideEffects: "Significant drowsiness, dry mouth, dizziness, urinary retention",
      precautions: "Causes drowsiness - do not drive. Avoid with glaucoma or prostate issues."
    },

    // Gastrointestinal
    {
      name: "Omeprazole",
      category: "Proton Pump Inhibitor",
      uses: "Acid reflux, GERD, heartburn, stomach ulcers, H. pylori treatment",
      dosage: "20-40mg once daily before breakfast (30 min before food)",
      sideEffects: "Headache, stomach pain, nausea, diarrhea, vitamin B12 deficiency (long-term)",
      precautions: "Take 30 minutes before eating. Long-term use may affect bone health. Not for immediate relief."
    },
    {
      name: "Ranitidine",
      category: "H2 Blocker",
      uses: "Heartburn, acid indigestion, stomach ulcers, GERD",
      dosage: "150mg twice daily or 300mg at bedtime",
      sideEffects: "Headache, constipation, diarrhea, dizziness",
      precautions: "Note: Ranitidine was recalled in many countries (2020) due to NDMA contamination. Use alternatives."
    },
    {
      name: "Famotidine",
      category: "H2 Blocker",
      uses: "Heartburn, acid indigestion, GERD, stomach ulcers",
      dosage: "20-40mg once or twice daily",
      sideEffects: "Headache, dizziness, constipation, diarrhea",
      precautions: "Works faster than omeprazole. Safe for most people. Reduce dose in kidney disease."
    },
    {
      name: "Metoclopramide",
      category: "Antiemetic",
      uses: "Nausea, vomiting, gastroparesis, migraine-associated nausea",
      dosage: "10mg three times daily before meals",
      sideEffects: "Drowsiness, restlessness, diarrhea, extrapyramidal symptoms (rare)",
      precautions: "Risk of tardive dyskinesia with long-term use. Avoid with Parkinson's disease."
    },
    {
      name: "Ondansetron",
      category: "Antiemetic",
      uses: "Nausea/vomiting from chemotherapy, radiation, surgery, gastroenteritis",
      dosage: "4-8mg every 8 hours as needed",
      sideEffects: "Headache, constipation, dizziness, fatigue",
      precautions: "Very effective for severe nausea. Can prolong QT interval. Safe in pregnancy."
    },
    {
      name: "Loperamide",
      category: "Antidiarrheal",
      uses: "Acute diarrhea, chronic diarrhea, traveler's diarrhea",
      dosage: "Initial: 4mg, then 2mg after each loose stool (max 16mg/day)",
      sideEffects: "Constipation, dizziness, drowsiness, stomach cramps",
      precautions: "Do not use with bloody diarrhea or high fever. Not for >2 days without doctor advice."
    },

    // Cardiovascular
    {
      name: "Amlodipine",
      category: "Calcium Channel Blocker",
      uses: "High blood pressure, angina, coronary artery disease",
      dosage: "5-10mg once daily",
      sideEffects: "Ankle swelling, flushing, headache, dizziness, fatigue",
      precautions: "Do not stop suddenly. May cause gum swelling. Regular BP monitoring needed."
    },
    {
      name: "Atenolol",
      category: "Beta Blocker",
      uses: "High blood pressure, angina, irregular heartbeat, post-heart attack",
      dosage: "25-100mg once daily",
      sideEffects: "Fatigue, cold hands/feet, dizziness, slow heart rate, depression",
      precautions: "Do not stop suddenly (risk of heart attack). Avoid with asthma. Masks hypoglycemia symptoms."
    },
    {
      name: "Lisinopril",
      category: "ACE Inhibitor",
      uses: "High blood pressure, heart failure, post-heart attack, diabetic kidney disease",
      dosage: "10-40mg once daily",
      sideEffects: "Dry cough (common), dizziness, headache, high potassium, angioedema (rare)",
      precautions: "Not in pregnancy. Monitor kidney function and potassium. Persistent cough may require switch."
    },
    {
      name: "Atorvastatin",
      category: "Statin",
      uses: "High cholesterol, cardiovascular disease prevention, stroke prevention",
      dosage: "10-80mg once daily in evening",
      sideEffects: "Muscle pain, elevated liver enzymes, digestive issues",
      precautions: "Avoid grapefruit juice. Monitor liver function. Report unexplained muscle pain immediately."
    },
    {
      name: "Clopidogrel",
      category: "Antiplatelet",
      uses: "Prevent blood clots, post-heart attack, post-stent, stroke prevention",
      dosage: "75mg once daily",
      sideEffects: "Increased bleeding, bruising, stomach pain, diarrhea",
      precautions: "Increased bleeding risk. Inform doctors/dentists before procedures. Avoid with active bleeding."
    },

    // Diabetes
    {
      name: "Metformin",
      category: "Antidiabetic",
      uses: "Type 2 diabetes, prediabetes, PCOS",
      dosage: "500-1000mg twice daily with meals (max 2550mg/day)",
      sideEffects: "Diarrhea, nausea, stomach upset, metallic taste, vitamin B12 deficiency",
      precautions: "Take with food. Risk of lactic acidosis (rare). Monitor kidney function. Stop before contrast imaging."
    },
    {
      name: "Glimepiride",
      category: "Antidiabetic",
      uses: "Type 2 diabetes",
      dosage: "1-4mg once daily with breakfast",
      sideEffects: "Hypoglycemia, weight gain, nausea, dizziness",
      precautions: "Risk of low blood sugar. Take with food. Avoid alcohol. Monitor blood glucose regularly."
    },
    {
      name: "Insulin Glargine",
      category: "Antidiabetic (Insulin)",
      uses: "Type 1 and Type 2 diabetes (long-acting basal insulin)",
      dosage: "Individualized - typically 10-20 units once daily",
      sideEffects: "Hypoglycemia, injection site reactions, weight gain",
      precautions: "Requires blood glucose monitoring. Store properly. Never share pens/needles. Rotate injection sites."
    },

    // Respiratory
    {
      name: "Salbutamol",
      category: "Bronchodilator",
      uses: "Asthma, COPD, exercise-induced bronchospasm",
      dosage: "100-200mcg (1-2 puffs) as needed (max 8 puffs/day)",
      sideEffects: "Tremor, fast heart rate, headache, nervousness",
      precautions: "Rescue inhaler - not for daily prevention. Rinse mouth after use. Seek help if using >2x/week."
    },
    {
      name: "Montelukast",
      category: "Leukotriene Inhibitor",
      uses: "Asthma prevention, seasonal allergies, exercise-induced asthma",
      dosage: "10mg once daily in evening (5mg for children 6-14)",
      sideEffects: "Headache, stomach pain, mood changes, depression (rare)",
      precautions: "Not for acute asthma attacks. Monitor for mood/behavior changes. Safe for long-term use."
    },
    {
      name: "Prednisolone",
      category: "Corticosteroid",
      uses: "Asthma exacerbations, allergies, inflammation, autoimmune conditions",
      dosage: "5-60mg daily depending on condition",
      sideEffects: "Increased appetite, weight gain, mood changes, insomnia, high blood sugar",
      precautions: "Do not stop suddenly. Take with food. Short-term use preferred. Monitor blood sugar and BP."
    },

    // Antibiotics (Additional)
    {
      name: "Levofloxacin",
      category: "Antibiotic",
      uses: "Pneumonia, UTIs, skin infections, chronic bronchitis",
      dosage: "250-750mg once daily",
      sideEffects: "Nausea, diarrhea, dizziness, tendon rupture risk",
      precautions: "Avoid in children/pregnant women. Risk of tendon damage. Stay hydrated."
    },

    // Mental Health
    {
      name: "Sertraline",
      category: "Antidepressant (SSRI)",
      uses: "Depression, anxiety, OCD, PTSD, panic disorder",
      dosage: "50-200mg once daily",
      sideEffects: "Nausea, diarrhea, insomnia, sexual dysfunction, weight changes",
      precautions: "Takes 2-4 weeks to work. Do not stop suddenly. Monitor for worsening depression. Avoid alcohol."
    },
    {
      name: "Escitalopram",
      category: "Antidepressant (SSRI)",
      uses: "Depression, generalized anxiety disorder, social anxiety",
      dosage: "10-20mg once daily",
      sideEffects: "Nausea, fatigue, dry mouth, insomnia, sexual side effects",
      precautions: "Takes 2-6 weeks for full effect. Taper slowly when discontinuing. Can prolong QT interval."
    },
    {
      name: "Alprazolam",
      category: "Benzodiazepine",
      uses: "Anxiety disorders, panic disorder, short-term anxiety relief",
      dosage: "0.25-0.5mg 2-3 times daily (max 4mg/day)",
      sideEffects: "Drowsiness, dizziness, memory problems, dependence",
      precautions: "High addiction potential. Do not stop suddenly. Avoid alcohol. Impairs driving. Short-term use only."
    },
    {
      name: "Zolpidem",
      category: "Sedative-Hypnotic",
      uses: "Insomnia, difficulty falling asleep",
      dosage: "5-10mg at bedtime (max 10mg)",
      sideEffects: "Drowsiness, dizziness, sleepwalking, amnesia, dependence",
      precautions: "Take only when able to get 7-8 hours sleep. Risk of complex sleep behaviors. Short-term use only."
    },

    // Thyroid
    {
      name: "Levothyroxine",
      category: "Thyroid Hormone",
      uses: "Hypothyroidism, thyroid hormone replacement",
      dosage: "25-200mcg once daily (individualized)",
      sideEffects: "If overdosed: anxiety, tremors, rapid heart rate, insomnia",
      precautions: "Take on empty stomach 30-60 min before breakfast. Regular monitoring needed. Lifelong therapy."
    },

    // Vitamins & Supplements
    {
      name: "Vitamin D3",
      category: "Vitamin Supplement",
      uses: "Vitamin D deficiency, bone health, immune support",
      dosage: "1000-2000 IU daily (higher doses for deficiency)",
      sideEffects: "Rare: nausea, constipation, weakness (with toxicity)",
      precautions: "Take with fat-containing meal for better absorption. Monitor levels with blood tests."
    },
    {
      name: "Calcium Carbonate",
      category: "Mineral Supplement",
      uses: "Calcium deficiency, osteoporosis prevention, antacid",
      dosage: "500-1000mg 1-2 times daily with meals",
      sideEffects: "Constipation, gas, bloating",
      precautions: "Take with food for better absorption. Do not exceed 2500mg/day total. Can interact with many drugs."
    },
    {
      name: "Folic Acid",
      category: "Vitamin Supplement",
      uses: "Prevent birth defects, treat folate deficiency, anemia",
      dosage: "400-800mcg daily (1mg in pregnancy)",
      sideEffects: "Rare: nausea, loss of appetite, irritability",
      precautions: "Essential in pregnancy. Can mask B12 deficiency. Generally very safe."
    },

    // Antifungal
    {
      name: "Fluconazole",
      category: "Antifungal",
      uses: "Yeast infections, oral thrush, fungal skin infections",
      dosage: "150mg single dose for vaginal yeast infection; varies for other infections",
      sideEffects: "Nausea, headache, stomach pain, liver enzyme elevation",
      precautions: "Single dose very effective for vaginal yeast infections. Monitor liver function with prolonged use."
    },

    // Antivirals
    {
      name: "Acyclovir",
      category: "Antiviral",
      uses: "Herpes simplex, shingles, chickenpox",
      dosage: "200-800mg 5 times daily depending on infection",
      sideEffects: "Nausea, diarrhea, headache, kidney problems (rare)",
      precautions: "Most effective when started early. Stay well hydrated. Reduce dose in kidney disease."
    }
  ];
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
   const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [healthData, setHealthData] = useState({
    vitals: [],
    medications: [],
    meals: [],
    activities: [],
    mood: [],
  });
  const [medicationReminders, setMedicationReminders] = useState({});
  const [globalCommunityMessages, setGlobalCommunityMessages] = useState({});
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      loadUserData();
    }
  }, []);

  // Load all user data from backend
  const loadUserData = async () => {
    try {
      setLoading(true);
      const [vitals, medications, meals, activities, mood] = await Promise.all([
        api.vitals.getAll(),
        api.medications.getAll(),
        api.meals.getAll(),
        api.activities.getAll(),
        api.mood.getAll(),
      ]);

      setHealthData({
        vitals: vitals || [],
        medications: medications || [],
        meals: meals || [],
        activities: activities || [],
        mood: mood || []
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      if (error.message.includes('Invalid token') || error.message.includes('Access token required')) {
        api.clearToken();
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // ENHANCED: Loud 3-second notification sound
  const playLoudNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = (frequency, startTime, duration, volume = 0.7) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playBeep(1000, now, 0.4, 0.8);
      playBeep(1200, now + 0.5, 0.4, 0.8);
      playBeep(1000, now + 1.0, 0.4, 0.8);
      playBeep(1200, now + 1.5, 0.4, 0.8);
      playBeep(1400, now + 2.0, 0.8, 0.9);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Browser notification
  const showNotification = (title, message) => {
    playLoudNotificationSound();
    
    if (notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '💊',
        badge: '💊',
        tag: 'medication-reminder',
        requireInteraction: true,
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      alert(`${title}\n\n${message}`);
    }
  };

const foodCalorieDatabase = {
  // Grains & Cereals
  'rice': 130, 'brown rice': 112, 'white rice': 130, 'basmati rice': 120,
  'bread': 80, 'white bread': 80, 'brown bread': 65, 'whole wheat bread': 70,
  'pasta': 200, 'spaghetti': 200, 'noodles': 138,
  'oatmeal': 150, 'oats': 150, 'cereal': 110,
  'quinoa': 120, 'couscous': 112,
  
  // Proteins
  'chicken': 165, 'chicken breast': 165, 'grilled chicken': 165,
  'beef': 250, 'steak': 271, 'ground beef': 250,
  'pork': 242, 'bacon': 541, 'ham': 145,
  'fish': 206, 'salmon': 206, 'tuna': 132, 'shrimp': 99,
  'egg': 70, 'eggs': 70, 'boiled egg': 70, 'scrambled egg': 90,
  'tofu': 76, 'tempeh': 193,
  
  // Dairy
  'milk': 150, 'whole milk': 150, 'skim milk': 83,
  'cheese': 402, 'cheddar': 402, 'mozzarella': 280,
  'yogurt': 100, 'greek yogurt': 100, 'butter': 717,
  'cream': 340, 'ice cream': 207,
  
  // Vegetables
  'salad': 50, 'lettuce': 15, 'spinach': 23,
  'tomato': 18, 'tomatoes': 18, 'cucumber': 16,
  'carrot': 41, 'carrots': 41, 'broccoli': 55,
  'potato': 77, 'potatoes': 77, 'sweet potato': 86,
  'onion': 40, 'garlic': 149, 'pepper': 20, 'bell pepper': 20,
  'corn': 86, 'peas': 81, 'beans': 127, 'green beans': 31,
  'cabbage': 25, 'cauliflower': 25, 'zucchini': 17,
  'mushroom': 22, 'mushrooms': 22, 'eggplant': 25,
  
  // Fruits
  'apple': 95, 'banana': 105, 'orange': 62,
  'grapes': 67, 'strawberry': 32, 'strawberries': 32,
  'watermelon': 30, 'mango': 99, 'pineapple': 50,
  'peach': 39, 'pear': 57, 'plum': 30,
  'blueberry': 57, 'blueberries': 57, 'raspberry': 52,
  'kiwi': 42, 'papaya': 43, 'avocado': 160,
  
  // Snacks & Fast Food
  'pizza': 285, 'burger': 354, 'hamburger': 354, 'cheeseburger': 400,
  'sandwich': 250, 'hot dog': 290, 'fries': 312, 'french fries': 312,
  'chips': 536, 'popcorn': 375, 'crackers': 417,
  'cookie': 50, 'cookies': 50, 'cake': 257, 'donut': 195,
  'chocolate': 546, 'candy': 400,
  
  // Beverages
  'coffee': 2, 'tea': 2, 'juice': 112, 'orange juice': 112,
  'soda': 140, 'coke': 140, 'pepsi': 150,
  'beer': 153, 'wine': 125, 'whiskey': 250,
  'smoothie': 180, 'milkshake': 350,
  
  // Condiments & Others
  'oil': 884, 'olive oil': 884, 'mayo': 680, 'mayonnaise': 680,
  'ketchup': 112, 'mustard': 66, 'honey': 304,
  'sugar': 387, 'salt': 0, 'pepper': 251,
  
  // Indian Food
  'roti': 70, 'chapati': 70, 'naan': 262, 'paratha': 126,
  'dal': 116, 'curry': 150, 'paneer': 265,
  'biryani': 200, 'samosa': 252, 'dosa': 168, 'idli': 39,
  
  // Nuts & Seeds
  'almond': 579, 'almonds': 579, 'walnut': 654, 'walnuts': 654,
  'cashew': 553, 'cashews': 553, 'peanut': 567, 'peanuts': 567,
  'peanut butter': 588, 'sunflower seeds': 584,
};

// Comprehensive Activity Calorie Database (calories per minute)
const activityCalorieDatabase = {
  // Cardio Activities
  'running': 10, 'jogging': 7, 'sprinting': 15,
  'walking': 5, 'brisk walking': 7, 'power walking': 6,
  'cycling': 8, 'biking': 8, 'spinning': 12,
  'swimming': 11, 'lap swimming': 11, 'water aerobics': 8,
  'rowing': 9, 'elliptical': 9, 'stair climbing': 10,
  'jumping rope': 13, 'jump rope': 13,
  
  // Sports
  'basketball': 8, 'football': 9, 'soccer': 10,
  'tennis': 8, 'badminton': 7, 'volleyball': 4,
  'cricket': 5, 'baseball': 5, 'golf': 4,
  'boxing': 13, 'martial arts': 10, 'kickboxing': 10,
  'hockey': 10, 'skateboarding': 5, 'roller skating': 7,
  
  // Gym & Strength Training
  'gym': 7, 'weight lifting': 6, 'strength training': 6,
  'crossfit': 12, 'circuit training': 10, 'bodyweight': 5,
  'pushups': 8, 'situps': 8, 'planking': 5,
  'squats': 8, 'lunges': 6, 'burpees': 10,
  
  // Dance & Aerobics
  'dancing': 6, 'dance': 6, 'zumba': 9,
  'aerobics': 7, 'step aerobics': 8, 'jazzercise': 7,
  'ballet': 5, 'salsa': 6, 'hip hop': 7,
  
  // Low Impact Activities
  'yoga': 3, 'pilates': 4, 'tai chi': 3,
  'stretching': 2, 'meditation': 1,
  
  // Outdoor Activities
  'hiking': 7, 'trekking': 7, 'rock climbing': 11,
  'mountain biking': 10, 'skiing': 7, 'snowboarding': 6,
  'surfing': 4, 'kayaking': 5, 'canoeing': 4,
  
  // Daily Activities
  'gardening': 5, 'cleaning': 4, 'mowing lawn': 6,
  'stairs': 8, 'housework': 3, 'cooking': 2,
  'shopping': 3, 'child care': 4,
};

// Calculate calories from food items
const calculateCalories = (foodItems) => {
  const items = foodItems.toLowerCase().split(',').map(item => item.trim());
  let totalCalories = 0;
  let foundItems = [];
  let breakdown = [];
  
  items.forEach(item => {
    const words = item.split(' ');
    let matched = false;
    
    // Try to match the full item first
    if (foodCalorieDatabase[item]) {
      totalCalories += foodCalorieDatabase[item];
      foundItems.push(item);
      breakdown.push(`${item}: ${foodCalorieDatabase[item]} kcal`);
      matched = true;
    } else {
      // Try to match individual words
      for (let word of words) {
        if (foodCalorieDatabase[word]) {
          totalCalories += foodCalorieDatabase[word];
          foundItems.push(word);
          breakdown.push(`${word}: ${foodCalorieDatabase[word]} kcal`);
          matched = true;
          break;
        }
      }
    }
    
    if (!matched && item.length > 2) {
      breakdown.push(`${item}: Not found in database`);
    }
  });
  
  return { totalCalories, foundItems, breakdown };
};

// Calculate calories burned from activity
const calculateCaloriesBurned = (activityType, duration) => {
  const type = activityType.toLowerCase().trim();
  let caloriesPerMin = 0;
  let matchedActivity = '';
  
  // Try to find matching activity
  for (let key in activityCalorieDatabase) {
    if (type.includes(key) || key.includes(type)) {
      caloriesPerMin = activityCalorieDatabase[key];
      matchedActivity = key;
      break;
    }
  }
  
  const totalCalories = Math.round(caloriesPerMin * duration);
  return { totalCalories, caloriesPerMin, matchedActivity };
};

  // ENHANCED: Detailed mood-based suggestions
  const getMoodSuggestions = (mood, stressLevel) => {
    const stress = parseInt(stressLevel);
    const suggestions = { points: [], color: 'text-purple-600' };

    if (mood === 'Happy') {
      suggestions.points = [
        '🎉 Your positive energy is amazing! Channel it into something creative today',
        '📞 Call a friend or family member and share your happiness - joy is contagious!',
        '📝 Journal about what made you happy to remember this feeling later',
        '🎵 Create or listen to an upbeat playlist that matches your elevated mood',
        '💪 Use this energy for a fun workout, dance session, or outdoor activity'
      ];
      if (stress <= 3) {
        suggestions.points.push('🌟 You\'re in a great mental space - perfect time to tackle challenging goals!');
      }
    } else if (mood === 'Energetic') {
      suggestions.points = [
        '⚡ Harness this energy! Perfect time for physical activities or intense exercise',
        '🎯 Tackle your most challenging tasks while you have this momentum',
        '🎨 Start that creative project you\'ve been putting off - your brain is ready',
        '🏃 Go for a run, bike ride, or high-intensity workout to channel this energy',
        '📚 Learn something new - your mind is primed to absorb information'
      ];
      if (stress <= 4) {
        suggestions.points.push('🚀 You\'re unstoppable today! Set ambitious goals and go after them!');
      }
    } else if (mood === 'Stressed') {
      suggestions.points = [
        '🧘 Take 10 deep breaths right now - inhale for 4, hold for 4, exhale for 6 seconds',
        '🚶 Step away for a 15-minute walk outside. Fresh air works wonders',
        '📞 Call someone you trust and talk about what\'s bothering you',
        '🎵 Listen to calming music or nature sounds (rain, ocean waves, forest)',
        '📝 Write down your worries and one small action you can take for each'
      ];
      if (stress >= 7) {
        suggestions.points.push('🚨 High stress alert! Consider taking a mental health break today');
        suggestions.points.push('💚 If stress persists, please reach out to a mental health professional');
      }
    } else if (mood === 'Anxious') {
      suggestions.points = [
        '🫁 Practice the 4-7-8 breathing technique: Inhale 4, hold 7, exhale 8',
        '📱 Text or call a trusted friend - you don\'t have to face this alone',
        '🧘 Try a 10-minute guided meditation app (Headspace, Calm, Insight Timer)',
        '🎧 Listen to your favorite calming playlist or ASMR sounds',
        '✍️ Journal your thoughts - getting them on paper can reduce their power'
      ];
      if (stress >= 8) {
        suggestions.points.push('⚠️ Severe anxiety detected. Please consider speaking with a therapist');
        suggestions.points.push('📞 Crisis helpline available 24/7 if you need immediate support');
      }
    } else if (mood === 'Sad') {
      suggestions.points = [
        '🤗 Be gentle with yourself - it\'s completely okay to not feel okay',
        '☀️ Get 15-20 minutes of sunlight exposure - it naturally boosts serotonin',
        '👥 Reach out to someone who cares about you, even just to say hi',
        '🎨 Engage in a creative activity you enjoy - painting, music, writing',
        '🎬 Watch something that usually makes you smile (comedy, feel-good movie)'
      ];
      if (stress >= 7) {
        suggestions.points.push('💚 Consider speaking with a mental health professional - you deserve support');
      }
      suggestions.points.push('🌈 Remember: This feeling is temporary, and brighter days are ahead');
    } else {
      suggestions.points = [
        '🎯 Set 2-3 small achievable goals for today to build momentum',
        '🧘 Practice 5 minutes of mindfulness to stay grounded in the present',
        '🏃 Add some movement - even a short walk can elevate your mood',
        '📚 Read something inspiring or listen to a motivational podcast',
        '💭 List 3 things you\'re grateful for today, no matter how small'
      ];
      if (stress >= 5) {
        suggestions.points.push('⚡ Moderate stress detected - take breaks throughout your day');
      }
    }

    return suggestions;
  };
    const getHealthSuggestions = (vitals) => {
const suggestions = [];

// --- BLOOD PRESSURE ANALYSIS ---
if (vitals.systolic && vitals.diastolic) {
  // Hypotension (Low BP)
  if (vitals.systolic < 90 || vitals.diastolic < 60) {
    suggestions.push({
      type: 'bp',
      level: 'LOW',
      message: '⚠️ Low Blood Pressure Detected',
      points: [
        '💧 Drink plenty of fluids (2.5–3 liters daily, unless restricted)',
        '🧂 Increase salt intake slightly — only after consulting a doctor',
        '🍌 Eat potassium-rich foods (bananas, oranges, spinach)',
        '🚶 Rise slowly from sitting or lying down to avoid dizziness',
        '🥣 Eat small, frequent meals to avoid blood pressure drops',
        '📞 Seek medical help if fainting, confusion, or blurred vision occurs'
      ],
      color: 'text-blue-600'
    });
  }

  // Normal BP
  else if (vitals.systolic >= 90 && vitals.systolic < 120 && vitals.diastolic >= 60 && vitals.diastolic < 80) {
    suggestions.push({
      type: 'bp',
      level: 'NORMAL',
      message: '✅ Normal Blood Pressure',
      points: [
        '🥗 Follow a heart-healthy diet (low salt, high fruits & veggies)',
        '🏃 Exercise 30–45 minutes at least 5 days/week',
        '😌 Manage stress through meditation, yoga, or deep breathing',
        '🚭 Avoid smoking or exposure to secondhand smoke',
        '📊 Check your BP once every few weeks',
        '💚 Maintain a healthy body weight and sleep routine'
      ],
      color: 'text-green-600'
    });
  }

  // Elevated BP
  else if ((vitals.systolic >= 120 && vitals.systolic < 130) && vitals.diastolic < 80) {
    suggestions.push({
      type: 'bp',
      level: 'ELEVATED',
      message: '⚡ Elevated Blood Pressure (Early Warning)',
      points: [
        '🧂 Limit salt intake below 2g (less than one teaspoon daily)',
        '🚶 Engage in 150 minutes of moderate activity weekly',
        '🍎 Follow the DASH diet (Dietary Approaches to Stop Hypertension)',
        '🍺 Limit alcohol — 1 drink/day (women), 2 drinks/day (men)',
        '🧘 Reduce screen stress and maintain regular sleep patterns',
        '📈 Track BP twice a week to detect changes early'
      ],
      color: 'text-yellow-600'
    });
  }

  // Stage 1 Hypertension
  else if ((vitals.systolic >= 130 && vitals.systolic < 140) || (vitals.diastolic >= 80 && vitals.diastolic < 90)) {
    suggestions.push({
      type: 'bp',
      level: 'STAGE_1_HYPERTENSION',
      message: '⚠️ Stage 1 Hypertension - Early Lifestyle Intervention Needed',
      points: [
        '👨‍⚕️ Book a doctor’s appointment for evaluation within a few weeks',
        '🥦 Strictly follow DASH or Mediterranean diet',
        '🏃 Exercise 30–45 min/day (walking, cycling, swimming)',
        '😴 Sleep 7–8 hours; avoid night-time screen exposure',
        '🚭 Quit smoking and reduce alcohol use',
        '📉 Track BP daily and note morning/evening readings'
      ],
      color: 'text-orange-600'
    });
  }

  // Stage 2 or Crisis
  else if (vitals.systolic >= 140 || vitals.diastolic >= 90) {
    const isCrisis = vitals.systolic >= 180 || vitals.diastolic >= 120;
    suggestions.push({
      type: 'bp',
      level: isCrisis ? 'HYPERTENSIVE_CRISIS' : 'STAGE_2_HYPERTENSION',
      message: isCrisis 
        ? '🚨 Hypertensive Crisis — Seek Emergency Care NOW!' 
        : '🚨 Stage 2 Hypertension — Immediate Doctor Visit Required',
      points: isCrisis ? [
        '🚑 Call emergency services immediately',
        '💊 Do not take extra medication unless instructed by your doctor',
        '🏥 Go to the nearest emergency department now',
        '🛑 Avoid exertion or emotional stress',
        '📞 Inform your family or caregiver immediately'
      ] : [
        '👨‍⚕️ Visit your doctor soon; medication is likely needed',
        '🧂 Reduce salt to under 1.5g/day (read food labels carefully)',
        '🥗 Follow a strict DASH diet',
        '🏃 Exercise gently after doctor approval',
        '😴 Ensure consistent, restorative sleep',
        '🚭 Avoid all tobacco and limit alcohol strictly'
      ],
      color: 'text-red-600'
    });
  }
}

// --- BLOOD SUGAR ANALYSIS ---
if (vitals.sugar) {
  if (vitals.sugar < 70) {
    suggestions.push({
      type: 'sugar',
      level: 'LOW',
      message: '⚠️ Hypoglycemia (Low Blood Sugar)',
      points: [
        '🍬 Eat 15g of fast sugar: 1 tbsp sugar, ½ glass juice, or 3 glucose tablets',
        '⏱️ Check again after 15 minutes — repeat if still below 70 mg/dL',
        '🍽️ Eat a meal or snack with protein after recovery',
        '📞 Contact your doctor if symptoms occur frequently',
        '🚨 Avoid skipping meals, especially before exercise'
      ],
      color: 'text-blue-600'
    });
  } else if (vitals.sugar >= 70 && vitals.sugar <= 100) {
    suggestions.push({
      type: 'sugar',
      level: 'NORMAL',
      message: '✅ Normal Fasting Glucose',
      points: [
        '🥗 Maintain a balanced, high-fiber diet',
        '🏃 Continue physical activity (150 min/week)',
        '🩺 Get fasting glucose checked every 3–6 months',
        '💧 Stay hydrated; avoid sugary beverages'
      ],
      color: 'text-green-600'
    });
  } else if (vitals.sugar > 100 && vitals.sugar <= 125) {
    suggestions.push({
      type: 'sugar',
      level: 'PREDIABETES',
      message: '⚡ Prediabetes Range - Lifestyle Adjustment Needed',
      points: [
        '🥦 Reduce refined carbs and sugary snacks',
        '🚶 Walk 30 minutes daily after meals',
        '⚖️ Aim for 5–10% weight loss if overweight',
        '📊 Recheck fasting glucose every 3 months',
        '👨‍⚕️ Discuss with doctor about early prevention plans'
      ],
      color: 'text-yellow-600'
    });
  } else {
    suggestions.push({
      type: 'sugar',
      level: 'HIGH',
      message: '🚨 Hyperglycemia (High Blood Sugar)',
      points: [
        '💊 Take your prescribed diabetes medication or insulin on time',
        '🥗 Strictly limit sugary foods and white flour',
        '💧 Drink water frequently to flush excess glucose',
        '🏃 Engage in light exercise (e.g., walking) unless sugar >250 mg/dL with ketones',
        '👨‍⚕️ Contact your doctor if persistently above 180 mg/dL'
      ],
      color: 'text-red-600'
    });
  }
}

// --- WEIGHT (Simplified for no height data) ---
if (vitals.weight && vitals.weight > 0) {
  if (vitals.weight < 50) {
    suggestions.push({
      type: 'weight',
      level: 'UNDERWEIGHT',
      message: '⚠️ Low Body Weight',
      points: [
        '🍽️ Eat 5–6 nutrient-dense meals per day',
        '💪 Include high-protein snacks (nuts, eggs, milk, lentils)',
        '🥤 Add healthy calorie boosters like smoothies and peanut butter',
        '👨‍⚕️ Check for underlying thyroid or digestive issues'
      ],
      color: 'text-blue-600'
    });
  }
}

// --- SLEEP ANALYSIS ---
if (vitals.sleep < 6) {
  suggestions.push({
    type: 'sleep',
    level: 'INSUFFICIENT',
    message: '⚠️ Sleep Deprivation',
    points: [
      '🕐 Aim for at least 7 hours of sleep per night',
      '📵 Avoid screens for 60 mins before bed',
      '🌡️ Keep room cool and dark (20–22°C)',
      '☕ Avoid caffeine or nicotine after evening',
      '🧘 Try breathing or relaxation techniques before bed'
    ],
    color: 'text-blue-600'
  });
} else if (vitals.sleep >= 6 && vitals.sleep <= 9) {
  suggestions.push({
    type: 'sleep',
    level: 'OPTIMAL',
    message: '✅ Healthy Sleep Duration',
    points: [
      '⏰ Keep a consistent bedtime and wake-up schedule',
      '🏃 Regular exercise improves sleep quality',
      '🌙 Avoid heavy meals and alcohol before bedtime',
      '🧘 Maintain evening relaxation habits',
      '📊 Track sleep patterns if using a smartwatch'
    ],
    color: 'text-green-600'
  });
} else {
  suggestions.push({
    type: 'sleep',
    level: 'EXCESSIVE',
    message: '⚡ Excessive Sleep Duration',
    points: [
      '👨‍⚕️ Consult your doctor to rule out depression, thyroid, or sleep apnea',
      '☀️ Get sunlight within 30 min of waking',
      '🚶 Increase daily activity and social engagement',
      '🕗 Set alarms to maintain consistent wake-up time'
    ],
    color: 'text-yellow-600'
  });
}

// --- WATER INTAKE ANALYSIS ---
if (vitals.water < 6) {
  suggestions.push({
    type: 'water',
    level: 'DEHYDRATED',
    message: '⚠️ Low Water Intake',
    points: [
      '💧 Aim for 8–10 glasses (2–2.5 liters) per day',
      '🥒 Include hydrating foods (cucumber, orange, watermelon)',
      '⏰ Sip water regularly, not all at once',
      '🏃 Increase fluids during exercise or hot weather',
      '📊 Use a bottle tracker app to log water intake'
    ],
    color: 'text-blue-600'
  });
} else if (vitals.water >= 6 && vitals.water <= 10) {
  suggestions.push({
    type: 'water',
    level: 'WELL-HYDRATED',
    message: '✅ Healthy Hydration Level',
    points: [
      '💧 Maintain current intake',
      '🏃 Drink more during workouts',
      '☕ Balance coffee/tea with extra water',
      '🧂 Replenish electrolytes if sweating heavily'
    ],
    color: 'text-green-600'
  });
} else {
  suggestions.push({
    type: 'water',
    level: 'OVERHYDRATION',
    message: '⚡ Possible Overhydration',
    points: [
      '⚖️ Avoid drinking more than 4 liters/day without medical need',
      '🧂 Ensure adequate electrolytes (sodium, potassium)',
      '👨‍⚕️ See doctor if feeling bloated or lightheaded',
      '🚫 Avoid excessive water intake in short time spans'
    ],
    color: 'text-yellow-600'
  });
}

return suggestions;

  };

  useEffect(() => {
    const checkReminders = () => {
      if (!currentUser) return;
      if (!healthData.medications) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      healthData.medications.filter(m => m.active).forEach(med => {
        if (med.time === currentTime && !medicationReminders[med._id]) {
          setMedicationReminders(prev => ({ ...prev, [med._id]: true }));
          
          showNotification(
            '💊 MEDICATION REMINDER',
            `Time to take ${med.name}!\n${med.frequency}`
          );
          
          setTimeout(() => {
            setMedicationReminders(prev => {
              const updated = { ...prev };
              delete updated[med._id];
              return updated;
            });
          }, 60000);
        }
      });
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();
    return () => clearInterval(interval);
  }, [currentUser, healthData, medicationReminders]);

  const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        let response;
        if (isLogin) {
          response = await api.auth.login({ 
            email: formData.email, 
            password: formData.password 
          });
        } else {
          response = await api.auth.register(formData);
        }

        api.setToken(response.token);
        setCurrentUser(response.user);
        setCurrentPage('dashboard');
        
        await loadUserData();
        
        alert(isLogin ? 'Login successful!' : 'Registration successful!');
      } catch (error) {
        setError(error.message || 'Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
              <Activity className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Health Dashboard</h1>
            <p className="text-gray-600 mt-2">Your Holistic Wellness Companion</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    );
  };
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
const [newPassword, setNewPassword] = useState('');
const [showPasswordField, setShowPasswordField] = useState(false);


  // Get the last added vitals (most recent entry in the array)
  const latestVitals = useMemo(() => {
    return healthData.vitals.length > 0 
      ? healthData.vitals[0]
      : {};
  }, [healthData.vitals]);

  // Recalculate suggestions whenever latestVitals changes
  const suggestions = useMemo(() => {
    return latestVitals.systolic ? getHealthSuggestions(latestVitals) : [];
  }, [latestVitals]);

  // Fetch stats when component loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await api.vitals.getStats();
        setStats(response);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (healthData.vitals.length > 0) {
      fetchStats();
    }
  }, [healthData.vitals.length]);

  // Initialize edited user when opening profile
  useEffect(() => {
  if (showProfile && currentUser) {
    setEditedUser({ ...currentUser });
  }
}, [showProfile, currentUser]);

const handleEditToggle = () => {
  if (isEditing) {
    setEditedUser({ ...currentUser });
  }
  setIsEditing(!isEditing);
};

const handleSaveProfile = async () => {
  try {
    const profileData = { ...editedUser };
    
    // Add password if provided
    if (newPassword && newPassword.trim() !== '') {
      profileData.password = newPassword;
    }
    
    const response = await api.users.updateProfile(profileData);
    setCurrentUser(response.user);
    setIsEditing(false);
    setNewPassword('');
    alert('✅ Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Show specific error messages based on what's duplicate
    const errorMessage = error.message;
    
    if (errorMessage.includes('Email already in use')) {
      alert('⚠️ This email is already registered by another user. Please use a different email.');
    } else if (errorMessage.includes('Phone number already in use')) {
      alert('⚠️ This phone number is already registered by another user. Please use a different phone number.');
    } else if (errorMessage.includes('Name already in use')) {
      alert('⚠️ This name is already taken by another user. Please use a different name.');
    } else {
      alert('⚠️ Failed to update profile: ' + errorMessage);
    }
  }
};

const handleDeleteAccount = async () => {
  try {
    await api.users.deleteAccount();
    alert('✅ Account deleted successfully');
    
    // Clear token and redirect to login
    localStorage.removeItem('token');
    setShowProfile(false);
    setShowDeleteConfirm(false);
    
    // Redirect to login page (adjust based on your routing)
    window.location.href = '/login'; // or use your router navigation
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('⚠️ Failed to delete account: ' + error.message);
  }
};

const handleInputChange = (field, value) => {
  setEditedUser(prev => ({ ...prev, [field]: value }));
};
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome back, {currentUser?.name}!</h2>
          <p className="text-gray-600 mt-1">Here's your health overview for today</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
          >
            <User className="w-5 h-5" />
            My Profile
          </button>
          <button
            onClick={() => setCurrentPage('report')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition"
          >
            <FileText className="w-5 h-5" />
            Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      ) : (
        <>
          {/* Health Trends & Statistics Section */}
          {stats && stats.count > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Health Trends & Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Averages Section */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Your Averages ({stats.count} records)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure:</span>
                      <span className="font-semibold text-gray-800">
                        {Math.round(stats.averages.systolic)}/{Math.round(stats.averages.diastolic)} mmHg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Sugar:</span>
                      <span className="font-semibold text-gray-800">
                        {Math.round(stats.averages.sugar)} mg/dL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-semibold text-gray-800">
                        {stats.averages.weight.toFixed(1)} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sleep:</span>
                      <span className="font-semibold text-gray-800">
                        {stats.averages.sleep.toFixed(1)} hrs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Intake:</span>
                      <span className="font-semibold text-gray-800">
                        {Math.round(stats.averages.water)} glasses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trends Section */}
                {stats.trends && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      7-Day Trends
                    </h4>
                    <div className="space-y-2 text-sm">
                      <TrendItem 
                        label="Systolic BP" 
                        value={stats.trends.systolic} 
                      />
                      <TrendItem 
                        label="Diastolic BP" 
                        value={stats.trends.diastolic} 
                      />
                      <TrendItem 
                        label="Blood Sugar" 
                        value={stats.trends.sugar} 
                      />
                      <TrendItem 
                        label="Weight" 
                        value={stats.trends.weight} 
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      * Compared to previous 7 days
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Personalized Health Insights & Recommendations</h3>
              <div className="space-y-6">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                    <p className={`font-bold text-lg ${suggestion.color} mb-3`}>
                      {suggestion.message}
                    </p>
                    <ul className="space-y-2">
                      {suggestion.points.map((point, pIdx) => (
                        <li key={pIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 font-bold mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={<Heart className="w-6 h-6" />} 
              title="Blood Pressure" 
              value={`${Math.round(latestVitals.systolic || 0)}/${Math.round(latestVitals.diastolic || 0)}`} 
              unit="mmHg" 
              color="from-red-500 to-pink-500" 
            />
            <StatCard 
              icon={<Droplet className="w-6 h-6" />} 
              title="Blood Sugar" 
              value={Math.round(latestVitals.sugar || 0)} 
              unit="mg/dL" 
              color="from-blue-500 to-cyan-500" 
            />
            <StatCard 
              icon={<Activity className="w-6 h-6" />} 
              title="Weight" 
              value={(latestVitals.weight || 0).toFixed(1)} 
              unit="kg" 
              color="from-purple-500 to-indigo-500" 
            />
            <StatCard 
              icon={<Moon className="w-6 h-6" />} 
              title="Sleep" 
              value={(latestVitals.sleep || 0).toFixed(1)} 
              unit="hours" 
              color="from-yellow-500 to-orange-500" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Blood Pressure Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={healthData.vitals.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#ef4444" 
                    name="Systolic (mmHg)" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#f97316" 
                    name="Diastolic (mmHg)" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Blood Sugar Levels</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={healthData.vitals.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sugar" stroke="#10b981" fill="#10b98130" name="Sugar (mg/dL)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Mood Tracker</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={healthData.mood.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stress" fill="#8b5cf6" name="Stress Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Medications</h3>
              <div className="space-y-3">
                {healthData.medications.filter(m => m.active).length > 0 ? (
                  healthData.medications.filter(m => m.active).map(med => (
                    <div key={med._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Pill className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.time} - {med.frequency}</p>
                        </div>
                      </div>
                      <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                        <Bell className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No medications scheduled</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile Sidebar */}
      {showProfile && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowProfile(false);
              setIsEditing(false);
              setShowDeleteConfirm(false);
            }}
          />
          
          {/* Profile Panel */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setIsEditing(false);
                    setShowDeleteConfirm(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-white" />
                </div>
                {!isEditing && (
                  <h3 className="text-2xl font-bold text-gray-800">{currentUser?.name}</h3>
                )}
              </div>

              {/* Action Buttons */}
              {!isEditing && !showDeleteConfirm && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              )}

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500 rounded-full">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 text-lg">Delete Account?</h4>
                      <p className="text-sm text-red-700">This action cannot be undone</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to permanently delete your account? All your health data, medications, and records will be lost forever.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Yes, Delete Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Information */}
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Personal Information
                  </h4>
                  
                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.email}</p>
                    )}
                  </div>
                  {/* Password - Only show in edit mode */}
{isEditing && (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      <Lock className="w-4 h-4" />
      Password
    </label>
    
    {!showPasswordField ? (
      <button
        type="button"
        onClick={() => setShowPasswordField(true)}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition"
      >
        Click to change password
      </button>
    ) : (
      <div className="space-y-2">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          minLength="6"
        />
        <button
          type="button"
          onClick={() => {
            setShowPasswordField(false);
            setNewPassword('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel password change
        </button>
      </div>
    )}
  </div>
)}
                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedUser?.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.dateOfBirth || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    {isEditing ? (
                      <select
                        value={editedUser?.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.gender || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedUser?.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Medical Information
                  </h4>
                  
                  {/* Blood Group */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                    {isEditing ? (
                      <select
                        value={editedUser?.bloodGroup || ''}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.bloodGroup || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Height */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedUser?.height || ''}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.height ? `${currentUser.height} cm` : 'Not provided'}</p>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                    {isEditing ? (
                      <textarea
                        value={editedUser?.allergies || ''}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        rows="2"
                        placeholder="List any allergies"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.allergies || 'None'}</p>
                    )}
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Conditions</label>
                    {isEditing ? (
                      <textarea
                        value={editedUser?.medicalConditions || ''}
                        onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                        rows="2"
                        placeholder="List any medical conditions"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.medicalConditions || 'None'}</p>
                    )}
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Emergency Contact
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Emergency Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser?.emergencyContact || ''}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white px-4 py-2 rounded-lg">{currentUser?.emergencyContact || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-500" />
                    Account Information
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-white px-4 py-2 rounded-lg">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="font-semibold text-gray-800">{currentUser?._id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between bg-white px-4 py-2 rounded-lg">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-semibold text-gray-800">
                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between bg-white px-4 py-2 rounded-lg">
                      <span className="text-gray-600">Account Status:</span>
                      <span className="font-semibold text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper component to show trend with up/down arrows
const TrendItem = ({ label, value }) => {
  const numValue = parseFloat(value);
  const isPositive = numValue > 0;
  const isNegative = numValue < 0;
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <span className={`font-semibold flex items-center gap-1 ${
        isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-600'
      }`}>
        {isPositive && <span>↑</span>}
        {isNegative && <span>↓</span>}
        {Math.abs(numValue)}%
      </span>
    </div>
  );
};
const VitalsPage = () => {
  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', sugar: '', weight: '', sleep: '', water: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newVital = {
        date: new Date().toISOString(),
        systolic: parseFloat(formData.systolic) || 0,
        diastolic: parseFloat(formData.diastolic) || 0,
        sugar: parseFloat(formData.sugar) || 0,
        weight: parseFloat(formData.weight) || 0,
        sleep: parseFloat(formData.sleep) || 0,
        water: parseFloat(formData.water) || 0
      };

      await api.vitals.create(newVital);
      
      // Reset form first
      setFormData({ systolic: '', diastolic: '', sugar: '', weight: '', sleep: '', water: '' });
      
      // Reload data to get the updated vitals list
      await loadUserData();
      
      const suggestions = getHealthSuggestions(newVital);
      const message = 'Vitals recorded successfully!\n\n' + 
        suggestions.map(s => s.message + '\n' + s.points.join('\n')).join('\n\n');
      alert(message);
    } catch (error) {
      alert('Failed to save vitals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vitalId) => {
    console.log('Deleting vital with ID:', vitalId);
    
    if (!vitalId) {
      alert('Vital ID is missing');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this vital record?')) {
      return;
    }

    try {
      setLoading(true);
      await api.vitals.delete(vitalId);
      await loadUserData();
      alert('Vital record deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete vital: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Daily Vitals Tracking</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Record Today's Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input 
            type="number" 
            placeholder="Systolic BP (mmHg)" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.systolic} 
            onChange={(e) => setFormData({ ...formData, systolic: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Diastolic BP (mmHg)" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.diastolic} 
            onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Blood Sugar (mg/dL)" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.sugar} 
            onChange={(e) => setFormData({ ...formData, sugar: e.target.value })} 
          />
          <input 
            type="number" 
            step="0.1" 
            placeholder="Weight (kg)" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.weight} 
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })} 
          />
          <input 
            type="number" 
            step="0.1" 
            placeholder="Sleep Hours" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.sleep} 
            onChange={(e) => setFormData({ ...formData, sleep: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Water Intake (glasses)" 
            className="px-4 py-3 border rounded-lg" 
            value={formData.water} 
            onChange={(e) => setFormData({ ...formData, water: e.target.value })} 
          />
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Vitals History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">BP (Sys/Dia)</th>
                <th className="px-4 py-3 text-left">Sugar</th>
                <th className="px-4 py-3 text-left">Weight</th>
                <th className="px-4 py-3 text-left">Sleep</th>
                <th className="px-4 py-3 text-left">Water</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {healthData.vitals.slice().reverse().map((vital, idx) => (
                <tr key={vital._id || idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(vital.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{Math.round(vital.systolic)}/{Math.round(vital.diastolic)}</td>
                  <td className="px-4 py-3">{Math.round(vital.sugar)}</td>
                  <td className="px-4 py-3">{vital.weight.toFixed(1)} kg</td>
                  <td className="px-4 py-3">{vital.sleep.toFixed(1)} hrs</td>
                  <td className="px-4 py-3">{Math.round(vital.water)} glasses</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(vital._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
  const MedicationPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', time: '', frequency: 'Daily' });

    const handleAdd = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        await api.medications.create({ ...formData, active: true });
        await loadUserData();
        
        setFormData({ name: '', time: '', frequency: 'Daily' });
        setShowForm(false);
        alert('Medication added! You will receive loud 3-second notification at the scheduled time.');
      } catch (error) {
        alert('Failed to add medication: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (medId) => {
      if (window.confirm('Are you sure you want to delete this medication reminder?')) {
        setLoading(true);
        try {
          await api.medications.delete(medId);
          await loadUserData();
          alert('Medication reminder deleted successfully!');
        } catch (error) {
          alert('Failed to delete medication: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Medication Reminders</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">New Medication</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Medicine Name" 
                className="px-4 py-3 border rounded-lg" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
              <input 
                type="time" 
                className="px-4 py-3 border rounded-lg" 
                value={formData.time} 
                onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                required 
              />
              <select 
                className="px-4 py-3 border rounded-lg" 
                value={formData.frequency} 
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option>Daily</option>
                <option>Twice Daily</option>
                <option>Weekly</option>
              </select>
              <button 
                onClick={handleAdd}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 md:col-span-3 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Medication'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.medications.length > 0 ? (
            healthData.medications.map(med => (
              <div key={med._id} className="bg-white rounded-xl shadow-lg p-6 relative">
                <button
                  onClick={() => handleDelete(med._id)}
                  disabled={loading}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  title="Delete medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between mb-4 pr-10">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${med.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {med.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{med.name}</h3>
                <p className="text-gray-600 mb-1">⏰ {med.time}</p>
                <p className="text-gray-600">📅 {med.frequency}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-600">
              <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No medications added yet. Click "Add Medication" to start.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  const DietActivityPage = () => {
  const [mealForm, setMealForm] = useState({ 
    meal: 'Breakfast', 
    items: '', 
    calories: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [activityForm, setActivityForm] = useState({ 
    type: '', 
    duration: '', 
    calories: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [calorieInfo, setCalorieInfo] = useState('');
  const [activityInfo, setActivityInfo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchMeals();
    fetchActivities();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const data = await api.meals.getAll();
      setMeals(data);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      alert('⚠️ Failed to load meals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.activities.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      alert('⚠️ Failed to load activities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMealItemsChange = (value) => {
    setMealForm({ ...mealForm, items: value });
    if (value.trim()) {
      const { totalCalories, foundItems, breakdown } = calculateCalories(value);
      if (foundItems.length > 0) {
        setCalorieInfo(`✅ Auto-calculated: ${totalCalories} kcal\n${breakdown.join('\n')}`);
        setMealForm(prev => ({ ...prev, calories: totalCalories.toString() }));
      } else {
        setCalorieInfo('❌ No matching foods found. Enter calories manually.');
        setMealForm(prev => ({ ...prev, calories: '' }));
      }
    } else {
      setCalorieInfo('');
      setMealForm(prev => ({ ...prev, calories: '' }));
    }
  };

  const handleActivityChange = (type, duration) => {
    setActivityForm({ ...activityForm, type, duration });
    if (type && duration) {
      const { totalCalories, caloriesPerMin, matchedActivity } = calculateCaloriesBurned(type, parseInt(duration));
      if (matchedActivity) {
        setActivityInfo(`✅ Auto-calculated: ${totalCalories} kcal burned\n(${matchedActivity}: ${caloriesPerMin} kcal/min × ${duration} min)`);
        setActivityForm(prev => ({ ...prev, calories: totalCalories.toString() }));
      } else {
        setActivityInfo('❌ Activity not found. Enter calories manually.');
        setActivityForm(prev => ({ ...prev, calories: '' }));
      }
    } else {
      setActivityInfo('');
      setActivityForm(prev => ({ ...prev, calories: '' }));
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.items || !mealForm.calories) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const mealData = {
        date: mealForm.date,
        meal: mealForm.meal,
        items: mealForm.items,
        calories: parseInt(mealForm.calories)
      };
      
      await api.meals.create(mealData);
      await fetchMeals(); // Refresh the list
      
      setMealForm({ 
        meal: 'Breakfast', 
        items: '', 
        calories: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setCalorieInfo('');
      alert('✅ Meal logged successfully!');
    } catch (error) {
      console.error('Failed to log meal:', error);
      alert('⚠️ Failed to log meal: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('🗑️ Are you sure you want to delete this meal entry?')) {
      try {
        await api.meals.delete(mealId);
        await fetchMeals(); // Refresh the list
        alert('✅ Meal deleted successfully!');
      } catch (error) {
        console.error('Failed to delete meal:', error);
        alert('⚠️ Failed to delete meal: ' + error.message);
      }
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityForm.type || !activityForm.duration || !activityForm.calories) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const activityData = {
        date: activityForm.date,
        type: activityForm.type,
        duration: parseInt(activityForm.duration),
        calories: parseInt(activityForm.calories)
      };
      
      await api.activities.create(activityData);
      await fetchActivities(); // Refresh the list
      
      setActivityForm({ 
        type: '', 
        duration: '', 
        calories: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setActivityInfo('');
      alert('✅ Activity logged successfully!');
    } catch (error) {
      console.error('Failed to log activity:', error);
      alert('⚠️ Failed to log activity: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('🗑️ Are you sure you want to delete this activity entry?')) {
      try {
        await api.activities.delete(activityId);
        await fetchActivities(); // Refresh the list
        alert('✅ Activity deleted successfully!');
      } catch (error) {
        console.error('Failed to delete activity:', error);
        alert('⚠️ Failed to delete activity: ' + error.message);
      }
    }
  };

  const filteredMeals = meals.filter(m => {
    const mealDate = new Date(m.date).toISOString().split('T')[0];
    return mealDate === selectedDate;
  });
  
  const filteredActivities = activities.filter(a => {
    const activityDate = new Date(a.date).toISOString().split('T')[0];
    return activityDate === selectedDate;
  });

  const totalCaloriesConsumed = filteredMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalCaloriesBurned = filteredActivities.reduce((sum, a) => sum + a.calories, 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  if (loading && meals.length === 0 && activities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Diet & Activity Logs</h2>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <Calendar className="w-5 h-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            icon={<Apple className="w-6 h-6" />} 
            title="Calories Consumed" 
            value={totalCaloriesConsumed} 
            unit="kcal" 
            color="from-orange-500 to-red-500" 
          />
          <StatCard 
            icon={<Dumbbell className="w-6 h-6" />} 
            title="Calories Burned" 
            value={totalCaloriesBurned} 
            unit="kcal" 
            color="from-green-500 to-teal-500" 
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />} 
            title="Net Calories" 
            value={netCalories} 
            unit="kcal" 
            color={netCalories > 0 ? "from-purple-500 to-pink-500" : "from-green-500 to-blue-500"} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meal Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Apple className="w-6 h-6 text-orange-600" />
              Log Meal
            </h3>
            <form onSubmit={handleMealSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={mealForm.date}
                  onChange={(e) => setMealForm({ ...mealForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  value={mealForm.meal} 
                  onChange={(e) => setMealForm({ ...mealForm, meal: e.target.value })}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Items</label>
                <input 
                  type="text" 
                  placeholder="e.g., rice, chicken, salad" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  value={mealForm.items} 
                  onChange={(e) => handleMealItemsChange(e.target.value)} 
                  required 
                />
                {calorieInfo && (
                  <p className="text-sm text-blue-600 mt-2 whitespace-pre-line bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">💡 {calorieInfo}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                <input 
                  type="number" 
                  placeholder="Calories (auto-filled)" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  value={mealForm.calories} 
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} 
                  required 
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Logging...
                  </>
                ) : (
                  'Log Meal'
                )}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <h4 className="font-bold text-gray-700 flex items-center justify-between">
                <span>Today's Meals ({filteredMeals.length})</span>
                <span className="text-sm font-normal text-gray-500">{selectedDate}</span>
              </h4>
              {filteredMeals.length === 0 ? (
                <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No meals logged for this date</p>
              ) : (
                filteredMeals.map((meal) => (
                  <div key={meal._id || meal.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded">{meal.meal}</span>
                          <span className="text-xs text-gray-500">
                            {meal.createdAt ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{meal.items}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600 text-lg whitespace-nowrap">{meal.calories} kcal</span>
                        <button
                          onClick={() => handleDeleteMeal(meal._id || meal.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                          title="Delete meal"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-green-600" />
              Log Activity
            </h3>
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <input 
                  type="text" 
                  placeholder="e.g., Running, Yoga, Swimming" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  value={activityForm.type} 
                  onChange={(e) => handleActivityChange(e.target.value, activityForm.duration)} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input 
                  type="number" 
                  placeholder="Duration in minutes" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  value={activityForm.duration} 
                  onChange={(e) => handleActivityChange(activityForm.type, e.target.value)} 
                  required 
                />
                {activityInfo && (
                  <p className="text-sm text-green-600 mt-2 whitespace-pre-line bg-green-50 p-3 rounded-lg border-l-4 border-green-500">💡 {activityInfo}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burned</label>
                <input 
                  type="number" 
                  placeholder="Calories burned (auto-filled)" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  value={activityForm.calories} 
                  onChange={(e) => setActivityForm({ ...activityForm, calories: e.target.value })} 
                  required 
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Logging...
                  </>
                ) : (
                  'Log Activity'
                )}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <h4 className="font-bold text-gray-700 flex items-center justify-between">
                <span>Today's Activities ({filteredActivities.length})</span>
                <span className="text-sm font-normal text-gray-500">{selectedDate}</span>
              </h4>
              {filteredActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No activities logged for this date</p>
              ) : (
                filteredActivities.map((activity) => (
                  <div key={activity._id || activity.id} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.duration} minutes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600 text-lg whitespace-nowrap">{activity.calories} kcal</span>
                        <button
                          onClick={() => handleDeleteActivity(activity._id || activity.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                          title="Delete activity"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  const MoodPage = () => {
    const [formData, setFormData] = useState({ mood: 'Happy', stress: 5, notes: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        await api.mood.create({
          date: new Date().toISOString(),
          mood: formData.mood,
          stress: parseInt(formData.stress),
          notes: formData.notes
        });
        
        await loadUserData();
        
        const suggestions = getMoodSuggestions(formData.mood, parseInt(formData.stress));
        alert('Mood entry saved! Check your personalized suggestions below.');
      } catch (error) {
        alert('Failed to save mood: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const liveSuggestions = getMoodSuggestions(formData.mood, parseInt(formData.stress));

    const moodColors = {
      'Happy': 'from-yellow-400 to-orange-400',
      'Neutral': 'from-blue-400 to-cyan-400',
      'Stressed': 'from-red-400 to-pink-400',
      'Energetic': 'from-green-400 to-teal-400',
      'Sad': 'from-purple-400 to-indigo-400',
      'Anxious': 'from-orange-400 to-red-400'
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Mood & Stress Tracker</h2>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">How are you feeling today?</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Select your mood</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Happy', 'Neutral', 'Stressed', 'Energetic', 'Sad', 'Anxious'].map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood })}
                    className={`p-4 rounded-lg font-semibold transition ${formData.mood === mood ? `bg-gradient-to-r ${moodColors[mood]} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Stress Level: {formData.stress}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress}
                onChange={(e) => setFormData({ ...formData, stress: e.target.value })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Low (1)</span>
                <span>Moderate (5)</span>
                <span>High (10)</span>
              </div>
            </div>
            <textarea
              placeholder="Any notes about your day? (optional)"
              className="w-full px-4 py-3 border rounded-lg"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Mood Entry'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🧠 Personalized Suggestions for "{formData.mood}" Mood (Stress: {formData.stress}/10)
          </h3>
          <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
            <ul className="space-y-3">
              {liveSuggestions.points.map((point, idx) => (
                <li key={idx} className="text-gray-700 flex items-start gap-3">
                  <span className="text-purple-500 font-bold text-xl mt-1">•</span>
                  <span className="flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mood History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData.mood.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stress" stroke="#8b5cf6" name="Stress Level" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.mood.slice().reverse().map((entry, idx) => (
            <div key={idx} className={`bg-gradient-to-r ${moodColors[entry.mood]} text-white rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-3">
                <Smile className="w-8 h-8" />
                <span className="text-sm opacity-90">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
              <h4 className="text-2xl font-bold mb-2">{entry.mood}</h4>
              <p className="text-sm opacity-90">Stress: {entry.stress}/10</p>
              {entry.notes && <p className="mt-3 text-sm italic">{entry.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MedicineScannerPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [scanImage, setScanImage] = useState(null);
    const [detectedText, setDetectedText] = useState('');
    const [isScanning, setIsScanning] = useState(false);
   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsScanning(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          setScanImage(reader.result);
          
          try {
            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(reader.result);
            await worker.terminate();
            
            const detectedWords = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
            
            let foundMed = null;
            let bestMatchScore = 0;
            
            for (let med of medicineDatabase) {
              const medNameLower = med.name.toLowerCase();
              const medWords = medNameLower.split(/\s+/);
              
              let matchScore = 0;
              for (let word of detectedWords) {
                if (medNameLower.includes(word) || word.includes(medNameLower)) {
                  matchScore += 10;
                }
                for (let medWord of medWords) {
                  if (word === medWord) {
                    matchScore += 20;
                  } else if (word.includes(medWord) || medWord.includes(word)) {
                    matchScore += 5;
                  }
                }
              }
              
              if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                foundMed = med;
              }
            }
            
            setIsScanning(false);
            
            if (foundMed && bestMatchScore > 5) {
              setDetectedText(foundMed.name);
              setSelectedMedicine(foundMed);
              alert(`✅ Medicine Detected: ${foundMed.name}\n\nCategory: ${foundMed.category}\n\nConfidence: ${Math.min(95, bestMatchScore * 2)}%\n\nScroll down to view complete information.`);
            } else {
              setDetectedText('');
              alert(`❌ Could not identify medicine from image.\n\nDetected text: ${text.substring(0, 100)}...\n\nPlease try:\n• Taking a clearer photo\n• Ensuring good lighting\n• Focusing on the medicine name\n• Searching manually below`);
              setSelectedMedicine(null);
            }
          } catch (error) {
            setIsScanning(false);
            alert('❌ Error scanning image. Please try again or search manually below.');
            console.error('OCR Error:', error);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    const filteredMedicines = searchTerm
      ? medicineDatabase.filter(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.uses.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : medicineDatabase;

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Medicine Scanner & Database</h2>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <Camera className="w-12 h-12" />
            <div>
              <h3 className="text-2xl font-bold">Scan Medicine Package</h3>
              <p className="opacity-90">Upload a photo to identify the medicine automatically</p>
            </div>
          </div>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="bg-white bg-opacity-20 border-2 border-white border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-opacity-30 transition">
              {isScanning ? (
                <div>
                  <div className="animate-pulse">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">🔍 Scanning medicine package...</p>
                    <p className="text-sm opacity-80 mt-2">Please wait</p>
                  </div>
                </div>
              ) : scanImage ? (
                <div>
                  <img src={scanImage} alt="Scanned medicine" className="max-h-64 mx-auto rounded-lg mb-4" />
                  <p className="text-lg font-semibold">✅ Scan Complete</p>
                  <p className="text-sm opacity-80 mt-2">Click to scan another image</p>
                </div>
              ) : (
                <div>
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-70" />
                  <p className="text-lg font-semibold">Click to upload or drag image here</p>
                  <p className="text-sm opacity-80 mt-2">Supports JPG, PNG - Clear images work best</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {selectedMedicine && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Pill className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedMedicine.name}</h3>
                  <div className="flex gap-2">
                    {detectedText && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ Scanned
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {selectedMedicine.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">💊 What is this medicine used for?</p>
                    <p className="text-gray-700">{selectedMedicine.uses}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-2">📋 Recommended Dosage</p>
                    <p className="text-gray-700">{selectedMedicine.dosage}</p>
                  </div>
                  
                  {/* <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-900 mb-2">⏰ When to take this medicine?</p>
                    <p className="text-gray-700">{selectedMedicine.when}</p>
                  </div> */}
                  
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="font-semibold text-yellow-900 mb-2">⚠️ Important Precautions</p>
                    <p className="text-yellow-800">{selectedMedicine.precautions}</p>
                  </div>

                  <div className="p-4 bg-red-50 border-l-4 border-red-400">
                    <p className="font-semibold text-red-900 mb-2">🚨 Safety Warning</p>
                    <p className="text-red-800">Always consult with a qualified healthcare professional before starting, stopping, or changing any medication. This information is for educational purposes only and does not replace medical advice.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Search Medicine Database</h3>
          <input
            type="text"
            placeholder="Search by medicine name, category, or use..."
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="text-sm text-gray-600 mb-4">💡 Try searching: Pain Relief, Diabetes, Aspirin, Blood Pressure</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((med, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedMedicine(med);
                  setDetectedText('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 border-2 rounded-lg hover:border-blue-500 hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-white to-blue-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg text-gray-800">{med.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {med.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{med.uses}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
const CommunityPage = () => {
  const API_URL = 'https://majorproject-1-hswv.onrender.com/api';

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingInterval = useRef(null);

  const groups = [
    { id: '1', name: 'Diabetes Support', members: 2847, description: 'Managing diabetes together', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Fitness Enthusiasts', members: 5632, description: 'Workout tips and motivation', color: 'from-green-500 to-teal-500' },
    { id: '3', name: 'Heart Health', members: 1923, description: 'Cardiac wellness community', color: 'from-red-500 to-pink-500' },
    { id: '4', name: 'Mental Wellness', members: 4156, description: 'Mental health support', color: 'from-purple-500 to-indigo-500' },
    { id: '5', name: 'Nutrition & Diet', members: 3891, description: 'Healthy eating discussions', color: 'from-orange-500 to-yellow-500' },
    { id: '6', name: 'Weight Loss Journey', members: 6234, description: 'Support for weight management', color: 'from-pink-500 to-rose-500' }
  ];

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '😍', '🤗', '👏', '💪', '🙏', '😢', '😮', '🔥', '✨', '🌟', '💯', '🎯', '💚', '🌈', '☀️'];

  const avatarColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600',
    'from-yellow-500 to-yellow-600',
    'from-green-500 to-green-600',
    'from-teal-500 to-teal-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600'
  ];

  const getAvatarColor = (userId) => {
    const idStr = String(userId || '');
    const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  };

  // Close polling when group changes or on unmount
  useEffect(() => {
    if (selectedGroup && token) {
      fetchMessages(selectedGroup.id);

      // Start polling for new messages every 3 seconds
      pollingInterval.current = setInterval(() => {
        fetchMessages(selectedGroup.id, true);
      }, 3000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [selectedGroup, token]);

  const fetchMessages = async (groupId, isPolling = false) => {
    try {
      const response = await fetch(`${API_URL}/community/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed fetching messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedGroup || !token) return;

    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_URL}/community/${selectedGroup.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchMessages(selectedGroup.id);
        setNewMessage('');
        removeImage();
        setShowEmojiPicker(false);
      } else {
        console.error('Send message failed:', response.status);
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!selectedGroup || !token) return;
    try {
      const response = await fetch(`${API_URL}/community/${selectedGroup.id}/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setTimeout(() => fetchMessages(selectedGroup.id), 300);
      } else {
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      setTimeout(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Community Groups</h2>

        {/* Group Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedGroup(group)}
            >
              <div className={`bg-gradient-to-r ${group.color} p-6 text-white`}>
                <Users className="w-10 h-10 mb-3" />
                <h3 className="text-xl font-bold">{group.name}</h3>
                <p className="text-sm opacity-90 mt-2">{group.description}</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 text-sm">{group.members.toLocaleString()} members</span>
                </div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    selectedGroup?.id === group.id
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
                >
                  {selectedGroup?.id === group.id ? 'Currently Viewing' : 'Open Chat'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Section - Full Screen Modal */}
        {selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col">

              {/* Chat Header */}
              <div className={`bg-gradient-to-r ${selectedGroup.color} p-5 text-white flex justify-between items-center shadow-lg`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedGroup.name}</h3>
                    <p className="text-sm opacity-90">{selectedGroup.members.toLocaleString()} members online</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Messages Area */}
              <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => {
                   // const isCurrentUser = String(msg.userId) === String(currentUser?._id);
                  // const isCurrentUser =String(msg.userId?._id || msg.userId) === String(currentUser?._id);
  const isCurrentUser =String(msg.userId?._id || msg.userId) === String(currentUser?._id || currentUser?.id);

                  const avatarColor = getAvatarColor(msg.userId);
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {/* Avatar for other users */}
                        {!isCurrentUser && (
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white`}>
                            {msg.userName?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Message content */}
                        <div className={`relative flex flex-col max-w-[65%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {!isCurrentUser && (
                            <span className="text-xs font-semibold text-gray-700 mb-1.5 px-2">{msg.userName}</span>
                          )}

                          <div
                            className={`group relative rounded-2xl px-4 py-3 shadow-lg cursor-default transition-all break-words whitespace-pre-wrap hover:shadow-xl ${
                              isCurrentUser
                                ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white rounded-br-md' 
                                : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                            }`}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {/* Delete icon overlay for current user's messages - visible on hover */}
                            {isCurrentUser && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                title="Delete message"
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transform hover:scale-110"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                              </button>
                            )}

                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Shared"
                                className="rounded-xl mb-2 max-w-full h-auto max-h-64 object-cover shadow-md"
                              />
                            )}

                            {msg.message && (
                              <p className="text-[15px] leading-relaxed">{msg.message}</p>
                            )}

                            <span className={`text-[11px] mt-1.5 block ${isCurrentUser ? 'text-green-100' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Avatar for current user */}
                        {isCurrentUser && (
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser?._id)} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white`}>
                            {currentUser?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {/* Image Preview */}
              {imagePreview && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-24 rounded-xl shadow-lg border-2 border-white" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="p-4 bg-white border-t border-gray-200 shadow-inner">
                  <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                    {emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition transform hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-5 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                    title="Attach image"
                  >
                    <Image className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                    title="Add emoji"
                  >
                    <Smile className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        /* Smooth hover effects */
        .group:hover button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
const EmergencyPage = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [latestVitals, setLatestVitals] = useState({ systolic: 0, diastolic: 0, sugar: 0, weight: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });
  const [loading, setLoading] = useState(false);
  const [sosStatus, setSosStatus] = useState({ active: false, step: '', contactsNotified: 0 });
  const [currentLocation, setCurrentLocation] = useState(null);

  // Load emergency contacts and latest vitals on mount
  useEffect(() => {
    loadEmergencyData();
  }, []);

  // Fetch emergency contacts and latest vitals
  const loadEmergencyData = async () => {
    try {
      setLoading(true);

      // Load emergency contacts
      const contacts = await api.emergencyContacts.getAll();
      setEmergencyContacts(contacts || []);

      // Load latest vitals (most recent entry)
      const vitals = await api.vitals.getAll();
      if (vitals && vitals.length > 0) {
        const latest = vitals[vitals.length - 1];
        setLatestVitals({
          systolic: latest.systolic || 0,
          diastolic: latest.diastolic || 0,
          sugar: latest.sugar || 0,
          weight: latest.weight || 0
        });
      }
    } catch (error) {
      console.error('Error loading emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.relation) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.emergencyContacts.create(contactForm);
      await loadEmergencyData();
      setContactForm({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
      alert('✅ Emergency contact added successfully!');
    } catch (error) {
      alert('❌ Failed to add emergency contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete contact
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    setLoading(true);
    try {
      await api.emergencyContacts.delete(contactId);
      await loadEmergencyData();
      alert('✅ Emergency contact deleted successfully!');
    } catch (error) {
      alert('❌ Failed to delete emergency contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      setSosStatus(prev => ({ ...prev, step: '📍 Getting your location...' }));
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              mapUrl: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
            };
            setCurrentLocation(location);
            resolve(location);
          },
          (error) => {
            console.error('Location error:', error);
            // Fallback to default location
            const fallback = {
              latitude: null,
              longitude: null,
              accuracy: null,
              mapUrl: 'https://maps.google.com/?q=Hyderabad,Telangana,IN'
            };
            setCurrentLocation(fallback);
            resolve(fallback);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const fallback = {
          latitude: null,
          longitude: null,
          accuracy: null,
          mapUrl: 'https://maps.google.com/?q=Hyderabad,Telangana,IN'
        };
        setCurrentLocation(fallback);
        resolve(fallback);
      }
    });
  };

  // Format BP display
  const formatBP = () => {
    if (latestVitals.systolic > 0 && latestVitals.diastolic > 0) {
      return `${Math.round(latestVitals.systolic)}/${Math.round(latestVitals.diastolic)} mmHg`;
    }
    return 'Not recorded';
  };

  // Create emergency SMS message
  const createEmergencyMessage = (contactName, location) => {
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const bpStatus = latestVitals.systolic > 0 && latestVitals.diastolic > 0 
      ? `${Math.round(latestVitals.systolic)}/${Math.round(latestVitals.diastolic)} mmHg` 
      : 'Not available';
    
    const sugarStatus = latestVitals.sugar > 0 ? `${Math.round(latestVitals.sugar)} mg/dL` : 'Not available';
    const weightStatus = latestVitals.weight > 0 ? `${latestVitals.weight.toFixed(1)} kg` : 'Not available';

    return `🚨 MEDICAL EMERGENCY ALERT

${contactName}, URGENT medical emergency!

⏰ ${timestamp}
📍 ${location.mapUrl}

🩺 VITAL SIGNS:
BP: ${bpStatus}
Sugar: ${sugarStatus}
Weight: ${weightStatus}

⚠️ IMMEDIATE RESPONSE NEEDED
Please call back or reach location ASAP

🆘 Emergency Services:
Ambulance: 108 | Police: 100

[Auto-sent via Health Tracker]`;
  };

  // Send SMS to a contact (opens SMS app with pre-filled message)
  const sendSMSToContact = (contact, location) => {
    try {
      const message = createEmergencyMessage(contact.name, location);
      const phoneNumber = contact.phone.replace(/[^\d+]/g, '');
      
      // Open SMS app with pre-filled message
      const smsUrl = `sms:${phoneNumber}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_self');
      
      return true;
    } catch (error) {
      console.error('SMS Error:', error);
      return false;
    }
  };

  // Make emergency call
  const makeEmergencyCall = (phoneNumber, contactName = '') => {
    try {
      const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${formattedNumber}`;
      return true;
    } catch (error) {
      console.error('Call Error:', error);
      return false;
    }
  };

  // Main SOS Handler with Sequential Flow
  const handleSOS = async () => {
    try {
      setSosStatus({ active: true, step: '🚨 Initiating Emergency Protocol...', contactsNotified: 0 });
      setLoading(true);

      // Step 1: Refresh latest vitals
      setSosStatus(prev => ({ ...prev, step: '📊 Fetching latest vitals...' }));
      const vitals = await api.vitals.getAll();
      if (vitals && vitals.length > 0) {
        const latest = vitals[vitals.length - 1];
        setLatestVitals({
          systolic: latest.systolic || 0,
          diastolic: latest.diastolic || 0,
          sugar: latest.sugar || 0,
          weight: latest.weight || 0
        });
      }

      // Step 2: Get current location
      const location = await getCurrentLocation();

      // Step 3: Check if contacts exist
      if (emergencyContacts.length === 0) {
        alert('⚠️ NO EMERGENCY CONTACTS FOUND!\n\nPlease add emergency contacts before using SOS.\n\nFor immediate help, call:\n📞 Ambulance: 108\n📞 Police: 100');
        setSosStatus({ active: false, step: '', contactsNotified: 0 });
        setShowConfirm(false);
        setLoading(false);
        return;
      }

      // Step 4: Prepare contact list
      const contactList = emergencyContacts.map(c => 
        `✓ ${c.name} (${c.relation}): ${c.phone}`
      ).join('\n');

      // Step 5: Send SMS to all contacts sequentially
      setSosStatus(prev => ({ ...prev, step: '📱 Opening SMS for contacts...' }));
      
      // Browser limitation: Can only open ONE SMS at a time
      // We'll send to primary contact first
      const primaryContact = emergencyContacts[0];
      
      const confirmMessage = `🚨 EMERGENCY SOS ACTIVATED!

You are about to notify your emergency contacts:

${contactList}

📍 Location: ${location.latitude ? 'GPS Coordinates Available' : 'Using Default Location'}

🩺 CURRENT VITALS:
• BP: ${formatBP()}
• Sugar: ${latestVitals.sugar > 0 ? Math.round(latestVitals.sugar) + ' mg/dL' : 'Not recorded'}
• Weight: ${latestVitals.weight > 0 ? latestVitals.weight.toFixed(1) + ' kg' : 'Not recorded'}

⚠️ WHAT WILL HAPPEN:
1. SMS app will open with emergency message
2. You'll be prompted to send SMS to ${primaryContact.name}
3. After sending, you can call them directly
4. Repeat for other contacts if needed

Ready to proceed?`;

      if (!window.confirm(confirmMessage)) {
        setSosStatus({ active: false, step: '', contactsNotified: 0 });
        setShowConfirm(false);
        setLoading(false);
        return;
      }

      // Send SMS to primary contact
      sendSMSToContact(primaryContact, location);
      setSosStatus(prev => ({ ...prev, contactsNotified: 1 }));

      // After SMS is sent (user will come back to app), offer to call
      setTimeout(() => {
        const callConfirm = window.confirm(
          `SMS sent to ${primaryContact.name}!\n\nWould you like to CALL ${primaryContact.name} now?\n\n${primaryContact.phone}`
        );

        if (callConfirm) {
          makeEmergencyCall(primaryContact.phone, primaryContact.name);
        } else {
          // Offer emergency services
          const emergencyCall = window.confirm(
            'Would you like to call Emergency Ambulance (108)?'
          );
          if (emergencyCall) {
            makeEmergencyCall('108', 'Emergency Ambulance');
          }
        }

        // Offer to notify additional contacts
        if (emergencyContacts.length > 1) {
          setTimeout(() => {
            const notifyMore = window.confirm(
              `You have ${emergencyContacts.length - 1} more emergency contact(s).\n\nWould you like to send SMS to:\n${emergencyContacts[1].name} (${emergencyContacts[1].relation})?`
            );
            
            if (notifyMore) {
              sendSMSToContact(emergencyContacts[1], location);
            }
          }, 2000);
        }

        setSosStatus({ active: false, step: '✅ SOS Completed', contactsNotified: emergencyContacts.length });
        setShowConfirm(false);
        setLoading(false);
      }, 3000); // Give time for SMS app to open

    } catch (error) {
      console.error('SOS Error:', error);
      alert('⚠️ Error sending SOS alert.\n\nPlease call emergency services directly:\n\n📞 Ambulance: 108\n📞 Police: 100\n📞 Fire: 101');
      setSosStatus({ active: false, step: '', contactsNotified: 0 });
      setLoading(false);
    }
  };

  // Quick call to specific contact
  const quickCall = (contact) => {
    const confirm = window.confirm(
      `Call ${contact.name} (${contact.relation})?\n\n${contact.phone}`
    );
    if (confirm) {
      makeEmergencyCall(contact.phone, contact.name);
    }
  };

  // Quick SMS to specific contact
  const quickSMS = async (contact) => {
    const location = currentLocation || await getCurrentLocation();
    sendSMSToContact(contact, location);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">🚨 Emergency SOS</h2>
        <button
          onClick={() => setShowAddContact(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition"
          disabled={loading}
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* SOS Status Indicator */}
      {sosStatus.active && (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            <p className="font-bold text-red-700">{sosStatus.step}</p>
          </div>
        </div>
      )}

      {/* Main SOS Button */}
      <div className="bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white rounded-2xl shadow-2xl p-8 text-center">
        <AlertCircle className="w-24 h-24 mx-auto mb-4 animate-pulse" />
        <h3 className="text-4xl font-bold mb-3">Emergency Assistance</h3>
        <p className="text-lg mb-2 opacity-90">
          Instantly alert your emergency contacts
        </p>
        <p className="text-sm mb-6 opacity-75">
          Location, vitals, and contact info will be shared
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-white text-red-600 px-16 py-5 rounded-full text-2xl font-extrabold hover:bg-gray-100 transition shadow-2xl transform hover:scale-105"
          disabled={loading}
        >
          🆘 ACTIVATE SOS
        </button>
      </div>

      {/* SOS Confirmation Dialog */}
      {showConfirm && (
        <div className="bg-white rounded-xl shadow-2xl p-6 border-4 border-red-500 animate-slideIn">
          <h4 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            ⚠️ Confirm Emergency Alert
          </h4>
          <p className="text-gray-700 mb-4 font-semibold">
            This will immediately trigger emergency protocol:
          </p>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">1.</span>
                <span>📍 Capture your current GPS location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">2.</span>
                <span>🩺 Share your latest vitals (BP: {formatBP()}, Sugar: {latestVitals.sugar > 0 ? Math.round(latestVitals.sugar) : 'N/A'} mg/dL, Weight: {latestVitals.weight > 0 ? latestVitals.weight.toFixed(1) : 'N/A'} kg)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">3.</span>
                <span>📱 Open SMS app with emergency message for {emergencyContacts.length} contact(s)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">4.</span>
                <span>📞 Option to call contacts directly</span>
              </li>
            </ul>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Browser security requires you to manually press "Send" in the SMS app and confirm calls.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSOS}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-4 rounded-lg text-lg font-bold hover:bg-red-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? '⏳ Processing...' : '✓ YES, SEND SOS NOW'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-4 rounded-lg text-lg font-semibold hover:bg-gray-400 transition"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Contact Form */}
      {showAddContact && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add Emergency Contact</h3>
          <form onSubmit={handleAddContact} className="space-y-4">
            <input
              type="text"
              placeholder="Contact Name (e.g., John Doe)"
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (e.g., +91 98765 43210)"
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Relation (e.g., Family, Doctor, Friend)"
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
              value={contactForm.relation}
              onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? '⏳ Adding...' : '✓ Add Contact'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddContact(false);
                  setContactForm({ name: '', phone: '', relation: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Emergency Contacts List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📞 Emergency Contacts ({emergencyContacts.length})
        </h3>
        {emergencyContacts.length > 0 ? (
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={contact._id} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">{contact.name}</p>
                      <p className="text-gray-600">{contact.phone}</p>
                      <p className="text-xs text-blue-600 font-semibold">{contact.relation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => quickCall(contact)}
                      className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      title="Quick Call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => quickSMS(contact)}
                      className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      title="Send SMS"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      disabled={loading}
                      className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No emergency contacts added yet.</p>
            <button
              onClick={() => setShowAddContact(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Add Your First Contact
            </button>
          </div>
        )}
      </div>

      {/* Current Vitals Display */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🩺 Latest Vitals (Will be shared in SOS)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg text-center border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Blood Pressure</p>
            <p className="text-3xl font-bold text-purple-600">{formatBP()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {latestVitals.systolic > 140 || latestVitals.diastolic > 90 ? '⚠️ High' : 
               latestVitals.systolic > 0 ? '✓ Normal range' : 'Not recorded'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border-2 border-pink-200">
            <p className="text-sm text-gray-600 mb-1">Blood Sugar</p>
            <p className="text-3xl font-bold text-pink-600">
              {latestVitals.sugar > 0 ? Math.round(latestVitals.sugar) : '-'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {latestVitals.sugar > 0 ? 'mg/dL' : 'Not recorded'}
              {latestVitals.sugar > 200 ? ' ⚠️ High' : latestVitals.sugar > 0 ? ' ✓' : ''}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Weight</p>
            <p className="text-3xl font-bold text-blue-600">
              {latestVitals.weight > 0 ? latestVitals.weight.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {latestVitals.weight > 0 ? 'kg' : 'Not recorded'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center bg-white rounded-lg p-3">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
          </p>
          <button
            onClick={loadEmergencyData}
            className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Emergency Services */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">🚑 Direct Emergency Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => makeEmergencyCall('108', 'Ambulance')}
            className="bg-white text-red-600 py-4 px-6 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            📞 Ambulance (108)
          </button>
          <button
            onClick={() => makeEmergencyCall('100', 'Police')}
            className="bg-white text-blue-600 py-4 px-6 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            📞 Police (100)
          </button>
          <button
            onClick={() => makeEmergencyCall('101', 'Fire')}
            className="bg-white text-orange-600 py-4 px-6 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            📞 Fire (101)
          </button>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-yellow-800 mb-2">⚠️ How This SOS Works (Browser Limitations)</p>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>✓ Automatically captures GPS location and vitals</li>
              <li>✓ Opens SMS app with pre-filled emergency message</li>
              <li>✓ You must manually press "Send" in SMS app (browser security)</li>
              <li>✓ Opens phone dialer for calls (you must press "Call")</li>
              <li>✗ Cannot send SMS/calls automatically in background</li>
              <li>✗ Won't work if phone is locked or browser closed</li>
            </ul>
            <p className="mt-3 font-semibold text-yellow-800">
              🚨 For life-threatening emergencies, always call 108 (Ambulance) directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
const ReportPage = ({ healthData, currentUser }) => {
  // Analyze health conditions based on 7 days of data
  const analyzeHealthConditions = (data) => {
    // Add safety check
    if (!data || !data.vitals) {
      return [{
        condition: 'No Data Available',
        severity: 'INFO',
        findings: 'No health data has been recorded yet',
        clinicalSignificance: 'Please record your daily vital signs to generate a health analysis report.',
        metrics: { status: 'NO DATA' }
      }];
    }
    
    const conditions = [];
    const vitals = data.vitals || [];
    
    if (vitals.length < 7) {
      return [{
        condition: 'Insufficient Data',
        severity: 'INFO',
        findings: `Only ${vitals.length} day(s) of health data recorded`,
        clinicalSignificance: 'At least 7 consecutive days of health monitoring is required for accurate medical analysis.',
        metrics: { status: 'INCOMPLETE' }
      }];
    }

    // Get last 7 days
    const last7Days = vitals.slice(-7);
    
    // Calculate averages
    const avgSystolic = last7Days.reduce((sum, v) => sum + v.systolic, 0) / last7Days.length;
    const avgDiastolic = last7Days.reduce((sum, v) => sum + v.diastolic, 0) / last7Days.length;
    const avgSugar = last7Days.reduce((sum, v) => sum + v.sugar, 0) / last7Days.length;
    const avgSleep = last7Days.reduce((sum, v) => sum + v.sleep, 0) / last7Days.length;
    const avgWater = last7Days.reduce((sum, v) => sum + v.water, 0) / last7Days.length;
    const avgWeight = last7Days.reduce((sum, v) => sum + v.weight, 0) / last7Days.length;
    
    // Blood Pressure Analysis
    if (avgSystolic >= 140 || avgDiastolic >= 90) {
      const severity = (avgSystolic >= 160 || avgDiastolic >= 100) ? 'CRITICAL' : 'HIGH RISK';
      conditions.push({
        condition: 'Stage 2 Hypertension',
        severity: severity,
        findings: `Average Blood Pressure: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg over 7 days`,
        clinicalSignificance: 'Consistently elevated blood pressure significantly increases cardiovascular risk including stroke, heart attack, heart failure, and kidney disease. This condition requires immediate medical evaluation.',
        metrics: {
          current: `${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg`,
          normal: '<120/80 mmHg',
          status: 'ABNORMAL - ELEVATED',
          trend: avgSystolic > 150 ? '↑ INCREASING' : '→ STABLE HIGH'
        }
      });
    } else if (avgSystolic >= 130 || avgDiastolic >= 85) {
      conditions.push({
        condition: 'Stage 1 Hypertension',
        severity: 'MODERATE RISK',
        findings: `Average Blood Pressure: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg over 7 days`,
        clinicalSignificance: 'Elevated blood pressure detected. Early intervention can prevent progression to severe hypertension and reduce cardiovascular complications.',
        metrics: {
          current: `${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg`,
          normal: '<120/80 mmHg',
          status: 'BORDERLINE HIGH',
          trend: '⚠ MONITORING REQUIRED'
        }
      });
    } else if (avgSystolic >= 120 && avgSystolic < 130) {
      conditions.push({
        condition: 'Elevated Blood Pressure',
        severity: 'LOW RISK',
        findings: `Average Blood Pressure: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg over 7 days`,
        clinicalSignificance: 'Blood pressure is slightly elevated. Lifestyle modifications recommended to prevent progression.',
        metrics: {
          current: `${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg`,
          normal: '<120/80 mmHg',
          status: 'SLIGHTLY ELEVATED',
          trend: '→ WATCH CLOSELY'
        }
      });
    }
    
    // Blood Sugar Analysis
    if (avgSugar >= 126) {
      const severity = avgSugar >= 200 ? 'CRITICAL' : 'HIGH RISK';
      conditions.push({
        condition: 'Diabetes Mellitus / Hyperglycemia',
        severity: severity,
        findings: `Average Fasting Blood Glucose: ${avgSugar.toFixed(0)} mg/dL over 7 days`,
        clinicalSignificance: 'Persistently elevated blood glucose indicates diabetes or severe pre-diabetes. Uncontrolled diabetes can lead to serious complications including neuropathy, retinopathy, nephropathy, cardiovascular disease, and poor wound healing.',
        metrics: {
          current: `${avgSugar.toFixed(0)} mg/dL`,
          normal: '70-100 mg/dL (fasting)',
          status: 'DIABETIC RANGE',
          trend: avgSugar > 180 ? '↑ VERY HIGH' : '→ CONSISTENTLY HIGH'
        }
      });
    } else if (avgSugar >= 100 && avgSugar < 126) {
      conditions.push({
        condition: 'Prediabetes / Impaired Fasting Glucose',
        severity: 'MODERATE RISK',
        findings: `Average Fasting Blood Glucose: ${avgSugar.toFixed(0)} mg/dL over 7 days`,
        clinicalSignificance: 'Blood sugar levels are above normal but below diabetic threshold. Prediabetes significantly increases risk of developing Type 2 diabetes and cardiovascular disease.',
        metrics: {
          current: `${avgSugar.toFixed(0)} mg/dL`,
          normal: '70-100 mg/dL (fasting)',
          status: 'PREDIABETIC RANGE',
          trend: '⚠ RISK OF PROGRESSION'
        }
      });
    } else if (avgSugar < 70) {
      conditions.push({
        condition: 'Hypoglycemia / Low Blood Sugar',
        severity: 'MODERATE RISK',
        findings: `Average Blood Glucose: ${avgSugar.toFixed(0)} mg/dL over 7 days`,
        clinicalSignificance: 'Consistently low blood sugar can cause dizziness, confusion, seizures, and loss of consciousness. May indicate medication dosing issues or inadequate nutrition.',
        metrics: {
          current: `${avgSugar.toFixed(0)} mg/dL`,
          normal: '70-100 mg/dL (fasting)',
          status: 'BELOW NORMAL',
          trend: '↓ LOW'
        }
      });
    }
    
    // Sleep Analysis
    if (avgSleep < 6) {
      conditions.push({
        condition: 'Chronic Sleep Deprivation',
        severity: 'MODERATE RISK',
        findings: `Average Sleep Duration: ${avgSleep.toFixed(1)} hours/night over 7 days`,
        clinicalSignificance: 'Chronic insufficient sleep is associated with increased risk of obesity, diabetes, hypertension, heart disease, stroke, depression, and weakened immune function. Also impairs cognitive performance and increases accident risk.',
        metrics: {
          current: `${avgSleep.toFixed(1)} hours/night`,
          normal: '7-9 hours/night',
          status: 'INSUFFICIENT',
          trend: '↓ BELOW RECOMMENDED'
        }
      });
    } else if (avgSleep > 9) {
      conditions.push({
        condition: 'Excessive Sleep / Hypersomnia',
        severity: 'LOW RISK',
        findings: `Average Sleep Duration: ${avgSleep.toFixed(1)} hours/night over 7 days`,
        clinicalSignificance: 'Consistently sleeping more than 9 hours may indicate underlying conditions such as sleep apnea, depression, thyroid dysfunction, or chronic fatigue syndrome.',
        metrics: {
          current: `${avgSleep.toFixed(1)} hours/night`,
          normal: '7-9 hours/night',
          status: 'EXCESSIVE',
          trend: '↑ ABOVE RECOMMENDED'
        }
      });
    }
    
    // Dehydration Analysis
    if (avgWater < 6) {
      conditions.push({
        condition: 'Chronic Dehydration',
        severity: 'LOW RISK',
        findings: `Average Water Intake: ${avgWater.toFixed(1)} glasses/day over 7 days`,
        clinicalSignificance: 'Inadequate hydration can impair kidney function, worsen blood pressure control, reduce cognitive performance, and contribute to constipation and urinary tract infections.',
        metrics: {
          current: `${avgWater.toFixed(1)} glasses/day`,
          normal: '8-10 glasses/day',
          status: 'INSUFFICIENT',
          trend: '↓ BELOW OPTIMAL'
        }
      });
    }
    
    // Weight Analysis (if we have historical data)
    if (vitals.length >= 14) {
      const twoWeeksAgo = vitals[vitals.length - 14].weight;
      const weightChange = avgWeight - twoWeeksAgo;
      
      if (Math.abs(weightChange) >= 2) {
        conditions.push({
          condition: weightChange > 0 ? 'Rapid Weight Gain' : 'Rapid Weight Loss',
          severity: Math.abs(weightChange) >= 3 ? 'MODERATE RISK' : 'LOW RISK',
          findings: `Weight change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg in 14 days`,
          clinicalSignificance: `${Math.abs(weightChange) >= 3 ? 'Significant' : 'Noticeable'} weight changes in short periods may indicate fluid retention, metabolic issues, thyroid dysfunction, or other medical conditions requiring evaluation.`,
          metrics: {
            current: `${avgWeight.toFixed(1)} kg`,
            change: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`,
            status: Math.abs(weightChange) >= 3 ? 'SIGNIFICANT CHANGE' : 'MODERATE CHANGE',
            trend: weightChange > 0 ? '↑ INCREASING' : '↓ DECREASING'
          }
        });
      }
    }
    
    // If no conditions detected
    if (conditions.length === 0) {
      return [{
        condition: 'Normal Health Parameters',
        severity: 'HEALTHY',
        findings: 'All vital signs within normal ranges',
        clinicalSignificance: 'Based on 7-day monitoring, all measured health parameters are within clinically acceptable ranges.',
        metrics: {
          bloodPressure: `${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg - NORMAL`,
          bloodSugar: `${avgSugar.toFixed(0)} mg/dL - NORMAL`,
          sleep: `${avgSleep.toFixed(1)} hours - ADEQUATE`,
          hydration: `${avgWater.toFixed(1)} glasses - ${avgWater >= 6 ? 'ADEQUATE' : 'LOW'}`,
          status: 'HEALTHY'
        }
      }];
    }
    
    return conditions;
  };

  // Generate report for download
  const generateReport = () => {
    const conditions = analyzeHealthConditions(healthData);
    const last7Days = (healthData.vitals || []).slice(-7);
    
    const report = `
═══════════════════════════════════════════════════════════════════
                    MEDICAL HEALTH ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

PATIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient Name:        ${currentUser?.name || 'N/A'}
Patient Email:       ${currentUser?.email || 'N/A'}
Report ID:           RPT-${currentUser?.id}-${Date.now()}
Date Generated:      ${new Date().toLocaleString('en-US', { 
  dateStyle: 'full', 
  timeStyle: 'long' 
})}
Analysis Period:     7-Day Health Monitoring

═══════════════════════════════════════════════════════════════════
                    CLINICAL FINDINGS SUMMARY
═══════════════════════════════════════════════════════════════════

Total Conditions Identified: ${conditions.length}
${conditions.filter(c => c.severity === 'CRITICAL').length > 0 ? `⚠️  CRITICAL Issues: ${conditions.filter(c => c.severity === 'CRITICAL').length}` : ''}
${conditions.filter(c => c.severity === 'HIGH RISK').length > 0 ? `⚠️  HIGH RISK Issues: ${conditions.filter(c => c.severity === 'HIGH RISK').length}` : ''}
${conditions.filter(c => c.severity === 'MODERATE RISK').length > 0 ? `⚠️  MODERATE RISK Issues: ${conditions.filter(c => c.severity === 'MODERATE RISK').length}` : ''}
${conditions.filter(c => c.severity === 'LOW RISK').length > 0 ? `⚠️  LOW RISK Issues: ${conditions.filter(c => c.severity === 'LOW RISK').length}` : ''}
${conditions.filter(c => c.severity === 'HEALTHY').length > 0 ? `✓ HEALTHY Status` : ''}

═══════════════════════════════════════════════════════════════════
                    DETAILED MEDICAL ANALYSIS
═══════════════════════════════════════════════════════════════════

${conditions.map((condition, idx) => `
───────────────────────────────────────────────────────────────────
FINDING #${idx + 1}: ${condition.condition}
───────────────────────────────────────────────────────────────────
SEVERITY LEVEL:          ${condition.severity}
CLINICAL OBSERVATION:    ${condition.findings}

MEDICAL SIGNIFICANCE:
${condition.clinicalSignificance}

MEASURED PARAMETERS:
${Object.entries(condition.metrics || {}).map(([key, value]) => 
  `  • ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`
).join('\n')}

`).join('\n')}

═══════════════════════════════════════════════════════════════════
                    7-DAY VITAL SIGNS RECORD
═══════════════════════════════════════════════════════════════════

${last7Days.map((vital, idx) => `
Day ${idx + 1} - ${new Date(vital.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
  Blood Pressure:    ${Math.round(vital.systolic)}/${Math.round(vital.diastolic)} mmHg
  Blood Sugar:       ${Math.round(vital.sugar)} mg/dL
  Body Weight:       ${vital.weight.toFixed(1)} kg
  Sleep Duration:    ${vital.sleep.toFixed(1)} hours
  Water Intake:      ${Math.round(vital.water)} glasses
`).join('\n')}

═══════════════════════════════════════════════════════════════════
                    STATISTICAL ANALYSIS
═══════════════════════════════════════════════════════════════════

7-DAY AVERAGES:
  Average Systolic BP:     ${(last7Days.reduce((s, v) => s + v.systolic, 0) / last7Days.length).toFixed(1)} mmHg
  Average Diastolic BP:    ${(last7Days.reduce((s, v) => s + v.diastolic, 0) / last7Days.length).toFixed(1)} mmHg
  Average Blood Sugar:     ${(last7Days.reduce((s, v) => s + v.sugar, 0) / last7Days.length).toFixed(1)} mg/dL
  Average Weight:          ${(last7Days.reduce((s, v) => s + v.weight, 0) / last7Days.length).toFixed(1)} kg
  Average Sleep:           ${(last7Days.reduce((s, v) => s + v.sleep, 0) / last7Days.length).toFixed(1)} hours
  Average Water Intake:    ${(last7Days.reduce((s, v) => s + v.water, 0) / last7Days.length).toFixed(1)} glasses

RANGES OBSERVED:
  Systolic BP Range:       ${Math.min(...last7Days.map(v => v.systolic))} - ${Math.max(...last7Days.map(v => v.systolic))} mmHg
  Diastolic BP Range:      ${Math.min(...last7Days.map(v => v.diastolic))} - ${Math.max(...last7Days.map(v => v.diastolic))} mmHg
  Blood Sugar Range:       ${Math.min(...last7Days.map(v => v.sugar))} - ${Math.max(...last7Days.map(v => v.sugar))} mg/dL
  Weight Fluctuation:      ${(Math.max(...last7Days.map(v => v.weight)) - Math.min(...last7Days.map(v => v.weight))).toFixed(1)} kg

═══════════════════════════════════════════════════════════════════
                    CURRENT MEDICATIONS
═══════════════════════════════════════════════════════════════════

${(healthData.medications || []).filter(m => m.active).length > 0 ? 
(healthData.medications || []).filter(m => m.active).map(med => 
  `• ${med.name}\n  Schedule: ${med.time}\n  Frequency: ${med.frequency}`
).join('\n\n') : 
'No active medications currently recorded.'}

═══════════════════════════════════════════════════════════════════
                    DIET & ACTIVITY SUMMARY
═══════════════════════════════════════════════════════════════════

NUTRITION:
  Total Meals Logged:      ${(healthData.meals || []).length}
  
Recent Meal History:
${(healthData.meals || []).slice(-7).map(meal => 
  `  • ${meal.meal}: ${meal.items} (${meal.calories} kcal)`
).join('\n') || '  No meal data recorded'}

PHYSICAL ACTIVITY:
  Total Activities Logged: ${(healthData.activities || []).length}
  
Recent Activity History:
${(healthData.activities || []).slice(-7).map(activity => 
  `  • ${activity.type}: ${activity.duration} minutes (${activity.calories} kcal burned)`
).join('\n') || '  No activity data recorded'}

═══════════════════════════════════════════════════════════════════
                    MENTAL HEALTH ASSESSMENT
═══════════════════════════════════════════════════════════════════

${(healthData.mood || []).length > 0 ? `
Average Stress Level:    ${((healthData.mood || []).reduce((s, m) => s + parseInt(m.stress), 0) / (healthData.mood || []).length).toFixed(1)}/10
Most Recent Mood:        ${(healthData.mood || [])[(healthData.mood || []).length - 1]?.mood || 'N/A'}

Recent Mood History:
${(healthData.mood || []).slice(-7).map(entry => 
  `  ${new Date(entry.date).toLocaleDateString()}: ${entry.mood} (Stress: ${entry.stress}/10)${entry.notes ? '\n    Notes: ' + entry.notes : ''}`
).join('\n')}
` : 'No mental health data recorded.'}

═══════════════════════════════════════════════════════════════════
                    IMPORTANT MEDICAL DISCLAIMER
═══════════════════════════════════════════════════════════════════

⚠️  CRITICAL NOTICE TO PATIENT AND HEALTHCARE PROVIDERS:

This health analysis report is generated based on self-reported 
patient data collected over a 7-day monitoring period. This report 
is intended for INFORMATIONAL and SCREENING purposes only.

THIS REPORT DOES NOT:
• Constitute a medical diagnosis
• Replace professional medical examination
• Substitute for laboratory testing or clinical assessment
• Provide medical advice or treatment recommendations
• Account for complete medical history or family history

LIMITATIONS:
• Data accuracy depends on proper measurement techniques
• Self-reported data may contain errors or inconsistencies
• Analysis algorithms are screening tools, not diagnostic tools
• Does not include physical examination findings
• Does not incorporate imaging or laboratory test results

RECOMMENDATIONS FOR USE:
• Share this report with your healthcare provider
• Seek immediate medical attention for CRITICAL or HIGH RISK findings
• Do not start, stop, or modify medications without medical supervision
• Emergency conditions require immediate evaluation (call emergency services)
• Schedule regular check-ups with qualified medical professionals

For CRITICAL or HIGH RISK findings, medical consultation is strongly 
advised within 24-48 hours.

═══════════════════════════════════════════════════════════════════

Report Generated By: Health Tracker System v2.0
Analysis Algorithm: Medical Screening AI (Not FDA Approved)
Data Privacy: This report contains Protected Health Information (PHI)

═══════════════════════════════════════════════════════════════════
                        END OF REPORT
═══════════════════════════════════════════════════════════════════
`;

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Medical_Report_${currentUser?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show summary alert
    const criticalCount = conditions.filter(c => c.severity === 'CRITICAL').length;
    const highRiskCount = conditions.filter(c => c.severity === 'HIGH RISK').length;
    const moderateRiskCount = conditions.filter(c => c.severity === 'MODERATE RISK').length;
    const isHealthy = conditions.length === 1 && conditions[0].severity === 'HEALTHY';

    let alertMessage = '📄 MEDICAL REPORT DOWNLOADED SUCCESSFULLY\n\n';
    
    if (isHealthy) {
      alertMessage += '✅ HEALTH STATUS: EXCELLENT\n\n';
      alertMessage += 'Your 7-day health analysis shows all vital signs within normal ranges.\n\n';
      alertMessage += '• Blood Pressure: Normal\n';
      alertMessage += '• Blood Sugar: Normal\n';
      alertMessage += '• Sleep: Adequate\n';
      alertMessage += '• Hydration: Sufficient\n\n';
      alertMessage += 'Keep maintaining your healthy lifestyle!';
    } else {
      alertMessage += `⚠️ HEALTH ISSUES DETECTED: ${conditions.length}\n\n`;
      
      if (criticalCount > 0) {
        alertMessage += `🚨 CRITICAL CONDITIONS: ${criticalCount}\n`;
      }
      if (highRiskCount > 0) {
        alertMessage += `⚠️ HIGH RISK CONDITIONS: ${highRiskCount}\n`;
      }
      if (moderateRiskCount > 0) {
        alertMessage += `⚠️ MODERATE RISK CONDITIONS: ${moderateRiskCount}\n`;
      }
      
      alertMessage += '\n📋 CONDITIONS IDENTIFIED:\n\n';
      conditions.forEach((condition, idx) => {
        alertMessage += `${idx + 1}. ${condition.condition}\n`;
        alertMessage += `   Severity: ${condition.severity}\n`;
        alertMessage += `   Finding: ${condition.findings}\n\n`;
      });
      
      if (criticalCount > 0 || highRiskCount > 0) {
        alertMessage += '🚨 URGENT: Please consult a healthcare professional within 24-48 hours.\n\n';
      }
      
      alertMessage += 'Full details available in the downloaded report.';
    }
    
    alert(alertMessage);
  };

  // Use useMemo to calculate conditions only when healthData changes
  const conditions = useMemo(() => analyzeHealthConditions(healthData), [healthData]);
  const last7Days = useMemo(() => (healthData?.vitals || []).slice(-7), [healthData]);
  const isHealthy = useMemo(() => conditions.length === 1 && conditions[0].severity === 'HEALTHY', [conditions]);
  const criticalCount = useMemo(() => conditions.filter(c => c.severity === 'CRITICAL').length, [conditions]);
  const highRiskCount = useMemo(() => conditions.filter(c => c.severity === 'HIGH RISK').length, [conditions]);
  const moderateRiskCount = useMemo(() => conditions.filter(c => c.severity === 'MODERATE RISK').length, [conditions]);
  const lowRiskCount = useMemo(() => conditions.filter(c => c.severity === 'LOW RISK').length, [conditions]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Medical Health Analysis Report</h2>
          <p className="text-gray-600 mt-1">7-Day Comprehensive Health Assessment</p>
        </div>
        <button
          onClick={generateReport}
          disabled={last7Days.length < 7}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Download Medical Report
        </button>
      </div>

      {/* Data Requirement Notice */}
      {last7Days.length < 7 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-yellow-800 text-lg">Insufficient Data for Analysis</p>
              <p className="text-yellow-700 mt-2">
                You currently have {last7Days.length} day(s) of health data. At least 7 consecutive days of vital signs monitoring is required for accurate medical analysis.
              </p>
              <p className="text-yellow-700 mt-2">
                Please continue recording your daily vitals. Days remaining: {7 - last7Days.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Status Banner */}
      {last7Days.length >= 7 && (
        <>
          {isHealthy ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-4xl font-bold mb-3">HEALTHY STATUS</h3>
              <p className="text-xl mb-6">All vital signs within normal ranges</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm opacity-90">Blood Pressure</div>
                    <div className="text-lg font-bold">Normal</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Blood Sugar</div>
                    <div className="text-lg font-bold">Normal</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Sleep</div>
                    <div className="text-lg font-bold">Adequate</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Hydration</div>
                    <div className="text-lg font-bold">Good</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-4xl font-bold mb-3">HEALTH CONCERNS IDENTIFIED</h3>
                <p className="text-xl">Medical evaluation recommended</p>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold">
                    {conditions.length} Health {conditions.length === 1 ? 'Issue' : 'Issues'} Detected
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {criticalCount > 0 && (
                    <div className="bg-red-800 bg-opacity-70 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold">{criticalCount}</div>
                      <div className="text-sm">CRITICAL</div>
                    </div>
                  )}
                  {highRiskCount > 0 && (
                    <div className="bg-red-700 bg-opacity-60 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold">{highRiskCount}</div>
                      <div className="text-sm">HIGH RISK</div>
                    </div>
                  )}
                  {moderateRiskCount > 0 && (
                    <div className="bg-orange-600 bg-opacity-60 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold">{moderateRiskCount}</div>
                      <div className="text-sm">MODERATE RISK</div>
                    </div>
                  )}
                  {lowRiskCount > 0 && (
                    <div className="bg-yellow-500 bg-opacity-60 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold">{lowRiskCount}</div>
                      <div className="text-sm">LOW RISK</div>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-white border-opacity-30 pt-4">
                  <h4 className="text-xl font-bold mb-3">Conditions Detected:</h4>
                  <ul className="space-y-2">
                    {conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl">•</span>
                        <span className="flex-1">
                          <span className="font-bold">{condition.condition}</span>
                          <span className="ml-2 px-2 py-1 bg-white bg-opacity-30 rounded text-sm">
                            {condition.severity}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {(criticalCount > 0 || highRiskCount > 0) && (
                <div className="mt-6 bg-red-800 bg-opacity-60 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold">🚨 URGENT MEDICAL ATTENTION REQUIRED</p>
                  <p className="mt-2">Please consult a healthcare professional within 24-48 hours</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detailed Findings */}
      {last7Days.length >= 7 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Detailed Clinical Findings
          </h3>
          
          <div className="space-y-6">
            {conditions.map((condition, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-xl border-l-4 shadow-md ${
                  condition.severity === 'CRITICAL' ? 'bg-red-50 border-red-600' :
                  condition.severity === 'HIGH RISK' ? 'bg-red-50 border-red-500' :
                  condition.severity === 'MODERATE RISK' ? 'bg-orange-50 border-orange-500' :
                  condition.severity === 'LOW RISK' ? 'bg-yellow-50 border-yellow-500' :
                  condition.severity === 'HEALTHY' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <h4 className="text-xl font-bold text-gray-800 flex-1">
                    {idx + 1}. {condition.condition}
                  </h4>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    condition.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                    condition.severity === 'HIGH RISK' ? 'bg-red-200 text-red-900' :
                    condition.severity === 'MODERATE RISK' ? 'bg-orange-200 text-orange-900' :
                    condition.severity === 'LOW RISK' ? 'bg-yellow-200 text-yellow-900' :
                    condition.severity === 'HEALTHY' ? 'bg-green-200 text-green-900' :
                    'bg-blue-200 text-blue-900'
                  }`}>
                    {condition.severity}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-2">📊 Clinical Observation:</p>
                    <p className="text-gray-700">{condition.findings}</p>
                  </div>

                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-2">🔬 Medical Significance:</p>
                    <p className="text-gray-700 leading-relaxed">{condition.clinicalSignificance}</p>
                  </div>

                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-3">📈 Measured Parameters:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(condition.metrics || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600 font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="text-sm font-bold text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Vitals Table */}
      {last7Days.length >= 7 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            7-Day Vital Signs Record
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Date</th>
                  <th className="px-4 py-3 text-left">Blood Pressure</th>
                  <th className="px-4 py-3 text-left">Blood Sugar</th>
                  <th className="px-4 py-3 text-left">Weight</th>
                  <th className="px-4 py-3 text-left">Sleep</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Water</th>
                </tr>
              </thead>
              <tbody>
                {last7Days.map((vital, idx) => (
                  <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {new Date(vital.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        vital.systolic >= 140 || vital.diastolic >= 90 ? 'text-red-600' :
                        vital.systolic >= 130 || vital.diastolic >= 85 ? 'text-orange-600' :
                        vital.systolic >= 120 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {Math.round(vital.systolic)}/{Math.round(vital.diastolic)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">mmHg</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        vital.sugar >= 126 ? 'text-red-600' :
                        vital.sugar >= 100 ? 'text-orange-600' :
                        vital.sugar < 70 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {Math.round(vital.sugar)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">mg/dL</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-700">{vital.weight.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 ml-1">kg</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        vital.sleep < 6 ? 'text-red-600' :
                        vital.sleep > 9 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {vital.sleep.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">hrs</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        vital.water < 6 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {Math.round(vital.water)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">glasses</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistical Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-gray-800">Blood Pressure</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {(last7Days.reduce((s, v) => s + v.systolic, 0) / last7Days.length).toFixed(0)}/
                {(last7Days.reduce((s, v) => s + v.diastolic, 0) / last7Days.length).toFixed(0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">7-day average (mmHg)</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-800">Blood Sugar</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {(last7Days.reduce((s, v) => s + v.sugar, 0) / last7Days.length).toFixed(0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">7-day average (mg/dL)</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-gray-800">Sleep Duration</h4>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {(last7Days.reduce((s, v) => s + v.sleep, 0) / last7Days.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-600 mt-1">7-day average (hours)</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information */}
      {last7Days.length >= 7 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Patient Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-bold text-gray-800">{currentUser?.name || 'N/A'}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-lg font-bold text-gray-800">{currentUser?.email || 'N/A'}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Report ID</p>
              <p className="text-lg font-bold text-gray-800">RPT-{currentUser?.id}-{Date.now()}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Report Generated</p>
              <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-yellow-900 text-xl mb-3">⚠️ Important Medical Disclaimer</p>
            <div className="text-yellow-800 space-y-2 leading-relaxed">
              <p>
                <strong>This health analysis report is for informational and screening purposes only.</strong> It is based on self-reported data collected over a 7-day monitoring period and generated by automated analysis algorithms.
              </p>
              <p className="font-semibold mt-3">This report does NOT:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Constitute a medical diagnosis or professional medical advice</li>
                <li>Replace comprehensive physical examination by licensed healthcare providers</li>
                <li>Substitute for laboratory testing, imaging studies, or clinical assessment</li>
                <li>Account for complete medical history, family history, or current symptoms</li>
                <li>Provide treatment recommendations or medication guidance</li>
              </ul>
              <p className="font-semibold mt-3">Important Actions:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Share this report with your primary care physician or specialist</li>
                <li>Seek immediate medical attention for CRITICAL or HIGH RISK findings</li>
                <li>Do NOT start, stop, or modify medications without medical supervision</li>
                <li>Call emergency services for life-threatening conditions</li>
                <li>Schedule regular check-ups with qualified healthcare professionals</li>
              </ul>
              <p className="font-semibold mt-3 text-red-700">
                🚨 For CRITICAL or HIGH RISK conditions, medical consultation is strongly advised within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const StatCard = ({ icon, title, value, unit, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`inline-block p-3 bg-gradient-to-r ${color} rounded-lg mb-3`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-gray-600 text-sm font-semibold mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
      </div>
    </div>
  );

  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
      { id: 'vitals', icon: <Activity className="w-5 h-5" />, label: 'Vitals' },
      { id: 'medication', icon: <Pill className="w-5 h-5" />, label: 'Medications' },
      { id: 'diet', icon: <Apple className="w-5 h-5" />, label: 'Diet & Activity' },
      { id: 'mood', icon: <Smile className="w-5 h-5" />, label: 'Mood' },
      { id: 'scanner', icon: <Camera className="w-5 h-5" />, label: 'Medicine Scanner' },
      { id: 'community', icon: <Users className="w-5 h-5" />, label: 'Community' },
      { id: 'emergency', icon: <AlertCircle className="w-5 h-5" />, label: 'Emergency SOS' },
      { id: 'report', icon: <FileText className="w-5 h-5" />, label: 'Reports' }
    ];

    return (
      <div className="bg-gradient-to-b from-blue-600 to-purple-700 text-white h-screen w-64 fixed left-0 top-0 overflow-y-auto">
        <div className="p-6 border-b border-white border-opacity-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Health Dashboard</h1>
              <p className="text-xs opacity-75">Connected to DB</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{currentUser?.name}</p>
                <p className="text-xs opacity-75">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id
                    ? 'bg-white text-blue-600 font-semibold shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              api.clearToken();
              setCurrentUser(null);
              setCurrentPage('dashboard');
              setHealthData({
                vitals: [],
                medications: [],
                meals: [],
                activities: [],
                mood: []
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-red-500 hover:bg-opacity-50 transition mt-6"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  };
  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'vitals' && <VitalsPage />}
        {currentPage === 'medication' && <MedicationPage />}
        {currentPage === 'diet' && <DietActivityPage />}
        {currentPage === 'mood' && <MoodPage />}
        {currentPage === 'scanner' && <MedicineScannerPage />}
        {currentPage === 'community' && <CommunityPage />}
        {currentPage === 'emergency' && <EmergencyPage />}
        {currentPage === 'report' && <ReportPage healthData={healthData} currentUser={currentUser} />}
      </div>
    </div>
  );
};
export default App;
