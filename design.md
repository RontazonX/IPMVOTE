# Design Guidelines - Voting Formatur PC IPM Wirobrajan

## Philosophy
The application should follow a modern, **clean, and interactive** design philosophy.
We want the user to experience a premium, trustworthy interface, fitting for a formal yet modern organization (IPM).

## Color Palette
The primary color scheme revolves around White and Blue.
- **Primary Blue**: `#2563EB` (Tailwind `blue-600`) - Used for primary actions, active states, and emphasis.
- **Secondary Blue**: `#DBEAFE` (Tailwind `blue-100`) - Used for soft backgrounds, hover states on cards, and subtle highlights.
- **Dark Text**: `#0F172A` (Tailwind `slate-900`) - Used for headings and primary text to maintain high contrast.
- **Muted Text**: `#64748B` (Tailwind `slate-500`) - Used for secondary information and captions.
- **Background**: `#F8FAFC` (Tailwind `slate-50`) - Main application background to make white cards pop.
- **White**: `#FFFFFF` - Used for content cards, form inputs, and the navigation bar.

## Typography
We will use a modern sans-serif font, preferably **Inter** or **Outfit**, loaded via Google Fonts (Next.js `next/font/google`).
- **Headings**: Bold (`font-bold`), tight tracking (`tracking-tight`).
- **Body**: Regular weight, readable line height (`leading-relaxed`).

## UI Components & Interaction (Micro-animations)
- **Cards**: All candidates will be displayed in crisp white cards with soft shadows (`shadow-sm`, hover: `shadow-md`).
- **Hover Effects**: 
  - Buttons will slightly translate up (`-translate-y-0.5`) and change opacity on hover.
  - Candidate cards will have a subtle scale effect (`hover:scale-[1.02]`) and a blue border highlight when selected.
- **Transitions**: Use `transition-all duration-200 ease-in-out` for smooth state changes.
- **Glassmorphism**: Consider subtle glass effects (`backdrop-blur-md bg-white/80`) for sticky headers or notifications.

## Admin Panel (TailAdmin Style)
The admin panel will feature a sidebar navigation and a top header.
- **Sidebar**: Dark blue or stark white with clear active state indicators (blue background with white text).
- **Dashboard Widgets**: Clean statistic cards showing total voters, total candidates, and votes cast.

## Responsiveness
The design must be fully responsive, utilizing Tailwind's utility classes (`sm:`, `md:`, `lg:`) to ensure perfect display on mobile devices (where most voting might occur) as well as desktop screens (for admin).
