import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Store } from "./Store";
import Home from "./pages/Home";
import FormPage from "./pages/FormPage";
import ProfilePage from "./pages/ProfilePage"; // Import ProfilePage
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import "react-toastify/dist/ReactToastify.css";
import { Box, Button, Flex, VStack, Container, Text, Spacer } from "@chakra-ui/react";

const App = () => {
  const [editData, setEditData] = useState(null);
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Paths where we don't want the navbar
  const hideNavbarPaths = ["/", "/login", "/signup"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      {/* Conditionally render navbar */}
      {showNavbar && auth.user && (
        <Flex bg="gray.800" p="4" mb="6" align="center" maxW="100%" mx="auto">
          <Container maxW="container.xl">
            <Flex 
              align="center" 
              justify="space-between"
              direction={{ base: "column", md: "row" }}
              gap={{ base: "3", md: "0" }}
            >
              {/* Navigation Links */}
              <Flex gap="4" order={{ base: 2, md: 1 }} flexWrap="wrap" justify="center">
                <Button as={Link} to="/profile" variant="link" colorScheme="blue" size="sm">
                  Profile
                </Button>
                <Button as={Link} to="/dashboard" variant="link" colorScheme="blue" size="sm">
                  Dashboard
                </Button>
                <Button as={Link} to="/task-form" variant="link" colorScheme="blue" size="sm">
                  Add Task
                </Button>
              </Flex>
              
              {/* User Info and Logout */}
              <Flex 
                align="center" 
                gap="4" 
                order={{ base: 1, md: 2 }}
                direction={{ base: "column", sm: "row" }}
              >
                <Text fontSize="sm" color="gray.300" textAlign="center">
                  Welcome, {auth.user.name || auth.user.email}
                </Text>
                <Button onClick={handleLogout} colorScheme="red" size="sm">
                  Logout
                </Button>
              </Flex>
            </Flex>
          </Container>
        </Flex>
      )}

      {/* Page Content */}
      <Container maxW="container.xl" p="4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home editData={editData} setEditData={setEditData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-form"
            element={
              <ProtectedRoute>
                <FormPage editData={editData} setEditData={setEditData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={2000} />
      </Container>
    </Box>
  );
};

export default App;