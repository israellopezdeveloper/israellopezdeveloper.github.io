# src/editor/tabs/profile_tab.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
from PySide6 import QtCore, QtWidgets

Qt = QtCore.Qt

# --- Opcionales con fallback (HtmlEditor / FileSelect / LinkDialog / BioDialog) ---
try:
    from ..widgets.html_editor import HtmlEditor
except Exception:
    HtmlEditor = None  # type: ignore

try:
    from ..widgets.file_select import FileSelect
except Exception:
    FileSelect = None  # type: ignore

try:
    from ..dialogs.link_dialog import LinkDialog  # type: ignore
except Exception:
    LinkDialog = None  # type: ignore

try:
    from ..dialogs.bio_dialog import BioDialog  # type: ignore
except Exception:
    BioDialog = None  # type: ignore


# --- utils listas (con fallback) ---
try:
    from ..utils.lists import enable_reorder, move_selected, remove_selected, add_item
except Exception:

    def enable_reorder(lw: QtWidgets.QListWidget) -> None:
        lw.setDragEnabled(True)
        lw.setAcceptDrops(True)
        lw.setDefaultDropAction(QtCore.Qt.DropAction.MoveAction)
        lw.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
        lw.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)

    def move_selected(lw: QtWidgets.QListWidget, delta: int) -> None:
        rows = sorted({i.row() for i in lw.selectedIndexes()})
        if not rows:
            return
        iterable = reversed(rows) if delta > 0 else rows
        moved: List[int] = []
        for r in iterable:
            nr = r + delta
            if 0 <= nr < lw.count():
                it = lw.takeItem(r)
                lw.insertItem(nr, it)
                moved.append(nr)
        lw.clearSelection()
        for r in moved:
            it = lw.item(r)
            if it:
                it.setSelected(True)
        if moved:
            lw.setCurrentRow(moved[-1])

    def remove_selected(lw: QtWidgets.QListWidget) -> None:
        for r in sorted({i.row() for i in lw.selectedIndexes()}, reverse=True):
            lw.takeItem(r)

    def add_item(
        lw: QtWidgets.QListWidget,
        text: str,
        data: Any | None = None,
        *,
        role: int = int(QtCore.Qt.ItemDataRole.UserRole),
    ) -> QtWidgets.QListWidgetItem:
        it = QtWidgets.QListWidgetItem(text)
        if data is not None:
            it.setData(role, data)
        lw.addItem(it)
        return it


# --- helpers ---
def _s(v: Any) -> str:
    return "" if v is None else str(v)


def _join_html(v: Any) -> str:
    if isinstance(v, list):
        return "".join(_s(x) for x in v if x is not None)
    return _s(v)


def _fmt_link(text: str, url: str, icon: str) -> str:
    return f"[{icon}] {text} — {url}" if icon else f"{text} — {url}"


def _to_link_tuple(d: Dict[str, Any] | str) -> Tuple[str, str, str]:
    if isinstance(d, str):
        return (d, d, "")
    text = _s(d.get("text") or d.get("tag"))
    url = _s(d.get("url"))
    icon = _s(d.get("icon"))
    return (text, url, icon)


def _to_link_dict(t: Tuple[str, str, str]) -> Dict[str, str]:
    text, url, icon = t
    out = {"text": text, "url": url}
    if icon:
        out["icon"] = icon
    return out


def _fmt_bio_item(d: Dict[str, Any] | str) -> str:
    if isinstance(d, str):
        return d
    dates = _s(d.get("dates"))
    txt = _s(d.get("text"))
    return f"{dates}: {txt}" if dates and txt else (dates or txt or "(bio)")


# --- fallbacks ligeros ---
class _FileSelectFallback(QtWidgets.QWidget):
    valueChanged = QtCore.Signal(str)

    def __init__(
        self, *, filter: str = "Todos (*)", parent: Optional[QtWidgets.QWidget] = None
    ) -> None:
        super().__init__(parent)
        self._filter = filter
        self._edit = QtWidgets.QLineEdit(self)
        btn = QtWidgets.QPushButton("…", self)
        btn.setFixedWidth(28)
        lay = QtWidgets.QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(self._edit)
        lay.addWidget(btn)
        btn.clicked.connect(self._pick)
        self._edit.textChanged.connect(self.valueChanged)

    def _pick(self) -> None:
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Elegir imagen", "", self._filter
        )
        if fn:
            self._edit.setText(fn)

    def value(self) -> str:
        return self._edit.text().strip()

    def set_value(self, v: str) -> None:
        self._edit.setText(v or "")


