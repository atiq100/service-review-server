const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port =process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6znnq0v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'}) 
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'}) 
        }
        req.decoded = decoded;
        next()
    })
}

async function run(){
    try{
        const serviceCollection = client.db('dosofy').collection('services');
        const reviewCollection = client.db('dosofy').collection('reviews');

        app.post('/jwt',(req,res)=>{
            const user = req.body;
            //console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            res.send({token})
        })

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

       

         app.get('/reviews',verifyJWT,async(req,res)=>{
            const decoded = req.decoded;
            //console.log(decoded);
            if(decoded.email !== req.query.email){
                res.status(401).send({message: 'unauthorized access'})
            }
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


        
        //review post api
        app.post('/reviews',verifyJWT,async(req,res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const review = await reviewCollection.findOne(query)
            res.send(review)
        })
        //update
        app.patch('/reviews/:id',  async(req,res)=>{
            const id =req.params.id;
            const review = req.body
            const query = {_id: ObjectId(id)}
            const option = {upsert:true};

            const updatedComment = {
                $set:{
                    comment:review.comment,
                    

                }
            }
            const result = await reviewCollection.updateOne(query,updatedComment,option);
            res.send(result)

        })
        

        app.delete('/reviews/:id',verifyJWT,  async(req,res)=>{
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