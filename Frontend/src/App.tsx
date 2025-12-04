import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/toaster";
import useAppContext from "./hooks/useAppContext";
import AuthLayout from "./layouts/AuthLayout";
import Layout from "./layouts/Layout";
import AddHotel from "./pages/AddHotel";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ApiDocs from "./pages/ApiDocs";
import ApiStatus from "./pages/ApiStatus";
import Booking from "./pages/Booking";
import Detail from "./pages/Detail";
import EditHotel from "./pages/EditHotel";
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import MyHotels from "./pages/MyHotels";
import Register from "./pages/Register";
import Search from "./pages/Search";
import SignIn from "./pages/SignIn";

const App = () => {
  const { isLoggedIn } = useAppContext();
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />
        <Route
          path="/api-docs"
          element={
            <Layout>
              <ApiDocs />
            </Layout>
          }
        />
        <Route
          path="/api-status"
          element={
            <Layout>
              <ApiStatus />
            </Layout>
          }
        />
        <Route
          path="/analytics"
          element={
            <Layout>
              <AnalyticsDashboard />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />

        {isLoggedIn && (
          <>
            <Route
              path="/hotel/:hotelId/booking"
              element={
                <Layout>
                  <Booking />
                </Layout>
              }
            />

            <Route
              path="/add-hotel"
              element={
                <Layout>
                  <AddHotel />
                </Layout>
              }
            />
            <Route
              path="/edit-hotel/:hotelId"
              element={
                <Layout>
                  <EditHotel />
                </Layout>
              }
            />
            <Route
              path="/my-hotels"
              element={
                <Layout>
                  <MyHotels />
                </Layout>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <Layout>
                  <MyBookings />
                </Layout>
              }
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
