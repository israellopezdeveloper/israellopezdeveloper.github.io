# src/editor/tabs/works_tab.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from PySide6 import QtCore, QtWidgets

from editor.dialogs.work_dialog import WorkDialog

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
            if it is not None:
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


Qt = QtCore.Qt


# -------------------- helpers de datos --------------------
def _s(v: Any) -> str:
    return "" if v is None else str(v)


def _fmt_period(period: Dict[str, Any] | None) -> str:
    if not period:
        return ""
    start = _s(period.get("start"))
    end = _s(period.get("end"))
    current = bool(period.get("current"))
    if start or end or current:
        return f"{start} – {'Present' if current or not end else end}".strip(" –")
    return ""


def _fmt_work_label(w: Dict[str, Any]) -> str:
    name = _s(w.get("name"))
    when = _fmt_period(w.get("period_time") or {})
    return "  •  ".join([p for p in [name, when] if p]) or "(nuevo)"


# -------------------- Tab contenedor (lista de trabajos) --------------------
class WorksTab(QtWidgets.QWidget):
    """Pestaña de 'Works' como LISTA. Crear/editar se hace en modal."""

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self._build_ui()
        self._connect()

    def _build_ui(self) -> None:
        self._list = QtWidgets.QListWidget()
        enable_reorder(self._list)

        self._btn_add = QtWidgets.QPushButton("Añadir")
        self._btn_edit = QtWidgets.QPushButton("Editar")
        self._btn_dup = QtWidgets.QPushButton("Duplicar")
        self._btn_del = QtWidgets.QPushButton("Eliminar")
        self._btn_up = QtWidgets.QPushButton("▲")
        self._btn_down = QtWidgets.QPushButton("▼")

        btn_row = QtWidgets.QGridLayout()
        btn_row.addWidget(self._btn_add, 0, 0)
        btn_row.addWidget(self._btn_edit, 0, 1)
        btn_row.addWidget(self._btn_dup, 0, 2)
        btn_row.addWidget(self._btn_del, 0, 3)
        btn_row.addWidget(self._btn_up, 0, 4)
        btn_row.addWidget(self._btn_down, 0, 5)

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(self._list)
        root.addLayout(btn_row)

    def _connect(self) -> None:
        self._btn_add.clicked.connect(self._add_work)
        self._btn_edit.clicked.connect(self._edit_work)
        self._btn_dup.clicked.connect(self._dup_work)
        self._btn_del.clicked.connect(self._del_work)
        self._btn_up.clicked.connect(lambda: self._move(-1))
        self._btn_down.clicked.connect(lambda: self._move(+1))
        self._list.itemDoubleClicked.connect(lambda *_: self._edit_work())

    # ---------- Acciones ----------
    def _add_work(self) -> None:
        dlg = WorkDialog(self)
        if dlg.exec():
            w = dlg.value()
            it = QtWidgets.QListWidgetItem(_fmt_work_label(w))
            it.setData(Qt.ItemDataRole.UserRole, w)
            self._list.addItem(it)
            self._list.setCurrentItem(it)
            self.changed.emit()

    def _edit_work(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        cur: Dict[str, Any] = it.data(Qt.ItemDataRole.UserRole) or {}
        dlg = WorkDialog(self)
        dlg.set_value(cur)
        if dlg.exec():
            w = dlg.value()
            it.setText(_fmt_work_label(w))
            it.setData(Qt.ItemDataRole.UserRole, w)
            self.changed.emit()

    def _dup_work(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        w = dict(it.data(Qt.ItemDataRole.UserRole) or {})
        # Pequeña pista visual en el nombre si existe
        if w.get("name"):
            w["name"] = f"{w['name']} (copy)"
        new = QtWidgets.QListWidgetItem(_fmt_work_label(w))
        new.setData(Qt.ItemDataRole.UserRole, w)
        row = self._list.currentRow()
        self._list.insertItem(row + 1, new)
        self._list.setCurrentItem(new)
        self.changed.emit()

    def _del_work(self) -> None:
        remove_selected(self._list)
        self.changed.emit()

    def _move(self, delta: int) -> None:
        move_selected(self._list, delta)
        self.changed.emit()

    # ---------- Data API ----------
    def from_data(
        self, works: Union[List[Dict[str, Any]], Dict[str, Any], None]
    ) -> None:
        """
        Acepta:
          - lista de trabajos: [ {...}, {...} ]
          - dict con clave 'works': { "works": [ {...} ] }
          - dict de un único trabajo (para compatibilidad): { ... }
          - None
        """
        self._list.clear()
        if works is None:
            return

        if isinstance(works, dict):
            items = works.get("works")
            if isinstance(items, list):
                data_list = items
            else:
                # Compat: se pasó un único trabajo como dict
                data_list = [works]
        else:
            data_list = works

        for w in data_list:
            wdict = dict(w) if isinstance(w, dict) else {"name": _s(w)}
            add_item(self._list, _fmt_work_label(wdict), wdict)

    def value(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for i in range(self._list.count()):
            it = self._list.item(i)
            w: Dict[str, Any] = it.data(Qt.ItemDataRole.UserRole) or {}
            # limpieza mínima
            clean = {
                "name": _s(w.get("name")).strip(),
                "short_description": _s(w.get("short_description")),
                "thumbnail": _s(w.get("thumbnail")),
                "period_time": {
                    "start": _s((w.get("period_time") or {}).get("start")),
                    "end": _s((w.get("period_time") or {}).get("end")),
                    "current": bool((w.get("period_time") or {}).get("current")),
                },
                "full_description": _s(w.get("full_description")),
                "contribution": _s(w.get("contribution")),
                "links": w.get("links") or [],
                "projects": w.get("projects") or [],
                "images": w.get("images") or [],
            }
            out.append(clean)
        return out


__all__ = ["WorksTab"]
