// seed.esm.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// ----- dirname (ESM) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- đường dẫn data (nằm ở thư mục cha của backend) -----
const usersPath = path.join(__dirname, "..", "data", "test-users.json");
const hotelsPath = path.join(__dirname, "..", "data", "test-hotel.json");

// ----- lấy Mongo URI linh hoạt -----
const MONGO_URI =
  process.env.MONGODB_CONNECTION_STRING ||
  process.env.MONGO_URI ||
  process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error(
    "❌ Thiếu MONGODB_CONNECTION_STRING / MONGO_URI / MONGO_URL trong .env"
  );
  process.exit(1);
}

// ----- Models “thoáng” để seed nhanh -----
const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
const Hotel = mongoose.model(
  "Hotel",
  new mongoose.Schema({}, { strict: false })
);

// ---------- Helpers ----------
function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Không parse được JSON từ: ${filePath}`);
    throw e;
  }
}

// Nhận về một mảng dù JSON là array, object bọc (users/hotels/data),
// hay 1 object đơn lẻ.
function ensureArray(json, guessKeys = []) {
  if (Array.isArray(json)) return json;
  for (const k of guessKeys) {
    if (json && Array.isArray(json[k])) return json[k];
  }
  if (json && Array.isArray(json.data)) return json.data;

  // nếu là object đơn → bọc thành mảng 1 phần tử
  if (json && typeof json === "object") return [json];
  return [];
}

// Chuẩn hoá Mongo Extended JSON đệ quy:
//  - { $oid: "..." }       -> ObjectId
//  - { $numberInt: "..." } -> Number
//  - { $numberLong: "..." } / { $numberDouble: "..." } -> Number
//  - { $date: "..."/{ $numberLong:"..." } } -> Date
function normalizeExtended(value) {
  if (Array.isArray(value)) return value.map(normalizeExtended);

  if (value && typeof value === "object") {
    // ObjectId
    if (Object.keys(value).length === 1 && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    // Numbers
    if (Object.keys(value).length === 1 && value.$numberInt !== undefined) {
      return Number(value.$numberInt);
    }
    if (Object.keys(value).length === 1 && value.$numberLong !== undefined) {
      return Number(value.$numberLong);
    }
    if (Object.keys(value).length === 1 && value.$numberDouble !== undefined) {
      return Number(value.$numberDouble);
    }
    // Date
    if (value.$date !== undefined) {
      const v = value.$date;
      if (typeof v === "string" || typeof v === "number") return new Date(v);
      if (v && typeof v === "object" && v.$numberLong !== undefined)
        return new Date(Number(v.$numberLong));
    }

    // object thường → duyệt field
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeExtended(v);
    }
    return out;
  }
  return value;
}

// Bỏ _id để Mongo tự tạo. (Nếu muốn giữ id cũ, xem chú thích phía dưới)
function stripIdAndNormalize(arr) {
  return arr.map((doc) => {
    const d = normalizeExtended(doc || {});
    // xoá _id (đã normalize rồi, nhưng ta bỏ để tránh trùng/validation)
    if (d && Object.prototype.hasOwnProperty.call(d, "_id")) {
      delete d._id;
    }
    return d;
  });
}

// ---------- Main ----------
async function run() {
  try {
    console.log("usersPath:", usersPath);
    console.log("hotelsPath:", hotelsPath);

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const usersJson = readJson(usersPath);
    const hotelsJson = readJson(hotelsPath);

    // nhận mảng bất kể cấu trúc
    const rawUsers = ensureArray(usersJson, ["users", "user"]);
    const rawHotels = ensureArray(hotelsJson, [
      "hotels",
      "hotel",
      "properties",
    ]);

    if (!rawUsers.length && !rawHotels.length) {
      console.warn(
        "⚠️ Không tìm thấy dữ liệu trong 2 file JSON. Kiểm tra lại nội dung."
      );
    }

    const users = stripIdAndNormalize(rawUsers);
    const hotels = stripIdAndNormalize(rawHotels);

    const delUsers = await User.deleteMany();
    const delHotels = await Hotel.deleteMany();
    console.log(
      `🧹 Đã xoá: users=${delUsers.deletedCount}, hotels=${delHotels.deletedCount}`
    );

    const insUsers = users.length ? await User.insertMany(users) : [];
    const insHotels = hotels.length ? await Hotel.insertMany(hotels) : [];
    console.log(
      `✅ Seeded: users=${insUsers.length}, hotels=${insHotels.length}`
    );

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

run();

// ---------- Giữ nguyên _id cũ? ----------
// Nếu muốn GIỮ _id (thay vì xoá), đổi stripIdAndNormalize()
// thành:  return arr.map(doc => normalizeExtended(doc));
