const { Router } = require("express")
const Course = require("../models/course")
const auth = require("../middleware/auth")
const router = Router()

function mapCartItems(cart) {
    return cart.items.map((c) => ({
        ...c.courseId.toJSON(),
        count: c.count,
    }))
}

function calcPrice(cart) {
    return cart.items.reduce((sum, item) => {
        return (sum += item.count * item.courseId.price)
    }, 0)
}

router.post("/add", auth, async (req, res) => {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect("/cart")
})

router.delete("/delete/:id", auth, async (req, res) => {
    await req.user.deleteFromCart(req.params.id)
    const user = await req.user.populate("cart.items.courseId").execPopulate()
    const courses = mapCartItems(user.cart)
    const cart = {
        courses,
        price: calcPrice(user.cart),
    }
    res.status(200).json(cart)
})

router.get("/", auth, async (req, res) => {
    const user = await req.user.populate("cart.items.courseId").execPopulate()
    res.render("cart", {
        title: "Cart",
        isCart: true,
        courses: mapCartItems(user.cart),
        price: calcPrice(user.cart),
    })
})

module.exports = router
