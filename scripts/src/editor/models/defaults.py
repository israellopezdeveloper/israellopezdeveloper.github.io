# src/editor/models/defaults.py
from __future__ import annotations
from typing import Any
from .schema import (
    Bio,
    Link,
    PeriodTime,
    Project,
    Work,
    UniversityEntry,
    ComplementaryEntry,
    Acreditation,
    LanguageEntry,
    Educations,
    Profile,
    PortfolioData,
)


def ensure_period_time(v: Any) -> PeriodTime:
    d = dict(v or {})
    return {
        "start": d.get("start", ""),
        "end": d.get("end", ""),
        "current": bool(d.get("current", False)),
    }


def ensure_link(v: Any) -> Link:
    d = dict(v or {})
    out: Link = {"text": d.get("text", ""), "url": d.get("url", "")}
    if d.get("icon"):
        out["icon"] = d.get("icon", "")
    return out


def ensure_bio(v: Any) -> Bio:
    d = dict(v or {})
    out: Bio = {"dates": d.get("dates", ""), "text": d.get("text", "")}
    return out


def ensure_project_defaults(v: Any) -> Project:
    d = dict(v or {})
    return {
        "name": d.get("name", ""),
        "description": d.get("description", ""),
        "technologies": [str(x) for x in (d.get("technologies") or [])],
        "links": [ensure_link(x) for x in (d.get("links") or [])],
        "images": [str(x) for x in (d.get("images") or [])],
    }


def ensure_work_defaults(v: Any) -> Work:
    d = dict(v or {})
    return {
        "name": d.get("name", ""),
        "short_description": d.get("short_description", ""),
        "thumbnail": d.get("thumbnail", ""),
        "period_time": ensure_period_time(d.get("period_time") or d),
        "full_description": d.get("full_description", ""),
        "contribution": d.get("contribution", ""),
        "links": [ensure_link(x) for x in (d.get("links") or [])],
        "projects": [ensure_project_defaults(x) for x in (d.get("projects") or [])],
        "images": [str(x) for x in (d.get("images") or [])],
    }


def ensure_university_defaults(v: Any) -> UniversityEntry:
    d = dict(v or {})
    return {
        "university_name": d.get("university_name", ""),
        "title": d.get("title", ""),
        "period_time": ensure_period_time(d.get("period_time") or d),
        "summary": d.get("summary", ""),
        "images": [str(x) for x in (d.get("images") or [])],
        "thumbnail": d.get("thumbnail", ""),
    }


def ensure_complementary_defaults(v: Any) -> ComplementaryEntry:
    d = dict(v or {})
    return {
        "institution": d.get("institution", ""),
        "title": d.get("title", ""),
        "period_time": ensure_period_time(d.get("period_time") or d),
        "summary": d.get("summary", ""),
        "images": [str(x) for x in (d.get("images") or [])],
        "thumbnail": d.get("thumbnail", ""),
    }


def ensure_acreditation_defaults(v: Any) -> Acreditation:
    d = dict(v or {})
    return {
        "institution": d.get("institution", ""),
        "title": d.get("title", ""),
        "period_time": ensure_period_time(d.get("period_time") or d),
    }


def ensure_language_defaults(v: Any) -> LanguageEntry:
    d = dict(v or {})
    return {
        "language": d.get("language", ""),
        "spoken": d.get("spoken", ""),
        "writen": d.get("writen", ""),
        "read": d.get("read", ""),
        "thumbnail": d.get("thumbnail", ""),
        "acreditation": [
            ensure_acreditation_defaults(x) for x in (d.get("acreditation") or [])
        ],
    }


def ensure_educations_defaults(v: Any) -> Educations:
    d = dict(v or {})
    return {
        "university": [
            ensure_university_defaults(x) for x in (d.get("university") or [])
        ],
        "complementary": [
            ensure_complementary_defaults(x) for x in (d.get("complementary") or [])
        ],
        "languages": [ensure_language_defaults(x) for x in (d.get("languages") or [])],
    }


def ensure_profile_defaults(v: Any) -> Profile:
    d = dict(v or {})
    summary_json = d.get("summary", "")
    if isinstance(summary_json, list):
        summary_json = "".join(summary_json)
    hobbies_json = d.get("hobbies", "")
    if isinstance(hobbies_json, list):
        summary_json = "".join(hobbies_json)
    return {
        "greeting": d.get("greeting", ""),
        "profile_image": d.get("profile_image", ""),
        "name": d.get("name", ""),
        "title": d.get("title", ""),
        "summary": summary_json,
        "links": [ensure_link(x) for x in (d.get("links") or [])],
        "hobbies": hobbies_json,
        "bio": [ensure_bio(x) for x in (d.get("bio") or [])],
    }


def ensure_portfolio_defaults(v: Any) -> PortfolioData:
    d = dict(v or {})
    return {
        "profile": ensure_profile_defaults(d.get("profile") or {}),
        "works": [ensure_work_defaults(x) for x in (d.get("works") or [])],
        "educations": ensure_educations_defaults(d.get("educations") or {}),
    }
