import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Password for teachers, DOB for students (will be hashed)
  regno?: string; // For students
  department?: string; // For students and tests
  role: 'student' | 'teacher';
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // For teachers, this is their actual password. For students, this will be their DOB.
  regno: { type: String, unique: true, sparse: true }, // Unique only if present (for students)
  department: { type: String },
  role: { type: String, enum: ['student', 'teacher'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);