const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RegLogSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        maxLength:[15,"less than 15 char"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        unique:true,
    },
    confirmPassword:{
        type:String,
        required:true,
        unique:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});


// generating tokens
// Differences:(Rest API video 5)
// statics are the methods defined on the model.
// methods are defined on the document (instance).

// Use .statics for statics methods.
// Use .methods for instance methods.
RegLogSchema.methods.generateAuthToken = async function(){
    try{
        
        const token = await jwt.sign({_id:this._id.toString()},process.env.SECRETE_KEY)
        this.tokens = this.tokens.concat({token:token})
        // console.log(token);
        await this.save();
        return token;
    }catch(e){
        console.log('token error part'+e)
    }
}


// extra code 
// RegLogSchema.statics.generateAuthToken2 = async function(){
//     try{
//         console.log('test  '+this.tokens)
//     //    const userVer =  await jwt.verify(this.tokens[0].token,'mynameispavannageshkadagiiamfullstackdeveloper')
//     //    return userVer;
//     }catch(e){
//         console.log('token error part'+e)
//     }
// }




// converting password into hash
//pre means before save method of mongoose we have to do hashing that is called middleware.
//whatever we write password in client side before saving in mongodb we have do hashing this is called middleware
// next() for save method of mongoose (save data in mongodb)
//arrow function is not working so we have to use normal function, bc we have use this keyword
RegLogSchema.pre('save', async function (next){
    if(this.isModified('password')){
        // console.log(`the current password is ${this.password}`)
    this.password = await bcrypt.hash(this.password,10);
    // console.log(`after hashing is ${this.password}`);
    this.confirmPassword = await bcrypt.hash(this.password,10);

    }
    next();
})

module.exports = new mongoose.model('students',RegLogSchema);