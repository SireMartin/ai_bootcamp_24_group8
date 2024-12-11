## Encode AI Bootcamp 24 Group 8 Final Project
# Document Assistant

Document Assistant is a modern, React-based web application that allows users to upload documents, ask questions about them, and receive AI-powered responses. It features a sleek UI with dark mode support, built using Next.js and shadcn/ui components.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Testing the Application](#testing-the-application)
- [Next Steps](#next-steps)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- File upload and preview for PDF, JPG, and PNG files
- Chat interface for asking questions about uploaded documents
- Dark mode toggle
- Responsive design

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Getting Started

1. **Clone the repository**:    ```bash
   git clone https://github.com/SireMartin/ai_bootcamp_24_group8   ```
2. **Navigate to the project directory**:   ```bash
   cd ai_bootcamp_24_group8   ```
3. **Navigate to the final project directory**:   ```bash
   cd finalProject   ```
4. **Navigate to the document-assistant directory**:   ```bash
   cd document-assistant   ```
5. **Install dependencies**:   ```bash
   npm install   ```
6. **Install shadcn/ui components**:   ```bash
   npx shadcn@latest add button card input scroll-area avatar   ```
7. **Install additional packages**:   ```bash
   npm install lucide-react   ```
8. **Start the development server**:   ```bash
   npm run dev   ```
9. **Open the application**: 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Contains the main application code
  - `page.tsx`: The main page component
  - `document-assistant.tsx`: The Document Assistant component
  - `globals.css`: Global styles including dark mode
- `components/`: Contains reusable UI components (provided by shadcn/ui)

## Customization

You can customize the appearance and behavior of the Document Assistant by modifying:
- `app/document-assistant.tsx`: Main component logic and layout
- `app/globals.css`: Global styles and theme variables

For example, to change the primary color, update the CSS variables in `globals.css`.

## Testing the Application

1. **Upload files**: Click the "Upload Files" button to select and upload documents.
2. **Chat interface**: Type messages in the input field and press Enter or click the send button.
3. **Dark mode**: Toggle dark mode by clicking the sun/moon icon in the top right corner.

## Next Steps

This is a front-end only implementation. To fully implement file upload and AI chat functionalities:
- Set up API routes in Next.js to handle file uploads and AI requests
- Implement server-side logic for document processing and AI integration
- Update the client-side code to interact with these API routes

Consider exploring [Next.js API routes documentation](https://nextjs.org/docs/api-routes/introduction) for guidance.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)