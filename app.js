//jshint version:6

require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose=require('passport-local-mongoose');
const session=require('express-session');
const LocalStrategy = require("passport-local").Strategy;
const flash= require("connect-flash");
const https=require("https");
const axios=require("axios");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
  secret: "My little secret of football tactics.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


mongoose.connect("mongodb://user_session:qwerty123@cluster0-shard-00-00.lgrab.mongodb.net:27017,cluster0-shard-00-01.lgrab.mongodb.net:27017,cluster0-shard-00-02.lgrab.mongodb.net:27017/quizDB?ssl=true&replicaSet=atlas-n16tnt-shard-0&authSource=admin&retryWrites=true&w=majority", {useUnifiedTopology: true, useNewUrlParser: true});

mongoose.set("useCreateIndex", true);


const loginschema=new mongoose.Schema({
  username:String,
  password:String,
  answer: [String],
  questcount: {type:Number,default:0},
  mobile:String,
  marks:{type:Number,default:0},
  quiztype:String,
  enterTime:{type:Number,default:0},
  disbut:{type:Number,default:5000},
  versionKey: false
});


loginschema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", loginschema);

const Schema = mongoose.Schema; 
const Quest = mongoose.model("Question", new Schema({}), "MELA"); //mela questions

const AnsSchema=mongoose.Schema;
const UserAns=mongoose.model("Ans",new AnsSchema({}),"MELA_ANSWERS"); //mela answers

const SchemaBiz = mongoose.Schema; 
const QuestBiz = mongoose.model("QuestBiz", new SchemaBiz({}), "BIZTECH"); //biztech questions

const AnsBiz=mongoose.Schema;
const UserBiz=mongoose.model("AnsBiz",new AnsBiz({}),"BIZ_ANSWERS"); //biztech answers

const SchemaGen = mongoose.Schema; 
const QuestGen = mongoose.model("QuestGen", new SchemaGen({}), "GENERAL"); //general questions

const AnsGen=mongoose.Schema;
const UserGen=mongoose.model("AnsGen",new AnsGen({}),"GEN_ANSWERS"); //general answers

// UserAns.find({},function(err, doc){
//   console.log(typeof(doc[0].toObject().ans[0]));
// })


// passport.use(User.createStrategy());

passport.use(
  new LocalStrategy({ username: 'username',passReqToCallback: true }, (req,username,password, done) => {
    // Match user

    // https.get(process.env.CLIENT_URL,function(response){
    //   response.on("data", function(data){
    //     res.send(JSON.parse(data));
    //   })
    // });
    User.findOne({username: username})
      .then(user => {
        if (!user) {
          done(null, false, { message: 'That email is not registered' });
          throw new Error("email not registered");
        }
        // console.log(req.body.phone);
        if(password==user.password){

          if(user.mobile==req.body.mobile){
            return done(null, user);
          }
          else {
            done(null, false, { message: 'Mobile number incorrect' });
            throw new Error("mobile number incorrect");
          }
        }
        else {
          done(null, false, { message: 'Password incorrect' });
          throw new Error("password incorrect");
        }
      })
      .catch(err => console.log(err));
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  }); 
});

//get routes
app.get("/",function (req, res) {
  res.render("singup");
});

app.get("/index", function (req, res) {
  res.render("index",{failed:""});
});

app.get("/our_team", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render("our_team");
});

app.get("/web_team",function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render("wt_q");
})

app.get("/instruction", function (req, res) {
  if(req.isAuthenticated()){
    res.render("Instruction");

  }
  else{
    res.redirect("/index");
  }
  // res.render("Instruction");
});

