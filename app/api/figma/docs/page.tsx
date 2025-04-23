"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon, Code, FileJson, Key, Globe, AlertCircle } from "lucide-react"
import { Header } from "@/app/components/header"
import { useLanguage } from "@/app/contexts/language-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

// Add this import at the top
import { getMaskedApiKey, verifyApiKey } from "@/app/actions/api-key-actions"

export default function FigmaApiDocsPage() {
  const { language } = useLanguage()
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showApiKeyWarning] = useState(true)

  // Replace the apiKey constant with:
  const [maskedApiKey, setMaskedApiKey] = useState<string>("••••...••••")

  // Add this effect to fetch the masked API key
  useEffect(() => {
    async function fetchMaskedKey() {
      const masked = await getMaskedApiKey()
      setMaskedApiKey(masked)
    }
    fetchMaskedKey()
  }, [])

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const apiKey = "YOUR_API_KEY" // Placeholder for documentation purposes
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/api/figma` : "/api/figma"

  // Add this function to the component
  async function handleVerifyApiKey(keyToTest: string) {
    const isValid = await verifyApiKey(keyToTest)
    if (isValid) {
      toast({
        title: "API Key Valid",
        description: "The API key you entered is valid.",
      })
    } else {
      toast({
        title: "Invalid API Key",
        description: "The API key you entered is not valid.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {language === "en" ? "Figma Plugin API Documentation" : "توثيق واجهة برمجة التطبيقات لملحق فيجما"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === "en"
                ? "Reference documentation for the Figma plugin integration"
                : "وثائق مرجعية لتكامل ملحق فيجما"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {language === "en"
                ? "Documentation available in English and Arabic"
                : "الوثائق متوفرة باللغتين الإنجليزية والعربية"}
            </span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="overview">{language === "en" ? "Overview" : "نظرة عامة"}</TabsTrigger>
            <TabsTrigger value="authentication">{language === "en" ? "Authentication" : "المصادقة"}</TabsTrigger>
            <TabsTrigger value="endpoints">{language === "en" ? "Endpoints" : "نقاط النهاية"}</TabsTrigger>
            <TabsTrigger value="schema">{language === "en" ? "JSON Schema" : "مخطط JSON"}</TabsTrigger>
            <TabsTrigger value="examples">{language === "en" ? "Examples" : "أمثلة"}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "API Overview" : "نظرة عامة على واجهة برمجة التطبيقات"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "The Figma Plugin API allows you to retrieve and manipulate contract data in a Figma-compatible JSON format."
                    : "تتيح واجهة برمجة تطبيقات ملحق فيجما استرداد ومعالجة بيانات العقد بتنسيق JSON متوافق مع فيجما."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Base URL" : "عنوان URL الأساسي"}</h3>
                  <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
                    <code>{baseUrl}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(baseUrl, "base-url")}>
                      {copiedEndpoint === "base-url" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Integration Overview" : "نظرة عامة على التكامل"}
                  </h3>
                  <p>
                    {language === "en"
                      ? "The Figma Plugin API serves as the central communication layer between the Figma plugin and the contract generation system. It enables the following capabilities:"
                      : "تعمل واجهة برمجة تطبيقات ملحق فيجما كطبقة اتصال مركزية بين ملحق فيجما ونظام إنشاء العقود. وهي تمكن القدرات التالية:"}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      {language === "en"
                        ? "Retrieving a list of available contracts from the system"
                        : "استرداد قائمة العقود المتاحة من النظام"}
                    </li>
                    <li>
                      {language === "en"
                        ? "Fetching detailed contract data in a Figma-compatible JSON format"
                        : "جلب بيانات العقد المفصلة بتنسيق JSON متوافق مع فيجما"}
                    </li>
                    <li>
                      {language === "en"
                        ? "Regenerating contract layouts for existing contracts"
                        : "إعادة إنشاء تخطيطات العقود للعقود الموجودة"}
                    </li>
                    <li>
                      {language === "en"
                        ? "Converting contract data into Figma design elements"
                        : "تحويل بيانات العقد إلى عناصر تصميم فيجما"}
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Response Format" : "تنسيق الاستجابة"}</h3>
                  <p>
                    {language === "en"
                      ? "All API responses are returned in JSON format with a consistent structure."
                      : "يتم إرجاع جميع استجابات واجهة برمجة التطبيقات بتنسيق JSON مع هيكل متسق."}
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Error Handling" : "معالجة الأخطاء"}</h3>
                  <p>
                    {language === "en"
                      ? "Errors are returned with a consistent format and appropriate HTTP status codes."
                      : "يتم إرجاع الأخطاء بتنسيق متسق ورموز حالة HTTP مناسبة."}
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`{
  "success": false,
  "error": "Error message describing what went wrong"
}`}
                    </pre>
                  </div>
                </div>

                <Alert>
                  <FileJson className="h-4 w-4" />
                  <AlertTitle>{language === "en" ? "Figma-Compatible JSON" : "JSON متوافق مع فيجما"}</AlertTitle>
                  <AlertDescription>
                    {language === "en"
                      ? "The API returns JSON structures that can be directly imported into Figma using the plugin. These structures follow Figma's node hierarchy and properties."
                      : "تُرجع واجهة برمجة التطبيقات هياكل JSON التي يمكن استيرادها مباشرة إلى فيجما باستخدام الملحق. تتبع هذه الهياكل التسلسل الهرمي للعقد وخصائص فيجما."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Authentication" : "المصادقة"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "All API requests require authentication using an API key."
                    : "تتطلب جميع طلبات واجهة برمجة التطبيقات المصادقة باستخدام مفتاح API."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {showApiKeyWarning && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{language === "en" ? "API Key Security" : "أمان مفتاح API"}</AlertTitle>
                    <AlertDescription>
                      {language === "en"
                        ? "For security reasons, we don't display the actual API key here. You should obtain your API key from your administrator and keep it secure."
                        : "لأسباب أمنية، لا نعرض مفتاح API الفعلي هنا. يجب عليك الحصول على مفتاح API الخاص بك من المسؤول والحفاظ عليه آمنًا."}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "API Key" : "مفتاح API"}</h3>
                  <p>
                    {language === "en"
                      ? "Include your API key in the x-api-key header with all requests."
                      : "قم بتضمين مفتاح API الخاص بك في رأس x-api-key مع جميع الطلبات."}
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
                    <code>x-api-key: {maskedApiKey}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`x-api-key: YOUR_API_KEY`, "api-key")}
                    >
                      {copiedEndpoint === "api-key" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Example Request" : "مثال على الطلب"}</h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`// JavaScript example
