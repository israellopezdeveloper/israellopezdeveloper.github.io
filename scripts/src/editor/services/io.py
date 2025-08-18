# src/editor/services/io.py
from __future__ import annotations
import json
import re
from typing import Any, Dict, Tuple, List
from ..models.defaults import ensure_portfolio_defaults


# ---------- util decodificación robusta ----------
def _decode_json_bytes(raw: bytes) -> str:
    # Prueba varias codificaciones típicas
    encodings = (
        "utf-8",
        "utf-8-sig",
        "utf-16",
        "utf-16-le",
        "utf-16-be",
        "cp1252",
        "latin-1",
    )
    last_err: Exception | None = None
    for enc in encodings:
        try:
            return raw.decode(enc)
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(
        f"No pude decodificar el archivo como UTF-8/UTF-16/Latin-1. Último error: {last_err!r}"
    )


# ---------- helpers de migración ----------
def _as_list(v: Any) -> List[Any]:
    return v if isinstance(v, list) else []


def _as_dict(v: Any) -> Dict[str, Any]:
    return v if isinstance(v, dict) else {}


def _as_str(v: Any) -> str:
    return "" if v is None else str(v)


def _join_plain(v: Any) -> str:
    # Une listas de trozos de texto en una sola cadena "plana"
    if isinstance(v, list):
        return " ".join(_as_str(x).strip() for x in v if x is not None)
    return _as_str(v)


def _join_html(v: Any) -> str:
    # Une listas de fragmentos HTML sin separador
    if isinstance(v, list):
        return "".join(_as_str(x) for x in v if x is not None)
    return _as_str(v)


def _parse_period_time(v: Any) -> Dict[str, Any]:
    """
    Acepta:
      - dict {start,end,current}
      - cadena "Mes YYYY - Mes YYYY" o "Mes YYYY - Actualidad" o "Mes YYYY"
    """
    if isinstance(v, dict):
        return {
            "start": _as_str(v.get("start")),
            "end": _as_str(v.get("end")),
            "current": bool(v.get("current", False)),
        }
    s = _as_str(v)
    if not s:
        return {"start": "", "end": "", "current": False}
    parts = [p.strip() for p in s.split("-", 1)]
    start = parts[0] if parts else ""
    end = parts[1] if len(parts) > 1 else ""
    current = bool(re.search(r"actualidad", end, flags=re.I)) or end == ""
    # Si pone "Actualidad", borramos el end para dejar sólo current=True
    if current:
        end = ""
    return {"start": start, "end": end, "current": current}