class _SimpleBioDialog(QtWidgets.QDialog):
    """Fallback minimal: fields {dates, text} en texto plano."""

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        value: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(parent)
        self.setWindowTitle("Bio item")
        self.setModal(True)
        self.resize(520, 260)
        self._dates = QtWidgets.QLineEdit(self)
        self._text = QtWidgets.QPlainTextEdit(self)
        if value:
            self._dates.setText(_s(value.get("dates")))
            self._text.setPlainText(_s(value.get("text")))
        form = QtWidgets.QFormLayout()
        form.addRow("Fecha(s)", self._dates)
        form.addRow("Texto", self._text)
        btns = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.Ok | QtWidgets.QDialogButtonBox.Cancel,
            parent=self,
        )
        btns.accepted.connect(self.accept)
        btns.rejected.connect(self.reject)
        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(btns)

    def value(self) -> Dict[str, Any]:
        return {
            "dates": self._dates.text().strip(),
            "text": self._text.toPlainText().strip(),
        }


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
        if FileSelect is not None:
            self._profile_image = FileSelect(
                title="Elegir imagen de perfil",
                file_filter=img_filter,
                must_exist=False,
                parent=self,
            )
            self._img_set = self._profile_image.set_value
            self._img_get = self._profile_image.value
        else:
            fs = _FileSelectFallback(filter=img_filter, parent=self)
            self._profile_image = fs
            self._img_set = fs.set_value
            self._img_get = fs.value

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
                self._profile_image.valueChanged.connect(lambda _v: self.changed.emit())  # type: ignore[attr-defined]
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
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
                self._links.addItem(it)
                self.changed.emit()
            return
        # fallback rápido
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:")
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:")
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(self, "Link", "Icono (opcional):")
        it = QtWidgets.QListWidgetItem(
            _fmt_link(t.strip(), u.strip(), (i or "").strip())
        )
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), (i or "").strip()))
        self._links.addItem(it)
        self.changed.emit()

    def _edit_link(self) -> None:
        it = self._links.currentItem()
        if not it:
            return
        cur: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            try:
                dlg.set_value({"text": cur[0], "url": cur[1], "icon": cur[2]})
            except Exception:
                pass
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it.setText(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
                self.changed.emit()
            return
        # fallback
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:", text=cur[0])
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:", text=cur[1])
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(
            self, "Link", "Icono (opcional):", text=cur[2]
        )
        it.setText(_fmt_link(t.strip(), u.strip(), (i or "").strip()))
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), (i or "").strip()))
        self.changed.emit()

    # ---------- Bio ----------
    def _make_bio_dialog(self, value: Optional[Dict[str, Any]]) -> QtWidgets.QDialog:
        if BioDialog is not None:
            dlg = BioDialog(self)
            if value and hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(value)
                except Exception:
                    pass
            return dlg
        return _SimpleBioDialog(self, value)

    def _bio_dialog_value(self, dlg: QtWidgets.QDialog) -> Dict[str, Any]:
        if hasattr(dlg, "value"):
            try:
                v = dlg.value()
                if isinstance(v, dict):
                    return v
            except Exception:
                pass
        return {}

    def _add_bio(self) -> None:
        dlg = self._make_bio_dialog(None)
        if dlg.exec():
            data = self._bio_dialog_value(dlg)
            add_item(self._bio, _fmt_bio_item(data), data)
            self.changed.emit()

    def _edit_bio(self) -> None:
        it = self._bio.currentItem()
        if not it:
            return
        cur = it.data(Qt.ItemDataRole.UserRole) or {}
        dlg = self._make_bio_dialog(cur)
        if dlg.exec():
            data = self._bio_dialog_value(dlg)
            it.setText(_fmt_bio_item(data))
            it.setData(Qt.ItemDataRole.UserRole, data)
            self.changed.emit()

    # ---------- Data API ----------
    def from_data(self, profile: Dict[str, Any] | None) -> None:
        p = profile or {}
        self._greeting.setText(_s(p.get("greeting")))
        self._img_set(_s(p.get("profile_image")))
        self._name.setText(_s(p.get("name")))
        self._title.setText(_s(p.get("title")))
        self._set_summary(_join_html(p.get("summary")))
        self._set_hobbies(_join_html(p.get("hobbies")))

        # Links
        self._links.clear()
        for lk in p.get("links") or []:
            t, u, i = _to_link_tuple(lk if isinstance(lk, dict) else _s(lk))
            it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
            it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
            self._links.addItem(it)

        # Bio
        self._bio.clear()
        for b in p.get("bio") or []:
            d = b if isinstance(b, dict) else {"text": _s(b)}
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
            out["bio"].append(dict(d) if isinstance(d, dict) else {"text": _s(d)})
        return out


__all__ = ["ProfileTab"]
