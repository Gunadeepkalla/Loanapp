import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users(name, email, password) VALUES($1,$2,$3)",
            [name, email, hashedPassword]
        );

        res.json({ msg: "✅ Registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "❌ Registration failed" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ msg: "❌ User not found" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ msg: "❌ Invalid password" });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, email },
            "your_secret_key",
            { expiresIn: "1d" }
        );

        res.json({ msg: "✅ Login successful", token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "❌ Login failed" });
    }
};
