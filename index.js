const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port =process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6znnq0v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('dosofy').collection('services');
        const reviewCollection = client.db('dosofy').collection('reviews');

        //service api
        app.get('/services',async(req,res)=>{
           const query = {} //for get all data
           const cursor = serviceCollection.find(query);
           const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/servicehome',async(req,res)=>{
            const query = {} //for get all data
            const cursor = serviceCollection.find(query).limit(3);
            const servicehome = await cursor.toArray();
             res.send(servicehome);
         })

        //for get service data by specific id
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)

        })

        // service post api
        app.post('/services',async(req,res)=>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        //review api
        // app.get('/reviews',async(req,res)=>{
        //     let query = {} //for get all data
        //     if(req.query.service_id){
        //         query = {
        //             service_id: req.query.service_id
        //         }
        //     }
        //     const cursor = reviewCollection.find(query).sort({lastModified:-1});

        //     const reviews = await cursor.toArray();
           
        //      res.send(reviews);
        //  })

         app.get('/reviews',async(req,res)=>{
            console.log(req.query)
            let query = {} //for get all data
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            if(req.query.service_id){
                        query = {
                            service_id: req.query.service_id
                        }
                    }
            const cursor = reviewCollection.find(query).sort({lastModified:1});

            const reviews = await cursor.toArray();
           
             res.send(reviews);
         })


        // app.get('/reviews/:id',async(req,res)=>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)} //for get all data
           
            // if(req.query.service_id){
            //     query = {
            //         service_id: req.query._id
            //     }
                 

            // }

        //     const review =await reviewCollection.findOne(query);
        //     console.log(review);
        //      res.send(review);
        //  })

        //review post api
        app.post('/reviews',async(req,res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.delete('/reviews/:id',  async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result= await reviewCollection.deleteOne(query)
            res.send(result)
        })
    
    }
    finally{

    }

}
run().catch(err=>console.log(err));

app.get('/',(req,res)=>{
    res.send('doctor service review server is running');
})

app.listen(port,()=>{
    console.log(`server running on  ${port}`);
})