const express = require('express');
const { getAllProducts,
     createProduct,
    updateProduct,
    deleteProduct,
    getProductsDetails,
    createProductReview,
    getProductReviews,
     deleteReviews, 
     getAllProductsAdmin
        } = require('../controllers/productController');
const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/products').get(getAllProducts)
router.route('/admin/products').get(isAuthenticatedUser,authorizeRoles('admin'),getAllProductsAdmin,)

router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles("admin"), createProduct)

router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRoles("admin"),deleteProduct)

router.route('/product/:id').get(getProductsDetails)

router.route('/review').put(isAuthenticatedUser,createProductReview)

router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser,deleteReviews)

module.exports = router