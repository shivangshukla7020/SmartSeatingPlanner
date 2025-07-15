import mongoose from 'mongoose';
const Student = require('../models/CSVStudents');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Student.collection.createIndex({ id: 1 });
    console.log('✅ Index created on Student.id');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating index:', err);
    process.exit(1);
  }
})();
