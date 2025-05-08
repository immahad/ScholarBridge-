import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PersonIcon from '@mui/icons-material/Person';

export default function DonorDetailsChecking() {
  return (
    <Card
      sx={{
        minWidth: 275,
        backgroundColor: "#ffefc6", // Change the background color to a light yellow
        borderRadius: "16px",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          cursor: "pointer",
        },
      }}
      className="mx-2 my-2"
    >
      <CardContent>
        <Typography variant="h5" component="div" sx={{ color: "#f57c00", textAlign: "center", marginBottom: 2 }}>
          Donor Details
        </Typography>
        <Typography variant="body2" sx={{ color: "#37474f", textAlign: "center", fontStyle: "italic" }}>
          "The joy of giving lasts longer than the joy of receiving."
          <br />
          Be a hero, donate today and make a difference!
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button size="medium" startIcon={<PersonIcon />} sx={{ color: "#f57c00" }}> {/* Change the button color */}
          Click Here to View
        </Button>
      </CardActions>
    </Card>
  );
}
