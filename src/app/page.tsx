"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  File,
  Trash2,
  FileJson,
  FileCode,
  X,
  Minus,
  Square,
  Plus,
} from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FileStructure {
  [key: string]: {
    type: "js" | "jsx" | "ts" | "tsx" | "other"
    snippets: string[]
  }
}

export default function CodeVisualizer() {
  const [files, setFiles] = useState<FileStructure>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [newCode, setNewCode] = useState("")
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false)

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "js":
      case "jsx":
        return <FileJson className="mr-2 h-4 w-4 text-yellow-400" />
      case "ts":
      case "tsx":
        return <FileCode className="mr-2 h-4 w-4 text-blue-400" />
      default:
        return <File className="mr-2 h-4 w-4" />
    }
  }

  const addFile = () => {
    if (newFileName) {
      const fileExtension = newFileName.split(".").pop() || "other"
      const fileType = ["js", "jsx", "ts", "tsx"].includes(fileExtension)
        ? fileExtension
        : "other"
      setFiles((prev) => ({
        ...prev,
        [newFileName]: {
          type: fileType as "js" | "jsx" | "ts" | "tsx" | "other",
          snippets: [],
        },
      }))
      setSelectedFile(newFileName)
      setOpenTabs((prev) => [...prev, newFileName])
      setNewFileName("")
      setIsFileDialogOpen(false)
    }
  }

  const addCode = () => {
    if (selectedFile && newCode) {
      setFiles((prev) => ({
        ...prev,
        [selectedFile]: {
          ...prev[selectedFile],
          snippets: [...prev[selectedFile].snippets, newCode],
        },
      }))
      setNewCode("")
      setIsCodeDialogOpen(false)
    }
  }

  const deleteCodeSnippet = (fileName: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        snippets: prev[fileName].snippets.filter((_, i) => i !== index),
      },
    }))
  }

  const deleteFile = (fileName: string) => {
    setFiles((prev) => {
      const { [fileName]: _, ...rest } = prev
      return rest
    })
    if (selectedFile === fileName) {
      setSelectedFile(null)
    }
    setOpenTabs((prev) => prev.filter((tab) => tab !== fileName))
  }

  const openTab = (fileName: string) => {
    setSelectedFile(fileName)
    if (!openTabs.includes(fileName)) {
      setOpenTabs((prev) => [...prev, fileName])
    }
  }

  const closeTab = (fileName: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab !== fileName))
    if (selectedFile === fileName) {
      setSelectedFile(openTabs.find((tab) => tab !== fileName) || null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="flex w-64 flex-col bg-gray-800">
        <div className="flex-grow p-4">
          <h2 className="mb-4 text-xl font-bold">Explorer</h2>
          <ScrollArea className="h-full">
            {Object.entries(files).map(([fileName, fileData]) => (
              <motion.div
                key={fileName}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-2"
              >
                <div
                  className={`flex cursor-pointer items-center justify-between p-2 rounded ${
                    selectedFile === fileName ? "bg-[#011627]" : ""
                  }`}
                  onClick={() => openTab(fileName)}
                >
                  <div className="flex items-center">
                    {getFileIcon(fileData.type)}
                    <span>{fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(fileName)
                    }}
                  >
                    <Trash2 className="h-4 w-4 opacity-50 hover:opacity-100" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </ScrollArea>
        </div>
        <div className="p-4">
          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New File</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                placeholder="New file name (e.g. app.js)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mb-2"
              />
              <Button onClick={addFile} className="w-full">
                Add File
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* macOS-like tabs */}
        <div className="flex bg-gray-800 p-2">
          {/* Traffic light buttons */}
          <div className="flex mr-4 space-x-2 mt-4">
            <button className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600">
              <X className="w-2 h-2 m-auto text-red-800 opacity-0 hover:opacity-100" />
            </button>
            <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600">
              <Minus className="w-2 h-2 m-auto text-yellow-800 opacity-0 hover:opacity-100" />
            </button>
            <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600">
              <Square className="w-2 h-2 m-auto text-green-800 opacity-0 hover:opacity-100" />
            </button>
          </div>

          <div className="flex flex-1">
            {openTabs.map((tab) => (
              <div
                key={tab}
                className={`flex items-center rounded-t-lg px-3 py-1 mr-1 cursor-pointer ${
                  selectedFile === tab ? "bg-gray-900" : "bg-gray-700"
                }`}
                onClick={() => setSelectedFile(tab)}
              >
                {getFileIcon(files[tab].type)}
                <span className="mr-2">{tab}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-auto p-4">
          {selectedFile && (
            <div>
              <ScrollArea className="h-full">
                <AnimatePresence>
                  {files[selectedFile].snippets.map((snippet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="mb-4 relative text-sm"
                    >
                      <Highlight
                        theme={themes.nightOwl}
                        code={snippet}
                        language={
                          files[selectedFile].type === "other"
                            ? "javascript"
                            : files[selectedFile].type
                        }
                      >
                        {({
                          className,
                          style,
                          tokens,
                          getLineProps,
                          getTokenProps,
                        }) => (
                          <pre
                            className={className}
                            style={{
                              ...style,
                              background: "transparent",
                              padding: "0.1em",
                            }}
                          >
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line, key: i })}>
                                {line.map((token, key) => (
                                  <span
                                    key={key}
                                    {...getTokenProps({ token, key })}
                                  />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                      <Button
                        size="sm"
                        className="absolute top-2 right-2 bg-blue shadow-none"
                        onClick={() => deleteCodeSnippet(selectedFile, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="p-4">
          <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!selectedFile}>
                <Plus className="mr-2 h-4 w-4" />
                Add Code Snippet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Code Snippet</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="Add code snippet"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="mb-2 h-32"
              />
              <Button onClick={addCode} className="w-full">
                Add Code Snippet
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
