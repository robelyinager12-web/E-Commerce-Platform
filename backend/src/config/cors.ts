
import { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins = [
  "https://robels-ecommerce.vercel.app",
  "http://localhost:3000",
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header,
    // such as server-to-server requests.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};
