import { object, string, number, date, InferType } from 'yup';

export const userloginSchema = object({
    email: string().email("Please Enter a valid email").required("Required"),
    password: string().required("Required"),
  });