# src/editor/services/summarize.py
from __future__ import annotations
from typing import Optional


def summarize_html(html: str, max_chars: Optional[int] = 800) -> str:
    """
    Wrapper del resumidor. Si editor.summarizer existe, lo usa; si no, devuelve el mismo HTML.
    """
    try:
        from editor.summarizer import summarize_html as s_html  # type: ignore

        return s_html(html, max_chars=max_chars)
    except Exception:
        return html  # fallback no-op
