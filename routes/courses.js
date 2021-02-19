const { Router } = require("express")
const Course = require("../models/course")
const { validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const { courseValidators } = require("../utils/validators")

const router = Router()

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().populate("userId", "email name")
        res.render("courses", {
            title: "Courses",
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses: courses,
        })
    } catch (err) {
        console.log("Courses error: ", err)
    }
})

router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render("course", {
            // layout: "empty",
            title: `Course: ${course.title}`,
            isCourses: true,
            course,
        })
    } catch (err) {
        console.log("Course error: ", err)
    }
})

router.get("/edit/:id", auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect("/courses")
    }
    const error = req.query.error ? req.query.error : null

    try {
        const course = await Course.findById(req.params.id)
        if (!isOwner(course, req)) {
            return res.redirect("/courses")
        }
        res.render("edit", {
            isCourses: true,
            title: "Edit course",
            course: course,
            error: error,
        })
    } catch (err) {
        console.log("Edit course error: ", err)
    }
})

router.post("/edit", auth, courseValidators, async (req, res) => {
    try {
        const course = await Course.findById(req.body.id)
        if (!isOwner(course, req)) {
            return res.redirect("/courses")
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.redirect(
                `/courses/edit/${req.body.id}?allow=true&error=${
                    errors.array()[0].msg
                }`
            )
        }

        Object.assign(course, req.body)
        await course.save()

        res.redirect("/courses")
    } catch (err) {
        console.log("Edit course post error: ", err)
    }
})

router.post("/delete", auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        })
        res.redirect("/courses")
    } catch (err) {
        console.log("Delete course error: ", err)
    }
})

module.exports = router
