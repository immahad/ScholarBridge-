import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function CardNews() {
  return (
    <Card
      sx={{
        minWidth: 275,
        backgroundColor: "white",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
        },
      }}
      className="mx-2 my-2"
    >
      <CardContent>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }} gutterBottom>
          3 April 2024
        </Typography>
        <Typography variant="h5" component="div" sx={{ color: "primary.main" }}>
          April Fee Challan Issued
        </Typography>

        <div className="mt-2">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Please pay the fee by 10 April 2024
            <br />
          </Typography>
        </div>
      </CardContent>
      <CardActions>
        <Button size="small" sx={{ color: "primary.main" }}>
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
