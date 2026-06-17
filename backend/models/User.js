const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  securityQuestion: {
    type: String,
    trim: true
  },
  securityAnswer: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save hook: Hash password and security answer before saving to DB
userSchema.pre('save', async function () {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Hash security answer if modified (stored lowercase and trimmed)
  if (this.isModified('securityAnswer') && this.securityAnswer) {
    const salt = await bcrypt.genSalt(10);
    this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to compare security answer
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  if (!this.securityAnswer || !candidateAnswer) return false;
  return await bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);
