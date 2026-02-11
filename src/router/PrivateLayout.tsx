import { Outlet } from "react-router-dom";

const PrivateLayout = () => {
  console.log("PrivateLayout");
  return <Outlet />;
};

export default PrivateLayout;
