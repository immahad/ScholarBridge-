# MongoDB Atlas Triggers for ScholarBridge

This README explains how to set up and test MongoDB Atlas triggers that send email notifications when students apply for scholarships.

## Prerequisites

- MongoDB Atlas account with a cluster set up
- Your ScholarBridge backend running locally or deployed
- `localtunnel` and `axios` packages installed (included in dependencies)

## Email Configuration

1. Make sure your `.env` file includes the following email configuration:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_FROM=noreply@scholarbridge.com
```

2. If using Gmail, you need to create an App Password:
   - Go to your Google Account → Security
   - Under "Signing in to Google," select "App passwords" (requires 2-Step Verification)
   - Generate a new app password for "Mail" and use it as `EMAIL_PASSWORD`

## Setting Up MongoDB Atlas Trigger

1. Start your localtunnel to get a public URL for your local server:

```
npm run tunnel
```

2. Copy the generated trigger function displayed in the console.

3. In MongoDB Atlas:
   - Go to your cluster → Database Triggers
   - Click "Add Trigger"
   - Set Trigger Type to "Database"
   - Set Event Type to "Insert"
   - Select your database and the "applications" collection
   - Enable "Full Document"
   - In the Function Editor, paste the copied function
   - Save the trigger

## Testing the Trigger

There are two ways to test the trigger:

### 1. Using Real Data (Recommended)

```
npm run test-trigger
```

This will:
- Connect to your MongoDB database
- Find a real student and scholarship
- Create a test application with these real IDs
- Send the webhook to your local server
- Test if email gets sent properly

### 2. Creating a Real Application in the Database

To test the actual MongoDB Atlas trigger:
1. Make sure your localtunnel is running (`npm run tunnel`)
2. Go to the ScholarBridge frontend
3. Log in as a student
4. Apply for a scholarship
5. The Atlas trigger should send the webhook to your localtunnel URL
6. Check the server logs for email sending result

## Troubleshooting

- **404 Student/Scholarship Not Found**: Make sure you have real students and scholarships in your database. The test script looks for verified students and active scholarships.
- **Email Not Sending**: Check your email configuration and ensure you're using a proper app password for Gmail.
- **Webhook Not Receiving**: Ensure your localtunnel is running and the URL is correctly set in the MongoDB trigger function.
- **Trigger Not Firing**: Check Atlas logs to see if the trigger is being activated when documents are inserted.

## Debug Endpoints

- GET `/api/triggers/test`: Simple endpoint to test webhook connectivity
- POST `/api/triggers/application-submitted`: Endpoint that receives application submission event

You can monitor your MongoDB trigger execution in the Atlas UI under the "Logs" tab in the Trigger details. 