const express=require("express");
const gmail=require("./gmailapi.js");
const random=require("./randomnum.js")
const sherlock=require("./sherlock.js");
const id=require("./identifiers.js")
const scrapeProfiles=require("./scrapeprof.js")

const app=express()
port=3000;

app.use(express.json());


app.post("/click",gmail,id,sherlock, scrapeProfiles, (req, res,next) => {
    
});

app.listen(port,console.log(`listening at ${port}`))