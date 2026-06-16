import SwapRequest from "../models/Swap.model.js";

export const createSwapRequest = async(req, res) => {
    try{
        const{receiver, offeredSkill, wantedSkill, sessionsEach, message} = req.body;
        const sender = req.user._id;

        if(sender.toString() === receiver){
            return res.status(400).json({message: 'You cannot propose a swap to yourself'});
        }

        const swapRequest = await SwapRequest.create({
            sender, 
            receiver,
            offeredSkill,
            wantedSkill,
            sessionsEach,
            message,
        });
        res.status(201).json({swapRequest});
    }catch(err){
        return res.status(500).json({message: err.message});
    }
};







//accept or reject
export const respondToSwapRequest = async(req,res) => {
    try{
        const{status} = req.body;

        if(!['Accepted', 'Rejected'].includes(status)){
            return res.status(400).json({message:'Invalid response status'});
        }
        const swap = await SwapRequest.findById(req.params.id);
        if(!swap){
            return res.status(404).json({message:'Swap request not found'});
        }
        if(swap.receiver.toString() !== req.user._id.toString()){
            return res.status(403).json({message:' Not authorized to respond to this request'});
        }

        swap.status = status;
        await swap.save();
        res.json(swap);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};


export const getMySwaps = async(req,res) => {
    try{

        //find swaps when the authenticated user is either receiver or sender
        const swaps = await SwapRequest.find({
            $or: [{sender: req.user._id}, {receiver: req.user._id}],
        })
        .populate('sender', 'name email basic')
        .populate('receiver', 'name email basic')
        .sort({createdAt: -1});
    }catch(err){
        res.status(500).json({message:err.message});
    }
};