const { sql, poolPromise } = require("../config/db");

const ResultService = require("../services/resultService");

const {
    NotificationService,
    AuditNotificationDecorator
} = require("../patterns/NotificationService");

const resultService = new ResultService();

const notifier =
    new AuditNotificationDecorator(
        new NotificationService()
    );


// =====================================================
// LOAD CATEGORY CANDIDATES
// =====================================================

async function loadCategoryCandidates(pool, categoryId) {

    const result = await pool
        .request()
        .input(
            "CategoryID",
            sql.Int,
            categoryId
        )
        .query(`
            WITH VoteCounts AS (
                SELECT
                    NomineeID,
                    COUNT(*) AS VoteCount
                FROM Votes
                GROUP BY NomineeID
            ),

            JudgeScores AS (
                SELECT
                    NomineeID,
                    AVG(CAST(Score AS FLOAT))
                        AS JudgeAverageScore
                FROM Evaluations
                GROUP BY NomineeID
            )

            SELECT
                n.NomineeID,
                n.NomineeName,
                ac.CategoryID,
                ac.CategoryName,

                ISNULL(
                    vc.VoteCount,
                    0
                ) AS VoteCount,

                ISNULL(
                    js.JudgeAverageScore,
                    0
                ) AS JudgeAverageScore

            FROM Nominees n

            INNER JOIN AwardCategories ac
                ON ac.CategoryID = n.CategoryID

            LEFT JOIN VoteCounts vc
                ON vc.NomineeID = n.NomineeID

            LEFT JOIN JudgeScores js
                ON js.NomineeID = n.NomineeID

            WHERE ac.CategoryID = @CategoryID
              AND n.Status = 'Active';
        `);

    return result.recordset;
}


// =====================================================
// GET VOTE COUNTS / RANKINGS
// =====================================================

const getVoteCounts = async (req, res) => {

    try {

        const pool = await poolPromise;

        const categories = await pool
            .request()
            .query(`
                SELECT
                    CategoryID,
                    CategoryName
                FROM AwardCategories
                ORDER BY CategoryID;
            `);

        const output = [];

        for (const category of categories.recordset) {

            const candidates =
                await loadCategoryCandidates(
                    pool,
                    category.CategoryID
                );

            const ranked =
                resultService.rank(candidates);

            output.push(...ranked);
        }

        res.json({
            success: true,
            results: output
        });

    } catch (error) {

        console.error(
            "Get vote counts error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get vote counts",
            error: error.message
        });
    }
};


// =====================================================
// GET WINNER FOR CATEGORY
// =====================================================

const getWinner = async (req, res) => {

    try {

        const categoryId =
            Number.parseInt(
                req.params.categoryId,
                10
            );

        if (!Number.isInteger(categoryId)) {

            return res.status(400).json({
                success: false,
                message:
                    "Category ID must be valid"
            });
        }

        const pool = await poolPromise;

        const candidates =
            await loadCategoryCandidates(
                pool,
                categoryId
            );

        if (!candidates.length) {

            return res.status(404).json({
                success: false,
                message:
                    "No nominees found for this category"
            });
        }

        const ranked =
            resultService.rank(candidates);

        const top =
            ranked.filter(
                x => x.Ranking === 1
            );

        res.json({
            success: true,
            tie: top.length > 1,
            results: ranked,
            winner:
                top.length === 1
                    ? top[0]
                    : null
        });

    } catch (error) {

        console.error(
            "Get winner error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to calculate winner",
            error: error.message
        });
    }
};


// =====================================================
// SAVE / UPDATE WINNER
// =====================================================

