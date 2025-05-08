import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CommentIcon from '@mui/icons-material/Comment'; 
import { styled } from "@mui/material/styles"
import {  Chip, Stack } from "@mui/material"

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: "semibold",
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.875rem",
  
}))

export default function FeeStatus({ status }) {
  const [showBox, setShowBox] = React.useState(false);
  const currentDate = new Date();

  // Provide the updated date here
  const updatedDate = "2024-07-09";
  const formattedUpdatedDate = new Date(updatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <Card
        sx={{
          
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)",
            cursor: "pointer",
          },
          "@media (max-width: 600px)": {
            minWidth: "100%",
          },
        }}
        className="mx-2 my-2"
      >
        <CardContent>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }} gutterBottom>
            {currentDate.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={72}>
                <Typography  variant="h5" component="div" sx={{ color: "primary.main", marginBottom: 2 }}>
                  Scholarship Status:
                </Typography>
                <StatusChip
                  label={status}
                  size="medium"
                  sx={(theme) => ({
                    bgcolor: status.toLowerCase() === "accepted" ? theme.palette.warning.main : theme.palette.error.main,
                    color: theme.palette.common.white,
                    marginRight: 1,
                  })}
                /> 
          </Stack>
          
          <CardActions>
           
          
            <Button
              onClick={() => setShowBox(!showBox)}
              size="small"
              startIcon={<CommentIcon />}
              variant="contained"
              
              sx={{  mt: 2,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                textTransform: "none",
                fontSize: "1.1rem",}}
            >
              Check Remarks
            </Button>
          </CardActions>
          <div className="mt-2">
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              { status === "Accepted"
                ? "Congratulations, your application has been approved. You can now check the remarks."
                : status === "rejected" ?" Sorry, your application has been rejected ": "Your Application is under review. Please wait for the approval " }
              <br />
              Last Updated: {formattedUpdatedDate}
              <br />
            </Typography>
          </div>
        </CardContent>
      </Card>

      {showBox && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">{status === "approved" ? "Congratulation" : " Pending "}</h2>
            {status === "accepted" ? (
              <p>Your application has been approved. You can now proceed with the next steps.</p>
            ) : (
              <p>Your Application is under review. Please wait for the approval.</p>
            )}
          </div>
          <button
            onClick={() => setShowBox(!showBox)}
            className="fixed top-5 right-5 text-white bg-red-500 p-2 rounded-full"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}