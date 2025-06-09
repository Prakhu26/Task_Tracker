// LandingPage.jsx
import React from "react";
import { Box, Heading, Button, VStack, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={6}>
        <Heading size="2xl" fontWeight="bold">
          TASK TRACKER
        </Heading>
        <h1>
            “Task management feels daunting? We make it easy.”
        </h1>

        <HStack spacing={3}>
          <Button as={Link} to="/login" colorScheme="blue" w="100px">
            Login
          </Button>
          <Button as={Link} to="/signup" colorScheme="green" w="100px">
            Signup
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default LandingPage;
