
require('dotenv').config()


const Shopify = require('shopify-api-node');
// const { client } = require('..');

const shopify = new Shopify({
    shopName: 'itgdev',

    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,

});

exports.getProductVarients = async (req, res) => {

    try {
        const response = (await shopify.product.get(req.params.id)).variants;
        // console.log(response);
        res.json({ message: response })
    } catch (error) {
        console.log(error);
        res.json({ message: error })
    }


}
exports.createProductVariant = async (req, res) => {

  try {
    const variantData = {
        option1: '1',   // New unique color
        option2: '1',     // New unique fabric
        price: '19.99',     // Set your price
        sku: 'SKU127',      // Ensure this SKU is unique
        // Add any other fields you need
    };

    const newVariant = await shopify.productVariant.create(req.params.id, variantData);
    console.log('New Variant Created:', newVariant);
    res.json({newVariant:newVariant})
  } catch (error) {
    console.log(error.response.body);
  }
    
}
exports.deletedProductVariant=async (req,res)=>{
  try {
    const deletedProductVariant  = await shopify.productVariant.delete(req.params.id,49426817646875)
    res.json({deletedProductVariant:deletedProductVariant})
  } catch (error) {
    res.json({error:error})
    
  }
}