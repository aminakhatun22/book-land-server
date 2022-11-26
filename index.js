const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
// const { MongoClient, ServerApiVersion} = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2logags.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const productCategoryCollection = client.db('resaleMarket').collection('category')
        const productCollection = client.db('resaleMarket').collection('product')

        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = productCategoryCollection.find(query)
            const category = await cursor.toArray()
            res.send(category);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { Category_Id: Category_Id(id) }
            const product = await productCollection.findOne(query)

            res.send(product);

        })

        app.post('/product', async (req, res) => {

            const products = req.body;
            const result = await productCollection.insertOne(products)

            res.send(result);

        })
    }
    finally {

    }
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Resale Market ')
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
});

