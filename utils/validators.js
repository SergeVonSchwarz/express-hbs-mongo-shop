const { body } = require("express-validator")
const User = require("../models/user")

exports.courseValidators = [
    body("title")
        .isLength({ min: 3 })
        .withMessage("Course name min length 3!")
        .trim(),
    body("price").isNumeric().withMessage("Enter correct price!"),
    body("image", "Enter correct URL of image").isURL(),
]

exports.loginValidators = [
    body("email")
        .isEmail()
        .withMessage("Enter correct email!")
        .normalizeEmail(),
    body("password", "Password must be 5 symbols minimum!")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
]

exports.registerValidators = [
    body("email")
        .isEmail()
        .withMessage("Enter correct email!")
        .custom(async (value, req) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject("User exist!")
                }
            } catch (err) {
                console.log("Email async validate error: ", err)
            }
        })
        .normalizeEmail(),
    body("password", "Password must be 5 symbols minimum!")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body("confirm")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords are not equal!")
            }
            return true
        })
        .trim(),
    body("name")
        .isLength({ min: 3 })
        .withMessage("Name must be 3 symbols minimum!")
        .trim(),
]
