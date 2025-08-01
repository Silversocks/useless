const express=require("express");
const gmail=require("./gmailapi.js");
const random=require("./randomnum.js")

const app=express()
port=3000;

app.use(express.json());

app.post("/click",(req,res,next)=>{

})

app.listen(port,console.log(`listening at ${port}`))