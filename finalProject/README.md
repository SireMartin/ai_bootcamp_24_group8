# Invoice Assistant

Invoice Assistant is a modern, React-based web application that allows users to upload documents, ask questions about them, and receive AI-powered responses. It features a sleek UI with dark mode support, built using Next.js and shadcn/ui components.

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
- Insights tab with interactive charts

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Getting Started

Follow these steps to set up the Document Assistant project on your local machine:

1. Clone the repository:
   `git clone https://github.com/SireMartin/ai_bootcamp_24_group8`

2. Navigate to the project directory:
   `cd ai_bootcamp_24_group8/finalProject/document-assistant`

3. Install dependencies:
   `npm install`

4. Install shadcn/ui components:
   `npx shadcn@latest init`
   
   Follow the prompts to set up shadcn/ui. Then install the required components:
   `npx shadcn@latest add button card input scroll-area tabs avatar table`

5. Install additional packages:
   `npm install lucide-react recharts`

6. Start the development server:
   `npm run dev`

7. Open the application: 
   Open http://localhost:3000 in your browser.

## Project Structure

- `app/`: Contains the main application code
  - `page.tsx`: The main page component
  - `document-assistant.tsx`: The Document Assistant component
  - `globals.css`: Global styles including dark mode
- `components/`: Contains reusable UI components
  - `ui/`: shadcn/ui components
  - `ui/chart.tsx`: Custom chart component
- `lib/`: Utility functions

## Customization

You can customize the appearance and behavior of the Document Assistant by modifying:
- `app/document-assistant.tsx`: Main component logic and layout
- `app/globals.css`: Global styles and theme variables
- `components/ui/chart.tsx`: Chart component for the Insights tab

To change the primary color or other theme variables, update the CSS variables in `app/globals.css`.

## Testing the Application

1. **Upload files**: Click the "Upload Invoices/Receipts" button to select and upload documents.
2. **Chat interface**: Type messages in the input field and press Enter or click the send button.
3. **Dark mode**: Toggle dark mode by clicking the sun/moon icon in the top right corner.
4. **Tabs**: Switch between Chat, Upload History, and Insights tabs to explore different features.
5. **Charts**: View and interact with the spending overview chart in the Insights tab.

## Next Steps

This is a front-end implementation with simulated data. To fully implement file upload, AI chat functionalities, and real data processing:
- Set up API routes in Next.js to handle file uploads and AI requests
- Implement server-side logic for document processing and AI integration
- Update the client-side code to interact with these API routes
- Implement real data processing for the charts and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)