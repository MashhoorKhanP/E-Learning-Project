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
import { useLoginMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

type Props = {
  setRoute: (route: string) => void;
  setOpen: (open: boolean) => void;
};

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email address!"),
  password: Yup.string().required("Please enter your password!").min(6),
});

const Login = ({ setRoute, setOpen }: Props) => {
  const [show, setShow] = useState(false);
  const [login, {isSuccess, error, data}] = useLoginMutation();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      const data = {
        email,
        password,
      };
  
      await login(data);
    },
  });

  useEffect(() => {
    if(isSuccess) {
      const message = data?.message || "Login Successful!";
      toast.success(message);
      setOpen(false);
    }
    if(error){
      if("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  },[isSuccess,error])

  const { errors, touched, values, handleChange, handleSubmit } = formik;
  return (
    <div className="w-full">
      <h1 className={`${styles.title}`}>Login with E-Learning</h1>
      <form onSubmit={handleSubmit}>
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
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
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
          {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block">{errors.password}</span>
          )}
        </div>
        <div className="w-full mt-5">
          <input type="submit" value="Login" className={`${styles.button}`} />
        </div>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          OR
        </h5>
        <div className="flex items-center justify-center my-3">
          <FcGoogle onClick={() => signIn("google")} size={30} className="cursor-pointer mr-2" />
          <AiFillGithub
          onClick={() => signIn("github")} 
            size={30}
            className="cursor-pointer text-black dark:text-white ml-2"
          />
        </div>
        <h5 className="text-center pt-4 font-Poppins text-black dark:text-white text-[14px]">
          Not have an account?{" "}
          <span
            className="text-[#2190ff] pl-1 cursor-pointer"
            onClick={() => setRoute("Sign-Up")}
          >
            Sign up
          </span>
        </h5>
        <br />
      </form>
    </div>
  );
};

export default Login;