const saveWinner = async (req, res) => {

    try {

        const categoryId =
            Number.parseInt(
                req.body?.categoryId,
                10
            );

        const awardYear =
            Number.parseInt(
                req.body?.awardYear,
                10
            );

        const manualWinnerId =
            req.body?.winnerNomineeId !== undefined &&
            req.body?.winnerNomineeId !== null
                ? Number.parseInt(
                    req.body.winnerNomineeId,
                    10
                )
                : null;


        // =================================================
        // VALIDATE CATEGORY + YEAR
        // =================================================

        if (
            !Number.isInteger(categoryId) ||
            !Number.isInteger(awardYear) ||
            awardYear < 2000 ||
            awardYear > 2100
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Valid categoryId and awardYear are required"
            });
        }


        // =================================================
        // VALIDATE MANUAL WINNER ID
        // =================================================

        if (
            manualWinnerId !== null &&
            !Number.isInteger(manualWinnerId)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "winnerNomineeId must be a valid number"
            });
        }


        const pool = await poolPromise;


        // =================================================
        // LOAD ACTIVE NOMINEES
        // =================================================

        const candidates =
            await loadCategoryCandidates(
                pool,
                categoryId
            );

        if (!candidates.length) {

            return res.status(404).json({
                success: false,
                message:
                    "No active nominees found for this category"
            });
        }


        // =================================================
        // CALCULATE RANKING
        // =================================================

        const calculation =
            resultService.getTopResult(
                candidates,
                manualWinnerId
            );


        // =================================================
        // TIE WITHOUT MANUAL WINNER
        // =================================================

        if (
            calculation.tie &&
            manualWinnerId === null
        ) {

            notifier.notify({
                type: "WINNER_TIE",
                message:
                    `Category ${categoryId} has a tie and requires manual winner verification.`
            });

            return res.status(409).json({

                success: false,

                tie: true,

                message:
                    "Tie detected. Provide winnerNomineeId after manual verification.",

                candidates:
                    calculation.ranked.filter(
                        x => x.Ranking === 1
                    )
            });
        }


        // =================================================
        // INVALID MANUAL WINNER
        // =================================================

        if (
            manualWinnerId !== null &&
            !calculation.validManualWinner
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected winner must be one of the top-ranked nominees.",

                candidates:
                    calculation.ranked.filter(
                        x => x.Ranking === 1
                    )
            });
        }


        // =================================================
        // NO VALID WINNER
        // =================================================

        if (!calculation.winner) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected winner is not valid for this category"
            });
        }


        // =================================================
        // CATEGORY VALIDATION
        // =================================================

        if (
            Number(
                calculation.winner.CategoryID
            ) !== categoryId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Winner nominee does not belong to this category"
            });
        }


        // =================================================
        // CHECK EXISTING AWARD
        // =================================================

        const existing =
            await pool
                .request()
                .input(
                    "CategoryID",
                    sql.Int,
                    categoryId
                )
                .input(
                    "AwardYear",
                    sql.Int,
                    awardYear
                )
                .query(`
                    SELECT AwardID
                    FROM Awards
                    WHERE CategoryID = @CategoryID
                      AND AwardYear = @AwardYear;
                `);


        let award;


        // =================================================
        // UPDATE EXISTING AWARD
        // =================================================

        if (existing.recordset.length) {

            const result =
                await pool
                    .request()
                    .input(
                        "AwardID",
                        sql.Int,
                        existing.recordset[0].AwardID
                    )
                    .input(
                        "WinnerNomineeID",
                        sql.Int,
                        calculation.winner.NomineeID
                    )
                    .query(`
                        UPDATE Awards

                        SET WinnerNomineeID =
                            @WinnerNomineeID

                        OUTPUT INSERTED.*

                        WHERE AwardID =
                            @AwardID;
                    `);

            award =
                result.recordset[0];

        }


        // =================================================
        // INSERT NEW AWARD
        // =================================================

        else {

            const result =
                await pool
                    .request()
                    .input(
                        "CategoryID",
                        sql.Int,
                        categoryId
                    )
                    .input(
                        "WinnerNomineeID",
                        sql.Int,
                        calculation.winner.NomineeID
                    )
                    .input(
                        "AwardYear",
                        sql.Int,
                        awardYear
                    )
                    .query(`
                        INSERT INTO Awards
                        (
                            CategoryID,
                            WinnerNomineeID,
                            AwardYear
                        )

                        OUTPUT INSERTED.*

                        VALUES
                        (
                            @CategoryID,
                            @WinnerNomineeID,
                            @AwardYear
                        );
                    `);

            award =
                result.recordset[0];
        }


        // =================================================
        // NOTIFICATION
        // =================================================

        notifier.notify({

            type: "WINNER_SAVED",

            message:
                `Winner saved for category ${categoryId}, year ${awardYear}.`
        });


        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({

            success: true,

            message:
                "Winner saved successfully",

            winner:
                calculation.winner,

            award
        });

    } catch (error) {

        console.error(
            "Save winner error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to save winner",

            error:
                error.message
        });
    }
};


// =====================================================
// DELETE WINNER
// =====================================================

const deleteWinner = async (req, res) => {

    try {

        const awardId =
            Number.parseInt(
                req.params.awardId,
                10
            );

        if (!Number.isInteger(awardId)) {

            return res.status(400).json({
                success: false,
                message:
                    "Award ID must be valid"
            });
        }

        const pool = await poolPromise;

        const result =
            await pool
                .request()
                .input(
                    "AwardID",
                    sql.Int,
                    awardId
                )
                .query(`
                    DELETE FROM Awards

                    OUTPUT DELETED.*

                    WHERE AwardID = @AwardID;
                `);

        if (!result.recordset.length) {

            return res.status(404).json({
                success: false,
                message:
                    "Award record not found"
            });
        }

        res.json({

            success: true,

            message:
                "Winner award record deleted successfully",

            deletedAward:
                result.recordset[0]
        });

    } catch (error) {

        console.error(
            "Delete winner error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete winner record",

            error:
                error.message
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getVoteCounts,
    getWinner,
    saveWinner,
    deleteWinner
};