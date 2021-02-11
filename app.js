//jshint version:6

require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const https = require("https");
const axios = require("axios");
// const cors = require("cors")


const app = express();

// app.use(cors());
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested, Content-Type, Accept, Authorization"
//     );
//     if(req.method === "OPTIONS") {
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//         return res.status(200).json({});
//     }
//     next();
// })

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({
  secret: "My little secret of football tactics.",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


mongoose.connect("mongodb://user_session:qwerty123@cluster0-shard-00-00.lgrab.mongodb.net:27017,cluster0-shard-00-01.lgrab.mongodb.net:27017,cluster0-shard-00-02.lgrab.mongodb.net:27017/quizDB?ssl=true&replicaSet=atlas-n16tnt-shard-0&authSource=admin&retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true });

mongoose.set("useCreateIndex", true);


const loginschema = new mongoose.Schema({
  username: String,
  password: String,
  answer: [String],
  questcount: { type: Number, default: 0 },
  mobile: String,
  email:String,
  name: String,
  college:String,
  marks: { type: Number, default: 0 },
  quiztype: String,
  enterTime: { type: Number, default: 0 },
  disbut: { type: Number, default: 5000 },
  versionKey: false
});


loginschema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", loginschema);

const Schema = mongoose.Schema;
const Quest = mongoose.model("Question", new Schema({}), "MELA"); //mela questions

const AnsSchema = mongoose.Schema;
const UserAns = mongoose.model("Ans", new AnsSchema({}), "MELA_ANSWERS"); //mela answers

const SchemaBiz = mongoose.Schema;
const QuestBiz = mongoose.model("QuestBiz", new SchemaBiz({}), "BIZTECH"); //biztech questions

const AnsBiz = mongoose.Schema;
const UserBiz = mongoose.model("AnsBiz", new AnsBiz({}), "BIZ_ANSWERS"); //biztech answers

const SchemaGen = mongoose.Schema;
const QuestGen = mongoose.model("QuestGen", new SchemaGen({}), "GENERAL"); //general questions

const AnsGen = mongoose.Schema;
const UserGen = mongoose.model("AnsGen", new AnsGen({}), "GEN_ANSWERS"); //general answers

// UserAns.find({},function(err, doc){
//   console.log(typeof(doc[0].toObject().ans[0]));
// })


// passport.use(User.createStrategy());

passport.use(
  new LocalStrategy({ password: 'password' }, (username, password, done) => {

    User.findOne({ password: password })
      .then(user => {
        if (!user) {
          done(null, false, { message: 'That password is not registered' });
          throw new Error("password not registered");
        }
        // console.log(req.body.phone);
        if (username == user.username) {
          return done(null, user);
        }
        else {
          done(null, false, { message: 'email incorrect' });
          throw new Error("email incorrect");
        }
      })
      .catch(err => console.log(err));
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//get routes
// app.get("/",function (req, res) {
//   res.render("singup");
// });

app.get("/", function (req, res) {
  res.render("index", { failed: "" });
});

app.get("/ques", function (req, res) {
  res.render("ques3", { cnt: 30, timer: 30000 });
});

app.get("/our_team", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render("our_team");
});

app.get("/web_team", function (req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render("wt_q");
})

app.get("/instruction", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("Instruction");

  }
  else {
    res.redirect("/");
  }
  // res.render("Instruction");
});

app.get("/quizfinal", function (req, res) {
  if (req.isAuthenticated()) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    let type = req.user.quiztype;
    var timestart = req.user.enterTime;
    var id = req.user.id;
    let counter = req.user.questcount;
    if (type == 'melaquiz') {

      if (counter < 20) {
        // console.log(Date.now());

        if (timestart == 0) {
          User.updateOne({ _id: id }, { enterTime: Date.now() + 30000 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("time set");
            }

          });
          // var elem=+req.user.enterTime-Date.now(;
          if (counter == 1) {
            Quest.find({}, function (err, doc) {
              res.render("ques3", { type: "Mela Quiz", quest: doc, cnt: counter, timer: 30000 });

            });
          }
          else {

            Quest.find({}, function (err, doc) {
              res.render("quizfinal", { type: "Mela Quiz", quest: doc, cnt: counter, timer: 30000 });

            });
          }
        }
        else {
          var elem = +req.user.enterTime - Date.now();
          if (counter == 1) {

            Quest.find({}, function (err, doc) {
              res.render("ques3", { type: "Mela Quiz", quest: doc, cnt: counter, timer: elem });

            });
          }
          else {
            Quest.find({}, function (err, doc) {
              res.render("quizfinal", { type: "Mela Quiz", quest: doc, cnt: counter, timer: elem });

            });
          }
        }

      }
      else {
        res.redirect("/complete");
      }
    }
    if (type == 'biztechquiz') {

      if (counter < 20) {
        if (timestart == 0) {
          User.updateOne({ _id: id }, { enterTime: Date.now() + 30000 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("time set");
            }

          });
          // var elem=+req.user.enterTime-Date.now(;
          QuestBiz.find({}, function (err, doc) {
            res.render("quizfinal", { type: "Biztech Quiz", quest: doc, cnt: counter, timer: 30000 });

          });
        }
        else {
          var elem = +req.user.enterTime - Date.now();

          QuestBiz.find({}, function (err, doc) {
            res.render("quizfinal", { type: "Biztech Quiz", quest: doc, cnt: counter, timer: elem });

          });
        }
      }
      else {
        res.redirect("/complete");
      }
    }
    if (type == 'generalquiz') {

      if (counter < 20) {
        if (timestart == 0) {
          User.updateOne({ _id: id }, { enterTime: Date.now() + 30000 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("time set");
            }

          });
          // var elem=+req.user.enterTime-Date.now(;
          QuestGen.find({}, function (err, doc) {
            res.render("quizfinal", { type: "General Quiz", quest: doc, cnt: counter, timer: 30000 });

          });
        }
        else {
          var elem = +req.user.enterTime - Date.now();

          QuestGen.find({}, function (err, doc) {
            res.render("quizfinal", { type: "General Quiz", quest: doc, cnt: counter, timer: elem });

          });
        }
      }
      else {
        res.redirect("/complete");
      }
    }
  }
  else {
    res.redirect("/");
  }
});

