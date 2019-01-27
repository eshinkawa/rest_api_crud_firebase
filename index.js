const express = require('express');
const app = express();

const Firebase = require('firebase');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, DELETE, GET');
  res.header('Access-Control-Max-Age', '3600');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
  );
  next();
});

Firebase.initializeApp({
  apiKey: 'YOUR-API-KEY-HERE',
  authDomain: 'your-domain.firebaseapp.com',
  databaseURL: 'https://your-db.firebaseio.com',
  projectId: 'your-projId',
  storageBucket: 'your-storage',
  messagingSenderId: 'your-id',
});

const db = Firebase.database();
const usersRef = db.ref('users');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

/* get users */

app.get('/api/user', (req, res) => {
  usersRef.once('value', snapshot => {
    if (snapshot.val() == null) {
      res.json({ message: 'Error: No user found', result: false });
    } else {
      res.json({ message: 'successfully fetch data', result: true, data: snapshot.val() });
    }
  });
});

/* User create */

app.post('/api/user', (req, res) => {
  const data = req.body;

  usersRef.push(data, err => {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: 'Success: User Save.', result: true });
    }
  });
});

/* Update user  */

app.put('/api/user/:id', (req, res) => {
  const uid = req.params.id;
  const data = req.body;

  usersRef.child(uid).update(data, err => {
    if (err) {
      res.send(err);
    } else {
      usersRef.child('uid').once('value', snapshot => {
        res.json({ message: 'successfully update data', result: true, data: snapshot.val() });
      });
    }
  });
});

/* delete user */

app.delete('/api/user/:id', (req, res) => {
  const uid = req.params.id;

  usersRef.child(uid).remove(err => {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: 'Success: User deleted.', result: true });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Running port is ${PORT}`);
});
