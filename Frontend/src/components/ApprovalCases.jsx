import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function ApprovedCases() {
  const currentDate = new Date();

  // Format the updated date
  const formattedUpdatedDate = new Date(/* Provide the updated date here */).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
        <Typography variant="h5" component="div" sx={{ color: "primary.main", marginBottom: 2 }}>
          Approved Cases:
        </Typography>
        <CardActions>
          <Button size="small" startIcon={<PersonIcon />} sx={{ color: "primary.main", marginRight: 1 }}>
            Accepted Students
          </Button>
          <Button size="small" startIcon={<AccountBalanceWalletIcon />} sx={{ color: "primary.main" }}>
            Paid students
          </Button>
        </CardActions>
        <div className="mt-2">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            These are the cases that have been approved by the organization.
            Last Updated: {formattedUpdatedDate}
            <br />
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