app.get("/complete", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("complete");
  }
  else {
    res.redirect("/");
  }
  // res.render("complete");
});

app.get("/data", function (req, res) {
  User.find({}, function (err, users) {
    res.send({ users: users });
  });
});


//post routes

app.post("/instruction", function (req, res) {
  var checkedBody = req.body;
  // console.log(checkedBody);
  if (checkedBody.check1 == 'on') {
    res.redirect("/quizfinal");
  }
  else {
    res.redirect("/instruction");
  }
});

app.post('/', async function (req, res, next) {

  const { username, password, quiztype } = req.body;
  let currentDate = new Date().getDate();
  let currentHrs = new Date().getHours();
  let currentMin = new Date().getMinutes();

  if (quiztype == 'melaquiz') {
    if (currentDate == 12) {
      if (currentHrs == 0) {
        if (currentMin >= 0 && currentMin <= 59) {
          await axios.post('https://backend.credenz.in/eventlogin', {
            username: username,
            event: quiztype,
            password: password,
            adminpass: "pass"
          })
            .then(async function (response) {
              console.log(response.data);

              if (response.data.allow == true) {
                // console.log("2");
                const newUser = new User({
                  username: response.data.user.username,
                  password: response.data.user.password,
                  email: response.data.user.email,
                  name: response.data.user.name,
                  college: response.data.user.clgname,
                  mobile: response.data.user.phoneno,
                  quiztype: req.body.quiztype
                });

                await newUser.save()
                  .then(user => {
                    console.log('You are now registered and can log in');

                  })
                  .catch(err => console.log(err));
              }
              else {
                return res.render("index", { failed: "User not found" });
              }


            })
            .catch(function (error) {
              console.log(error);
              return res.render("index", { failed: "Some error occurred" });
            });

          passport.authenticate("local",
            function (err, user, info) {
              if (err) {
                console.log(err);
                // return next(err);
                // console.log("3");
              }
              if (!user) {
                // console.log("3not user");
                res.render("index", { failed: "Invalid details entered" });
              }
              req.logIn(user, function (err) {
                if (err) {
                  // console.log("4error");
                  return next(err);
                } else {
                  // console.log("4hi");
                  return res.redirect("/instruction");
                }
              });
            }
          )(req, res, next);
        }
        else{
          res.render("index", { failed: "Check the timings.." });
        }
      }
      else{
        res.render("index", { failed: "Check the timings" });
      }
    }
    else{
      res.render("index", { failed: "Check the event date" });
    }
  }
  else if (quiztype == 'generalquiz') {
    if (currentDate == 13) {
      if (currentHrs == 12) {
        if (currentMin >= 0 && currentMin <= 30) {
          await axios.post('https://backend.credenz.in/eventlogin', {
            username: username,
            event: quiztype,
            password: password,
            adminpass: "pass"
          })
            .then(async function (response) {
              console.log(response.data);

              if (response.data.allow == true) {
                // console.log("2");
                const newUser = new User({
                  username: response.data.user.username,
                  password: response.data.user.password,
                  email: response.data.user.email,
                  name: response.data.user.name,
                  college: response.data.user.clgname,
                  mobile: response.data.user.phoneno,
                  quiztype: req.body.quiztype
                });

                await newUser.save()
                  .then(user => {
                    console.log('You are now registered and can log in');

                  })
                  .catch(err => console.log(err));
              }
              else {
                return res.render("index", { failed: "User not found" });
              }


            })
            .catch(function (error) {
              console.log(error);
              return res.render("index", { failed: "Some error occurred" });
            });

          passport.authenticate("local",
            function (err, user, info) {
              if (err) {
                console.log(err);
                // return next(err);
                // console.log("3");
              }
              if (!user) {
                // console.log("3not user");
                res.render("index", { failed: "Invalid details entered" });
              }
              req.logIn(user, function (err) {
                if (err) {
                  // console.log("4error");
                  return next(err);
                } else {
                  // console.log("4hi");
                  return res.redirect("/instruction");
                }
              });
            }
          )(req, res, next);
        }
        else{
          res.render("index", { failed: "Check the timings.." });
        }
      }
      else{
        res.render("index", { failed: "Check the timings.." });
      }
    }
    else{
      res.render("index", { failed: "Check the Event date" });
    }
  }
  else {
    if (currentDate == 12) {
      if (currentHrs == 16) {
        if (currentMin >= 30 && currentMin <= 59) {
          await axios.post('https://backend.credenz.in/eventlogin', {
            username: username,
            event: quiztype,
            password: password,
            adminpass: "pass"
          })
            .then(async function (response) {
              console.log(response.data);

              if (response.data.allow == true) {
                // console.log("2");
                const newUser = new User({
                  username: response.data.user.username,
                  password: response.data.user.password,
                  email: response.data.user.email,
                  name: response.data.user.name,
                  college: response.data.user.clgname,
                  mobile: response.data.user.phoneno,
                  quiztype: req.body.quiztype
                });

                await newUser.save()
                  .then(user => {
                    console.log('You are now registered and can log in');

                  })
                  .catch(err => console.log(err));
              }
              else {
                return res.render("index", { failed: "User not found" });
              }


            })
            .catch(function (error) {
              console.log(error);
              return res.render("index", { failed: "Some error occurred" });
            });

          passport.authenticate("local",
            function (err, user, info) {
              if (err) {
                console.log(err);
                // return next(err);
                // console.log("3");
              }
              if (!user) {
                // console.log("3not user");
                res.render("index", { failed: "Invalid details entered" });
              }
              req.logIn(user, function (err) {
                if (err) {
                  // console.log("4error");
                  return next(err);
                } else {
                  // console.log("4hi");
                  return res.redirect("/instruction");
                }
              });
            }
          )(req, res, next);
        }
        else{
          res.render("index", { failed: "Check the timings.." });
        }
      }
      else{
        res.render("index", { failed: "Check the timings.." });
      }
    }
    else{
      res.render("index", { failed: "Check the event date" });
    }
  }
});




