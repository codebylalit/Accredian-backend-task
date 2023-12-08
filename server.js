const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;


// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lalitsql',
  database: 'my_login_app',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello, this is the root path!');
});

app.post('/api/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }
  // Implement login logic
  db.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [usernameOrEmail, usernameOrEmail],
    async (err, results) => {
      if (err) {
        console.error('Error executing login query:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          const user = results[0];
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            res.json({ message: 'Login successful' });

          } else {
            res.status(401).json({ message: 'Invalid credentials' });
          }
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    }
  );
});


app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err, results) => {
        if (err) {
          console.error('Error executing signup query:', err);
          res.status(500).json({ message: 'Internal Server Error' });
        } else {
          res.json({ message: 'Signup successful' });
        }
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
