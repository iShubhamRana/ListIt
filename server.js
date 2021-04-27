//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const { response } = require('express');
//const date = require(__dirname + '/data.js');
const mongoose = require('mongoose');
const { name } = require('ejs');
const e = require('express');
require('dotenv').config();
mongoose.connect("mongodb+srv://admin-shubham:rana2001shubham@cluster0.kzsaf.mongodb.net/usersDB",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log('connected successfully');
  }
);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

var currentUser;
var listsCreated;
//schema for storing

const itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'No item added'],
  },
});

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Enter username'],
  },
  password: {
    type: String,
    required: [true, 'Enter password'],
  },
  lists: [listSchema],
  mainList: [itemSchema],
});

//model
const User = mongoose.model('User', userSchema);
const List = mongoose.model('List', listSchema);
const Item = mongoose.model('Item', itemSchema);
const item1 = new Item({
  name: 'Welcome to your todolist!',
});
const item2 = new Item({
  name: 'Hit the + button to add a new item',
});
const item3 = new Item({
  name: '<---  Hit this to delete an Item',
});
const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {
  res.render('login', { error: '' });
});
app.post('/', (req, res) => {
  const userName = req.body.userName;
  const pass = req.body.password;
  User.findOne({ name: userName, password: pass }, (err, result) => {
    if (!err) {
      if (!result)
        res.render('login', { error: 'invalid username or password' });
      else {
        currentUser = result;

        res.redirect('/home');
      }
    } else {
    }
  });
});
app.get('/signup', (req, res) => {
  res.render('signup', { error: '' });
});
app.post('/signup', (req, res) => {
  const username = req.body.userName;
  if (req.body.password === req.body.confirmPassword) {
    User.findOne({ name: username }, (err, found) => {
      if (!err) {
        if (!found) {
          const newUser = new User({
            name: req.body.userName,
            password: req.body.password,
            lists: [],
            mainList: defaultItems,
          });
          newUser.save();
          res.redirect('/');
        } else {
          res.render('signup', { error: 'Username exists' });
        }
      } else {
        console.log('error detected');
      }
    });
  } else {
    res.render('signup', { error: ' passwords do not match ' });
  }
});

//get request for home page
app.get('/home', (req, res) => {
  const day = 'Today';
  res.render('list', {
    name: currentUser.name,
    listTitle: day,
    finalList: currentUser.mainList,
    user: currentUser,
  });
});

//post request on submitting on homepage
app.post('/home', (req, res) => {
  console.log(req.body);
  let item = req.body.item;
  let listName = req.body.button;
  console.log(listName);
  const dummy = new Item({
    name: item,
  });
  if (listName === 'Today') {
    currentUser.mainList.push(dummy);
    currentUser.save();
    res.redirect('/home');
  } else {
    currentUser.lists.forEach((e) => {
      if (e.name === listName) e.items.push(dummy);
    });
    currentUser.save();
    res.redirect('/home/' + listName);
  }
});

app.post('/delete', (req, res) => {
  const toDeleteItem = req.body.check;
  const listName = req.body.listName;
  console.log(req.body);
  if (listName === 'Today') {
    currentUser.mainList = currentUser.mainList.filter((e) => {
      return e._id != toDeleteItem;
    });
    currentUser.save();
    res.redirect('/home');
  } else {
    currentUser.lists.forEach((e) => {
      if (e.name === listName) {
        e.items = e.items.filter((element) => {
          return element._id != toDeleteItem;
        });
      }
    });
    currentUser.save();
    console.log(currentUser.lists);
    res.redirect('/home/' + listName);
  }
});

app.post('/create', (req, res) => {
  res.redirect('/home/' + req.body.newListName);
});

app.post('/deletelist', (req, res) => {
  currentUser.lists = currentUser.lists.filter((e) => {
    return e.name != req.body.listName;
  });
  currentUser.save();
  res.redirect('/home');
});

app.get('/home/:customListName', (req, res) => {
  const custom_list_name = req.params.customListName;
  let showList;
  const list = new List({
    name: custom_list_name,
    items: defaultItems,
  });
  let k = 0;
  currentUser.lists.forEach((e) => {
    if (e.name === custom_list_name) {
      k++;
      showList = e.items;
    }
  });

  if (k === 0) {
    //create a new list
    currentUser.lists.push(list);
    res.redirect('/home/' + custom_list_name);
  } else {
    //render

    res.render('list', {
      name: currentUser.name,
      listTitle: custom_list_name,
      finalList: showList,
      user: currentUser,
    });
  }
});

app.post('/logout', (req, res) => {
  currentUser = undefined;
  res.redirect('/');
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}
app.listen(port, () => {
  console.log('server has started');
});
