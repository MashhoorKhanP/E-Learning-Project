import { redirect } from "next/navigation";
import userAuth from "./userAuth"

type Props = {
  children: React.ReactNode
}

const useProtected = ({children}: Props) => {
  const isAuthenticated = userAuth();
  return isAuthenticated ? children : redirect("/");
}

export default useProtected