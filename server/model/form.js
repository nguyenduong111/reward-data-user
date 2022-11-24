const mongoose = require("mongoose")
const validator = require("validator")

const formSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"],
        minlength:[3,"min 3 letter"]
    },
    address:{
        type:String,
    },
    reject: {
        type: Number,
    },
    accept: {
        type: Number,
    },
    listSign: [
        {
            admin: {type: String},
            sign: {type: String}
        }
    ],
    photo:{
        data:Buffer,
        contentType:String,
    },
})

module.exports = (mongoose.model("User",formSchema))