const express = require("express");
require("dotenv").config();
const { UserModel } = require("../Model/UserModel");
const { StylerModel } = require("../Model/StylerModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs=require("fs");
const { AppointmentModel } = require("../Model/AppointmentModel");
const { BlockUserModel } = require("../Model/BlockUserModel");
const statusemail = require("../config/statusemail");
const AdminRouter = express.Router();
const app = express()
app.use(express.json())


// ************ALL REGISTER USER***************

AdminRouter.get("/allusers", async (req, res) => {
    let search=req.query
    let data = await UserModel.find(search)
    res.send(data);
});
//******Block user*********/
AdminRouter.get("/Block/",async(req,res)=>{
let data=req.body;
let Blockuser=new BlockUserModel(data);
await Blockuser.save();
res.status(200).send({msg:"user has been blocked"});
})
// ************REGISTER ADMIN***************

AdminRouter.post("/register", async (req, res) => {
    let payload = req.body;
    let check = await UserModel.find({ email: payload.email });
    if (check.length !== 0) {
        res.send({ "msg": "Email already registered" })
    } else {
        try {
            bcrypt.hash(payload.password, +2, async (err, hash) => {
                if (err) {
                    res.send({ message: err.message });
                } else {
                    payload.password = hash;
                    payload.role = `admin`
                    const User = new UserModel(payload);
                    await User.save();
                    res.send({ "message": `Admin Register Sucessfull` });
                }
            });
        } catch (error) {
            console.log({ message: error.message });
            res.send({ message: error.message });
        }
    }

});

// ************LOGIN***************

AdminRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let User = await UserModel.findOne({ email: email });
        if (User) {
            bcrypt.compare(password, User.password, async (err, result) => {
                if (result) {
                    const token = jwt.sign({ userID: User._id, role: User.role }, "9168");
                    console.log("Login Sucessfull");
                    res.send({ message: "Login Sucessfull", token: token });
                } else {
                    res.send({ message: "Wrong Password" });
                }
            });
        } else {
            res.send({ message: "Sign Up First" });
        }
    } catch (error) {
        res.send({ message: error.message });
    }
});


// ****************ALL STYLER ******************


AdminRouter.get("/All_Stylers", async (req, res) => {
    let search=req.query
    let data = await  StylerModel.find(search);
    res.send(data);
});

// ****************ADD STYLER ******************


AdminRouter.post("/create/styler", async (req, res) => {
    let payload=req.body;
    let data = await new StylerModel(payload);
    data.save();
    res.send({"msg": "Style Added"});
});


// ***********UPDATE SYLER************
AdminRouter.patch("/update/styler/:id", async (req, res) => {
    let ID=req.params.id;
    let payload=req.body
    let data=StylerModel.findOne({"_id":ID})
    await StylerModel.updateOne({"_id":ID},payload)
    statusemail(data.UserEmail,payload.status);
    res.send({"msg": "Style Updated"});
});

// ***********DELETE SYLER************

AdminRouter.delete("/delete/styler/:id", async (req, res) => {
    let ID=req.params.id;
    let payload=req.body
     await  StylerModel.deleteOne({"_id":ID})
    res.send({"msg": "Style Deleted"});
});



//**************All Appointments*************/
AdminRouter.get("/All_appoints",async(req,res)=>{
    let search=req.query
let data=await AppointmentModel.find(search);
res.send(data);
})

//*************Update Appointmentr **********/
AdminRouter.patch("/update/appointment/:id",async(req,res)=>{
    let status=req.body;
    let id=req.params.id;
    await AppointmentModel.updateOne({"_id":id},status);
    res.send({msg:"done"});
})


/*******Logout *******/
AdminRouter.get("/logout",(req,res)=>{
    const token =req.headers.authorization
    const blacklist=JSON.parse(fs.readFileSync("./blacklisted.json",{encoding:"utf-8"}));
    blacklist.push(token);
    fs.writeFileSync("./blacklist.json",JSON.stringify(blacklist));
    res.send("you are logged out")
})








//****** **********/
module.exports = { AdminRouter };