/** pdf.js 懒加载（仅在预览 PDF 时加载） */
let pdfjsLib = null;

export async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;

  const [lib, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ]);

  lib.GlobalWorkerOptions.workerSrc = workerModule.default;
  pdfjsLib = lib;
  return pdfjsLib;
}

/** 加载 PDF 文档（优先 fetch，失败则直连 URL） */
export async function loadPdfDocument(url) {
  const pdfjs = await loadPdfJs();

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.arrayBuffer();
    return pdfjs.getDocument({ data }).promise;
  } catch {
    return pdfjs.getDocument(url).promise;
  }
}

/** 按容器宽度渲染全部页到 canvas 列表 */
export async function renderPdfToCanvases(pdfDoc, canvases, containerWidth) {
  const width = containerWidth || window.innerWidth;
  const tasks = [];

  for (let i = 1; i <= pdfDoc.numPages; i += 1) {
    const canvas = canvases[i - 1];
    if (!canvas) continue;

    tasks.push(
      (async pageNum => {
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = width / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
      })(i)
    );
  }

  await Promise.all(tasks);
  return pdfDoc.numPages;
}
