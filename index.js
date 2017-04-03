(() => {
    'use strict';
    /**
     * Mongoose error handler
     */

    //dependencies
    const VError = require('verror').VError;

    module.exports = schema => {
        let handleMongoError = (error, next) => {
            switch (error.code) {
                case 11000:
                    const err = new Error('Duplicate Key Error');
                    err.name = 'DuplicateError';
                    next(err);
                    break;
                default:
                    next(error);
            }
        };

        let handleValidationError = (error, next) => {
            if (error.name !== 'ValidationError') {
                return error;
            }
            let errorData = '';
            Object.keys(error.errors).forEach(key => {
                errorData += `${error.errors[key].message};`;
            });
            let customError = new VError({
                name: error.name,
            }, '%s [%s]', error.message, errorData);
            next(customError);
        };

        let handleError = (error, res, next) => {
            switch (error.name) {
                case 'MongoError':
                    handleMongoError(error, next);
                    break;
                case 'ValidationError':
                    handleValidationError(error, next);
                    break;
                default:
                    next(error);
            }
        };

        schema.post('save', handleError);

        schema.post('update', handleError);
        schema.post('insertMany', handleError);
        schema.post('find', handleError);
        schema.post('findOne', handleError);
        schema.post('findOneAndUpdate', handleError);
        schema.post('findOneAndRemove', handleError);
    };
})();
