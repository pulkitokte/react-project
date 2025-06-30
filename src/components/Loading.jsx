import React from "react";
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div style={styles.container}>
      <Loader style={styles.spinner} />
      <p>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFA41C",
  },
  spinner: {
    animation: "spin 1s linear infinite",
    fontSize: "32px",
    marginBottom: "10px",
  },
};
