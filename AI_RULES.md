# AI Development Rules & Tech Stack Guidelines

## Tech Stack Overview

• **Frontend Framework**: React 18+ with TypeScript for building user interfaces
• **Styling**: Tailwind CSS for utility-first styling with gov.br design system compliance
• **Icons**: Lucide React for consistent iconography
• **Build Tool**: Vite for fast development and optimized builds
• **Routing**: React Router for client-side navigation between pages
• **UI Components**: shadcn/ui components built on Radix UI primitives
• **State Management**: React Context API for global state, useState/useReducer for local state
• **Accessibility**: WCAG 2.1 AA compliant components with keyboard navigation support
• **Responsive Design**: Mobile-first approach using Tailwind's responsive utilities
• **Deployment**: Static site generation compatible with gov.br hosting requirements

## Library Usage Rules

### ✅ Approved Libraries

• **UI Components**: Use shadcn/ui components exclusively for interactive elements (buttons, forms, modals, etc.)
• **Icons**: Only use Lucide React icons to maintain visual consistency
• **Styling**: Tailwind CSS classes only - no custom CSS unless absolutely necessary
• **Routing**: React Router for all navigation and URL management
• **Forms**: React Hook Form for complex form validation and management
• **Data Fetching**: Native fetch API or Axios for HTTP requests
• **Date Handling**: date-fns for date manipulation and formatting
• **Accessibility**: @radix-ui/react-accessible-icon for accessible icon labeling

### ❌ Prohibited Libraries

• **Component Libraries**: No Material UI, Ant Design, or other third-party component libraries
• **State Management**: No Redux, MobX, or external state management libraries
• **Styling**: No styled-components, Emotion, or CSS-in-JS solutions
• **Utility Libraries**: No Lodash, Ramda, or general utility libraries (use native JS or small targeted packages)
• **Animation**: No Framer Motion, GSAP, or heavy animation libraries (use CSS animations or Tailwind classes)
• **Charts**: No Chart.js, D3, or other charting libraries (use gov.br approved visualization components)

### Special Considerations

• **Gov.br Compliance**: All components must follow gov.br design system guidelines
• **Accessibility**: All interactive elements must be keyboard navigable and screen reader compatible
• **Performance**: Bundle size must be minimized - prefer tree-shakable libraries
• **Security**: Never include libraries with known vulnerabilities or unmaintained packages
• **Localization**: All text must support Portuguese (pt-BR) and be easily translatable