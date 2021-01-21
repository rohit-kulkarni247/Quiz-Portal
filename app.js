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
  password:String,
  answer: [String],
  questcount: {type:Number,default:0},
  mobile:String,
  marks:{type:Number,default:0},
  versionKey: false
});


loginschema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", loginschema);

const Schema = mongoose.Schema; 
const Quest = mongoose.model("Question", new Schema({}), "questions");

const AnsSchema=mongoose.Schema;
const UserAns=mongoose.model("Ans",new AnsSchema({}),"answers");

// UserAns.find({},function(err, doc){
//   console.log(typeof(doc[0].toObject().ans[0]));
// })


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


app.get("/index", function (req, res) {
  res.render("index",{failed:""});
});


app.get("/instruction", function (req, res) {
  if(req.isAuthenticated()){
    res.render("Instruction");

  }
  else{
    res.render("/index",{failed:"Username or password is invalid"});
  }
});


app.get("/quiz", function (req, res) {
  
  if(req.isAuthenticated()){
    let counter=req.user.questcount;
    if(counter<6){

      Quest.find({}, function(err, doc){     
        res.render("quiz",{quest:doc,cnt:counter});
        
      });
    }
    else{
      res.redirect("/done");
    }
  }
  else{
    res.redirect("/login");
  }
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
            
            res.redirect("/index");
        });
      }
  });


});

app.post('/index', function(req, res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
    
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.render("/index",{failed:"Invalid username or password"});
    }
    else{
      passport.authenticate("local")(req, res, function(){
        console.log("hello world");
        res.redirect("/quiz");
      });
    }
  });
});

app.get("/done", function (req, res) {
  res.render("done");
});

app.get("/data",function (req, res) {
  User.find({}, function(err, users) {
    res.send({users: users});
 });
})


app.post("/quiz", function (req, res) {
  var id=req.user.id;
  var counter=req.user.questcount;
  User.updateOne({_id:id},{
    $push: {
      answer:req.body.answer
    }
  },
  function(err,student){
    if(err) return err;
    if(!student) return res.send();
    
  });

  // var useranswer=req.body.answer;
  // console.log(typeof(useranswer));
  // UserAns.find({}, function(err, doc){     
  //   var temp=doc[counter].toObject().ans;
  //   temp.forEach(myfunction);
  //   var m1=req.user.marks;
  //   console.log(typeof(m1));
  //   function myfunction(item){
  //     console.log(item);
  //     var n = item.localeCompare(useranswer);

  //     if(n==0){

  //       User.updateOne({_id:id},{marks:m1+1},function(err,docs){
  //         if(err){
  //           console.log(err);
  //         } 
  //         else{
  //           console.log("marks updated");
  //         }
          
  //       });
        
  //     }    
  //   }
    
  // });

  
  User.updateOne({_id:id},{questcount:counter+1},function(err,docs){
    if(err){
      console.log(err);
    } 
    else{
      console.log("questcount updated");
    }
    
  });

  // console.log(marks);
  
  res.redirect("/quiz");
  
  
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server running on port 3000");
});