fetch('${baseUrl}/contracts', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Authentication Flow" : "تدفق المصادقة"}</h3>
                  <p>
                    {language === "en"
                      ? "The authentication flow for the Figma plugin is as follows:"
                      : "تدفق المصادقة لملحق فيجما هو كما يلي:"}
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 mt-2">
                    <li>
                      {language === "en"
                        ? "The API key is stored securely in the Figma plugin."
                        : "يتم تخزين مفتاح API بشكل آمن في ملحق فيجما."}
                    </li>
                    <li>
                      {language === "en"
                        ? "For each API request, the plugin includes the API key in the x-api-key header."
                        : "لكل طلب API، يتضمن الملحق مفتاح API في رأس x-api-key."}
                    </li>
                    <li>
                      {language === "en"
                        ? "The server validates the API key before processing the request."
                        : "يتحقق الخادم من مفتاح API قبل معالجة الطلب."}
                    </li>
                    <li>
                      {language === "en"
                        ? "If the API key is invalid, the server returns a 401 Unauthorized response."
                        : "إذا كان مفتاح API غير صالح، يعيد الخادم استجابة 401 غير مصرح به."}
                    </li>
                  </ol>
                </div>

                <Alert variant="destructive">
                  <Key className="h-4 w-4" />
                  <AlertTitle>{language === "en" ? "Security Warning" : "تحذير أمني"}</AlertTitle>
                  <AlertDescription>
                    {language === "en"
                      ? "Keep your API key secure and never expose it in client-side code. The Figma plugin should make requests through a secure backend or use appropriate security measures."
                      : "حافظ على أمان مفتاح API الخاص بك ولا تعرضه أبدًا في كود جانب العميل. يجب أن يقوم ملحق فيجما بإجراء طلبات من خلال خلفية آمنة أو استخدام إجراءات أمنية مناسبة."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "API Endpoints" : "نقاط نهاية API"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Available endpoints for the Figma Plugin API."
                    : "نقاط النهاية المتاحة لواجهة برمجة تطبيقات ملحق فيجما."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* List Contracts Endpoint */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{language === "en" ? "List Contracts" : "قائمة العقود"}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`GET ${baseUrl}/contracts`, "list-contracts")}
                    >
                      {copiedEndpoint === "list-contracts" ? (
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <CopyIcon className="h-4 w-4 mr-2" />
                      )}
                      {language === "en" ? "Copy" : "نسخ"}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code>GET {baseUrl}/contracts</code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Description" : "الوصف"}</h4>
                    <p>
                      {language === "en"
                        ? "Retrieves a list of available contracts with basic information."
                        : "يسترجع قائمة العقود المتاحة مع المعلومات الأساسية."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Query Parameters" : "معلمات الاستعلام"}</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <code>limit</code> -{" "}
                        {language === "en"
                          ? "Number of contracts to return (default: 10)"
                          : "عدد العقود المراد إرجاعها (الافتراضي: 10)"}
                      </li>
                      <li>
                        <code>offset</code> -{" "}
                        {language === "en" ? "Offset for pagination (default: 0)" : "الإزاحة للتصفح (الافتراضي: 0)"}
                      </li>
                      <li>
                        <code>search</code> -{" "}
                        {language === "en" ? "Search term to filter contracts" : "مصطلح البحث لتصفية العقود"}
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Response" : "الاستجابة"}</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <pre className="text-sm">
                        {`{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "created_at": "2023-01-01T00:00:00.000Z",
        "first_party": "Company A",
        "second_party": "Company B",
        "promoter": "John Doe",
        "has_json_layout": true
      },
      // ...more contracts
    ],
    "total": 42,
    "limit": 10,
    "offset": 0
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Get Contract JSON Endpoint */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      {language === "en" ? "Get Contract JSON" : "الحصول على JSON للعقد"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`GET ${baseUrl}/contracts/{id}`, "get-contract")}
                    >
                      {copiedEndpoint === "get-contract" ? (
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <CopyIcon className="h-4 w-4 mr-2" />
                      )}
                      {language === "en" ? "Copy" : "نسخ"}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code>
                      GET {baseUrl}/contracts/{"{id}"}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Description" : "الوصف"}</h4>
                    <p>
                      {language === "en"
                        ? "Retrieves the Figma-compatible JSON layout for a specific contract."
                        : "يسترجع تخطيط JSON المتوافق مع فيجما لعقد محدد."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Path Parameters" : "معلمات المسار"}</h4>
                    <ul className="list-disc pl-6">
                      <li>
                        <code>id</code> - {language === "en" ? "The UUID of the contract" : "معرف UUID للعقد"}
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Response" : "الاستجابة"}</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <pre className="text-sm">
                        {`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2023-01-01T00:00:00.000Z",
    "layout": {
      // Figma-compatible JSON structure
      "id": "...",
      "version": "1.0",
      "type": "contract",
      "metadata": { ... },
      "figmaDocument": { ... }
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Regenerate Contract JSON Endpoint */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      {language === "en" ? "Regenerate Contract JSON" : "إعادة إنشاء JSON للعقد"}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`POST ${baseUrl}/contracts/regenerate`, "regenerate-contract")}
                    >
                      {copiedEndpoint === "regenerate-contract" ? (
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <CopyIcon className="h-4 w-4 mr-2" />
                      )}
                      {language === "en" ? "Copy" : "نسخ"}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code>POST {baseUrl}/contracts/regenerate</code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Description" : "الوصف"}</h4>
                    <p>
                      {language === "en"
                        ? "Regenerates the Figma-compatible JSON layout for an existing contract. This is useful for contracts created before the Figma integration was implemented or when the contract structure has been updated."
                        : "يعيد إنشاء تخطيط JSON المتوافق مع فيجما لعقد موجود. هذا مفيد للعقود التي تم إنشاؤها قبل تنفيذ تكامل فيجما أو عندما تم تحديث هيكل العقد."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Request Body" : "نص الطلب"}</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <pre className="text-sm">
                        {`{
  "contractId": "123e4567-e89b-12d3-a456-426614174000"
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{language === "en" ? "Response" : "الاستجابة"}</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <pre className="text-sm">
                        {`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2023-01-01T00:00:00.000Z",
    "layout": {
      // Newly generated Figma-compatible JSON structure
      "id": "...",
      "version": "1.0",
      "type": "contract",
      "metadata": { ... },
      "figmaDocument": { ... }
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JSON Schema Tab */}
          <TabsContent value="schema">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "JSON Schema" : "مخطط JSON"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "The structure of the Figma-compatible JSON layout."
                    : "هيكل تخطيط JSON المتوافق مع فيجما."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Top-Level Structure" : "الهيكل العلوي"}</h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`{
  "id": "unique-identifier",
  "version": "1.0",
  "type": "contract",
  "metadata": {
    // Contract metadata
  },
  "figmaDocument": {
    // Figma document structure
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Metadata Structure" : "هيكل البيانات الوصفية"}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`"metadata": {
  "title": "Promotion Agreement",
  "titleAr": "اتفاقية ترويج",
  "refNumber": "CONT-123456",
  "firstParty": {
    "name": "Company A",
    "nameAr": "الشركة أ",
    "address": "123 Main St",
    "addressAr": "١٢٣ الشارع الرئيسي"
  },
  "secondParty": {
    "name": "Company B",
    "nameAr": "الشركة ب",
    "address": "456 Side St",
    "addressAr": "٤٥٦ الشارع الجانبي"
  },
  "promoter": {
    "name": "John Doe",
    "nameAr": "جون دو"
  },
  "product": {
    "name": "Product X",
    "nameAr": "المنتج س"
  },
  "location": {
    "name": "Location Y",
    "nameAr": "الموقع ص"
  },
  "dates": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-12-31T00:00:00.000Z",
    "durationDays": 365
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Figma Document Structure" : "هيكل مستند فيجما"}
                  </h3>
                  <p>
                    {language === "en"
                      ? "The figmaDocument property contains a structure that follows Figma's node hierarchy. Here's a simplified example:"
                      : "تحتوي خاصية figmaDocument على هيكل يتبع التسلسل الهرمي لعقد فيجما. إليك مثال مبسط:"}
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`"figmaDocument": {
  "type": "DOCUMENT",
  "children": [
    {
      "type": "PAGE",
      "children": [
        {
          "type": "FRAME",
          "children": [
            {
              "type": "TEXT",
              "characters": "Contract Title",
              "style": {
                "fontFamily": "Arial",
                "fontSize": 24,
                "fontWeight": 700,
                "textAlignHorizontal": "CENTER",
                "textAlignVertical": "CENTER",
                "fills": [
                  {
                    "type": "SOLID",
                    "color": {
                      "r": 0,
                      "g": 0,
                      "b": 0
                    }
                  }
                ]
              }
            },
            // More Figma elements...
          ],
          "layoutMode": "VERTICAL",
          "primaryAxisAlignItems": "CENTER",
          "counterAxisAlignItems": "CENTER",
          "paddingLeft": 40,
          "paddingRight": 40,
          "paddingTop": 40,
          "paddingBottom": 40,
          "itemSpacing": 16,
          "width": 595,
          "height": 842
        }
      ]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{language === "en" ? "Figma Node Types" : "أنواع عقد فيجما"}</h3>
                  <p>
                    {language === "en"
                      ? "The Figma document structure uses various node types to represent different elements:"
                      : "يستخدم هيكل مستند فيجما أنواعًا مختلفة من العقد لتمثيل العناصر المختلفة:"}
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <code>DOCUMENT</code> -{" "}
                      {language === "en" ? "The root node of the Figma file" : "العقدة الجذرية لملف فيجما"}
                    </li>
                    <li>
                      <code>PAGE</code> - {language === "en" ? "A page within the Figma file" : "صفحة داخل ملف فيجما"}
                    </li>
                    <li>
                      <code>FRAME</code> -{" "}
                      {language === "en" ? "A container for other elements" : "حاوية للعناصر الأخرى"}
                    </li>
                    <li>
                      <code>TEXT</code> - {language === "en" ? "A text element" : "عنصر نصي"}
                    </li>
                    <li>
                      <code>RECTANGLE</code> - {language === "en" ? "A rectangle shape" : "شكل مستطيل"}
                    </li>
                    <li>
                      <code>IMAGE</code> - {language === "en" ? "An image element" : "عنصر صورة"}
                    </li>
                  </ul>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Code className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">
                    {language === "en" ? "Developer Resources" : "موارد المطور"}
                  </AlertTitle>
                  <AlertDescription className="text-blue-600">
                    {language === "en"
                      ? "For more information on Figma's plugin API and JSON structure, refer to the official Figma Plugin API documentation."
                      : "لمزيد من المعلومات حول واجهة برمجة تطبيقات ملحق فيجما وهيكل JSON، راجع وثائق واجهة برمجة تطبيقات ملحق فيجما الرسمية."}
                    <a
                      href="https://www.figma.com/plugin-docs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 underline"
                    >
                      {language === "en" ? "Figma Plugin Documentation →" : "وثائق ملحق فيجما ←"}
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle>{language === "en" ? "Usage Examples" : "أمثلة الاستخدام"}</CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Code examples for common operations with the Figma Plugin API."
                    : "أمثلة التعليمات البرمجية للعمليات الشائعة مع واجهة برمجة تطبيقات ملحق فيجما."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Fetching Contracts List" : "جلب قائمة العقود"}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`// Example: Fetching a list of contracts
async function fetchContracts() {
  try {
    const response = await fetch('${baseUrl}/contracts', {
      headers: {
        'x-api-key': 'YOUR_API_KEY'
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch contracts');
    }
    
    return data.data.contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Getting Contract JSON" : "الحصول على JSON للعقد"}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`// Example: Getting a specific contract's JSON layout
async function getContractJson(contractId) {
  try {
    const response = await fetch(\`${baseUrl}/contracts/\${contractId}\`, {
      headers: {
        'x-api-key': 'YOUR_API_KEY'
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch contract JSON');
    }
    
    return data.data.layout;
  } catch (error) {
    console.error('Error fetching contract JSON:', error);
    throw error;
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Regenerating Contract JSON" : "إعادة إنشاء JSON للعقد"}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`// Example: Regenerating a contract's JSON layout
async function regenerateContractJson(contractId) {
  try {
    const response = await fetch('${baseUrl}/contracts/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY'
      },
      body: JSON.stringify({
        contractId: contractId
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to regenerate contract JSON');
    }
    
    return data.data.layout;
  } catch (error) {
    console.error('Error regenerating contract JSON:', error);
    throw error;
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "Creating Figma Nodes from JSON" : "إنشاء عقد فيجما من JSON"}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm">
                      {`// Example: Creating Figma nodes from contract JSON (inside a Figma plugin)
async function createFigmaNodesFromContract(contractId) {
  try {
    // Fetch the contract JSON
    const contractJson = await getContractJson(contractId);
    
    // Access the Figma document structure
    const figmaDoc = contractJson.figmaDocument;
    
    // Create a new page in the Figma document
    const page = figma.createPage();
    page.name = \`Contract - \${contractJson.metadata.title}\`;
    
    // Process the document structure and create Figma nodes
    // This is a simplified example - you would need to recursively process the structure
    figmaDoc.children[0].children.forEach(frame => {
      const figmaFrame = figma.createFrame();
      figmaFrame.resize(frame.width, frame.height);
      figmaFrame.layoutMode = frame.layoutMode;
      // Set other properties...
      
      // Add the frame to the page
      page.appendChild(figmaFrame);
      
      // Process children of the frame
      // ...
    });
    
    // Select the new page
    figma.currentPage = page;
    
    return page;
  } catch (error) {
    console.error('Error creating Figma nodes:', error);
    throw error;
  }
}`}
                    </pre>
                  </div>
                </div>

                <Alert>
                  <AlertTitle>{language === "en" ? "Note" : "ملاحظة"}</AlertTitle>
                  <AlertDescription>
                    {language === "en"
                      ? "These examples are simplified for clarity. In a real implementation, you would need to handle errors, authentication, and other details more robustly."
                      : "هذه الأمثلة مبسطة للوضوح. في التنفيذ الحقيقي، ستحتاج إلى التعامل مع الأخطاء والمصادقة والتفاصيل الأخرى بشكل أكثر قوة."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
