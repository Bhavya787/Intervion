import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sampleCodingQuestions } from '../data/sampleQuestions.js';
import CodingQuestion from '../models/CodingQuestion.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // Clear existing questions
    await CodingQuestion.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    const insertedQuestions = await CodingQuestion.insertMany(sampleCodingQuestions);
    console.log(`Successfully inserted ${insertedQuestions.length} questions`);

    // Display inserted questions
    console.log('\nInserted questions:');
    insertedQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.title} (${q.difficulty}) - ${q.topic}`);
    });

    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding script
seedDatabase();