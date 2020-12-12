//require modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();   // create instance

app.set('view engine', 'ejs');   //setting view engine to use ejs
app.use(bodyParser.urlencoded({extended: true}))  //use body parser to parse our request
app.use(express.static("public"));    // use public directry to store our static files ex. css files

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser:true,  useUnifiedTopology: true});   //setup connection to mongoDB location

const articleSchema = mongoose.Schema({  //create Schema
    title: String,
    content: String
})

const Article = mongoose.model("Article",articleSchema)   //create Model


// *******--- Below are requests made by client on an entire collection which includes GET, POST, DELETE ---*******//
// Refactoring the code to use chain route handler using express to remove redunduncy and typos

app.route("/articles")
    // -------- When a client makes a GET request -------//
    .get(function(req,res){
        Article.find({},function(err,foundArticles){
            if(!err){
                res.send(foundArticles);
            }else{
                res.send(err);
            }
        });
    })

    // -------- When a client makes a POST request -------//
    .post(function (req,res) {    // data sent to localhost:3000/articles through postman 

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
    })

    // -------- When a client makes a DELETE request -------//
    .delete(function(req,res){
        Article.deleteMany(function(err){             // delete everything from the collection
            if (!err){
                res.send("Articles successfully deleted");
            }
            else{
                res.send(err);
            }
        })
    });



// *******--- Below are requests made by client to a specific data from a collection including GET, PUT, PATCH, DELETE ---*******//

// Quick Note: to search for articles(data) containing space add %20 instead of space in the url
app.route("/articles/:articleName")  // route handler    

    // GET request
    .get(function(req,res){
        const name =  req.params.articleName;
        Article.findOne({title:name}, function(err,articleFound){
            if(articleFound){
                res.send(articleFound)
            }else{
                res.send("No items matching this name found!");
            }
        });         
    })   

    // PUT request - used to update a data with new data
    // put request replaces an entire resource, so if earlier we had 2 items in the data and we replace it with one, our new entry will only have one item
    .put(function(req,res){
        const name = req.params.articleName

        Article.updateOne(
            {title : name},     // which article to update
            {title : req.body.title, content: req.body.content},     // new updates
            {overwrite : true},    //specifying this is necessary when using mongoose
            function(err){
                if(!err){
                    res.send("Successfuly updated!");
                }else{
                    res.send("Couldn't update. Please check the name and try again!");
                }
            }
        )
    }) 

    // PATCH request - used to update a data and will replace old entries with new entries and if for any field is not provided it will keep the old one
    // patch request does'nt replace an entire resource, it will update a part/entire resource depending on fields provided by the client

    .patch(function(req,res){
        const name = req.params.articleName

        Article.updateOne(
            {title: name},   //which item (condition)
            // we use req.body as parser will return a JSON file with fiels to be modified, so the set flaf will have to set only those fields
            {$set: req.body},    
            function(err){
                if(!err){
                    res.send("Successfuly updated!");
                }else{
                    res.send("Couldn't update. Please check the name and try again!");
                }
            }
        );
    });

app.listen(3000,function(){
    console.log("Server is running on port 3000!");
})