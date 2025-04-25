var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const flash = require('connect-flash');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
require('./configs/passport');
require('dotenv').config();
var mongoose = require("mongoose");
const moment = require('moment');

// Route Files
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var configs = require('./configs/globals');
var jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/application');
const { generateResponse } = require('./services/openai');
const JobApplication = require('./models/jobApplication'); 
const User = require('./models/user'); 

var app = express();

// View Engine Setup
const { engine } = require('express-handlebars');
const handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(handlebars),
  helpers: {
    formatDate: (date, format) => moment(date).format(format || 'YYYY-MM-DD'),
    ifCond: (v1, v2, options) => (v1 === v2) ? options.fn(this) : options.inverse(this)
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use('/uploads', express.static('uploads'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', jobRoutes);

// Session & Flash Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Flash Messages Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // Passport errors
  next();
});

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Logout Route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/job-list', jobRoutes);
app.use('/applications', applicationRoutes); // Ensure this is where the OpenAI route will be added

// MongoDB Connection
mongoose
  .connect(configs.ConnectionStrings.MongoDB)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ Error connecting to MongoDB!", err));

// 404 Error Handler
app.use((req, res, next) => {
  next(createError(404));
});

// General Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.get('/dashboard', async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');  // Redirect to login if not authenticated
  }

  try {
    // Fetch user's applications
    const userApplications = await JobApplication.find({ user: req.user._id });

    // Refresh the full user object to get resumeFeedback (if req.user is lean)
    const fullUser = await User.findById(req.user._id);

    res.render('dashboard', {
      user: fullUser,
      applications: userApplications
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Export app
module.exports = app;
