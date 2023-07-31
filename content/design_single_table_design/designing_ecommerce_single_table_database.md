# Designing Single Table to Store Data required for the API

When designing an E-commerce API, it's important to choose a database design that is both simple and efficient. One approach is to use a single table design, which stores all data related to a particular entity in a single table.

For example, in an E-commerce API, you can store all the data related to orders in a single table. This includes information such as the order ID, customer ID, product ID, order status, and order date.

The benefits of using a single table design for an E-commerce API are numerous. First, it simplifies the database design and enables faster queries. Because all data related to a particular entity is stored in a single table, queries can be executed more quickly and with less complexity than they would be in a traditional multi-table design.

Second, it can be more efficient in terms of storage space. Because each table in a database requires some overhead to manage its structure, storing all data related to a particular entity in a single table can reduce the overall storage requirements of the database.

## Entities involved

- Product
- Cart
- Order


## Single Table Database Design in DynamoDB

In DynamoDB, a single table design can be used to store all data related to products, users, carts, and orders. To achieve this, a composite primary key can be used with a partition key and a sort key. The partition key will be the `type` attribute, which indicates the type of entity (product, user, cart, or order). The sort key will be the `id` attribute, which is a unique identifier for each entity.

### Product Table
Here is a single table database design for an E-commerce API product entity in DynamoDB:



| Partition Key | Sort Key | Attributes |
| --- | --- | --- |
| PRODUCT | PRODUCT#productId | productId, category, tags, created_at, updated_at, description, name, package, price, images |
#### Primary key
In DynamoDB, the `primary key` is a combination of a partition key and an optional sort key that uniquely identifies each item in a table. The partition key is used to partition data across multiple nodes in a DynamoDB table, while the sort key is used to sort items with the same partition key value. Together, the partition key and sort key form the unique identifier for each item in the table.
#### Partition Key (pk)
The `partition key` is a primary key attribute that is used to partition data across multiple nodes in a DynamoDB table.

#### Sort Key (sk)
The `sort key` is a primary key attribute in a DynamoDB table that determines the order of items with the same partition key value. When you query a DynamoDB table, you can specify a range of values for the sort key to retrieve a subset of items with the same partition key value.

The `productId`, `category`, `tags`, `created_at`, `updated_at`, `description`, `name`, `package`, `price` and `pictures` attributes can be used to store the data related to products.

### Cart Table
Here is a single table database design for an E-commerce API Cart entity in DynamoDB:

| Partition Key | Sort Key | Attributes |
| --- | --- | --- |
| USER#userId | PRODUCT#productId | productId, cartProductStatus, quantity, userId, addedOn, updatedOn

The `productId`, `cartProductStatus`, `quantity`, `userId`, `status`, `addedOn` and `updatedOn` can be used to store data related to `Products in Cart` added by a user


### Orders Table
Here is a single table database design for an E-commerce API Order entity in DynamoDB:

| Partition Key | Sort Key | GSI1PK | GSI1SK | Attributes |
| --- | --- | --- | --- | --- |
| ORDER | ORDER#orderId | USER#userId | ORDER#orderId | orderId, userId, orderStatus, orderedOn

The `orderId`, `userId`, `orderStatus` and `orderedOn` is used to store data related to user `orders`.  

#### Global Secondary Index (GSI)

`Global Secondary Index (GSI)` is an index with a partition key and a sort key that can be different from those on the base table. A GSI enables querying of data in a table by attributes other than the table's primary key.

When you create a GSI, you specify the partition key and sort key for the index. The partition key of the GSI is used to partition the data across multiple nodes in the same way as the base table. The sort key of the GSI is used to sort the data within each partition.

Queries on a GSI are similar to queries on a table's primary key. The query can be performed using the partition key and sort key of the GSI. With GSI, it is possible to query for data using attributes that are not in the base table's primary key.

A single DynamoDB table can have multiple(upto 20) GSIs. Global Secondary Indexes are useful for optimizing the performance of queries on non-key attributes. By creating a GSI, you can speed up queries that would otherwise require scanning the entire table.

## Complete Table for the E-Commerce API


| Partition Key | Sort Key | GSI1PK | GSI1SK | Attributes |
| --- | --- | --- | --- | --- |
| type | id | type or null | id or null |name, quantity, addedOn, description, productId, cartProductStatus, updateOn, category, tags, pictures, price, pakage orderId, userId, orderStatus, orderedOn, 


By using a single table design with a `composite primary key` (pk + sk) and `GSIs` in DynamoDB, this database can simplify the database design and enable faster queries. It also enables automatic scaling and can handle large amounts of data with low latency.