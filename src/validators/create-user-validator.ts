import { checkSchema } from "express-validator";

export default checkSchema({
  firstName: {
    errorMessage: "First name is required!",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Last name is required!",
    notEmpty: true,
    trim: true,
  },
  email: {
    errorMessage: "User email is required!",
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  password: {
    errorMessage: "User password is required!",
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
  },

  role: {
    errorMessage: "User role is required!",
    notEmpty: true,
    trim: true,
  },
});
