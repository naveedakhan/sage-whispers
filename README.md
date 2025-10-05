# Life's Little Instruction Engine

A modern web application that provides timeless wisdom and practical guidance for living a fulfilling life. Search through thousands of curated life instructions to find exactly what you need.

## Features

- **Random Daily Instructions**: Discover new wisdom every day
- **Advanced Search**: Find specific instructions by tags, categories, or keywords
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Technologies Used

This project is built with modern web technologies:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React 18** - Modern React with hooks and concurrent features
- **React Router** - Client-side routing
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service for database and authentication
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_REPOSITORY_URL>
cd sage-whispers
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
└── integrations/  # External service integrations
```

## Deployment

This project can be deployed to various platforms:

- **Vercel** - Recommended for easy deployment
- **Netlify** - Great for static sites
- **GitHub Pages** - Free hosting for public repositories

### Environment Variables

Make sure to set up your environment variables for production:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.