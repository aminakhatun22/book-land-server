const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2logags.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//JWT

function verifyJWT(req, res, next) {


    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const productCategoryCollection = client.db('resaleMarket').collection('category')
        const productCollection = client.db('resaleMarket').collection('product')
        const bookingCollection = client.db('resaleMarket').collection('booking')
        const usersCollection = client.db('resaleMarket').collection('users')


        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        //verify Admin


        const verfyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        //category


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



        //product


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

        app.get('/myproduct', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = productCollection.find(query)
            const product = await cursor.toArray();
            res.send(product)
        })

        app.patch('/product/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await productCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)

            res.send(result);

        })




        //booking

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)

            res.send(result);

        })


        // seller 


        //all user

        app.get('/users', async (req, res) => {
            const query = {}
            const user = await usersCollection.find(query).toArray()
            res.send(user)
        })
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //user admin


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.put('/users/admin/:id', verifyJWT, verfyAdmin, async (req, res) => {

            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, option)
            res.send(result)
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

