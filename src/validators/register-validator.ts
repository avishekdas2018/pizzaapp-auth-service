import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Must be a valid email address",
    },
    trim: true,
  },
});

//export default [body('email').notEmpty().withMessage("Email is required!")]
