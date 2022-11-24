const express = require('express')
const cors = require("cors")

require("./conn/db")
const app = express()

const port = 9000;

const formRoutes = require('./routes/form')


//middleware
app.use(cors())
app.use(formRoutes)


app.listen(port,()=>{
    console.log(`App is running at port no ${port}`)
})