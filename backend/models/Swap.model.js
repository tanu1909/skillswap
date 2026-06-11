import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
offeredSkill:{
    type: String,
    required: true,
},
wantedSkill:{
    type:String,
    required: true
},
sessionsEach:{
    type: Number,
    required:true
},
status:{
    type:String,
    enum:['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
},
message:{
    type:String,
    default:' ',
}

},{timestamps: true});



const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;