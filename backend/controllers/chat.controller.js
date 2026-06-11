import Message from "../models/Message.model.js";

//get msg logs from a specific pair of users
//GET /api/chat/:counterpartId

export const getChatHistory = async(req, res) => {
    try{
        const userId = req.user._id.toString();
        const counterpartId = req.params.counterpartId;

        //generate unique room id by sorting IDs alphabetically
        const chatRoomId = [userId, counterpartId].sort().join('_');
        const messages = await Message.find({chatRoomId})
                        .sort({createdAt: 1})
                        .populate('sender', 'name')
                        .populate('receiver', 'name');

        res.json(messages);
    }catch(err){
        res.status(500).json({message : err.message});
    }
};