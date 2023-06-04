const jwt = require('jsonwebtoken');
const Reg = require('../models/reg-log');

const authentication = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        // console.log(token , process.env.SECRETE_KEY);
        const userVerify = await jwt.verify(token,process.env.SECRETE_KEY);
        console.log(`user verificaton ${userVerify}`);
        const user = await Reg.findOne({_id:userVerify._id});
        console.log(user.username);

        req.token = token;
        req.user = user;

        next(); 
    }catch(err){
        res.status(401).send(err);
    }
}

module.exports = authentication;