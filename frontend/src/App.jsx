import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          {/* ============================= */}
          {/* Public Routes                  */}
          {/* ============================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/events"
                replace
              />
            }
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:eventId"
            element={<EventDetails />}
          />

          <Route
            path="/events/:eventId/seats"
            element={<SeatSelection />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />
          


          {/* ============================= */}
          {/* Protected Routes               */}
          {/* ============================= */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/tickets"
              element={<MyTickets />}
            />

            <Route
              path="/tickets/:id"
              element={<TicketDetails />}
            />

          </Route>
          


          {/* ============================= */}
          {/* Fallback                       */}
          {/* ============================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/events"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}