const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://nguyenduong111:1234@cluster0.aywscy6.mongodb.net/?retryWrites=true&w=majority")
.then(()=>console.log("db connection successfull"))
.catch((err)=>console.log("db error: ", err))

