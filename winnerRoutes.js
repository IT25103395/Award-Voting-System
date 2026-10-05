const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();

const {
    getVoteCounts,
    getWinner,
    saveWinner,
    deleteWinner
} = require("../controllers/winnerController");

// Get vote counts and rankings
router.get(
    "/counts",
    authenticateToken,
    authorizeRoles("Admin"),
    getVoteCounts
);

// Get winner and runner-up by category
router.get(
    "/winner/:categoryId",
    authenticateToken,
    authorizeRoles("Admin"),
    getWinner
);

// Save or Update winner
router.post("/save", authenticateToken, authorizeRoles("Admin"), saveWinner);

// Delete winner award record by AwardID
router.delete("/delete/:awardId", authenticateToken, authorizeRoles("Admin"), deleteWinner); // <--- DELETE Route එක

module.exports = router;