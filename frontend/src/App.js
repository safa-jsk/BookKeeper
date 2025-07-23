import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(res => setMessage(res.data))
      .catch(err => setMessage("API error"));
  }, []);
  return (
    <div>
      <h1>BookKeeper</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}
export default App;
