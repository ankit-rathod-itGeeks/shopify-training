require('@shopify/shopify-api/adapters/node');
const { shopifyApi, LATEST_API_VERSION, Session, Shopify, DataType } = require('@shopify/shopify-api')
const { restResources } = require('@shopify/shopify-api/rest/admin/2023-01')
const express = require('express');
const router = require('./routes');
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// const debug = process.env.FUNCTIONS_EMULATOR === 'true'
require('dotenv').config();
app.use('/product', router)
const shopify = shopifyApi({
    apiKey: process.env.API_KEY,
    apiSecretKey: process.env.API_SECRET,
    apiVersion: LATEST_API_VERSION,
    isPrivateApp: true,
    scopes: [
        'read_customers',
        'write_customers',
        'read_fulfillments',
        'write_fulfillments',
        'read_inventory',
        'write_inventory',
        'write_order_edits',
        'read_order_edits',
        'write_orders',
        'read_orders',
        'write_products',
        'read_products',
    ],
    isEmbeddedApp: false,
    hostName: 'itgdev.myshopify.com' || '127.0.0.1:8000',
    // Mount REST resources.
    //   restResources,
})


const session = {
    shop: "itgdev.myshopify.com",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN
}



const client = new shopify.clients.Rest({ session: session });
const graphClient = new shopify.clients.Graphql({ session: session })



app.get('/getSingleCustomer/:id', async (req, res) => {

    const id = req.params.id
    const customer = await client.get({
        path: `customers/${id}`,
        session: session,

    });
    //   console.log(customer);
    res.json({ customer: customer })

})


app.delete('/deleteCustomer/:id', async (req, res) => {
    const id = req.params.id
    const graphclient = new shopify.clients.Graphql({ session });
    const data = await graphclient.query({
        data: {
            "query": `mutation customerDelete($id: ID!) {
          customerDelete(input: {id: $id}) {
            shop {
              id
            }
            userErrors {
              field
              message
            }
            deletedCustomerId
          }
        }`,
            "variables": {
                "id": `gid://shopify/Customer/${id}`
            },
        },
    });

    console.log("done");
    res.json({ res: data })

})


app.get('/getCustomers', async (req, res) => {
    const response = await client.get({
        path: 'customers'
    });
    // console.log("------------------------", response.body.customers[0]);
    res.json(response.body.customers);




    // const graphClient = new shopify.clients.Graphql({ session });

    // const data = await graphClient.query({
    //   data: {
    //     query: `query {
    //       customers(first: 50) {
    //         edges {
    //           node {
    //             id
    //             firstName
    //             lastName
    //             email                            
    //             metafields(first: 3) {            / 
    //               edges {                             /
    //                 node {///////////////////////////////
    //                   id                              
    //                   namespace               
    //                   key
    //                   value
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }`,
    //   },
    // });

    // // Handle response and errors
    // if (data.body.errors) {
    //   console.error("Errors fetching customers:", data.body.errors);
    // } else {
    //   const customers = data.body.data.customers.edges.map(edge => edge.node);
    // //   console.log("Customers retrieved successfully:", data.body.data.customers);
    //   res.json({customers:customers})
    // }


    // console.log(response);



})
app.put('/updateCustomer/:id', async (req, res) => {



    const id = req.params.id;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;
    const phone = req.body.phone;


    const query = `
    mutation updateCustomer($id: ID!, $firstName: String, $lastName: String, $email: String, $phone: String) {
      customerUpdate(input: {
        id: $id,
        firstName: $firstName,
        lastName: $lastName,
        email: $email,
        phone: $phone
      }) {
        customer {
          id
          firstName
          lastName
          email
          phone
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const variables = {
        id: `gid://shopify/Customer/${id}`,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
    };

    try {
        const response = await graphClient.query({ data: { query, variables }, session });
        const { customerUpdate } = response.body.data;

        if (customerUpdate.userErrors.length > 0) {
            console.error(customerUpdate.userErrors);

        } else {
            // console.log("Customer updated successfully:", customerUpdate.customer);

            res.json({ response: customerUpdate })
        }
    } catch (error) {
        console.error("GraphQL Error:", error);

    }



})

app.put('/setDefaultAddress', async (req, res) => {


    try {

        const { body: { addresses } } = await client.get({
            path: `customers/${req.body.customer_id}/addresses`,
        });
        // console.log(addresses);

        for (const address of addresses) {
            if (address.id !== req.body.id) {
                await client.put({
                    path: `customers/${req.body.customer_id}/addresses/${address.id}`,
                    data: { address: { id: address.id, default: false } },
                    type: DataType.JSON
                    // type: Shopify.Types.DataType.JSON,
                });
            }
        }

        // Set the desired address as default
        await client.put({
            path: `customers/${req.body.customer_id}/addresses/${req.body.id}`,
            data: { address: { id: req.body.id, default: true } },
            type: DataType.JSON,
        });

        console.log('Default address updated successfully');
        res.json({ message: "defult address added successfully" })
    } catch (error) {
        console.error('Error updating default address:', error);
        res.json({ message: " error in defult address", error })
    }
}



)


app.get('/getOrders', async (req, res) => {
    
    const response = await client.get({
        path: 'orders'
    });
    console.log(response);
    res.json(response.body.orders[0]);


})






app.post('/createCustomer', async (req, res) => {
    console.log(req.body);
    const customerData = {
        customer: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            addresses: [{
                address1: req.body.address1,
                city: req.body.city,

                country: req.body.country,
                zip: req.body.zip
            }]
        }
    };

    try {
        const response = await client.post({
            path: 'customers',
            data: customerData,
            type: 'application/json'
        });
        // console.log("Customer created:", response.body.customer);
        res.status(201).json(response.body.customer);
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Failed to create customer" });
    }
});


app.post('/addCustomersNewAddress/:id', async (req, res) => {
    const addNewAddress = {
        customer_id: 207119551,
        address1: "1 Rue des Carrieres",
        address2: "Suite 1234",
        city: "Montreal",
        company: "Fancy Co.",
        first_name: "Samuel",
        last_name: "de Champlain",
        phone: "819-555-5555",
        province: "Quebec",
        country: "Canada",
        zip: "G1R 4P5",
        name: "Samuel de Champlain",
        province_code: "QC",
        country_code: "CA",
        country_name: "Canada",
    }

    const customer_address = await client.post({
        path: `customers/${req.params.id}/addresses`,
        data: { address: addNewAddress },
    });

    console.log(customer_address);
})


app.post('/updateAddress', async (req, res) => {

    const updatedAddress = {
        zip: "0000000",
        company: "company from update address",
        address1: "Gandhinagar",
        city: "Gandhinagar",
        country: "India",
        phone: "6666666666",
    }

    const updateCustomerAddress = async () => {
        try {
            // Retrieve the existing address
            const address = await client.get({
                path: `customers/${req.body.customer_id}/addresses/${req.body.id}`,
            });
            // console.log("------------retrieved address ---------------",address);

            // Update the address properties
            const updatedAddressData = {
                ...address.body.address, // Retain existing address data
                ...updatedAddress, // Apply updates
            };

            // Save the updated address
            const newAddress = await client.put({
                path: `customers/${req.body.customer_id}/addresses/${req.body.id}`,
                data: { address: updatedAddressData },

            });

            console.log('Address updated successfully----------', newAddress);
        } catch (error) {
            console.error('Error updating address:', error);
        }
    };




    updateCustomerAddress();

})
















const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




module.exports = { shopify, session, client, graphClient } 