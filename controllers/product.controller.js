
require('dotenv').config()

    
    const Shopify = require('shopify-api-node');

    const shopify = new Shopify({
      shopName:'itgdev',
  
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      
    });

// Create product endpoint
exports.createProduct=async (req,res) => {
 
    console.log("_______________________________1");
    const createProduct = async () => {
      const productData = { 
        title: 'New Product',
        body_html: '<strong>Good product!</strong>',
        vendor: 'Your Vendor',
        product_type: 'T-Shirt',
        tags: 'Red, Cotton',
        variants: [
          {
            option1: 'Small',
            price: '19.99',
            sku: '123'
          },
          {
            option1: 'Medium',
            price: '19.99',
            sku: '124'
          }
        ]
      };
    
      try {
        const product = await shopify.product.create(productData);
        console.log('Product created:', product);
        res.json({product:product})
      } catch (error) {
        console.error('Error creating product:', error);
        res.json({error:error})
      }
    };
    
    createProduct();
    
 

}



exports.productList=async (req,res) => {
    


  
      try {
        const product = await shopify.product.list({ limit: 10 });
        // console.log('Product list:', product);
        res.json({product:product})
      } catch (error) {
        console.error('Error  product list:', error);
        res.json({error:error})
      }
    };

    exports.totalProductCount=async (req,res)=>{
       try {
        const count =await shopify.product.count()
        res.json({totalProducts:count})
       } catch (error) {
        res.json({error:error})
       }
    }










exports.productByID=async (req,res) => {
    


  
      try {
        const product = await shopify.product.get(req.params.id);
        // console.log('Product :', product);
        res.json({product:product})
      } catch (error) {
        console.error('Error  product:', error);
        res.json({error:error})
      }
    };
    



exports.updateProduct=async (req,res) => {

const updatedData = {
    title: 'Updated Bedsheet Title',
    body_html: '<strong>this product was upadated by the product update api </strong>',
    vendor: 'New Vendor',
    product_type: 'New Type',
    tags: 'Updated, Tags',
    variants: [
      {
        id: 48577253507355, 
        price: '102201',
        sku: 'new_sku_123'
      }
     
    ]
  };
  
      try {
        const product = await shopify.product.update(req.params.id,updatedData)
        console.log('Product :', product);
        res.json({product:product})
      } catch (error) {
        console.error('Error  product:', error);
        res.json({error:error})
      }
    };
    
exports.deleteProduct=async (req,res)=>{
try {
   
    const deletedPrduct=await shopify.product.delete(req.params.id)
    res.json({deleted:deletedPrduct})
    
} catch (error) {
    res.json({error:error})
}

}
    



    





















