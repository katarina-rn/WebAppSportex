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
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Message = require('./models/Message');
const Cart = require('./models/Cart');
require('./authentication/passport')(passport);

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

/*SETTING APP PARAMETERS*/
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));
mongoose.set('useFindAndModify', false);
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

/*HASHING A PASSWORD*/
bcrypt.hash(process.env.PASSWORD, 10, (e, hash) => {
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
      if (users.length !== 0) {
        for (var i = 0; i < users.length; i++) {
          if (users[i].username === newUser.username)
            return;
        }
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
let cart;
/*GET ROUTES*/
app.get("/", function(req, res) {
  res.render("home", {
    categories: categories,
    user: req.user,
    cart: cart
  });
});

app.get("/onama", function(req, res) {
  res.render("about", {
    user: req.user,
    cart: cart
  });
});

app.get("/proizvodi", function(req, res) {
  res.redirect("/#products");
});

app.get("/brendovi", function(req, res) {
  res.redirect("/#brands");
});

app.get("/kontakt", function(req, res) {
  res.render("contact", {
    user: req.user,
    cart: cart
  });
});

app.get("/radnik/:name", function(req, res) {
  Product.find({}, (err, products) => {
    if (err) console.log(err);
    else res.render("homeWorker", {
      products: products,
      user: req.user
    });
  });
});

app.get("/narucilac/:name", function(req, res) {
  res.render("home", {
    categories: categories,
    user: req.user,
    cart: cart
  });
});

app.get("/narucilac", (req, res) => {
  Customer.find({}, (err, customers) => {
    if (err) console.log(err);
    else res.render("customers", {
      customers: customers,
      user: req.user
    });
  });
});

app.get("/poruke", function(req, res) {
  Message.find({}, (err, messages) => {
    if (err) console.log(err);
    else res.render("messages", {
      messages: messages,
      user: req.user
    });
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/proizvodi/:category", function(req, res) {
  const cat = req.params.category;
  Product.find({
    category: cat
  }, function(err, products) {
    if (err)
      console.log(err);
    res.render("categories", {
      categoryTitle: cat,
      products: products,
      user: req.user,
      cart: cart
    });
  });
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
    else res.redirect("/kontakt");
  });
});

app.post("/login", function(req, res) {
  passport.authenticate('local')(req, res, () => {
    if (req.user.role === "radnik") {
      res.redirect("/radnik/" + req.user.name);
    }
    if (req.user.role === "narucilac") {
      Cart.findOne({
        userId: req.user._id,
        active: true
      }, (err, found) => {
        if (err) console.log(err);
        if (found)
          cart = found;
        else
          cart = null;
      });
      res.redirect("/narucilac/" + req.user.name);
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
    else res.redirect(req.get('referer'));
  });
});

app.post("/narucilac", (req, res) => {
  let generatedPassword = generator.generate({
    length: 10,
    numbers: true
  });
  console.log(generatedPassword);
  bcrypt.hash(generatedPassword, 10, (e, hash) => {
    const newCustomer = new Customer({
      name: req.body.customerName,
      email: req.body.customerEmail,
      telephone: req.body.customerTelephone,
      addres: req.body.customerAdress,
      pib: req.body.customerPIB,
      password: hash
    });
    const newUser = new User({
      _id: newCustomer._id,
      username: newCustomer.email,
      password: newCustomer.password,
      name: newCustomer.name,
      role: "narucilac"
    });
    let exists = false;
    User.find({}, function(err, users) {
      if (err) {
        console.log(err);
      } else {
        let exists = false;
        if (users.length !== 0) {
          for (var i = 0; i < users.length; i++) {
            if (users[i].username === newUser.username) {
              res.send("Postoji korisnik sa unetom email adresom");
              exists = true;
            }
          }
        }
        if (!exists) {
          newCustomer.save(err => {
            if (err) console.log(err);
          });
          newUser.save(err => {
            if (err) console.log(err);
            else res.redirect(req.get('referer'));
          });
        }
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
    res.redirect(req.get('referer'));
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
    res.redirect(req.get('referer'));
  });

/*ORDERS*/
app.post("/order", (req, res) => {
  if (!req.isAuthenticated()) {
    res.send("Morate biti ulogovani");
  } else {
    let item = {
      productId: req.body.productId,
      quantity: Number.parseInt(req.body.value),
      name: req.body.name,
      price: Number.parseInt(req.body.price),
      total: Number.parseInt(req.body.value) * Number.parseInt(req.body.price)
    };
    if (cart !== null && typeof cart != "undefined") {
      let index = cart.products.findIndex(p => p.productId == item.productId);
      if (index > -1) {
        cart.products[index].quantity = item.quantity;
        cart.products[index].total = item.total;
        cart.totalPrice = 0;
        cart.products.forEach(i => {
          cart.totalPrice += i.total;
        })
      } else {
        cart.products.push(item);
        cart.totalPrice += item.total;
      }
      cart.save(err => {
        if (err)
          console.log(err);
      });
    } else {
      cart = new Cart({
        userId: req.user._id,
        products: [item],
        active: true,
        totalPrice: item.total,
        modifiedOn: new Date()
      });
      cart.save(err => {
        if (err)
          console.log(err);
      });
    }
    res.redirect(req.get('referer'));
  }
});

app.put("/order", (req, res) => {
  cart.active = false;
  cart.save(err => {
    if (err)
      console.log(err);
  });
  cart = null;
  res.redirect(req.get('referer'));
});

app.put("/order/:productId", (req, res) => {
  cart.products = cart.products.filter(p => {
    return p._id != req.params.productId;
  });
  cart.totalPrice = 0;
  cart.products.forEach(i => {
    cart.totalPrice += i.total;
  })
  if (cart.products.length > 0) {
    cart.save(err => {
      if (err)
        console.log(err);
    })
  } else {
    cart = null;
    Cart.deleteOne({
      _id: req.body.cartId
    }, err => {
      if (err) console.log(err);
    });
  }
  res.redirect(req.get('referer'));
})

/*DELETE CUSTOMER*/
app.route("/narucilac/:id")
  .delete(function(req, res) {
    Customer.deleteOne({
      _id: req.params.id
    }, err => {
      if (err) console.log(err);
    });
    User.deleteOne({
      _id: req.params.id
    }, err => {
      if (err) console.log(err);
    });
    res.redirect(req.get('referer'));
  })

app.listen(3000, function() {
  console.log("Server is starting at point 3000");
});
