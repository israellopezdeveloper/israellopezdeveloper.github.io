# src/editor/tabs/profile_tab.py
from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
from PySide6 import QtCore, QtWidgets

from editor.utils.lists import add_item, enable_reorder, move_selected, remove_selected
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


def _to_link_dict(t: Tuple[str, str, str]) -> Dict[str, str]:
    text, url, icon = t
    out = {"text": text, "url": url}
    if icon:
        out["icon"] = icon
    return out


def _fmt_bio_item(d: Dict[str, Any] | str) -> str:
    if isinstance(d, str):
        return d
    dates = str(d.get("dates"))
    txt = str(d.get("text"))
    return f"{dates}: {txt}" if dates and txt else (dates or txt or "(bio)")


# --- Tab ---
class ProfileTab(QtWidgets.QWidget):
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
        if HtmlEditor:
            self._summary = HtmlEditor(show_preview=True, parent=self)
            self._hobbies = HtmlEditor(show_preview=True, parent=self)
            self._set_summary = self._summary.set_html
            self._get_summary = self._summary.html
            self._set_hobbies = self._hobbies.set_html
            self._get_hobbies = self._hobbies.html
        else:
            self._summary = QtWidgets.QPlainTextEdit(self)
            self._hobbies = QtWidgets.QPlainTextEdit(self)
            self._set_summary = self._summary.setPlainText  # type: ignore
            self._get_summary = self._summary.toPlainText  # type: ignore
            self._set_hobbies = self._hobbies.setPlainText  # type: ignore
            self._get_hobbies = self._hobbies.toPlainText  # type: ignore

        # Links
        self._links = QtWidgets.QListWidget(self)
        enable_reorder(self._links)
        self._btn_l_add = QtWidgets.QPushButton("Añadir", self)
        self._btn_l_edit = QtWidgets.QPushButton("Editar", self)
        self._btn_l_del = QtWidgets.QPushButton("Eliminar", self)
        self._btn_l_up = QtWidgets.QPushButton("▲", self)
        self._btn_l_down = QtWidgets.QPushButton("▼", self)

        # Bio
        self._bio = QtWidgets.QListWidget(self)
        enable_reorder(self._bio)
        self._btn_b_add = QtWidgets.QPushButton("Añadir", self)
        self._btn_b_edit = QtWidgets.QPushButton("Editar", self)
        self._btn_b_del = QtWidgets.QPushButton("Eliminar", self)
        self._btn_b_up = QtWidgets.QPushButton("▲", self)
        self._btn_b_down = QtWidgets.QPushButton("▼", self)

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
        gl = QtWidgets.QGridLayout()
        gl.addWidget(self._btn_l_add, 0, 0)
        gl.addWidget(self._btn_l_edit, 0, 1)
        gl.addWidget(self._btn_l_del, 0, 2)
        gl.addWidget(self._btn_l_up, 0, 3)
        gl.addWidget(self._btn_l_down, 0, 4)
        vl.addLayout(gl)

        # Bio
        box_bio = QtWidgets.QGroupBox("Bio", self)
        vb = QtWidgets.QVBoxLayout(box_bio)
        vb.addWidget(self._bio)
        gb = QtWidgets.QGridLayout()
        gb.addWidget(self._btn_b_add, 0, 0)
        gb.addWidget(self._btn_b_edit, 0, 1)
        gb.addWidget(self._btn_b_del, 0, 2)
        gb.addWidget(self._btn_b_up, 0, 3)
        gb.addWidget(self._btn_b_down, 0, 4)
        vb.addLayout(gb)

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

        if hasattr(self._profile_image, "valueChanged"):
            try:
                self._profile_image.valueChanged.connect(lambda _: self.changed.emit())  # type: ignore[attr-defined]
            except Exception:
                pass

        if hasattr(self._summary, "htmlChanged"):
            self._summary.htmlChanged.connect(self.changed)  # type: ignore[attr-defined]
        else:
            self._summary.textChanged.connect(self.changed)  # type: ignore[attr-defined]

        if hasattr(self._hobbies, "htmlChanged"):
            self._hobbies.htmlChanged.connect(self.changed)  # type: ignore[attr-defined]
        else:
            self._hobbies.textChanged.connect(self.changed)  # type: ignore[attr-defined]

        # Links
        self._btn_l_add.clicked.connect(self._add_link)
        self._btn_l_edit.clicked.connect(self._edit_link)
        self._btn_l_del.clicked.connect(
            lambda: (remove_selected(self._links), self.changed.emit())
        )
        self._btn_l_up.clicked.connect(
            lambda: (move_selected(self._links, -1), self.changed.emit())
        )
        self._btn_l_down.clicked.connect(
            lambda: (move_selected(self._links, +1), self.changed.emit())
        )

        # Bio
        self._btn_b_add.clicked.connect(self._add_bio)
        self._btn_b_edit.clicked.connect(self._edit_bio)
        self._btn_b_del.clicked.connect(
            lambda: (remove_selected(self._bio), self.changed.emit())
        )
        self._btn_b_up.clicked.connect(
            lambda: (move_selected(self._bio, -1), self.changed.emit())
        )
        self._btn_b_down.clicked.connect(
            lambda: (move_selected(self._bio, +1), self.changed.emit())
        )

    # ---------- Links ----------
    def _add_link(self) -> None:
        dlg = LinkDialog(self)
        if dlg.exec():
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.tuple())
            self._links.addItem(it)
            self.changed.emit()

    def _edit_link(self) -> None:
        it = self._links.currentItem()
        if not it:
            return
        cur: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
        dlg = LinkDialog(self)
        try:
            dlg.set_value({"text": cur[0], "url": cur[1], "icon": cur[2]})
        except Exception:
            pass
        if dlg.exec():
            it.setText(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.tuple())
            self.changed.emit()

    # ---------- Bio ----------
    def _add_bio(self) -> None:
        dlg = BioDialog(self)
        if dlg.exec():
            data = dlg.value()
            add_item(self._bio, _fmt_bio_item(data), data)
            self.changed.emit()

    def _edit_bio(self) -> None:
        it = self._bio.currentItem()
        if not it:
            return
        cur = it.data(Qt.ItemDataRole.UserRole) or {}
        dlg = BioDialog(self, cur)
        if dlg.exec():
            data = dlg.value()
            it.setText(_fmt_bio_item(data))
            it.setData(Qt.ItemDataRole.UserRole, data)
            self.changed.emit()

    # ---------- Data API ----------
    def from_data(self, profile: Dict[str, Any] | None) -> None:
        p = profile or {}
        self._greeting.setText(str(p.get("greeting")))
        self._img_set(str(p.get("profile_image")))
        self._name.setText(str(p.get("name")))
        self._title.setText(str(p.get("title")))
        self._set_summary(_join_html(p.get("summary")))
        self._set_hobbies(_join_html(p.get("hobbies")))

        # Links
        self._links.clear()
        for lk in p.get("links") or []:
            t, u, i = (lk.get("text"), lk.get("url"), lk.get("icon"))
            it = QtWidgets.QListWidgetItem(f"[{i}] {t} — {u}" if i else f"{t} — {u}")
            it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
            self._links.addItem(it)

        # Bio
        self._bio.clear()
        for b in p.get("bio") or []:
            d = b if isinstance(b, dict) else {"text": str(b)}
            add_item(self._bio, _fmt_bio_item(d), d)

        self.changed.emit()

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "greeting": self._greeting.text().strip(),
            "profile_image": self._img_get().strip(),
            "name": self._name.text().strip(),
            "title": self._title.text().strip(),
            "summary": self._get_summary().strip(),
            "hobbies": self._get_hobbies().strip(),
            "links": [],
            "bio": [],
        }
        # Links
        for i in range(self._links.count()):
            it = self._links.item(i)
            t: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
            out["links"].append(_to_link_dict(t))
        # Bio
        for i in range(self._bio.count()):
            it = self._bio.item(i)
            d = it.data(Qt.ItemDataRole.UserRole) or {}
            out["bio"].append(dict(d) if isinstance(d, dict) else {"text": str(d)})
        return out


__all__ = ["ProfileTab"]
