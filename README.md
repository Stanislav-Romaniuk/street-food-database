# Support the Author

If you want to support the development of this project, you can make a donation.

## 🇺🇦 Ukraine (UAH)
4441 1111 0773 8019

---

# Street Food CLI

A simple **Node.js CLI application** for managing street food data in a **PostgreSQL database**.

The application allows you to add, view, update, and delete street food items directly from the command line.

---

# Features

- Add new street food items
- View all items in the database
- Update rating or price
- Delete items
- Input validation
- PostgreSQL database integration

---

# Technologies

- Node.js
- PostgreSQL
- pg (node-postgres)
- dotenv

---

# Database Structure

Table: `street_food`

| Column | Type | Description |
|------|------|------|
| id | SERIAL | Unique ID |
| food_name | TEXT | Name of the food |
| country | TEXT | Country of origin |
| spicy_level | INTEGER | Spiciness level (0-10) |
| price | NUMERIC(6,2) | Price |
| rating | INTEGER | Rating (1-10) |
| created_at | TIMESTAMP | Date of creation |

---

# Installation

Clone the repository:

```bash
git clone https://github.com/your-username/street-food-database.git
cd street-food-database


