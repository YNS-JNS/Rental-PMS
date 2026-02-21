import { Request, Response } from 'express';
import { Booking } from '../bookings/booking.model';

/**
 * Cleaning Controller
 * Endpoints for the Cleaner role to view and update cleaning tasks.
 */
export const CleaningController = {
  /**
   * GET /api/tasks/cleaning
   * Get all bookings that need cleaning:
   * - endDate is today or in the past
   * - cleaningStatus is PENDING
   * - status is not CANCELLED
   */
  getTasks: async (req: Request, res: Response) => {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const tasks = await Booking.find({
        endDate: { $lte: today },
        cleaningStatus: 'PENDING',
        status: { $ne: 'CANCELLED' },
      })
        .populate('apartment', 'name address')
        .select('apartment endDate cleaningStatus status')
        .sort({ endDate: -1 });

      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch cleaning tasks' });
    }
  },

  /**
   * PUT /api/tasks/cleaning/:bookingId
   * Mark a booking's apartment as clean.
   */
  markAsClean: async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { cleaningStatus: 'CLEAN' },
        { new: true },
      ).populate('apartment', 'name address');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      res.status(200).json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update cleaning status' });
    }
  },
};
