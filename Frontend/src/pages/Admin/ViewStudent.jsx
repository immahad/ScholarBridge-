import { Card, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function ViewStudent() {
    const [approvedCases, setApprovedCases] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchApprovedCases = async () => {
            try {
                const url = 'http:localhost:3333/ifl_system/adminCase/admin/get-all-approved-cases';
                const response = await axios.get(url, {
                    headers: {
                        "auth-token": "your-auth-token"
                    }
                });
                console.log(response);
                if (!response.data) {
                    throw new Error('Error fetching approved cases');
                }
                setApprovedCases(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchApprovedCases();
    }, []);

    const handleImageClick = (photo) => {
        setSelectedImage(photo);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedImage('');
    };

    return (
        <div className='h-screen flex justify-center items-center' style={{ marginTop: '12rem' }}>
            <Card sx={{
                backgroundColor: '#1b263b',
                width: '90%',
                minHeight: '50%',
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                padding: '2rem',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                color: '#e0e1dd',
                marginTop: '2rem' // Added top margin
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ marginBottom: 5 }}>
                        <Typography variant='h4' align='center'>Approved Cases</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={12} sx={{ marginTop: 3 }}>
                                {approvedCases.length > 0 ? (
                                    <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#1b263b' }}>
                                                    <TableCell sx={{ color: "white" }}><b>Case ID</b></TableCell>
                                                    <TableCell sx={{ color: "white" }}><b>Description</b></TableCell>
                                                    <TableCell sx={{ color: "white" }}><b>Approved Date</b></TableCell>
                                                    <TableCell sx={{ color: "white" }}><b>Admin Email</b></TableCell>
                                                    <TableCell sx={{ color: "white" }}><b>Payment Proof</b></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {approvedCases.map((caseItem, index) => (
                                                    <motion.tr
                                                        key={caseItem._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <TableCell>{caseItem._id}</TableCell>
                                                        <TableCell>{caseItem.description}</TableCell>
                                                        <TableCell>{new Date(caseItem.approvedDate).toLocaleString()}</TableCell>
                                                        <TableCell>{caseItem.adminEmail}</TableCell>
                                                        <TableCell>
                                                            <img
                                                                src={caseItem.paymentProof || "/placeholder.svg"}
                                                                alt="Payment Proof"
                                                                style={{ maxWidth: "100px", cursor: "pointer" }}
                                                                onClick={() => handleImageClick(caseItem.paymentProof)}
                                                            />
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant='h5' sx={{ border: 2, paddingY: 1, paddingX: 2, margin: 2, borderRadius: 2, marginTop: 4 }}>
                                        No approved cases available
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: '600px', // Set a maximum width
                    maxHeight: '80%', // Set a maximum height
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto' // Add overflow to handle large images
                }}>
                    <img
                        src={selectedImage}
                        alt="Zoomed Payment Proof"
                        style={{ width: '100%', height: 'auto' }}
                    />
                </Box>
            </Modal>
        </div>
    );
}