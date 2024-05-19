const failureInjection = (req, res, next) => {
  // Simula una tasa de fallo del 10%
if (Math.random() < 0.05) {
    return res.status(500).send('Simulated Failure');
}
next();
};

module.exports = failureInjection;
