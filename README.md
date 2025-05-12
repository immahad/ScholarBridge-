# ScholarBridge

Advanced Scholarship Management System

## Email Configuration Setup

To enable email functionality (account verification, password reset, notifications):

1. Create a `.env` file in the Backend directory with the following email settings:
```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@scholarbridge.com
```

2. For Gmail:
   - Use an App Password instead of your regular password
   - Enable 2-Factor Authentication
   - Generate an App Password at: Google Account → Security → App Passwords

## Payment Integration

To enable Stripe payment processing:

1. Add the following to your `.env` file:
```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

2. Sign up for a Stripe account: https://dashboard.stripe.com/register
3. Get your API keys from the Stripe Dashboard
4. For local testing, install the Stripe CLI to forward webhooks: https://stripe.com/docs/stripe-cli

## Other Environment Variables

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/scholarship_management

# JWT Configuration
JWT_SECRET=scholarbridge-super-secret-key-replace-in-production
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=scholarbridge-refresh-secret-key-replace-in-production
JWT_REFRESH_EXPIRE=7d

# Frontend URL for CORS and email links
FRONTEND_URL=http://localhost:3000

# Cache Configuration
CACHE_ENABLED=false
```

ScholarBridge is a full-stack web application developed using the MERN (MongoDB, Express.js, React.js, Node.js) stack. The system aims to automate the scholarship lifecycle by providing dedicated dashboards for students, donors, and admins. Students can apply for scholarships, donors can fund applicants, and admins can manage the entire workflow.
