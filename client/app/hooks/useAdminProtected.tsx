import { redirect } from "next/navigation";
import { useSelector } from "react-redux";

type Props = {
  children: React.ReactNode;
};

const useAdminProtected = ({ children }: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  if(user) {
    const isAdmin = user?.role === "admin";
    return isAdmin ? children : redirect("/");
  }
};

export default useAdminProtected;
