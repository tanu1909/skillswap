import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateTokens.js";


export const registerUser = async(req, res) => {
    try{
        const{name,email,password} = req.body;

        //validation check
        if(!name || !email || !password){
            return res.status(400).json({message:'Please fill in all fields'});
        }

        //check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: 'Email already exits, try a different email address'})
        }

        //hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //create user profile with empty defaults for skills
        const user = await User.create({
            name,
            email,
            passwordHash,
            skillsOffered: [],
            skillsWanted:[],
            availability:[],
        });

        //respond with user data and jwt token
        if(user){
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }else{
            res.status(400).json({message:'Invalid user data'})
        }
    }catch(err){
        res.status(400).json({message:err.message});
    }
};





export const loginUser = async(req,res) => {
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email});

        if(user && (await bcrypt.compare(password, user.passwordHash))){
            res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                token: generateToken(user._id),
            });
        }else{
            res.status(401).json({message: 'Invalid email or password'});
        }
    }catch(err){
        res.status(500).json({messaage: err.message});
    }
};