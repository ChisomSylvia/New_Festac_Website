const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(403).json({
        success: false,
        message: error.details[0].message,
      });
    }

    req.body = value;
    next();
  }
}

export default validate;