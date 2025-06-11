import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addTask, updateTask } from "../features/tasks/taskSlice";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Select,
  Textarea,
  useToast,
  Text,
} from "@chakra-ui/react";

const initialForm = {
  id: "",
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

const TaskForm = ({ editData, setEditData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user); 

  const today = new Date();
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const wordCount = (text) => text.trim().split(/\s+/).length;

  const validate = () => {
    if (!form.title || !form.description || !form.dueDate) return false;
    if (wordCount(form.title) > 5 || form.description.length > 200)
      return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Invalid input.",
        description:
          "Ensure title has max 5 words, description has max 200 characters, and all fields are filled.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (form.id) {
      dispatch(updateTask(form));
      toast({ title: "Task updated.", status: "success" });
    } else {
      dispatch(addTask({ ...form, id: uuidv4(), userId: user?.email })); // Use user email as userId
      toast({ title: "Task added.", status: "success" });
    }

    setForm(initialForm);
    setEditData(null);

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
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
        {form.id ? "Edit Task" : "Add Task"}
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing="4">
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Max 5 words"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Max 200 characters"
              maxLength={200}
            />
            <Text fontSize="sm" color="gray.400" mt="1">
              {form.description.length}/200 characters
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="Pending"
              >
                Pending
              </option>
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="In Progress"
              >
                In Progress
              </option>
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="Completed"
              >
                Completed
              </option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Priority</FormLabel>
            <Select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="Low"
              >
                Low
              </option>
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="Medium"
              >
                Medium
              </option>
              <option
                style={{ backgroundColor: "white", color: "black" }}
                value="High"
              >
                High
              </option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Due Date</FormLabel>
            <Input
              name="dueDate"
              type="date"
              min={localToday}
              placeholder="dd-mm-yyyy"
              value={form.dueDate}
              onChange={handleChange}
            />
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">
            {form.id ? "Update Task" : "Add Task"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default TaskForm;
