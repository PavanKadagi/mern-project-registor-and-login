const mongoose = require('mongoose');

mongoose.connect(process.env.DB_HOST).then(()=>console.log('connection is SucessFull !'))
.catch((e)=>console.log('No Connection'))