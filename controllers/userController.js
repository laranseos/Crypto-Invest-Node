import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer'
// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, code, password, referal_link } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
    return;
  } 


  console.log(process.env.VERIFICATION_CODE);
  if(code==process.env.VERIFICATION_CODE) {
        if((Date.now()-process.env.GENERATED_TIME)<process.env.VALID_DURATION){
            
          const user = await User.create({
            email,
            password,
            referal_link
          });

          if (user) {
            generateToken(res, user._id);

            res.status(201).json({
              _id: user._id,
              email: user.email,
              role: user.role,
            });
          } else {
            res.status(400);
            throw new Error('Invalid user data');
          }
        } else{
          res.status(400);
          throw new Error('Verification code is expired.');
        }
  } else{
        res.status(400);
        throw new Error('Verification code is incorrect.');
  }

});

const mailHandler = async (req, res) =>{
    const { email } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({message:"User already exists."})
    } else {
    //   const transporter=nodemailer.createTransport({
    //     //host: 'smtp.gmail.com',
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //        user: 'klaus237192@gmail.com', // your email address
    //        pass: 'ucybtcwnpnlqvidw' // your email password
    //     },
    //     //tls: {rejectUnauthorized: false},
    //     service:'gmail'
    //  })

     process.env.VERIFICATION_CODE=Math.floor(100000+Math.random()*900000);
     process.env.GENERATED_TIME=Date.now();
     res.status(200).json({message:'sent'});
     console.log(process.env.VERIFICATION_CODE);
      
    //  const mailOptions={
    //     from:'klaus237192@gmail.com',
    //     to:email,
    //     subject:`Your verification code is ${process.env.VERIFICATION_CODE}`,
    //     text:"code",
    //     html:`<h1>Verify your email address</h1>
    //           <hr><h3><p>Please enter this 6-digit code to access our platform.</p></h3>
    //           <h2>${process.env.VERIFICATION_CODE}</h2><h3><p>This code is valid for 2 minutes.</p></h3>`
    //  }
    //  await transporter.sendMail(mailOptions,(err,info)=>{
    //     if(err){
    //        console.log(err)
    //        res.status(500).json({success:false,message:"Internal Server Error"})
    //     }else{
    //        res.status(200).json({success:true,message:"Email sent successfully"})
    //     }
    //  });

  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
export {
  authUser,
  registerUser,
  logoutUser,
  mailHandler,
  getUserProfile,
  updateUserProfile,
};
