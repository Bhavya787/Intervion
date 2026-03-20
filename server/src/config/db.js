import mongoose from "mongoose";
import dns from "dns";

// The ultimate fix: This forces Node.js to use Google's Public DNS instead of your computer's proxy, 
// completely bypassing whatever Antivirus/VPN is returning the ECONNREFUSED error during SRV lookup.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error("🌐 This is a network/DNS issue. Check your internet connection and firewall.");
    }
    process.exit(1);
  }
};

export default connectDB;