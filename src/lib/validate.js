/**
 * Central validation & sanitization utilities
 * Used in all API routes for consistent server-side validation
 */

// Strip HTML tags and dangerous characters to prevent XSS/injection
export function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"`;]/g, "")
    .trim();
}

export function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => (typeof v === "string" ? sanitize(v) : v));
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const validators = {
  name: (v) => {
    if (!v || v.trim().length < 2) return "Name must be at least 2 characters";
    if (v.trim().length > 100) return "Name must be under 100 characters";
    return null;
  },
  email: (v) => {
    if (!v) return "Email is required";
    if (!isValidEmail(v)) return "Invalid email address";
    return null;
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 6) return "Password must be at least 6 characters";
    if (v.length > 128) return "Password too long";
    return null;
  },
  jobTitle: (v) => {
    if (!v || v.trim().length < 5) return "Title must be at least 5 characters";
    if (v.trim().length > 150) return "Title must be under 150 characters";
    return null;
  },
  jobDescription: (v) => {
    if (!v || v.trim().length < 20)
      return "Description must be at least 20 characters";
    if (v.trim().length > 5000)
      return "Description must be under 5000 characters";
    return null;
  },
  location: (v) => {
    if (!v || v.trim().length < 2) return "Location is required";
    if (v.trim().length > 200) return "Location too long";
    return null;
  },
  budget: (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) return "Budget must be a positive number";
    if (n > 100000000) return "Budget value too large";
    return null;
  },
  bio: (v) => {
    if (!v) return null;
    if (v.length > 1000) return "Bio must be under 1000 characters";
    return null;
  },
  rating: (v) => {
    const n = parseInt(v);
    if (!n || n < 1 || n > 5) return "Rating must be between 1 and 5";
    return null;
  },
  message: (v) => {
    if (!v || v.trim().length === 0) return "Message cannot be empty";
    if (v.length > 2000) return "Message too long (max 2000 characters)";
    return null;
  },
};

export function validate(fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (validators[field]) {
      const error = validators[field](value);
      if (error) return { error, field };
    }
  }
  return null;
}
