const express = require("express");
const router = express.Router();
const classroomController = require("../controller/classroom");
const isAuth = require("../middleware/isAuth");
const { body } = require("express-validator/check");

// GET all classrooms
router.get("/classrooms", isAuth, classroomController.getClassroom);

// GET post detail
router.get("/classrooms/:postId", classroomController.getClassroomDetail);

// GET Teacher classrooms
router.get("/my-classrooms", isAuth, classroomController.getAuthorClassroom);

// GET Teacher classrooms detail
router.get("/my-classrooms/:classroomId/", isAuth, classroomController.getAuthorClassroomDetail);

// GET Student classrooms
router.get("/student-classrooms", isAuth, classroomController.getStudentClassroom);

// GET Student classrooms detail
router.get("/student-classrooms/:classroomId/", isAuth, classroomController.getStudentClassroomDetail);

// GET add classroom
router.get("/add-classroom", isAuth, classroomController.getAddClassroom);

// GET registration classroom
router.get("/classrooms/reg/:classroomId/", isAuth, classroomController.getRegisClassroom);


// POST add classroom
router.post(
    "/add-classroom",
    isAuth, [
        body("title", "Enter valid title")
        .trim()
        .escape()
        .not().isEmpty(),
        body("description", "Enter valid description")
        .trim()
        .escape()
        .not().isEmpty()
    ],
    classroomController.postAddClassroom
);

// POST edit post
router.get("/classrooms/:classroomId/edit", isAuth, classroomController.getEditClassroom);
router.post(
    "/classroom-edit",
    isAuth, [
        body("title", "Enter valid title")
        .trim()
        .escape()
        .not().isEmpty(),
        body("description", "Enter valid description")
        .trim()
        .escape()
        .not().isEmpty()
    ],
    classroomController.postEditClassroom
);

// POST delete post
router.delete("/classrooms/:classroomId/", isAuth, classroomController.deleteClassroom);

// POST Teacher add attendance
router.get("/classrooms/take_attendance/:classroomId/:studentId", isAuth, classroomController.getTakeAttendance);


module.exports = router;