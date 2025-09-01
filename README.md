# BookKeeper 📚

A modern **book discovery & lending** platform with role‑based dashboards for **Readers**, **Librarians**, and **Admins**. Browse and organize books, see availability across libraries, and request copies. Staff manage books, libraries, inventory, requests, and librarian applications — all in a clean Material UI.

**Live Website (Frontend): https://book-keeper-470.vercel.app/**  
Frontend hosted on **Vercel** · Backend hosted on **Render**

---

## Highlights

- Beautiful, responsive UI (Material UI) with a **collapsible sidebar** and consistent admin tables.
- **Library availability** at a glance: each book shows which libraries stock it and how many copies.
- **Flexible checkout** from the cart:
  - Assign different books to **different libraries** and send grouped requests.
  - Partial requests: if a library can’t fulfill everything, we still send what it can; the rest remain in your cart.
  - One‑click **Request Book** from any library row.
- **Librarian Applications** flow (approve/reject) that auto‑creates the library on approval.
- **Account Settings** with avatar upload, theme picker, and password change.
- **AI‑Powered Recommendations** (featured on the reader dashboard):
  - Personalized picks based on finished books.
  - Confidence scores and fast, on‑demand ranking.
  - See details in **AI_RECOMMENDATIONS.md** and the development notebook **Book_Recommender.ipynb**.

---

## Tech Stack & Libraries

**Frontend**

- React, React Router
- Material UI (MUI) + Emotion
- Axios, Day.js
- Framer Motion, Bootstrap (utility styles)
- Testing Library & Web Vitals

**Backend**

- Node.js, Express
- MongoDB, Mongoose
- JWT Auth (jsonwebtoken, bcryptjs)
- Validation (Joi), Security (Helmet, CORS)
- File upload (Multer)

> See `frontend/package.json` and `backend/package.json` for the full list.

---

## Quick Start

### 1) Backend

```bash
cd backend
npm install
npm run dev   # starts on PORT from .env (e.g., 5000)
```

Create **backend/.env** (example):

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=<your-secret>
FRONTEND_URL=http://localhost:3000

JWT_EXPIRES_IN=7d
ADMIN_EMAIL=<seed-admin-email>
ADMIN_PASSWORD=<seed-admin-password>
```

### 2) Frontend

```bash
cd frontend
npm install
npm start     # React dev server on :3000
```

Create **frontend/.env** (example):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

---

## AI Recommendations

The recommendation service analyzes a user’s finished books and returns ranked suggestions with confidence scores. It’s integrated into the dashboard API and rendered as a modern, card‑based UI.

- Read the implementation notes in **AI_RECOMMENDATIONS.md**.
- Prototype/model training lives in **Book_Recommender.ipynb**.
- Language was filtered using **Porter Stemmer** from **nltk** Library
- For Fit and Transform, **Count Vectorizer** model from **sklearn** Library was used
- For Similarity scores, **Cosine Similarity** from **sklearn** Library was implemented

---

## Deployment

- **Frontend**: Vercel → `https://book-keeper-470.vercel.app/`
- **Backend**: Render (set `REACT_APP_API_URL` in the frontend to the Render API URL).

---

## License

See **LICENSE** for the full credentials. Unauthorized use, copying, or distribution is strictly prohibited and will be subject to legal action.
No form of Plagiarism will be entertained.
