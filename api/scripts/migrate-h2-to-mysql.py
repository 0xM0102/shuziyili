#!/usr/bin/env python3
"""
将 H2 导出的 CSV（UTF-8）转为 MySQL INSERT 语句。
字符串列用 UNHEX 写入，避免引号/换行转义问题。
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path


def Q(s: str | None) -> str:
    if s is None or s == "":
        return "''"
    return "UNHEX('" + s.encode("utf-8").hex() + "')"


def load_dict_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main() -> int:
    if len(sys.argv) < 3:
        print("用法: migrate-h2-to-mysql.py <csv目录> <输出.sql>", file=sys.stderr)
        return 2
    csv_dir = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    lines: list[str] = [
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS=0;",
        "TRUNCATE TABLE sessions;",
        "TRUNCATE TABLE sms_codes;",
        "TRUNCATE TABLE banners;",
        "TRUNCATE TABLE articles;",
        "TRUNCATE TABLE portal_users;",
        "TRUNCATE TABLE staff_users;",
        "SET FOREIGN_KEY_CHECKS=1;",
    ]

    su = csv_dir / "staff_users.csv"
    if su.exists():
        for row in load_dict_rows(su):
            lines.append(
                "INSERT INTO staff_users (id,identifier,password_hash,role,display_name,nickname,avatar_url,bio,updated_at,created_at) VALUES ("
                f"{row['ID']},{Q(row['IDENTIFIER'])},{Q(row['PASSWORD_HASH'])},{Q(row['ROLE'])},"
                f"{Q(row['DISPLAY_NAME'])},{Q(row['NICKNAME'])},{Q(row['AVATAR_URL'])},{Q(row['BIO'])},"
                f"{row['UPDATED_AT']},{row['CREATED_AT']});"
            )

    se = csv_dir / "sessions.csv"
    if se.exists():
        for row in load_dict_rows(se):
            lines.append(
                "INSERT INTO sessions (token,identifier,expires_at,created_at,scope) VALUES ("
                f"{Q(row['TOKEN'])},{Q(row['IDENTIFIER'])},{row['EXPIRES_AT']},{row['CREATED_AT']},'STAFF');"
            )

    ar = csv_dir / "articles.csv"
    if ar.exists():
        for row in load_dict_rows(ar):
            cv = row.get("COVER_URL") or ""
            cv_sql = "NULL" if cv == "" else Q(cv)
            lines.append(
                "INSERT INTO articles (id,title,summary,content,cover_url,status,created_at,updated_at) VALUES ("
                f"{Q(row['ID'])},{Q(row['TITLE'])},{Q(row['SUMMARY'])},{Q(row['CONTENT'])},{cv_sql},"
                f"{Q(row['STATUS'])},{row['CREATED_AT']},{row['UPDATED_AT']});"
            )

    bn = csv_dir / "banners.csv"
    if bn.exists():
        for row in load_dict_rows(bn):
            link = row.get("LINK_URL") or ""
            link_sql = "NULL" if link == "" else Q(link)
            slot = row.get("SLOT") or ""
            slot_sql = "NULL" if slot == "" else Q(slot)
            en = str(row.get("ENABLED", "")).upper()
            enabled = "1" if en in ("TRUE", "1", "T", "Y") else "0"
            lines.append(
                "INSERT INTO banners (id,title,image_url,link_url,enabled,sort_order,created_at,updated_at,slot) VALUES ("
                f"{row['ID']},{Q(row['TITLE'])},{Q(row['IMAGE_URL'])},{link_sql},"
                f"{enabled},{row['SORT_ORDER']},{row['CREATED_AT']},{row['UPDATED_AT']},{slot_sql});"
            )

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"已写入 {out_path}（{len(lines)} 行）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
