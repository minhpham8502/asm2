const express = require('express');
const engines = require('consolidate');
const app = express();


const session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'somesecret', 
    cookie: { maxAge: 60000 }}));

var bodyParser = require("body-parser");
const { EDESTADDRREQ } = require('constants');
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

//npm i handlebars consolidate --save
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhpham852000:Quangminh2000@cluster0.46ara.mongodb.net/test";
//localhost:3000/student
app.get('/product',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    let results = await dbo.collection("Product").find({}).toArray();
    // doc session
    res.render('allProduct',{model:results,ss:req.session.User});
})

//user submit form
app.post('/doSearch',async (req,res)=>{
    let inputName = req.body.txtName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asmDB");
    // let results = await dbo.collection("Student").find({name:inputName}).toArray();
    // res.render('allStudent',{model:results});

    // let results =await dbo.collection("Student").find({name: new RegExp(inputName)}).toArray();
    // res.render('allStudent',{model:results});

    // kiem tra gan dung k phan biet chu hoa chu thuong
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
    // doc session
    res.render('product');
})

app.post('/doInsert',async (req,res)=>{
    let inputID = req.body.txtID
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputMadein= req.body.txtMadein;
    let newProduct= {id: inputID, name : inputName, price :inputPrice, Madein: inputMadein};

    if(inputName.trim().length ==0){
        let modelError1={nameError:"ten k de trang"};
        res.render('insert',{model:modelError1}); 
    }else if(inputID.trim().length ==0){
        let modelError2={IDError:"ID k hop le"};
        res.render('insert',{model:modelError2});     
    }else if(inputPrice.trim().length ==0){
        let modelError3={priceError:"ID k hop le"};
        res.render('insert',{model:modelError3});
    }else if(inputMadein.trim().length ==0){
        let modelError4={madeinError:"ID k hop le"};
        res.render('insert',{model:modelError4})    
     } else
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

//npm install express-session
app.get('/login',(req,res)=>{
    res.render('login');
})
app.post('/dologin',(req,res)=>{
    let name =req.body.txtName;
    let pass =req.body.txtPass;
    //tao session
    req.session.User ={
        website: 'mywebsite.com',
        user:name,
        pass:pass
    }
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


app.post('/doUpdate',async (req,res)=>{
    let inputId = req.body.txtId;
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputMadein = req.body.txtMadein;
    

    var ObjectID = require('mongodb').ObjectID;
    let condition ={ _id : ObjectID(inputId)};
    let Change ={$set : {id: inputId, name: inputName , price: inputPrice , Madein: inputMadein}};
    let client = await MongoClient.connect(url);
    let dbo = client.db("asmBD");
    await dbo.collection("Product").updateOne(condition,Change);
    res.redirect('/product');
})

const PORT = process.env.PORT || 5000;
var server=app.listen(PORT,function() {});

