"use client";

import { useCreate } from "../layout";

export default function PreviewPage() {
    const { htmlContent, cssContent, jsContent } = useCreate();

    const previewSrcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${cssContent}</style>
</head>
<body style="margin:0">
  ${htmlContent}
  <script>${jsContent}</script>
</body>
</html>`;

    return (
        <div className="h-full bg-black">
            <iframe
                srcDoc={previewSrcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
                title="Preview"
            />
        </div>
    );
}
