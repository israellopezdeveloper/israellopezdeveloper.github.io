from __future__ import annotations

from typing import Dict, Iterable, Any, List, Optional
from PySide6 import QtCore, QtWidgets

from editor.dialogs.base_dialog import BaseDialog

Qt = QtCore.Qt


def enable_reorder(lw: QtWidgets.QListWidget) -> None:
    """
    Habilita reordenación interna por arrastrar y soltar y selección múltiple.
    """
    lw.setDragEnabled(True)
    lw.setAcceptDrops(True)
    lw.setDefaultDropAction(Qt.DropAction.MoveAction)
    lw.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
    lw.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)


def selected_rows(lw: QtWidgets.QListWidget) -> List[int]:
    """
    Devuelve filas seleccionadas ordenadas de menor a mayor.
    """
    return sorted({idx.row() for idx in lw.selectedIndexes()})


def move_selected(lw: QtWidgets.QListWidget, delta: int) -> None:
    """
    Mueve los ítems seleccionados delta posiciones (-1 arriba, +1 abajo).
    Conserva la selección tras mover.
    """
    rows = selected_rows(lw)
    if not rows:
        return

    # Para mover hacia abajo, procesa desde el final; hacia arriba, desde el inicio.
    iterable = reversed(rows) if delta > 0 else rows

    moved_rows: List[int] = []
    for r in iterable:
        new = r + delta
        if new < 0 or new >= lw.count():
            continue
        item = lw.takeItem(r)
        lw.insertItem(new, item)
        moved_rows.append(new)

    # Reseleccionar los elementos movidos
    lw.clearSelection()
    for r in moved_rows:
        it = lw.item(r)
        if it is not None:
            it.setSelected(True)
    if moved_rows:
        lw.setCurrentRow(moved_rows[-1])


def remove_selected(lw: QtWidgets.QListWidget) -> None:
    """
    Elimina las filas seleccionadas.
    """
    for r in reversed(selected_rows(lw)):
        lw.takeItem(r)


def set_plain_items(lw: QtWidgets.QListWidget, items: Iterable[str]) -> None:
    """
    Llena el QListWidget con una lista de textos (limpia antes).
    """
    lw.clear()
    for text in items:
        lw.addItem(text)


def add_item(
    lw: QtWidgets.QListWidget,
    text: str,
    data: Any | None = None,
    *,
    role: int = int(Qt.ItemDataRole.UserRole),
) -> QtWidgets.QListWidgetItem:
    """
    Añade un ítem con texto y (opcional) datos en UserRole (o rol indicado).
    """
    it = QtWidgets.QListWidgetItem(text)
    if data is not None:
        it.setData(role, data)
    lw.addItem(it)
    return it


def insert_item(
    row: int,
    lw: QtWidgets.QListWidget,
    text: str,
    data: Any | None = None,
    *,
    role: int = int(Qt.ItemDataRole.UserRole),
) -> QtWidgets.QListWidgetItem:
    """
    Inserta un ítem en la fila indicada con texto y (opcional) datos.
    """
    return QtWidgets.QListWidgetItem(text)


