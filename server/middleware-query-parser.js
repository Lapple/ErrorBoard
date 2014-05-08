module.exports = function(queryParameter, dbqueryParameter) {
    return function(req, res, next) {
        if (req.query[queryParameter]) {
            try {
                req[dbqueryParameter] = JSON.parse(req.query[queryParameter]);
                next();
            } catch(e) {
                res.json(400, { error: 'Badly formed JSON' });
            }
        } else {
            res.end(400);
        }
    };
};
