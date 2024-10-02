"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { File, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

interface FileStructure {
  [key: string]: string[]
}

export default function CodeVisualizer() {
  const [files, setFiles] = useState<FileStructure>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [newCode, setNewCode] = useState("")

  const addFile = () => {
    if (newFileName) {
      setFiles((prev) => ({ ...prev, [newFileName]: [] }))
      setNewFileName("")
    }
  }

  const addCode = () => {
    if (selectedFile && newCode) {
      setFiles((prev) => ({
        ...prev,
        [selectedFile]: [...(prev[selectedFile] || []), newCode],
      }))
      setNewCode("")
    }
  }

  const deleteCodeSnippet = (fileName: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [fileName]: prev[fileName].filter((_, i) => i !== index),
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
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="flex w-64 flex-col bg-gray-800">
        <div className="flex-grow p-4">
          <h2 className="mb-4 text-xl font-bold">Explorer</h2>
          <ScrollArea className="h-full">
            {Object.entries(files).map(([fileName, codeSnippets]) => (
              <motion.div
                key={fileName}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-2"
              >
                <div
                  className={`flex cursor-pointer items-center justify-between p-2 rounded ${
                    selectedFile === fileName ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setSelectedFile(fileName)}
                >
                  <div className="flex items-center">
                    {codeSnippets.length > 0 ? (
                      <ChevronDown className="mr-1 h-4 w-4" />
                    ) : (
                      <ChevronRight className="mr-1 h-4 w-4" />
                    )}
                    <File className="mr-2 h-4 w-4" />
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
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </ScrollArea>
        </div>
        <div className="p-4">
          <Input
            type="text"
            placeholder="New file name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="mb-2"
          />
          <Button onClick={addFile} className="w-full">
            Add File
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-grow overflow-auto p-4">
          {selectedFile && (
            <div>
              <h2 className="mb-4 text-xl font-bold">{selectedFile}</h2>
              <ScrollArea className="h-full">
                <AnimatePresence>
                  {files[selectedFile].map((snippet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="mb-4 relative"
                    >
                      <Highlight
                        theme={themes.dracula}
                        code={snippet}
                        language="javascript"
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
                              padding: "1em",
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
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
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
          <Textarea
            placeholder="Add code snippet"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="mb-2 h-32"
          />
          <Button onClick={addCode} className="w-full">
            Add Code Snippet
          </Button>
        </div>
      </div>
    </div>
  )
}
