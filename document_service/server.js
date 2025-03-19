const express = require('express');
const cors = require('cors');
const { PDFNet } = require('@pdftron/pdfnet-node');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const JSZip = require("jszip");
const { DOMParser, XMLSerializer } = require("xmldom");
const jsDiff = require('diff');
// const mammoth = require("mammoth");

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const upload = require('multer')({
    dest: 'uploads/'
});

// ----------------- Helper -----------------
async function modifyDocxDirectly(newPath, segments) {
    try {
        const data = fs.readFileSync(newPath);
        const zip = await JSZip.loadAsync(data);

        const docXmlPath = "word/document.xml";
        const docXmlContent = await zip.file(docXmlPath).async("text");

        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(docXmlContent, "text/xml");
        let tables = xmlDoc.getElementsByTagName("w:tbl");
        const tablesArray = Array.from(tables);
        const headerTables = [];

        if (tablesArray.length) {
            // Chuyển HTMLCollection sang Array để có thể sử dụng filter
            // Phần tử đầu tiên để so sánh
            const firstTable = tablesArray[0];
            const firstTableStr = firstTable.textContent;
            
            // Lọc ra các phần tử giống phần tử đầu tiên
            const matchingTables = tablesArray.filter((node) => node.textContent === firstTableStr);
            console.log("matchingTables", matchingTables.length);

            matchingTables.forEach((table) => {
                const parent = table.parentNode;
                if (parent) {
                    // Tạo phần tử mới với namespace XML
                    const newElement = xmlDoc.createElement("w:tbl");
                    parent.replaceChild(newElement, table);
                    headerTables.push(newElement);
                }
            });
            
        }

        const textNodes = xmlDoc.getElementsByTagName("w:t");

        let fullText = "";
        let textElements = [];

        // Duyệt qua tất cả <w:t> để xây dựng văn bản đầy đủ
        for (let i = 0; i < textNodes.length; i++) {
            textElements.push({
                node: textNodes[i],
                text: textNodes[i].textContent,
            });
            fullText += textNodes[i].textContent;
        }

        let searchStartIndex = 0;

        segments.forEach(({ original, translated }) => {
            let startIndex = fullText.indexOf(original.trim(), searchStartIndex);
            if (startIndex !== -1) {
                console.log(`🔍 Tìm thấy "${original}" tại vị trí ${startIndex}`);

                let endIndex = startIndex + original.length;
                let currentIndex = 0;
                let lastNode = null; // Node cuối cùng chứa phần segment

                for (let i = 0; i < textElements.length; i++) {
                    let { node, text } = textElements[i];

                    if (currentIndex + text.length > startIndex) {
                        if (currentIndex < endIndex) {
                            lastNode = node;
                        }
                    }

                    currentIndex += text.length;
                }
                searchStartIndex = endIndex;
                if (original === translated) {
                    console.log(`❌ Không cần thay thế "${original}" vì dịch không khác gì.`);
                    return;
                }
                if (lastNode) {
                    // Lấy node cha
                    let parentRun = lastNode.parentNode;

                    // Tạo thẻ <w:t> chứa văn bản mới
                    let newTextNode = xmlDoc.createElement("w:t");
                    newTextNode.textContent = " / " + translated;

                    // Tạo thẻ <w:r> để bọc <w:t>
                    let newRunNode = xmlDoc.createElement("w:r");

                    // Thêm thuộc tính màu chữ (đỏ)
                    // let newRunProperties = xmlDoc.createElement("w:rPr");
                    // let colorNode = xmlDoc.createElement("w:color");
                    // colorNode.setAttribute("w:val", "FF0000"); // Màu đỏ

                    // newRunProperties.appendChild(colorNode);
                    // newRunNode.appendChild(newRunProperties);
                    newRunNode.appendChild(newTextNode);

                    // 👉 Tạo bookmark để đánh dấu nội dung đã chèn
                    let bookmarkId = Date.now().toString(); // ID duy nhất
                    let bookmarkStart = xmlDoc.createElement("w:bookmarkStart");
                    bookmarkStart.setAttribute("w:id", bookmarkId);
                    bookmarkStart.setAttribute("w:name", "trackChange_" + bookmarkId);

                    let bookmarkEnd = xmlDoc.createElement("w:bookmarkEnd");
                    bookmarkEnd.setAttribute("w:id", bookmarkId);

                    // 👉 Tạo thẻ <w:ins> để đánh dấu là Track Changes
                    let trackChangeNode = xmlDoc.createElement("w:ins");
                    trackChangeNode.setAttribute("w:author", "AI dịch thuật");
                    trackChangeNode.setAttribute("w:date", new Date().toISOString()); // Ngày hiện tại
                    trackChangeNode.appendChild(bookmarkStart);
                    trackChangeNode.appendChild(newRunNode);
                    trackChangeNode.appendChild(bookmarkEnd);

                    // Chèn nội dung đã chỉnh sửa sau nội dung gốc
                    parentRun.parentNode.insertBefore(trackChangeNode, parentRun.nextSibling);

                }

            } else {
                console.log(`❌ Không tìm thấy "${segment}" trong tài liệu.`);
            }
        });

       
        if (headerTables.length) {
            headerTables.forEach((headerTag, index) => {
                const parent = headerTag.parentNode;
                if (parent) {
                    const newTable = tablesArray[index].cloneNode(true); // Tạo bản sao của bảng gốc
                    parent.replaceChild(newTable, headerTag);
                }
            });
        }
        const serializer = new XMLSerializer();
        let newXml = serializer.serializeToString(xmlDoc);
        zip.file(docXmlPath, newXml);

        zip.generateAsync({ type: "nodebuffer" }).then((buffer) => {
            fs.writeFileSync(newPath, buffer);
            console.log("✅ File DOCX đã được cập nhật thành công!");
        });
    } catch (error) {
        console.error("❌ Lỗi khi chỉnh sửa file DOCX:", error);
    }
}


