import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Booking from "./Pages/Booking";
import Auth from "./Pages/Auth";
import Error from "./Pages/Error";
import { Toaster } from "react-hot-toast";
import cookie from "js-cookie";

const App = () => {
  const isLoggedIn = cookie.get("token") ? true : false;

  // Replace the Redirect component with a simple component that returns Navigate
  const RedirectComponent = () => {
    if (isLoggedIn) {
      return <Navigate to="/booking" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={true} />
      <Router>
        <Routes>
          <Route path="/" element={<RedirectComponent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
