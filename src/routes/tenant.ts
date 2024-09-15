import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.status(201).json({
    message: "Tenant created successfully",
  });
});

export default router;
