"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentViewer() {
  const [currentDocument, setCurrentDocument] = useState<string | null>(null)

  return (
    <Card className="h-[calc(100vh-20rem)]">
      <CardContent className="p-6 h-full">
        <Tabs defaultValue="viewer" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="viewer">Document Viewer</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="viewer" className="flex-grow">
            <ScrollArea className="h-[calc(100%-2rem)] rounded-md border">
              {currentDocument ? (
                <div className="p-4">
                  {/* TODO: Implement actual document viewing */}
                  <p>{currentDocument}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>No document selected</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="summary" className="flex-grow">
            <ScrollArea className="h-[calc(100%-2rem)] rounded-md border">
              <div className="p-4">
                <p className="text-muted-foreground">Document summary will appear here after processing.</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

