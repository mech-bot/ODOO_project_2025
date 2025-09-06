# ODOO_project_2025
Project Document: "EcoFinds - Sustainable Second-Hand Marketplace"

This is an HTML file for a web application called "EcoFinds". It functions as a sustainable marketplace where users can buy and sell eco-friendly products. The application is built as a single-page application (SPA) using vanilla JavaScript and Tailwind CSS.

Key Features and Functionality:
Single-Page Application (SPA) Architecture: The application uses a single HTML file with different "views" (<div class="view">) that are shown or hidden based on the URL hash (e.g., #products, #dashboard, #cart).

Data Storage: Data such as user information, product listings, shopping cart items, and past orders are stored directly in the browser's localStorage. The data is saved and loaded using the app.saveData() and app.loadData() functions.

User Management: The app includes a complete user authentication system with pages for:

Registration: Users can create a new account with a username, email, and password.

Login: Users can sign in to their account.

Profile Dashboard: Logged-in users can view and update their profile and manage their product listings.

Logout: Users can log out of their account.

Product Listings:

Users can browse and search for sustainable products.

Filtering is available by category (e.g., Upcycled, Handmade, Organic).

Logged-in users can create, edit, and delete their own product listings.

Shopping Cart and Orders:

Authenticated users can add products to their shopping cart.

The cart data is saved to localStorage.

Users can remove items from their cart.

A checkout process moves the items from the cart to an orders list.

Users can view a history of their past orders.

User Interface (UI) and Design:

The design is responsive and uses Tailwind CSS for styling.

The UI includes a dynamic header and a persistent bottom navigation bar for easy access to different sections of the app.

It uses a notification system to provide user feedback for actions like login, registration, and adding to cart.

The app has a splash screen on initial load.

Progressive Web App (PWA) Features: The application is configured to be installable on a user's device as a Progressive Web App. It includes a service worker registration and a feature that prompts users to install the app. It also has a basic haptic feedback (vibrate()) function for user interactions.
