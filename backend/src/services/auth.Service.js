const userModel = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const registerUser = async (data) => {
    const { name, username, email, password } = data;

    // Check if username or email already exists
    const existingUser = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (existingUser) {
        throw new Error('Username or email already exists');
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const createdUser = await userModel.create({
        name,
        username,
        email,
        password: hashedPassword
    });

    return createdUser;
};
const loginUser = async (data) => {
    const {  email, password } = data;

    const normalizedEmail = email.trim().toLowerCase();

    const isUserExist = await userModel
    .findOne({ email: normalizedEmail })
    .select('+password');
    if(!isUserExist){
        throw new Error("Invalid credentials");
    }

    const isPasswordMatch =  await bcrypt.compare(password ,isUserExist.password);

    if(!isPasswordMatch){
        throw new Error("Invalid credentials");
    }



    const   token = jwt.sign({ id: isUserExist._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    



    return {
    user: isUserExist,
    token
};
}


module.exports = {
    registerUser ,
    loginUser
};