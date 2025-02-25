const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes"); // Import routes
const apiRoutes = require("./routes/api"); // Import routes
const uploadRoutes = require("./routes/uploadRoutes");
const lpuRoutes = require("./routes/lpuRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRoutes = require("./routes/eventRoutes");
const app = express();
const port = 3000;

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "resources", "views")); // EJS views folder

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: "miawmiaw",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies (optional)
app.use(express.urlencoded({ extended: true }));

// Use routes from the authRoutes file
app.use("/", authRoutes);
app.use("/api", apiRoutes);

app.use("/upload", uploadRoutes);
app.use("/lpu", lpuRoutes);
app.use("/admin", adminRoutes);
app.use("/events", eventRoutes);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
