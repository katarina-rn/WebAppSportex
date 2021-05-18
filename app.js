require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var _ = require('lodash');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const multer = require('multer');
const generator = require('generate-password');
const saltRounds = 10;

/*MULTER*/
const storage = multer.diskStorage({
  destination: "public/img/products",
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage
});

/*CREATING DATABASE*/
mongoose.connect("mongodb://localhost:27017/sportexDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/*CREATING SCHEMAS*/
const messageSchema = {
  name: String,
  email: String,
  telephone: String,
  content: String,
  read: Boolean
}

const userSchema = {
  username: String,
  password: String,
  name: String,
  role: String
}

const productSchema = {
  name: String,
  category: String,
  brand: String,
  price: Number,
  pricePDV: Number,
  imgUrl: String
}

const customerSchema = {
  name: String,
  email: String,
  telephone: String,
  addres: String,
  pib: String,
  password: String
}

/*CREATING COLLECTIONS(MODELS)*/
const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Customer = mongoose.model("Customer", customerSchema);

/*SETTING APP PARAMETERS*/
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));
mongoose.set('useFindAndModify', false);

/*HASHING A PASSWORD*/
bcrypt.hash(process.env.PASSWORD, saltRounds, (e, hash) => {
  const newUser = new User({
    username: "radnik",
    password: hash,
    name: "Ime",
    role: "radnik"
  });
  User.find({}, function(err, users) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === newUser.username)
          return;
      }
      newUser.save(err => {
        if (err)
          console.log(err);
      });
    }
  });
});

let categories = [{
    url: "negaLica.jpg",
    title: "Tretmani i nega lica",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  },
  {
    url: "kosa.jpg",
    title: "Tretmani i nega kose",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  },
  {
    url: "negaTela.jpg",
    title: "Tretmani i nega tela",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  },
  {
    url: "sminka.jpg",
    title: "Šminka",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  }
];

let worker;
/*GET ROUTES*/
app.get("/", function(req, res) {
  res.render("home", {
    categories: categories
  });
});

app.get("/onama", function(req, res) {
  res.render("about");
});

app.get("/proizvodi", function(req, res) {
  res.redirect("/#products");
});

app.get("/brendovi", function(req, res) {
  res.redirect("/#brands");
});

app.get("/kontakt", function(req, res) {
  res.render("contact");
});

app.get("/radnik/:name", function(req, res) {
  Product.find({}, (err, products) => {
    if (err) console.log(err);
    else res.render("homeWorker", {
      products: products,
      user: worker
    });
  });
});

app.get("/poruke", function(req, res) {
  Message.find({}, (err, messages) => {
    if (err) console.log(err);
    else res.render("messages", {
      messages: messages,
      user: worker
    });
  });
});

app.get("/logout", function(req, res) {
  worker = null;
  res.redirect("/");
});

/*POST ROUTES*/
app.post("/kontakt", function(req, res) {
  const message = new Message({
    name: req.body.senderName,
    email: req.body.senderEmail,
    telephone: req.body.senderTelepone,
    content: req.body.content,
    read: false
  });
  message.save(function(err) {
    if (err) console.log(err);
  });
});

app.post("/proizvodi/:category", function(req, res) {
  const cat = req.params.category;
  Product.find({
    category: cat
  }, function(err, products) {
    if (err)
      console.log(err);
    res.render("categories", {
      categoryTitle: cat,
      products: products
    });
  });
});

app.post("/login", function(req, res) {
  const userName = req.body.username;
  const password = req.body.password;
  User.findOne({
    username: userName
  }, (err, foundUser) => {
    if (err)
      console.log(err);
    else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(e, result) {
          if (result === true) {
            worker = foundUser;
            res.redirect("/radnik/" + foundUser.name);
          } else {
            res.send("Pogresan password");
          }
        });
      } else {
        res.redirect("#login");
      }
    }
  });
});

app.post("/proizvod", upload.single('productImage'), function(req, res) {
  const newProduct = new Product({
    name: req.body.productName,
    category: req.body.productCategory,
    brand: req.body.productBrand,
    price: req.body.productPrice,
    pricePDV: req.body.productPricePDV,
    imgUrl: "/img/products/" + req.file.filename
  });
  newProduct.save(err => {
    if (err) console.log(err);
    else res.redirect("/radnik/" + worker.name);
  });
});

app.post("/narucilac", (req, res) => {
  let generatedPassword = generator.generate({
    length: 10,
    numbers: true
  });
  bcrypt.hash(generatedPassword, saltRounds, (e, hash) => {
    const newCustomer = new Customer({
      name: req.body.customerName,
      email: req.body.customerEmail,
      telephone: req.body.customerTelephone,
      addres: req.body.customerAdress,
      pib: req.body.customerPIB,
      password: hash
    });
    const newUser = new User({
      username: newCustomer.email,
      password: newCustomer.password,
      name: newCustomer.name,
      role: "narucilac"
    });
    Customer.find({}, function(err, customers) {
      if (err) {
        console.log(err);
      } else {
        if (customers.length !== 0) {
          for (var i = 0; i < customers.length; i++) {
            if (customers[i].email === newCustomer.email) {
              res.send("Postoji narucilac sa unetom email adresom");
            }
          }
        }
        newCustomer.save(err => {
          if (err) console.log(err);
        });
      }
    });
    User.find({}, function(err, users) {
      if (err) {
        console.log(err);
      } else {
        if (users.length !== 0) {
          for (var i = 0; i < users.length; i++) {
            if (users[i].username === newUser.username) {
              res.send("Postoji korisnik sa unetom email adresom");
            }
          }
        }
        newUser.save(err => {
          if (err) console.log(err);
          else res.redirect("/radnik/" + worker.name);
        });
      }
    });
  });
});

/*UPDATE AND DELETE PRODUCT*/
app.route("/proizvod/:id")
  .delete(function(req, res) {
    Product.deleteOne({
      _id: req.params.id
    }, err => {
      if (err) console.log(err);
    });
    res.redirect("/radnik/" + worker.name);
  })
  .put(function(req, res) {
    Product.findOneAndUpdate({
      _id: req.params.id
    }, {
      name: req.body.pName,
      category: req.body.updateCategory,
      brand: req.body.updateBrand,
      price: req.body.updatePrice,
      pricePDV: req.body.updatePricePDV
    }, err => {
      if (err) console.log(err);
    });
    res.redirect("/radnik/" + worker.name);
  });

app.listen(3000, function() {
  console.log("Server is starting at point 3000");
});
