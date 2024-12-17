import DocumentAssistant from './document-assistant'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center space-y-10">
      <div className="flex flex-col items-center justify-top w-full pt-4 ">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          File Analyser
        </h1>
      </div>
      <DocumentAssistant />
    </main>
  )
}