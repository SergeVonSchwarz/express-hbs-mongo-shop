const { Router } = require("express")
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const { loginValidators, registerValidators } = require("../utils/validators")
const router = Router()

router.get("/login", async (req, res) => {
    res.render("auth/login", {
        title: "Auth",
        isLogin: true,
        error: req.flash("error"),
    })
})

router.get("/logout", async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login#login")
    })
})

router.post("/login", loginValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash("error", errors.array()[0].msg)
            return res.status(422).redirect("/auth/login#login")
        }

        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password)
            if (isSame) {
                req.session.user = candidate
                req.session.isAuth = true
                req.session.save((err) => {
                    if (err) throw err
                    res.redirect("/")
                })
            } else {
                req.flash("error", "Wrong password!")
                res.redirect("/auth/login#login")
            }
        } else {
            req.flash("error", "Wrong login!")
            res.redirect("/auth/login#login")
        }
    } catch (err) {
        console.log("Login error: ", err)
    }
})

router.post("/register", registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash("error", errors.array()[0].msg)
            return res.status(422).redirect("/auth/login#register")
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email,
            name,
            password: hashPassword,
            cart: { items: [] },
        })
        await user.save()
        res.redirect("/auth/login#login")
    } catch (err) {
        console.log("Register error: ", err)
    }
})

module.exports = router
