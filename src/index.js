import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import LocalStrategy from 'passport-local';
import session from "express-session";
import env from "dotenv";
import morgan from "morgan";

//import mongoose models
import Post from './app/models/Post.js';
import User from './app/models/User.js';
import ReplyPost from './app/models/ReplyPost.js';
import { error } from 'console';


env.config();
const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1 hour
      secure: false,
    },

  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.authenticate('session'))
app.use(passport.initialize());
app.use(passport.session());

const saltRounds = 10;

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(morgan('dev'));


const corsOptions = {
  origin: 'http://localhost:3000',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  "Access-Control-Allow-Credentials": true,
  allowedHeaders:
    "Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept, x-access-token",
};
app.use(cors(corsOptions));

process.env.DB_URI
const db = process.env.DB_URI
mongoose
    .connect(db, {})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));



// Define a POST route
app.post('/api/posts', async (req, res) => {
  // Add user._id to the req.body
  if (req.isAuthenticated()) {
    try {
      const reqBody = req.body;
      reqBody.name = req.user.username;
      const newPost = new Post(reqBody);
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

app.post('/api/replyposts/', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      console.log(req.body);
      const reqBody = req.body;
      const newReply = new ReplyPost(reqBody);
      const savedReply = await newReply.save();
      res.status(201).json(savedReply);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

app.get('/api/postsWithReplies', async (req, res) => {
  try {
    const postsWithReplies = await Post.aggregate([
      {
        $lookup: {
          from: 'replyposts',     // Name of the reply collection
          localField: '_id',      // Field in PostSchema
          foreignField: 'postId', // Field in ReplySchema
          as: 'replies',          // Combine replies into this field
        },
      },
      {
        $sort: { timestamp: -1 },  // Sort posts by timestamp in descending order
      },
    ]);
    res.status(200).json(postsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define a GET route
app.get('/api/posts/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/replyposts/', async (req, res) => {
  try {
      const replyposts = await ReplyPost.find();
      res.status(200).json(replyposts);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.get('/api/replyposts/:id', async (req, res)=> {
  try {
    //const id = await req.params.id;
    const replyposts = await ReplyPost.find({ postId: req.params.id});
    // Check if there are no replies for the post
    if (!replyposts || replyposts.length === 0) {
      return res.status(404).json({ message: 'Replies not found for this post' });
    }
    res.status(200).json(replyposts);
  }
    catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.get('/api/posts/:id', async (req, res)=> {
    try {
      const id = req.params.id
      console.log(typeof id)
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    }
    catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate
        (req.params.id, req.body, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/post/:postId/like', (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id; // Assuming user is authenticated and `req.user` is available
    const postId = req.params.postId;
    Post.findById(postId)
      .then(post => {
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
        // Check if user has already liked the post
        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
          // User has already liked the post; you can ignore or unlike
          return res.status(400).json({ error: 'User has already liked this post' });
        }
        // Add user ID to the likes array
        post.likes.push(userId);
        // Save the updated post
        return post.save().then(updatedPost => res.json(updatedPost));
      })
      .catch(error => res.status(500).json({ error: 'Something went wrong' }));
  } else {
    return res.status(401).json({ error: 'User unauthenticated'})
  }
});

// Handle Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in' });
      }
      console.log('Session after login:', req.session);
      return res.status(200).json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const { username, password, createdAt } = req.body;
  try {
    const checkResult = await User.find({ username: username });
    console.log("checkResult", checkResult);
    if (checkResult.length > 0) {
      res.status(409).json({ message: "User already exists. Please log in." });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("User", username, "created at", createdAt);
          const newUser = new User({
            username: username,
            password: hash,
            createdAt: createdAt,
          });
          console.log("newUser", newUser);
          const savedUser = await newUser.save();
          res.status(201).json(savedUser);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/logout", async function(req, res, next) {
  await req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      // Optionally clear the cookie
      res.clearCookie('connect.sid', {path: '/'}); // Replace 'connect.sid' with your session cookie name if different
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      // Check if user exists
      if (!user) {
        // User not match
        return done(null, false, { message: 'Incorrect user or password!' });
      }
      // Compare provided password with stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Password incorrect
        return done(null, false, { message: 'Incorrect user or password!' });
      }
      // If everything is fine, return the user
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});


app.get("/checkAuthentication", (req, res) => {
  if (req.isAuthenticated() === true) {
    res.status(200).json({ 
      authenticated: true,
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User is authenticated', req.isAuthenticated());
    // Accessing the user info from req.user
    const user = req.session.passport.user;
    res.json({
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

app.get('/auth', function (req, res) {
  res.json({user: req.user});
})

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});