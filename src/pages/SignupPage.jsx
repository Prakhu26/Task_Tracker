import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  Link as ChakraLink,
  FormErrorMessage,
  Text,
  Progress,
} from "@chakra-ui/react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useState } from "react";
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import { useAuth } from "../Contexts/authContexts";
import { updateProfile } from "firebase/auth";

const SignupPage = () => {
  const { userLoggedIn } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before Firebase submission
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError = validateConfirmPassword(
      form.confirmPassword,
      form.password
    );

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // If there are validation errors, don't submit
    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      setErrorMessage("");

      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          form.email,
          form.password
        );
        const user = userCredential.user;

        // Update the user's display name
        await updateProfile(user, {
          displayName: form.name,
        });

        // Dispatch to Redux store
        dispatch(
          login({
            uid: user.uid,
            email: user.email,
            displayName: form.name,
          })
        );

        toast({
          title: "Signup successful",
          description: "You are now logged in!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        navigate("/dashboard");
      } catch (error) {
        setErrorMessage(getFirebaseErrorMessage(error.code));
        toast({
          title: "Signup failed",
          description: getFirebaseErrorMessage(error.code),
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsRegistering(false);
      }
    }
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An error occurred during signup. Please try again.";
    }
  };

  // Name validation function
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (name.trim().length > 50) {
      return "Name cannot exceed 50 characters";
    }
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    if (name.includes("  ")) {
      return "Name cannot contain consecutive spaces";
    }
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "Name cannot start or end with spaces";
    }
    if (name.trim() === "") {
      return "Name cannot be only spaces";
    }
    const nameWords = name.trim().split(/\s+/);
    if (nameWords.length > 4) {
      return "Name cannot have more than 4 words";
    }
    const hasShortWord = nameWords.some((word) => word.length < 1);
    if (hasShortWord) {
      return "Each part of the name must be at least 1 character";
    }
    if (/\d/.test(name)) {
      return "Name cannot contain numbers";
    }
    return "";
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
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&)";
    }
    return "";
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword.trim()) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/(?=.*[a-z])/.test(password)) strength += 20;
    if (/(?=.*[A-Z])/.test(password)) strength += 20;
    if (/(?=.*\d)/.test(password)) strength += 20;
    if (/(?=.*[@$!%*?&])/.test(password)) strength += 20;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 40) return "red";
    if (strength < 80) return "yellow";
    return "green";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time validation
    if (touched[name]) {
      if (name === "name") {
        const nameError = validateName(value);
        setErrors({ ...errors, name: nameError });
      } else if (name === "email") {
        const emailError = validateEmail(value);
        setErrors({ ...errors, email: emailError });
      } else if (name === "password") {
        const passwordError = validatePassword(value);
        const confirmPasswordError = form.confirmPassword
          ? validateConfirmPassword(form.confirmPassword, value)
          : "";
        setErrors({
          ...errors,
          password: passwordError,
          confirmPassword: confirmPasswordError,
        });
      } else if (name === "confirmPassword") {
        const confirmPasswordError = validateConfirmPassword(
          value,
          form.password
        );
        setErrors({ ...errors, confirmPassword: confirmPasswordError });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    // Validate on blur
    if (name === "name") {
      const nameError = validateName(value);
      setErrors({ ...errors, name: nameError });
    } else if (name === "email") {
      const emailError = validateEmail(value);
      setErrors({ ...errors, email: emailError });
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    } else if (name === "confirmPassword") {
      const confirmPasswordError = validateConfirmPassword(
        value,
        form.password
      );
      setErrors({ ...errors, confirmPassword: confirmPasswordError });
    }
  };

  const passwordStrength = getPasswordStrength(form.password);
  const isFormValid =
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword;

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
        Signup
      </Heading>
      <form onSubmit={onSubmit}>
        <VStack spacing="4">
          <FormControl isInvalid={touched.name && errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

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
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            {form.password && (
              <Box mt="2">
                <Text fontSize="sm" mb="1">
                  Password Strength: {getPasswordStrengthText(passwordStrength)}
                </Text>
                <Progress
                  value={passwordStrength}
                  colorScheme={getPasswordStrengthColor(passwordStrength)}
                  size="sm"
                />
              </Box>
            )}
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={touched.confirmPassword && errors.confirmPassword}
          >
            <FormLabel>Confirm Password</FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          {errorMessage && (
            <Text color="red.300" fontSize="sm" textAlign="center">
              {errorMessage}
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="green"
            width="full"
            isLoading={isRegistering}
            loadingText="Creating account..."
            isDisabled={!isFormValid}
          >
            Signup
          </Button>

          <Text fontSize="sm" mt="2">
            Already have an account?{" "}
            <ChakraLink
              as={Link}
              to="/login"
              color="green.300"
              textDecoration="underline"
            >
              Login here
            </ChakraLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default SignupPage;
