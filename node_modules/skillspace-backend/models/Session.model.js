import mongoose from 'mongoose';
import SwapRequest from './Swap.model';

const sessionSchema = new mongoose.Schema({
swap:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true,
},
teacher:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
learner: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},

},{timestamps: true});



const Session = mongoose.model('Session', sessionSchema);
export default Session;