# Expenses Tracker

A full-stack web application to track and split both personal and group expenses easily.  
Built using React, Tailwind CSS, Node.js, Express and MongoDB Atlas.

---

## 🔍 Features

- User registration & login with secure authentication (JWT + bcrypt)  
- Personal expense logging: Add, edit, delete individual expenses  
- Group expense sharing: Create/join groups, add shared expenses, automatic split calculations  
- Budget tracking: Set weekly/monthly/yearly budget for yourself or any group you are part of.   
- Feedback module: Submit feedback or bug reports directly from the app  
- Responsive UI built with Tailwind CSS for smooth experience on desktop & mobile  

---

## 🛠️ Tech Stack

| Layer        | Technology                    |
|--------------|------------------------------|
| Frontend     | React.js + Tailwind CSS       |
| Backend      | Node.js + Express.js          |
| Database     | MongoDB Atlas (NoSQL cloud)   |
| Auth         | JWT (JSON Web Token) + bcrypt |

---

## 🚀 Getting Started

### Prerequisites  
Install Node.js, npm, and ensure you have a MongoDB Atlas account & cluster.

### Setup  
1. Clone the repository:
```
git clone https://github.com/Monish395/Expenses_Tracker.git
```

2. Navigate into backend directory:
```  
cd Expenses_Tracker/backend
```

3. Install backend dependencies:  
```
npm install
```

4. Create `.env` file in backend folder with:
```env
MONGO_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-secret-key>
```

5. Start the backend server:
```
npm run dev
```

6. Open another terminal, navigate to frontend folder and install dependencies:
```
cd ../expenses_tracker
npm install
```

7. Start the frontend:
```
npm run start
```

8. Open your browser at http://localhost:5173 and start using the app.

## ✅ Key Outcomes

- The system meets all major **functional and non-functional requirements**  
- User interface is **intuitive and responsive**  
- MongoDB Atlas backend supports a **flexible schema** for quick iteration  
- Scalable architecture allows **future enhancements** like live updates or a mobile app  

---

## ⚠️ Limitations & Future Work

- Mobile-specific styling can be improved further  
- Export of reports (**CSV/PDF**) and payment gateway integration planned for next version  

---

## 📂 Folder Structure

```plaintext
Expenses_Tracker/
├── backend/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
└── README.md
```

## 🙋 Contact

For any questions or feedback, feel free to reach out:

**👤 Monish D**  
[![GitHub](https://img.shields.io/badge/GitHub-Monish395-black?logo=github)](https://github.com/Monish395)





