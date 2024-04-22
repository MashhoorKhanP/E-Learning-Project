"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { styles } from "@/app/styles/style";
import { useRegistrationMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";

type Props = {
  setRoute: (route: string) => void;
};

const schema = Yup.object().shape({
  name: Yup.string().required("Please enter your name!"),
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email address!"),
  password: Yup.string().required("Please enter your password!").min(6),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null as any], "Passwords must match")
    .required("Please confirm your password"),
});

const SignUp = ({ setRoute }: Props) => {
  const [show, setShow] = useState(false);
  const [registration,{error,data,isSuccess}] = useRegistrationMutation();

  useEffect(() => {
    if(isSuccess) {
      const message = data?.message || "Registration successfull!";
      toast.success(message,{duration: 3000});
      setRoute("Verification")
    }
    if(error){
      if("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  },[isSuccess,error]);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "",confirmPassword: ""},
    validationSchema: schema,
    onSubmit: async ({name, email, password }) => {
      const data = {
        name,email,password
      };
      await registration(data);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;
  return (
    <div className="w-full">
      <h1 className={`${styles.title}`}>Join to E-Learning</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className={`${styles.label}`} htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name=""
            value={values.name}
            onChange={handleChange}
            id="name"
            placeholder="John Doe"
            className={`${errors.name && touched.name && "border-red-500"} ${
              styles.input
            }`}
          />
          {errors.name && touched.name && (
            <span className="text-red-500 pt-2 block">{errors.name}</span>
          )}
        </div>
        <div className="mb-5">
        <label className={`${styles.label}`} htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name=""
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="example@example.com"
          className={`${errors.email && touched.email && "border-red-500"} ${
            styles.input
          }`}
        /></div>
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}
        <div className="w-full mb-5 relative">
          <label htmlFor="password" className={`${styles.label}`}>
            Password
          </label>
          <input
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${styles.input}`}
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="password!@%"
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className="absolute text-black dark:text-white bottom-2 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className="absolute text-black dark:text-white bottom-2 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
        </div>
        {errors.password && touched.password && (
          <span className="text-red-500 pt-2 block">{errors.password}</span>
        )}
        <div className="mb-5">
          <label className={`${styles.label}`} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className={`${errors.confirmPassword && touched.confirmPassword && "border-red-500"} ${styles.input}`}
            type={!show ? "password" : "text"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            id="confirmPassword"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <span className="text-red-500 pt-2 block">{errors.confirmPassword}</span>
          )}
        </div>
        <div className="w-full mt-5">
          <input type="submit" value="Sign up" className={`${styles.button}`} />
        </div>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          OR
        </h5>
        <div className="flex items-center justify-center my-3">
          <FcGoogle size={30} className="cursor-pointer mr-2" />
          <AiFillGithub size={30} className="cursor-pointer text-black dark:text-white  ml-2" />
        </div>
        <h5 className="text-center pt-4 text-black dark:text-white font-Poppins text-[14px]">
          Already have an account?{" "}
          <span
            className="text-[#2190ff] pl-1 cursor-pointer"
            onClick={() => setRoute("Login")}
          >
            Sign in
          </span>
        </h5>
        <br />
      </form>
    </div>
  );
};

export default SignUp;
