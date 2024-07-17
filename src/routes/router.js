const { Router } = require("express");
const User = require("../schemas/User");
const Exercise = require("../schemas/Exercise");
const router = Router();

/**
 * @event POST
 * @description Add user to the database
 */
router.post("/", (req, res) => {
    const user = req.body.username;

    if (!user) {
        return setStatusWithMessage(
            res,
            400,
            "The required field `username` was missing!"
        );
    }

    User.create({ username: user })
        .then(({ username, _id }) =>
            res.json({
                username,
                _id,
            })
        )
        .catch((error) => {
            if (error.code === 11000) {
                return setStatusWithMessage(
                    res,
                    400,
                    "The username is already used, try something else."
                );
            }
            res.json(error);
        });
});

/**
 * @event GET
 * @description Give the list of all the users
 */
router.get("/", async (_, res) => {
    res.json(await User.find({}, { username: 1, _id: 1 }));
});

/**
 * @event POST
 * @description Add an exercise to the database, then give infromation about the new exercise
 */
router.post("/:_id/exercises", async (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    if (!userId || !description || !duration) {
        return setStatusWithMessage(
            res,
            400,
            "One of the required fields is missing"
        );
    }

    const user = await User.findById(userId);

    if (!user) {
        return setStatusWithMessage(res, 404, "The User was not Found!");
    }

    const newExercise = {
        userId: user._id,
        description,
        duration,
    };

    if (date) {
        const dateObj = new Date(date);

        if (isNaN(dateObj)) {
            return setStatusWithMessage(
                res,
                400,
                "Wrong format of date was submited!"
            );
        }

        newExercise.date = dateObj;
    }

    const exercise = await Exercise.create(newExercise);

    if (!exercise) {
        return setStatusWithMessage(res, 400, "Failed to create the exercise!");
    }

    user.logs.push(exercise._id);
    const saved = await user.save();

    if (!saved) {
        return setStatusWithMessage(res, 400, "Failed to save the exercise!");
    }

    return res.json({
        userId: exercise.userId,
        exerciseId: exercise._id,
        duration: exercise.duration,
        description: exercise.description,
        date: exercise.date,
    });
});

/**
 * @event GET
 * @description Give full information about the user and his/her exercises
 */
router.get("/:_id/logs", async (req, res) => {
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    const limit = parseInt(req.query.limit);

    const user = await User.findById(req.params._id);

    if (!user) {
        return setStatusWithMessage(res, 404, "The User was not Found!");
    }

    const queries = {
        _id: { $in: user.logs },
    };

    if (!isNaN(from)) {
        queries.date = { $gte: from };
    }
    if (!isNaN(to)) {
        queries.date = { ...queries.date, $lte: to };
    }

    const count = await Exercise.countDocuments(queries);
    const foundLogs = await Exercise.find(queries)
        .sort({
            date: 1,
        })
        .limit(limit)
        .then((found) =>
            found.map(({ _id, description, duration, date }) => ({
                id: _id,
                description,
                duration,
                date: new Date(date).toDateString(),
            }))
        );

    if (!foundLogs || !count) {
        return setStatusWithMessage(res, 404, "Logs not found!");
    }

    res.json({
        id: user._id,
        username: user.username,
        logs: foundLogs,
        count,
    });
});

module.exports = router;

function setStatusWithMessage(res, code, message) {
    return res.status(code).send(message);
}
