var express = require('express');
var router = express.Router();
const authUser = require('../middleware/auth')

const productController = require('../controller/productController')

router.get('/shop-men',  productController.menProduct)
router.get('/wishlist', productController.wishlist)
router.get('/:id',  productController.productSingle)



















module.exports = router;