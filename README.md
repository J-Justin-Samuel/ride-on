# 🚗 RideOn — Real-Time Ride Hailing Platform

> A full-stack, real-time ride-hailing application inspired by Uber, built using modern web technologies and WebSocket-based communication.

![RideOn Banner](./assets/banner.png)

---

## 🌐 Live Demo
🔗 https://ride-on-hazel.vercel.app  

## 📦 GitHub Repository
🔗 https://github.com/J-Justin-Samuel/ride-on  

---

## 📸 Screenshots

### 🏠 Home / Booking Interface
![Home Screen](./assets/home.png)

### 🚗 Driver Matching
![Driver Matching](./assets/matching.png)

### 📍 Live Tracking
![Live Tracking](./assets/tracking.png)

### 📊 Trip Summary
![Trip Summary](./assets/summary.png)

---

## 🚀 Features

### 👤 Passenger
- Search pickup & drop-off locations  
- Choose vehicle type  
- Book rides instantly  
- View driver details (name, vehicle, rating)  
- Track driver in real-time  
- View trip summary and fare breakdown  

### 🚕 Captain (Driver)
- Receive ride requests within a 5 km radius  
- Accept/decline rides with countdown timer  
- Navigate to passenger location  
- Complete rides and update status  

### ⚡ Real-Time System
- WebSocket-based communication (Socket.io)  
- Live GPS location streaming  
- Instant ride notifications  
- Full ride lifecycle without page reloads  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- GSAP (animations)  
- Leaflet (maps)  
- Socket.io Client  

### Backend
- Node.js  
- Express.js  
- Socket.io  

### Database
- MongoDB Atlas  
- Mongoose  

### Authentication
- JWT (JSON Web Tokens)  
- bcrypt  

### Maps & Geolocation
- OpenStreetMap  
- Nominatim API  
- Leaflet  

---

## 🧠 Architecture Overview

![Architecture Diagram](./assets/architecture.png)

**Flow:**
1. Passenger requests ride  
2. Backend filters nearby drivers (Haversine formula)  
3. Drivers receive request via WebSocket  
4. Driver accepts → ride assigned  
5. Live location updates streamed  
6. Ride completes → summary generated  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/J-Justin-Samuel/ride-on.git
cd ride-on
