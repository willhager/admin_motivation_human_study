import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGO_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Missing MONGO_URI environment variable');
}

export function getClientPromise() {
  if (!clientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}