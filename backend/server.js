const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snapcarb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    weight: Number,
    height: Number,
    goals: [String],
    dietaryRestrictions: [String],
    fastingWindow: { type: Number, default: 16 },
    eatingWindow: { type: Number, default: 8 }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now },
  netCarbs: { type: Number, required: true },
  totalCarbs: Number,
  fiber: Number,
  protein: Number,
  fat: Number,
  calories: Number,
  ingredients: [String],
  photoUrl: String,
  aiAnalysis: String,
  complianceScore: { type: Number, min: 1, max: 10 },
  hasDisallowedFoods: { type: Boolean, default: false },
  disallowedFoods: [String],
  tags: [String]
});

const supplementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  recommendedForm: String,
  timing: String,
  targetBloodLevel: String,
  taken: { type: Boolean, default: false },
  takenAt: Date,
});

// Enhanced Events Schema for Dr. Davis InfiniteHealth Program
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, default: '1 hour' },
  type: { 
    type: String, 
    enum: ['webinar', 'workshop', 'challenge', 'meetup', 'consultation', 'course'],
    default: 'webinar'
  },
  category: { type: String, default: 'general' },
  link: String,
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  price: String,
  benefits: [String],
  status: { 
    type: String, 
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Community Posts Schema
const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['story', 'progress', 'question', 'tip', 'challenge'],
    default: 'story'
  },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
  notes: String
});

const challengeDaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  day: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  mealsLogged: { type: Number, default: 0 },
  symptomsNoted: { type: Boolean, default: false },
  symptoms: [String],
  notes: String,
  netCarbsTotal: Number,
  adherenceScore: Number,
  mood: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
  energy: { type: String, enum: ['high', 'medium', 'low'] }
});

const healthEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  type: { type: String, enum: ['webinar', 'workshop', 'consultation', 'challenge'], required: true },
  registrationUrl: String,
  isLive: { type: Boolean, default: false },
  maxParticipants: Number,
  currentParticipants: Number,
  host: String,
  tags: [String],
  imageUrl: String
});

const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['success', 'question', 'recipe', 'motivation', 'general'], 
    default: 'general' 
  },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  photoUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [{ 
    name: String, 
    amount: String, 
    unit: String 
  }],
  instructions: [String],
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  netCarbs: { type: Number, required: true },
  protein: Number,
  fat: Number,
  calories: Number,
  tags: [String],
  complianceScore: { type: Number, min: 1, max: 10 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  photoUrl: String,
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const fastingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  duration: Number, // in hours
  isActive: { type: Boolean, default: true },
  notes: String,
  mood: String,
  energy: String,
  hunger: { type: String, enum: ['none', 'mild', 'moderate', 'strong'] }
});

// Models
const User = mongoose.model('User', userSchema);
const Meal = mongoose.model('Meal', mealSchema);
const Supplement = mongoose.model('Supplement', supplementSchema);
const ChallengeDay = mongoose.model('ChallengeDay', challengeDaySchema);
const HealthEvent = mongoose.model('HealthEvent', healthEventSchema);
const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
const FastingSession = mongoose.model('FastingSession', fastingSessionSchema);
const Event = mongoose.model('Event', eventSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes

// User Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profile
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Meals API
app.post('/api/meals', authenticateToken, async (req, res) => {
  try {
    const meal = new Meal({
      ...req.body,
      userId: req.user.userId
    });
    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meal', error: error.message });
  }
});

app.get('/api/meals', authenticateToken, async (req, res) => {
  try {
    const { date, limit = 50 } = req.query;
    let query = { userId: req.user.userId };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.timestamp = { $gte: startDate, $lt: endDate };
    }

    const meals = await Meal.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meals', error: error.message });
  }
});

// Supplements API
app.post('/api/supplements', authenticateToken, async (req, res) => {
  try {
    const supplement = new Supplement({
      ...req.body,
      userId: req.user.userId
    });
    await supplement.save();
    res.status(201).json(supplement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplement', error: error.message });
  }
});

app.get('/api/supplements', authenticateToken, async (req, res) => {
  try {
    const supplements = await Supplement.find({ userId: req.user.userId });
    res.json(supplements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplements', error: error.message });
  }
});

app.put('/api/supplements/:id', authenticateToken, async (req, res) => {
  try {
    const supplement = await Supplement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!supplement) {
      return res.status(404).json({ message: 'Supplement not found' });
    }
    res.json(supplement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplement', error: error.message });
  }
});

// Challenge API
app.post('/api/challenge', authenticateToken, async (req, res) => {
  try {
    const challengeDay = new ChallengeDay({
      ...req.body,
      userId: req.user.userId
    });
    await challengeDay.save();
    res.status(201).json(challengeDay);
  } catch (error) {
    res.status(500).json({ message: 'Error creating challenge day', error: error.message });
  }
});

app.get('/api/challenge', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { userId: req.user.userId };
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const challengeDays = await ChallengeDay.find(query).sort({ date: 1 });
    res.json(challengeDays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge days', error: error.message });
  }
});

// Events API
app.get('/api/events', async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    let query = {};
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }
    
    if (type) {
      query.type = type;
    }

    const events = await HealthEvent.find(query).sort('date');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const event = new HealthEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Community API
app.post('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const post = new CommunityPost({
      ...req.body,
      userId: req.user.userId
    });
    await post.save();
    
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'username profile.firstName profile.lastName');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

