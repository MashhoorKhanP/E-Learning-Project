"use client";
import React, { useState } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Hero";

type Props = {};

const Page = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");
  return (
    <div className="">
      <Heading
        title="E-Learning"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Programming, MERN, Redux, ML"
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} setRoute={setRoute} route={route}/>
      <Hero />
    </div>
  );
};

export default Page;
