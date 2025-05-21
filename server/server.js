const express = require('express');
const app = express();
const { Pool } = require('pg');
//const { Resend } = require('resend');
const port = 8080; 

const env = require("./env.json");
const crypto = require('crypto');

const cors = require('cors');
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions)); 
app.use(express.json());  

const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
  });

//api entry point

app.get("/api", (req, res) =>{
    res.json({fruits: ["apple", "banana", "orange"]})
});


// need to check database to see if user exists and password is correct 
app.post("/api-login", (req, res) => {
    const {username, password} = req.body;
    console.log("Received user data:", { username, password });
  
    // Simple check
    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    
    const text = "SELECT * FROM users WHERE username = $1 AND password_hash = $2";
    const params = [username, password];

    console.log("Executing query:", text, params);

    pool.query(text, params)
        .then(result => {
            if (result.rows.length > 0) {
                console.log("User found:", result.rows[0]);
                res.status(200).json({ response: ["ok"] });
            } else {
                console.log("User not found");
                res.status(401).json({ error: "Invalid username or password" });
            }
        })
        .catch(err => {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal server error" });
        });
  
});

app.post("/api-create", async (req, res) => {
  const { email, username, password } = req.body;
  console.log("----- create ===== Received user data:", { email, username, password });

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const check = "SELECT 1 FROM users WHERE username = $1";
    const checkParams = [username];
    const checkResult = await pool.query(check, checkParams);

    if (checkResult.rowCount !== 0) {
      console.log("user already exists"); 
      return res.status(500).json({ error: "User already exists" });
    }

    const text = "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING user_id";
    const params = [email, username, password];
    const result = await pool.query(text, params);

    const user_id = result.rows[0].user_id;
    const verificationToken = crypto.randomBytes(32).toString('hex');

    /*const status = await insertIntoVerify(user_id, verificationToken);

    if (status) {
      let verify = `http://localhost:8080/verify?token=${verificationToken}`;
      await sendUserVerificationEmail(email, verify);

      res.status(200).json({
        response: ["ok"],
      });
    } else {
      res.status(500).json({ error: "Verification DB error" });
    } */

  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api-wine-list", (req, res) => {
  let queryVal = `
    SELECT *
    FROM wine
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 10;
  `;

  pool.query(queryVal)
    .then(result => {
      res.status(200).json({ wines: result.rows });
    })
    .catch(err => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: "Internal server error" });
    });
});


//get user cellar
app.get("/api-user-cellar", (req, res) => {
  const username = req.query.username;
  const params = [username];

  const userQuery = `
    SELECT user_id 
    FROM users
    WHERE username = $1
  `;

  pool.query(userQuery, params)
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user_id = result.rows[0].user_id;
      const cellarQuery = `
        SELECT wine.*, rating.value AS user_rating, rating.description
        FROM cellar
        JOIN wine ON wine.wine_id = cellar.wine_id
        LEFT JOIN rating ON rating.rating_id = cellar.rating_id
        WHERE cellar.user_id = $1
      `;

      return pool.query(cellarQuery, [user_id]);
    })
    .then(cellarResult => {
      res.status(200).json({ cellar: cellarResult.rows });
    })
    .catch(err => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: "Internal server error" });
    });
});

//removing wine from cellar
app.post("/api-remove", (req, res) => {
  const {username, wine_id} = req.body;
  getUserId(username)
  .then(user_id => {
    if(!user_id){
      return res.status(404).json({ error: "User not found" });
    }
    const call = `DELETE FROM cellar WHERE user_id = $1 AND wine_id = $2`;
    const params = [user_id, wine_id];
    pool.query(call, params)
    .then(result => {
      if (result.rowCount === 0) {
      res.status(404).json({ error: "No matching entry found." });
    } else {
      res.status(200).json({ message: "Wine removed from cellar." });
    }
  }).catch(err => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: "Internal server error" });
    });
  });
});

//update wine rating
app.post("/api-update-rating", async (req, res) => {
  const { username, wine_id, rating, text } = req.body;

  try {
    const user_id = await getUserId(username);
    if (!user_id) {
      return res.status(404).json({ error: "User not found" });
    }

    const rating_id = await getRatingId(user_id, wine_id);
    if (!rating_id) {
      return res.status(404).json({ error: "Wine not in cellar" });
    }

    const updateQuery = `
      UPDATE rating 
      SET value = $1, description = $2 
      WHERE rating_id = $3
    `;
    await pool.query(updateQuery, [rating, text, rating_id]);

    return res.status(200).json({ message: "Rating updated successfully." });

  } catch (err) {
    console.error("Error updating rating:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get food pairings for a wine
app.get("/api/food-pairings/:wine_id", async (req, res) => {
  const { wine_id } = req.params;
  try {
    const query = `
      SELECT *
      FROM food_pairing
      WHERE wine_id = $1
    `;
    const result = await pool.query(query, [wine_id]);
    // Return as array of strings
    const pairings = result.rows.map(row => row.name);
    res.status(200).json({ pairings });
  } catch (err) {
    console.error("Error fetching food pairings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get vineyard info by vineyard_id
app.get("/api/vineyard/:vineyard_id", async (req, res) => {
  const { vineyard_id } = req.params;
  console.log("vineyard_id", vineyard_id);
  try {
    const query = `
      SELECT *
      FROM vineyard
      WHERE vineyard_id = $1
    `;
    const result = await pool.query(query, [vineyard_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vineyard not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching vineyard info:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//I should update the cellar function to include this abstraction
async function getUserId(username) {
  const userQuery = `
    SELECT user_id 
    FROM users
    WHERE username = $1
  `;

  try {
    const result = await pool.query(userQuery, [username]);
    return result.rows.length > 0 ? result.rows[0].user_id : null;
  } catch (err) {
    console.error("Error fetching user_id:", err);
    throw err; // optional: rethrow or handle as needed
  }
}

async function getRatingId(user_id, wine_id){
  const ratingQuery = `SELECT rating_id FROM cellar WHERE user_id = $1 AND wine_id =$2`;
  try{
    const result = await pool.query(ratingQuery, [user_id, wine_id]);
    return result.rows.length > 0 ? result.rows[0].rating_id : null;
  }catch (err) {
    console.error("Error fetching user_id:", err);
    throw err; // optional: rethrow or handle as needed
  }
}


app.listen(port, () =>{
    console.log("Server started on port 8080");
});