app.post("/quizfinal", function (req, res) {
  var id = req.user.id;
  var counter = req.user.questcount;
  var quiztype = req.user.quiztype;
  User.updateOne({ _id: id }, {
    $push: {
      answer: req.body.answer
    }
  },
    function (err, student) {
      if (err) return err;
      if (!student) return res.send();

    });

  if (quiztype == 'melaquiz') {
    var useranswer = req.body.answer;
    UserAns.find({}, function (err, doc) {
      var temp = doc[counter].toObject().ans;
      temp.forEach(myfunction);
      function myfunction(item) {
        item = item.toLowerCase();
        useranswer = useranswer.toLowerCase();
        var m1 = req.user.marks;
        var n = item.localeCompare(useranswer);
        if (n == 0) {
          m1 = m1 + 1;

          User.updateOne({ _id: id }, { marks: m1 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("marks updated");
            }

          });

        }
      }
    });

    User.updateOne({ _id: id }, { questcount: counter + 1 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("questcount updated");
      }

    });

    User.updateOne({ _id: id }, { enterTime: 0 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("time set");
      }

    });
    res.redirect("/quizfinal");
  }


  if (quiztype == 'biztechquiz') {
    var useranswer = req.body.answer;
    UserBiz.find({}, function (err, doc) {
      var temp = doc[counter].toObject().ans;
      temp.forEach(myfunction);
      function myfunction(item) {
        item = item.toLowerCase();
        useranswer = useranswer.toLowerCase();
        var m1 = req.user.marks;
        var n = item.localeCompare(useranswer);
        if (n == 0) {
          m1 = m1 + 1;

          User.updateOne({ _id: id }, { marks: m1 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("marks updated");
            }

          });

        }
      }
    });

    User.updateOne({ _id: id }, { questcount: counter + 1 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("questcount updated");
      }

    });

    User.updateOne({ _id: id }, { enterTime: 0 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("time set");
      }

    });
    res.redirect("/quizfinal");
  }

  if (quiztype == 'generalquiz') {
    var useranswer = req.body.answer;
    UserGen.find({}, function (err, doc) {
      var temp = doc[counter].toObject().ans;
      temp.forEach(myfunction);
      function myfunction(item) {
        item = item.toLowerCase();
        useranswer = useranswer.toLowerCase();
        var m1 = req.user.marks;
        var n = item.localeCompare(useranswer);
        if (n == 0) {
          m1 = m1 + 1;

          User.updateOne({ _id: id }, { marks: m1 }, function (err, docs) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("marks updated");
            }

          });

        }
      }
    });

    User.updateOne({ _id: id }, { questcount: counter + 1 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("questcount updated");
      }

    });

    User.updateOne({ _id: id }, { enterTime: 0 }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("time set");
      }

    });
    res.redirect("/quizfinal");
  }
});

// logout
app.get("/logout", function (req, res) {
  var id = req.user.id;
  counter = 20;

  User.updateOne({ _id: id }, { questcount: counter }, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("logged out");
    }

  });

  req.logout();
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server running on port 3000");
});