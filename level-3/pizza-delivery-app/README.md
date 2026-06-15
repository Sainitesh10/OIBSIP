# PizzaFlow — Full-Stack Pizza Delivery Web Application

This is a premium MERN stack web application built for the **Oasis Infobyte Web Development & Design Internship (Level 3)**. It features a hand-crafted pizza menu, a step-by-step custom pizza builder, dual roles (admin and user dashboards), integration with a mock Razorpay checkout flow, inventory restocking management, and automated stock breach email notifications.

---

## 🚀 Key Features

*   **Custom Pizza Builder Wizard:** Multi-step choice selector (Base ➡️ Sauce ➡️ Cheese ➡️ Veggies) checking live inventory levels and calculating prices dynamically.
*   **Dual Dashboard Views:**
    *   **User Dashboard:** Orders feed, cart checkout panel, delivery address input, and transaction logs.
    *   **Admin Control Panel:** Live inventory stock gauges, restocking triggers, new ingredient catalog entry form, and order dispatch tracking manager.
*   **Auto-Database Seeder:** Seeds 5 pizza bases, 5 sauces, cheeses, veggies, meats, and 3 default preset menu pizzas automatically on start if the database is empty.
*   **Sandbox Payment Checkout:** Integrates a simulated Razorpay payment signature validator, bypassing live transaction requirements for easy local testing.
*   **Automated Stock Warnings:** Automatically emails low-stock alerts to the admin inbox if any ingredient count falls below 20 items.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Install Dependencies
Run the command below in the project root directory to automatically install dependencies for the root, backend, and frontend folders:
```bash
npm run install-all
```

### 3. Database Connection
*   By default, the server will attempt to connect to a local MongoDB server at `mongodb://127.0.0.1:27017/pizza-delivery`.
*   If you do not have MongoDB running locally, open the `.env` file at the root folder and edit the `MONGO_URI` variable to point to your **MongoDB Atlas Cloud URI**:
    ```env
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pizza-delivery?retryWrites=true&w=majority
    ```

---

## 🏃 Run App Locally

To start both the Node.js backend and Vite React frontend concurrently:
```bash
npm run dev
```
*   **Vite Frontend Development Portal:** `http://localhost:5173/`
*   **Express Backend API Server:** `http://localhost:5000/`

---

## 🧪 Testing Guidelines (Walkthrough)

### 1. Create a Store Admin Account
1. Open the signup screen (`http://localhost:5173/register`).
2. Input your name and email.
3. Set the **Choose System Role** dropdown to **Store Administrator (Admin)** and click Sign Up.
4. **Verifying via Email:** Check the terminal where you launched `npm run dev`. Look for the following debug link:
   `🔗 View test email inbox here: https://ethereal.email/message/...`
5. Open this link in your browser to view the mock verification email, copy the **6-digit OTP code**, and paste it into the verification screen.

### 2. Customize Pizza & Checkout
1. Register a regular **Customer / User** account (verify using the same OTP preview link steps).
2. Go to the dashboard and select **🎨 Custom Pizza Builder**.
3. Choose your base, sauce, cheese, and veggies, and click **Confirm & Add**.
4. Input your delivery address in the cart sidebar, and click **Pay with Razorpay**.
5. **Simulating Payment:** Since the default credentials in `.env` are test credentials, a **Razorpay Sandbox Bypass Modal** will open. Click **Mock Success (Pay)** to complete the payment transaction.
6. You will be redirected to the **Track My Orders** timeline.

### 3. restock Inventory & Status updates
1. Log in to your **Store Administrator** account.
2. Go to the **⚙️ Admin Panel** page.
3. Locate the customer order in the **Dispatch Board** and change the status (e.g. `In the kitchen`, `Sent to delivery`).
4. **Real-time Tracker:** View the customer order tracking screen. Notice the status bar changes dynamically matching the administrator's updates (via automated 5-second backend polling).
5. **Alert Warnings:** If you place consecutive custom orders that deplete a specific veggie or base below 20 items, look at the terminal logs. Nodemailer will trigger a stock breach warning email, printing a mock preview URL warning the admin to refill stock levels.
