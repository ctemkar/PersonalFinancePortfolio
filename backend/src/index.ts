import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { transactions, budgets, getSummary } from "./data";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.get("/api/summary", (req, res) => {
  res.json(getSummary());
});

app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.get("/api/budgets", (req, res) => {
  res.json(budgets);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
