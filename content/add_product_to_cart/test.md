# Deployment

Firstly, Let's deploy the application.

```
npm run dev
```
This command runs and deploys our application and provides the endpoint url.

# Add Product to Cart.

Still in postman, change the path to `/cart/add`.

Request method is `POST`

Request body is:

```json
{
        "userId": "test@test1.gm",
        "productId": "33c90fbc-18a8-4192-b3d6-f4a6a1c70e8c",
        "quantity": 5,
        "cartProductStatus": "PENDING"
}
```

1. **Postman test**

![](/assets/add_to_cart.png)




# List User's Cart Items 

Let's list user's cart by providing the user id.

Still in postman, change the path to `/cart/test@gmail.com`

`test@gmail.com` is the id of the user.


Request method is `GET`

There isn't any request body

1. **Postman test**

![](/assets/list_cart_items.png)

2. **SST Console**

