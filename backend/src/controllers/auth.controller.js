const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }

        const createdUser = await registerUser({
            name,
            username,
            email,
            password,
        });

        const userResponse = {
            id: createdUser._id,
            name: createdUser.name,
            username: createdUser.username,
            email: createdUser.email,
            profilePicture: createdUser.profilePicture,
            bio: createdUser.bio,
            createdAt: createdUser.createdAt,
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
        });

    } catch (err) {
        console.error("Error in register:", err);

        if (err.message === "Username or email already exists") {
            return res.status(409).json({
                message: err.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }

        const loggedInUser = await loginUser({
            email,
            password,
        });

        // Store JWT inside HttpOnly cookie
        res.cookie("authToken", loggedInUser.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        // Never send password/hash to client
        const userResponse = {
            id: loggedInUser.user._id,
            name: loggedInUser.user.name,
            username: loggedInUser.user.username,
            email: loggedInUser.user.email,
            profilePicture: loggedInUser.user.profilePicture,
            bio: loggedInUser.user.bio,
            createdAt: loggedInUser.user.createdAt,
        };

        return res.status(200).json({
            message: "User logged in successfully",
            user: userResponse,
        });

    } catch (err) {
        console.error("Error in login:", err);

        if (err.message === "Invalid credentials") {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


const logout = (req, res) => {
    // Remove the authentication cookie
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.status(200).json({
        message: "Logout successful",
    });
};


module.exports = {
    register,
    login,
    logout,
};