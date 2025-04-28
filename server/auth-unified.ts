import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage-unified";
import { User } from "@shared/schema-unified";
import { t } from "../client/src/lib/i18n";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Cripta una password usando scrypt
 * @param password La password in chiaro
 * @returns La password criptata con il salt
 */
async function hashPassword(password: string): Promise<string> {
  // Genera un salt casuale
  const salt = randomBytes(16).toString("hex");
  // Cripta la password con il salt
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  // Restituisci la password criptata con il salt
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Verifica che una password corrisponda a quella salvata
 * @param supplied La password fornita
 * @param stored La password salvata
 * @returns true se le password corrispondono
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Estrai hash e salt dalla password salvata
  const [hashed, salt] = stored.split(".");
  // Crea il buffer dall'hash
  const hashedBuf = Buffer.from(hashed, "hex");
  // Genera l'hash della password fornita con lo stesso salt
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  // Confronta gli hash in modo sicuro
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Configura l'autenticazione per l'applicazione
 * @param app Express application
 */
export function setupAuth(app: Express) {
  // Configura la sessione
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "misericordia-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  // Configura express per usare la sessione
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configura la strategia di autenticazione locale
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Cerca l'utente per username
        const user = await storage.getUserByUsername(username);
        
        // Se l'utente non esiste o la password non corrisponde
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: t("auth.invalidCredentials") });
        }
        
        // Aggiorna l'ultimo accesso
        await storage.updateLastLogin(user.id);
        
        // Autenticazione riuscita
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serializzazione dell'utente (salva solo l'ID nella sessione)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserializzazione dell'utente (recupera l'utente dall'ID)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rotta di registrazione
  app.post("/api/register", async (req, res, next) => {
    try {
      // Verifica che l'utente non esista già
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ 
          error: t("validation.usernameExists")
        });
      }

      // Verifica che le password corrispondano
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ 
          error: t("validation.passwordMatch")
        });
      }

      // Crea l'utente con password criptata
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        role: req.body.role || "viewer" // Default role is viewer
      });

      // Effettua il login automatico
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Ritorna l'utente creato
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ 
        error: t("auth.registerError"),
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Rotta di login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ 
          error: t("auth.loginError"),
          details: err.message 
        });
      }
      
      if (!user) {
        return res.status(401).json({ 
          error: info?.message || t("auth.invalidCredentials") 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ 
            error: t("auth.loginError"),
            details: loginErr.message 
          });
        }
        
        // Ritorna l'utente senza la password
        return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        });
      });
    })(req, res, next);
  });

  // Rotta di logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ 
          error: t("auth.logoutError"),
          details: err.message 
        });
      }
      res.status(200).json({ message: t("auth.logoutSuccess") });
    });
  });

  // Rotta per ottenere l'utente corrente
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Ritorna l'utente senza la password
    const user = req.user as Express.User;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  });

  // Crea utente admin predefinito se non esiste
  createDefaultAdminUser();
}

/**
 * Crea un utente admin predefinito se non esiste
 */
async function createDefaultAdminUser() {
  try {
    const adminUser = await storage.getUserByUsername("admin");
    
    if (!adminUser) {
      console.log("Creating default admin user...");
      
      await storage.createUser({
        username: "admin",
        password: await hashPassword("admin"),
        email: null,
        fullName: "Administrator",
        role: "admin",
        isActive: true
      });
      
      console.log("Default admin user created successfully!");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
}

/**
 * Middleware per verificare che l'utente sia autenticato
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ error: "Not authenticated" });
}

/**
 * Middleware per verificare che l'utente sia un amministratore
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as Express.User).role === "admin") {
    return next();
  }
  
  res.status(403).json({ error: "Forbidden" });
}