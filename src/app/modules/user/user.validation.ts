import z from "zod";
import { IsActive, Role } from "./user.interface";

  export  const createUserZodSchema = z.object({
      // name: z
      //   .string({ invalid_type_error: "Name must be String" })
      //   .min(2, { message: "Name to short. Minimum two character long" })
      //   .max(50, { message: "Name to Long" }),
      name: z.object({ 
            FirstName: z
        .string({ invalid_type_error: "Name must be String" })
        .min(2, { message: "Name to short. Minimum two character long" })
        .max(50, { message: "Name to Long" }),
            lastName: z.object({
             nickName:  z.string({ invalid_type_error: "Name must be String" })
        .min(2, { message: "Name to short. Minimum two character long" })
        .max(50, { message: "Name to Long" }), 
        
        surName:  z.string({ invalid_type_error: "Name must be String" })
        .min(2, { message: "Name to short. Minimum two character long" })
        .max(50, { message: "Name to Long" }),


            })
       
      }),
      email: z
      .string({invalid_type_error: "email must be string"})
      .email({message: "Invalid email address format"})
      .min(2,{message: "Invalid email address format"})
      .max(100,{message: "Invalid email address format"}),
      password: z
        .string({invalid_type_error: "Password must be string"})
        .min(8, {message:"Password must be at least 8 characters"})
        .regex(/^(?=.*[A-Z])/, {message: "Must include at least one uppercase letter"})
        .regex(/^(?=.*[a-z])/, {message: "Must include at least one lowercase letter"})
        .regex(/[^A-Za-z0-9]/, {message: "Must include at least one special character"})
        .regex(/^(?=.*\d)/, {
          message: "Password must be contain at least 1 number",
        }),
      phone: z
      .string({invalid_type_error: "Phone number must be string"})
      .regex(/^(?:\+8801\d{9}01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh."
      })
      .optional(),
      address: z
      .string({invalid_type_error: "Address must be String"})
      .max(200,{message: "Address cannot exceed 200 character"})
      .optional(),
    });

    export  const updateUserZodSchema = z.object({
      name: z
        .string({ invalid_type_error: "Name must be String" })
        .min(2, { message: "Name to short. Minimum two character long" })
        .max(50, { message: "Name to Long" }).optional(),
      password: z
        .string({invalid_type_error: "Password must be string"})
        .min(8, {message:"Password must be at least 8 characters"})
        .regex(/^(?=.*[A-Z])/, {message: "Must include at least one uppercase letter"})
        .regex(/^(?=.*[a-z])/, {message: "Must include at least one lowercase letter"})
        .regex(/[^A-Za-z0-9]/, {message: "Must include at least one special character"})
        .regex(/^(?=.*\d)/, {
          message: "Password must be contain at least 1 number",
        }).optional(),
      phone: z
      .string({invalid_type_error: "Phone number must be string"})
      .regex(/^(?:\+8801\d{9}01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh."
      }).optional()
      .optional(),

      address: z
      .string({invalid_type_error: "Address must be String"})
      .max(200,{message: "Address cannot exceed 200 character"})
      .optional(),
    role: z
      .enum(Object.values(Role) as [string])
      .optional(),
    inActive: z
      .enum(Object.values(IsActive) as [string])
      .optional(),
    isDeleted: z
      .boolean({invalid_type_error: "isDeleted must be true or false"})
      .optional(),
     isVerified: z
      .boolean({invalid_type_error: "isVerified must be true or false"})
      .optional(),
    

    });