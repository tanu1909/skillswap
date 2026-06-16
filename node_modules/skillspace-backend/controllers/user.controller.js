import User from '../models/User.model.js';
import mongoose from 'mongoose';


//  GET /api/users/search
export const searchUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      return res.status(400).json({ message: 'Skill query parameter is required' });
    }

    const currentUserId = req.user?._id 
      ? new mongoose.Types.ObjectId(req.user._id.toString()) 
      : null;

    const pipeline = [
      {
        $match: {
          'skillsOffered.skill': { $regex: skill, $options: 'i' }
        }
      }
    ];

   
    if (currentUserId) {
      pipeline[0].$match._id = { $ne: currentUserId };
    }

    // Add Lookup and Aggregation Fields
    pipeline.push(
      {
        $lookup: {
          from: 'reviews', 
          localField: '_id',
          foreignField: 'reviewee',
          as: 'receivedReviews'
        }
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: '$receivedReviews.rating' }, 0] }, // Prevents null values
          reviewCount: { $size: '$receivedReviews' }
        }
      },
     {
    $project: {
      _id: 1,
      name: 1,
      bio: 1,
      location: 1,
      skillsOffered: 1,
      skillsWanted: 1,
      availability: 1,
      averageRating: 1,
      reviewCount: 1,
      receivedReviewsData: {
        $map: {
          input: '$receivedReviews',
          as: 'r',
          in: {
            rating: '$$r.rating',
            comment: '$$r.comment'
          }
        }
    } 
  }
}
    );

    const users = await User.aggregate(pipeline);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.location = req.body.location !== undefined ? req.body.location : user.location;

    user.skillsOffered = req.body.skillsOffered || user.skillsOffered;
    user.skillsWanted = req.body.skillsWanted || user.skillsWanted;
    user.availability = req.body.availability || user.availability;

    const updatedUser = await user.save();

    // Hide password details from the response payload
    const plainUser = updatedUser.toObject();
    delete plainUser.passwordHash;

    res.json(plainUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};