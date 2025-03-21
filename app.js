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
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const faqRoutes = require("./routes/faqRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bcardRoutes = require("./routes/bcardContentRoutes");
const bcardBgRoutes = require("./routes/bcardBgRoutes");
const vuforiaRouter = require("./routes/vuforiaRoutes");

// Catches synchronous errors
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down application...");
  console.log(err);
  process.exit(1);
});

const { AxiosHeaders } = require("axios");
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
app.use("/events", eventRoutes);

app.use("/arcms/api/v1/vuforia", vuforiaRouter);
app.use("/arcms/api/v1/admin", adminRoutes);
app.use("/arcms/api/v1/auth", authRoutes);
app.use("/arcms/api/v1/employees", employeeRoutes);
app.use("/arcms/api/v1/departments", departmentRoutes);
app.use("/arcms/api/v1/achievements", achievementRoutes);
app.use("/arcms/api/v1/faqs", faqRoutes);
app.use("/arcms/api/v1/organizations", organizationRoutes);
app.use("/arcms/api/v1/contacts", contactRoutes);
app.use("/arcms/api/v1/schedule", scheduleRoutes);
app.use("/arcms/api/v1/bcardContents", bcardRoutes);
app.use("/arcms/api/v1/bcardBg", bcardBgRoutes);
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// SAFETY NET
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down application...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
