
# 🚀 Prominence Bank Secure Portal - Full Integration & Deployment Guide

This application is a **Hybrid Professional System**. It splits responsibilities between a high-performance frontend and a secure WordPress database backend.

---

## 🏗️ 1. Technical Architecture (The "Full" Description)

To run this portal, you need **two environments** working together:

### A. The Frontend (Next.js & Node.js)
*   **Purpose**: Handles the 9-step UI, client-side validation, signature drawing, and AI summary generation.
*   **Technology**: React, Tailwind CSS, and Genkit AI.
*   **Hosting Requirement**: **Requires Node.js 18+**. You must run this on a server (e.g., AWS EC2, DigitalOcean, or Vercel).
*   **Node Modules**: These are essential. The app will not start without them as they contain the logic for the interface and AI.

### B. The Backend (WordPress & PHP)
*   **Purpose**: Acts as the secure "Safe" for your data. It provides the Admin Dashboard and handles the `wp_mail` delivery.
*   **Technology**: PHP and MySQL.
*   **Hosting Requirement**: A standard WordPress installation.
*   **Integration**: The WordPress plugin uses an `<iframe>` to display the Next.js frontend. It also provides a REST API that the frontend sends data to.

---

## 🛠️ 2. Step-by-Step Deployment

### Step 1: Prepare the Frontend (Node.js)
1.  **Upload Code**: Upload the project files to your Node.js server.
2.  **Install Engine**: Run `npm install`. This creates the `node_modules` folder.
3.  **Set AI Key**: Create a `.env` file and add your `GOOGLE_GENAI_API_KEY`.
4.  **Set API URL**: Add `NEXT_PUBLIC_FAAP_API_URL=http://your-wordpress-site` to `.env` (for WP endpoint requests).
5.  **Start Service**: Run `npm run build` then `npm start`. Note the URL (e.g., `http://your-server-ip:9002`).

### Step 2: Install the WordPress Plugin (PHP)
1.  **Upload**: Copy `wordpress-plugin-bridge.php` to your WordPress site at `/wp-content/plugins/financial-portal/`.
2.  **Activate**: Go to **WordPress -> Plugins** and activate "Financial Account Application Portal".
3.  **Check IP**: Ensure the URL in the plugin's `add_shortcode` function matches your Next.js server URL.

### Step 3: Set Your Icon (Favicon)
1.  I cannot process local system files or binary images.
2.  **Action**: Copy your image (`icon.jpg`) to the `/public` folder of the Next.js project.
3.  **Rename**: Rename it to `favicon.ico`. Next.js 15 will handle the rest automatically.

### Step 4: Go Live
1.  Create a page in WordPress.
2.  Add the shortcode: `[financial_form]`
3.  Users will see the professional 9-step form. Submissions will appear in **WordPress -> Financial Portal**.

---

## 📊 3. Why this approach?
By using Next.js for the UI, you get a **banking-grade experience** (fast, responsive, secure) that WordPress alone cannot provide. By using WordPress for the backend, you get an **easy-to-use dashboard** and secure database storage you already trust.
