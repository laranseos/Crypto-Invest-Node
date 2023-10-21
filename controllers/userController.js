import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id, user.role);
    res.json({
      _id: user._id,
      username : user.username,
      email: user.email,
      mylink : user.mylink,
      balance : user.balance,
      role: user.role,
      avatar: user.avatar
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const checkAuth = asyncHandler(async (req, res) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userInfo = await User.findById(decoded.userId).select('-password');
      // console.log(userInfo);
      if(userInfo) {
      res.json({
        _id: userInfo._id,
        username : userInfo.username,
        email: userInfo.email,
        mylink : userInfo.mylink,
        balance : userInfo.balance,
        role: userInfo.role,
        avatar: userInfo.avatar
      });
    }

    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, code, password, referral_link, mylink } = req.body;

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
            username,
            email,
            password,
            mylink,
            referral_link,
          });

          if (user) {
            generateToken(res, user._id, user.role);

            res.status(201).json({
              _id: user._id,
              email: user.email,
              role: user.role,
            });
            res.status(201).json({ message: "Successfully Created."});

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
    user.username = req.body.username || user.username;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      if(await user.matchPassword(req.body.password)) {
        user.password = req.body.newPassword;
      } else  {
        res.status(404);
        throw new Error('Password is incorrect.');
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username : updatedUser.username,
      email: updatedUser.email,
      mylink : updatedUser.mylink,
      balance : updatedUser.balance,
      role: updatedUser.role,
      avatar: updatedUser.avatar
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
export {
  checkAuth,
  authUser,
  registerUser,
  logoutUser,
  mailHandler,
  getUserProfile,
  updateUserProfile,
};
