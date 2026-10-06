# User Authentication App

A React Native (Expo + TypeScript) app with **Login**, **Signup** and **Home** screens. Authentication state is managed globally with the **React Context API**, navigation uses **React Navigation**, and the session is persisted with **AsyncStorage**.

## Screenshots

| Login | Signup | Home |
| --- | --- | --- |
| ![Login](docs/screenshots/login.png) | ![Signup](docs/screenshots/signup.png) | ![Home](docs/screenshots/home.png) |

| Validation errors | Incorrect credentials | Password visible |
| --- | --- | --- |
| ![Validation](docs/screenshots/validation.png) | ![Incorrect credentials](docs/screenshots/invalid-credentials.png) | ![Password toggle](docs/screenshots/password-toggle.png) |

## Tech stack

- [Expo](https://expo.dev) SDK 57 / React Native 0.86 / TypeScript
- React Context API for auth state
- React Navigation 7 (native stack)
- `@react-native-async-storage/async-storage` for persistence
- `expo-crypto` for password hashing
- `@expo/vector-icons` (Ionicons)

## Getting started

**Requirements:** Node.js 20+, plus either the [Expo Go](https://expo.dev/go) app on your phone, an iOS Simulator (Xcode), or an Android Emulator.

```bash
git clone <repo-url>
cd kloudius-task
npm install
npm start
```

Then:

- press **i** to open the iOS Simulator
- press **a** to open the Android Emulator
- or scan the QR code with Expo Go (Android) / the Camera app (iOS)

Typecheck with `npx tsc --noEmit`.

## Features

### 1. Authentication context (`src/context/AuthContext.tsx`)

`AuthProvider` wraps the app and exposes the following through the `useAuth()` hook:

| Value | Description |
| --- | --- |
| `user` | The currently logged-in user (`{ id, name, email, createdAt }`) or `null` |
| `login(email, password)` | Logs a user in; throws an `AuthError` for incorrect credentials |
| `signup(name, email, password)` | Creates a new user and logs them in; throws if the email is already registered |
| `logout()` | Clears the session and returns to the Login screen |
| `isRestoring` | `true` while the saved session is loaded on app launch |

`useAuth()` throws if it's used outside the provider, so a missing provider fails loudly.

### 2. Screens

**Login** (`src/screens/LoginScreen.tsx`)
- Email and password fields
- Inline errors for an invalid email format, empty fields, or a password shorter than 6 characters
- A banner error for **incorrect credentials**
- "Go to Signup" button

**Signup** (`src/screens/SignupScreen.tsx`)
- Name, email and password fields
- Inline errors for **missing fields**, **invalid email format** and **password shorter than 6 characters**
- A banner error if the email is already registered
- "Go to Login" button
- New users are logged in immediately after signing up

**Home** (`src/screens/HomeScreen.tsx`)
- Shows the logged-in user's name and email, plus an initials avatar and the date they joined
- "Logout" button that returns to the Login screen

### 3. Persistent authentication

The session is saved to AsyncStorage on login and signup, and restored when the app starts (a loading indicator shows while this happens). Users stay logged in after closing and reopening the app until they log out.

### 4. Navigation (`src/navigation/RootNavigator.tsx`)

A native stack navigator that uses React Navigation's [auth-flow pattern](https://reactnavigation.org/docs/auth-flow): the screens it renders depend on `user`.

- Signed out: `Login` and `Signup`
- Signed in: `Home`

Logging in or out swaps the screen set, so navigation happens automatically and the back gesture can't return to a screen the user shouldn't see (for example, Home after logging out).

### 5. UI design

- Consistent theme tokens (`src/theme.ts`) for colours, spacing and radius
- Reusable components in `src/components/`: `TextField` (label, leading icon, focus and error states), `Button` (primary and secondary variants, loading state), `ErrorBanner` and `AuthLayout`
- Keyboard handling: `KeyboardAvoidingView`, "next" moves to the next field, and "go" submits the form
- Errors clear as soon as the user edits the field
- Accessibility labels and roles on inputs, buttons and error messages

### Bonus: password visibility toggle

Every password field has an eye icon that shows or hides the password.

## How the "backend" works

The assignment doesn't include an API, so `src/services/authService.ts` acts as a local mock backend built on AsyncStorage:

- Registered users are stored as a map keyed by lowercase email, so emails are case-insensitive and unique.
- Passwords are **never stored in plain text**. Each user gets a random salt, and the app stores `SHA-256(salt + password)`.
- Login returns the same "Incorrect email or password" message whether the email is unknown or the password is wrong, so it doesn't reveal which accounts exist.
- A short artificial delay simulates network latency, which lets the loading states show.

Because every call goes through this one module, it could be replaced with real API calls without changing the context or the screens.

> Note: this is a demo. A production app would authenticate against a server and store tokens in secure storage (for example `expo-secure-store`).

## Project structure

```
App.tsx                      # Providers + NavigationContainer
src/
├── components/
│   ├── AuthLayout.tsx       # Shared layout for Login/Signup
│   ├── Button.tsx
│   ├── ErrorBanner.tsx
│   └── TextField.tsx        # Includes the password visibility toggle
├── context/
│   └── AuthContext.tsx      # AuthProvider + useAuth()
├── navigation/
│   ├── RootNavigator.tsx    # Auth-aware stack navigator
│   └── types.ts             # Typed route params
├── screens/
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   └── SignupScreen.tsx
├── services/
│   └── authService.ts       # AsyncStorage-backed mock auth API
├── types/
│   └── user.ts
├── utils/
│   └── validation.ts        # Form validation rules
└── theme.ts
```

### Conventions

- Imports use the `@/` alias for `src/` (configured in `tsconfig.json`), e.g. `import { useAuth } from '@/context/AuthContext'`.
- Component and screen files are PascalCase (`LoginScreen.tsx`); everything else is camelCase (`authService.ts`).