class CustomList(QtWidgets.QWidget):
    """
    Clase que agrupa las funcionalidades de la lista en toda la aplicacion
    """

    changed = QtCore.Signal()

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        *,
        dialog_cls: type[BaseDialog] | None = None,
    ) -> None:
        super().__init__(parent)
        self._list = QtWidgets.QListWidget()
        self._dialog_cls = dialog_cls
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

        self._root = QtWidgets.QVBoxLayout(self)
        self._root.addWidget(self._list)
        self._root.addLayout(btn_row)
        self._btn_add.clicked.connect(self._add)
        self._btn_edit.clicked.connect(self._edit)
        self._btn_dup.clicked.connect(self._dup)
        self._btn_del.clicked.connect(self._del)
        self._btn_up.clicked.connect(lambda: self._move(-1))
        self._btn_down.clicked.connect(lambda: self._move(+1))
        self._list.itemDoubleClicked.connect(lambda *_: self._edit())

    def _move(self, delta: int) -> None:
        move_selected(self._list, delta)
        self.changed.emit()

    def _add(self) -> None:
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self)
        if dlg.exec():
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
            self.changed.emit()

    def _dup(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        curr = it.data(Qt.ItemDataRole.UserRole) or {}
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self)
        try:
            dlg.set_value(curr)
        except Exception:
            pass
        if dlg.exec():
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
            self.changed.emit()

    def _edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        curr = it.data(Qt.ItemDataRole.UserRole) or {}
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self)
        try:
            dlg.set_value(curr)
        except Exception:
            pass
        if dlg.exec():
            it.setText(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self.changed.emit()

    def _del(self) -> None:
        remove_selected(self._list)
        self.changed.emit()

    def layout(self, /) -> QtWidgets.QLayout:
        return self._root

    def clear(self) -> None:
        self._list.clear()

    def setData(self, data: List[Dict[str, Any]]) -> None:
        self.clear()
        if self._dialog_cls is None:
            return
        dlg: BaseDialog = self._dialog_cls(self)
        for item in data:
            dlg.set_value(item)
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
        self.changed.emit()

    def data(self) -> List[Dict[str, Any]]:
        out = []
        for i in range(self._list.count()):
            item = self._list.item(i)
            out.append(item.data(Qt.ItemDataRole.UserRole))
        return out


class TechList(QtWidgets.QWidget):
    """
    Lista de tecnologías con campo de entrada y sugerencias.
    - Deduplica case-insensitive.
    - Si el texto coincide (case-insensitive) con una sugerencia, usa la forma canónica
      de la sugerencia para estandarizar grafía.
    API:
      set_value(list[str]), value() -> list[str]
      set_suggestions(list[str])
    """

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self._suggestions: List[str] = []

        self._edit = QtWidgets.QLineEdit()
        self._edit.setPlaceholderText("Añadir tecnología…")
        self._btn_add = QtWidgets.QPushButton("+")
        self._btn_add.setFixedWidth(28)

        self._list = QtWidgets.QListWidget()
        enable_reorder(self._list)

        top = QtWidgets.QHBoxLayout()
        top.addWidget(self._edit)
        top.addWidget(self._btn_add)

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addLayout(top)
        root.addWidget(self._list)

        # Completer (sugerencias)
        self._completer = QtWidgets.QCompleter([], self)
        self._completer.setCaseSensitivity(Qt.CaseSensitivity.CaseInsensitive)
        self._completer.setFilterMode(Qt.MatchFlag.MatchContains)
        self._edit.setCompleter(self._completer)

        # Botonera secundaria
        self._btn_edit = QtWidgets.QPushButton("Editar")
        self._btn_del = QtWidgets.QPushButton("Eliminar")
        self._btn_up = QtWidgets.QPushButton("▲")
        self._btn_down = QtWidgets.QPushButton("▼")
        grid = QtWidgets.QGridLayout()
        grid.addWidget(self._btn_edit, 0, 0)
        grid.addWidget(self._btn_del, 0, 1)
        grid.addWidget(self._btn_up, 0, 2)
        grid.addWidget(self._btn_down, 0, 3)
        root.addLayout(grid)

        # Conexiones
        self._btn_add.clicked.connect(self._on_add)
        self._edit.returnPressed.connect(self._on_add)
        self._btn_edit.clicked.connect(self._on_edit)
        self._btn_del.clicked.connect(
            lambda: (remove_selected(self._list), self.changed.emit())
        )
        self._btn_up.clicked.connect(
            lambda: (move_selected(self._list, -1), self.changed.emit())
        )
        self._btn_down.clicked.connect(
            lambda: (move_selected(self._list, +1), self.changed.emit())
        )
        self._list.itemChanged.connect(self._emit_changed)
        self._list.itemSelectionChanged.connect(self._emit_changed)

    # API
    def set_value(self, items: List[str] | None) -> None:
        self._list.clear()
        for t in items or []:
            add_item(self._list, str(t))

    def value(self) -> List[str]:
        return [self._list.item(i).text() for i in range(self._list.count())]

    def set_suggestions(self, items: List[str]) -> None:
        self._suggestions = [i for i in items if i]
        model = QtCore.QStringListModel(self._suggestions, self)
        self._completer.setModel(model)

    # Internos
    def _emit_changed(self) -> None:
        self.changed.emit()

    def _canonical(self, text: str) -> str:
        """Devuelve forma canónica según sugerencias (si coincide)."""
        t = text.strip()
        if not t:
            return t
        for s in self._suggestions:
            if s.casefold() == t.casefold():
                return s  # usar grafía sugerida
        return t

    def _exists(self, text: str) -> bool:
        norm = text.casefold().strip()
        for i in range(self._list.count()):
            if self._list.item(i).text().casefold().strip() == norm:
                return True
        return False

    def _on_add(self) -> None:
        raw = self._edit.text()
        can = self._canonical(raw)
        if not can:
            return
        if self._exists(can):
            # Selecciona el existente
            for i in range(self._list.count()):
                if (
                    self._list.item(i).text().casefold().strip()
                    == can.casefold().strip()
                ):
                    self._list.setCurrentRow(i)
                    break
            return
        add_item(self._list, can)
        self._edit.clear()
        self.changed.emit()

    def _on_edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        txt, ok = QtWidgets.QInputDialog.getText(
            self, "Editar tecnología", "Nombre:", text=it.text()
        )
        if not ok:
            return
        can = self._canonical(txt)
        if not can:
            return
        it.setText(can)
        self.changed.emit()
