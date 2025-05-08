import * as React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function StudentDetailsChecking() {
  const navigate = useNavigate(); // Initialize navigate

  const viewDetail = () => {
    navigate("/student_data"); // Navigate to "/student_data" when button clicked
  };

  return (
    <Card
      sx={{
        minWidth: 275,
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        transition: "transform 0.3s",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          transform: "scale(1.02)",
          cursor: "pointer",
        },
      }}
      className="mx-2 my-2"
    >
      <CardContent>
        <Typography variant="h5" component="div" sx={{ color: "#1565c0", textAlign: "center", marginBottom: 2, fontWeight: 600 }}>
          Student Details
        </Typography>
        <Typography variant="body2" sx={{ color: "#455a64", textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>
          "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
          <br />
          Stay motivated, keep learning, and make a difference!
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button onClick={viewDetail} size="medium" sx={{ color: "#1565c0", fontWeight: 600 }}>
          Click Here to View
        </Button>
      </CardActions>
    </Card>
  );
}
