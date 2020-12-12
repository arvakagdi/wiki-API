//require modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();   // create instance

app.set('view engine', 'ejs');   //setting view engine to use ejs
app.use(bodyParser.urlencoded({extended: true}))  //use body parser to parse our request
app.use(express.static("public"));    // use public directry to store our static files ex. css files

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser:true});   //setup connection to mongoDB location

const articleSchema = mongoose.Schema({  //create Schema
    title: String,
    content: String
})

const Article = mongoose.model("Article",articleSchema)   //create Model


// -------- When a client makes a GET request -------//
app.get("/articles", function(req,res){
    Article.find({},function(err,foundArticles){
        if(!err){
            res.send(foundArticles);
        }else{
            res.send(err);
        }
    });
});


// -------- When a client makes a POST request -------//
app.post("/articles", function (req,res) {    // data sent to localhost:3000/articles through postman 

    const newArticle = new Article({    // save the sent data to dabase
        title : req.body.title,
        content: req.body.content
    })
    newArticle.save(function(err){        // in save add a callback function to know if data was saved successfully or not 
        if (!err){
            res.send("Article added successfully!");
        }
        else{
            res.send(err);
        }
    });
});


// -------- When a client makes a DELETE request -------//
app.delete("/articles",function(req,res){
    Article.deleteMany(function(err){             // delete everything from the collection
        if (!err){
            res.send("Articles successfully deleted");
        }
        else{
            res.send(err);
        }
    })
});


app.listen(3000,function(){
    console.log("Server is running on port 3000!");
})