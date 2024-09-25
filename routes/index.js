const constrollers=require('../controllers/product.controller')
const variants=require('../controllers/varients.controller')
const express=require('express')
const router=express.Router()

router.post('/createProduct',constrollers.createProduct)
router.get('/productList',constrollers.productList)
router.get('/productByID/:id',constrollers.productByID)
router.put('/updateProduct/:id',constrollers.updateProduct)
router.delete('/deleteProduct/:id',constrollers.deleteProduct)
router.get('/totalProducts',constrollers.totalProductCount)


router.get('/productVarients/:id',variants.getProductVarients)
router.post('/createProductVariant/:id',variants.createProductVariant)
router.delete('/deletedProductVariant/:id',variants.deletedProductVariant)

module.exports=router




