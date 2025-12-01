import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: 'python' | 'java' | 'cpp' | 'node' | 'javascript';
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'node':
      case 'javascript':
        return 'javascript';
      default:
        return 'python';
    }
  };

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'python':
        return '# Write your Python code here\n\ndef solution():\n    # Your solution here\n    pass\n\nif __name__ == "__main__":\n    solution()';
      case 'java':
        return 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n        System.out.println("Hello World");\n    }\n}';
      case 'cpp':
        return '#include <iostream>\n\nint main() {\n    // Write your C++ code here\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
      case 'node':
      case 'javascript':
        return '// Write your JavaScript code here\n\nfunction solution() {\n    // Your solution here\n    console.log("Hello World");\n}\n\nsolution();';
      default:
        return '// Write your code here';
    }
  };

  useEffect(() => {
    if (editorRef.current && !value) {
      // Set default code if no value is provided
      onChange(getDefaultCode(language));
    }
  }, [language, value, onChange]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on',
      tabSize: 4,
      insertSpaces: true,
    });
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
        }}
        theme="vs-light"
      />
    </div>
  );
};

export default CodeEditor;