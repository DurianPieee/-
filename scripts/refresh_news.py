import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server import fetch_news


def main():
    parser = argparse.ArgumentParser(description="更新学院竞赛消息快照")
    parser.add_argument("--output", type=Path, required=True)
    options = parser.parse_args()
    try:
        items = fetch_news()
        updated_at = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M")
        print(f"已从学院官网取得 {len(items)} 条消息")
    except Exception as error:
        items = json.loads((ROOT / "data" / "news-seed.json").read_text(encoding="utf-8"))
        updated_at = "官网暂不可用，展示内置资料"
        print(f"同步失败，使用内置资料：{error}")
    options.output.parent.mkdir(parents=True, exist_ok=True)
    options.output.write_text(json.dumps({"items": items, "updatedAt": updated_at}, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
