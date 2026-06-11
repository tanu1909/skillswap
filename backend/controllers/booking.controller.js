import Booking from "../models/Booking.model.js";
import Review from '../models/Review.model.js';



//POST /api/bookings
export const createBooking = async (req, res) => {
    try{
        const {swapRequest, teacher, skillTitle, sessionDate, timeSlot} = req.body;
        const learner = req.user._id;

        const slotTaken = await Booking.findOne({teacher, sessionDate, timeSlot, timeSlot,status:'confirmed'});
        if(slotTaken){
            return res.status(400).json({message: 'This time slot has already been booked'});
        }

        const booking = await Booking.create({
            swapRequest,
            teacher,
            learner,
            skillTitle,
            sessionDate,
            timeSlot,
        });
        res.status(201).json(booking);
    }catch(err){
        res.status(500).json({message: err.message});
    }
}





//PUT /api/bookings/:id
export const updateBookingStatus = async(req, res)=> {
    try{
        const{status}= req.body;
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ message: 'Booking session not found' });
        }

        //only the involved teacher or learner can modify
        const isTeacher = booking.teacher.toString() === req.user._id.toString();
        const isLearner = booking.learner.toString() === req.user._id.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ message: 'Not authorized to change this booking' });
    } 

    booking.status = status;
    await booking.save();
    res.json(booking);

    }catch(err){
        res.status(500).json({ message: error.message });
    }
};






//GET /api/bookings/mine
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ teacher: req.user._id }, { learner: req.user._id }],
    })
      .populate('teacher', 'name email')
      .populate('learner', 'name email')
      .sort({ sessionDate: 1 });

    // Dynamically check if the user has already left a review for each booking
    const bookingsWithReviewStatus = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        if (booking.status === 'completed') {
          const reviewExists = await Review.findOne({
            booking: booking._id,
            reviewer: req.user._id,
          });
          bookingObj.hasReview = !!reviewExists;
        } else {
          bookingObj.hasReview = false;
        }
        
        return bookingObj;
      })
    );

    res.json(bookingsWithReviewStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};