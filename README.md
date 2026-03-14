# An.n.Ash Handmade Jewelry E-Commerce Platform

This is a complete, production-ready full-stack e-commerce platform built for a handmade jewelry brand. It features a modern, minimal, aesthetic design (cream, pastel pink, soft beige, gold accents) with an elegant serif typography.

## Tech Stack
*   **Frontend**: Next.js (App Router), React, TailwindCSS, Axios
*   **Backend**: Node.js, Express, Mongoose (MongoDB)
*   **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
*   **Payments**: Razorpay API integration
*   **Image Storage**: Cloudinary (via multer-storage-cloudinary) 
*   **Email**: Nodemailer (Structure implemented for mocking/real use)
*   **Shipping**: Delhivery / Shiprocket (Mock structure implemented)

## Features
*   **User Journeys**: Registration, Login, Profile updates, Order History.
*   **Shopping**: Browse catalog, Categorized filtering, Sorting, Product descriptions, Stock validation.
*   **Checkout Flow**: Cart state management (localStorage), Shipping address, Payment Selection (Razorpay mock integrated).
*   **Bespoke Orders**: Custom jewelry request form with image upload and budget tracking.
*   **Admin Dashboard**: Manage products, Track orders and update statuses, Review and accept bespoke custom jewelry requests.

## Deployment Instructions

### 1. Database Setup (MongoDB Atlas)
1.  Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Deploy a free cluster and create a new database user.
3.  Whitelist your IP address (or `0.0.0.0/0` for production via Vercel/Render).
4.  Get your connection string and add it to `MONGODB_URI` in the backend `.env`.

### 2. Backend Deployment (Render / Heroku)
1.  Push your code to GitHub.
2.  Connect the `backend` folder to a service like [Render](https://render.com).
3.  Add the environment variables listed below to your service settings.
4.  Set the start command to `npm start`.

### 3. Frontend Deployment (Vercel)
1.  Connect your GitHub repository to [Vercel](https://vercel.com).
2.  Set the Root Directory to `frontend`.
3.  Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend.
4.  Deploy.

## Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/annash
JWT_SECRET=super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=https://annash-jewelry.vercel.app
SHIPROCKET_EMAIL=your_shiprocket_email@abc.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_PICKUP_LOCATION=Primary
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

## Running Locally

1. **Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

2. **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
