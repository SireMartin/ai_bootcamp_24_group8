"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Upload, Send, User, Bot, Moon, Sun, TrendingUp } from 'lucide-react'
import { Chart, ChartCard } from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const chartData = [
  { month: "Jan", essentials: 1200, discretionary: 800 },
  { month: "Feb", essentials: 1150, discretionary: 950 },
  { month: "Mar", essentials: 1300, discretionary: 700 },
  { month: "Apr", essentials: 1100, discretionary: 1100 },
  { month: "May", essentials: 1250, discretionary: 850 },
  { month: "Jun", essentials: 1180, discretionary: 920 },
]

const chartColors = ["#3b82f6", "#f97316"] // Blue for essentials, Orange for discretionary

interface Invoice {
  invoice: string;
  paymentStatus: string;
  totalAmount: string;
  paymentMethod: string;
}

const mockInvoices: Invoice[] = [
  { invoice: "INV001", paymentStatus: "Paid", totalAmount: "$250.00", paymentMethod: "Credit Card" },
  { invoice: "INV002", paymentStatus: "Pending", totalAmount: "$175.50", paymentMethod: "PayPal" },
  { invoice: "INV003", paymentStatus: "Paid", totalAmount: "$420.75", paymentMethod: "Bank Transfer" },
  { invoice: "INV004", paymentStatus: "Overdue", totalAmount: "$89.99", paymentMethod: "Credit Card" },
  { invoice: "INV005", paymentStatus: "Paid", totalAmount: "$562.30", paymentMethod: "PayPal" },
]

export default function DocumentAssistant() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [base64, setBase64] = useState<string | null>(null);

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

  //helper methods for file to base64
  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (!event.target.files) return;

    const file = event.target.files[0];
    const base64String = await toBase64(file);
    setBase64(base64String as string);
    console.log(base64?.substring(0, 40));

    const result = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: base64
      }),
    });
    const { data, error, payload } = await result.json();
  };

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

  const getTotalAmount = useCallback(() => {
    return invoices.reduce((total, invoice) => total + parseFloat(invoice.totalAmount.replace('$', '')), 0).toFixed(2)
  }, [invoices])

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background text-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </CardHeader>
      <CardContent>
        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Invoices/Receipts
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
                accept=".jpg,.jpeg,.png"
              />
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
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask a question about your invoices..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{invoice.paymentStatus}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">${getTotalAmount()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
        {activeTab === "insights" && (
          <Card>
            <CardHeader>
              <CardTitle>Private Spending Overview</CardTitle>
              <CardDescription>Essential vs Discretionary Spending (January - June 2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartCard title="Monthly Spending">
                <Chart
                  data={chartData}
                  categories={["essentials", "discretionary"]}
                  colors={chartColors}
                />
              </ChartCard>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Discretionary spending up by 3.8% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing essential vs discretionary spending for the last 6 months
              </div>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}