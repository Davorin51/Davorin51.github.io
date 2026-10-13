"""Check the static site's assets, navigation and metadata using the stdlib."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.references = []
        self.filters = set()
        self.categories = set()
        self.project_count = 0
        self.meta = {}
        self.h1_count = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for key in ("href", "src"):
            if attrs.get(key):
                self.references.append(attrs[key])
        if tag == "img":
            assert attrs.get("alt"), "Image needs meaningful alternative text"
            assert attrs.get("width") and attrs.get("height"), "Image dimensions missing"
        if "data-filter" in attrs:
            self.filters.add(attrs["data-filter"])
        if "data-category" in attrs:
            self.project_count += 1
            self.categories.update(attrs["data-category"].split())
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))] = attrs.get("content")
        if tag == "h1":
            self.h1_count += 1
        if tag == "a" and attrs.get("target") == "_blank":
            assert {"noopener", "noreferrer"} <= set(attrs.get("rel", "").split()), "Unsafe external tab link"


def main():
    root = Path(__file__).resolve().parents[1]
    parser = SiteParser()
    parser.feed((root / "index.html").read_text(encoding="utf-8"))
    assert len(parser.ids) == len(set(parser.ids)), "Duplicate element IDs"
    assert parser.h1_count == 1, "Expected a single page heading"
    assert parser.project_count == 4, "Expected all four featured projects"
    assert parser.filters - {"all"} == parser.categories, "Project filters differ from categories"
    assert {"projects", "research", "contact", "main", "top"} <= set(parser.ids)
    assert parser.meta.get("description")
    assert parser.meta.get("viewport")
    assert parser.meta.get("og:title")
    for reference in parser.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            assert url.scheme in {"https", "mailto"}, f"Unexpected link scheme: {reference}"
            if url.scheme == "mailto":
                assert url.path == "davorin.milicevic@gmail.com", "Unexpected contact address"
            if reference == parser.meta.get("og:image"):
                assert (root / unquote(url.path.lstrip("/"))).is_file()
            continue
        if url.fragment:
            assert url.fragment in parser.ids, f"Missing anchor: {reference}"
        if url.path:
            assert (root / unquote(url.path)).is_file(), f"Missing asset: {reference}"
    social_path = urlsplit(parser.meta["og:image"]).path.lstrip("/")
    assert (root / social_path).is_file(), "Missing social preview"
    ET.parse(root / "sitemap.xml")
    assert (root / ".nojekyll").exists()
    print(f"Site checks passed: {parser.project_count} projects, {len(parser.references)} references.")


if __name__ == "__main__":
    main()
