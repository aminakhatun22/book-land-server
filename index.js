const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bookingCollection = client.db('resaleMarket').collection('booking')
        const usersCollection = client.db('resaleMarket').collection('users')

        app.get('/category', async (req, res) => {
            const query = {}
            const cursor = productCategoryCollection.find(query)
            const category = await cursor.toArray()
            res.send(category);
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) }
            const product = await productCollection.findOne(query)

            res.send(product);

        })

        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products);
        })

        app.post('/product', async (req, res) => {

            const products = req.body;
            const result = await productCollection.insertOne(products)

            res.send(result);

        })
        // app.get('/product/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const product = await productCollection.findOne(query)

        //     res.send(product);
        // })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)

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

