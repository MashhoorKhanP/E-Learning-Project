"use client";

import AdminSidebar from "../components/Admin/Sidebar/AdminSidebar";
import Heading from "../utils/Heading";
import AdminProtected from "../hooks/useAdminProtected";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <AdminProtected>
        <Heading
          title={"E-Learning - Admin"}
          description="ELearning is a platform for students to learn and get help from teachers"
          keywords="Programming, MERN, Redux, ML"
        />
        <div className="flex h-[200vh] ">
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]"></div>
        </div>
      </AdminProtected>
    </div>
  );
};

export default page;
