import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  Text,
  Link as ChakraLink,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from "../firebase/auth";
import { useAuth } from "../Contexts/authContexts";

const LoginPage = () => {
  const { userLoggedIn } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before Firebase submission
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    // If there are validation errors, don't submit
    if (emailError || passwordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        const userCredential = await doSignInWithEmailAndPassword(
          form.email,
          form.password
        );
        const user = userCredential.user;

        // Dispatch to Redux store
        dispatch(
          login({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || form.email,
          })
        );

        toast({
          title: "Login successful",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        navigate("/dashboard");
      } catch (error) {
        setErrorMessage(getFirebaseErrorMessage(error.code));
        toast({
          title: "Login failed",
          description: getFirebaseErrorMessage(error.code),
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        const result = await doSignInWithGoogle();
        const user = result.user;

        // Dispatch to Redux store
        dispatch(
          login({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
          })
        );

        toast({
          title: "Google sign-in successful",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        navigate("/dashboard");
      } catch (error) {
        setErrorMessage(getFirebaseErrorMessage(error.code));
        toast({
          title: "Google sign-in failed",
          description: getFirebaseErrorMessage(error.code),
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      default:
        return "An error occurred during sign-in. Please try again.";
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 254) {
      return "Email address is too long";
    }
    const localPart = email.split("@")[0];
    if (localPart.length > 64) {
      return "Email local part is too long";
    }
    if (email.includes("..")) {
      return "Email cannot contain consecutive dots";
    }
    if (email.startsWith(".") || email.endsWith(".")) {
      return "Email cannot start or end with a dot";
    }
    const domainPart = email.split("@")[1];
    if (domainPart) {
      if (!domainPart.includes(".")) {
        return "Invalid domain format";
      }
      if (domainPart.length > 253) {
        return "Domain name is too long";
      }
      const domainRegex = /^[a-zA-Z0-9.-]+$/;
      if (!domainRegex.test(domainPart)) {
        return "Domain contains invalid characters";
      }
      if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
        return "Domain cannot start or end with hyphen";
      }
    }
    return "";
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time validation
    if (touched[name]) {
      if (name === "email") {
        const emailError = validateEmail(value);
        setErrors({ ...errors, email: emailError });
      } else if (name === "password") {
        const passwordError = validatePassword(value);
        setErrors({ ...errors, password: passwordError });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    // Validate on blur
    if (name === "email") {
      const emailError = validateEmail(value);
      setErrors({ ...errors, email: emailError });
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    }
  };

  // Redirect if already logged in
  if (userLoggedIn) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    <Box
      maxW="md"
      mx="auto"
      mt="10"
      p="6"
      bg="gray.700"
      rounded="md"
      color="white"
    >
      <Heading size="md" mb="4">
        Login
      </Heading>
      <form onSubmit={onSubmit}>
        <VStack spacing="4">
          <FormControl isInvalid={touched.email && errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={touched.password && errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          {errorMessage && (
            <Text color="red.300" fontSize="sm" textAlign="center">
              {errorMessage}
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isSigningIn}
            loadingText="Signing in..."
            isDisabled={
              errors.email || errors.password || !form.email || !form.password
            }
          >
            Login
          </Button>

          <Button
            onClick={onGoogleSignIn}
            colorScheme="blue"
            width="full"
            isLoading={isSigningIn}
            loadingText="Signing in..."
          >
            Sign in with Google
          </Button>

          <Text fontSize="sm" mt="2">
            Don't have an account?{" "}
            <ChakraLink
              as={Link}
              to="/signup"
              color="blue.300"
              textDecoration="underline"
            >
              Sign up here
            </ChakraLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginPage;
