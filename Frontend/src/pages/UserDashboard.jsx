// import React from "react";
// import CardNews from "../components/CardNews";
// import AutorenewTwoToneIcon from "@mui/icons-material/AutorenewTwoTone";

// export default function UserDashboard() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-bold text-center mb-6">Notice Board</h1>
//       <div className="flex items-center justify-center mb-6">
//         <AutorenewTwoToneIcon className="text-blue-500 text-4xl cursor-pointer" />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <CardNews />
//         <CardNews />
//         <CardNews />
//         <CardNews />
//         <CardNews />
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Container, Typography, Grid } from "@mui/material";
import AutorenewTwoToneIcon from "@mui/icons-material/AutorenewTwoTone";
import CardNews from "../components/CardNews";

export default function UserDashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
        Notice Board
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <AutorenewTwoToneIcon sx={{ color: 'blue', fontSize: '2rem', cursor: 'pointer' }} />
      </div>
      <Grid container spacing={3}>
        {[...Array(5)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CardNews />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
