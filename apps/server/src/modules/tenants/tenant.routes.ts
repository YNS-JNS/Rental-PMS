import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware';
import { UserRole } from '@rental/shared';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant (client) management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *           description: Tenant's first name
 *         lastName:
 *           type: string
 *           description: Tenant's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Tenant's email address
 *         phone:
 *           type: string
 *           description: Tenant's phone number
 *         cinPassport:
 *           type: string
 *           description: Tenant's CIN or Passport number
 *         notes:
 *           type: string
 *           description: Additional notes about the tenant
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the tenant is active
 */

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), TenantController.findAll);

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: The tenant data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), TenantController.findOne);

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tenant'
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), TenantController.create);

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tenant'
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Tenant not found
 *       409:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), TenantController.update);

/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tenant ID
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *       404:
 *         description: Tenant not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN), TenantController.delete);

export default router;
