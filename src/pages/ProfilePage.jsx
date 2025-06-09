import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  FormErrorMessage,
  Text,
  Progress,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  Divider,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.tasks);
  const dispatch = useDispatch();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [originalForm, setOriginalForm] = useState({});
  const [errors, setErrors] = useState({ name: "", password: "" });
  const [touched, setTouched] = useState({ name: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        email: user.email || "",
        password: user.password || "",
      };
      setForm(userData);
      setOriginalForm(userData);
    }
  }, [user]);

  // Get user's tasks and calculate summary
  const userTasks = tasks.filter(task => task.userId === user?.email);
  const taskSummary = {
    total: userTasks.length,
    pending: userTasks.filter(task => task.status === "Pending").length,
    inProgress: userTasks.filter(task => task.status === "In Progress").length,
    completed: userTasks.filter(task => task.status === "Completed").length,
  };

  // Prepare data for pie chart
  const pieData = [
    { name: "Pending", value: taskSummary.pending, color: "#E53E3E" },
    { name: "In Progress", value: taskSummary.inProgress, color: "#D69E2E" },
    { name: "Completed", value: taskSummary.completed, color: "#38A169" },
  ].filter(item => item.value > 0); // Only show segments with values > 0

  // Validation functions
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
    const hasShortWord = nameWords.some(word => word.length < 1);
    if (hasShortWord) {
      return "Each part of the name must be at least 1 character";
    }
    if (/\d/.test(name)) {
      return "Name cannot contain numbers";
    }
    return "";
  };

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

    // Real-time validation (only for editable fields)
    if (touched[name]) {
      if (name === "name") {
        const nameError = validateName(value);
        setErrors({ ...errors, name: nameError });
      } else if (name === "password") {
        const passwordError = validatePassword(value);
        setErrors({ ...errors, password: passwordError });
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    // Validate on blur (only for editable fields)
    if (name === "name") {
      const nameError = validateName(value);
      setErrors({ ...errors, name: nameError });
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTouched({ name: false, password: false });
    setErrors({ name: "", password: "" });
  };

  const handleCancel = () => {
    setForm(originalForm);
    setIsEditing(false);
    setTouched({ name: false, password: false });
    setErrors({ name: "", password: "" });
    setShowPassword(false);
  };

  const handleSave = async () => {
    // Validate all editable fields before saving
    const nameError = validateName(form.name);
    const passwordError = validatePassword(form.password);

    setErrors({ name: nameError, password: passwordError });
    setTouched({ name: true, password: true });

    // If there are validation errors, don't save
    if (nameError || passwordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];

      // Update user in users array (email remains the same)
      const updatedUsers = users.map((u) => 
        u.email === user.email ? { ...u, name: form.name, password: form.password } : u
      );

      // Save updated users to localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Update current user in localStorage
      const updatedUser = { ...user, name: form.name, password: form.password };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update Redux store
      dispatch(login(updatedUser));

      // Update local state
      setOriginalForm({ ...form, email: user.email });
      setIsEditing(false);
      setShowPassword(false);

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasChanges = form.name !== originalForm.name || form.password !== originalForm.password;
  const isFormValid = !errors.name && !errors.password && form.name && form.password;
  const passwordStrength = getPasswordStrength(form.password);

  return (
    <Box
      maxW={{ base: "full", md: "4xl" }}
      mx="auto"
      mt={{ base: "4", md: "10" }}
      p={{ base: "4", md: "6" }}
    >
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
        {/* Profile Settings Section */}
        <GridItem>
          <Box
            p={{ base: "4", md: "6" }}
            bg="gray.700"
            rounded="md"
            color="white"
            h="fit-content"
          >
            <HStack justify="space-between" align="center" mb="6">
              <Heading size={{ base: "sm", md: "md" }}>
                Profile Settings
              </Heading>
              {!isEditing && (
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              )}
            </HStack>

            <VStack spacing="6" align="stretch">
              <FormControl isInvalid={touched.name && errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  isReadOnly={!isEditing}
                  bg={isEditing ? "gray.800" : "gray.600"}
                  _readOnly={{ 
                    bg: "gray.600", 
                    color: "gray.200",
                    cursor: "default"
                  }}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  placeholder="Your email address"
                  isReadOnly={true}
                  bg="gray.600"
                  color="gray.200"
                  cursor="not-allowed"
                />
                <Text fontSize="xs" color="gray.400" mt="1">
                  Email cannot be changed as it's used for account identification
                </Text>
              </FormControl>

              <FormControl isInvalid={touched.password && errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    isReadOnly={!isEditing}
                    bg={isEditing ? "gray.800" : "gray.600"}
                    _readOnly={{ 
                      bg: "gray.600", 
                      color: "gray.200",
                      cursor: "default"
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={togglePasswordVisibility}
                      size="sm"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                    />
                  </InputRightElement>
                </InputGroup>
                
                {isEditing && form.password && (
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

              {isEditing && (
                <>
                  <Divider />
                  <HStack spacing="3" justify="flex-end">
                    <Button
                      variant="outline"
                      color="grey"
                      onClick={handleCancel}
                      isDisabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={handleSave}
                      isLoading={isLoading}
                      loadingText="Saving..."
                      isDisabled={!hasChanges || !isFormValid}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                </>
              )}

              {!isEditing && (
                <Box>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Click "Edit Profile" to modify your information
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </GridItem>

        {/* Task Summary Section */}
        <GridItem>
          <Box
            p={{ base: "4", md: "6" }}
            bg="gray.700"
            rounded="md"
            color="white"
            h="fit-content"
          >
            <Heading size={{ base: "sm", md: "md" }} mb="6">
              Task Summary
            </Heading>

            {taskSummary.total === 0 ? (
              <Text textAlign="center" color="gray.400" py="8">
                No tasks created yet. Create your first task to see the summary.
              </Text>
            ) : (
              <VStack spacing="6" align="stretch">
                {/* Task Statistics */}
                <Grid templateColumns="repeat(2, 1fr)" gap="4">
                  <Stat textAlign="center" bg="gray.800" p="4" rounded="md">
                    <StatLabel fontSize="sm">Total Tasks</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.300">
                      {taskSummary.total}
                    </StatNumber>
                  </Stat>
                  <Stat textAlign="center" bg="gray.800" p="4" rounded="md">
                    <StatLabel fontSize="sm">Completed</StatLabel>
                    <StatNumber fontSize="2xl" color="green.300">
                      {taskSummary.completed}
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      {taskSummary.total > 0 ? 
                        `${Math.round((taskSummary.completed / taskSummary.total) * 100)}%` : 
                        '0%'
                      }
                    </StatHelpText>
                  </Stat>
                </Grid>

                {/* Pie Chart */}
                <Box h="300px" w="full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#2D3748', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: 'white' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Detailed Breakdown */}
                <VStack spacing="2" align="stretch">
                  <HStack justify="space-between" p="2" bg="gray.800" rounded="md">
                    <HStack>
                      <Box w="3" h="3" bg="red.500" rounded="full" />
                      <Text fontSize="sm">Pending</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold">{taskSummary.pending}</Text>
                  </HStack>
                  <HStack justify="space-between" p="2" bg="gray.800" rounded="md">
                    <HStack>
                      <Box w="3" h="3" bg="yellow.500" rounded="full" />
                      <Text fontSize="sm">In Progress</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold">{taskSummary.inProgress}</Text>
                  </HStack>
                  <HStack justify="space-between" p="2" bg="gray.800" rounded="md">
                    <HStack>
                      <Box w="3" h="3" bg="green.500" rounded="full" />
                      <Text fontSize="sm">Completed</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold">{taskSummary.completed}</Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ProfilePage;