import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from "react-router-dom";

export default function RequestedCases() {
    const navigate = useNavigate(); // Initialize navigate

    const viewStudent = () => {
        navigate("/student_current_cases"); // Navigate to "/student_current_cases" when button clicked
    };

    const sendDetail = () => {
        navigate("/donor_requested_case_view");
    };

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
                backgroundColor: "#f0f4f7", 
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
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
                <Typography sx={{ fontSize: 14, color: "#37474f" }} gutterBottom> {/* Change text color */}
                    {currentDate.toLocaleString()}
                </Typography>
                <Typography variant="h5" component="div" sx={{ color: "#1e88e5" }}> {/* Change primary color */}
                    Review the Requested Case:
                </Typography>
                <CardActions>
                    <Button onClick={viewStudent} size="small" startIcon={<PersonIcon />} sx={{ color: "#1e88e5" }}> {/* Change button color */}
                        Student
                    </Button>
                </CardActions>
                <CardActions>
                    <Button onClick={sendDetail} size="small" startIcon={<AccountBalanceWalletIcon />} sx={{ color: "#1e88e5" }}> {/* Change button color */}
                        Donor
                    </Button>
                </CardActions>
                <div className="mt-2">
                    <Typography variant="body2" sx={{ color: "#37474f" }}> {/* Change text color */}
                        This information is currently under review.
                        Last Updated: {formattedUpdatedDate}
                        <br />
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
}
