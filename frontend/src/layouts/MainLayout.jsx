import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <Navbar />

      <main>
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;