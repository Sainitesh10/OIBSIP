# OIBSIP — Oasis Infobyte Web Development Internship Tasks

This repository hosts my completed tasks for the **Oasis Infobyte Web Development & Design Internship**. The repository has been restructured to only contain clean, verified task code.

---

## 📂 Repository Structure

```bash
OIBSIP/
│
├── README.md                    # Repository documentation
├── .gitignore                   # Excludes system files
│
├── level-1/
│   ├── landing-page/
│   │   └── index.html           # Task 1: FlowSync Landing Page
│   │
│   ├── portfolio/
│   │   └── index.html           # Task 2: Personal Developer Portfolio
│   │
│   └── temperature-converter/
│       └── index.html           # Task 3: Temperature Converter
│
├── level-2/
│   ├── calculator/
│   │   └── index.html           # Task 1: Cyberpunk Calculator (CALC//SYS)
│   │
│   ├── tribute/
│   │   └── index.html           # Task 2: Hardik Pandya Tribute Page
│   │
│   ├── todo-app/
│   │   └── index.html           # Task 3: TaskFlow (To-Do Web App)
│   │
│   └── login-auth/
│       └── index.html           # Task 4: AuthFlow (Login Authentication)
│
└── level-3/
    └── pizza-delivery-app/      # Task 1: PizzaFlow (MERN Pizza Delivery App)
```

---

## 🛠️ Completed Tasks Details

### 🟢 Level 1 Tasks

#### 1. Landing Page (FlowSync)
*   **Description:** A modern, high-converting product landing page for a fictional productivity app called FlowSync.
*   **Key Features:** Beautiful custom typography, hover transitions, dynamic testimonial cards, responsive price plans, and structured navigation.
*   **Tech Stack:** HTML5, Custom Vanilla CSS.

#### 2. Personal Portfolio
*   **Description:** An interactive terminal-styled developer portfolio page outlining skills, projects, experience, and contact forms.
*   **Live Demo:** [sainitesh.vercel.app](https://sainitesh.vercel.app/)
*   **Tech Stack:** HTML5, CSS3, Vanilla JavaScript.

#### 3. Temperature Converter
*   **Description:** An interactive bidirectionally translating temperature converter.
*   **Key Features:** Support for Celsius, Fahrenheit, and Kelvin scales, mathematical formula breakdown explanations, custom background ambient animations, and active state transformations.
*   **Tech Stack:** HTML5, CSS3 Grid/Flexbox, JavaScript.

### 🟡 Level 2 Tasks

#### 1. Calculator (CALC//SYS)
*   **Description:** A retro-themed cyberpunk grid calculator.
*   **Key Features:** Chained math calculations, Division by Zero safety handling, exponential conversion limits for long digits, visual ripple animations, and full keyboard input support.
*   **Tech Stack:** HTML5, Custom CSS, Vanilla JavaScript.

#### 2. Tribute Page
*   **Description:** A rich timeline and content tribute page honoring Hardik Pandya, "The Comeback King".
*   **Key Features:** Responsive grids, custom layout cards, timeline tracking, and aesthetic media integration.
*   **Tech Stack:** HTML5, CSS3.

#### 3. Todo Web App
*   **Description:** A functional task tracking web application named TaskFlow.
*   **Key Features:** Live clocks, progress bars showing completion percentage, distinct lists for pending and completed tasks, input validation, edits, and deletions.
*   **Tech Stack:** HTML5, CSS3, JavaScript.

#### 4. Login Authentication
*   **Description:** A secure, simulated client login flow and dashboard named AuthFlow.
*   **Key Features:** Multi-page switching (Login, Registration, OTP Validation, Password Reset), password strength indicators, OTP inputs, validation errors, and custom dashboards.
*   **Tech Stack:** HTML5, CSS3, JavaScript.

### 🔵 Level 3 Tasks

#### 1. Pizza Delivery Application (PizzaFlow)
*   **Description:** A premium full-stack pizza delivery web application built using the MERN stack (MongoDB, Express, React, Node.js).
*   **Key Features:** Hand-crafted menu items, custom pizza builder wizard (Base ➡️ Sauce ➡️ Cheese ➡️ Veggies), secure authentication with JWT & OTP verification, order placement with simulated Razorpay checkouts, an Admin Dashboard (order status workflow tracking, ingredient inventory refilling, addition of new items), and real-time low-stock admin notifications via NodeMailer.
*   **Tech Stack:** React, Node.js, Express, MongoDB (Mongoose), custom cyberpunk CSS, Nodemailer, Razorpay.

---

## 🖥️ Running Locally

### Level 1 & Level 2 Tasks (Static HTML/CSS/JS)
1. Navigate to the directory of the task (e.g. `level-1/landing-page/`).
2. Open `index.html` in your web browser to run it.

### Level 3 Task (Full-Stack MERN App)
1. Navigate to `level-3/pizza-delivery-app`.
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   * Frontend will run at `http://localhost:5173/` and Backend API at `http://localhost:5000/`.
