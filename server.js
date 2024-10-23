import { conn } from "./conn.js";
import express from "express";
export const app = express();
import { urlencoded } from "express";
import { join } from "path";
import bcrypt from "bcrypt"
import session from "express-session";

app.use(session({
  secret: 'your_secret_key', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const PORT = process.env.PORT || 3000;

// Middleware to parse URL-encoded bodies
app.use(urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static('public')); // Assuming your CSS is in a 'public' folder
app.use("/static", express.static("public"));
app.use("/static", express.static(join(process.cwd(), "public")));


app.get("/upload%20home", (req, res) => {
  
  res.sendFile(join(process.cwd(), "public", "upload.html"));
});


app.get("/home", (req, res) => {
const username = req.query.username || req.session.user; // Get username from query or session

  res.sendFile(join(process.cwd(), "public", "house.html"));
});

// Serve a simple HTML form
app.get("/create%20account", (req, res) => {
   res.sendFile(join(process.cwd(), "public", "createacc.html"));
});

// Handle form submission
app.post("/create%20account", async (req, res) => {
  const { name, gmail, pass, phone } = req.body;
  const hashedPassword = await bcrypt.hash(pass, 10);
  // Query to insert data into the database
  const sql = `INSERT INTO useracc (username, gmail, pass, phonenum) VALUES ('${name}', '${gmail}', '${hashedPassword}','${phone}')`;

  conn.query(sql,[name, gmail, pass, phone], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred"); // Send error response
    }

    // res.send("add Success"); // Send success response
    res.redirect(`/home?username=${encodeURIComponent(name)}`);
  });
});

app.get("/login", (req, res) => {
  res.send(`
        <form action="/login" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Log req.body to debug
  conn.query(
    "SELECT * FROM useracc WHERE username = ?",[username], async (error, results) => {
      if (error) throw error;
      // If no results found
      if (results.length === 0) {
        return res.send("Invalid username or password");
      }

      const result = results[0];
      
      // Compare the password with the stored hash
    try {
      // Compare the password with the stored hash
      const match = await bcrypt.compare(password, result.pass);
      console.log(match, result.pass,password);
      if (match) {
        req.session.user = username; // Ensure you have session middleware set up
        return res.redirect(`/home?username=${encodeURIComponent(username)}`); // Redirect with username as query param
      } else {
        return res.send("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("An error occurred while processing your request.");
    }
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/home`);
});
