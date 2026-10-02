/**
 * Long-form copy for tool pages.
 *
 * Each entry adds three blocks to its tool's page: an overview paragraph above
 * the tool, a numbered how-to, and an FAQ. The FAQ is rendered visibly and as
 * FAQPage JSON-LD, so every answer must be specific, accurate and useful —
 * copy that could describe any tool is worse than none at all. Facts here are
 * deliberately tied to what each tool actually does (formats, options, limits).
 */

export interface FaqItem {
  q: string;
  a: string;
}

export interface ToolContent {
  /** Overview shown under the page heading, above the tool. */
  intro: string;
  /** Ordered "How to use" steps. */
  steps: string[];
  /** Frequently asked questions (rendered on-page + FAQPage schema). */
  faqs: FaqItem[];
}

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "word-counter": {
    intro:
      "Count words, characters, sentences and paragraphs live as you type, with an estimated reading time alongside. Useful for essays and assignments with word limits, social captions, meta descriptions, ad copy and anything else where every character counts. Type or paste your text and the numbers update instantly — nothing is submitted, saved or sent anywhere.",
    steps: [
      "Type or paste your text into the box — there is no submit button, counting starts immediately.",
      "Watch the counters: words, characters with and without spaces, sentences and paragraphs.",
      "Check the estimated reading time to see how long your text takes to read at a normal pace.",
      "Copy the text or clear the box whenever you want to start a fresh count.",
    ],
    faqs: [
      {
        q: "Does the counter include spaces and punctuation?",
        a: "Yes. You get characters with and without spaces as separate numbers, plus word, sentence and paragraph counts and an estimated reading time — so a tweet, a caption or an essay chapter can all be checked against a limit precisely.",
      },
      {
        q: "Is my text uploaded or stored anywhere?",
        a: "No. Counting happens inside your browser as you type; the text never travels to a server, is never saved, and disappears when you close the tab. That also makes it safe to paste confidential drafts, legal text or unreleased copy.",
      },
      {
        q: "Will it count words the same way as Word or Google Docs?",
        a: "It follows the same convention — words are split on whitespace, so contractions and hyphenated terms count as one word. Exotic inputs such as emoji or unspaced CJK text can differ slightly from desktop apps, but everyday prose matches.",
      },
    ],
  },
  "pdf-merge": {
    intro:
      "Combine any number of PDFs into one document directly in your browser. Add files in the order you want them to appear, rearrange by removing and re-adding, then merge — the result is a single, normal PDF with every page copied over exactly as it was. Ideal for joining scanned chapters, attaching signed pages, or bundling reports before sharing.",
    steps: [
      "Add your PDFs by clicking the upload area or dragging files in — you can add as many as you need.",
      "Check the order: pages will be combined in the list sequence, so remove and re-add a file if it is out of place.",
      "Hit Merge — every page is copied into one new document on your device, usually in a second or two.",
      "Download the combined PDF; it opens, prints and emails like any other file.",
    ],
    faqs: [
      {
        q: "Is there a limit to how many files I can merge?",
        a: "There is no fixed cap — merging runs on your own machine, so the practical limit is your device's memory. A few dozen typical documents combine in seconds; extremely large batches may take longer but nothing is throttled or queued.",
      },
      {
        q: "Does merging reduce the quality of my PDFs?",
        a: "No. Pages are copied into the new file exactly as they are, with no re-rendering or re-compression — text stays selectable, images keep their original quality and any bookmarks or links inside the copied pages are left intact.",
      },
      {
        q: "What happens to my files after I merge them?",
        a: "Nothing leaves your device. The merge runs entirely in the browser, the result is written locally and handed to you as a download. No copy of your input or output is ever stored on a server, because none is used.",
      },
    ],
  },
  "split-pdf": {
    intro:
      "Break a large PDF into smaller files — either by custom page ranges (a contract into sections, a scan into single pages) or by splitting every page into its own file. The job runs locally, so sensitive documents stay on your machine, and multi-file results arrive together in a single zip download.",
    steps: [
      "Upload the PDF you want to split — it opens instantly with a page count so you know what you are working with.",
      "Choose how to split: into custom ranges of pages, or into one separate PDF per page.",
      "Confirm your selection — the tool reads the document structure locally and slices out the requested pages.",
      "Download the results; when a split produces several files they are bundled into one zip for convenience.",
    ],
    faqs: [
      {
        q: "What is the difference between ranges and splitting every page?",
        a: "Ranges group pages into the chunks you specify — for example pages 1–3 as a cover section and the rest as an appendix. Splitting every page creates a separate single-page PDF for each page, which is handy for distributing scanned forms or extracting one page per invoice.",
      },
      {
        q: "Is the original file changed?",
        a: "Never. Splitting reads your document and writes new files; the PDF you uploaded remains byte-for-byte untouched on your device, ready to split again with different ranges if needed.",
      },
      {
        q: "Can I split password-protected PDFs?",
        a: "The document needs to open without a password first. If yours is locked, use Unlock PDF with the password you know, then split the decrypted copy — both steps happen locally, one after the other.",
      },
    ],
  },
  "compress-pdf": {
    intro:
      "Shrink a PDF's file size by re-rendering its pages as images at a quality level you choose. High quality keeps pages sharp for printing, Balanced suits everyday sharing, and Small file squeezes every kilobyte out for email attachment limits and upload caps. A before-and-after size comparison shows exactly how much you saved.",
    steps: [
      "Upload the PDF you need to shrink.",
      "Pick a quality level — higher quality keeps pages crisp, lower quality produces a smaller file.",
      "Start the compression; each page is re-rendered and re-encoded directly in your browser.",
      "Compare the before-and-after sizes and download the compressed copy if you are happy with it.",
    ],
    faqs: [
      {
        q: "Is the text still selectable after compressing?",
        a: "Compressed pages become images, so the original text layer is not carried over — treat the compressed copy as a sharing or upload version. Keep your original file for searching, copying and future editing.",
      },
      {
        q: "How much smaller will my file get?",
        a: "It depends on what is inside. Scans and photo-heavy documents often shrink dramatically, while text-only PDFs save less because their content was already compact. The size comparison shown after compression tells you the real number before you download.",
      },
      {
        q: "Does my file get uploaded to be compressed?",
        a: "No. Pages are rendered and re-encoded inside your browser using your device's own resources. The document never reaches a server, which also means there is no upload wait, no file size cap from our side and no copy left behind.",
      },
    ],
  },
  "edit-pdf": {
    intro:
      "Mark up a PDF without installing heavyweight software: draw freehand, highlight passages and drop text notes onto the page, then save a new copy with your annotations in place. It is built for reviewing drafts, circling details on a form, sketching quick feedback and other everyday markups — not for rewriting the document's existing text.",
    steps: [
      "Open the PDF you want to annotate — pages render locally with a thumbnail strip for navigation.",
      "Pick a tool: pen for drawing, highlighter for marking passages, or text for typed notes.",
      "Click or drag on the page to place your marks; move between pages to annotate as much as you need.",
      "Save the document and download the annotated copy — the marks are drawn onto the exported pages.",
    ],
    faqs: [
      {
        q: "Does editing overwrite my original file?",
        a: "No. Your original PDF is only read, never written. Everything you draw or type is written into a separate output file that you download, so you can always go back to the untouched original.",
      },
      {
        q: "Can I change text that is already in the PDF?",
        a: "No — this is a markup tool that adds ink on top of pages. To rewrite existing content, convert the document with PDF to Word, edit the text in your word processor, then convert it back with Word to PDF.",
      },
      {
        q: "Can someone remove my annotations from the exported file?",
        a: "Annotations are drawn onto the exported pages as part of the page image, so they cannot be accidentally moved or deleted in a viewer. They are a visual markup, though — for legally binding signatures or formal redaction, use the dedicated Sign PDF and Redact PDF tools.",
      },
    ],
  },
  "sign-pdf": {
    intro:
      "Add your signature to a PDF in a couple of clicks: draw it with your mouse, trackpad or finger, or type your name in a signature style you like. Drag it into position, resize it to fit the signature line, and download the signed copy. The whole flow happens on your device — no account, no emailed attachments, no waiting.",
    steps: [
      "Open the PDF and navigate to the page that needs the signature using the page controls.",
      "Create a signature by drawing it or typing your name, then pick the style that looks most like your own.",
      "Drag the signature onto the signature line and resize it so it fits naturally on the page.",
      "Apply and download the signed PDF; other pages remain exactly as they were.",
    ],
    faqs: [
      {
        q: "Which page gets my signature?",
        a: "The page you are viewing when you apply it. Sign one page, then move to another page and repeat if the document needs signatures in several places — each application merges the signature into that page of the output file.",
      },
      {
        q: "Is a signature added here legally binding?",
        a: "Electronic signature laws vary by country and by document type. Simple signatures like this are widely accepted for everyday acknowledgements and internal paperwork, but documents with formal execution requirements — wills, some court filings, certain regulated contracts — may demand a dedicated signing process. Check what applies to your situation.",
      },
      {
        q: "Does my signature leave my device?",
        a: "No. The signature is drawn, placed and merged into the PDF entirely in your browser. No image of it is uploaded or stored, so it cannot be intercepted or reused from our side — treat downloaded signed copies as sensitive documents in their own right.",
      },
    ],
  },
  "pdf-converter": {
    intro:
      "Turn any PDF into a plain-text or HTML file without uploading it. The words are extracted in your browser so you can copy them into another document, feed content into a tool, or quickly search a document that has no text layer of its own. Choose .txt for pure text or .HTML when you want headings and paragraphs kept as structure.",
    steps: [
      "Upload the PDF you want to pull text out of.",
      "Choose the output format: plain text (.txt) or HTML.",
      "Run the conversion — the document is parsed locally, page by page.",
      "Copy the text straight from the preview or download the generated file.",
    ],
    faqs: [
      {
        q: "Will the layout of my PDF be preserved?",
        a: "Not in text or HTML output — you get the words with basic structure, not columns, fonts and pixel-perfect positioning. If you need an editable document that keeps the visual layout, use PDF to Word instead.",
      },
      {
        q: "What happens with scanned PDFs?",
        a: "Scanned pages are images without a text layer, so there is nothing to extract. Run the document through PDF OCR first — it recognizes the printed text — and then you can copy or convert the result.",
      },
      {
        q: "Is my document uploaded for conversion?",
        a: "No. The PDF is parsed inside your browser and the result never leaves your device. That makes it a good choice for contracts, medical records or internal documents you are not allowed to hand to third-party services.",
      },
    ],
  },
  "word-to-pdf": {
    intro:
      "Convert a Word document to a PDF that keeps the design you worked on — headings, bold and italic runs, lists, tables, images and page structure all carry over. Pick A4 or US Letter to match your region, then download a document that looks the same on every machine that opens it. The conversion renders and packages the file entirely on your device.",
    steps: [
      "Upload your .docx file — Word 2007 and newer formats are supported.",
      "Choose the page size: A4 (210 × 297 mm) or US Letter (8.5 × 11 in).",
      "Start the conversion; the document is laid out and rendered page by page in your browser.",
      "Download the PDF — every page is a faithful image-perfect rendering of your Word file.",
    ],
    faqs: [
      {
        q: "Which Word files are supported?",
        a: "Modern .docx files, the format Word has used since 2007. Older binary .doc files are not supported — open one in Word (or a free alternative like LibreOffice) and save it as .docx first; the conversion here takes seconds once you have.",
      },
      {
        q: "Are my files uploaded to a server?",
        a: "No. Your document is parsed, rendered and packaged into a PDF entirely inside your browser. The file never travels over the network, which keeps drafts, resumes and confidential reports private — and means large files don't hit an upload limit.",
      },
      {
        q: "Will images, tables and fonts survive the conversion?",
        a: "Headings, tables, embedded images and general formatting are preserved. Fonts available on your device render exactly; an unusual font missing from your machine may fall back to a similar one, which is the only likely visual difference between the docx and the PDF.",
      },
    ],
  },
  "pdf-to-word": {
    intro:
      "Get an editable Word document back from a PDF: text, paragraphs and page breaks are rebuilt as real .docx content you can type into, delete and reformat. It is the fastest route from a locked-down PDF report, contract or form to a document you can revise — entirely in your browser, with nothing uploaded.",
    steps: [
      "Upload the PDF you want to edit in Word.",
      "Start the conversion — text and paragraph structure are extracted locally, page by page.",
      "Download the generated .docx file.",
      "Open it in Microsoft Word, LibreOffice or Google Docs and start editing.",
    ],
    faqs: [
      {
        q: "Will the converted document look exactly like the PDF?",
        a: "Text, paragraphs and page breaks are carried over faithfully, but complex layouts — multi-column designs, floating graphics, text inside images — can reflow as editable content. The goal is a clean, editable document rather than a pixel-perfect clone.",
      },
      {
        q: "Can it convert a scanned PDF?",
        a: "Scanned pages have no text layer to extract, so conversion has nothing to work with. Run the scan through PDF OCR first to recognize the text — that gives you copyable content you can rebuild in Word.",
      },
      {
        q: "What happens to my PDF during conversion?",
        a: "It stays on your device. The parser runs in your browser and the .docx is assembled locally for you to download — no copy of the document or the output is stored anywhere, and there is no waiting queue.",
      },
    ],
  },
  "images-to-pdf": {
    intro:
      "Combine JPG, PNG and WebP pictures into a single PDF — in exactly the order you want them, with page size and orientation you control. Perfect for turning a phone photo of a receipt, a set of scanned ID pages or a batch of screenshots into one tidy document that is easy to upload, print or email.",
    steps: [
      "Add your images; several files can be selected at once or dragged in together.",
      "Arrange them in the order they should appear in the PDF.",
      "Choose the page size and orientation so each image gets the right canvas.",
      "Create the PDF and download the single combined file.",
    ],
    faqs: [
      {
        q: "Do my images get compressed or lose quality?",
        a: "Images are embedded into the PDF as they are — the file stores your original JPG or PNG data rather than re-encoding it, so the details of your scans and photos carry through to the output.",
      },
      {
        q: "Which image formats can I use?",
        a: "JPG, PNG and WebP are supported, covering almost everything a phone, camera or screenshot tool produces. If your file is in another format, converting it to JPG or PNG first takes a moment in any image editor.",
      },
      {
        q: "Is there a limit to how many images I can combine?",
        a: "No fixed limit — because the work happens on your device, the practical ceiling is available memory. A handful of photos or dozens of scans convert almost instantly, and nothing is uploaded regardless of how many you add.",
      },
    ],
  },
  "pdf-to-images": {
    intro:
      "Export every page of a PDF as a high-quality image — as JPG for small, shareable files or PNG when you want lossless fidelity. Take a single page or the whole document, delivered as separate files or one zip. Rendering happens locally with your browser's own PDF engine, so pages never touch a server.",
    steps: [
      "Upload the PDF whose pages you want as images.",
      "Choose the output format: JPG for smaller files or PNG for maximum fidelity.",
      "Pick the pages you need, or select the whole document.",
      "Download the rendered images — multiple results are bundled into a zip.",
    ],
    faqs: [
      {
        q: "JPG or PNG — which should I choose?",
        a: "JPG suits photographs and page scans: smaller files, slight quality trade-off. PNG is lossless, making it the better pick for diagrams, screenshots, text-heavy pages or anything you will edit again — at the cost of a larger file.",
      },
      {
        q: "How large are the exported images?",
        a: "Pages render at high resolution, crisp enough for sharing, printing and presentations. You will see the dimensions and file size of your results before downloading, so you can adjust the format if the output is heavier than you need.",
      },
      {
        q: "Are the images sent anywhere?",
        a: "No. The PDF is rendered into images inside your browser using its built-in rendering engine, and the files are written locally for you to download — no server sees your pages or your output.",
      },
    ],
  },
  "extract-pdf-images": {
    intro:
      "Pull every embedded photo, screenshot and illustration out of a PDF and save them as original-quality JPG or PNG files. Unlike converting pages to images, this recovers the actual source images stored inside the document — full resolution, untouched by rendering — which is ideal for harvesting artwork from reports, booklets and presentations.",
    steps: [
      "Upload the PDF that contains the images you want.",
      "Start the extraction; the tool reads the document's embedded image objects directly.",
      "Review the list of discovered images with their dimensions and formats.",
      "Download the images you need individually or grab them all at once.",
    ],
    faqs: [
      {
        q: "Is this the original image quality?",
        a: "Yes. The embedded image data is copied straight out of the PDF without re-rendering, so you get the exact pixels the document contains — no scaling, no re-compression, no lossy detour through a page render.",
      },
      {
        q: "Why are some graphics missing?",
        a: "This tool extracts embedded raster images (JPG, PNG and similar). Vector graphics, drawings and text are not images — they are drawn with PDF instructions. To capture those, export the page itself with PDF to Images instead.",
      },
      {
        q: "Does extracting images modify my PDF?",
        a: "No. The document is only read; every discovered image is written to a new file for you to download. Your original PDF stays exactly as it was, on your device, where the entire process takes place.",
      },
    ],
  },
  "webpage-to-pdf": {
    intro:
      "Save any web page as a PDF: paste a URL and the page is loaded and rendered right in your browser, then handed to you as a downloadable document. Handy for archiving articles, keeping a record of an online receipt or confirmation, submitting a page as coursework material, or preserving content that might change or disappear.",
    steps: [
      "Paste the URL of the page you want to save.",
      "Generate the PDF — your browser loads the page and captures it as a document.",
      "Download the resulting PDF, ready to store, print or attach to an email.",
    ],
    faqs: [
      {
        q: "Does it capture the whole page or just what I can see?",
        a: "The page is captured as a full document from top to bottom, following the site's layout as your browser renders it — not just the visible screen area. Very long pages simply produce a longer PDF.",
      },
      {
        q: "Can I save a page that requires a login?",
        a: "Only pages your browser can actually open will convert — the tool loads the URL fresh, so anything behind a login, paywall or session will show its public version instead. Save pages you can view in a normal tab first.",
      },
      {
        q: "Do you store the web pages I convert?",
        a: "No. Your own browser fetches and renders the page, and the PDF is assembled locally — TinkerTools never receives the URL or the result. The site being captured sees an ordinary page visit from your connection, just as if you had opened it yourself.",
      },
    ],
  },
  "pdf-ocr": {
    intro:
      "Turn scanned PDFs into real, selectable text using optical character recognition that runs in your browser. Pick the language of your scan — English, Spanish, French, German, Italian, Portuguese, Dutch, Polish or Turkish are available — run the recognition, then copy or download the extracted text for searching, editing or repurposing.",
    steps: [
      "Upload the scanned PDF you want recognized.",
      "Select the language the document is written in.",
      "Run OCR; each page image is analyzed and the printed characters are recognized locally.",
      "Copy the extracted text or download it as a file once recognition finishes.",
    ],
    faqs: [
      {
        q: "How accurate is the recognition?",
        a: "Clean, printed scans at decent resolution are recognized very accurately; blurry photos, unusual fonts, heavy skew and handwriting reduce accuracy, as with any OCR engine. Re-scanning at higher quality or rotating skewed pages first usually improves results noticeably.",
      },
      {
        q: "Do I need an internet connection?",
        a: "The document itself is never uploaded, but the recognition engine and its language data are fetched from a public CDN the first time you use the tool and cached by your browser afterwards. Only engine code is downloaded — your pages stay on your device throughout.",
      },
      {
        q: "Does it create a searchable PDF?",
        a: "It outputs the recognized text, ready to copy into a document or download as a text file. Rebuilding that text as a searchable, invisible-layer PDF is a separate step — for reading content out of a scan, the text output is usually what you need.",
      },
    ],
  },
  "text-diff": {
    intro:
      "Compare two versions of any text and see exactly what changed — additions, deletions and edits highlighted line by line, side by side. Paste an original on the left and a revised version on the right, or two files' contents you need to reconcile. It works just as well for contracts and essays as for configuration files and code snippets.",
    steps: [
      "Paste the original text into the first box.",
      "Paste the revised or competing text into the second box.",
      "Read the comparison: added lines, removed lines and changed passages are highlighted as you scroll.",
      "Copy any version you need — nothing you paste is retained once you leave the page.",
    ],
    faqs: [
      {
        q: "How are the changes highlighted?",
        a: "The two texts are compared line by line: lines that only exist in one version are marked as additions or removals, and lines that differ are flagged as edits — so you can scan a long document and spot every difference in seconds.",
      },
      {
        q: "Is there a limit on how much text I can compare?",
        a: "Practical limits come from your device rather than a server — even very long documents compare in-browser, though enormous inputs may take a moment to process. Nothing is uploaded either way, however large the texts are.",
      },
      {
        q: "Are my texts stored or shared?",
        a: "Never. Both texts stay in your browser tab for the duration of the comparison and are discarded when you leave. Confidential clauses, private drafts and proprietary code can be compared without leaving the machine they are on.",
      },
    ],
  },
  "video-to-audio": {
    intro:
      "Extract the audio track from a video without installing an encoder: load an MP4, MOV, WebM or MKV file, choose the output you want — MP3 for universal compatibility, M4A for modern quality at smaller sizes, or WAV for lossless sound — and download just the audio. Lectures, podcasts, interviews and voice-overs come out in a couple of clicks.",
    steps: [
      "Add the video file you want the audio from.",
      "Choose the output format: MP3, M4A or lossless WAV.",
      "Start the extraction; the audio stream is decoded directly in your browser.",
      "Download the audio file — the video itself is never uploaded anywhere.",
    ],
    faqs: [
      {
        q: "Which input and output formats are supported?",
        a: "Inputs include MP4, MOV, WebM and MKV — essentially what phones, screen recorders and cameras produce. Outputs are MP3 (plays everywhere), M4A (efficient and modern) and WAV (uncompressed, best for editing or archiving).",
      },
      {
        q: "Why might a very large video fail to convert?",
        a: "Everything runs in browser memory, so very long or high-resolution videos can exhaust what your tab has available. Closing other tabs frees memory; if a big file still fails, splitting or shortening the video first is the reliable workaround.",
      },
      {
        q: "Does converting to MP3 lose audio quality?",
        a: "MP3 and M4A are lossy formats — they trade a little fidelity for much smaller files, with the real-world result depending on the source bitrate. Choose WAV when quality matters most: it copies the audio losslessly, at the cost of a larger file.",
      },
    ],
  },
  "protect-pdf": {
    intro:
      "Lock a PDF behind a password before you send it anywhere: viewers must enter the password to open the file, and you can additionally disable copying, editing and printing. Encryption is applied inside your browser — the password and the document both stay on your machine, so the key never travels over a network.",
    steps: [
      "Upload the PDF you want to lock.",
      "Choose a strong password and confirm it — this is what recipients will need to open the file.",
      "Decide whether to also restrict copying, editing and printing for viewers.",
      "Apply the protection and download the locked PDF to share.",
    ],
    faqs: [
      {
        q: "What happens if I forget the password?",
        a: "There is no recovery path — processing happens locally, so no server holds a copy of your file or key to reset from. Store the password somewhere safe (a password manager is ideal) and share it only with people who should have access.",
      },
      {
        q: "What exactly does the password protect?",
        a: "It prevents the document from being opened without it, and the optional permissions limit casual copying, editing and printing by whoever opens it. Treat restrictions as a deterrent for everyday sharing rather than a substitute for keeping the file itself out of the wrong hands.",
      },
      {
        q: "Does anyone see my password or my document?",
        a: "No. Both are handled entirely on your device — the file is encrypted with your password locally and you download the result directly. Nothing is transmitted, logged or stored, which keeps the protection meaningful in the first place.",
      },
    ],
  },
  "unlock-pdf": {
    intro:
      "Remove the password from a PDF you legitimately have the password for, so it opens without prompting, forwards without friction and prints cleanly. Decryption runs on your device: the file and password stay local, and the unlocked copy is yours to download the moment processing finishes.",
    steps: [
      "Upload the locked PDF.",
      "Enter the password that opens it — you need it to decrypt the document.",
      "Unlock the file; it is decrypted locally in your browser.",
      "Download the unlocked copy, which opens freely without a password prompt.",
    ],
    faqs: [
      {
        q: "I lost the password — can you recover it?",
        a: "No. Nothing is uploaded and no copy exists anywhere that could be used to reconstruct the key — only the person who set the password knows it. If the document is yours, request the password from whoever created or last protected it.",
      },
      {
        q: "Is it okay to remove a password from any PDF?",
        a: "Only unlock documents you own or are explicitly authorised to access. Removing protection from someone else's restricted file can breach contracts, copyright or law — the tool assumes you have the right to open and re-share what you are unlocking.",
      },
      {
        q: "Is my password uploaded during unlocking?",
        a: "No. The password and file are used together inside your browser to decrypt the document locally, then discarded when you close the tab. Nothing about the file — not its contents, name or key — is transmitted to a server.",
      },
    ],
  },
  "redact-pdf": {
    intro:
      "Black out names, account numbers, addresses and other sensitive information before a document leaves your hands. Drag rectangles over the content you want hidden — on whichever pages need it — and the exported PDF shows solid black boxes over those areas. The entire redaction workflow happens locally, so the unredacted original never leaves your device.",
    steps: [
      "Upload the PDF you need to redact.",
      "Navigate to each page that contains sensitive content.",
      "Drag rectangles directly over the text or numbers you want blacked out.",
      "Apply the redactions and download the marked-up copy to share.",
    ],
    faqs: [
      {
        q: "Is the redacted content hidden in the shared file?",
        a: "The black boxes are part of the exported page, so the covered areas cannot be seen, printed or screenshotted from the document your recipient receives. For documents where confidentiality is critical, double-check the output before sending — and remember the tool only redacts what you cover.",
      },
      {
        q: "Can I redact more than one page?",
        a: "Yes. Redactions are applied per page: black out everything on the first page, move to the next, and continue until every sensitive area is covered. Pages you leave untouched pass through unchanged.",
      },
      {
        q: "Where does my document go during redaction?",
        a: "Nowhere. Pages are rendered, marked and re-exported entirely inside your browser — the original file and your redacted copy both stay on your machine. That matters most for exactly the documents this tool exists for: the ones you cannot risk exposing.",
      },
    ],
  },
  "rotate-pdf-pages": {
    intro:
      "Fix sideways scans and pages that print the wrong way round: rotate a single page, a selection, or the whole document by 90° or 180°. Rotation is saved into the PDF itself, so every viewer and printer sees the corrected orientation — and because it only updates the page's rotation flag, there is no re-rendering and zero quality loss.",
    steps: [
      "Upload the PDF with pages pointing the wrong way.",
      "Tap the rotate arrows on individual thumbnails, or use rotate-all for the whole document.",
      "Preview until every page sits the right way up.",
      "Apply the rotations and download the corrected PDF.",
    ],
    faqs: [
      {
        q: "Does rotating pages reduce quality?",
        a: "No. Rotation is stored as a page flag rather than by re-drawing the page, so text, images and vector content remain byte-for-byte untouched — the file simply displays correctly, with no blur or size increase from the change.",
      },
      {
        q: "Can I rotate only some pages?",
        a: "Yes — rotate a single page, any selection, or everything at once, and combine directions as needed (two quarter-turns make a 180° flip). Only the pages you change are updated in the output file.",
      },
      {
        q: "Will the rotation stick in other viewers and printers?",
        a: "It is saved into the document, so standard PDF readers, browsers and printers all honour it. If a stubborn app still shows a page wrong, the saved file is correct — it is worth checking that app's own view settings.",
      },
    ],
  },
  "remove-pdf-pages": {
    intro:
      "Delete unwanted pages from a PDF with visual thumbnails: cover sheets, blank backs, duplicate scans and pages that were never meant to be shared. Select what goes, keep the rest, and download a cleaned document — processed on your device, which matters when the pages being removed are sensitive precisely because they are being dropped.",
    steps: [
      "Upload the PDF you want to trim.",
      "Browse the thumbnails to identify the pages you no longer need.",
      "Select those pages for removal — everything unselected is kept.",
      "Apply and download the reduced document.",
    ],
    faqs: [
      {
        q: "Is my original file modified?",
        a: "No. Removal reads your document and writes a new, smaller one; the file you uploaded stays complete and untouched on your device. Delete the wrong page by accident? Re-upload and start again.",
      },
      {
        q: "What happens to the remaining pages?",
        a: "They carry over exactly as they were — same content, same order, same quality, with the page numbering simply closing up around what you removed. Nothing is re-rendered or re-compressed in the process.",
      },
      {
        q: "Can I remove pages from a protected PDF?",
        a: "The document has to open first. If yours asks for a password, unlock it with Unlock PDF using the password you know, then remove the pages — both steps run locally, one after the other.",
      },
    ],
  },
  "extract-pdf-pages": {
    intro:
      "Pull specific pages out of a PDF into a brand-new document — or split the whole thing into separate single-page files. Extracting a signed page, one chapter, an invoice or the relevant section of a scan takes a couple of clicks, and the source document stays complete and untouched on your device.",
    steps: [
      "Upload the PDF you want to take pages from.",
      "Select the pages you need, or choose to split every page into its own file.",
      "Run the extraction — selected pages are copied into new documents locally.",
      "Download the result; multi-file extractions arrive bundled in one zip.",
    ],
    faqs: [
      {
        q: "How is Extract different from Split?",
        a: "Extract pulls a chosen selection into one new document (or separates pages individually) while leaving the original structure in your hands; Split is about cutting the file into ranges. Both produce fresh files without touching the source — pick whichever matches how you think about the job.",
      },
      {
        q: "Does the original PDF change?",
        a: "Never. Pages are copied out of the document, not moved — the file you uploaded remains exactly as it was, with every page still in place, ready to extract from again whenever you need a different set.",
      },
      {
        q: "Do extracted pages keep their quality?",
        a: "Yes. Pages are copied at the object level with no rendering or re-compression involved, so text stays selectable and images keep their original resolution. The output behaves like any other PDF from the source document.",
      },
    ],
  },
  "rearrange-pdf-pages": {
    intro:
      "Reorder the pages of a PDF by dragging thumbnails into the sequence you want, then download the reorganized document. Useful when a scanner shuffled a stack, an appendix ended up at the front, or contract pages simply need to follow a different order — fixed in seconds, entirely in your browser.",
    steps: [
      "Upload the PDF whose pages are out of order.",
      "Drag thumbnails into the correct sequence, checking the numbers as you go.",
      "Review the final order once more — everything is still editable at this point.",
      "Apply the new order and download the rearranged PDF.",
    ],
    faqs: [
      {
        q: "Does reordering pages affect quality?",
        a: "No. Pages are copied into the new sequence exactly as they are — no rendering, scaling or re-compression is involved, so text remains selectable and images keep their original quality throughout the shuffle.",
      },
      {
        q: "How many pages can I rearrange?",
        a: "There is no fixed cap; thumbnails render locally and large documents simply take a moment to display. Very long files are easiest to reorder in focused sessions — get the main sequence right, download, and revisit later if needed.",
      },
      {
        q: "Is the old order preserved anywhere?",
        a: "Only in your original file, which is never modified — the rearranged version is written as a new document for download. Keeping both versions is the simplest way to undo any ordering mistake later.",
      },
    ],
  },
  "add-watermark": {
    intro:
      "Stamp a watermark across every page of a PDF — a text mark like DRAFT, CONFIDENTIAL or © Your Name, or your own image logo. Set the angle, size and opacity so the watermark is clearly visible without burying the content underneath. Commonly used for drafts, sample previews, internal documents and branded handouts.",
    steps: [
      "Upload the PDF you want to mark.",
      "Choose a text watermark, or upload a PNG/JPG image such as a logo.",
      "Adjust the style — angle, size and opacity — until it reads the way you want.",
      "Apply it: the watermark is stamped onto every page, and you download the marked copy.",
    ],
    faqs: [
      {
        q: "Does the watermark appear on every page?",
        a: "Yes — the mark is applied to every page of the document in one pass, which is exactly what a DRAFT or CONFIDENTIAL notice needs. Each page receives the same position, angle and opacity you configured.",
      },
      {
        q: "How visible should I make it?",
        a: "A good watermark is unmissable without obscuring the content: moderate opacity at an angle across the page usually works. Push opacity too high and text underneath becomes unreadable; too low and it stops doing its job — preview the result and adjust before downloading.",
      },
      {
        q: "Can the watermark be removed?",
        a: "Your original PDF is never changed, so removing the watermark is simply a matter of using the clean original again. Share only the watermarked copy — recipients receive it with the mark baked into every page they can open.",
      },
    ],
  },
  "add-page-numbers": {
    intro:
      "Number the pages of any PDF so documents are easy to reference, print and discuss: choose where the number appears, what counting it starts from, and which style it uses. From legal bundles and academic submissions to meeting agendas and handouts, numbered pages stop 'page 3' from becoming an argument.",
    steps: [
      "Upload the PDF you want numbered.",
      "Choose the position for the page numbers on the page.",
      "Set the starting number and the style you want to use.",
      "Apply the numbering and download the finished document.",
    ],
    faqs: [
      {
        q: "Can I start numbering from a specific number?",
        a: "Yes — set the start value to match your document's structure, such as beginning at 5 when the first four pages are covers or contents sections. The count then runs sequentially from that point through the document.",
      },
      {
        q: "Where on the page do the numbers appear?",
        a: "You pick the position — bottom corners, bottom centre or header placement — before applying. Choose a spot that doesn't collide with existing footers or content, and check the result on a couple of pages after downloading.",
      },
      {
        q: "Does adding numbers change the content of my PDF?",
        a: "The page numbers are added to your document while everything else stays as it was — text, images and layout are untouched. Your original file remains unmodified; the numbered version is written out as a new copy for you to download.",
      },
    ],
  },
  "pdf-overlay": {
    intro:
      "Layer one PDF on top of another: stamp a signed cover page onto a report, drop annotation sheets over a template, or combine a marked-up draft with its original for comparison. You choose which file goes on top, and the overlay is applied in your browser — no merging services, no uploads, no accounts.",
    steps: [
      "Upload the base PDF — the document that should sit underneath.",
      "Upload the second PDF that will be layered on top of it.",
      "Confirm which file is the overlay so the stacking order is right.",
      "Apply the overlay and download the combined document.",
    ],
    faqs: [
      {
        q: "Which PDF ends up on top?",
        a: "The one you designate as the overlay — its pages are drawn over the base document's pages, exactly like placing one printed page over another. The base file stays underneath in full, with the overlay content appearing above it wherever the two meet.",
      },
      {
        q: "What is this typically used for?",
        a: "Adding signed or stamped cover pages to reports, layering annotation sheets over templates, superimposing a revised header across a document, or keeping an overlay version beside the original for review workflows — anything where two documents belong visually together.",
      },
      {
        q: "Do my files get uploaded for overlaying?",
        a: "No. Both documents are parsed and combined inside your browser, and the result is written locally for download. Sensitive drafts can be layered and shared without either file ever leaving the machine you are working on.",
      },
    ],
  },
  "compare-pdfs": {
    intro:
      "Compare two versions of a document side by side, page by page, and see a word-level similarity score that summarizes how much changed at a glance. Built for checking that the 'final' contract really matches the draft, spotting edits between revisions of a report, or verifying which version of a document differs — all processed privately on your device.",
    steps: [
      "Upload the first version of the document.",
      "Upload the second version you want to compare it against.",
      "Browse the pages side by side and read the similarity score for each pair.",
      "Work through any pages that score lower to locate the exact differences.",
    ],
    faqs: [
      {
        q: "What does the similarity score mean?",
        a: "It reflects how many words the two pages share, expressed as a percentage: 100% means identical wording, while lower scores flag pages where text was added, removed or rewritten — a quick filter for finding the pages worth looking at closely.",
      },
      {
        q: "How are the pages matched up?",
        a: "Pages are lined up side by side for comparison, so you can scan the two versions together while the score tells you where the wording diverged. Differences show at the word level within each compared pair.",
      },
      {
        q: "Are my documents uploaded for comparison?",
        a: "No — both files are parsed and compared on your device, and the similarity calculations run locally. Contract revisions and confidential reports never leave the browser they are opened in, which is precisely when you want a comparison tool you can trust.",
      },
    ],
  },
  "web-optimize-pdf": {
    intro:
      "Prepare a PDF for publishing on the web: strip leftover metadata — author names, producer strings, editing timestamps — and compact the document's internal structure so browsers load and display it faster. Pages are not re-rendered, so text stays selectable and visual quality is exactly as it was; the file is simply leaner and cleaner.",
    steps: [
      "Upload the PDF you plan to publish or embed.",
      "Run the optimizer: metadata is cleared and the file structure is compacted locally.",
      "Review the new file size and download the optimized PDF.",
      "Upload the leaner file to your website — visitors get it faster.",
    ],
    faqs: [
      {
        q: "How is this different from Compress PDF?",
        a: "Compress PDF re-renders pages as images for maximum size reduction — great for email limits, at the cost of the text layer. Web Optimize keeps pages intact, cleaning metadata and compacting structure instead, so searchable text and vector quality survive for published documents.",
      },
      {
        q: "What metadata gets removed?",
        a: "Document properties such as author, producer and creation or modification timestamps are cleared — the leftover trail of whichever tools produced the file. What remains is your actual content: the pages readers came for, without the editing history attached.",
      },
      {
        q: "Is my file uploaded during optimization?",
        a: "No. The document is opened, cleaned and rewritten entirely in your browser, and you download the result directly. Files destined for public websites often contain sensitive metadata, so keeping the whole process local is the right default.",
      },
    ],
  },
  "create-pdf": {
    intro:
      "Turn plain text into a clean, print-ready PDF: paste a letter, notes, a document draft or a set of instructions, choose A4 or US Letter, set the font size and alignment, and download a tidy file. No word processor, no templates, no watermarks — just your text laid out consistently with proper margins, ready to print or send.",
    steps: [
      "Type or paste your text into the editor.",
      "Choose the page size — A4 or US Letter.",
      "Set the font size and alignment to suit the document.",
      "Create the PDF and download the finished, print-ready file.",
    ],
    faqs: [
      {
        q: "What formatting can I apply?",
        a: "You work with plain text: paragraphs, spacing, your choice of font size and left, centre or right alignment. Images, tables and rich styling are not part of this tool — for those, build the document in a word processor and use Word to PDF.",
      },
      {
        q: "Which page sizes are available?",
        a: "A4 (210 × 297 mm) and US Letter (8.5 × 11 in) — the two standards used across most of the world and North America respectively. Text is laid out with comfortable margins on either, wrapping automatically as the page fills.",
      },
      {
        q: "Is anything uploaded when I create the PDF?",
        a: "No. The document is composed and written inside your browser, and the file is handed to you as a local download. Drafts, letters and notes you would rather not share with a server never have to leave your device.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug];
}
