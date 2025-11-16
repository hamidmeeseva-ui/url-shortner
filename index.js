const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const axios = require("axios");
require('dotenv').config()


const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectToMongoDB(process.env.MONGODB)
  .then(() => console.log("MongoDB connected"));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// HOME ROUTE (shows form)
app.get("/", (req, res) => {
  res.render("home");
});

// Route that handles POST / for generating short URL
app.use("/", urlRoute);

// CUSTOM DOWNLOAD ROUTE
app.get("/", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOne({ shortId });
    if (!entry) return res.status(404).send("Invalid Short URL");

    try {
        const response = await axios.get(entry.redirectURL, { responseType: "stream" });
        res.setHeader("Content-Disposition", "attachment; filename=file.pdf");
        response.data.pipe(res);
    } catch (err) {
        res.status(500).send("Failed to download file");
    }
});

// Server start
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
