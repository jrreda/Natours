const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Route middleware to check if tour id exists in the tours array
exports.checkID = (req, res, next, val) => {
    console.log(`Tour id: ${val}`);

    const tour = tours.find(t => t.id === parseInt(req.params.id));

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'No tour found'
        });
    }

    next();
};

// Route middleware to check body contains name and price
exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(404).json({
            status: 'fail',
            message: 'Please provide name and price in the request body'
        });
    }

    next();
};

// get all tours
exports.getAllTours = (req, res) => {
    console.log(req.requestTime);

    res
        .status(200)
        .json({
            message: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
                // tours: tours
                tours
            }
        })
};

// get a single tour
exports.getTour = (req, res) => {
    const tour = tours.find(t => t.id === parseInt(req.params.id));

    res.status(200).json({
        message:'success',
        data: {
            tour
        }
    });
};

// update a tour
exports.updateTour = (req, res) => {
    res.status(200).json({
        message:'success',
        data: {
            tour: '<Updated tour here...>'
        }
    });
};

// delete a tour
exports.deleteTour = (req, res) => {
    const tourIndex = tours.findIndex(t => t.id === parseInt(req.params.id));

    // tours.splice(tourIndex, 1);

    // fs.writeFile(
    //     `${__dirname}/dev-data/data/tours-simple.json`,
    //     JSON.stringify(tours),
    //     (err) => err? console.error(err) : console.log('Tour deleted successfully!')
    // );

    // 204 status code means send back no content at all
    res.status(204).json({
        message: 'success',
        data: null
    });
};

// create a tour
exports.createTour = (req, res) => {
    const newTour = req.body;
    newTour.id = tours[tours.length - 1].id + 1;
    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => err ? console.error(err) : console.log('Tour added successfully!')
    );

    res.status(201).json({
        message: 'success',
        data: {
            tour: newTour
        }
    });
};
