const router = require('express').Router();
const bcrypt = require('bcryptjs/dist/bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require('../validation')
// const bcrypt = require('bcryptjs');


router.post('/register', async (req, res) => {

    //Validation of the data before creation
    const {error} = registerValidation(req.body); 
    if (error) return res.status(400).send(error.details[0].message)
    // res.send(error.details[0].message);

    // checking if the user is already in the db 

    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email Already Exists')

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    })

try{
    const savedUser = await user.save();
    res.send({user: user._id});

}catch(err){
    res.status(400).send(err)
}
});

//login
router.post('/login', async (req, res) => {

     //Validation of the data before creation
     const {error} = loginValidation(req.body); 
     if (error) return res.status(400).send(error.details[0].message)
     // res.send(error.details[0].message);

    // checking if the email exists
     const user = await User.findOne({email: req.body.email});

    if(!user) return res.status(400).send('Email or password is wrong')

    //password is correct 
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid Password');

    //create and assign token 
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    // res.header('auth-token', token).send(token);
    // res.send('Logged In!')
    res.json('auth-token');
})





module.exports = router;