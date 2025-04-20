"use client"
import { useState, useEffect } from "react"
import { History, RotateCcw, Eye, ArrowLeftRight, Clock, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "@/utils/translations"
import type { ContractTemplate, TemplateVersion } from "@/types/template"
import { formatDate, compareVersions, restoreVersion } from "@/utils/version-history"

interface VersionHistoryDialogProps {
  language: "en" | "ar"
  template: ContractTemplate
  onRestoreVersion: (updatedTemplate: ContractTemplate) => void
}

export default function VersionHistoryDialog({ language, template, onRestoreVersion }: VersionHistoryDialogProps) {
  const t = getTranslations(language)
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null)
  const [compareVersion, setCompareVersion] = useState<TemplateVersion | null>(null)
  const [differences, setDifferences] = useState<Record<string, { before: any; after: any; changed: boolean }>>({})
  const [activeTab, setActiveTab] = useState("history")

  // Sort versions by version number (descending)
  const sortedVersions = [...(template.versionHistory || [])].sort((a, b) => b.version - a.version)

  // Create a "current" version object from the template
  const currentVersion: TemplateVersion = {
    id: "current",
    templateId: template.id,
    version: template.version,
    name: template.name,
    description: template.description,
    contractType: template.contractType,
    responsibilities: template.responsibilities,
    defaultDuration: template.defaultDuration,
    category: template.category,
    createdAt: template.updatedAt || template.createdAt || new Date().toISOString(),
    createdBy: template.lastModifiedBy || template.createdBy || "Unknown",
    changeNotes: "Current version",
  }

  // All versions including current
  const allVersions = [currentVersion, ...sortedVersions]

  // Handle version selection
  const handleSelectVersion = (version: TemplateVersion) => {
    setSelectedVersion(version)
    setActiveTab("view")
  }

  // Handle version comparison
  useEffect(() => {
    if (selectedVersion && compareVersion) {
      const diff = compareVersions(compareVersion, selectedVersion)
      setDifferences(diff)
      setActiveTab("compare")
    }
  }, [selectedVersion, compareVersion])

  // Handle restore version
  const handleRestoreVersion = () => {
    if (!selectedVersion || selectedVersion.id === "current") return

    const restoredTemplate = restoreVersion(template, selectedVersion.id)
    if (restoredTemplate) {
      onRestoreVersion(restoredTemplate)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <History className="h-4 w-4" />
          <span>{t.versionHistory}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <span>
              {t.versionHistoryFor} {template.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="history">{t.history}</TabsTrigger>
            <TabsTrigger value="view" disabled={!selectedVersion}>
              {t.viewVersion}
            </TabsTrigger>
            <TabsTrigger value="compare" disabled={!selectedVersion || !compareVersion}>
              {t.compareVersions}
            </TabsTrigger>
          </TabsList>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {t.totalVersions}: {allVersions.length}
              </p>

              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.version}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.modifiedBy}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.modifiedOn}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.notes}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allVersions.map((version) => (
                      <tr
                        key={version.id}
                        className={`${version.id === "current" ? "bg-blue-50" : ""} hover:bg-gray-50 cursor-pointer`}
                        onClick={() => handleSelectVersion(version)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {version.id === "current" ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-semibold">{t.current}</span>
                              <span className="text-xs text-gray-500">({version.version})</span>
                            </span>
                          ) : (
                            <span>v{version.version}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {version.createdBy || t.unknown}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(version.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                          {version.changeNotes || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleSelectVersion(version)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">{t.view}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCompareVersion(version)}
                              disabled={selectedVersion?.id === version.id}
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                              <span className="sr-only">{t.compare}</span>
                            </Button>
                            {version.id !== "current" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  handleSelectVersion(version)
                                  handleRestoreVersion()
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">{t.restore}</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* View Version Tab */}
          <TabsContent value="view" className="flex-1 overflow-auto">
            {selectedVersion && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      {selectedVersion.id === "current" ? t.current : `v${selectedVersion.version}`}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="h-3 w-3" />
                      {selectedVersion.createdBy || t.unknown}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedVersion.createdAt)}
                    </span>
                  </div>

                  {selectedVersion.id !== "current" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleRestoreVersion}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{t.restoreThisVersion}</span>
                    </Button>
                  )}
                </div>

                {selectedVersion.changeNotes && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{t.changeNotes}</h4>
                    <p className="text-sm text-gray-600">{selectedVersion.changeNotes}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-medium">{selectedVersion.name}</h3>
                    <p className="text-sm text-gray-500">{selectedVersion.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">{t.contractType}</h4>
                      <p className="text-sm">{selectedVersion.contractType}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">{t.category}</h4>
                      <p className="text-sm">{selectedVersion.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">{t.defaultDuration}</h4>
                      <p className="text-sm">
                        {selectedVersion.defaultDuration ? `${selectedVersion.defaultDuration} ${t.days}` : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{t.responsibilities}</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{selectedVersion.responsibilities}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Compare Versions Tab */}
          <TabsContent value="compare" className="flex-1 overflow-auto">
            {selectedVersion && compareVersion && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t.comparingVersions}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {compareVersion.id === "current" ? t.current : `v${compareVersion.version}`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">→</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {selectedVersion.id === "current" ? t.current : `v${selectedVersion.version}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.name}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${differences.name?.changed ? "bg-red-50 border border-red-100" : ""}`}
                      >
                        <p className="text-sm">{compareVersion.name}</p>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.name?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <p className="text-sm">{selectedVersion.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.description}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${
                          differences.description?.changed ? "bg-red-50 border border-red-100" : ""
                        }`}
                      >
                        <p className="text-sm">{compareVersion.description}</p>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.description?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <p className="text-sm">{selectedVersion.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contract Type comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.contractType}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${
                          differences.contractType?.changed ? "bg-red-50 border border-red-100" : ""
                        }`}
                      >
                        <p className="text-sm">{compareVersion.contractType}</p>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.contractType?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <p className="text-sm">{selectedVersion.contractType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Category comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.category}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${
                          differences.category?.changed ? "bg-red-50 border border-red-100" : ""
                        }`}
                      >
                        <p className="text-sm">{compareVersion.category}</p>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.category?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <p className="text-sm">{selectedVersion.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Default Duration comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.defaultDuration}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${
                          differences.defaultDuration?.changed ? "bg-red-50 border border-red-100" : ""
                        }`}
                      >
                        <p className="text-sm">
                          {compareVersion.defaultDuration ? `${compareVersion.defaultDuration} ${t.days}` : "-"}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.defaultDuration?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <p className="text-sm">
                          {selectedVersion.defaultDuration ? `${selectedVersion.defaultDuration} ${t.days}` : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Responsibilities comparison */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="text-sm font-medium">{t.responsibilities}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div
                        className={`p-2 rounded ${
                          differences.responsibilities?.changed ? "bg-red-50 border border-red-100" : ""
                        }`}
                      >
                        <pre className="text-sm whitespace-pre-wrap">{compareVersion.responsibilities}</pre>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          differences.responsibilities?.changed ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <pre className="text-sm whitespace-pre-wrap">{selectedVersion.responsibilities}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
