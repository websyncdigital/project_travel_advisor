from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import html.parser
import json
import os
import re
import urllib.request
import urllib.parse
from datetime import datetime, timezone

app = FastAPI()

WORKSPACE_DIR = os.path.join(os.path.dirname(__file__), "..", ".agents", "workspace")
PAGES_DIR = os.path.join(WORKSPACE_DIR, "pages")
SNAPSHOTS_FILE = os.path.join(WORKSPACE_DIR, "snapshots.json")
MEMORY_FILE = os.path.join(WORKSPACE_DIR, "memory.md")

os.makedirs(PAGES_DIR, exist_ok=True)

class ScanRequest(BaseModel):
    url: str

class MemoryRequest(BaseModel):
    log: str

class HTMLToMarkdown(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.markdown = []
        self.current_tag = []
        self.link_href = None
        self.list_item_prefix = ""
        self.in_ignored_tag = False
        self.ignored_tags = {"script", "style", "head", "noscript", "iframe", "svg"}

    def handle_starttag(self, tag, attrs):
        if tag in self.ignored_tags:
            self.in_ignored_tag = True
            return
        
        self.current_tag.append(tag)
        attrs_dict = dict(attrs)

        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            level = int(tag[1])
            self.markdown.append(f"\n\n{'#' * level} ")
        elif tag == "p":
            self.markdown.append("\n\n")
        elif tag == "br":
            self.markdown.append("\n")
        elif tag == "li":
            self.markdown.append(f"\n{self.list_item_prefix}- ")
        elif tag in {"ul", "ol"}:
            self.list_item_prefix += "  "
        elif tag in {"strong", "b"}:
            self.markdown.append("**")
        elif tag in {"em", "i"}:
            self.markdown.append("*")
        elif tag == "a":
            self.link_href = attrs_dict.get("href")
            self.markdown.append("[")

    def handle_endtag(self, tag):
        if tag in self.ignored_tags:
            self.in_ignored_tag = False
            return
            
        if self.current_tag and self.current_tag[-1] == tag:
            self.current_tag.pop()

        if tag in {"h1", "h2", "h3", "h4", "h5", "h6", "p"}:
            self.markdown.append("\n")
        elif tag in {"ul", "ol"}:
            if len(self.list_item_prefix) >= 2:
                self.list_item_prefix = self.list_item_prefix[:-2]
        elif tag in {"strong", "b"}:
            self.markdown.append("**")
        elif tag in {"em", "i"}:
            self.markdown.append("*")
        elif tag == "a":
            if self.link_href:
                self.markdown.append(f"]({self.link_href})")
            else:
                self.markdown.append("]")
            self.link_href = None

    def handle_data(self, data):
        if self.in_ignored_tag:
            return
        text = re.sub(r'\s+', ' ', data)
        if text.strip():
            self.markdown.append(text)

    def get_markdown(self):
        result = "".join(self.markdown)
        result = re.sub(r'\n{3,}', '\n\n', result)
        return result.strip()

def sanitize_filename(url):
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return "home.md"
    sanitized = re.sub(r'[^a-zA-Z0-9_-]', '_', path)
    return f"{sanitized}.md"

@app.post("/api/scraper/scan")
def scan_url(request: ScanRequest):
    url = request.url
    if not url.startswith("http"):
        url = "https://" + url

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TravelSupportScanner/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            html_bytes = response.read()
            html_content = html_bytes.decode("utf-8", errors="ignore")

        converter = HTMLToMarkdown()
        converter.feed(html_content)
        markdown_content = converter.get_markdown()

        filename = sanitize_filename(url)
        filepath = os.path.join(PAGES_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"---\noriginal_url: {url}\n---\n\n")
            f.write(markdown_content)
            
        return {"status": "success", "file": filename, "markdown": markdown_content[:500] + "..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scraper/memory")
def add_memory(request: MemoryRequest):
    try:
        with open(MEMORY_FILE, "a", encoding="utf-8") as f:
            f.write(f"\nDate: {datetime.now(timezone.utc).isoformat()}\n{request.log}\n---\n")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scraper/corpus")
def get_corpus():
    corpus = ""
    try:
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                corpus += "### MEMORY LOG ###\n" + f.read() + "\n\n"
                
        if os.path.exists(PAGES_DIR):
            for filename in os.listdir(PAGES_DIR):
                if filename.endswith(".md"):
                    filepath = os.path.join(PAGES_DIR, filename)
                    with open(filepath, "r", encoding="utf-8") as f:
                        corpus += f"### PAGE: {filename} ###\n" + f.read() + "\n\n"
        
        return {"corpus": corpus}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
