
const errorHandler = async (err,req, res, next) => {
    try {
        console.error(err.stack); // log error for debugging
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });

    } catch (err) {
        console.error('Error in errorHandler:', err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }

}

module.exports = { errorHandler };