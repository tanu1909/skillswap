import Booking from "../models/Booking.model.js";
import Review from '../models/Review.model.js';
import { google } from 'googleapis';

const getGoogleRedirectUri = () => {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/auth/google/callback`;
  }
  return undefined;
};

const validateGoogleConfig = () => {
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    .filter((key) => !process.env[key]);

  if (!getGoogleRedirectUri()) missing.push('GOOGLE_REDIRECT_URI or BACKEND_URL');
  if (missing.length) {
    throw new Error(`Missing Google Calendar configuration: ${missing.join(', ')}`);
  }
};

const parseTimeLabel = (timeLabel) => {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time slot format: ${timeLabel}`);

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
};

const buildCalendarDateTime = (sessionDate, timeSlot, part) => {
  const [startLabel, endLabel] = timeSlot.split('-').map((value) => value.trim());
  const selectedLabel = part === 'end' ? endLabel : startLabel;
  if (!selectedLabel) throw new Error(`Invalid time slot format: ${timeSlot}`);

  const date = new Date(sessionDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const { hours, minutes } = parseTimeLabel(selectedLabel);

  return `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

// 🟢 GOOGLE CALENDAR ENGINE PIPELINE
export const createGoogleCalendarEvent = async (booking, teacherTokens) => {
  validateGoogleConfig();

  const frontendUrl = process.env.FRONTEND_URL || "https://skillswap-frontend-9tok-kappa.vercel.app";
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri()
  );

  // Authenticate using the teacher's saved refresh token credentials
  oauth2Client.setCredentials({ refresh_token: teacherTokens });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const eventPayload = {
    summary: `SkillSwap: ${booking.skillTitle}`,
    description: `Your live peer-to-peer learning session is confirmed! Join your custom classroom here: ${frontendUrl}/room/${booking._id}`,
    start: {
      dateTime: buildCalendarDateTime(booking.sessionDate, booking.timeSlot, 'start'),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: buildCalendarDateTime(booking.sessionDate, booking.timeSlot, 'end'),
      timeZone: 'Asia/Kolkata',
    },
    attendees: [
      { email: booking.teacher.email },
      { email: booking.learner.email },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 30 },
      ],
    },
  };

  // Insert event and automatically send invitation emails to both attendees
  await calendar.events.insert({
    calendarId: 'primary',
    resource: eventPayload,
    sendUpdates: 'all', 
  });
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { swapRequest, teacher, skillTitle, sessionDate, timeSlot } = req.body;
    const learner = req.user._id;

    const slotTaken = await Booking.findOne({ teacher, sessionDate, timeSlot, status: 'confirmed' });
    if (slotTaken) {
      return res.status(400).json({ message: 'This time slot has already been booked' });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking session not found' });
    }

    // Only the involved teacher or learner can modify
    const isTeacher = booking.teacher.toString() === req.user._id.toString();
    const isLearner = booking.learner.toString() === req.user._id.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ message: 'Not authorized to change this booking' });
    } 

    booking.status = status;
    await booking.save();

    // ==========================================
    // 🟢 INTEGRATED STEP 5: AUTOMATED INVITATION TRIGGER
    // ==========================================
    let calendarSyncWarning = '';

    if (status === 'confirmed') {
      // Re-query and populate full user objects to safely harvest emails and tokens
      const fullBooking = await Booking.findById(booking._id).populate('teacher learner');
      
      if (fullBooking.teacher.googleTokens?.refreshToken) {
        try {
          await createGoogleCalendarEvent(
            fullBooking, 
            fullBooking.teacher.googleTokens.refreshToken
          );
        } catch (apiErr) {
          // Log calendar errors gracefully without crashing the whole HTTP response thread
          console.error("Google Calendar failed to inject event invitation:", apiErr.message);
          calendarSyncWarning = `Session confirmed, but Google Calendar could not sync: ${apiErr.message}`;
        }
      } else {
        calendarSyncWarning = 'Session confirmed, but Google Calendar was not synced. The teacher must connect Google Calendar first.';
      }
    }
    // ==========================================

    const responseBody = booking.toObject();
    if (calendarSyncWarning) responseBody.calendarSyncWarning = calendarSyncWarning;

    res.json(responseBody);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/mine
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
