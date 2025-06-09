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
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useState } from "react";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  // Email validation function
  const validateEmail = (email) => {
    // Check if email is empty
    if (!email.trim()) {
      return "Email is required";
    }

    // Basic format validation using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Check email length (reasonable limits)
    if (email.length > 254) {
      return "Email address is too long";
    }

    // Check local part length (before @)
    const localPart = email.split("@")[0];
    if (localPart.length > 64) {
      return "Email local part is too long";
    }

    // Check for consecutive dots
    if (email.includes("..")) {
      return "Email cannot contain consecutive dots";
    }

    // Check if email starts or ends with dot
    if (email.startsWith(".") || email.endsWith(".")) {
      return "Email cannot start or end with a dot";
    }

    // Check domain part
    const domainPart = email.split("@")[1];
    if (domainPart) {
      // Check if domain has at least one dot
      if (!domainPart.includes(".")) {
        return "Invalid domain format";
      }

      // Check domain length
      if (domainPart.length > 253) {
        return "Domain name is too long";
      }

      // Check for valid characters in domain
      const domainRegex = /^[a-zA-Z0-9.-]+$/;
      if (!domainRegex.test(domainPart)) {
        return "Domain contains invalid characters";
      }

      // Check if domain starts or ends with hyphen
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
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

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === form.email && user.password === form.password // Hash in real apps
    );

    if (matchedUser) {
      localStorage.setItem("currentUser", JSON.stringify(matchedUser));
      dispatch(login(matchedUser));
      toast({
        title: "Login successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Invalid credentials",
        description: "Check your details or click above to sign up.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

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
      <form onSubmit={handleSubmit}>
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

          <Button 
            type="submit" 
            colorScheme="blue" 
            width="full"
            isDisabled={errors.email || errors.password || !form.email || !form.password}
          >
            Login
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