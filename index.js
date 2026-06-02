//version 1.5
//AAA Network WebApp

const categories = require('./utils/categories');



if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const helmet = require('helmet');
app.set('query parser', 'extended');

// PARSERS
//enable JSON
app.use(express.json());
//allow post
app.use(express.urlencoded({ extended: true }));
//Sanitiser
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
app.use(sanitizeV5({ replaceWith: '_' }));



const port = process.env.PORT || 8080;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const session = require('express-session');
const { MongoStore } = require ('connect-mongo')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/AAAStore';



const { productSchema, userSchema } = require('./schemas');

//Mongoose start
const mongoose = require('mongoose');

//connection with mongoose
//

const Product = require('./models/product.js');
const User = require('./models/user.js');
const Conversation = require ('./models/conversation.js');

const productsRoutes = require('./routes/products.js');
const usersRoutes = require('./routes/users.js');
const conversationsRoutes = require('./routes/conversations.js')
const adminRoutes = require('./routes/admin.js')
const {fetchPendingCount} = require('./middleware');
const { isLoggedIn } = require('./middleware.js');


//initialise session

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // touch after 24h
    crypto: {
        secret : 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR",e)
})

const sessionConfig = {
    store,
    name: 'vattelapesca',
    secret: 'thisshouldbeasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

//HELMET
app.use(helmet({
    contentSecurityPolicy: false
}));

//initialise passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//initialise flash 
app.use(flash());
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(fetchPendingCount);
 





// 2. Update Mongoose Connection

mongoose.connect(dbUrl)
    .then(() => {
        // Log the host to confirm it's Atlas and not local
        console.log("Database connected to:", mongoose.connection.host);
    })
    .catch(err => {
        console.log('Mongo connection error');
        console.error(err);
    });


app.engine('ejs', ejsMate);



app.use(methodOverride('_method'));
//link to .js and .css
app.use(express.static(path.join(__dirname, '/public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use((req,res,next)=> {
    res.locals.name = "AAA Network Solutions"; // default page title
    next();
})

//homepage
app.get('/', (req, res) => {
    res.render('home', { name: 'AAA Networking Home Page' });

});

//PRODUCT ROUTE
app.use('/products', productsRoutes);

//USER ROUTE

app.use('/users', usersRoutes);

//CONVERSATION ROUTE

app.use('/conversations', conversationsRoutes);

//ADMIN ROUTE

app.use('/admin', adminRoutes);




app.get('/about', (req, res) => {
    res.render('about', { name: 'AAA Network About' });
});

// design page (Complete version)
app.get('/networkDesignPage', isLoggedIn, catchAsync(async (req, res, next) => {
    // 1. Fetch the actual user from DB to get their unique designState
    const user = await User.findById(req.user._id);
    
    // 2. Fetch products for the sidebar
    const products = await Product.find({});

    // 3. Prevent browser caching so User Y doesn't see User X's old page
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // 4. Pass 'savedDesign' to the EJS template
    res.render('networkDesignPage', { 
        name: 'Design Page', 
        categories, 
        products, 
        savedDesign: user.designState || "{}" 
    });
}));

//basic error handling


app.all(/(.*)/, (req, res, next) => {

    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { name: 'Error', err, statusCode })
});


//STARTS EXPRESS SERVER!
app.listen(port, () => {

    // console.log("My Key is:", process.env.OPENAI_API_KEY);
    console.log(`listening on port ${port}`);
});


