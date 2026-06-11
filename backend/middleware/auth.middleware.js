import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async(req,res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1]; //extract token from bearer string
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-passwordHash');//fetch user, excluding the password field
            return next();
        }catch(err){
            console.log('Token verification failed:',err.message);
            return res.status(401).json({message:'Not authorized, token invalid or expired'});
        }
    }

    if(!token){
        return res.status(401).jsonS({message:'Not authorized'});
    }
};