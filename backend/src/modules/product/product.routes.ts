import { Router } from 'express';
import * as productController from './product.controller';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema } from './product.validation';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Browse available products (public)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of available products }
 */
router.get('/', asyncHandler(productController.browse));

/**
 * @openapi
 * /api/products/mine:
 *   get:
 *     summary: List the authenticated farmer's own products (any status)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Farmer's products }
 */
router.get('/mine', authenticate, authorize('FARMER'), asyncHandler(productController.mine));

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by id (public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product detail }
 *       404: { description: Product not found }
 */
router.get('/:id', asyncHandler(productController.getById));

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product (farmer only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 *       403: { description: Farmer role required }
 */
router.post(
  '/',
  authenticate,
  authorize('FARMER'),
  validate(createProductSchema),
  asyncHandler(productController.create),
);

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product owned by the authenticated farmer
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product updated }
 *       403: { description: Not the product owner }
 *       404: { description: Product not found }
 */
router.patch(
  '/:id',
  authenticate,
  authorize('FARMER'),
  validate(updateProductSchema),
  asyncHandler(productController.update),
);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete (or archive, if it has existing orders) a product owned by the authenticated farmer
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted or archived }
 *       403: { description: Not the product owner }
 *       404: { description: Product not found }
 */
router.delete('/:id', authenticate, authorize('FARMER'), asyncHandler(productController.remove));

export default router;
