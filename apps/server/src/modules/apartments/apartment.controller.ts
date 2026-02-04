import { Request, Response } from 'express';
import { ApartmentService } from './apartment.service';

export class ApartmentController {
  
  // POST /api/apartments
  static async create(req: Request, res: Response) {
    try {
      // Note: Validation is handled by Zod Middleware (we will add it in routes)
      const apartment = await ApartmentService.create(req.body);
      res.status(201).json(apartment);
    } catch (error) {
      res.status(500).json({ message: 'Error creating apartment', error });
    }
  }

  // GET /api/apartments
  static async findAll(req: Request, res: Response) {
    try {
      const apartments = await ApartmentService.findAll();
      res.status(200).json(apartments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching apartments', error });
    }
  }

  // GET /api/apartments/:id
  static async findOne(req: Request, res: Response) {
    try {
      const apartment = await ApartmentService.findById(req.params.id);
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }
      res.status(200).json(apartment);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching apartment', error });
    }
  }

  // PUT /api/apartments/:id
  static async update(req: Request, res: Response) {
    try {
      const apartment = await ApartmentService.update(req.params.id, req.body);
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }
      res.status(200).json(apartment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating apartment', error });
    }
  }

  // DELETE /api/apartments/:id
  static async delete(req: Request, res: Response) {
    try {
      const apartment = await ApartmentService.delete(req.params.id);
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
      }
      res.status(200).json({ message: 'Apartment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting apartment', error });
    }
  }
}