function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

async function extractTextFromDocx(docxPath) {
    try {
        const data = fs.readFileSync(docxPath);
        const zip = await JSZip.loadAsync(data);
        const contentXml = await zip.file("word/document.xml").async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contentXml, "text/xml");

        let text = "";
        const paragraphs = xmlDoc.getElementsByTagName("w:p");

        for (let i = 0; i < paragraphs.length; i++) {
            let paragraphText = "";
            const textNodes = paragraphs[i].getElementsByTagName("w:t");

            for (let j = 0; j < textNodes.length; j++) {
                paragraphText += textNodes[j].textContent;
            }

            if (paragraphText.trim().length > 0) {
                text += paragraphText + "\n"; // Xuống dòng giữa các đoạn
            }
        }

        return text;
    } catch (error) {
        console.error("Lỗi khi đọc DOCX:", error);
        return "";
    }
}

function mergeSegmentTranslate(segments, marianData) {
    return segments.map((segment, index) => {
        return {
            original: segment,
            translated: marianData[index],
        };
    }).filter(({ original, translated }) => original !== translated);
}

function findAddedAndReplacedText(originalText, newText) {
    const diffResult = jsDiff.diffWords(originalText, newText);

    const data = [];

    let tempDeleted = null;

    for (const part of diffResult) {
        if (part.added) {
            if (tempDeleted) {
                // Nếu có phần bị xóa trước đó, coi như bị thay thế
                data.push({ old: tempDeleted, new: part.value.trim() });
                tempDeleted = null;
            } else {
                data.push({
                    old: null, // Không có trong văn bản gốc
                    new: part.value.trim()
                });
            }
        } else if (part.removed) {
            tempDeleted = part.value.trim();
        } else {
            tempDeleted = null; // Nếu có phần chung, reset tempDeleted
        }
    }

    return data.reduce((prev, next) => {
        if (next.new.includes("\n")) {
            const split = next.new.split("\n");
            return [...prev, ...split];
        }
        return [...prev, next.new];
    }, []);;
}

async function translateTexts(listText) {
    const data = await fetch(process.env.TRANSLATE_URL + 'translates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source_text: listText,
        }),
    }).then(response => response.json())
    return data;
}

function removeDuplicatePrefix(text) {

    // Biểu thức chính quy để tìm đoạn lặp
    const pattern = /(Discharge Summaries[\s\S]*?Verified Date:\s*\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2})/g;

    // Tìm tất cả các lần xuất hiện của đoạn văn bản trùng lặp
    const matches = text.match(pattern);

    if (matches && matches.length > 1) {
        // Giữ lại lần đầu tiên, xóa tất cả các lần sau
        let firstMatch = matches[0];
        return text.replace(pattern, (match, offset) => (offset === text.indexOf(firstMatch) ? match : ""));
    }

    return text;
}

// ---------------------------------------------------

