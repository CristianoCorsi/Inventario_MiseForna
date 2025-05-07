import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { sessionStore } from "./sessionStore";
import { User as SelectUser, InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Password utilities
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Authentication setup
export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "inventory-management-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };

  // Initialize session middleware
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Update last login time
        await storage.updateLastLogin(user.id);

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize/deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, fullName, role } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user - Convertire l'oggetto preferences in stringa JSON per SQLite
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        role,
        isActive: true,
        preferences: JSON.stringify({}),
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      passport.authenticate(
        "local",
        (err: Error, user: Express.User, info: any) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          if (!user) {
            return res
              .status(401)
              .json({ error: info?.message || "Authentication failed" });
          }
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.error("Login session error:", loginErr);
              return res.status(500).json({ error: "Error creating session" });
            }
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
          });
        }
      )(req, res, next);
    } catch (error) {
      console.error("Unhandled login error:", error);
      res.status(500).json({ error: "Server error during authentication" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Remove password from response
    const { password: _, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });

  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      const { fullName, email, preferences } = req.body;

      const updatedUser = await storage.updateUser(user.id, {
        fullName,
        email,
        // Convertire preferences in stringa JSON se presente
        preferences: preferences ? JSON.stringify(preferences) : undefined,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating profile" });
    }
  });

  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      const updated = await storage.updateUser(user.id, {
        password: hashedPassword,
      });

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error changing password" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();

      // Remove passwords from response
      const usersWithoutPasswords = users.map((user) => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { username, password, email, fullName, role } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user - Convertire l'oggetto preferences in stringa JSON per SQLite
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        role,
        isActive: true,
        preferences: JSON.stringify({}),
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, email, fullName, role, isActive } = req.body;

      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user
      const updatedUser = await storage.updateUser(userId, {
        username,
        email,
        fullName,
        role,
        isActive,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser!;

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete user
      const deleted = await storage.deleteUser(userId);

      if (!deleted) {
        return res.status(500).json({ error: "Error deleting user" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newPassword } = req.body;

      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      const updated = await storage.updateUser(userId, {
        password: hashedPassword,
      });

      if (!updated) {
        return res.status(500).json({ error: "Error resetting password" });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error resetting password" });
    }
  });

  // Create default admin user if none exists
  createDefaultAdminUser();
}

// Create a default admin user if no users exist

async function createDefaultAdminUser() {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) {
      return;
    }

    console.log("Attempting to create default admin user...");
    const hashedPassword = await hashPassword("admin");

    const userToCreate = {
      username: "admin",
      password: hashedPassword,
      fullName: "Administrator",
      email: null,
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      profilePicture: null,
      preferences: JSON.stringify({}),
    };

    console.log("User object to create:", userToCreate);

    // Assicurati che createUser possa accettare questo oggetto
    const newUser = await storage.createUser(userToCreate as InsertUser);
    console.log("Created default admin user:", newUser.username);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating default admin user:", error.message);
      console.error("Error code:", (error as any).code);
      console.error(error.stack);
    } else {
      console.error("Unknown error creating default admin user:", error);
    }
  }
}

// Middleware for checking authentication
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

// Middleware for checking admin role
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as Express.User).role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Access denied" });
}
