const validate = (schemas) => (req, res, next) => {
  const toValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  for (const key in schemas) {
    if (schemas[key]) {
      const { error, value } = schemas[key].validate(toValidate[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const formattedErrors = error.details.map(detail => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // req[key] = value;
      // req[`validated${key.charAt(0).toUpperCase() + key.slice(1)}`] = value;
      req[`validated${capitalize(key)}`] = value;
    }
  }
  next();
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


export default validate;