def _migrate_links(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for it in _as_list(lst):
        d = _as_dict(it)
        if not d and isinstance(it, str):
            out.append({"text": it, "url": it})
            continue
        text = _as_str(d.get("text") or d.get("tag"))
        url = _as_str(d.get("url"))
        icon = _as_str(d.get("icon"))
        o: Dict[str, Any] = {"text": text, "url": url}
        if icon:
            o["icon"] = icon
        out.append(o)
    return out


def _migrate_bio(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for it in _as_list(lst):
        d = _as_dict(it)
        if not d and isinstance(it, str):
            out.append({"text": it, "url": it})
            continue
        dates = _as_str(d.get("dates"))
        text = _as_str(d.get("text") or d.get("tag"))
        o: Dict[str, Any] = {"text": text, "dates": dates}
        out.append(o)
    return out


def _migrate_projects(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for p in _as_list(lst):
        d = _as_dict(p)
        out.append(
            {
                "name": _as_str(d.get("name")),
                "description": _join_html(d.get("description")),
                "technologies": [_as_str(x) for x in _as_list(d.get("technologies"))],
                "links": _migrate_links(d.get("links")),
                "images": [_as_str(x) for x in _as_list(d.get("images"))],
            }
        )
    return out


def _migrate_works(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for w in _as_list(lst):
        d = _as_dict(w)
        out.append(
            {
                "name": _as_str(d.get("name")),  # empresa
                "short_description": _join_plain(d.get("short_description")),
                "thumbnail": _as_str(d.get("thumbnail")),
                "period_time": _parse_period_time(d.get("period_time") or d),
                "full_description": _join_html(d.get("full_description")),
                "contribution": _join_html(d.get("contribution")),
                "links": _migrate_links(d.get("links")),
                "projects": _migrate_projects(d.get("projects")),
                "images": [_as_str(x) for x in _as_list(d.get("images"))],
            }
        )
    return out


def _migrate_university(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for u in _as_list(lst):
        d = _as_dict(u)
        out.append(
            {
                "university_name": _as_str(d.get("university_name")),
                "title": _as_str(d.get("title")),
                "period_time": _parse_period_time(d.get("period_time") or d),
                "summary": _join_plain(d.get("summary")),
                "images": [_as_str(x) for x in _as_list(d.get("images"))],
                "thumbnail": _as_str(d.get("thumbnail")),
            }
        )
    return out


def _migrate_complementary(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for c in _as_list(lst):
        d = _as_dict(c)
        out.append(
            {
                "institution": _as_str(d.get("institution")),
                "title": _as_str(d.get("title")),
                "period_time": _parse_period_time(d.get("period_time") or d),
                "summary": _join_plain(d.get("summary")),
                "images": [_as_str(x) for x in _as_list(d.get("images"))],
                "thumbnail": _as_str(d.get("thumbnail")),
            }
        )
    return out


def _norm_level(v: Any) -> str:
    s = _as_str(v)
    # Normaliza algunas variantes comunes
    mapping = {
        "basico": "Basico",
        "básico": "Basico",
        "intermedio": "intermedio",
        "fluido": "fluido",
        "avanzado": "avanzado",
        "nativo": "nativo",
        "Fluido": "fluido",
        "Avanzado": "avanzado",
        "Nativo": "nativo",
        "Básico": "Basico",
        "Básico ": "Basico",
    }
    return mapping.get(s, s)


def _migrate_languages(lst: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for L in _as_list(lst):
        d = _as_dict(L)
        # alias 'acreditations' -> 'acreditation'
        acc = d.get("acreditation")
        if acc is None:
            acc = d.get("acreditations")
        acred_list = []
        for a in _as_list(acc):
            ad = _as_dict(a)
            acred_list.append(
                {
                    "institution": _as_str(ad.get("institution")),
                    "title": _as_str(ad.get("title")),
                    "period_time": _parse_period_time(ad.get("period_time") or ad),
                }
            )
        out.append(
            {
                "language": _as_str(d.get("language")),
                "spoken": _norm_level(d.get("spoken")),
                "writen": _norm_level(d.get("writen")),
                "read": _norm_level(d.get("read")),
                "thumbnail": _as_str(d.get("thumbnail")),
                "acreditation": acred_list,
            }
        )
    return out


def _migrate_intro_to_profile(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convierte 'intro' → 'profile'
    """
    intro = _as_dict(d.get("intro"))
    if not intro:
        return {
            "greeting": "",
            "profile_image": "",
            "name": "",
            "title": "",
            "summary": "",
            "bio": [],
            "hobbies": [],
            "links": [],
        }
    return {
        "greeting": _as_str(intro.get("greeting")),
        "profile_image": _as_str(intro.get("profile_image")),
        "name": _as_str(intro.get("name")),
        "title": _as_str(intro.get("title")),
        "summary": _join_html(intro.get("summary")),
        "bio": _migrate_bio(intro.get("bio")),
        "hobbies": _join_html(intro.get("hobbies")),
        "links": _migrate_links(intro.get("links")),
    }


def _migrate_incoming(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Acomoda tu JSON a nuestro esquema antes de defaults().
    """
    d = _as_dict(data)
    out: Dict[str, Any] = {}

    # profile (desde intro si existe)
    if "profile" in d:
        out["profile"] = _as_dict(d.get("profile"))
    else:
        out["profile"] = _migrate_intro_to_profile(d)

    # works
    out["works"] = _migrate_works(d.get("works"))

    # educations
    edu = _as_dict(d.get("educations"))
    out["educations"] = {
        "university": _migrate_university(edu.get("university")),
        "complementary": _migrate_complementary(edu.get("complementary")),
        "languages": _migrate_languages(edu.get("languages")),
    }
    return out


# ---------- API pública ----------
def load_json(path: str) -> Dict[str, Any]:
    # Lee bytes y decodifica robustamente
    with open(path, "rb") as f:
        raw = f.read()
    text = _decode_json_bytes(raw)

    # Intenta parsear JSON puro
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        # Lanza con info clara de línea/columna
        raise RuntimeError(
            f"JSON inválido en {path}: línea {e.lineno}, columna {e.colno}: {e.msg}"
        ) from e

    # Migra al esquema del editor y normaliza
    migrated = _migrate_incoming(parsed)
    return ensure_portfolio_defaults(migrated)


def save_json(path: str, data: Dict[str, Any]) -> None:
    norm = ensure_portfolio_defaults(data)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(norm, f, ensure_ascii=False, indent=2)


def validate(data: Dict[str, Any]) -> Tuple[bool, str]:
    try:
        _ = ensure_portfolio_defaults(data)
        return True, ""
    except Exception as e:
        return False, f"Validation error: {e}"


def defaults(data: Dict[str, Any]) -> Dict[str, Any]:
    return ensure_portfolio_defaults(data)
