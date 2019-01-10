
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/QD', { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () { });

const quotesSchema = new mongoose.Schema({
    
    name: { 
        type: String,
        required: [true, "You must enter a name"], 
        max: 100 
    },
    
    content: {
        type: String, 
        required: [true, "You must enter a quote"], 
        minlength: [10, "Must be at least 10 characters long"]
    }

}, { timestamps: true });

quotesSchema.methods.speak = function () {
    let greeting = this.name ? `My name is ${this.name}` : "Um, I don't have a name!";
    console.log(greeting);
};

const Quotes = mongoose.model('Quotes', quotesSchema);

const moment = require("moment");
const express = require('express');

const flash = require('express-flash');

const app = express();

const bodyParser = require('body-parser');

const path = require('path');

const session = require('express-session');

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './public')));

app.use(flash());

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');


app.get('/', function (request, response) {
        response.render('index');
});

app.get('/quotes', function(request, response){
    Quotes.find({}, function(err, data){
        if(err){
            console.log("Something went wrong!:", err);
            for(var key in err.errors){
                request.flash('registration', err.errors[key].message);
            }
            response.redirect('/');
        }else{
            for(var quote in data){
                moment(data[quote].createdAt).format("h:mm a MMM Do YYY");
            }
            response.render('quotes', {data:data, moment:moment});
        }
    });
});


app.post('/quotes', function (request, response) {
    console.log("POST DATA", request.body);
    const newUser = new Quotes(request.body);
    newUser.save(function(err){
        if(err){
            console.log("Something went wrong!:", err);
            for(var key in err.errors){
                console.log('STARTING ERROR LOOP ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////');
                
                console.log(key);
                request.flash('registration', err.errors[key].message);
            }
            response.redirect('/');
        }else{
            response.redirect('/quotes');
        }
    });
});

app.listen(5000, function () {
    console.log("listening on port 5000");
});

