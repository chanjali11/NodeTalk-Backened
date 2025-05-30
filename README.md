# NodeTalk-Backend

NodeTalk-Backend is the backend server for the **NodeTalk** real-time chat application, built using **Node.js**, **Express**, and **Socket.IO**. It supports user authentication, private and group messaging, profile photo uploads, and online/offline presence tracking—similar to WhatsApp.

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **Socket.IO** (for real-time communication)
- **MySQL / MongoDB** (based on your DB setup)
- **Sequelize / Mongoose** (ORM/ODM)
- **JWT** (for secure authentication)
- **Multer / Cloudinary / S3** (for image uploads)

---

## 📦 Features

- ✅ User registration and login with OTP verification
- ✅ Real-time private and group chat
- ✅ Online/offline user presence
- ✅ Profile photo upload and user role management
- ✅ Display contact list and profile details
- ✅ RESTful APIs for user, group, and message operations
- ✅ Scalable and maintainable project structure

---

## 📁 Folder Structure

```bash
NodeTalk-Backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── services/
├── utils/
├── config/
├── sockets/
├── uploads/
├── .env
├── app.js
├── server.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v16 or higher
- **MySQL** or **MongoDB** (depending on your setup)
- **Redis** (optional – for scaling sockets across instances)

---

### 📥 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/chanjali11/NodeTalk-Backened.git
cd NodeTalk-Backend
npm install

```

### ⚙️ Environment Variables

Create a `.env` file in the root directory with the following content:

```env
PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret

```

### ▶️ Run the Server

Start the server in development mode:

```bash
npm run dev  # Development mode with nodemon


npm start # Production mode

```

### 🙌 Contributing

##

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a pull request.
