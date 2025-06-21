const PASSWORD_PATTERN = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/
);

const PHONENO_PATTERN = new RegExp(/^(?:\+?234|0)?[789]\d{9}$/);


export {
  PASSWORD_PATTERN,
  PHONENO_PATTERN
};