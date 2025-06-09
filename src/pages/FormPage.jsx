
import React, { useState } from 'react';
import TaskForm from '../components/TaskForm';

const FormPage = ({ editData, setEditData }) => {
  return <TaskForm editData={editData} setEditData={setEditData} />;
};

export default FormPage;
