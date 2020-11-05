//jshint version:6

//require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose=require('passport-local-mongoose');
const session=require('express-session');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
  secret: 'My little secret of football tactics.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://user_session:qwerty123@cluster0-shard-00-00.lgrab.mongodb.net:27017,cluster0-shard-00-01.lgrab.mongodb.net:27017,cluster0-shard-00-02.lgrab.mongodb.net:27017/quizDB?ssl=true&replicaSet=atlas-n16tnt-shard-0&authSource=admin&retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.set("useCreateIndex", true);


const loginschema=new mongoose.Schema({
  username:String,
  password1:String,
  answer: [String],
  versionKey: false
});

const questionschema=new mongoose.Schema({
  question: [{
    questions:String
  }]
});


loginschema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", loginschema);
const Admin= new mongoose.model("Admin",questionschema,);

var q={questions:"Who will win US president elections?"};

// var tempQuest=[  {
//   questions:"Where is the statue of liberty situated?"
// },
// {
// questions:"What is the full form of dbms?"
// },
// {
//   questions:"Who is the captain of Indian cricket team?"
// },
// {
//   questions:"Who is the only captian who has won all the three ICC trophies?"
// },
// {
//   questions:"Which movie of Amir Khan went to Oscars?"
// },
// {
//   questions:"Where was 2010 football world cup held?"
// }];


const admin=new Admin([


]);

admin.question.push(q);
q={
    questions:"Where is the statue of liberty situated?"
  };
  admin.question.push(q);
  q={
    questions:"What is the full form of dbms?"
    };
    admin.question.push(q);
    q= {
        questions:"Who is the captain of Indian cricket team?"
      };
      admin.question.push(q);
    q={
        questions:"Who is the only captian who has won all the three ICC trophies?"
      };
    admin.question.push(q);
    q={
        questions:"Which movie of Amir Khan went to Oscars?"
      };
    admin.question.push(q);
    q={
        questions:"Where was 2010 football world cup held?"
      };
    admin.question.push(q);
admin.save();


passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  }); 
});



app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/",function (req, res) {
  res.render("singup");
});

app.post("/singup", function(req, res){
  User.register({username:req.body.username}, req.body.password, function(err,user){
      if(err){
        console.log(err);
        res.redirect("/singup");
      }else{
        
        passport.authenticate("local")(req, res, function(){
            
            res.redirect("/login");
        });
      }
  });


});

app.post('/login', function(req, res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err){
    if(err){
      
      console.log(err);

    }
    else{
      passport.authenticate("local")(req, res, function(){
          
          res.redirect("/template");
      });
    }
  });
});

// app.get("/done", function (req, res) {
//   res.render("done");
// });
var counter=0;
app.get("/template", function (req, res) {
  if(req.isAuthenticated()){
    //console.log(admin.question);
    if(counter<7){

      res.render("template",{quest:admin,cnt:counter});
      counter++;
    }
    else{
      res.render("done");
    }
  }
  else{
    res.redirect("/login");
  }
});
var i=0;



app.post("/template", function (req, res) {
  var id=req.user.id;
  User.updateOne({_id:id},{
    $push: {
      answer:req.body.answer
    }
  },
  function(err,student){
    if(err) return err;
    if(!student) return res.send();
    
  })
  res.redirect("/template");

  console.log(answer);
  i++;
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server running on port 3000");
});
