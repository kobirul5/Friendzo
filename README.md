# Friendzo Frontend: Modern Social Web Application

A sleek, modern, and high-performance social networking frontend for the Friendzo ecosystem. Built with Next.js 16 and Tailwind CSS 4, it's designed to deliver a premium user experience across all devices.

---

## ✨ Features & Dashboards

### 1. **Multi-Role User Experience**
- **Admin Dashboard**: Full control over user accounts, gift cards, coin prices, and moderation.
- **Event Manager**: Tools to create and manage local events and track bookings.
- **Travel Manager**: Dedicated views for organizing and promoting travel-related activities.
- **User Dashboard**: Personalized social feed, profile settings, and discovery tools.

### 2. **Social Interaction Module**
- **Feed**: View and interact with "Memories" and "Events" from around the community.
- **Messaging**: Real-time private chat interface with support for text and media.
- **Notifications**: Instant pop-up and central hub for updates on interactions.

### 3. **Virtual Marketplace**
- **Gift Shop**: Interactive gift browsing and purchasing UI.
- **Wallet & Coins**: Real-time balance tracking and historical transaction views.
- **Stripe Checkout**: Seamlessly integrated payment flows for subscriptions and credits.

### 4. **Discovery & Networking**
- **Friend Grid**: Browse the network and send follow requests.
- **Proximity Search**: Find people and events near you using geospatial data.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: React 19 & TypeScript.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with a custom design system.
- **Components**: [Radix UI](https://www.radix-ui.com/) (Headless and accessible primitives).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for data safety.
- **Real-time**: [Socket.io-client](https://socket.io/) integration.

---

## 📂 Key Directory Breakdown

- `src/app`: Multi-layout system with protected routes based on user role.
- `src/components/shared`: Reusable components used across all dashboards (Headers, Sidebar, Cards).
- `src/services`: Next.js Server Actions for secure backend interaction.
- `src/hooks`: Global custom hooks for authentication, notifications, and location tracking.

---

## 🚀 Getting Started

1. Clone the project: `git clone <repo-url>`
2. Install dependencies: `bun install` or `npm install`
3. Configure `.env`:
   - `NEXT_PUBLIC_API_URL`: Your backend endpoint.
4. Run dev server: `bun run dev`

---

## 🔗 Project Links
- [Backend Documentation](../Friendzo_Server/README.md)
- [Project Architecture Chart](../README.md)

---

## 📜 License
Private & Proprietary.
