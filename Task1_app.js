const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // Use createIndex instead of the deprecated ensureIndex
  useFindAndModify: false // To use findOneAndUpdate() instead of findAndModify()
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Define user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create User model
const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the registration form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle user registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.send('User already exists. Please choose a different username or email.');
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      password
    });

    // Save the user to the database
    await newUser.save();
    res.send('Registration successful!');
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).send('Registration failed. Please try again.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
