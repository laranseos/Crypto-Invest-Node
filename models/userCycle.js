import mongoose from 'mongoose';

const userCycle = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    cycle : {
      type: Number,
      default: 0,
    },
    done : {
      type: Boolean,
      default: false,
    },
 
  },
  {
    timestamps: true,
  }
);


const User = mongoose.model('User', userCycle);

export default User;
