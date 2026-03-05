import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// =====================
// INIT DATABASE
// =====================

async function initializeDatabase() {
  const query = `
  CREATE TABLE IF NOT EXISTS street_food (
    id SERIAL PRIMARY KEY,
    food_name TEXT NOT NULL,
    country TEXT NOT NULL,
    spicy_level INTEGER CHECK (spicy_level BETWEEN 0 AND 10),
    price NUMERIC(6,2),
    rating INTEGER CHECK (rating BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await pool.query(query);
  } catch (error) {
    console.error("Database initialization error:", error.message);
    process.exit(1);
  }
}

// =====================
// VALIDATION
// =====================

function isNumber(value) {
  return !isNaN(value);
}

function validateSpicy(spicy) {
  if (!isNumber(spicy) || spicy < 0 || spicy > 10) {
    throw new Error("Spicy level must be between 0 and 10");
  }
}

function validateRating(rating) {
  if (!isNumber(rating) || rating < 1 || rating > 10) {
    throw new Error("Rating must be between 1 and 10");
  }
}

function validatePrice(price) {
  if (!isNumber(price)) {
    throw new Error("Price must be a number");
  }
  if (price < 0) {
    throw new Error("Price must be >= 0");
  }
}

// =====================
// ADD FOOD
// =====================

async function addFood(name, country, spicy, price, rating) {
  try {
    if (!name || !country) {
      throw new Error("Name and country are required");
    }

    validateSpicy(spicy);
    validateRating(rating);
    validatePrice(price);

    const query = `
    INSERT INTO street_food
    (food_name, country, spicy_level, price, rating)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `;

    const values = [name, country, spicy, price, rating];
    const res = await pool.query(query, values);

    console.log("Food added:");
    console.table(res.rows);
  } catch (error) {
    console.error("Add error:", error.message);
  }
}

// =====================
// LIST FOOD
// =====================

async function listFood() {
  try {
    const res = await pool.query(`
    SELECT id, food_name, country, price, spicy_level, rating
    FROM street_food
    ORDER BY id DESC
    `);

    if (res.rows.length === 0) {
      console.log("Database is empty");
      return;
    }

    console.table(res.rows);
  } catch (error) {
    console.error("List error:", error.message);
  }
}

// =====================
// UPDATE (rating / price)
// =====================

async function updateField(field, id, newValue) {
  try {
    if (!isNumber(id)) {
      throw new Error("ID must be a number");
    }

    if (field !== "rating" && field !== "price") {
      throw new Error("Field must be 'rating' or 'price'");
    }

    if (field === "rating") {
      validateRating(newValue);
    }

    if (field === "price") {
      validatePrice(newValue);
    }

    const query = `
      UPDATE street_food
      SET ${field} = $1
      WHERE id = $2
      RETURNING *
    `;

    const res = await pool.query(query, [newValue, id]);

    if (res.rows.length === 0) {
      console.log("Food not found");
      return;
    }

    console.log(`${field} updated:`);
    console.table(res.rows);
  } catch (error) {
    console.error("Update error:", error.message);
  }
}

// =====================
// DELETE FOOD
// =====================

async function deleteFood(id) {
  try {
    if (!isNumber(id)) {
      throw new Error("ID must be a number");
    }

    const res = await pool.query(
      `DELETE FROM street_food WHERE id=$1 RETURNING *`,
      [id]
    );

    if (res.rows.length === 0) {
      console.log("Food not found");
      return;
    }

    console.log("Food removed");
  } catch (error) {
    console.error("Delete error:", error.message);
  }
}

// =====================
// HELP
// =====================

const command = process.argv[2];

(async () => {
  await initializeDatabase();

  switch (command) {
    case "help":
      console.log(`

Street Food Help
===========================================

Commands:

  add <name> <country> <spicy> <price> <rating>
      Add a new street food item

  list
      Show all food in the database (sorted by newest id)

  update <rating|price> <id> <new_value>
      Update rating or price for a food item

  delete <id>
      Remove food from the database


Examples:

  node db.js add Taco Mexico 7 4.50 9
  node db.js list
  node db.js update rating 2 10
  node db.js update price 2 5.50
  node db.js delete 3

===========================================
`);
      break;

    case "add":
      if (process.argv.length < 8) {
        console.log("Usage: node db.js add NAME COUNTRY SPICY PRICE RATING");
        break;
      }

      await addFood(
        process.argv[3],
        process.argv[4],
        Number(process.argv[5]),
        Number(process.argv[6]),
        Number(process.argv[7])
      );
      break;

    case "list":
      await listFood();
      break;

    case "update":
      if (process.argv.length < 6) {
        console.log("Usage: node db.js update rating|price ID NEW_VALUE");
        break;
      }

      await updateField(
        process.argv[3],        
        Number(process.argv[4]), 
        Number(process.argv[5]) 
      );
      break;

    case "delete":
      if (process.argv.length < 4) {
        console.log("Usage: node db.js delete ID");
        break;
      }

      await deleteFood(Number(process.argv[3]));
      break;

    default:
      console.log("Unknown command. Use 'help'");
  }

  process.exit();
})();
