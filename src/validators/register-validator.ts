import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is required!",
    notEmpty: true,
    trim: true,
    isEmail: {
      errorMessage: "Email should be a valid email address!",
    },
  },
  firstName: {
    errorMessage: "First name is required!",
    notEmpty: true,
  },
  lastName: {
    errorMessage: "Last name is required!",
    notEmpty: true,
  },
  password: {
    errorMessage: "Password is required!",
    notEmpty: true,
    isLength: {
      errorMessage: "Password should be at least 8 chars long!",
      options: { min: 8 },
    },
  },
});

//export default [body('email').notEmpty().withMessage("Email is required!")]
