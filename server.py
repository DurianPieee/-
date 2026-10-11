import argparse
import html
import json
import re
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = "https://phys.lcu.edu.cn/"
SOURCE_PAGES = ["xsgz/xkjs/index.htm", "xsgz/xkjs/index1.htm", "xsgz/xkjs/index2.htm"]
REFRESH_SECONDS = 6 * 60 * 60
MATCH = re.compile(
    r'<a\b(?=[^>]*\bhref="([^"]+)")(?=[^>]*\btitle="([^"]+)")[^>]*>[^<]*</a>\s*<span[^>]*>\s*(\d{4}-\d{2}-\d{2})',
    re.S | re.I,
)
lock = threading.Lock()
seed_file = ROOT / "data" / "news-seed.json"
news = json.loads(seed_file.read_text(encoding="utf-8")) if seed_file.exists() else []
updated_at = "网站内置资料"


def fetch_news():
    found = []
    seen = set()
    for page in SOURCE_PAGES:
        page_url = urllib.parse.urljoin(SOURCE, page)
        request = urllib.request.Request(page_url, headers={"User-Agent": "Mozilla/5.0 (LCU competition information portal)"})
        with urllib.request.urlopen(request, timeout=20) as response:
            text = response.read().decode("utf-8", "ignore")
        for match in MATCH.finditer(text):
            url, title, date = match.groups()
            url = urllib.parse.urljoin(page_url, html.unescape(url))
            if url in seen or not url.startswith(("http://", "https://")):
                continue
            seen.add(url)
            found.append({"title": re.sub(r"\s+", " ", html.unescape(title)).strip(), "date": date, "url": url})
    found.sort(key=lambda item: (item["date"], item["title"]), reverse=True)
    if len(found) < 15:
        raise ValueError(f"学院官网仅解析到 {len(found)} 条学科竞赛消息")
    return found[:15]


def refresh_forever():
    global news, updated_at
    while True:
        try:
            latest = fetch_news()
            timestamp = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")
            with lock:
                news = latest
                updated_at = timestamp
            print(f"[{timestamp}] 已同步 {len(latest)} 条学院竞赛消息", flush=True)
        except Exception as error:
            print(f"学院消息同步失败，保留上次结果：{error}", flush=True)
        time.sleep(REFRESH_SECONDS)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if urllib.parse.urlsplit(self.path).path == "/api/news":
            with lock:
                payload = json.dumps({"items": news, "updatedAt": updated_at, "source": urllib.parse.urljoin(SOURCE, SOURCE_PAGES[0])}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="聊城大学竞赛渠道查询网站")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    options = parser.parse_args()
    threading.Thread(target=refresh_forever, daemon=True).start()
    server = ThreadingHTTPServer((options.host, options.port), Handler)
    print(f"网站已启动：http://{options.host}:{options.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
