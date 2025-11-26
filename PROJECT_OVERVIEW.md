# Synapse - Project Overview

## 1. Vision & Philosophy
**"Learn by Reconstructing"**
Synapse is an AI-powered active learning platform that rejects passive studying (highlighting, re-reading). Instead, it forces users to rebuild knowledge from memory. The AI acts as a tutor that explains a concept, erases key parts, and asks the user to fill them back in.

## 2. The "Digital Whiteboard" Aesthetic
The entire application is designed to feel like a collaborative session on a whiteboard. It feels organic, creative, and "in-progress" rather than rigid and static.

### Design System
- **Background**: Clean white with subtle texture/grid and animated "ghost" sketches (`WhiteboardBackground`).
- **Typography**: 
  - **UI/Body**: `Inter` (Clean, readable sans-serif).
  - **Handwriting**: `Caveat` (Used for emphasis, titles, and AI "notes").
- **Colors (Marker Palette)**:
  - **Black**: Primary text/ink.
  - **Blue**: Emphasis, active elements, primary buttons.
  - **Red**: Corrections, "danger" actions, important alerts.
  - **Green**: Success, correct answers, positive reinforcement.
- **Visual Elements**:
  - **Doodles**: SVG-based hand-drawn icons (arrows, circles, stars, subject symbols).
  - **Sticky Notes**: Colorful squares for tips, reminders, or side-notes.
  - **Marker Buttons**: Buttons with hand-drawn SVG borders that animate on hover.

## 3. Core Architecture
- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS + `clsx`/`tailwind-merge`.
- **Animation**: Framer Motion (critical for the "drawing" effects).
- **Database**: PostgreSQL (via Supabase).
- **ORM**: Prisma.
- **Authentication**: NextAuth.js (v5 beta) with Google OAuth & Credentials (bcrypt).

## 4. The "Shared Engine" (Learning Modes)
The core product loop consists of 5 distinct modes that the AI cycles through:
1.  **Story Mode**: The AI explains a concept step-by-step (building the mental model).
2.  **Question Mode**: The user asks clarifying questions; AI connects dots.
3.  **Prediction Mode**: AI stops and asks, "What happens next?" (before revealing).
4.  **Erasure Mode**: The signature feature. AI "erases" parts of the lesson (dates, variables, words); user must fill them in.
5.  **Review Mode**: Spaced repetition of previously learned concepts.

## 5. Subject Adaptability
The engine is content-agnostic but visualizes differently per subject:
- **📜 History**: Timelines. Users place events or reconstruct dates.
- **🧮 Math**: Step-by-step derivations. Users fill in missing constants or steps.
- **⚛️ Physics**: Diagrams. Users adjust variables (gravity, mass) to see effects.

## 6. Current Implementation Status (as of Nov 2025)
- **Landing Page**: Fully implemented with whiteboard theme, animated background, and subject showcase.
- **Authentication**:
  - `/login` & `/signup` pages created with whiteboard styling.
  - NextAuth configured with Google & Email/Password.
  - Database schema (`User`, `Account`, `Session`) set up.
- **Components Library**:
  - `MarkerButton`, `MarkerText`, `Doodle`, `StickyNote`, `AuthCard`, `AuthInput`, `WhiteboardBackground`.

## 7. Future Roadmap
- **Dashboard**: A personal "desk" view showing recent lessons and progress.
- **The Lesson Interface**: The actual interactive whiteboard where the AI teaches.
- **OCR Integration**: Uploading handwritten notes to convert into lessons.
- **Progress Tracking**: Visualizing "mastery" of subjects over time.
