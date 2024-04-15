import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();
courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);
courseRouter.patch(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

courseRouter.patch("/add-question", isAuthenticated, addQuestion);
courseRouter.patch("/add-answer", isAuthenticated, addAnswer);

courseRouter.patch("/add-review/:id", isAuthenticated, addReview);
courseRouter.patch("/add-review-reply", isAuthenticated,authorizeRoles('admin'), addReplyToReview);


export default courseRouter;
