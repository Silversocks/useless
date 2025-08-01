const router=require("express");
routerr=router();

function randomnum(){
    for(let i=6;i>0;i--){
        if((Math.floor(Math.random()*6)%i)==0){
            console.log("success");
            break;
        }
        else{
            console.log("failed")
        }
    }
    console.log("finished all operations\n\n")
}

var count=6;

routerr.post("/hello/:hash",(req,res)=>{
    if((Math.floor(Math.random()*6))%count==0){
        // resto of the code here, ig
        count=6
    }
    else{
        count--;
    }
});
