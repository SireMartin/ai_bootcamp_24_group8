import DocumentUpload from './components/document-upload'
import DocumentViewer from './components/document-viewer'
import ChatInterface from './components/chat-interface'

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <DocumentUpload />
          <DocumentViewer />
        </div>
        <ChatInterface />
      </div>
    </main>
  )
}

