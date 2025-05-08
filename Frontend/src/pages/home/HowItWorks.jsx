import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';

const steps = [
    {
        title: "Step 1: Students Apply",
        description:
            "Students register, create profiles, and apply for grants by submitting necessary documents.",
        date: "Released on January 13th, 2022",
        additionalInfo:
            "Students provide the necessary documents to verify their eligibility for the grants.",
    },
    {
        title: "Step 2: Donors Donate",
        description:
            "Donors browse student profiles, verify details, and contribute to their educational journey.",
        date: "Released on February 5th, 2022",
        additionalInfo:
            "Donors can view detailed student profiles and decide to sponsor based on their goals.",
    },
    {
        title: "Step 3: Admins Manage",
        description:
            "Admins oversee applications, approve donations, and ensure transparency and accountability.",
        date: "Released on March 10th, 2022",
        additionalInfo:
            "Admins work to ensure every donation is directed to the appropriate student in need.",
    },
];

export default function CustomizedTimeline() {
    return (
        <Timeline position="alternate">
            {steps.map((step, index) => (
                <TimelineItem key={index}>
                    <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        variant="body2"
                        color="text.secondary"
                    >
                        {step.date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot color={index === 2 ? 'primary' : 'secondary'} />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                            {step.title}
                        </Typography>
                        <Typography>{step.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {step.additionalInfo}
                        </Typography>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
}
