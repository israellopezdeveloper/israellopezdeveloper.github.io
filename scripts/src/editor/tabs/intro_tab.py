from __future__ import annotations

from typing import Any, Dict, Optional
from PySide6 import QtCore, QtWidgets

from editor.utils.lists import (
    CustomList,
)
from ..dialogs.bio_dialog import BioDialog
from ..widgets.html_editor import HtmlEditor
from ..widgets.file_select import FileSelect
from ..dialogs.link_dialog import LinkDialog

Qt = QtCore.Qt


# --- helpers ---
def _join_html(v: Any) -> str:
    if isinstance(v, list):
        return "".join(str(x) for x in v if x is not None)
    return str(v)


# --- Tab ---
class IntroTab(QtWidgets.QWidget):
    """Editor de perfil conforme al esquema:
    greeting, profile_image, name, title, summary(HTML), bio(list), hobbies(HTML), links(list)
    """

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)

        # Campos básicos
        self._greeting = QtWidgets.QLineEdit(self)
        self._name = QtWidgets.QLineEdit(self)
        self._title = QtWidgets.QLineEdit(self)

        img_filter = "Imágenes (*.png *.jpg *.jpeg *.webp *.gif *.svg);;Todos (*)"
        self._profile_image = FileSelect(
            title="Elegir imagen de perfil",
            file_filter=img_filter,
            must_exist=False,
            parent=self,
        )
        self._img_set = self._profile_image.set_value
        self._img_get = self._profile_image.value

        # Editores HTML
        self._summary = HtmlEditor(show_preview=True, parent=self)
        self._hobbies = HtmlEditor(show_preview=True, parent=self)
        self._set_summary = self._summary.set_html
        self._get_summary = self._summary.html
        self._set_hobbies = self._hobbies.set_html
        self._get_hobbies = self._hobbies.html

        # Links
        self._links = CustomList(
            self,
            dialog_cls=LinkDialog,
        )

        # Bio
        self._bio = CustomList(
            self,
            dialog_cls=BioDialog,
        )

        self._build_ui()
        self._connect()

    # ---------- UI ----------
    def _build_ui(self) -> None:
        # Form básico
        form = QtWidgets.QFormLayout()
        form.addRow("Greeting", self._greeting)
        form.addRow("Imagen de perfil", self._profile_image)
        form.addRow("Nombre", self._name)
        form.addRow("Título", self._title)

        box_summary = QtWidgets.QGroupBox("Summary (HTML)", self)
        v1 = QtWidgets.QVBoxLayout(box_summary)
        v1.addWidget(self._summary)

        box_hobbies = QtWidgets.QGroupBox("Hobbies (HTML)", self)
        v2 = QtWidgets.QVBoxLayout(box_hobbies)
        v2.addWidget(self._hobbies)

        left = QtWidgets.QVBoxLayout()
        left.addLayout(form)
        left.addWidget(box_summary, 4)
        left.addWidget(box_hobbies, 3)

        # Links
        box_links = QtWidgets.QGroupBox("Links", self)
        vl = QtWidgets.QVBoxLayout(box_links)
        vl.addWidget(self._links)

        # Bio
        box_bio = QtWidgets.QGroupBox("Bio", self)
        vb = QtWidgets.QVBoxLayout(box_bio)
        vb.addWidget(self._bio)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_links, 4)
        right.addWidget(box_bio, 4)
        right.addStretch(1)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        wleft = QtWidgets.QWidget(self)
        wleft.setLayout(left)
        wright = QtWidgets.QWidget(self)
        wright.setLayout(right)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([640, 360])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)

    def _connect(self) -> None:
        for w in [self._greeting, self._name, self._title]:
            w.textChanged.connect(self.changed)

        try:
            self._profile_image.valueChanged.connect(
                lambda _: self.changed.emit(),
            )
        except Exception:
            pass

        self._summary.htmlChanged.connect(self.changed)
        self._hobbies.htmlChanged.connect(self.changed)

        # Links
        self._links.changed.connect(self.changed)

        # Bio
        self._bio.changed.connect(self.changed)

    # ---------- Data API ----------
    def from_data(self, intro: Dict[str, Any] | None) -> None:
        p = intro or {}
        self._greeting.setText(str(p.get("greeting")))
        self._img_set(str(p.get("profile_image")))
        self._name.setText(str(p.get("name")))
        self._title.setText(str(p.get("title")))
        self._set_summary(_join_html(p.get("summary")))
        self._set_hobbies(_join_html(p.get("hobbies")))

        # Links
        self._links.setData(p.get("links") or [])

        # Bio
        self._bio.setData(p.get("bio") or [])

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "greeting": self._greeting.text().strip(),
            "profile_image": self._img_get().strip(),
            "name": self._name.text().strip(),
            "title": self._title.text().strip(),
            "summary": self._get_summary().strip(),
            "hobbies": self._get_hobbies().strip(),
            "links": self._links.data(),
            "bio": self._bio.data(),
        }
        return out


__all__ = ["IntroTab"]
