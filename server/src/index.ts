import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const app = express();

app.get('/', (req, res) => {
    res.send('hi');
})

app.listen(8080, () => {
    console.log("Listening on port 8080")
})