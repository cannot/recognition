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

// GET Student classrooms
router.get("/student-classrooms", isAuth, classroomController.getStudentClassroom);

// GET add classroom
router.get("/add-classroom", isAuth, classroomController.getAddClassroom);

// GET registration classroom
router.get("/classrooms/reg/:classroomId/", isAuth, classroomController.getRegisClassroom);



module.exports = router;