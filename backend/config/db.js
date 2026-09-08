import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always reliably loaded before accessing process.env.MONGO_URI
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const configureDns = () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (dnsErr) {
    console.warn('DNS server configuration warning:', dnsErr.message);
  }
};

configureDns();

// Safely format and URL-encode credentials if special characters exist in username or password
const getFormattedMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  const protoMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!protoMatch) return rawUri;

  const protocol = protoMatch[1];
  const remainder = protoMatch[2];

  const lastAtIndex = remainder.lastIndexOf('@');
  if (lastAtIndex === -1) {
    return rawUri;
  }

  const userInfo = remainder.substring(0, lastAtIndex);
  const hostAndRest = remainder.substring(lastAtIndex + 1);

  const firstColonIndex = userInfo.indexOf(':');
  if (firstColonIndex === -1) {
    const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
    return protocol + encodeURIComponent(safeDecode(userInfo)) + '@' + hostAndRest;
  }

  const rawUser = userInfo.substring(0, firstColonIndex);
  const rawPass = userInfo.substring(firstColonIndex + 1);

  const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  const user = encodeURIComponent(safeDecode(rawUser));
  const pass = encodeURIComponent(safeDecode(rawPass));

  return protocol + user + ':' + pass + '@' + hostAndRest;
};

// Safe error sanitizer so passwords are never exposed or printed in logs
const sanitizeErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return '';
  return msg.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

// Extract username safely for diagnostic feedback without exposing password
const extractUsername = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return '';
  const match = rawUri.match(/mongodb(?:\+srv)?:\/\/([^:]+):/);
  return match ? decodeURIComponent(match[1]) : '';
};

// MongoDB connection lifecycle event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established successfully');
});

mongoose.connection.on('error', (err) => {
  const safeMsg = sanitizeErrorMessage(err.message);
  console.error(`MongoDB runtime error: ${safeMsg}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

const connectDB = async () => {
  configureDns();

  const rawUri = process.env.MONGO_URI;

  if (!rawUri) {
    console.error('MongoDB Error: MONGO_URI is not defined in your .env file.');
    return;
  }

  const formattedUri = getFormattedMongoUri(rawUri);
  const username = extractUsername(rawUri);

  try {
    const conn = await mongoose.connect(formattedUri, {
      serverSelectionTimeoutMS: 5000,
      authSource: 'admin',
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    const safeMsg = sanitizeErrorMessage(error.message);
    const isAuthError = safeMsg.toLowerCase().includes('bad auth') || safeMsg.toLowerCase().includes('authentication failed');

    if (isAuthError) {
      console.error(`MongoDB Authentication Error: Authentication failed for user "${username}".`);
      console.error('Please check your credentials in MongoDB Atlas:');
      console.error('  1. Open MongoDB Atlas -> Security -> Database Access.');
      console.error(`  2. Ensure a database user named "${username}" exists with read/write privileges.`);
      console.error('  3. If needed, click "Edit" -> "Edit Password" to set a new password.');
      console.error('  4. Update MONGO_URI in your .env file with the matching password (server will auto-restart).');
    } else {
      console.error(`MongoDB Connection Error: ${safeMsg}`);
      // Only schedule retry for temporary network / connection issues
      setTimeout(connectDB, 15000);
    }
  }
};

export default connectDB;
