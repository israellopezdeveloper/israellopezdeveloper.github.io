# src/editor/models/schema.py
from __future__ import annotations

from typing import Any, Dict, List, Literal, NotRequired, TypedDict


# Reutilizables
class Link(TypedDict, total=False):
    text: str
    url: str
    icon: NotRequired[str]


class PeriodTime(TypedDict, total=False):
    start: str
    end: str
    current: bool


# Works / Projects
class Project(TypedDict, total=False):
    name: str
    description: str  # HTML
    technologies: List[str]
    links: List[Link]
    images: List[str]


class Work(TypedDict, total=False):
    name: str
    short_description: str  # texto plano
    thumbnail: str  # ruta/URL
    period_time: PeriodTime
    full_description: str  # HTML
    contribution: str  # HTML
    links: List[Link]
    projects: List[Project]
    images: List[str]


# Educations
class UniversityEntry(TypedDict, total=False):
    university_name: str
    title: str
    period_time: PeriodTime
    summary: str  # HTML
    images: List[str]
    thumbnail: str


class ComplementaryEntry(TypedDict, total=False):
    institution: str
    title: str
    period_time: PeriodTime
    summary: str  # HTML
    images: List[str]
    thumbnail: str


class Acreditation(TypedDict, total=False):
    institution: str
    title: str
    period_time: PeriodTime


_Level = Literal["", "Basico", "intermedio", "fluido", "avanzado", "nativo"]


class LanguageEntry(TypedDict, total=False):
    language: str
    spoken: _Level
    writen: _Level
    read: _Level
    thumbnail: str
    acreditation: List[Acreditation]


class Educations(TypedDict, total=False):
    university: List[UniversityEntry]
    complementary: List[ComplementaryEntry]
    languages: List[LanguageEntry]


class Bio(TypedDict, total=False):
    dates: str
    text: str


# Intro (ajústalo a tu pestaña intro)
class Intro(TypedDict, total=False):
    greetings: str
    profile_image: str
    name: str
    title: str
    summary: str
    bio: List[Bio]
    links: List[Link]


# Documento raíz
class PortfolioData(TypedDict, total=False):
    intro: Intro
    works: List[Work]
    educations: Educations


def get_technologies(works: List[Dict[str, Any]] = []) -> List[str]:
    out: List[str] = []
    for work in works:
        for project in work.get("projects") or []:
            for technology in project.get("technologies") or []:
                out.append(technology)
    return out