// API to handle PDF upload
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/convert', upload.fields([{ name: 'fileOrigin', maxCount: 1 }, { name: 'fileTranslation', maxCount: 1 }]), async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).send('No file uploaded.');
        }
        const pdfDir = path.join(__dirname, 'pdf');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir);
        }

        const fileTranslationNewPath = path.join(pdfDir, req.files.fileTranslation[0].filename) + ".pdf";
        fs.copyFileSync(req.files.fileTranslation[0].path, fileTranslationNewPath);
        fs.unlinkSync(req.files.fileTranslation[0].path);
        req.files.fileTranslation[0].path = fileTranslationNewPath;

        const fileOriginPath = path.join(pdfDir, req.files.fileOrigin[0].filename) + ".pdf";
        fs.copyFileSync(req.files.fileOrigin[0].path, fileOriginPath);
        fs.unlinkSync(req.files.fileOrigin[0].path);
        req.files.fileOrigin[0].path = fileOriginPath;

        const name = guidGenerator();
        const pathOrigin = path.join(__dirname, 'public') + '/' + name + '_origin.docx';
        const pathTranslation = path.join(__dirname, 'public') + '/' + name + '_translation.docx';
        await PDFNet.runWithCleanup(async () => {
            await PDFNet.addResourceSearchPath(path.join(__dirname, 'Lib'));
            // check if the module is available
            if (!(await PDFNet.StructuredOutputModule.isModuleAvailable())) {
                return;
            }

            await PDFNet.Convert.fileToWord(fileTranslationNewPath, pathTranslation);
            await PDFNet.Convert.fileToWord(fileOriginPath, pathOrigin);
        }, 'demo:1739949060645:617adfb903000000000935bcbf740717e9c6b2c11e6fd7ac9496321dc6')

        const originText = await extractTextFromDocx(pathOrigin);
        const translationText = await extractTextFromDocx(pathTranslation);

        const segments = findAddedAndReplacedText(
            removeDuplicatePrefix(originText),
            removeDuplicatePrefix(translationText)
        );
        const marianData = await translateTexts(segments);
        const segmentsTranslate = mergeSegmentTranslate(segments, marianData.translation);

        await modifyDocxDirectly(pathTranslation, segmentsTranslate);
        res.json({ message: 'File converted successfully', path: `${name}_translation.docx`, changed: segments });
    } catch (error) {
        console.error("Error converting PDF to DOCX:", error);
        res.status(500).send('Error converting PDF to DOCX.');
    }
});

app.post('/check-change', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const docxPath = req.file.path;
    try {
        const data = fs.readFileSync(docxPath);
        const zip = await JSZip.loadAsync(data);
        const contentXml = await zip.file("word/document.xml").async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contentXml, "text/xml");

        const trackChanges = [];
        const bookmarks = xmlDoc.getElementsByTagName('w:bookmarkStart');
        const bookmarkEnds = xmlDoc.getElementsByTagName('w:bookmarkEnd');

        for (let i = 0; i < bookmarks.length; i++) {
            const bookmarkStart = bookmarks[i];
            const bookmarkName = bookmarkStart.getAttribute('w:name');
            if (bookmarkName && bookmarkName.startsWith('trackChange_')) {
                const bookmarkId = bookmarkStart.getAttribute('w:id');

                // Tìm bookmarkEnd có cùng w:id
                let bookmarkEnd = null;
                for (let j = 0; j < bookmarkEnds.length; j++) {
                    if (bookmarkEnds[j].getAttribute('w:id') === bookmarkId) {
                        bookmarkEnd = bookmarkEnds[j];
                        break;
                    }
                }

                // Nếu tìm thấy bookmarkEnd
                if (bookmarkEnd) {
                    let currentNode = bookmarkStart.nextSibling;
                    let changeText = '';

                    // Duyệt qua các node giữa bookmarkStart và bookmarkEnd
                    while (currentNode && currentNode !== bookmarkEnd) {
                        if (currentNode.nodeType === 1) { // Kiểm tra nếu là một element node
                            const textNodes = currentNode.getElementsByTagName('w:t');
                            for (let t = 0; t < textNodes.length; t++) {
                                changeText += textNodes[t].textContent;
                            }
                        }
                        currentNode = currentNode.nextSibling;
                    }

                    trackChanges.push(changeText);
                }
            }
        }

        res.json({ message: 'File checked successfully', trackChanges });
    } catch (error) {
        console.error("Error converting DOCX to XML:", error);
        res.status(500).send('Error converting DOCX to XML.');
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});