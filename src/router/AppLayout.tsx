import { Outlet } from "react-router-dom";

const Header = () => {
  return <></>;
};

const Footer = () => {
  return <></>;
};

const AppLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default AppLayout;
