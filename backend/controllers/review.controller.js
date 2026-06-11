import Review from '../models/Review.model.js'
import Booking from '../models/Booking.model.js';



//POST /api/reviews
export const createReview = async(req, res)=>{
    try{
        const{bookingId, rating, comment}=req.body;
        const reviewerId = req.user._id;

        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({message: 'Session booking not found'});
        }
        const isTeacher = booking.teacher.toString()===reviewerId.toString();
        const revieweeId = isTeacher? booking.learner: booking.teacher;

        const alreadyReviewed = await Review.findOne({booking: bookingId, reviewer: reviewerId});
        if(alreadyReviewed){
            return res.status(400).json({ message: 'You have already reviewed this session' });
        }

        const review= await Review.create({
            booking:bookingId,
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating: Number(rating),comment,
        });
        res.status(201).json(review);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};


//get al reviews received by a specific user profile
//GET /api/reviews/user/:userId
export const getUserReviews = async(req,res) => {
    try{
        const reviews = await Review.find({reviewee: req.params.userId})
                        .populate('reviewer', 'name')
                        .sort({createdAr: -1});

            res.json(reviews);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};
