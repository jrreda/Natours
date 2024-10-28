const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// get top 5 cheap tours middleware
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
    // Build the query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // const tours = await query;
    const tours = await features.query;

    // Send response
    res.status(200).json({
        message: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

// get a single tour
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            tour
        }
    });
});

// update a tour
exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    // Tour.findOne({ _id: req.params.id })

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            tour
        }
    });
});

// delete a tour
exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    // 204 status code means send back no content at all
    res.status(204).json({
        status: 'success',
        data: null
    });
});

// create a tour
exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        message: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.0 } }
        },
        {
            $group: {
                _id: null,
                // _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                minRating: { $min: '$rating' },
                maxRating: { $max: '$rating' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    // Send response
    res.status(200).json({
        message: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = parseInt(req.params.year, 10); // 2021

    const plans = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {
                    $month: '$startDates'
                },
                numTours: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTours: -1 }
        }
    ]);

    // Send response
    res.status(200).json({
        message: 'success',
        data: {
            plans
        }
    });
});
