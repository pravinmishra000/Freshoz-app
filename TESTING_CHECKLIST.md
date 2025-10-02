
# Freshoz - Feature-wise Test Checklist

This document provides a checklist for testing the core features of the Freshoz grocery delivery application.

**Instructions:**
- Mark the `Status` of each test case as `Pending`, `Pass`, or `Fail`.
- Add notes for any bugs or unexpected behavior found during testing.

---

### 1. Login & Authentication

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Phone Login** | Enter a valid 10-digit Indian phone number and click "Send OTP". | OTP is sent successfully. User is taken to the OTP entry screen. | Pending |
| | Enter an invalid phone number (e.g., 9 digits or contains letters). | An error message "Invalid phone number" is shown. OTP is not sent. | Pending |
| | Enter the correct 6-digit OTP received via SMS. | User is successfully logged in and redirected to the products page. | Pending |
| | Enter an incorrect OTP. | An error message "Login Failed" or "Invalid OTP" is shown. User remains on the OTP screen. | Pending |
| | Check if the country code is fixed to India (+91). | The country code selector should be disabled or fixed to `IN`. It should not show `+44` or other codes. | Pending |
| **Email Login** | Enter valid registered email and password. | User is logged in successfully and redirected to the products page. | Pending |
| | Enter a valid email but an incorrect password. | An error message "Login Failed" or "Invalid credentials" is shown. | Pending |
| | Enter an unregistered email address. | An error message "Login Failed" or "User not found" is shown. | Pending |
| **Email Registration**| Register with a new, valid email, name, and password (min. 6 chars). | A new user account is created in Firebase. User is logged in and redirected. | Pending |
| | Try to register with an email that is already in use. | An error message "Registration Failed" or "Email already in use" is shown. | Pending |

---

### 2. Location Picker (Google Maps)

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Pincode Gate** | On first launch, enter a supported PIN code (e.g., 813213, 812001). | The dialog box closes, and the user can proceed to use the app. | Pending |
| | Enter an unsupported PIN code (e.g., 800001). | An error toast "Service Unavailable" is shown. The dialog box remains open. | Pending |
| **Address Search** | In the address autocomplete field, start typing a location within Bhagalpur/Khagaria. | A list of relevant address suggestions appears below the search box. | Pending |
| | Type a location outside the serviceable area (e.g., "Patna"). | No suggestions should appear, as the search is restricted to the defined bounds. | Pending |
| **Address Selection**| Select a valid address from the suggestions. | The map marker moves to the selected location. The "District," "City," and "Pincode" fields are auto-filled. | Pending |
| **Map Interaction** | Drag the marker on the map to a new position. | The marker stays at the new position. The latitude/longitude for saving is updated. | Pending |
| **Save Address** | After selecting an address, click "Confirm & Save Address". | The address (including street, city, district, pincode, lat, lng) is saved to the user's profile in Firebase. User is redirected back to the profile page. | Pending |

---

### 3. Product Discovery (Instamart-style Cards)

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Product Display**| View a product card on the category page. | The card should clearly display the product image, name, price, and MRP (if different). A discount percentage should be visible if MRP > price. | Pending |
| **Variant Selection**| For a product with multiple variants (e.g., Amul Gold 500ml/1ltr), select a different variant. | The price, MRP, and pack size on the card update instantly to reflect the selected variant. | Pending |
| **Add to Cart** | Click the "Add" button on a product. | The "Add" button changes to a quantity counter (`- 1 +`). The item is added to the cart, and the cart icon/toast updates. | Pending |
| **Quantity Update** | Use the `+` and `-` buttons on the quantity counter. | `+` increases the quantity. `-` decreases it. When quantity becomes 0, the button reverts to "Add". Cart total updates accordingly. | Pending |
| **Cart Sheet** | Open the cart sheet after adding items. | All added items are listed with their correct name, image, quantity, and price. The subtotal is calculated correctly. | Pending |

---

### 4. Checkout Flow

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Address Form** | Navigate to the checkout page. | The shipping address form is pre-filled with the user's default address details. Fields are editable. | Pending |
| | The "District" (Bhagalpur) and "State" (Bihar) fields are fixed. | These fields should be read-only or disabled to prevent changes. | Pending |
| **Order Summary** | Review the Order Summary block. | It should list all items, quantities, and their total price. Delivery fee and final total amount are calculated and displayed correctly. | Pending |
| **Payment Method** | Select "Cash on Delivery (COD)". | The COD option is highlighted. | Pending |
| | Select "UPI", enter a valid UPI ID, and click "Verify". | A "Verified" success message appears. | Pending |
| | Select "UPI", enter an invalid UPI ID, and click "Verify". | An error message "Could not verify UPI ID" is shown. | Pending |
<h4>Thank you for using our service!</h4>
  <p>The service you are using has been created by the Skeleto team.</p>
  <p>If you are satisfied with our service, please consider giving us a star on GitHub.</p>
  <p><a href="https://github.com/skeleto-dev/skeleto" target="_blank">Star us on GitHub</a></p>
  <p>Your support is greatly appreciated!</p>
| **Place Order** | Complete the address form and click "Place Order". | The order is successfully created in Firebase. The cart is cleared. The user is redirected to the "Your Orders" page. | Pending |
| | Try to checkout with an empty cart. | The page should show a message like "Your cart is empty!" and a button to continue shopping. The address form should not be visible. | Pending |

---

### 5. Admin Panel (Web Responsive View)

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Access Control**| Try to access `/admin/dashboard` as a non-admin user. | User is redirected to the home page or login page. An error message may be shown. | Pending |
| | Access `/admin/dashboard` as an admin user. | The admin dashboard loads successfully. | Pending |
| **Dashboard View** | View the admin dashboard. | All stat cards (Total Revenue, Orders, Users) and charts load with data. The layout is responsive and looks good on both desktop and mobile screens. | Pending |
| **Order Management**| Navigate to the "Manage Orders" page. | A list of all customer orders is displayed, sorted newest first. | Pending |
| | Change the status of an order (e.g., from "Placed" to "Preparing"). | The order status updates in the UI and in Firebase. A success toast is shown. A push notification is sent to the user. | Pending |
| | View the orders page on a mobile device. | The order cards stack vertically and are easily readable. All actions (like status update) are accessible. | Pending |
