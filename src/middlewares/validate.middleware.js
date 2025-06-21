const validate = (schemas) => (req, res, next) => {
  const toValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  for (const key in schemas) {
    if (schemas[key]) {
      const {
        error,
        value
      } = schemas[key].validate(toValidate[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const formattedErrors = error.details.map(detail => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        return res.status(403).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      req[key] = value;
    }
  }
  next();
}


export default validate;


// const validate = (schema) => {
//   return (req, res, next) => {
//     const { error, value } = schema.validate(req.body);

//     if (error) {
//       return res.status(403).json({
//         success: false,
//         message: error.details[0].message,
//       });
//     }

//     req.body = value;
//     next();
//   }
// }

// export default validate;