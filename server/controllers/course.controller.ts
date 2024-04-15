import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";

// Upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }
      createCourse(data, res, next);
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      const data = req.body;
      console.log("data", req.body);
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }

      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: "Course updated successfully!",
        course,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Get single course - without purchase
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course));

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Get all courses - without purchase
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const courses = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Get course content - only for valid user
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = userCourseList?.find((course: any) =>
        course._id.equals(courseId)
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404)
        );
      }
      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid Content Id!", 400));
      }

      const courseContent = course?.courseData?.find(
        (item: any) => item._id.toString() === contentId
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid Content Id!", 400));
      }

      // Create a new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question received!",
        message: `You have a new question in ${courseContent?.title} from ${req.user?.name}`,
      });

      // Add this queston to our course content
      courseContent.questions.push(newQuestion);

      await course?.save();
      res.status(200).json({
        success: true,
        message: "Question added successfully!",
        course,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Add answer in course questions
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid Content Id!", 400));
      }

      const courseContent = course?.courseData?.find(
        (item: any) => item._id.toString() === contentId
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid Content Id!", 400));
      }

      const question = courseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid Question Id!", 400));
      }

      // Create a new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user._id) {
        // Create a notification
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question reply received!",
          message: `You have a new question in ${courseContent?.title}!`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );
        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error) {
          const typedError = error as Error;
          return next(new ErrorHandler(typedError.message, 400));
        }
      }

      res.status(200).json({
        message: "Answer added successfully!",
        success: true,
        course,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Add review in course
interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const isCourseExist = userCourseList?.some(
        (course: any) => course._id.toString() === courseId
      );

      if (!isCourseExist) {
        return next(
          new ErrorHandler("You are not eligible to access this course!", 404)
        );
      }
      const course = await CourseModel.findById(courseId);
      const { review, rating }: IAddReviewData = req.body;

      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      course?.reviews.push(reviewData);

      let avg = 0;
      course?.reviews.forEach((review: any) => {
        avg += review.rating;
      });

      if (course) {
        course.ratings = avg / course?.reviews.length;
      }

      await course?.save();

      const notification = {
        title: "New review added",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      };

      // Create a notification

      res.status(200).json({
        success: true,
        message: "Review added successfully!",
        course,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);

// Add reply in review
interface IAddReplyReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReplyReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 400));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 400));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error) {
      const typedError = error as Error;
      return next(new ErrorHandler(typedError.message, 400));
    }
  }
);
