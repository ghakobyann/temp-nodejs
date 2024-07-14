const { Router } = require("express");
const User = require("./schemas/User.js");
const router = Router();

/**
 * @event POST
 * @description Add user to the database
 */
router.post("/", (req, res) => {
    const user = req.body.username;

    User.create({ username: user })
        .then(({ username, _id }) =>
            res.json({
                username,
                _id,
            })
        )
        .catch(console.error);
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
router.post("/:_id/exercises", (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const newExercise = {
        description,
        duration,
    };

    if (date) newExercise.date = new Date(date);

    User.findById({ _id: userId })
        .then((selected) => {
            selected.log.push(newExercise);
            const index = selected.log.length - 1;

            selected.save().then((updated) => {
                const { username, log, _id } = updated;

                res.json({
                    username,
                    description: log[index].description,
                    duration: log[index].duration,
                    date: log[index].date.toDateString(),
                    _id,
                });
            });
        })
        .catch(console.error);
});

/**
 * @event GET
 * @description Give full information about the user and his/her exercises
 */
router.get("/:_id/logs", (req, res) => {
    const { from, to } = req.query;
    const limit = parseInt(req.query.limit);

    User.findOne({ _id: req.params._id })
        .then((selected) => {
            let logs = selected.log;
            const { _id, username, __v } = selected;

            logs.filter(({ date }) => {
                if (from && to) {
                    return date >= new Date(from) && date <= new Date(to);
                }
                if (from) {
                    return date >= new Date(from);
                }
                if (to) {
                    return date <= new Date(to);
                }
            });

            if (limit) logs = logs.slice(0, limit);

            const converted = logs.map(({ description, duration, date }) => ({
                description,
                duration,
                date: new Date(date).toDateString(),
            }));

            res.json({
                _id,
                username,
                count: __v,
                log: converted,
            });
        })
        .catch(console.error);
});

module.exports = router;