"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Send, User, Bot, X, Loader2, FileIcon, Moon, Sun } from 'lucide-react'

export default function DocumentAssistant() {
  const [files, setFiles] = useState<File[]>([])
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files as FileList)])
    }
  }, [])

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: input }])
      setInput("")
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessages((prev) => [...prev, { role: "assistant", content: `Echo: ${input}` }])
      setIsLoading(false)
    }
  }, [input])

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background text-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Document Assistant</CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-muted rounded-md p-2">
                  {file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 object-cover rounded mr-2" />
                  ) : (
                    <FileIcon className="w-8 h-8 mr-2" />
                  )}
                  <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
              <div className={`flex items-start ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className={`${message.role === "user" ? "ml-2" : "mr-2"}`}>
                  <AvatarFallback>{message.role === "user" ? <User /> : <Bot />}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-2 max-w-xs ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}