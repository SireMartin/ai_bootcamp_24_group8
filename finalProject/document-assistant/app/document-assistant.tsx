"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload, Send, User, Bot, Moon, Sun, TrendingUp } from "lucide-react";
import { Chart, ChartCard } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/ui/Spinner";


const chartColors = ["#f97316"]; // Blue for essentials, Orange for discretionary


interface MerchantAmount {
  merchantName: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
}

// Define the root interface for the entire data structure
interface MerchantData {
  merchantAmounts: MerchantAmount[];
}



type chartdata = Record<string, number>; 


export default function DocumentAssistant() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tabdata,setTabdata] = useState<MerchantData|null>(null)
  const [ChartData,setChartData] = useState<chartdata|null>(null)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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

  function getTotalAmount(){
    return tabdata?.merchantAmounts.reduce((sum, item) => sum + item.totalAmount, 0)
  }
  function groupByMerchant(data: MerchantData){
    const groupedData = data.merchantAmounts.reduce<Record<string, number>>((acc, curr) => {
      const { merchantName, totalAmount } = curr;
  
      if (!acc[merchantName]) {
        acc[merchantName] = 0;
      }
  
      acc[merchantName] += totalAmount;
  
      return acc;
    }, {});
  
    setChartData(groupedData) ;
  }

  const handleChartData = async()=>{
    setIsLoading(true)
    try{
      const response = await fetch("/api/summarize",{
        method:"GET"
      })
     
      if (response.ok){
        const data = await response.json()
        setTabdata(data)
        groupByMerchant(data)
        
      } else {
        // Handle case where the response is not OK (status code 4xx or 5xx)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: Response not OK, status: ${response.status}` },
        ]);
      }
    }catch (error){
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Request failed" },
      ]);
    }finally{
      setIsLoading(false)
    }
    
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (!event.target.files) return;

    setIsLoading(true);

    const file = event.target.files[0];
    const base64String = await toBase64(file);

    // Set file preview URL
    setFilePreview(URL.createObjectURL(file));

    try {
      const result = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: base64String,
        }),
      });
      const { data, error, payload } = await result.json();
      
      // Handle the response if needed
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleSendMessage = useCallback(async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        });

        if (response.ok) {
          const data = await response.json();

          let assistantResponse = data?.text?.value ?? "No valid response";
          assistantResponse = assistantResponse
            .replace(/\[.*?source\]/g, "")
            .trim();
          assistantResponse = assistantResponse.replace(/\*\*(.*?)\*\*/g, "$1");
          assistantResponse = assistantResponse.replace(/\s{2,}/g, " ");

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantResponse },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Error: Failed to get a response" },
          ]);
        }
      } catch (error) {
        console.error("Request failed:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error: Request failed" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [input]);



  return (

      <Card className="w-full max-w-4xl mx-auto bg-background text-foreground ">
      
      <CardHeader className="flex flex-row items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="relative">
        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Invoices/Receipts
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              {filePreview && (
                <button
                  onClick={() => window.open(filePreview, "_blank")}
                  className="flex items-center ml-2"
                >
                  <img
                    src={filePreview}
                    alt="File Preview"
                    className="w-10 h-10 object-cover rounded-md"
                  />
                  <span className="ml-2 text-primary">+</span>
                </button>
              )}
            </div>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 relative">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`flex items-start ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar
                        className={`${
                          message.role === "user" ? "ml-2" : "mr-2"
                        }`}
                      >
                        <AvatarFallback>
                          {message.role === "user" ? <User /> : <Bot />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-2 max-w-xs ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              {/* Input Field and Button */}
              <div className="flex w-full items-center space-x-2 mt-2">
                <Input
                  type="text"
                  placeholder="Ask a question about your invoices..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading }
                >
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
          </div>
        )}
        <>
          <Button variant="outline" onClick={handleChartData}>
            Summarize
          </Button>
          {activeTab === "history" && tabdata!==null &&(
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
                {tabdata.merchantAmounts.map((invoice) => (
                  <TableRow key={`${invoice.merchantName}_${Math.random()}`}>
                    <TableCell className="font-medium">
                      {invoice.merchantName}
                    </TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>{invoice.currency}</TableCell>
                    <TableCell className="text-right">
                      {invoice.totalAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">
                    ${getTotalAmount()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
          {activeTab === "insights" && ChartData!==null && (
            <Card>
              <CardHeader>
                <CardTitle>Private Spending Overview</CardTitle>
                <CardDescription>
                  spending per merchant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartCard title="Spendings">
                  <Chart
                    data={Object.keys(ChartData).map((merchantName) => ({
                      [merchantName]: ChartData[merchantName], 
                    }))}
                    categories={Object.keys(ChartData)}
                    colors={chartColors}
                  />
                </ChartCard>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                  Showing total amounts spent per merchant 
                </div>
              </CardFooter>
            </Card>
          )}
        </>
      </CardContent>
    </Card>
  )
}
