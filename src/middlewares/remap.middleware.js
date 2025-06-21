
//middleware that moves req.params.id to req.query.id
const remapParamToQuery = (paramName) => {
  return (req, res, next) => {
    if (req.params[paramName]) {
      req.query[paramName] = req.params[paramName];
    }
    next();
  };
};

export default remapParamToQuery;