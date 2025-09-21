import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.resolve(); // lấy root path
const MONGO_URI = process.env.MONGODB_CONNECTION_STRING;
if (!MONGO_URI) {
  console.error("❌ Missing MONGODB_CONNECTION_STRING in .env");
  process.exit(1);
}

const userSchema = new mongoose.Schema({}, { strict: false });
const hotelSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model("User", userSchema);
const Hotel = mongoose.model("Hotel", hotelSchema);

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // CHỈNH LẠI PATH: ra ngoài một cấp để tới thư mục data/
    const usersPath = path.join(__dirname, "data", "test-users.json");
    const hotelsPath = path.join(__dirname, "data", "test-hotel.json");

    const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
    const hotels = JSON.parse(fs.readFileSync(hotelsPath, "utf-8"));

    await User.deleteMany();
    await Hotel.deleteMany();

    await User.insertMany(users);
    await Hotel.insertMany(hotels);

    console.log(`✅ Seeded ${users.length} users and ${hotels.length} hotels`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

run();
