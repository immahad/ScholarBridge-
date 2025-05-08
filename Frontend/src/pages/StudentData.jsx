// import React from "react";
// import StudentTable from "../components/StudentTable";

// export default function StudentData() {
//   return (
//     <div className="  mx-auto p-8">
//       <div className='text-3xl '>User Profile</div>
//       <div className='my-3'>
//         <a href="/">Home</a>
//         <span className='text-amber-600 hover:f'>
//           <span className='mx-3'>/</span>
//           <a href="/messaging">User Profile</a>
//         </span>
//       </div>
//       <div className="bg-white border shadow-md rounded-lg overflow-hidden mt-7">
//         <div className="">
//           <StudentTable />
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Container, Breadcrumbs, Link, Typography, Paper } from "@mui/material";
import StudentTable from "../components/StudentTable";

export default function StudentData() {
  return (
    <Container maxWidth="lg" sx={{ mx: 'auto', py: 5 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>User Profile</Typography>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <Typography color="textPrimary">User Profile</Typography>
      </Breadcrumbs>
      <Paper sx={{ mt: 3 }}>
        <StudentTable />
      </Paper>
    </Container>
  );
}
