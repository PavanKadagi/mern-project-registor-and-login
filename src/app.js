require('dotenv').config();
require('./db/DBconection');
const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const reg = require('./models/reg-log');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const authentication = require('./middleware/authentication')

console.log(process.env.SECRETE_KEY,process.env.DB_HOST)

app.use(express.json())
app.use(cookieParser());
// app.use(cors())
app.use(express.urlencoded({extended:false}))


// for only static ex. index.html
// const staticPath = path.join(__dirname,'../public');
// app.use(express.static(staticPath));

//for only one hbs
// app.set('view engine','hbs');

// if i need to render nav with login page, so i need template folder with partial and views.
//  go to pakage.json -e js,hbs is add
const templatePath = path.join(__dirname,'../templates/views')
const partialPath = path.join(__dirname,'../templates/partials');
console.log(partialPath);
app.set('view engine','hbs')
app.set('views',templatePath);
hbs.registerPartials(partialPath);

app.get('/',(req,res)=>{
    res.render('index')
})


app.get('/secret',authentication,(req,res)=>{
    // its not a secret key. it is the user valid token that we are getting from cookie
    // console.log(`this is cookie ${req.cookies.jwt}`);
    res.render('secret');
})

app.get('/registor',(req,res)=>{
    res.render('registor')
});

app.get('/login',(req,res)=>{
    res.render('login')
});

app.get('/logout',authentication, async (req,res)=>{
    try {
    console.log(req.user);
    // remove one specific token (that is logout from one devices)
    // for single logout
    //    req.user.tokens =  req.user.tokens.filter((curElement) => curElement.token !== req.token);



    //logout from all devices
    // req.user.tokens.length = 0; 
    req.user.tokens = [];
       res.clearCookie('jwt');
        await req.user.save();
        res.render('login')
        console.log("logout successfully");
    } catch (error) {
        res.status(500).send(error)
    }    
})

app.post('/registor',async(req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;
        // console.log(password,cpassword)
        if(password === cpassword){
            const registorEmployee = new reg({
                username:req.body.username,
                email:req.body.email,
                phone:req.body.phone,
                password:password,
                confirmPassword:password
            });

            console.log('the success part'+registorEmployee);
            
         const token =  await  registorEmployee.generateAuthToken();
         console.log('the token part'+token)


        //  the res.cookie() function is used to set the cookie name to value.
        //the value paramerter may be a string or object converted to JSON.
        //Syntax :
        // res.cookie(name,value,[options])
            
         res.cookie('jwt',token,{
            //if we dont write expires then when we refresh the page then cookes not be stored.
            //that way we have menation expires date.
            expires:new Date(Date.now() + 600000), 
            // client side scryting language means js the value('jwt') can not remove or delete (nothing can done)
            //but, we can manoly remove on browser
            httpOnly:true,
            // only work on https or secure
            // secure:true
         });
         console.log(cookie);

           const registor =  await registorEmployee.save();
            res.status(201).render('login');
        }else{
            res.send( 'please correct password')
        }
    //     console.log(req.body.username);
    // res.send(req.body.username)
    }catch(e){
        res.status(400).send(e);
    }
});


app.post('/login',async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await reg.findOne({email:email});

        // without hashing
        // if(useremail.password === password){
        //     res.status(201).render('index');
        // }else{
        //     res.send('invalid login details')
        // }

        // adding hashing
        const isMatch = await bcrypt.compare(password,useremail.password)

        //// geting tokens
        const token =  await  useremail.generateAuthToken();
         console.log('the token part '+token)

        //  cookie(desciption above)
        res.cookie('jwt',token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true,
            // secure:true
        })

        if(isMatch){
            res.status(201).render('index');
        }else{
            res.send('invalid password details')
        }



    }catch(e){
        res.status(400).send('invalid login details');
    }
})



// example for bcrypt
// const bcrypt = require('bcrypt');
// const checkPassword =  async(pass)=>{
//     const hashPass = await bcrypt.hash(pass,10);
//     const passMatch = await bcrypt.compare('pavan@123',hashPass);
//     console.log(passMatch)
// }
// checkPassword("pavan@123")


// example for jwt
// const jwt = require('jsonwebtoken');
// const checkToken = async()=>{
//     const token = await jwt.sign({_id:'64007cbeb1639dd21904b782'},
//     "mynameispavannageshkadagiiamfullstack",{expiresIn:'2 seconds'});
//     console.log(token)
//     const userVer = await jwt.verify(token,"mynameispavannageshkadagiiamfullstack")
//     console.log(userVer)
// }
// checkToken();

app.listen(port,()=>{
    console.log(`connection done at ${port}`);
})