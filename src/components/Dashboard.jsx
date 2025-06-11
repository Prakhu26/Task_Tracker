import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { deleteTask } from "../features/tasks/taskSlice";
import { Filter } from "lucide-react";

const Dashboard = ({ setEditData }) => {
  const navigate = useNavigate();
  const allTasks = useSelector((state) => state.tasks);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const toast = useToast();

  // Filter tasks for current user only
  const userTasks = allTasks.filter((task) => task.userId === user?.email);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");


  const [flippedCards, setFlippedCards] = useState(new Set());

  // Apply search and filters
  const filteredTasks = userTasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || task.dueDate === filterDate;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStatus = !filterStatus || task.status === filterStatus;

    return matchesSearch && matchesDate && matchesPriority && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Derived pagination values using filtered tasks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, filterPriority, filterStatus]);

  const handleDelete = (id) => {
    dispatch(deleteTask(id));
    toast({
      title: "Task deleted.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleFlip = (taskId) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleCardClick = (e, taskId) => {
    // Prevent flip if clicking on buttons
    if (e.target.closest("button")) {
      return;
    }
    toggleFlip(taskId);
  };

  return (
    <Box
      maxW={{ base: "full", md: "2xl", lg: "3xl" }}
      mx="auto"
      mt={{ base: "4", md: "10" }}
      p={{ base: "4", md: "6" }}
      bg="gray.700"
      color="white"
      rounded="md"
    >
      <Heading size={{ base: "sm", md: "md" }} mb="4">
        Your Tasks
      </Heading>

      {/* Search and Filter Section */}
      <VStack spacing="4" mb="6">
        {/* Search Bar */}
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="gray.800"
            border="1px solid"
            borderColor="gray.600"
            _hover={{ borderColor: "gray.500" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63b3ed" }}
          />
        </InputGroup>

        {/* Filters Row */}
        <HStack
          spacing="3"
          w="full"
          flexWrap="wrap"
          align="center"
          justify="center"
        >
          <Box as={Filter} color="gray.400" boxSize="18px" />

          {/* Date Filter with Calendar */}
          <Input
            type="date"
            placeholder="Filter by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            w="auto"
            size="sm"
          />

          <Select
            placeholder="Filter by Priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            w="auto"
            size="sm"
          >
            <option
              value="High"
              style={{ backgroundColor: "white", color: "black" }}
            >
              High
            </option>
            <option
              value="Medium"
              style={{ backgroundColor: "white", color: "black" }}
            >
              Medium
            </option>
            <option
              value="Low"
              style={{ backgroundColor: "white", color: "black" }}
            >
              Low
            </option>
          </Select>

          <Select
            placeholder="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            w="auto"
            size="sm"
          >
            <option
              value="Pending"
              style={{ backgroundColor: "white", color: "black" }}
            >
              Pending
            </option>
            <option
              value="In Progress"
              style={{ backgroundColor: "white", color: "black" }}
            >
              In Progress
            </option>
            <option
              value="Completed"
              style={{ backgroundColor: "white", color: "black" }}
            >
              Completed
            </option>
          </Select>

          {/* Clear Filters Button - Always visible */}
          <Button
            size="sm"
            variant="outline"
            color="grey"
            onClick={() => {
              setSearchTerm("");
              setFilterDate("");
              setFilterPriority("");
              setFilterStatus("");
            }}
            isDisabled={
              !searchTerm && !filterDate && !filterPriority && !filterStatus
            }
          >
            Clear Filters
          </Button>
        </HStack>
      </VStack>

      {filteredTasks.length === 0 ? (
        <Text>
          {userTasks.length === 0
            ? "No tasks added."
            : "No tasks match your search criteria."}
        </Text>
      ) : (
        <>
          <VStack spacing="4" align="stretch">
            {currentTasks.map((task) => (
              <Box
                key={task.id}
                position="relative"
                height="120px"
                style={{ perspective: "1000px" }}
              >
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  style={{
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s",
                    transform: flippedCards.has(task.id)
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                  }}
                  cursor="pointer"
                  onClick={(e) => handleCardClick(e, task.id)}
                >
                  {/* Front of card */}
                  <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    p="4"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.800"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      direction="row" 
                      gap="4"
                      height="100%"
                    >
                      {/* Task Content Section */}
                      <Box flex="1" minW="0">
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "lg" }}
                        >
                          {task.title}
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt="1">
                          Due: {task.dueDate}
                        </Text>
                        <HStack spacing="2" mt="1" flexWrap="wrap">
                          <Badge colorScheme="purple" fontSize="xs">
                            {task.priority}
                          </Badge>
                          <Badge
                            fontSize="xs"
                            colorScheme={
                              task.status === "Completed"
                                ? "green"
                                : task.status === "In Progress"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {task.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt="1">
                          Click to view description
                        </Text>
                      </Box>

                      {/* Action Buttons Section */}
                      <Box flexShrink="0">
                        {/* Mobile: Vertical Stack */}
                        <VStack
                          spacing="2"
                          align="center"
                          display={{ base: "flex", md: "none" }}
                        >
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            w="60px"
                            onClick={() => {
                              setEditData(task);
                              navigate("/task-form");
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            w="60px"
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </Button>
                        </VStack>

                        {/* Desktop: Horizontal Stack */}
                        <HStack
                          spacing="2"
                          align="center"
                          display={{ base: "none", md: "flex" }}
                        >
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            onClick={() => {
                              setEditData(task);
                              navigate("/task-form");
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>

                  {/* Back of card */}
                  <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    p="4"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.800"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      textAlign="center"
                      lineHeight="1.6"
                      px="2"
                    >
                      {task.description || "No description provided"}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ))}
          </VStack>

          {/* Pagination Controls - Always show if there are tasks */}
          {filteredTasks.length > 0 && (
            <HStack justify="center" mt="6" spacing="4">
              <Button
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
              >
                Prev
              </Button>
              <Text fontSize="sm">
                Page {currentPage} of {totalPages || 1}
              </Text>
              <Button
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                isDisabled={currentPage === totalPages || totalPages <= 1}
              >
                Next
              </Button>
            </HStack>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
