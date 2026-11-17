"""Run the isolated SQLite keyword baseline on the Plan's inline fixtures."""
import re
import sqlite3
from pathlib import Path


def main():
    record = Path(__file__).with_name("research.md").read_text(encoding="utf-8")
    notes = re.findall(r"^#### (AR-\d{2})\n\n([^\n]+)", record, re.MULTILINE)
    assert len(notes) == 5 and len({doc_id for doc_id, _ in notes}) == 5

    with sqlite3.connect(":memory:") as db:
        db.execute("CREATE VIRTUAL TABLE chunks USING fts5(id UNINDEXED, body)")
        for _ in range(2):
            for doc_id, body in notes:
                db.execute("DELETE FROM chunks WHERE id = ?", (doc_id,))
                db.execute("INSERT INTO chunks VALUES (?, ?)", (doc_id, body))

        count = db.execute("SELECT count(*) FROM chunks").fetchone()[0]
        assert count == 5
        print(f"SQLite {sqlite3.sqlite_version}, rows after two loads: {count}")
        queries = {
            '"api admin"': ["AR-01"],
            '"dashboard"': ["AR-02"],
            '"private area"': [],
            '"downgraded"': ["AR-04"],
            '"billing"': [],
        }
        for query, expected in queries.items():
            rows = db.execute(
                "SELECT id FROM chunks WHERE chunks MATCH ? ORDER BY bm25(chunks), id",
                (query,),
            )
            found = [row[0] for row in rows]
            assert found == expected, (query, expected, found)
            print(f"{query} -> {found}")


if __name__ == "__main__":
    main()
