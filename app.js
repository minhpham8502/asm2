const express = require('express');
const engines = require('consolidate');
const app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhpham852000:Quangminh2000@cluster0.46ara.mongodb.net/test";

app.get('/product',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('allProduct',{model:results});
})

app.post('/doSearch',async (req,res)=>{
    let inputName = req.body.txtName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    let results =await dbo.collection("Product").find({name: new RegExp(inputName,'i')}).toArray();
    res.render('allProduct',{model:results});
})

app.get('/insert',(req,res)=>{
    res.render('insert');
})
app.get('/insert',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    let results = await dbo.collection("Product").find({}).toArray();
    res.render('product');
})

app.post('/doInsert',async (req,res)=>{
    let inputIdproduct = req.body.txtIdproduct;
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputAmount= req.body.txtAmount;
    let newProduct= {idproduct: inputIdproduct, name : inputName, price :inputPrice, amount: inputAmount};

    if(inputIdproduct.trim().length ==0){
        let modelError1={IdproductError:"Please input Id"};
        res.render('insert',{model:modelError1}); 

    }else if(inputName.trim().length ==0){
        let modelError2={nameError:"Please input Name"};
        res.render('insert',{model:modelError2});    

    }else if(inputPrice.trim().length ==0){
        let modelError3={priceError:"Please input Price"};
        res.render('insert',{model:modelError3});

    }else if(inputAmount.trim().length ==0){
        let modelError4={madeinError:"Please input Made in"};
        res.render('insert',{model:modelError4})    
    }
    else
    {
        let client= await MongoClient.connect(url);
        let dbo = client.db("asmDB");
        await dbo.collection("Product").insertOne(newProduct);
        res.redirect('/product');
    }
})

app.get('/delete',async (req,res)=>{
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    var ObjectID = require('mongodb').ObjectID;
    let results = await dbo.collection("Product").find({}).toArray();
    let condition = {"_id" : ObjectID(inputId)};
    await dbo.collection("Product").deleteOne(condition);
    res.redirect('/product');    
})

app.get('/update',async function(req,res){
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    let results = await dbo.collection("Product").find(condition).toArray();
    res.render('update',{model:results});
})

app.post('/doupdate',async (req,res)=>{
    let inputId = req.body.txtId;
    let inputIdproduct = req.body.txtIdproduct;
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputAmount = req.body.txtAmount;
    
    var ObjectID = require('mongodb').ObjectID;
    let condition ={ _id : ObjectID(inputId)};
    let Change ={$set : {idproduct: inputIdproduct,name: inputName , price: inputPrice , amount: inputAmount}};
    let client = await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    await dbo.collection("Product").updateOne(condition,Change);
    res.redirect('/product');
})

const PORT = process.env.PORT || 5000;
var server=app.listen(PORT,function() {});

