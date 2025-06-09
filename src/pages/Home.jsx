import React, { useState } from "react";
import Dashboard from "../components/Dashboard";

const Home = ({ editData, setEditData }) => {
  return <Dashboard setEditData={setEditData} />;
};

export default Home;
