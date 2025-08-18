# src/editor/tabs/educations_tab.py
from __future__ import annotations

from typing import Any, Dict, List, Optional
from PySide6 import QtCore, QtWidgets

# --- utilidades con fallback ---
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


# --- diálogos específicos si existen ---
try:
    from ..dialogs.university_dialog import UniversityDialog  # type: ignore
except Exception:
    UniversityDialog = None  # type: ignore

try:
    from ..dialogs.complementary_dialog import ComplementaryDialog  # type: ignore
except Exception:
    ComplementaryDialog = None  # type: ignore

try:
    from ..dialogs.language_dialog import LanguageDialog  # type: ignore
except Exception:
    LanguageDialog = None  # type: ignore


Qt = QtCore.Qt


# ---------- Fallback mínimo de diálogo ----------
class _SimpleItemDialog(QtWidgets.QDialog):
    """Fallback genérico: solo pide 'Nombre'."""

    def __init__(
        self,
        title: str,
        parent: Optional[QtWidgets.QWidget] = None,
        value: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(parent)
        self.setWindowTitle(title)
        self.setModal(True)
        self._edit = QtWidgets.QLineEdit(self)
        self._edit.setPlaceholderText("Nombre")
        if value:
            # intenta usar 'name' o 'title' si vienen
            self._edit.setText(str(value.get("name") or value.get("title") or ""))

        form = QtWidgets.QFormLayout()
        form.addRow("Nombre", self._edit)

        buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        buttons.accepted.connect(self._on_accept)
        buttons.rejected.connect(self.reject)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(buttons)
        self.resize(420, 120)

    def _on_accept(self) -> None:
        if not self._edit.text().strip():
            self._edit.setFocus(Qt.FocusReason.OtherFocusReason)
            return
        self.accept()

    def value(self) -> Dict[str, Any]:
        return {"name": self._edit.text().strip()}


# ---------- Helpers ----------
def _label_for_item(obj: Any) -> str:
    """Texto que se muestra en la lista para cualquier item (universidad, curso o idioma)."""
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        # preferimos 'name' o 'title' o 'language'
        for k in ("name", "title", "language"):
            v = obj.get(k)
            if v:
                return str(v)
    return str(obj)


def _ensure_dict(v: Any) -> Dict[str, Any]:
    """Normaliza: si viene string -> {'name': string}."""
    if isinstance(v, dict):
        return dict(v)
    if isinstance(v, str):
        return {"name": v}
    return {"name": str(v)}


# ---------- Tab ----------
class EducationsTab(QtWidgets.QWidget):
    """
    Tres listas: university, complementary, languages.
    - 'Añadir' y 'Editar' abren modal (si existe dialogo específico; si no, fallback).
    - API:
        from_data(dict|None)
        value() -> dict { 'university': [...], 'complementary': [...], 'languages': [...] }
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)

        # University
        self._university = QtWidgets.QListWidget(self)
        enable_reorder(self._university)
        self._u_add = QtWidgets.QPushButton("Añadir", self)
        self._u_edit = QtWidgets.QPushButton("Editar", self)
        self._u_del = QtWidgets.QPushButton("Eliminar", self)
        self._u_up = QtWidgets.QPushButton("▲", self)
        self._u_down = QtWidgets.QPushButton("▼", self)

        # Complementary
        self._complementary = QtWidgets.QListWidget(self)
        enable_reorder(self._complementary)
        self._c_add = QtWidgets.QPushButton("Añadir", self)
        self._c_edit = QtWidgets.QPushButton("Editar", self)
        self._c_del = QtWidgets.QPushButton("Eliminar", self)
        self._c_up = QtWidgets.QPushButton("▲", self)
        self._c_down = QtWidgets.QPushButton("▼", self)

        # Languages
        self._languages = QtWidgets.QListWidget(self)
        enable_reorder(self._languages)
        self._l_add = QtWidgets.QPushButton("Añadir", self)
        self._l_edit = QtWidgets.QPushButton("Editar", self)
        self._l_del = QtWidgets.QPushButton("Eliminar", self)
        self._l_up = QtWidgets.QPushButton("▲", self)
        self._l_down = QtWidgets.QPushButton("▼", self)

        self._build_ui()
        self._connect()

    # ---------- UI ----------
    def _build_ui(self) -> None:
        def build_section(
            title: str,
            lw: QtWidgets.QListWidget,
            b_add: QtWidgets.QPushButton,
            b_edit: QtWidgets.QPushButton,
            b_del: QtWidgets.QPushButton,
            b_up: QtWidgets.QPushButton,
            b_down: QtWidgets.QPushButton,
        ) -> QtWidgets.QWidget:
            box = QtWidgets.QGroupBox(title, self)
            v = QtWidgets.QVBoxLayout(box)
            v.addWidget(lw)
            row = QtWidgets.QGridLayout()
            row.addWidget(b_add, 0, 0)
            row.addWidget(b_edit, 0, 1)
            row.addWidget(b_del, 0, 2)
            row.addWidget(b_up, 0, 3)
            row.addWidget(b_down, 0, 4)
            v.addLayout(row)
            return box

        w_uni = build_section(
            "University",
            self._university,
            self._u_add,
            self._u_edit,
            self._u_del,
            self._u_up,
            self._u_down,
        )
        w_cmp = build_section(
            "Complementary",
            self._complementary,
            self._c_add,
            self._c_edit,
            self._c_del,
            self._c_up,
            self._c_down,
        )
        w_lng = build_section(
            "Languages",
            self._languages,
            self._l_add,
            self._l_edit,
            self._l_del,
            self._l_up,
            self._l_down,
        )

        # Tres paneles en splitter vertical para redimensionar
        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        split.setChildrenCollapsible(False)
        split.setOpaqueResize(True)
        split.addWidget(w_uni)
        split.addWidget(w_cmp)
        split.addWidget(w_lng)
        split.setStretchFactor(0, 1)
        split.setStretchFactor(1, 1)
        split.setStretchFactor(2, 1)
        split.setSizes([300, 300, 300])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)

    # ---------- conexiones ----------
    def _connect(self) -> None:
        # University
        self._u_add.clicked.connect(
            lambda: self._add_item(self._university, "Universidad", "university")
        )
        self._u_edit.clicked.connect(
            lambda: self._edit_item(self._university, "Universidad", "university")
        )
        self._u_del.clicked.connect(lambda: remove_selected(self._university))
        self._u_up.clicked.connect(lambda: move_selected(self._university, -1))
        self._u_down.clicked.connect(lambda: move_selected(self._university, +1))

        # Complementary
        self._c_add.clicked.connect(
            lambda: self._add_item(
                self._complementary, "Formación complementaria", "complementary"
            )
        )
        self._c_edit.clicked.connect(
            lambda: self._edit_item(
                self._complementary, "Formación complementaria", "complementary"
            )
        )
        self._c_del.clicked.connect(lambda: remove_selected(self._complementary))
        self._c_up.clicked.connect(lambda: move_selected(self._complementary, -1))
        self._c_down.clicked.connect(lambda: move_selected(self._complementary, +1))

        # Languages
        self._l_add.clicked.connect(
            lambda: self._add_item(self._languages, "Idioma", "languages")
        )
        self._l_edit.clicked.connect(
            lambda: self._edit_item(self._languages, "Idioma", "languages")
        )
        self._l_del.clicked.connect(lambda: remove_selected(self._languages))
        self._l_up.clicked.connect(lambda: move_selected(self._languages, -1))
        self._l_down.clicked.connect(lambda: move_selected(self._languages, +1))

    # ---------- modales ----------
    def _create_dialog(
        self,
        kind: str,
        parent: QtWidgets.QWidget,
        value: Optional[Dict[str, Any]] = None,
    ) -> QtWidgets.QDialog:
        """Devuelve el diálogo adecuado (o fallback)."""
        if kind == "university" and UniversityDialog is not None:
            dlg = UniversityDialog(parent)
            if value and hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(value)
                except Exception:
                    pass
            return dlg
        if kind == "complementary" and ComplementaryDialog is not None:
            dlg = ComplementaryDialog(parent)
            if value and hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(value)
                except Exception:
                    pass
            return dlg
        if kind == "languages" and LanguageDialog is not None:
            dlg = LanguageDialog(parent)
            if value and hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(value)
                except Exception:
                    pass
            return dlg
        # Fallback
        return _SimpleItemDialog(f"{kind.capitalize()} ", parent, value)

    def _dialog_value(self, dlg: QtWidgets.QDialog) -> Dict[str, Any]:
        """Obtiene el dict del diálogo, sea específico o fallback."""
        if hasattr(dlg, "value"):
            try:
                v = dlg.value()
                if isinstance(v, dict):
                    return v
            except Exception:
                pass
        # fallback seguro
        return {}

    # ---------- acciones ----------
    def _add_item(self, lw: QtWidgets.QListWidget, _: str, kind: str) -> None:
        dlg = self._create_dialog(kind, self, None)
        if dlg.exec():
            data = self._dialog_value(dlg)
            if not data:
                return
            item = QtWidgets.QListWidgetItem(_label_for_item(data))
            item.setData(Qt.ItemDataRole.UserRole, data)
            lw.addItem(item)

    def _edit_item(self, lw: QtWidgets.QListWidget, _: str, kind: str) -> None:
        it = lw.currentItem()
        if not it:
            return
        cur = _ensure_dict(it.data(Qt.ItemDataRole.UserRole) or {})
        dlg = self._create_dialog(kind, self, cur)
        if dlg.exec():
            data = self._dialog_value(dlg)
            if not data:
                return
            it.setText(_label_for_item(data))
            it.setData(Qt.ItemDataRole.UserRole, data)

    # ---------- API de datos ----------
    def from_data(self, data: Optional[Dict[str, Any]]) -> None:
        """Carga las tres listas desde un dict con las claves solicitadas."""
        uni = (data or {}).get("university") or []
        cmp = (data or {}).get("complementary") or []
        lng = (data or {}).get("languages") or []

        def fill(lw: QtWidgets.QListWidget, items: List[Any]) -> None:
            lw.clear()
            for x in items:
                d = _ensure_dict(x)
                add_item(lw, _label_for_item(d), d)

        fill(self._university, uni)
        fill(self._complementary, cmp)
        fill(self._languages, lng)

    def value(self) -> Dict[str, List[Dict[str, Any]]]:
        """Devuelve {'university': [...], 'complementary': [...], 'languages': [...]}"""

        def dump(lw: QtWidgets.QListWidget) -> List[Dict[str, Any]]:
            out: List[Dict[str, Any]] = []
            for i in range(lw.count()):
                d = _ensure_dict(lw.item(i).data(Qt.ItemDataRole.UserRole) or {})
                out.append(d)
            return out

        return {
            "university": dump(self._university),
            "complementary": dump(self._complementary),
            "languages": dump(self._languages),
        }


__all__ = ["EducationsTab"]