app.get("/quizfinal", function (req, res) {
  if(req.isAuthenticated()){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    let type=req.user.quiztype;
    var timestart=req.user.enterTime;
    var id=req.user.id;
    let counter=req.user.questcount;
    if(type=='mela'){

      if(counter<20){
        // console.log(Date.now());
        
        if(timestart==0){
          User.updateOne({_id:id},{enterTime:Date.now()+30000},function(err,docs){
            if(err){
              console.log(err);
            } 
            else{
              console.log("time set");
            }
          
          });
          // var elem=+req.user.enterTime-Date.now(;
          Quest.find({}, function(err, doc){     
            res.render("quizfinal",{quest:doc,cnt:counter,timer:30000,butime:5000});
            
          });
        }
        else{
          var elem=+req.user.enterTime-Date.now();

          Quest.find({}, function(err, doc){     
            res.render("quizfinal",{quest:doc,cnt:counter,timer:elem,butime:5000});
            
          });
        }
        
      }
      else{
        res.redirect("/complete");
      }
    }
    if(type=='biztech'){

      if(counter<20){
        console.log(Date.now());
        QuestBiz.find({}, function(err, doc){     
          res.render("quizfinal",{quest:doc,cnt:counter});
          
        });
      }
      else{
        res.redirect("/complete");
      }
    }
    if(type=='general'){

      if(counter<20){
        console.log(Date.now());
        QuestGen.find({}, function(err, doc){     
          res.render("quizfinal",{quest:doc,cnt:counter});
          
        });
      }
      else{
        res.redirect("/complete");
      }
    }
  }
    else{
    res.redirect("/index");
  }
});

app.get("/complete", function (req, res) {
  if(req.isAuthenticated()){
    res.render("complete");
  }
  else{
    res.redirect("/index");
  }
  // res.render("complete");
});

app.get("/data",function (req, res) {
  User.find({}, function(err, users) {
    res.send({users: users});
 });
});


//post routes
app.post("/singup", function(req, res){
  console.log(req.body);
  const { username, password, mobile, cars } = req.body;
  const newUser = new User({
    username,
    password, 
    mobile,
    quiztype:cars
  });

  newUser.save()
      .then(user => {console.log('You are now registered and can log in');
          res.redirect('/index');
      })
      .catch(err => console.log(err));


});

app.post("/instruction", function (req, res){
  var checkedBody = req.body;
  // console.log(checkedBody);
    if(checkedBody.check1 == 'on'){
      res.redirect("/quizfinal");
    }
    else{
      res.redirect("/instruction");
    }
});

app.post('/index', function(req, res, next){
  passport.authenticate("local", 
    function(err, user, info) {
      if (err) { 
        console.log(err);
        // return next(err);
       }
      if (!user) { 
        res.render("index",{failed:"Invalid details entered"}); 
      }
      req.logIn(user, function(err) {
        if (err) { 
          console.log("hello");
          return next(err); 
        }
        return res.redirect("/instruction");
      });
    }
  )(req, res, next);
});




app.post("/quizfinal", function (req, res) {
  var id=req.user.id;
  
  var counter=req.user.questcount;
  var quiztype=req.user.quiztype;
  User.updateOne({_id:id},{
      $push: {
        answer:req.body.answer
      }
    },
    function(err,student){
      if(err) return err;
      if(!student) return res.send();
    
    });

    var useranswer=req.body.answer;
    UserAns.find({}, function(err, doc){     
      var temp=doc[counter].toObject().ans;
      temp.forEach(myfunction);
      function myfunction(item){
        item=item.toLowerCase();
        useranswer=useranswer.toLowerCase();
        var m1=req.user.marks;
        var n = item.localeCompare(useranswer);
        if(n==0){
          m1=m1+1;
        
          User.updateOne({_id:id},{marks:m1},function(err,docs){
            if(err){
              console.log(err);
            } 
            else{
              console.log("marks updated");
            }
          
          });
        
        }    
      }
    
  });

  
  User.updateOne({_id:id},{questcount:counter+1},function(err,docs){
    if(err){
      console.log(err);
    } 
    else{
      console.log("questcount updated");
    }
    
  });
  User.updateOne({_id:id},{enterTime:0},function(err,docs){
    if(err){
      console.log(err);
    } 
    else{
      console.log("time set");
    }
  
  });

  // console.log(marks);
  
  res.redirect("/quizfinal");
  
  
});

// logout
app.get("/logout", function(req, res){
  var id=req.user.id;
  counter=20;

  User.updateOne({_id:id},{questcount:counter},function(err,docs){
    if(err){
      console.log(err);
    } 
    else{
      console.log("logged out");
    }
    
  });

  req.logout();
  res.redirect("/index");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server running on port 3000");
});
