import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-heading selection:bg-ui-dark selection:text-white">
      {/* Global Persistent Header */}
      <Navbar />

      {/* Dynamic Main Page Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Persistent Footer */}
      <Footer />
    </div>
  );
};

export default Layout;