app.get('/api/community/posts', async (req, res) => {
  try {
    const { type, tag, limit = 20, page = 1 } = req.query;
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const posts = await CommunityPost.find(query)
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await CommunityPost.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

app.post('/api/community/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(req.user.userId); // Like
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like', error: error.message });
  }
});

// Recipes API
app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      author: req.user.userId
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error: error.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const { tag, maxCarbs, limit = 20 } = req.query;
    let query = { isApproved: true };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (maxCarbs) {
      query.netCarbs = { $lte: parseInt(maxCarbs) };
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// Fasting API
app.post('/api/fasting/start', authenticateToken, async (req, res) => {
  try {
    // End any active fasting session
    await FastingSession.updateMany(
      { userId: req.user.userId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    const fastingSession = new FastingSession({
      userId: req.user.userId,
      startTime: new Date(),
      isActive: true
    });
    
    await fastingSession.save();
    res.status(201).json(fastingSession);
  } catch (error) {
    res.status(500).json({ message: 'Error starting fast', error: error.message });
  }
});

app.put('/api/fasting/:id/end', authenticateToken, async (req, res) => {
  try {
    const fastingSession = await FastingSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId, isActive: true },
      {
        isActive: false,
        endTime: new Date(),
        duration: (new Date().getTime() - new Date(fastingSession.startTime).getTime()) / (1000 * 60 * 60),
        ...req.body
      },
      { new: true }
    );
    
    if (!fastingSession) {
      return res.status(404).json({ message: 'Fasting session not found' });
    }
    
    res.json(fastingSession);
  } catch (error) {
    res.status(500).json({ message: 'Error ending fast', error: error.message });
  }
});

// File upload for meal photos
app.post('/api/upload/meal-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Analytics API
app.get('/api/analytics/daily', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [meals, supplements, fastingSessions] = await Promise.all([
      Meal.find({
        userId: req.user.userId,
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),
      Supplement.find({ userId: req.user.userId }),
      FastingSession.find({
        userId: req.user.userId,
        startTime: { $gte: startOfDay, $lte: endOfDay }
      })
    ]);

    const totalNetCarbs = meals.reduce((sum, meal) => sum + meal.netCarbs, 0);
    const supplementsTaken = supplements.filter(s => s.taken).length;
    const totalSupplements = supplements.length;
    const averageComplianceScore = meals.length > 0 
      ? meals.reduce((sum, meal) => sum + (meal.complianceScore || 0), 0) / meals.length 
      : 0;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      meals: {
        count: meals.length,
        totalNetCarbs,
        averageComplianceScore: Math.round(averageComplianceScore * 10) / 10
      },
      supplements: {
        taken: supplementsTaken,
        total: totalSupplements,
        percentage: totalSupplements > 0 ? (supplementsTaken / totalSupplements) * 100 : 0
      },
      fasting: {
        active: fastingSessions.some(fs => fs.isActive),
        sessions: fastingSessions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Enhanced Events API for Dr. Davis InfiniteHealth Program
app.get('/api/events', async (req, res) => {
  try {
    const { type, category, featured, status } = req.query;
    let query = { date: { $gte: new Date() } };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (status) query.status = status;
    
    const events = await Event.find(query).sort('date');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Community Feed API
app.get('/api/community/posts', async (req, res) => {
  try {
    const { type, tags, limit = 20 } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };
    
    const posts = await CommunityPost.find(query)
      .populate('userId', 'username profile.firstName profile.lastName')
      .sort('-createdAt')
      .limit(parseInt(limit));
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

app.post('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const post = new CommunityPost({
      ...req.body,
      userId: req.user.userId
    });
    await post.save();
    
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'username profile.firstName profile.lastName');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

app.post('/api/community/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user.userId;
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.json({ likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like', error: error.message });
  }
});

app.post('/api/community/posts/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      userId: req.user.userId,
      content
    });
    
    await post.save();
    
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'username profile.firstName profile.lastName')
      .populate('comments.userId', 'username profile.firstName profile.lastName');
    
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!', error: error.message });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SnapCarb API server running on port ${PORT}`);
});

module.exports = app;
